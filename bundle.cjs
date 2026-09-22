#!/usr/bin/env node
/**
 * bundle.cjs
 * يجمع كل ملفات المشروع المطلوبة في فايل واحد لتقليل التوكنز عند إرساله للذكاء الاصطناعي.
 * Usage:
 *   node bundle.cjs            -> bundle.txt (raw)
 *   node bundle.cjs --minify   -> bundle.txt (comments & blank lines stripped)
 *   node bundle.cjs --out custom.txt
 */

const fs = require("fs");
const path = require("path");

// ── الملفات المطلوبة بالترتيب ──
const FILES = [
  "src/types.ts",
  "src/data/teams.ts",
  "src/lib/useAuth.ts",
  "src/lib/useRealtimeCollection.ts",
  "src/lib/rankings.ts",
  "src/lib/pwa.ts",
  "src/pages/LoginPage.tsx",
  "src/pages/DashboardPage.tsx",
  "src/pages/NotificationsPage.tsx",
  "src/pages/ApprovalsPage.tsx",
  "src/pages/NewRequestPage.tsx",
  "src/pages/admin/AdminMembersPage.tsx",
  "src/pages/admin/AdminGovernancePage.tsx",
  "src/pages/admin/AdminAnalyticsPage.tsx",
  "src/pages/admin/AdminNotificationsPage.tsx",
  "src/pages/admin/AdminRequestsPage.tsx",
  "src/components/layout/Sidebar.tsx",
  "src/components/layout/Navbar.tsx",
  "src/components/layout/BottomNav.tsx",
];

// ── إعدادات CLI ──
const args = process.argv.slice(2);
const MINIFY = args.includes("--minify");
const outIdx = args.indexOf("--out");
const OUT = outIdx >= 0 && args[outIdx + 1] ? args[outIdx + 1] : "bundle.txt";

// ── تقليل الحجم: حذف التعليقات والمسافات الزائدة مع الحفاظ على صحة الكود ──
function minify(code) {
  // احفظ الـ strings والـ template literals مؤقتاً
  const store = [];
  const keep = (m) => {
    store.push(m);
    return `\u0000${store.length - 1}\u0000`;
  };

  // double / single quotes و template literals
  code = code.replace(/`(?:\\.|[^`\\])*`/g, keep);
  code = code.replace(/"(?:\\.|[^"\\])*"/g, keep);
  code = code.replace(/'(?:\\.|[^'\\])*'/g, keep);

  // احذف التعليقات
  code = code.replace(/\/\*[\s\S]*?\*\//g, "");
  code = code.replace(/(^|[^:\/])\/\/.*$/gm, "$1");

  // شيل الأسطر الفاضية والمسافات على الأطراف
  code = code
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .filter((l) => l.trim() !== "")
    .join("\n");

  // رجّع الـ strings
  code = code.replace(/\u0000(\d+)\u0000/g, (_, i) => store[+i]);
  return code;
}

// ── التنفيذ ──
function main() {
  if (!fs.existsSync(OUT) === false) {
    // لا مشكلة، سيُستبدل
  }
  let total = 0;
  let header =
    `// ============================================================\n` +
    `// PROJECT BUNDLE — generated ${new Date().toISOString()}\n` +
    `// Files: ${FILES.length}\n` +
    `// Mode: ${MINIFY ? "MINIFIED (comments stripped)" : "RAW"}\n` +
    `// ============================================================\n`;

  let body = "";
  const missing = [];

  for (const f of FILES) {
    const abs = path.resolve(process.cwd(), f);
    if (!fs.existsSync(abs)) {
      missing.push(f);
      body += `\n\n// ===== FILE: ${f} =====\n// ⚠️ MISSING — file not found\n`;
      continue;
    }
    let content = fs.readFileSync(abs, "utf8");
    if (MINIFY) content = minify(content);
    total += content.length;
    body += `\n\n// ===== FILE: ${f} =====\n${content}\n`;
  }

  fs.writeFileSync(OUT, header + body, "utf8");

  const bytes = fs.statSync(OUT).size;
  console.log("✅ Bundle created:", OUT);
  console.log(
    "   Files bundled :",
    FILES.length - missing.length,
    "/",
    FILES.length
  );
  console.log("   Total size    :", (bytes / 1024).toFixed(2), "KB");
  if (missing.length) console.warn("   ⚠️ Missing    :", missing.join(", "));
  console.log("   Mode          :", MINIFY ? "MINIFIED" : "RAW");
}

main();
