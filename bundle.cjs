#!/usr/bin/env node
/**
 * bundle.cjs
 * يجمع كل كود المشروع في ملف/ملفات نصية صغيرة الحجم لإرسالها للذكاء الاصطناعي.
 *
 * Usage:
 *   node bundle.cjs                          -> bundle.txt (raw)
 *   node bundle.cjs --minify                 -> يحذف التعليقات والمسافات (موصى به)
 *   node bundle.cjs --minify --split 400     -> يقسم لملفات 400KB كحد أقصى
 *   node bundle.cjs --out custom.txt
 *   node bundle.cjs --include-lock           -> يضم package-lock.json
 *   node bundle.cjs --include-dist           -> يضم dist/build (غير موصى به)
 */

const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────
// إعدادات CLI
// ─────────────────────────────────────────────
const args = process.argv.slice(2);
const MINIFY = args.includes("--minify");
const INCLUDE_LOCK = args.includes("--include-lock");
const INCLUDE_DIST = args.includes("--include-dist");
const outIdx = args.indexOf("--out");
const OUT = outIdx >= 0 && args[outIdx + 1] ? args[outIdx + 1] : "bundle.txt";
const splitIdx = args.indexOf("--split");
const SPLIT_KB =
  splitIdx >= 0 && args[splitIdx + 1] ? parseInt(args[splitIdx + 1], 10) : 0;
const SPLIT_BYTES = SPLIT_KB > 0 ? SPLIT_KB * 1024 : 0;

// ─────────────────────────────────────────────
// المجلدات المستثناة دائماً
// ─────────────────────────────────────────────
const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  ".github",
  ".husky",
  ".vscode",
  ".idea",
  ".next",
  ".nuxt",
  ".cache",
  ".turbo",
  ".parcel-cache",
  "coverage",
  "dist",
  "build",
  "out",
  "public",
  "static",
  "assets",
  "images",
  "img",
  "fonts",
  "media",
  "vendor",
  "tmp",
  "temp",
  ".tmp",
  "logs",
  "backups",
  "backup",
  ".backup",
]);

// لو include-dist مطلوب نحذفهم من الاستثناء
if (INCLUDE_DIST) {
  ["dist", "build", "out"].forEach((d) => EXCLUDED_DIRS.delete(d));
}

// ─────────────────────────────────────────────
// الامتدادات المسموح بيها (كود فقط)
// ─────────────────────────────────────────────
const ALLOWED_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".vue",
  ".svelte",
  ".astro",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".htm",
  ".md",
  ".mdx",
  ".yml",
  ".yaml",
  ".env.example",
  ".prisma",
  ".graphql",
  ".gql",
  ".sql",
  ".toml",
]);

// ─────────────────────────────────────────────
// أسماء ملفات مستثناة
// ─────────────────────────────────────────────
const EXCLUDED_FILE_PATTERNS = [
  /^package-lock\.json$/,
  /^yarn\.lock$/,
  /^pnpm-lock\.yaml$/,
  /^bun\.lockb?$/,
  /^composer\.lock$/,
  /^Gemfile\.lock$/,
  /\.min\.(js|css)$/,
  /\.map$/,
  /\.log$/,
  /^\.DS_Store$/,
  /\.bak$/,
  /\.backup$/,
  /\.old$/,
  /\.orig$/,
  /~$/,
  /^bundle\.txt$/,
  /^bundle\.part\d+\.txt$/,
  /\.(png|jpe?g|gif|webp|svg|ico|bmp|tiff)$/i,
  /\.(woff2?|ttf|otf|eot)$/i,
  /\.(mp4|mp3|wav|ogg|webm|mov|avi|mkv)$/i,
  /\.(zip|tar|gz|rar|7z|pdf|docx?|xlsx?|pptx?)$/i,
  /\.(exe|dll|so|dylib|bin|wasm)$/i,
];

if (INCLUDE_LOCK) {
  // اسمح بملفات القفل
  const lockIdx = EXCLUDED_FILE_PATTERNS.findIndex((r) =>
    /package-lock/.test(r.source)
  );
  if (lockIdx >= 0) EXCLUDED_FILE_PATTERNS.splice(lockIdx, 1);
}

// ─────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────
function shouldSkipDir(name) {
  return EXCLUDED_DIRS.has(name) || name.startsWith(".");
}

function shouldSkipFile(name) {
  return EXCLUDED_FILE_PATTERNS.some((re) => re.test(name));
}

function isAllowedFile(name) {
  // اسمح بملفات بدون امتداد لكن أسماؤها معروفة
  const bare = [
    "Dockerfile",
    "Makefile",
    "Procfile",
    ".env.example",
    ".env.sample",
    ".env.template",
    "tsconfig.json",
    "vite.config.ts",
    "vite.config.js",
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
  ];
  if (bare.includes(name)) return true;

  const ext = path.extname(name).toLowerCase();
  return ALLOWED_EXTS.has(ext);
}

