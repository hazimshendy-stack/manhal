#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — إزالة unused imports + variables
 * Usage: node fix.cjs
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const C = {
  r: "\x1b[0m",
  b: "\x1b[1m",
  d: "\x1b[2m",
  g: "\x1b[32m",
  y: "\x1b[33m",
  red: "\x1b[31m",
  c: "\x1b[36m",
  m: "\x1b[35m",
};

// ═══════════════════════════════════════════════════════════════
// إصلاحات محددة لكل ملف (أدق وأسرع)
// ═══════════════════════════════════════════════════════════════

const FIXES = [
  {
    file: "src/pages/admin/AdminUsersPage.tsx",
    changes: [
      {
        from: "import { adminCreateMember, type CreateMemberInput } from '@/lib/auth';",
        to: "import { adminCreateMember } from '@/lib/auth';",
      },
    ],
  },
  {
    file: "src/pages/admin/AdminMembersPage.tsx",
    changes: [
      // شيل logAudit من الاستيراد
      {
        from: "import { logAudit } from '@/lib/audit';\n",
        to: "",
      },
      // شيل me (غير مستخدم)
      {
        from: "  const { user: me } = useAuth();\n",
        to: "",
      },
      // لو useAuth مش مستخدم بأي حاجة تانية
      {
        from: "import { useAuth } from '@/lib/useAuth';\n",
        to: "",
      },
    ],
  },
  {
    file: "src/pages/admin/AdminGovernancePage.tsx",
    changes: [
      { from: "import { logAudit } from '@/lib/audit';\n", to: "" },
      { from: "  const { user: me } = useAuth();\n", to: "" },
      { from: "import { useAuth } from '@/lib/useAuth';\n", to: "" },
    ],
  },
  {
    file: "src/pages/admin/AdminCommitteesPage.tsx",
    changes: [
      { from: "import { logAudit } from '@/lib/audit';\n", to: "" },
      { from: "  const { user: me } = useAuth();\n", to: "" },
      { from: "import { useAuth } from '@/lib/useAuth';\n", to: "" },
    ],
  },
  {
    file: "src/pages/admin/AdminAchievementsPage.tsx",
    changes: [
      { from: "import { logAudit } from '@/lib/audit';\n", to: "" },
      { from: "  const { user: me } = useAuth();\n", to: "" },
      { from: "import { useAuth } from '@/lib/useAuth';\n", to: "" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// مسح ذكي: يشيل أي import أو متغير غير مستخدم في أي ملف .ts/.tsx
// ═══════════════════════════════════════════════════════════════

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // ─── 1) شيل unused imports من { a, b, c } ───
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g;

  content = content.replace(importRegex, (match, imports, source) => {
    const names = imports
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    const bodyWithoutImports = content.replace(importRegex, "");

    const used = names.filter((name) => {
      // تعامل مع "type X" و "X as Y"
      let clean = name;
      if (clean.startsWith("type ")) clean = clean.slice(5).trim();
      if (clean.includes(" as ")) clean = clean.split(" as ")[1].trim();

      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "g");
      const matches = bodyWithoutImports.match(regex);
      return matches && matches.length > 0;
    });

    if (used.length === 0) return "";
    if (used.length === names.length) return match;
    return `import { ${used.join(", ")} } from '${source}';`;
  });

  // ─── 2) شيل unused variables من destructuring ───
  // زي: const { user: me } = useAuth(); → شيلها لو me مش مستخدم
  const destructureRegex = /const\s+\{\s*([^}]+)\s*\}\s*=\s*([^;]+);/g;

  content = content.replace(destructureRegex, (match, destructured, source) => {
    const items = destructured
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const used = items.filter((item) => {
      // تعامل مع "user: me" أو "user" أو "user: { x }"
      let varName = item;
      if (item.includes(":")) varName = item.split(":")[1].trim();
      if (varName.startsWith("{") || varName.startsWith("[")) return true;

      const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const bodyWithoutDecl = content.replace(match, "");
      const regex = new RegExp(`\\b${escaped}\\b`, "g");
      return regex.test(bodyWithoutDecl);
    });

    if (used.length === 0) return "";
    if (used.length === items.length) return match;
    return `const { ${used.join(", ")} } = ${source};`;
  });

  // ─── 3) شيل unused simple const declarations ───
  const constRegex = /^\s*const\s+([a-zA-Z_$][\w$]*)\s*=\s*[^;]+;\s*$/gm;
  const lines = content.split("\n");
  const newLines = lines.filter((line) => {
    const m = line.match(/^\s*const\s+([a-zA-Z_$][\w$]*)\s*=/);
    if (!m) return true;
    const varName = m[1];
    const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rest = content.replace(line, "");
    // لو مش مستخدم في أي مكان تاني، اشيله
    const regex = new RegExp(`\\b${escaped}\\b`, "g");
    return regex.test(rest);
  });
  content = newLines.join("\n");

  // ─── 4) نظّف السطور الفاضية الزيادة ───
  content = content.replace(/\n{3,}/g, "\n\n");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════

console.log("");
console.log(
  `${C.b}${C.m}╔══════════════════════════════════════════════════════╗${C.r}`
);
console.log(
  `${C.b}${C.m}║  fix.cjs — إزالة unused imports/vars                 ║${C.r}`
);
console.log(
  `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
);
console.log("");

// ═══ Step 1: fixes محددة ═══
console.log(`${C.b}▶ Step 1: إصلاحات محددة${C.r}\n`);

for (const fix of FIXES) {
  const abs = path.join(ROOT, fix.file);
  if (!fs.existsSync(abs)) {
    console.log(`${C.y}⚠${C.r} ${fix.file} — غير موجود`);
    continue;
  }

  let content = fs.readFileSync(abs, "utf8");
  let changed = false;

  for (const ch of fix.changes) {
    if (content.includes(ch.from)) {
      content = content.replace(ch.from, ch.to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(abs, content, "utf8");
    console.log(`${C.g}✓${C.r} ${fix.file}`);
  } else {
    console.log(`${C.d}→${C.r} ${fix.file} — لا يحتاج تعديل يدوي`);
  }
}

// ═══ Step 2: مسح شامل لكل src ═══
console.log("");
console.log(`${C.b}▶ Step 2: مسح unused imports شامل${C.r}\n`);

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(full);
  }
  return out;
}

const srcDir = path.join(ROOT, "src");
const allFiles = walk(srcDir);
let cleaned = 0;

for (const file of allFiles) {
  if (cleanFile(file)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    console.log(`${C.g}✓${C.r} ${rel} ${C.d}(نظّفناه)${C.r}`);
    cleaned++;
  }
}

if (cleaned === 0) console.log(`${C.d}لا يوجد ملفات تحتاج تنظيف إضافي${C.r}`);

// ═══ Step 3: TypeScript check ═══
console.log("");
console.log(`${C.b}▶ Step 3: التحقق من TypeScript${C.r}\n`);

let ok = false;
try {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  ok = true;
  console.log(`\n${C.g}${C.b}✓ لا أخطاء TypeScript!${C.r}`);
} catch {
  console.log(`\n${C.y}⚠ راجع الأخطاء أعلاه${C.r}`);
}

// ═══ Summary ═══
console.log("");
console.log(`${C.b}═══ الخلاصة ═══${C.r}`);
console.log(`  ${C.g}✓ ملفات تم تنظيفها: ${cleaned}${C.r}`);
console.log("");

if (ok) {
  console.log(`${C.b}الخطوة التالية:${C.r}`);
  console.log(`  ${C.c}git add -A`);
  console.log(`  git commit -m "fix: remove unused imports/vars"`);
  console.log(`  git push origin main --force${C.r}`);
} else {
  console.log(`${C.y}ابعثلي رسائل tsc الباقية${C.r}`);
}
console.log("");
