#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — Mixed Fonts
 * - Sigmar One → Headlines, Brand, Hero, Display
 * - Inter → Body, Forms, Tables, everything readable
 */

const DISPLAY_FONT = "Sigmar One";
const DISPLAY_GOOGLE = "Sigmar+One";
const BODY_FONT = "Inter";
const BODY_GOOGLE = "Inter:wght@400;500;600;700;800";
const DISPLAY_FALLBACK =
  "'Sigmar One', 'Gochi Hand', 'Comic Sans MS', cursive, system-ui, sans-serif";
const BODY_FALLBACK =
  "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

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
  `${C.b}${C.m}║  fix.cjs — Mixed Fonts                               ║${C.r}`
);
console.log(
  `${C.b}${C.m}║  Display: Sigmar One  +  Body: Inter                 ║${C.r}`
);
console.log(
  `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
);
console.log("");

const bkDir = path.join(
  ROOT,
  ".fix-backups",
  "font-mix-" + Date.now().toString()
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
   1) index.html — استيراد الخطين
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

// ضيف الخطين الجداد
const fontLinks = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=${DISPLAY_GOOGLE}&family=${BODY_GOOGLE}&display=swap" rel="stylesheet" />`;

html = html.replace(/\n\s*<\/head>/, fontLinks + "\n  </head>");

// boot-screen font
html = html.replace(
  /font-family:\s*[^;]+;/g,
  `font-family: ${DISPLAY_FALLBACK};`
);

fs.writeFileSync(indexPath, html, "utf8");
console.log(`${C.g}✓${C.r} index.html`);

/* ═══════════════════════════════════════════════════════════════
   2) tokens.css — متغيرين منفصلين
   ═══════════════════════════════════════════════════════════════ */
const tokensPath = path.join(ROOT, "src/styles/tokens.css");
if (!fs.existsSync(tokensPath)) {
  console.log(`${C.red}✗ src/styles/tokens.css مش موجود${C.r}`);
  process.exit(1);
}
bk("src/styles/tokens.css");
let tokens = fs.readFileSync(tokensPath, "utf8");

// امسح أي تعريفات قديمة للخط
tokens = tokens.replace(/--font:\s*[^;]+;/g, "");
tokens = tokens.replace(/--font-en:\s*[^;]+;/g, "");
tokens = tokens.replace(/--font-display:\s*[^;]+;/g, "");
tokens = tokens.replace(/--font-mono:\s*[^;]+;/g, "");

// ضيفهم في مكان مناسب — بعد قسم الألوان
const fontBlock = `
  /* ═══ Typography ═══ */
  --font: ${BODY_FALLBACK};
  --font-en: ${BODY_FALLBACK};
  --font-display: ${DISPLAY_FALLBACK};
  --font-mono: 'JetBrains Mono', 'SF Mono', Menlo, monospace;
`;

// ضيفهم قبل --radius-xs
if (tokens.includes("--radius-xs:")) {
  tokens = tokens.replace(/\n\s*--radius-xs:/, fontBlock + "\n  --radius-xs:");
} else {
  // احتياطي: ضيفهم جوه :root قبل القوس الأخير
  tokens = tokens.replace(/}\s*$/, fontBlock + "\n}");
}

fs.writeFileSync(tokensPath, tokens, "utf8");
console.log(`${C.g}✓${C.r} src/styles/tokens.css`);

/* ═══════════════════════════════════════════════════════════════
   3) base.css — h1-h6 و brand على Display font
   ═══════════════════════════════════════════════════════════════ */
