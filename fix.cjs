#!/usr/bin/env node
/**
 * fix.cjs — حل قاطع لخطأ FirebaseUser في src/lib/auth.ts
 * Usage: node fix.cjs
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

console.log("");
console.log(
  `${C.bold}${C.magenta}╔══════════════════════════════════════════════════════╗${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}║  fix.cjs — إصلاح FirebaseUser                        ║${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}╚══════════════════════════════════════════════════════╝${C.reset}`
);
console.log("");

// ═══════════════════════════════════════════════════════════════
// 1) نسخة احتياطية
// ═══════════════════════════════════════════════════════════════
const authPath = path.join(ROOT, "src/lib/auth.ts");

if (!fs.existsSync(authPath)) {
  console.log(`${C.red}✗ src/lib/auth.ts غير موجود${C.reset}`);
  process.exit(1);
}

const backupDir = path.join(ROOT, ".fix-backups", Date.now().toString());
fs.mkdirSync(backupDir, { recursive: true });
fs.copyFileSync(authPath, path.join(backupDir, "auth.ts"));
console.log(
  `${C.green}✓${C.reset} نسخة احتياطية: .fix-backups/${path.basename(
    backupDir
  )}/auth.ts`
);
console.log("");

// ═══════════════════════════════════════════════════════════════
// 2) الملف الكامل الصحيح
// ═══════════════════════════════════════════════════════════════
const AUTH_CONTENT = `import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { AppUser, RoleId, TeamId, Member } from '@/types';

/* ═══════════════════════════════════════════════════════════════
   تسجيل الدخول
   ═══════════════════════════════════════════════════════════════ */

export async function login(email: string, password: string): Promise<AppUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return await ensureUserDoc(cred.user);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

/* ═══════════════════════════════════════════════════════════════
   إعادة تعيين كلمة المرور
   ═══════════════════════════════════════════════════════════════ */

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/* ═══════════════════════════════════════════════════════════════
   تغيير كلمة المرور
   ═══════════════════════════════════════════════════════════════ */

export async function changePassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('لا يوجد مستخدم مسجل');
  await updatePassword(user, newPassword);
  await updateDoc(doc(db, 'users', user.uid), {
    mustChangePassword: false,
  });
}

/* ═══════════════════════════════════════════════════════════════
   إنشاء حساب من الأدمن
   ═══════════════════════════════════════════════════════════════ */

export interface CreateMemberInput {
  email: string;
  temporaryPassword: string;
  name: string;
  role: RoleId;
  teamIds: TeamId[];
  committeeIds: string[];
  bio?: string;
}

export async function adminCreateMember(
  input: CreateMemberInput,
  adminUid: string,
): Promise<string> {
  const response = await fetch(
    \`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=\${import.meta.env.VITE_FIREBASE_API_KEY}\`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.temporaryPassword,
        returnSecureToken: true,
      }),
    },
  );

  const data = await response.json();
  if (!response.ok) {
    const code = data?.error?.message ?? '';
    if (code.includes('EMAIL_EXISTS')) throw new Error('البريد مستخدم بالفعل');
    if (code.includes('WEAK_PASSWORD')) throw new Error('كلمة المرور ضعيفة');
    if (code.includes('INVALID_EMAIL')) throw new Error('البريد الإلكتروني غير صالح');
    throw new Error('فشل إنشاء الحساب');
  }

  const uid: string = data.localId;
  const memberId = 'M-' + uid.slice(0, 8).toUpperCase();

  const userData: AppUser = {
    uid,
    email: input.email.trim(),
    displayName: input.name.trim(),
    role: input.role,
    teamId: input.teamIds[0] ?? null,
    committeeIds: input.committeeIds,
    memberId,
    createdAt: new Date().toISOString(),
    emailVerified: false,
    mustChangePassword: true,
    createdByAdmin: adminUid,
  };

  await setDoc(doc(db, 'users', uid), userData);

  const memberData: Member = {
    id: memberId,
    name: input.name.trim(),
    role: input.role,
    teamIds: input.teamIds,
    committeeIds: input.committeeIds,
    joinedSeason: 7,
    hours: 0,
    status: 'active',
    bio: input.bio?.trim() || undefined,
    email: input.email.trim(),
    linkedUserId: uid,
  };

  await setDoc(doc(db, 'members', memberId), memberData);

  return uid;
}

/* ═══════════════════════════════════════════════════════════════
   مزامنة user doc
   ═══════════════════════════════════════════════════════════════ */

async function ensureUserDoc(fbUser: User): Promise<AppUser> {
  const ref = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data() as Omit<AppUser, 'uid'>;
    return { uid: fbUser.uid, ...data, emailVerified: fbUser.emailVerified };
  }

  const fallback: AppUser = {
    uid: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: fbUser.displayName ?? fbUser.email ?? 'عضو',
    role: 'VIEWER',
    teamId: null,
    committeeIds: [],
    memberId: null,
    createdAt: new Date().toISOString(),
    emailVerified: fbUser.emailVerified,
    mustChangePassword: false,
  };

  await setDoc(ref, fallback);
  return fallback;
}

/* ═══════════════════════════════════════════════════════════════
   Observer
   ═══════════════════════════════════════════════════════════════ */

export function observeAuth(
  callback: (user: AppUser | null, loading: boolean) => void,
): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null, false);
      return;
    }
    try {
      const appUser = await ensureUserDoc(fbUser);
      callback(appUser, false);
    } catch {
      callback(null, false);
    }
  });
}

export function hasRole(user: AppUser | null, roles: RoleId[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
`;

fs.writeFileSync(authPath, AUTH_CONTENT, "utf8");
console.log(`${C.green}✓${C.reset} src/lib/auth.ts — تم الكتابة بالشكل الصحيح`);
console.log("");

// ═══════════════════════════════════════════════════════════════
// 3) حذف toast-or-fallback إذا لسه موجود
// ═══════════════════════════════════════════════════════════════
const toastFallback = path.join(ROOT, "src/components/ui/toast-or-fallback.ts");
if (fs.existsSync(toastFallback)) {
  fs.unlinkSync(toastFallback);
  console.log(
    `${C.green}✓${C.reset} src/components/ui/toast-or-fallback.ts — تم الحذف`
  );
  console.log("");
}

// ═══════════════════════════════════════════════════════════════
// 4) التحقق من TypeScript
// ═══════════════════════════════════════════════════════════════
console.log(`${C.bold}▶ التحقق من TypeScript${C.reset}\n`);

let ok = false;
try {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  ok = true;
  console.log("");
  console.log(`${C.green}${C.bold}✓ لا أخطاء TypeScript!${C.reset}`);
} catch {
  console.log("");
  console.log(`${C.yellow}⚠ ما زالت هناك أخطاء — راجع الرسائل أعلاه${C.reset}`);
}

console.log("");
console.log(`${C.bold}═══ الخلاصة ═══${C.reset}`);
if (ok) {
  console.log(`${C.green}✓ auth.ts اتصلح${C.reset}`);
  console.log(`${C.green}✓ toast-or-fallback اتحذف${C.reset}`);
  console.log("");
  console.log(`${C.bold}الخطوة التالية:${C.reset}`);
  console.log(`${C.cyan}  git add -A`);
  console.log(`  git commit -m "fix: auth.ts FirebaseUser import"`);
  console.log(`  git push origin main --force${C.reset}`);
} else {
  console.log(`${C.yellow}⚠ فيه أخطاء تانية — ابعتلي رسائل tsc${C.reset}`);
}
console.log("");