// ─────────────────────────────────────────────
// ضغط الكود (حذف تعليقات + أسطر فاضية)
// ─────────────────────────────────────────────
function minify(code, ext) {
  // لا تضغط ملفات معينة
  if ([".md", ".mdx", ".json", ".yml", ".yaml", ".sql"].includes(ext)) {
    // JSON لازم يفضل صالح — نضغط بس الأسطر الفاضية
    return code
      .split("\n")
      .filter((l) => l.trim() !== "")
      .join("\n");
  }

  // احفظ الـ strings/templates مؤقتاً
  const store = [];
  const keep = (m) => {
    store.push(m);
    return `\u0000${store.length - 1}\u0000`;
  };

  code = code.replace(/`(?:\\.|[^`\\])*`/gs, keep);
  code = code.replace(/"(?:\\.|[^"\\])*"/gs, keep);
  code = code.replace(/'(?:\\.|[^'\\])*'/gs, keep);
  code = code.replace(/\/(?:\\.|\[[^\]]*\]|[^\/\\\n])+\/[gimsuy]*/g, keep);

  // احذف التعليقات
  code = code.replace(/\/\*[\s\S]*?\*\//g, "");
  code = code.replace(/(^|[^:\/])\/\/.*$/gm, "$1");

  // نظّف المسافات
  code = code
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .filter((l) => l.trim() !== "")
    .join("\n");

  // رجّع الـ strings
  code = code.replace(/\u0000(\d+)\u0000/g, (_, i) => store[+i]);

  return code;
}

// ─────────────────────────────────────────────
// المشي على الشجرة
// ─────────────────────────────────────────────
function walk(dir, root, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(root, full).replace(/\\/g, "/");

    if (e.isDirectory()) {
      if (shouldSkipDir(e.name)) continue;
      walk(full, root, files);
    } else if (e.isFile()) {
      if (shouldSkipFile(e.name)) continue;
      if (!isAllowedFile(e.name)) continue;
      files.push({ rel, full });
    }
  }
  return files;
}

// ─────────────────────────────────────────────
// البناء
// ─────────────────────────────────────────────
function main() {
  const root = process.cwd();
  const allFiles = walk(root, root);

  // رتب: باك اند / سيرفر الأول، بعدين الواجهة، بعدين الكونفيج
  const order = (f) => {
    const p = f.rel.toLowerCase();
    if (p.startsWith("src/")) return 0;
    if (p.startsWith("app/")) return 1;
    if (p.startsWith("pages/")) return 2;
    if (p.startsWith("components/")) return 3;
    if (p.startsWith("lib/")) return 4;
    if (p.startsWith("server/") || p.startsWith("api/")) return 5;
    if (p.includes("config") || p.endsWith(".json")) return 8;
    if (p.endsWith(".md")) return 9;
    return 6;
  };
  allFiles.sort((a, b) => order(a) - order(b) || a.rel.localeCompare(b.rel));

  const header =
    `// ============================================================\n` +
    `// PROJECT BUNDLE — generated ${new Date().toISOString()}\n` +
    `// Root         : ${root}\n` +
    `// Files        : ${allFiles.length}\n` +
    `// Mode         : ${MINIFY ? "MINIFIED" : "RAW"}\n` +
    `// ============================================================\n`;

  const chunks = [];
  chunks.push({ name: "header", size: header.length, text: header });

  for (const f of allFiles) {
    let content;
    try {
      content = fs.readFileSync(f.full, "utf8");
    } catch (err) {
      content = `// ⚠️ could not read: ${err.message}`;
    }
    const ext = path.extname(f.full).toLowerCase();
    if (MINIFY) content = minify(content, ext);

    const block = `\n\n// ===== FILE: ${f.rel} =====\n` + `${content}\n`;
    chunks.push({ name: f.rel, size: block.length, text: block });
  }

  // ── لو تقسيم مطلوب ──
  if (SPLIT_BYTES > 0) {
    let partIdx = 1;
    let cur = header;
    const written = [];

    const flush = () => {
      const name = OUT.replace(/\.txt$/, "") + `.part${partIdx}.txt`;
      fs.writeFileSync(name, cur, "utf8");
      written.push({ name, size: cur.length });
      partIdx++;
      cur = `// ===== PART ${partIdx} (continued) =====\n`;
    };

    for (const c of chunks) {
      if (c.name === "header") continue;
      if (
        Buffer.byteLength(cur, "utf8") + Buffer.byteLength(c.text, "utf8") >
        SPLIT_BYTES
      ) {
        flush();
      }
      cur += c.text;
    }
    if (cur.trim()) {
      const name = OUT.replace(/\.txt$/, "") + `.part${partIdx}.txt`;
      fs.writeFileSync(name, cur, "utf8");
      written.push({ name, size: cur.length });
    }

    let totalKB = 0;
    console.log("✅ Bundle split created:");
    for (const w of written) {
      totalKB += w.size / 1024;
      console.log(`   📄 ${w.name}  (${(w.size / 1024).toFixed(2)} KB)`);
    }
    console.log(
      `   📦 Total: ${totalKB.toFixed(2)} KB across ${written.length} parts`
    );
    console.log(`   📁 Files: ${allFiles.length}`);
    return;
  }

  // ── ملف واحد ──
  const final = chunks.map((c) => c.text).join("");
  fs.writeFileSync(OUT, final, "utf8");
  const bytes = fs.statSync(OUT).size;

  console.log("✅ Bundle created:", OUT);
  console.log("   Files bundled :", allFiles.length);
  console.log("   Total size    :", (bytes / 1024).toFixed(2), "KB");
  console.log("   Mode          :", MINIFY ? "MINIFIED" : "RAW");

  // قائمة سريعة بأول 30 ملف للتأكد
  console.log("\n   Included (first 30):");
  allFiles.slice(0, 30).forEach((f) => console.log("     •", f.rel));
  if (allFiles.length > 30) {
    console.log(`     ... and ${allFiles.length - 30} more`);
  }
}

main();