const basePath = path.join(ROOT, "src/styles/base.css");
if (fs.existsSync(basePath)) {
  bk("src/styles/base.css");
  let base = fs.readFileSync(basePath, "utf8");

  // تأكد إن headings تستخدم --font-display
  if (!base.includes("--font-display")) {
    // استبدل أي font-family: var(--font) في headings
    base = base.replace(
      /h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[^}]*font-family:\s*var\(--font\)[^}]*\}/,
      `h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  color: var(--c-ink);
  font-weight: 400;
  line-height: 1.3;
  margin: 0;
  letter-spacing: 0;
}`
    );
  }

  // أضف قاعدة عامة آمنة في آخر الملف
  const headingRule = `

/* ═══ Display Font for Headings ═══ */
h1, h2, h3, h4, h5, h6,
.home-hero__title,
.home-join-cta__title,
.admin-welcome__name,
.section-head h2,
.brand,
.footer__brand,
.onboarding-header__title,
.modal__head h3,
.login-card h1,
.login-card h2 {
  font-family: var(--font-display);
  font-weight: 400;
  letter-spacing: 0;
}

/* نصوص عادية + أرقام تفضل Inter */
.stat__value,
.league-table__name,
.member-card__name,
table.data,
.card__title,
.card__meta,
button, input, select, textarea,
.btn, .chip, .badge, .sidebar__link, .nav-action {
  font-family: var(--font);
}
`;
  if (!base.includes("Display Font for Headings")) {
    base += headingRule;
  }

  fs.writeFileSync(basePath, base, "utf8");
  console.log(`${C.g}✓${C.r} src/styles/base.css`);
} else {
  console.log(`${C.y}⚠${C.r} base.css مش موجود`);
}

/* ═══════════════════════════════════════════════════════════════
   4) navbar.css — brand
   ═══════════════════════════════════════════════════════════════ */
const navPath = path.join(ROOT, "src/styles/navbar.css");
if (fs.existsSync(navPath)) {
  bk("src/styles/navbar.css");
  let nav = fs.readFileSync(navPath, "utf8");
  nav = nav.replace(
    /\.brand\s*\{[^}]*\}/,
    `.brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--c-paper);
  transition: opacity 0.15s;
  letter-spacing: 0.02em;
}`
  );
  fs.writeFileSync(navPath, nav, "utf8");
  console.log(`${C.g}✓${C.r} src/styles/navbar.css`);
}

/* ═══════════════════════════════════════════════════════════════
   5) footer.css — brand
   ═══════════════════════════════════════════════════════════════ */
const footPath = path.join(ROOT, "src/styles/footer.css");
if (fs.existsSync(footPath)) {
  bk("src/styles/footer.css");
  let foot = fs.readFileSync(footPath, "utf8");
  foot = foot.replace(
    /\.footer__brand\s*\{[^}]*\}/,
    `.footer__brand {
  font-family: var(--font-display);
  font-size: 1.65rem;
  color: var(--c-paper);
  letter-spacing: 0.02em;
}`
  );
  fs.writeFileSync(footPath, foot, "utf8");
  console.log(`${C.g}✓${C.r} src/styles/footer.css`);
}

/* ═══════════════════════════════════════════════════════════════
   6) home.css — hero title
   ═══════════════════════════════════════════════════════════════ */
const homePath = path.join(ROOT, "src/styles/home.css");
if (fs.existsSync(homePath)) {
  bk("src/styles/home.css");
  let home = fs.readFileSync(homePath, "utf8");
  // ضمان إن الـ hero title بيستخدم display
  if (!home.includes(".home-hero__title") || !home.includes("font-display")) {
    home = home.replace(
      /\.home-hero__title\s*\{([^}]*)\}/,
      `.home-hero__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 1.15;
  margin-top: 16px;
  max-width: 22ch;
  color: var(--c-navy);
  letter-spacing: 0;
}`
    );
  }
  fs.writeFileSync(homePath, home, "utf8");
  console.log(`${C.g}✓${C.r} src/styles/home.css`);
}

/* ═══════════════════════════════════════════════════════════════
   7) admin.css — welcome name
   ═══════════════════════════════════════════════════════════════ */
const adminPath = path.join(ROOT, "src/styles/admin.css");
if (fs.existsSync(adminPath)) {
  bk("src/styles/admin.css");
  let admin = fs.readFileSync(adminPath, "utf8");
  admin = admin.replace(
    /\.admin-welcome__name\s*\{[^}]*\}/,
    `.admin-welcome__name {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  color: var(--c-navy);
  line-height: 1.25;
  word-break: break-word;
  margin: 0;
  letter-spacing: 0;
}`
  );
  fs.writeFileSync(adminPath, admin, "utf8");
  console.log(`${C.g}✓${C.r} src/styles/admin.css`);
}

