#!/usr/bin/env node
/**
 * fix.cjs — إصلاح أخطاء TypeScript (unused imports)
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

// ═══════════════════════════════════════════════════════════════
// قائمة الإصلاحات: كل إصلاح = ملف + بحث واستبدال
// ═══════════════════════════════════════════════════════════════
const FIXES = [
  {
    file: "src/pages/ConversationsPage.tsx",
    find: "import { FormField, Select, TextInput } from '@/components/ui/FormField';",
    replace: "import { FormField, Select } from '@/components/ui/FormField';",
    desc: "إزالة TextInput غير المستخدم",
  },
  // ─── إصلاحات محتملة إضافية ───
  {
    file: "src/pages/admin/AdminGovernancePage.tsx",
    find: "import { FormField, TextInput, TextArea } from '@/components/ui/FormField';",
    replace:
      "import { FormField, TextInput, TextArea } from '@/components/ui/FormField';",
    desc: "تأكيد استيراد صحيح",
    optional: true,
  },
];

// ═══════════════════════════════════════════════════════════════
// إصلاح unused imports تلقائيًا لأي ملف
// ═══════════════════════════════════════════════════════════════
function removeUnusedImports(filePath) {
  const abs = path.join(ROOT, filePath);
  if (!fs.existsSync(abs)) return false;

  let content = fs.readFileSync(abs, "utf8");
  const original = content;

  // regex لالتقاط كل import statements
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g;

  content = content.replace(importRegex, (match, imports, source) => {
    const names = imports
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    const used = names.filter((name) => {
      // شيل كلمة "type" لو موجودة
      const cleanName = name.replace(/^type\s+/, "").trim();
      // ابحث عن الاستخدام في باقي الملف (بدون import statements)
      const body = content.replace(importRegex, "");
      const regex = new RegExp(`\\b${cleanName}\\b`, "g");
      const matches = body.match(regex);
      return matches && matches.length > 0;
    });

    if (used.length === 0) return ""; // شيل الاستيراد كامل
    if (used.length === names.length) return match; // مفيش تغيير

    return `import { ${used.join(", ")} } from '${source}';`;
  });

  // نظّف السطور الفاضية المتتالية
  content = content.replace(/\n{3,}/g, "\n\n");

  if (content !== original) {
    fs.writeFileSync(abs, content, "utf8");
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════
// المسح الشامل لمجلد src
// ═══════════════════════════════════════════════════════════════
function walkDir(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

// ═══════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════
console.log("");
console.log(
  `${C.bold}${C.magenta}╔══════════════════════════════════════════════════════╗${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}║  fix.cjs — إصلاح أخطاء TypeScript                    ║${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}╚══════════════════════════════════════════════════════╝${C.reset}`
);
console.log("");

// ── 1) إصلاحات محددة ──
console.log(`${C.bold}▶ Step 1: تطبيق إصلاحات محددة${C.reset}\n`);

let fixedCount = 0;
for (const fix of FIXES) {
  const abs = path.join(ROOT, fix.file);
  if (!fs.existsSync(abs)) {
    if (!fix.optional) {
      console.log(`${C.yellow}⚠${C.reset} ${fix.file} غير موجود — تخطي`);
    }
    continue;
  }

  const content = fs.readFileSync(abs, "utf8");
  if (content.includes(fix.find) && fix.find !== fix.replace) {
    fs.writeFileSync(abs, content.replace(fix.find, fix.replace), "utf8");
    console.log(`${C.green}✓${C.reset} ${fix.file}`);
    console.log(`  ${C.dim}${fix.desc}${C.reset}`);
    fixedCount++;
  } else {
    console.log(`${C.dim}→${C.reset} ${fix.file} — لا يحتاج تعديل`);
  }
}

// ── 2) مسح شامل ──
console.log("");
console.log(`${C.bold}▶ Step 2: مسح unused imports شامل${C.reset}\n`);

const srcDir = path.join(ROOT, "src");
if (fs.existsSync(srcDir)) {
  const allFiles = walkDir(srcDir);
  let autoFixed = 0;
  for (const file of allFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    if (removeUnusedImports(rel)) {
      console.log(
        `${C.green}✓${C.reset} ${rel} ${C.dim}(تم التنظيف)${C.reset}`
      );
      autoFixed++;
    }
  }
  if (autoFixed === 0) {
    console.log(`${C.dim}لا يوجد unused imports${C.reset}`);
  }
  fixedCount += autoFixed;
}

// ── 3) التحقق من TypeScript ──
console.log("");
console.log(`${C.bold}▶ Step 3: التحقق من TypeScript${C.reset}\n`);

try {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  console.log("");
  console.log(`${C.green}${C.bold}✓ لا أخطاء TypeScript!${C.reset}`);
} catch {
  console.log("");
  console.log(`${C.yellow}⚠ ما زالت هناك أخطاء — راجع الرسائل أعلاه${C.reset}`);
}

console.log("");
console.log(`${C.bold}الخلاصة:${C.reset}`);
console.log(`  ${C.green}✓ تم إصلاح ${fixedCount} ملف${C.reset}`);
console.log("");
console.log(`${C.bold}الخطوة التالية:${C.reset}`);
console.log(
  `  ${C.cyan}git add -A && git commit -m "fix: remove unused imports" && git push origin main --force${C.reset}`
);
console.log("");
