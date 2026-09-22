#!/usr/bin/env node
"use strict";

/* ============================================================================
 * fix-createuser.cjs
 * Fixes: "createUserAccount" is not exported by "src/lib/auth.ts"
 * ==========================================================================*/

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();

function read(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function write(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (fs.existsSync(p)) {
    try {
      fs.copyFileSync(p, p + ".bak");
    } catch {
      /* ignore */
    }
  }
  fs.writeFileSync(p, content, "utf8");
  console.log("  ✍️  wrote " + path.relative(ROOT, p));
}

function patch(p, transform) {
  const before = read(p);
  if (before == null) {
    console.log("  ⚠️  skip (missing): " + path.relative(ROOT, p));
    return false;
  }
  const after = transform(before);
  if (after === before) {
    console.log("  ℹ️  no change: " + path.relative(ROOT, p));
    return false;
  }
  write(p, after);
  return true;
}

/* ---------------------------------------------------------------------------
 * The helper — creates a Firebase Auth user WITHOUT signing the admin out,
 * by using a secondary Firebase App instance.
 *
 * For production, replace the body with a call to your Cloud Function:
 *   POST /api/admin/create-user  { email, password, displayName, ... }
 * ------------------------------------------------------------------------- */
const HELPER = `// src/lib/createUserAccount.ts
// Admin-side user creation.
//
// ⚠️ PRODUCTION NOTE:
// User creation should ultimately be done server-side (Firebase Cloud
// Function using the Admin SDK) so the admin's own session is never
// touched and custom claims can be set atomically.
//
// The client-side implementation below works around the "sign in as the
// new user" side effect by spinning up a SECONDARY Firebase App instance.
// It is fine for demos and small teams, but replace with a backend call
// before going live:
//
//   POST /api/admin/create-user
//   Body: { email, password, displayName, role, teamId, memberId, status }
//   Response: { uid: string }
//
import { initializeApp, deleteApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CreateUserInput {
  email: string;
  password: string;
  displayName: string;
  role?: string;
  teamId?: string | null;
  committeeId?: string | null;
  memberId?: string | null;
  status?: string;
}

export interface CreateUserResult {
  uid: string;
}

const SECONDARY_APP_NAME = 'manhal-admin-create-user';

function getSecondaryApp() {
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
  if (existing) return existing;
  const primary = getApp();
  const options = (primary.options || {}) as Record<string, unknown>;
  return initializeApp(options, SECONDARY_APP_NAME);
}

export async function createUserAccount(input: CreateUserInput): Promise<CreateUserResult> {
  if (!input || !input.email || !input.password) {
    throw new Error('email and password are required');
  }

  const secondary = getSecondaryApp();
  const secondaryAuth = getAuth(secondary);
  let uid = '';

  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      input.email.trim().toLowerCase(),
      input.password,
    );
    uid = cred.user.uid;

    try {
      await updateProfile(cred.user, { displayName: input.displayName });
    } catch {
      /* non-fatal */
    }

    const now = new Date().toISOString();
    await setDoc(
      doc(db, 'users', uid),
      {
        uid,
        email: input.email.trim().toLowerCase(),
        displayName: input.displayName,
        realName: input.displayName,
        fullName: input.displayName,
        role: input.role || 'MEMBER',
        status: input.status || 'approved',
        teamId: input.teamId || null,
        committeeId: input.committeeId || null,
        memberId: input.memberId || null,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

    return { uid };
  } finally {
    try { await secondaryAuth.signOut(); } catch { /* ignore */ }
    try { await deleteApp(secondary); } catch { /* ignore */ }
  }
}
`;

/* ---------------------------------------------------------------------------
 * MAIN
 * ------------------------------------------------------------------------- */
(async () => {
  console.log("============================================================");
  console.log(" fix-createuser.cjs — " + new Date().toISOString());
  console.log(" ROOT: " + ROOT);
  console.log("============================================================");

  // 1) Create the helper module
  console.log("\n[1/3] Creating src/lib/createUserAccount.ts");
  const helperPath = path.join(ROOT, "src/lib/createUserAccount.ts");
  if (fs.existsSync(helperPath)) {
    console.log(
      "  ℹ️  already exists — overwriting (backup: createUserAccount.ts.bak)"
    );
  }
  write(helperPath, HELPER);

  // 2) Rewrite the offending imports everywhere in src/
  console.log("\n[2/3] Rewriting imports of createUserAccount");

  const SRC = path.join(ROOT, "src");
  let touched = 0;

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;

      const before = read(full);
      if (before == null) continue;
      if (!before.includes("createUserAccount")) continue;

      let after = before;

      // Replace `import { createUserAccount } from '@/lib/auth';`
      after = after.replace(
        /import\s*\{([^}]*?)\bcreateUserAccount\b([^}]*?)\}\s*from\s*['"]@\/lib\/auth['"]\s*;?/g,
        (match, left, right) => {
          const keep = (left + right)
            .split(",")
            .map((s) => s.trim())
            .filter(
              (s) =>
                s && s !== "createUserAccount" && s !== "type createUserAccount"
            );
          const imports = [];
          if (keep.length) {
            imports.push(
              "import { " + keep.join(", ") + " } from '@/lib/auth';"
            );
          }
          imports.push(
            "import { createUserAccount } from '@/lib/createUserAccount';"
          );
          return imports.join("\n");
        }
      );

      // Also catch relative imports (rare but possible): from '../lib/auth'
      after = after.replace(
        /import\s*\{([^}]*?)\bcreateUserAccount\b([^}]*?)\}\s*from\s*['"](?:\.\.\/)+lib\/auth['"]\s*;?/g,
        (match, left, right) => {
          const keep = (left + right)
            .split(",")
            .map((s) => s.trim())
            .filter(
              (s) =>
                s && s !== "createUserAccount" && s !== "type createUserAccount"
            );
          const imports = [];
          if (keep.length) {
            imports.push(
              "import { " + keep.join(", ") + " } from '@/lib/auth';"
            );
          }
          imports.push(
            "import { createUserAccount } from '@/lib/createUserAccount';"
          );
          return imports.join("\n");
        }
      );

      if (after !== before) {
        write(full, after);
        touched++;
      }
    }
  };

  walk(SRC);
  console.log("  ✅ files updated: " + touched);

  // 3) Sanity check — make sure the helper is where we think it is
  console.log("\n[3/3] Verifying + building");
  if (!fs.existsSync(helperPath)) {
    console.error("  ❌ helper file was not written — aborting");
    process.exit(1);
  }

  // Verify no stray imports remain
  let strayCount = 0;
  const verify = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        verify(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      if (path.basename(full) === "createUserAccount.ts") continue;
      const content = read(full) || "";
      if (
        /import\s*\{[^}]*\bcreateUserAccount\b[^}]*\}\s*from\s*['"][^'"]*\/auth['"]/.test(
          content
        )
      ) {
        console.log(
          "  ⚠️  leftover auth import in " + path.relative(ROOT, full)
        );
        strayCount++;
      }
    }
  };
  verify(SRC);
  if (strayCount > 0) {
    console.log(
      "  ⚠️  " +
        strayCount +
        " file(s) still import createUserAccount from auth — build may still fail"
    );
  } else {
    console.log("  ✅ no stray imports found");
  }

  console.log("\n→ Running npm run build ...\n");
  const res = spawnSync("npm", ["run", "build"], {
    cwd: ROOT,
    shell: true,
    stdio: "inherit",
  });
  const code = res.status == null ? 1 : res.status;

  console.log("\n============================================================");
  console.log(" Build exit code: " + code);
  if (code === 0) {
    console.log(" 🎉 BUILD SUCCEEDED");
    console.log("");
    console.log(" Next:");
    console.log("   git add -A");
    console.log('   git commit -m "fix: add createUserAccount helper"');
    console.log("   git push origin main");
  } else {
    console.log(" ❌ BUILD STILL FAILING — scroll up for details");
    console.log(" Full log: build-error.log (if generated by fix-build.cjs)");
  }
  console.log("============================================================\n");

  process.exit(code);
})().catch((err) => {
  console.error("\nFATAL:", err && err.stack ? err.stack : err);
  process.exit(1);
});