/* ═══════════════════════════════════════════════════════════════
   8) onboarding.css — title
   ═══════════════════════════════════════════════════════════════ */
const obPath = path.join(ROOT, "src/styles/onboarding.css");
if (fs.existsSync(obPath)) {
  bk("src/styles/onboarding.css");
  let ob = fs.readFileSync(obPath, "utf8");
  if (!ob.includes("font-display")) {
    const obRule = `

/* Display font for onboarding headings */
.onboarding-header__title,
.onboarding-card__title,
.onboarding-cta {
  font-family: var(--font-display);
  letter-spacing: 0;
}
`;
    ob += obRule;
  }
  fs.writeFileSync(obPath, ob, "utf8");
  console.log(`${C.g}✓${C.r} src/styles/onboarding.css`);
}

/* ═══════════════════════════════════════════════════════════════
   9) login.css — headings
   ═══════════════════════════════════════════════════════════════ */
const loginPath = path.join(ROOT, "src/styles/login.css");
if (fs.existsSync(loginPath)) {
  bk("src/styles/login.css");
  let login = fs.readFileSync(loginPath, "utf8");
  if (!login.includes("font-display")) {
    login += `

/* Display font for login headings */
.login-label,
.login-submit {
  font-family: var(--font);
}

.change-password-notice strong {
  font-family: var(--font-display);
  font-weight: 400;
  letter-spacing: 0;
}
`;
  }
  fs.writeFileSync(loginPath, login, "utf8");
  console.log(`${C.g}✓${C.r} src/styles/login.css`);
}

/* ═══════════════════════════════════════════════════════════════
   10) member-card.css — اسم العضو يفضل Inter
   ═══════════════════════════════════════════════════════════════ */
const mcPath = path.join(ROOT, "src/styles/member-card.css");
if (fs.existsSync(mcPath)) {
  bk("src/styles/member-card.css");
  let mc = fs.readFileSync(mcPath, "utf8");
  mc += `

/* Member name uses body font for readability */
.member-card__name,
.member-card__role,
.member-card__team-tag,
.member-card__stat-value,
.member-card__stat-label {
  font-family: var(--font);
}
`;
  fs.writeFileSync(mcPath, mc, "utf8");
  console.log(`${C.g}✓${C.r} src/styles/member-card.css`);
}

/* ═══════════════════════════════════════════════════════════════
   11) chat.css — chat messages تفضل Inter
   ═══════════════════════════════════════════════════════════════ */
const chatPath = path.join(ROOT, "src/styles/chat.css");
if (fs.existsSync(chatPath)) {
  bk("src/styles/chat.css");
  let chat = fs.readFileSync(chatPath, "utf8");
  chat += `

/* Chat text uses body font for readability */
.chat-message__bubble,
.chat-composer__input,
.chat-conv__name,
.chat-conv__preview,
.user-picker__name,
.user-picker__email {
  font-family: var(--font);
}
`;
  fs.writeFileSync(chatPath, chat, "utf8");
  console.log(`${C.g}✓${C.r} src/styles/chat.css`);
}

/* ═══════════════════════════════════════════════════════════════
   عرض النتيجة
   ═══════════════════════════════════════════════════════════════ */
console.log("");
console.log(`${C.b}═══ Configuration ═══${C.r}`);
console.log(
  `  ${C.c}Display${C.r}: ${DISPLAY_FONT}    → عناوين + براند + hero`
);
console.log(
  `  ${C.c}Body${C.r}:    ${BODY_FONT}         → نصوص + أزرار + جداول + chat`
);
console.log("");

/* ═══════════════════════════════════════════════════════════════
   12) Commit + Push
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
    `git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "style: mixed fonts (Sigmar One display + Inter body)"`
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
