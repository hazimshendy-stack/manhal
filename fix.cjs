#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   fix-registerself.cjs
   ─────────────────────────────────────────────────────────────────────
   يضيف الدوال الناقصة لـ src/lib/auth.ts:
     • registerSelf
     • adminApproveUser
     • adminRejectUser
   ثم يبني ويدفع.
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();

console.log("");
console.log(
  " ╔══════════════════════════════════════════════════════════════╗"
);
console.log(
  " ║   fix-registerself.cjs                                       ║"
);
console.log(
  " ╚══════════════════════════════════════════════════════════════╝"
);
console.log("");

/* ─────────────────────────────────────────────────────────────────────
      اقرأ auth.ts الموجود
      ───────────────────────────────────────────────────────────────────── */
const authPath = path.join(ROOT, "src/lib/auth.ts");
if (!fs.existsSync(authPath)) {
  console.error(" ❌ src/lib/auth.ts not found at " + authPath);
  process.exit(1);
}

let authContent = fs.readFileSync(authPath, "utf8");
const original = authContent;

/* ─────────────────────────────────────────────────────────────────────
      تأكد إن الـ import بتاع Firebase موجود
      ───────────────────────────────────────────────────────────────────── */
const needsCreateUserImport = !/createUserWithEmailAndPassword/.test(
  authContent
);

/* ─────────────────────────────────────────────────────────────────────
      الدوال الجديدة
      ───────────────────────────────────────────────────────────────────── */

const registerSelfFn = `

   /* ═══════════════════════════════════════════════════════════════════════
      Self-registration — يُنشئ الحساب بحالة pending
      ═══════════════════════════════════════════════════════════════════════ */

   export interface RegisterSelfInput {
     email: string;
     password: string;
     name: string;
     preferredTeamId?: TeamId | null;
     note?: string;
   }

   export async function registerSelf(input: RegisterSelfInput): Promise<AppUser> {
     const email = input.email.trim().toLowerCase();
     const name = input.name.trim();
     const password = input.password;

     if (!email) throw new Error('Email required');
     if (!name) throw new Error('Name required');
     if (password.length < 6) throw new Error('Password must be at least 6 characters');

     /* 1) أنشئ حساب Firebase Auth */
     let uid = '';
     try {
       const cred = await createUserWithEmailAndPassword(auth, email, password);
       uid = cred.user.uid;
     } catch (err) {
       throw new Error(translateAuthError(err));
     }

     /* 2) أنشئ user doc بحالة pending */
     const userData: AppUser = {
       uid,
       email,
       displayName: name,
       role: 'VIEWER',
       teamId: null,
       committeeIds: [],
       memberId: null,
       createdAt: new Date().toISOString(),
       emailVerified: false,
       mustChangePassword: false,
       status: 'pending',
       preferredTeamId: input.preferredTeamId ?? null,
       registrationNote: input.note?.trim() || undefined,
     };

     await setDoc(doc(db, 'users', uid), userData);

     return userData;
   }

   /* ═══════════════════════════════════════════════════════════════════════
      Admin: Approve a pending user
      ─────────────────────────────────────────────────────────────────────
      - Updates user doc: status=active, role, teamId, committeeIds
      - Creates a linked member doc
      ═══════════════════════════════════════════════════════════════════════ */

   export interface ApproveUserInput {
     role: RoleId;
     teamIds: TeamId[];
     committeeIds: string[];
   }

   export async function adminApproveUser(
     user: AppUser,
     input: ApproveUserInput,
     adminUid: string,
   ): Promise<void> {
     const memberId = user.memberId || ('M-' + user.uid.slice(0, 8).toUpperCase());

     /* 1) Update user doc */
     await setDoc(
       doc(db, 'users', user.uid),
       {
         role: input.role,
         teamId: input.teamIds[0] ?? null,
         committeeIds: input.committeeIds || [],
         memberId,
         status: 'active',
         approvedAt: new Date().toISOString(),
         approvedBy: adminUid,
       },
       { merge: true },
     );

     /* 2) Create member doc */
     const memberData: Member = {
       id: memberId,
       name: user.displayName,
       role: input.role,
       teamIds: input.teamIds,
       committeeIds: input.committeeIds || [],
       joinedSeason: 7,
       hours: 0,
       points: 0,
       status: 'active',
       email: user.email,
       linkedUserId: user.uid,
     };

     await setDoc(doc(db, 'members', memberId), memberData);

     /* 3) Link member back on user doc (already done above) */
   }

   /* ═══════════════════════════════════════════════════════════════════════
      Admin: Reject a pending user
      ═══════════════════════════════════════════════════════════════════════ */

   export async function adminRejectUser(
     uid: string,
     reason: string,
     adminUid: string,
   ): Promise<void> {
     await setDoc(
       doc(db, 'users', uid),
       {
         status: 'rejected',
         rejectionReason: reason?.trim() || 'No reason provided',
         rejectedAt: new Date().toISOString(),
         rejectedBy: adminUid,
       },
       { merge: true },
     );
   }
   `;

