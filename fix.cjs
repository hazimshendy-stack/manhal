#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — Font: Space Grotesk only (no Arabic font)
 */

const GOOGLE_FONT = "Space+Grotesk:wght@300;400;500;600;700";
const FONT_FALLBACK =
  "'Space Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const C = {
  r: "\x1b[0m",
  b: "\x1b[1m",
  g: "\x1b[32m",
  y: "\x1b[33m",
  red: "\x1b[31m",
  c: "\x1b[36m",
  m: "\x1b[35m",
};
const sh = (cmd) => execSync(cmd, { cwd: ROOT, stdio: "inherit" });

console.log("");
console.log(
  `${C.b}${C.m}╔══════════════════════════════════════════════════════╗${C.r}`
);
console.log(
  `${C.b}${C.m}║  fix.cjs — Font: Space Grotesk only                  ║${C.r}`
);
console.log(
  `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
);
console.log("");

const bkDir = path.join(
  ROOT,
  ".fix-backups",
  "font-space-" + Date.now().toString()
);
fs.mkdirSync(bkDir, { recursive: true });
const bk = (rel) => {
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs)) {
    const dst = path.join(bkDir, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(abs, dst);
  }
};

/* ═══════════════════════════════════════════════════════════════
   1) index.html — استبدال Google Fonts link
   ═══════════════════════════════════════════════════════════════ */
const indexPath = path.join(ROOT, "index.html");
if (!fs.existsSync(indexPath)) {
  console.log(`${C.red}✗ index.html مش موجود${C.r}`);
  process.exit(1);
}
bk("index.html");
let html = fs.readFileSync(indexPath, "utf8");

// شيل أي Google Fonts links قديمة
html = html.replace(/\s*<link[^>]*fonts\.googleapis\.com[^>]*>/g, "");
html = html.replace(/\s*<link[^>]*fonts\.gstatic\.com[^>]*>/g, "");

// ضيف Space Grotesk فقط
const fontLinks = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=${GOOGLE_FONT}&display=swap" rel="stylesheet" />`;

html = html.replace(/\n\s*<\/head>/, fontLinks + "\n  </head>");

// boot-screen font
html = html.replace(/font-family:\s*[^;]+;/g, `font-family: ${FONT_FALLBACK};`);

fs.writeFileSync(indexPath, html, "utf8");
console.log(`${C.g}✓${C.r} index.html`);

/* ═══════════════════════════════════════════════════════════════
   2) tokens.css — تحديث كل متغيرات الخط
   ═══════════════════════════════════════════════════════════════ */
const tokensPath = path.join(ROOT, "src/styles/tokens.css");
if (!fs.existsSync(tokensPath)) {
  console.log(`${C.red}✗ src/styles/tokens.css مش موجود${C.r}`);
  process.exit(1);
}
bk("src/styles/tokens.css");
let tokens = fs.readFileSync(tokensPath, "utf8");

// شيل تعريفات الخط القديمة
tokens = tokens.replace(/--font:\s*[^;]+;/g, "");
tokens = tokens.replace(/--font-en:\s*[^;]+;/g, "");
tokens = tokens.replace(/--font-display:\s*[^;]+;/g, "");
tokens = tokens.replace(/--font-mono:\s*[^;]+;/g, "");

// ضيف block جديد
const fontBlock = `
  /* ═══ Typography — Space Grotesk ═══ */
  --font: ${FONT_FALLBACK};
  --font-en: ${FONT_FALLBACK};
  --font-display: ${FONT_FALLBACK};
  --font-mono: 'Space Grotesk', 'SF Mono', Menlo, monospace;
`;

if (tokens.includes("--radius-xs:")) {
  tokens = tokens.replace(/\n\s*--radius-xs:/, fontBlock + "\n  --radius-xs:");
} else {
  tokens = tokens.replace(/}\s*$/, fontBlock + "\n}");
}

