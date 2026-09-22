// make-bundle.cjs
// شغله بالأمر: node make-bundle.cjs
// هيطلع ملف bundle.js فيه كل الأكواد النصية من المشروع

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "bundle.js");

// مجلدات مستبعدة افتراضياً لتقليل الحجم
const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  ".cache",
  ".vercel",
  ".idea",
  ".vscode",
  ".turbo",
  ".parcel-cache",
]);

// ملفات مستبعدة (أقفال + بيئة + المخرج نفسه)
const EXCLUDE_FILES = new Set([
  "bundle.js",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
]);

function isExcludedFile(name) {
  if (EXCLUDE_FILES.has(name)) return true;
  // أي ملف يبدأ بـ .env.
  if (name.startsWith(".env.")) return true;
  return false;
}

function isBinary(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const len = Math.min(buf.length, 8000);
    for (let i = 0; i < len; i++) {
      if (buf[i] === 0) return true;
    }
    return false;
  } catch {
    return true;
  }
}

function walk(dir, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(full, files);
    } else if (entry.isFile()) {
      if (isExcludedFile(entry.name)) continue;
      if (full === OUTPUT) continue;
      files.push(full);
    }
  }
  return files;
}

function main() {
  const allFiles = walk(ROOT);
  const parts = [];
  const skippedBinary = [];

  parts.push(
    `/* ============================================================ */`
  );
  parts.push(`/* BUNDLE GENERATED AT: ${new Date().toISOString()} */`);
  parts.push(`/* ROOT: ${ROOT} */`);
  parts.push(`/* TOTAL FILES: ${allFiles.length} */`);
  parts.push(
    `/* ============================================================ */\n`
  );

  for (const file of allFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");

    if (isBinary(file)) {
      skippedBinary.push(rel);
      continue;
    }

    let content = "";
    try {
      content = fs.readFileSync(file, "utf8");
    } catch (e) {
      content = `/* ERROR READING FILE: ${e.message} */`;
    }

    parts.push(`\n/* ===== FILE: ${rel} ===== */\n`);
    parts.push(content);
    parts.push(`\n/* ===== END FILE: ${rel} ===== */\n`);
  }

  if (skippedBinary.length) {
    parts.push(`\n/* ===== SKIPPED BINARY FILES ===== */\n`);
    for (const f of skippedBinary) {
      parts.push(`/* BINARY: ${f} */\n`);
    }
  }

  const output = parts.join("");
  fs.writeFileSync(OUTPUT, output, "utf8");

  console.log(`✅ تم إنشاء: ${OUTPUT}`);
  console.log(
    `📦 عدد الملفات النصية: ${allFiles.length - skippedBinary.length}`
  );
  console.log(`⏭️ ملفات باينري تم تخطيها: ${skippedBinary.length}`);
  if (skippedBinary.length) {
    console.log("   " + skippedBinary.join("\n   "));
  }
}

main();