/* ─────────────────────────────────────────────────────────────────────
      تحقق لو الدوال موجودة مسبقًا
      ───────────────────────────────────────────────────────────────────── */
const hasRegisterSelf = /export\s+(async\s+)?function\s+registerSelf\b/.test(
  authContent
);
const hasApproveUser = /export\s+(async\s+)?function\s+adminApproveUser\b/.test(
  authContent
);
const hasRejectUser = /export\s+(async\s+)?function\s+adminRejectUser\b/.test(
  authContent
);

if (hasRegisterSelf && hasApproveUser && hasRejectUser) {
  console.log("   ✓ All three functions already exist in auth.ts");
} else {
  /* ─────────────────────────────────────────────────────────────────────
        تأكد من import الـ createUserWithEmailAndPassword
        ───────────────────────────────────────────────────────────────────── */
  if (needsCreateUserImport) {
    console.log(
      "   ↻ Adding createUserWithEmailAndPassword to firebase/auth import"
    );
    authContent = authContent.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"]firebase\/auth['"];?/,
      (match, names) => {
        const cleanNames = names
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (!cleanNames.includes("createUserWithEmailAndPassword")) {
          cleanNames.push("createUserWithEmailAndPassword");
        }
        return (
          "import {\n  " +
          cleanNames.join(",\n  ") +
          ",\n} from 'firebase/auth';"
        );
      }
    );
  }

  /* ─────────────────────────────────────────────────────────────────────
        أضف الدوال قبل نهاية الملف
        ───────────────────────────────────────────────────────────────────── */
  authContent = authContent.trimEnd() + "\n" + registerSelfFn + "\n";

  fs.writeFileSync(authPath, authContent, "utf8");
  console.log(
    "   ✓ src/lib/auth.ts updated with registerSelf + adminApproveUser + adminRejectUser"
  );
}

/* ─────────────────────────────────────────────────────────────────────
      تأكد من وجود Member في imports لـ auth.ts
      ───────────────────────────────────────────────────────────────────── */
if (!/import\s+type\s*\{[^}]*\bMember\b/.test(authContent)) {
  console.log("   ↻ Ensuring Member type is imported");
  authContent = fs.readFileSync(authPath, "utf8");
  authContent = authContent.replace(
    /import\s+type\s*\{([^}]+)\}\s*from\s*['"]@\/types['"];?/,
    (match, names) => {
      const clean = names
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!clean.includes("Member")) clean.push("Member");
      return "import type { " + clean.join(", ") + " } from '@/types';";
    }
  );
  fs.writeFileSync(authPath, authContent, "utf8");
}

/* ─────────────────────────────────────────────────────────────────────
      تحقق من أن AppUser بيحتوي على preferredTeamId/registrationNote/rejectionReason
      ───────────────────────────────────────────────────────────────────── */
