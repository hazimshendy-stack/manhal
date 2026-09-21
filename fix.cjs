#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — Bottom Nav on Desktop = exactly like Mobile
 */

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
  d: "\x1b[2m",
};
const sh = (cmd) => execSync(cmd, { cwd: ROOT, stdio: "inherit" });

/* ═══════════════════════════════════════════════════════════════
   نقرا الملف الحالي ونستبدل بلوك الـ bottom-nav فقط
   ═══════════════════════════════════════════════════════════════ */

const desktopPath = path.join(ROOT, "src/styles/desktop.css");

if (!fs.existsSync(desktopPath)) {
  console.log(`${C.red}✗ src/styles/desktop.css مش موجود${C.r}`);
  console.log(`${C.y}شغّل fix.cjs القديم الأول، بعدين شغّل ده${C.r}`);
  process.exit(1);
}

const bkDir = path.join(
  ROOT,
  ".fix-backups",
  "bottomnav-" + Date.now().toString()
);
fs.mkdirSync(bkDir, { recursive: true });
fs.copyFileSync(desktopPath, path.join(bkDir, "desktop.css"));

let content = fs.readFileSync(desktopPath, "utf8");

/* ═══════════════════════════════════════════════════════════════
   استبدل بلوك الـ bottom-nav القديم (العائم)
   ═══════════════════════════════════════════════════════════════ */

// ابحث عن بداية ونهاية بلوك bottom-nav في media query (min-width: 901px)
const startMarker = "BOTTOM NAV — Still visible on desktop";
const endMarker = "SIDEBAR — Drawer, works on desktop too";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log(`${C.y}⚠ مقدرتش ألاقي البلوك — بحاول طريقة تانية${C.r}`);
  // طريقة احتياطية: شيل أي block فيه .bottom-nav من desktop.css وضيف الجديد
  content = content.replace(
    /\/\*[^*]*BOTTOM NAV[^*]*\*\/[\s\S]*?(?=\/\*[^*]*SIDEBAR)/,
    `/* ═══════════════════════════════════════════════════════════
     BOTTOM NAV — Exactly like mobile
     ═══════════════════════════════════════════════════════════ */

  `
  );
} else {
  const beforeBlock = content.substring(0, startIdx - 15);
  const afterBlock = content.substring(endIdx);

  const newBlock = `/* ═══════════════════════════════════════════════════════════
     BOTTOM NAV — Exactly like mobile (full-width, at bottom)
     ═══════════════════════════════════════════════════════════ */

  /* Override mobile styles completely */
  .bottom-nav {
    display: flex !important;
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    transform: none !important;
    width: 100% !important;
    max-width: 100% !important;
    height: calc(var(--bottom-nav-h) + var(--safe-bottom)) !important;
    padding-bottom: var(--safe-bottom) !important;
    margin: 0 !important;
    background: var(--c-white) !important;
    border-top: 1px solid var(--c-line) !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: none !important;
    border-radius: 0 !important;
    box-shadow: 0 -2px 12px rgba(21, 26, 69, 0.06) !important;
    z-index: 60 !important;
    overflow: visible !important;
  }

  .bottom-nav__inner {
    display: flex !important;
    align-items: stretch !important;
    justify-content: space-around !important;
    width: 100% !important;
    max-width: 100% !important;
    padding-inline: 8px !important;
    gap: 0 !important;
  }

  .bottom-nav__item {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    padding: 10px 8px 8px !important;
    color: var(--c-ink-muted) !important;
    font-size: 0.78rem !important;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    transition: color 0.15s !important;
    text-decoration: none !important;
    cursor: pointer !important;
    font-family: inherit !important;
    max-width: 140px !important;
  }

  .bottom-nav__item:active {
    background: var(--c-off-white) !important;
  }

  .bottom-nav__item.is-active {
    color: var(--c-navy) !important;
    background: transparent !important;
  }

  .bottom-nav__item.is-active::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: 28px !important;
    height: 3px !important;
    background: var(--c-navy) !important;
    border-radius: 0 0 4px 4px !important;
    display: block !important;
  }

  .bottom-nav__icon {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    color: inherit !important;
  }

  .bottom-nav__icon svg {
    width: 24px !important;
    height: 24px !important;
    display: block !important;
  }

  .bottom-nav__label {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 100% !important;
    font-size: 0.78rem !important;
  }

  .bottom-nav__badge {
    position: absolute !important;
    top: 6px !important;
    right: 50% !important;
    margin-right: -22px !important;
    min-width: 18px !important;
    height: 18px !important;
    padding: 0 5px !important;
    border-radius: 999px !important;
    background: var(--c-red) !important;
    color: #fff !important;
    font-size: 0.65rem !important;
    display: grid !important;
    place-items: center !important;
    border: 2px solid var(--c-white) !important;
  }

  /* Make room for bottom nav */
  .app-main {
    padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 12px) !important;
  }

  /* ═══════════════════════════════════════════════════════════
     FOOTER — stop padding above bottom nav
     (bottom nav is now fixed at the very bottom)
     ═══════════════════════════════════════════════════════════ */

  .footer {
    padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 40px) !important;
  }

  `;

  content = beforeBlock + newBlock + afterBlock;
}

fs.writeFileSync(desktopPath, content, "utf8");
console.log(`${C.g}✓${C.r} src/styles/desktop.css — bottom nav updated`);

/* ═══════════════════════════════════════════════════════════════
   Commit + Push
   ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(
  `${C.b}${C.m}╔══════════════════════════════════════════════════════╗${C.r}`
);
console.log(
  `${C.b}${C.m}║  Bottom Nav — Desktop = Mobile                       ║${C.r}`
);
console.log(
  `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
);
console.log("");

console.log(`${C.b}▶ Commit + Push${C.r}\n`);
try {
  sh("git add -A");
  let hasChanges = true;
  try {
    execSync("git diff --staged --quiet", { cwd: ROOT, stdio: "pipe" });
    hasChanges = false;
  } catch {
    /* */
  }
  if (!hasChanges) {
    console.log(`${C.y}ℹ No changes${C.r}\n`);
    process.exit(0);
  }

  sh(
    'git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "style: bottom nav on desktop = same as mobile"'
  );
  console.log(`\n${C.g}✓ commit${C.r}`);

  sh("git push origin main --force");
  console.log(`\n${C.g}${C.b}✓ Pushed${C.r}`);
  console.log(`${C.y}⏱️  Wait 4-7 min → Ctrl+Shift+R${C.r}\n`);
} catch {
  console.log(`\n${C.red}✗ Push failed${C.r}`);
  console.log(`  ${C.c}git push origin main --force${C.r}\n`);
  process.exit(1);
}
