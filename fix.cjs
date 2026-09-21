#!/usr/bin/env node
/**
 * fix.cjs — إصلاح أخطاء TypeScript (auth.ts + toast-or-fallback.ts)
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

const log = {
  ok: (m) => console.log(`${C.green}✓${C.reset} ${m}`),
  warn: (m) => console.log(`${C.yellow}⚠${C.reset} ${m}`),
  info: (m) => console.log(`${C.cyan}ℹ${C.reset} ${m}`),
  dim: (m) => console.log(`${C.dim}  ${m}${C.reset}`),
  err: (m) => console.log(`${C.red}✗${C.reset} ${m}`),
};

// ═══════════════════════════════════════════════════════════════
// 1) إصلاح src/lib/auth.ts
// ═══════════════════════════════════════════════════════════════
function fixAuth() {
  const file = path.join(ROOT, "src/lib/auth.ts");
  if (!fs.existsSync(file)) {
    log.warn("src/lib/auth.ts غير موجود");
    return false;
  }

  let content = fs.readFileSync(file, "utf8");

  // تأكد من وجود type FirebaseUser في الاستيراد
  const firebaseAuthImportRegex =
    /import\s*\{([^}]+)\}\s*from\s*['"]firebase\/auth['"];?/;

  const match = content.match(firebaseAuthImportRegex);
  if (!match) {
    log.err("مش لاقي استيراد firebase/auth في auth.ts");
    return false;
  }

  const importsStr = match[1];
  const hasFirebaseUser =
    /type\s+User\s+as\s+FirebaseUser/.test(importsStr) ||
    /FirebaseUser/.test(importsStr);

  if (!hasFirebaseUser) {
    // ضيف الاستيراد
    const newImports =
      importsStr.trim().replace(/,\s*$/, "") +
      ",\n  type User as FirebaseUser,\n";
    content = content.replace(
      firebaseAuthImportRegex,
      `import {\n  ${newImports
        .trim()
        .replace(/,\s*$/, "")}\n} from 'firebase/auth';`
    );

    // تنظيف أي مسافات زايدة
    content = content.replace(/\n{3,}/g, "\n\n");

    fs.writeFileSync(file, content, "utf8");
    log.ok("src/lib/auth.ts — إضافة FirebaseUser");
    return true;
  }

  // لو موجود بس فيه مشكلة، أعد كتابة الاستيراد
  const fixedImport = `import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';`;

  const newContent = content.replace(firebaseAuthImportRegex, fixedImport);
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, "utf8");
    log.ok("src/lib/auth.ts — إعادة كتابة الاستيراد");
    return true;
  }

  log.dim("src/lib/auth.ts — سليم بالفعل");
  return false;
}

// ═══════════════════════════════════════════════════════════════
// 2) إصلاح src/components/ui/toast-or-fallback.ts
// ═══════════════════════════════════════════════════════════════
function fixToastFallback() {
  const file = path.join(ROOT, "src/components/ui/toast-or-fallback.ts");
  if (!fs.existsSync(file)) {
    log.dim("src/components/ui/toast-or-fallback.ts — غير موجود (تخطي)");
    return false;
  }

  // الملف ده مش محتاجينه — الأفضل نحذفه
  // لكن للتأمين، نعيد كتابته صح
  const content = `import { toast as realToast } from './Toast';

export { realToast as toast };
`;

  fs.writeFileSync(file, content, "utf8");
  log.ok("src/components/ui/toast-or-fallback.ts — إعادة كتابة صحيحة");
  return true;
}

// ═══════════════════════════════════════════════════════════════
// 3) حذف الملف نهائيًا (بديل أنضف)
// ═══════════════════════════════════════════════════════════════
function deleteToastFallback() {
  const file = path.join(ROOT, "src/components/ui/toast-or-fallback.ts");
  if (!fs.existsSync(file)) return false;

  // اتأكد إنه مش مستخدم في أي مكان
  const srcDir = path.join(ROOT, "src");
  let used = false;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        const c = fs.readFileSync(full, "utf8");
        if (c.includes("toast-or-fallback")) {
          used = true;
          log.dim(`مستخدم في: ${path.relative(ROOT, full)}`);
        }
      }
    }
  }
  walk(srcDir);

  if (used) {
    log.warn("toast-or-fallback مستخدم — هيتم إصلاحه بدل حذفه");
    return fixToastFallback();
  }

  fs.unlinkSync(file);
  log.ok("src/components/ui/toast-or-fallback.ts — تم الحذف (غير مستخدم)");
  return true;
}

// ═══════════════════════════════════════════════════════════════
// 4) مسح unused imports شامل (احتياطي)
// ═══════════════════════════════════════════════════════════════
function cleanUnusedImports() {
  const srcDir = path.join(ROOT, "src");
  if (!fs.existsSync(srcDir)) return 0;

  let fixed = 0;
  const files = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(tsx?)$/.test(entry.name)) files.push(full);
    }
  }
  walk(srcDir);

  for (const file of files) {
    let content = fs.readFileSync(file, "utf8");
    const original = content;
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g;

    content = content.replace(importRegex, (match, imports, source) => {
      const names = imports
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
      const body = content.replace(importRegex, "");

      const used = names.filter((name) => {
        const cleanName = name.replace(/^type\s+/, "").trim();
        const regex = new RegExp(
          `\\b${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "g"
        );
        return regex.test(body);
      });

      if (used.length === 0) return "";
      if (used.length === names.length) return match;
      return `import { ${used.join(", ")} } from '${source}';`;
    });

    content = content.replace(/\n{3,}/g, "\n\n");

    if (content !== original) {
      fs.writeFileSync(file, content, "utf8");
      log.ok(
        path.relative(ROOT, file).replace(/\\/g, "/") + " — تنظيف imports"
      );
      fixed++;
    }
  }

  return fixed;
}

// ═══════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════
console.log("");
console.log(
  `${C.bold}${C.magenta}╔══════════════════════════════════════════════════════╗${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}║  fix.cjs — إصلاح أخطاء build                         ║${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}╚══════════════════════════════════════════════════════╝${C.reset}`
);
console.log("");

// Step 1: auth.ts
console.log(`${C.bold}▶ Step 1: إصلاح src/lib/auth.ts${C.reset}`);
fixAuth();
console.log("");

// Step 2: toast-or-fallback.ts
console.log(`${C.bold}▶ Step 2: إصلاح toast-or-fallback.ts${C.reset}`);
deleteToastFallback();
console.log("");

// Step 3: unused imports
console.log(`${C.bold}▶ Step 3: مسح unused imports شامل${C.reset}`);
const cleaned = cleanUnusedImports();
if (cleaned === 0) log.dim("لا يوجد unused imports");
console.log("");

// Step 4: TypeScript check
console.log(`${C.bold}▶ Step 4: التحقق من TypeScript${C.reset}\n`);
let tscOk = false;
try {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  tscOk = true;
  console.log("");
  console.log(`${C.green}${C.bold}✓ لا أخطاء TypeScript!${C.reset}`);
} catch {
  console.log("");
  console.log(`${C.yellow}⚠ ما زالت هناك أخطاء — راجع الرسائل أعلاه${C.reset}`);
}

console.log("");
console.log(`${C.bold}═══ الخلاصة ═══${C.reset}`);
if (tscOk) {
  console.log(`${C.green}✓ المشروع جاهز للـ push${C.reset}`);
  console.log("");
  console.log(`${C.bold}الخطوة التالية:${C.reset}`);
  console.log(`  ${C.cyan}git add -A`);
  console.log(`  git commit -m "fix: auth + toast imports"`);
  console.log(`  git push origin main --force${C.reset}`);
} else {
  console.log(`${C.yellow}⚠ راجع الأخطاء فوق وأعد التشغيل${C.reset}`);
}
console.log("");