const typesPath = path.join(ROOT, "src/types/index.ts");
if (fs.existsSync(typesPath)) {
  let typesContent = fs.readFileSync(typesPath, "utf8");
  const needsFields =
    !/preferredTeamId/.test(typesContent) ||
    !/registrationNote/.test(typesContent) ||
    !/rejectionReason/.test(typesContent) ||
    !/approvedAt/.test(typesContent);

  if (needsFields) {
    console.log("   ↻ Adding missing fields to AppUser type");
    typesContent = typesContent.replace(
      /export interface AppUser \{[\s\S]*?\n\}/,
      `export interface AppUser {
     uid: string;
     email: string;
     displayName: string;
     role: RoleId;
     teamId?: TeamId | null;
     committeeIds?: string[];
     memberId?: string | null;
     createdAt?: string;
     emailVerified?: boolean;
     mustChangePassword?: boolean;
     createdByAdmin?: string;
     status?: 'active' | 'pending' | 'rejected';
     preferredTeamId?: TeamId | null;
     registrationNote?: string;
     approvedAt?: string;
     approvedBy?: string;
     rejectedAt?: string;
     rejectedBy?: string;
     rejectionReason?: string;
   }`
    );
    fs.writeFileSync(typesPath, typesContent, "utf8");
    console.log("   ✓ src/types/index.ts updated");
  }
}

/* ─────────────────────────────────────────────────────────────────────
      Build + push
      ───────────────────────────────────────────────────────────────────── */
console.log("");
console.log(" 🧹 Cleaning old artifacts…");
["dist", "node_modules/.vite", ".vite"].forEach((p) => {
  const abs = path.join(ROOT, p);
  if (fs.existsSync(abs)) {
    try {
      fs.rmSync(abs, { recursive: true, force: true });
      console.log("   ✗ removed: " + p);
    } catch {}
  }
});

function run(cmd, silent = false) {
  try {
    if (!silent) console.log(" $ " + cmd);
    execSync(cmd, { stdio: silent ? "pipe" : "inherit", cwd: ROOT });
    return true;
  } catch {
    if (!silent) console.log("   (command returned non-zero)");
    return false;
  }
}

if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
  console.log("");
  console.log(" 📦 Installing dependencies…");
  run("npm install --no-audit --no-fund");
}

console.log("");
console.log(" 🏗  Building locally…");
const buildOk = run("npm run build");

if (!buildOk) {
  console.log("");
  console.log(
    " ╔══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    " ║   ❌ BUILD STILL FAILS — ابعتلي السطرين اللي فوق الـ stack   ║"
  );
  console.log(
    " ╚══════════════════════════════════════════════════════════════╝"
  );
  console.log("");
  console.log(" 📋 ابعتلي السطرين اللي فوق الـ stack trace، شبه:");
  console.log('    [vite]: Rollup failed to resolve import "XXX" from "YYY"');
  console.log("    file: /path/to/file.tsx:LINE:COL");
  console.log("");
  process.exit(1);
}

console.log("");
console.log("   ✅ Build succeeded!");
console.log("");
console.log(" 📤 Pushing to GitHub…");

if (!fs.existsSync(path.join(ROOT, ".git"))) {
  run("git init");
  run("git branch -M main");
}

try {
  execSync("git remote get-url origin", { cwd: ROOT, stdio: "pipe" });
} catch {
  run(
    "git remote add origin https://github.com/hazimshendy-stack/sbapiaryyy.git"
  );
}

run("git add -A");
run(
  'git commit -m "fix(auth): add registerSelf + adminApproveUser + adminRejectUser"',
  true
);
const pushed = run("git push origin main --force");

console.log("");
console.log(
  " ╔══════════════════════════════════════════════════════════════╗"
);
console.log(
  pushed
    ? " ║   ✅ DONE — pushed. GitHub Actions will run in a moment.     ║"
    : " ║   ⚠️  Push failed — check output above.                     ║"
);
console.log(
  " ╚══════════════════════════════════════════════════════════════╝"
);
console.log("");
console.log(" ⏭️  بعد 4-7 دقايق افتح Actions واتأكد إن الـ build نجح ✅");
console.log("");