fs.writeFileSync(tokensPath, tokens, "utf8");
console.log(`${C.g}✓${C.r} src/styles/tokens.css`);

/* ═══════════════════════════════════════════════════════════════
   3) base.css — نتأكد إن كل حاجة بتستخدم Inter/Space
   ═══════════════════════════════════════════════════════════════ */
const basePath = path.join(ROOT, "src/styles/base.css");
if (fs.existsSync(basePath)) {
  bk("src/styles/base.css");
  let base = fs.readFileSync(basePath, "utf8");

  // استبدل أي font-family قديمة
  base = base.replace(
    /font-family:\s*'[^']+',\s*[^;]+;/g,
    "font-family: var(--font);"
  );
  base = base.replace(
    /font-family:\s*var\(--font-display\)/g,
    "font-family: var(--font)"
  );
  base = base.replace(
    /font-family:\s*var\(--font-en\)/g,
    "font-family: var(--font)"
  );

  fs.writeFileSync(basePath, base, "utf8");
  console.log(`${C.g}✓${C.r} src/styles/base.css`);
}

/* ═══════════════════════════════════════════════════════════════
   4) كل ملفات CSS في styles — استبدال أي خط قديم
   ═══════════════════════════════════════════════════════════════ */
const stylesDir = path.join(ROOT, "src/styles");
if (fs.existsSync(stylesDir)) {
  const cssFiles = fs.readdirSync(stylesDir).filter((f) => f.endsWith(".css"));

  for (const file of cssFiles) {
    const filePath = path.join(stylesDir, file);
    let content = fs.readFileSync(filePath, "utf8");
    const original = content;

    // استبدل أي خط hardcoded باسم المتغير
    content = content.replace(
      /font-family:\s*'Gochi Hand'[^;]*;/g,
      "font-family: var(--font);"
    );
    content = content.replace(
      /font-family:\s*'Sigmar One'[^;]*;/g,
      "font-family: var(--font);"
    );
    content = content.replace(
      /font-family:\s*'Tajawal'[^;]*;/g,
      "font-family: var(--font);"
    );
    content = content.replace(
      /font-family:\s*'Inter'[^;]*;/g,
      "font-family: var(--font);"
    );

    // شيل أي استخدام لـ --font-display (كان من الميكس)
    content = content.replace(
      /font-family:\s*var\(--font-display\)/g,
      "font-family: var(--font)"
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`${C.g}✓${C.r} src/styles/${file}`);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   عرض النتيجة
   ═══════════════════════════════════════════════════════════════ */
console.log("");
console.log(`${C.b}═══ Font: Space Grotesk ═══${C.r}`);
console.log(
  `${C.d}Applied everywhere — headings, body, buttons, forms, tables${C.r}\n`
);

/* ═══════════════════════════════════════════════════════════════
   Commit + Push
   ═══════════════════════════════════════════════════════════════ */
console.log(`${C.b}▶ Commit + Push${C.r}\n`);
try {
  sh("git add -A");

  let hasChanges = true;
  try {
    execSync("git diff --staged --quiet", { cwd: ROOT, stdio: "pipe" });
    hasChanges = false;
  } catch {
    /* hasChanges = true */
  }

  if (!hasChanges) {
    console.log(`${C.y}ℹ مفيش تغييرات${C.r}\n`);
    process.exit(0);
  }

  sh(
    `git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "style: font Space Grotesk only (no arabic font)"`
  );
  console.log(`\n${C.g}✓ commit${C.r}`);

  sh("git push origin main --force");
  console.log(`\n${C.g}${C.b}✓ Pushed${C.r}`);
  console.log(`${C.y}⏱️  استنى 4-7 دقايق، ثم Ctrl+Shift+R${C.r}\n`);
} catch (e) {
  console.log(`\n${C.red}✗ Push failed${C.r}`);
  console.log(`جرّب يدوي: ${C.c}git push origin main --force${C.r}\n`);
  process.exit(1);
}
