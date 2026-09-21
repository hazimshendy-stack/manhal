#!/usr/bin/env node
/* eslint-disable no-console */
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
const files = {};
const F = (p, c) => {
  files[p.replace(/\\/g, "/")] = c.replace(/^\n/, "");
};

/* ═══════════════ 1. INDEX.HTML ═══════════════ */
F(
  "index.html",
  `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
    <meta name="theme-color" content="#151A45" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="sbapiaryy" />
    <meta name="description" content="Resala STEM Sub Branches — Official Platform" />
    <title>sbapiaryy</title>
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="manifest" href="./manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Gochi+Hand&display=swap" rel="stylesheet" />
    <style>
      html, body { margin: 0; padding: 0; background: #151A45; }
      #root { min-height: 100vh; }
      .boot-screen {
        position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
        background: #151A45; color: #fff; font-family: 'Gochi Hand', cursive;
        flex-direction: column; gap: 20px; z-index: 9999; transition: opacity 0.3s ease;
      }
      .boot-screen.hidden { opacity: 0; pointer-events: none; }
      .boot-screen__name { font-size: 1.5rem; font-weight: 400; }
      .boot-screen__hint { font-size: 0.9rem; color: #D5DAF0; opacity: 0.7; }
    </style>
    <script>
      (function (l) {
        if (l.search[1] === '/') {
          var decoded = l.search.slice(1).split('&').map(function (s) { return s.replace(/~and~/g, '&'); }).join('?');
          window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
        }
      })(window.location);
    </script>
  </head>
  <body>
    <div id="boot">
      <div class="boot-screen">
        <div class="boot-screen__name">sbapiaryy</div>
        <div class="boot-screen__hint">Loading...</div>
      </div>
    </div>
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
    <script>
      setTimeout(function () {
        var boot = document.querySelector('.boot-screen');
        if (boot) boot.classList.add('hidden');
        setTimeout(function () {
          var bootEl = document.getElementById('boot');
          if (bootEl) bootEl.remove();
        }, 350);
      }, 800);
    </script>
  </body>
</html>`
);

/* ═══════════════ 2. TOKENS.CSS ═══════════════ */
F(
  "src/styles/tokens.css",
  `:root {
  --c-navy: #151A45;
  --c-navy-soft: #1B2156;
  --c-navy-2: #232A66;
  --c-navy-3: #2E3680;
  --c-red: #C1272D;
  --c-red-soft: #A01F24;
  --c-red-tint: #FEE2E2;
  --c-white: #FFFFFF;
  --c-off-white: #FAFBFD;
  --c-line: #E3E6F0;
  --c-line-mid: #C9CFE1;
  --c-ink: #151A45;
  --c-ink-soft: #3A4176;
  --c-ink-muted: #6B7299;
  --c-paper: #FFFFFF;
  --c-paper-soft: #D5DAF0;
  --c-paper-muted: #8891BE;
  --c-green: #16A34A;
  --c-green-soft: #DCFCE7;
  --c-green-text: #166534;
  --c-amber: #D97706;
  --c-amber-soft: #FEF3C7;
  --c-amber-text: #92400E;
  --c-blue: #2563EB;
  --c-blue-soft: #DBEAFE;
  --c-blue-text: #1E40AF;
  --c-purple: #7C3AED;
  --c-purple-soft: #EDE9FE;
  --c-purple-text: #5B21B6;
  --c-pink: #EC4899;
  --c-pink-soft: #FCE7F3;
  --c-pink-text: #9D174D;
  --c-cyan: #0891B2;
  --c-cyan-soft: #CFFAFE;
  --c-cyan-text: #155E75;
  --c-orange: #EA580C;
  --c-orange-soft: #FFEDD5;
  --c-orange-text: #9A3412;

  --font: 'Gochi Hand', 'Comic Sans MS', cursive, system-ui, sans-serif;
  --font-en: 'Gochi Hand', 'Comic Sans MS', cursive, system-ui, sans-serif;

  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 48px;
  --space-9: 64px;

  --container: 1280px;
  --navbar-h: 68px;
  --sidebar-w: 280px;
  --sidebar-w-mob: 290px;
  --bottom-nav-h: 68px;

  --shadow-xs: 0 1px 2px rgba(21, 26, 69, 0.04);
  --shadow-sm: 0 2px 8px rgba(21, 26, 69, 0.06);
  --shadow: 0 8px 24px rgba(21, 26, 69, 0.10);
  --shadow-lg: 0 20px 60px -20px rgba(21, 26, 69, 0.20);
  --shadow-red: 0 8px 24px -8px rgba(193, 39, 45, 0.4);

  --ease: cubic-bezier(0.2, 0.7, 0.3, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}`
);

/* ═══════════════ 3. BASE.CSS ═══════════════ */
F(
  "src/styles/base.css",
  `*, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html { scroll-behavior: smooth; direction: ltr; }
html, body { margin: 0; padding: 0; min-height: 100%; overscroll-behavior-y: none; }
body {
  font-family: var(--font);
  font-size: 16px;
  line-height: 1.7;
  color: var(--c-ink);
  background: var(--c-off-white);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 400;
  direction: ltr;
}
#root { min-height: 100vh; min-height: 100dvh; }
h1, h2, h3, h4, h5, h6 { font-family: var(--font); color: var(--c-ink); font-weight: 400; line-height: 1.3; margin: 0; }
h1 { font-size: 2rem; }
h2 { font-size: 1.6rem; }
h3 { font-size: 1.25rem; }
h4 { font-size: 1.05rem; }
@media (min-width: 640px) { h1 { font-size: 2.4rem; } h2 { font-size: 1.85rem; } h3 { font-size: 1.4rem; } }
p { margin: 0; }
a { color: inherit; text-decoration: none; -webkit-tap-highlight-color: transparent; }
button, input, select, textarea { font: inherit; color: inherit; -webkit-tap-highlight-color: transparent; }
button { cursor: pointer; border: none; background: none; padding: 0; }
img, svg, video { display: block; max-width: 100%; height: auto; }
ul, ol { margin: 0; padding: 0; list-style: none; }
::selection { background: var(--c-navy); color: #fff; }
@media (min-width: 901px) {
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: var(--c-off-white); }
  ::-webkit-scrollbar-thumb { background: var(--c-line-mid); border-radius: 999px; border: 3px solid var(--c-off-white); }
  ::-webkit-scrollbar-thumb:hover { background: var(--c-ink-muted); }
}
*:focus-visible { outline: 2px solid var(--c-red); outline-offset: 2px; border-radius: var(--radius-xs); }
button, a, .btn, .chip { touch-action: manipulation; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}`
);

/* ═══════════════ 4. LAYOUT.CSS ═══════════════ */
F(
  "src/styles/layout.css",
  `.app-shell { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; padding-top: var(--safe-top); overflow-x: hidden; }
.app-main { flex: 1; padding-bottom: var(--safe-bottom); overflow-x: hidden; }
.container { width: 100%; max-width: 1280px; margin-inline: auto; padding-inline: 20px; box-sizing: border-box; }
@media (min-width: 480px) { .container { padding-inline: 24px; } }
@media (min-width: 640px) { .container { padding-inline: 32px; } }
@media (min-width: 900px) { .container { padding-inline: 44px; } }
@media (min-width: 1280px) { .container { padding-inline: 64px; } }
.app-main > *:not(.container) { padding-inline: 20px; }
@media (min-width: 480px) { .app-main > *:not(.container) { padding-inline: 24px; } }
@media (min-width: 640px) { .app-main > *:not(.container) { padding-inline: 32px; } }
@media (min-width: 900px) { .app-main > *:not(.container) { padding-inline: 44px; } }
@media (min-width: 1280px) { .app-main > *:not(.container) { padding-inline: 64px; } }
.section { padding-block: 32px; }
.section--tight { padding-block: 22px; }
@media (min-width: 640px) { .section { padding-block: 44px; } .section--tight { padding-block: 26px; } }
.section-head { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
@media (min-width: 640px) { .section-head { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 32px; } }
.section-head__eyebrow { font-size: 0.78rem; color: var(--c-red); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
.section-head h2 { font-size: 1.5rem; }
.section-head__desc { color: var(--c-ink-muted); font-size: 0.95rem; margin-top: 8px; max-width: 62ch; line-height: 1.7; }
.grid { display: grid; gap: 18px; grid-template-columns: 1fr; }
@media (min-width: 480px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 22px; } }
.grid--wide { grid-template-columns: 1fr; }
@media (min-width: 640px) { .grid--wide { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid--wide { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); } }
.grid--narrow { grid-template-columns: repeat(2, 1fr); gap: 14px; }
@media (min-width: 640px) { .grid--narrow { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; } }
.grid--2 { grid-template-columns: 1fr; }
@media (min-width: 768px) { .grid--2 { grid-template-columns: repeat(2, 1fr); } }
.stack { display: flex; flex-direction: column; gap: 18px; }
.stack--sm { gap: 12px; }
.stack--lg { gap: 26px; }
.row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.row--between { justify-content: space-between; }
.row--gap-6 { gap: 6px; }
.row--gap-16 { gap: 16px; }
.muted { color: var(--c-ink-muted); }
.soft { color: var(--c-ink-soft); }
.small { font-size: 0.85rem; }
.tiny { font-size: 0.75rem; }
.center { text-align: center; }
.grow { flex: 1; min-width: 0; }
.nowrap { white-space: nowrap; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-5 { margin-top: 20px; }
.mt-6 { margin-top: 24px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.hide-mobile { display: none; }
@media (min-width: 768px) { .hide-mobile { display: block; } .show-mobile { display: none !important; } }`
);

/* ═══════════════ 5. NAVBAR.CSS ═══════════════ */
F(
  "src/styles/navbar.css",
  `.navbar { position: sticky; top: 0; z-index: 50; height: var(--navbar-h); display: flex; align-items: center; background: var(--c-navy); border-bottom: 1px solid var(--c-navy-2); }
.navbar__inner { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px; }
.brand { font-family: var(--font); font-size: 1.35rem; color: var(--c-paper); transition: opacity 0.15s; }
.brand:hover { opacity: 0.85; }
.nav-actions { display: flex; align-items: center; gap: 8px; }
.nav-action { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 18px; border-radius: var(--radius-sm); font-size: 0.95rem; color: var(--c-paper-soft); transition: all 0.15s; background: transparent; border: 1px solid transparent; font-family: inherit; cursor: pointer; text-decoration: none; }
.nav-action:hover { background: var(--c-navy-2); color: var(--c-paper); }
.nav-action--primary { background: var(--c-red); color: #fff; border-color: var(--c-red); }
.nav-action--primary:hover { background: var(--c-red-soft); border-color: var(--c-red-soft); color: #fff; }
.nav-action--danger { color: var(--c-red); border-color: var(--c-red); }
.nav-action--danger:hover { background: var(--c-red); color: #fff; }
.nav-action--icon { padding: 10px; min-width: 44px; min-height: 44px; position: relative; color: var(--c-paper-soft); }
.nav-action--icon svg { display: block; width: 22px; height: 22px; }
.nav-action--icon:hover { color: var(--c-paper); }
.nav-action__badge { position: absolute; top: 2px; right: 2px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: var(--c-red); color: #fff; font-size: 0.68rem; display: grid; place-items: center; border: 2px solid var(--c-navy); }
.nav-action__menu { width: 20px; height: 14px; display: flex; flex-direction: column; justify-content: space-between; }
.nav-action__menu span { display: block; height: 2px; background: currentColor; border-radius: 2px; }
@media (max-width: 900px) { .navbar { height: calc(var(--navbar-h) + var(--safe-top)); padding-top: var(--safe-top); } .brand { font-size: 1.2rem; } .nav-action { font-size: 0.9rem; padding: 9px 14px; } .nav-action--icon { padding: 9px; min-width: 40px; min-height: 40px; } }`
);

/* ═══════════════ 6. FOOTER.CSS ═══════════════ */
F(
  "src/styles/footer.css",
  `.footer { margin-top: 64px; background: var(--c-navy); color: var(--c-paper); border-top: 4px solid var(--c-red); padding-block: 48px 40px; }
@media (min-width: 900px) { .footer { padding-block: 56px 44px; } }
@media (max-width: 900px) { .footer { padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 48px); } }
.footer__inner { display: grid; gap: 36px; grid-template-columns: 1fr; }
@media (min-width: 640px) { .footer__inner { grid-template-columns: 1fr 1fr; gap: 40px; } }
@media (min-width: 900px) { .footer__inner { grid-template-columns: 2fr 3fr; gap: 56px; } }
.footer__brand-col { display: flex; flex-direction: column; gap: 16px; }
.footer__brand { font-family: var(--font); font-size: 1.5rem; color: var(--c-paper); }
.footer__tagline { font-size: 0.95rem; color: var(--c-paper-soft); line-height: 1.8; max-width: 42ch; }
.footer__copyright { font-size: 0.85rem; color: var(--c-paper-muted); padding-top: 16px; border-top: 1px solid var(--c-navy-2); margin-top: 8px; }
.footer__links-col { display: grid; gap: 32px; grid-template-columns: repeat(2, 1fr); }
@media (min-width: 640px) { .footer__links-col { grid-template-columns: repeat(3, 1fr); } }
.footer__group-title { font-size: 0.78rem; color: var(--c-red); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
.footer__links { display: flex; flex-direction: column; gap: 12px; }
.footer__link { font-size: 0.92rem; color: var(--c-paper-soft); transition: color 0.15s; }
.footer__link:hover { color: var(--c-red); }
@media print { .footer { display: none; } }`
);

/* ═══════════════ 7. BOTTOM-NAV.CSS ═══════════════ */
F(
  "src/styles/bottom-nav.css",
  `.bottom-nav { display: none; }
@media (max-width: 900px) {
  .bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 60; height: calc(var(--bottom-nav-h) + var(--safe-bottom)); padding-bottom: var(--safe-bottom); background: var(--c-white); border-top: 1px solid var(--c-line); box-shadow: 0 -2px 12px rgba(21, 26, 69, 0.06); }
  .bottom-nav__inner { display: flex; align-items: stretch; justify-content: space-around; width: 100%; padding-inline: 6px; }
  .bottom-nav__item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px 4px 8px; color: var(--c-ink-muted); font-size: 0.75rem; text-decoration: none; transition: color 0.15s; position: relative; background: none; border: none; cursor: pointer; font-family: inherit; }
  .bottom-nav__item:active { background: var(--c-off-white); }
  .bottom-nav__item.is-active { color: var(--c-navy); }
  .bottom-nav__item.is-active::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 28px; height: 3px; background: var(--c-navy); border-radius: 0 0 4px 4px; }
  .bottom-nav__icon { display: flex; align-items: center; justify-content: center; line-height: 1; color: inherit; }
  .bottom-nav__icon svg { width: 24px; height: 24px; display: block; }
  .bottom-nav__label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .bottom-nav__badge { position: absolute; top: 6px; right: 50%; margin-right: -22px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: var(--c-red); color: #fff; font-size: 0.65rem; display: grid; place-items: center; border: 2px solid var(--c-white); }
  .app-main { padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 12px); }
}`
);

/* ═══════════════ 8. SIDEBAR.CSS ═══════════════ */
F(
  "src/styles/sidebar.css",
  `.dashboard-layout { display: grid; grid-template-columns: 1fr; gap: 20px; padding-block: 24px; }
@media (min-width: 901px) { .dashboard-layout { grid-template-columns: 280px 1fr; gap: 32px; padding-block: 32px; } }
.sidebar { display: block; }
@media (min-width: 901px) { .sidebar { position: sticky; top: calc(var(--navbar-h) + 20px); align-self: start; max-height: calc(100vh - var(--navbar-h) - 40px); overflow-y: auto; padding-right: 8px; } }
.sidebar-overlay { display: none; }
@media (max-width: 900px) {
  .sidebar { position: fixed; top: 0; left: -320px; width: 290px; max-width: 88vw; height: 100dvh; background: var(--c-white); z-index: 200; padding: 24px 20px; padding-top: calc(24px + var(--safe-top)); padding-bottom: calc(24px + var(--safe-bottom)); overflow-y: auto; transition: left 0.28s var(--ease); box-shadow: 12px 0 40px rgba(21, 26, 69, 0.15); border-right: 1px solid var(--c-line); }
  .sidebar.is-open { left: 0; }
  .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(21, 26, 69, 0.55); z-index: 199; opacity: 0; pointer-events: none; transition: opacity 0.25s; }
  .sidebar-overlay.is-open { opacity: 1; pointer-events: auto; }
}
.sidebar__user { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: var(--radius); background: var(--c-navy); color: var(--c-paper); margin-bottom: 24px; }
.sidebar__user-info { flex: 1; min-width: 0; }
.sidebar__user-name { font-size: 1rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar__user-role { font-size: 0.82rem; color: var(--c-paper-soft); margin-top: 2px; }
.sidebar__group { margin-bottom: 24px; }
.sidebar__title { font-size: 0.75rem; color: var(--c-ink-muted); letter-spacing: 0.1em; text-transform: uppercase; padding: 0 14px; margin-bottom: 10px; }
.sidebar__link { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-sm); color: var(--c-ink-soft); font-size: 0.95rem; transition: all 0.15s; background: transparent; border: none; width: 100%; text-align: start; cursor: pointer; font-family: inherit; text-decoration: none; }
.sidebar__link:hover { background: var(--c-off-white); color: var(--c-navy); }
.sidebar__link.is-active { background: var(--c-navy); color: #fff; }
.sidebar__count { margin-left: auto; font-size: 0.75rem; padding: 3px 10px; border-radius: 999px; background: var(--c-red); color: #fff; }
.sidebar__link--danger { color: var(--c-red); }
.sidebar__link--danger:hover { background: var(--c-red-tint); color: var(--c-red-soft); }
.sidebar-close { display: none; }
@media (max-width: 900px) { .sidebar-close { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--c-off-white); color: var(--c-ink); font-size: 1.3rem; cursor: pointer; margin-left: auto; margin-bottom: 20px; border: 1px solid var(--c-line); } }`
);

/* ═══════════════ 9. CARDS.CSS ═══════════════ */
F(
  "src/styles/cards.css",
  `.card { position: relative; display: block; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); padding: 24px; color: var(--c-ink); box-shadow: var(--shadow-xs); transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s; }
@media (max-width: 640px) { .card { padding: 20px; } }
a.card:hover, button.card:hover { border-color: var(--c-line-mid); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.card.no-click, .card--static { cursor: default; }
.card.no-click:hover, .card--static:hover { transform: none; box-shadow: var(--shadow-xs); }
.card--navy { background: var(--c-navy); border-color: var(--c-navy-2); color: var(--c-paper); }
.card--navy .card__title { color: var(--c-paper); }
.card--navy .card__meta { color: var(--c-paper-muted); }
.card--navy .card__body { color: var(--c-paper-soft); }
.card__title { font-size: 1.05rem; color: var(--c-ink); line-height: 1.4; }
.card__meta { font-size: 0.85rem; color: var(--c-ink-muted); margin-top: 6px; line-height: 1.65; }
.card__body { margin-top: 14px; font-size: 0.9rem; color: var(--c-ink-soft); line-height: 1.75; }
.card__footer { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--c-line); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.stat-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
@media (min-width: 640px) { .stat-row { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 18px; } }
.stat { background: var(--c-navy); border: 1px solid var(--c-navy-2); border-radius: var(--radius); padding: 24px 18px; text-align: center; transition: transform 0.15s; }
@media (min-width: 640px) { .stat { padding: 28px 22px; } }
.stat__value { font-size: 1.8rem; color: var(--c-paper); line-height: 1; }
@media (min-width: 640px) { .stat__value { font-size: 2.1rem; } }
.stat__label { margin-top: 10px; font-size: 0.78rem; color: var(--c-paper-soft); }
.stat--red .stat__value { color: var(--c-red); }
.stat--success .stat__value { color: var(--c-green); }
.stat--amber .stat__value { color: var(--c-amber); }`
);

/* ═══════════════ 10. BUTTONS.CSS ═══════════════ */
F(
  "src/styles/buttons.css",
  `.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; border-radius: var(--radius-sm); border: 1.5px solid transparent; font-size: 1rem; font-family: var(--font); cursor: pointer; transition: all 0.15s; text-decoration: none; line-height: 1.4; white-space: nowrap; user-select: none; }
.btn:active:not(:disabled) { transform: scale(0.98); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn--primary { background: var(--c-red); color: #fff; border-color: var(--c-red); }
.btn--primary:hover:not(:disabled) { background: var(--c-red-soft); border-color: var(--c-red-soft); }
.btn--navy { background: var(--c-navy); color: #fff; border-color: var(--c-navy); }
.btn--navy:hover:not(:disabled) { background: var(--c-navy-2); }
.btn--ghost { background: var(--c-white); border-color: var(--c-line-mid); color: var(--c-ink); }
.btn--ghost:hover:not(:disabled) { background: var(--c-off-white); border-color: var(--c-navy); color: var(--c-navy); }
.btn--danger { background: var(--c-red); border-color: var(--c-red); color: #fff; }
.btn--danger:hover:not(:disabled) { background: var(--c-red-soft); }
.btn--success { background: var(--c-green); border-color: var(--c-green); color: #fff; }
.btn--success:hover:not(:disabled) { background: #15803D; }
.btn--outline-danger { background: transparent; border-color: var(--c-red); color: var(--c-red); }
.btn--outline-danger:hover:not(:disabled) { background: var(--c-red); color: #fff; }
.btn--lg { padding: 15px 30px; font-size: 1.1rem; border-radius: var(--radius); }
.btn--sm { padding: 9px 18px; font-size: 0.92rem; }
.btn--xs { padding: 7px 14px; font-size: 0.85rem; gap: 4px; }
.btn--block { width: 100%; }
.btn--pill { border-radius: var(--radius-full); }
.btn--icon-only { padding: 10px; width: 44px; height: 44px; }
.btn--sm.btn--icon-only { width: 36px; height: 36px; padding: 6px; }`
);

/* ═══════════════ 11. BADGES.CSS ═══════════════ */
F(
  "src/styles/badges.css",
  `.badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.82rem; font-family: var(--font); white-space: nowrap; line-height: 1.5; vertical-align: middle; background: var(--c-line); color: var(--c-ink-soft); border: 1px solid var(--c-line-mid); flex-shrink: 0; }
.badge__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.badge--neutral { background: var(--c-line); color: var(--c-ink-soft); border-color: var(--c-line-mid); }
.badge--success { background: var(--c-green-soft); color: var(--c-green-text); border-color: #86EFAC; }
.badge--warning { background: var(--c-amber-soft); color: var(--c-amber-text); border-color: #FCD34D; }
.badge--danger { background: var(--c-red-tint); color: #991B1B; border-color: #FCA5A5; }
.badge--info { background: var(--c-blue-soft); color: var(--c-blue-text); border-color: #93C5FD; }
.badge--purple { background: var(--c-purple-soft); color: var(--c-purple-text); border-color: #C4B5FD; }
.badge--navy { background: var(--c-navy); color: #fff; border-color: var(--c-navy); }
.badge--red { background: var(--c-red); color: #fff; border-color: var(--c-red); }
.card--navy .badge { background: rgba(255, 255, 255, 0.12); color: #fff; border-color: rgba(255, 255, 255, 0.18); }
.card--navy .badge--success { background: #166534; color: #fff; border-color: #16A34A; }
.card--navy .badge--warning { background: #92400E; color: #fff; border-color: #D97706; }
.card--navy .badge--danger { background: #991B1B; color: #fff; border-color: #DC2626; }
.card--navy .badge--info { background: #1E40AF; color: #fff; border-color: #2563EB; }
.card--navy .badge--red { background: var(--c-red); color: #fff; border-color: var(--c-red); }`
);

/* ═══════════════ 12. FORMS.CSS ═══════════════ */
F(
  "src/styles/forms.css",
  `.input { width: 100%; padding: 13px 16px; background: var(--c-white); border: 1.5px solid var(--c-line-mid); border-radius: var(--radius-sm); font-size: 1rem; font-family: var(--font); color: var(--c-ink); outline: none; transition: border-color 0.15s, box-shadow 0.15s; direction: ltr; text-align: left; }
.input::placeholder { color: var(--c-ink-muted); }
.input:focus { border-color: var(--c-navy); box-shadow: 0 0 0 4px rgba(21, 26, 69, 0.08); }
.input:disabled { background: var(--c-off-white); cursor: not-allowed; opacity: 0.6; }
textarea.input { min-height: 110px; resize: vertical; line-height: 1.75; }
select.input { cursor: pointer; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7299' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 40px; }
.form-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.form-field__label { font-size: 0.9rem; color: var(--c-ink-soft); }
.form-field__req { color: var(--c-red); margin-left: 2px; }
.form-field__hint { font-size: 0.82rem; color: var(--c-ink-muted); }
.form-field__error { font-size: 0.85rem; color: var(--c-red); }
.toolbar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
@media (min-width: 640px) { .toolbar { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 14px; margin-bottom: 24px; } }
.toolbar .input { min-width: 0; }
@media (min-width: 640px) { .toolbar .input { min-width: 240px; width: auto; } }
.chips { display: flex; gap: 10px; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 6px; margin-inline: -20px; padding-inline: 20px; scrollbar-width: none; }
.chips::-webkit-scrollbar { display: none; }
@media (min-width: 640px) { .chips { flex-wrap: wrap; margin-inline: 0; padding-inline: 0; overflow: visible; } }
.chip { padding: 9px 18px; border-radius: var(--radius-full); border: 1.5px solid var(--c-line-mid); background: var(--c-white); color: var(--c-ink-soft); font-size: 0.9rem; font-family: var(--font); cursor: pointer; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
.chip:hover { border-color: var(--c-navy); color: var(--c-navy); }
.chip.is-active { background: var(--c-red); border-color: var(--c-red); color: #fff; }`
);

/* ═══════════════ 13. TABLES.CSS ═══════════════ */
F(
  "src/styles/tables.css",
  `.table-wrap { border: 1px solid var(--c-line); border-radius: var(--radius); overflow: hidden; background: var(--c-white); box-shadow: var(--shadow-xs); }
table.data { width: 100%; border-collapse: collapse; font-size: 0.92rem; color: var(--c-ink); }
table.data th { text-align: start; padding: 16px 24px; font-size: 0.78rem; color: var(--c-paper); background: var(--c-navy); border-bottom: 1px solid var(--c-navy-2); white-space: nowrap; text-transform: uppercase; letter-spacing: 0.05em; }
table.data td { padding: 16px 24px; border-bottom: 1px solid var(--c-line); vertical-align: middle; }
table.data tr:last-child td { border-bottom: none; }
table.data tbody tr { transition: background 0.15s; }
table.data tbody tr:hover { background: var(--c-off-white); }
.rank { font-weight: 400; color: var(--c-ink-muted); width: 56px; }
.rank--1 { color: var(--c-red); }
.rank--2 { color: var(--c-navy-2); }
.rank--3 { color: var(--c-ink-soft); }
.points { color: var(--c-navy); }
@media (max-width: 700px) {
  .table-wrap { border: none; background: transparent; box-shadow: none; overflow: visible; }
  table.data { display: block; }
  table.data thead { display: none; }
  table.data tbody { display: block; }
  table.data tr { display: block; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); padding: 20px; margin-bottom: 14px; box-shadow: var(--shadow-xs); position: relative; }
  table.data td { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border: none; gap: 14px; }
  table.data td:not(:first-child)::before { content: attr(data-label); font-size: 0.75rem; color: var(--c-ink-muted); text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0; }
}`
);

/* ═══════════════ 14. MODAL.CSS ═══════════════ */
F(
  "src/styles/modal.css",
  `.modal-backdrop { position: fixed; inset: 0; background: rgba(21, 26, 69, 0.55); display: flex; align-items: flex-end; justify-content: center; z-index: 300; padding: 0; backdrop-filter: blur(4px); animation: modal-fade 0.2s; }
@media (min-width: 640px) { .modal-backdrop { align-items: center; padding: 20px; } }
@keyframes modal-fade { from { opacity: 0; } to { opacity: 1; } }
.modal { background: var(--c-white); border-radius: var(--radius-lg) var(--radius-lg) 0 0; max-width: 100%; width: 100%; max-height: 92dvh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 -20px 60px rgba(21, 26, 69, 0.3); animation: modal-slide 0.28s; padding-bottom: var(--safe-bottom); }
@media (min-width: 640px) { .modal { border-radius: var(--radius-lg); max-width: 560px; box-shadow: var(--shadow-lg); } }
.modal--wide { max-width: 100%; }
@media (min-width: 640px) { .modal--wide { max-width: 760px; } }
@keyframes modal-slide { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
.modal__handle { width: 44px; height: 5px; border-radius: 999px; background: var(--c-line-mid); margin: 12px auto 6px; flex-shrink: 0; }
@media (min-width: 640px) { .modal__handle { display: none; } }
.modal__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 24px; border-bottom: 1px solid var(--c-line); flex-shrink: 0; }
.modal__head h3 { font-size: 1.15rem; color: var(--c-ink); margin: 0; }
.modal__close { width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--c-off-white); color: var(--c-ink-soft); font-size: 1.4rem; display: grid; place-items: center; border: none; cursor: pointer; font-family: inherit; flex-shrink: 0; transition: all 0.15s; }
.modal__close:hover { background: var(--c-line); color: var(--c-ink); }
.modal__body { padding: 24px; overflow-y: auto; flex: 1; }
.modal__foot { padding: 20px 24px; border-top: 1px solid var(--c-line); display: flex; gap: 12px; flex-shrink: 0; }
.modal__foot .btn { flex: 1; }
@media (min-width: 640px) { .modal__foot { justify-content: flex-end; } .modal__foot .btn { flex: 0 0 auto; min-width: 130px; } }`
);

/* ═══════════════ 15. TOAST.CSS ═══════════════ */
F(
  "src/styles/toast.css",
  `.toast-container { position: fixed; bottom: calc(20px + var(--safe-bottom)); left: 16px; right: 16px; z-index: 400; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
@media (min-width: 640px) { .toast-container { bottom: 24px; left: auto; right: 24px; max-width: 400px; } }
.toast { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: var(--c-navy); color: var(--c-paper); border-radius: var(--radius); box-shadow: var(--shadow-lg); pointer-events: auto; animation: toast-in 0.28s var(--ease-bounce); border: 1px solid var(--c-navy-2); font-size: 0.92rem; line-height: 1.55; }
@keyframes toast-in { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
.toast--success { background: var(--c-green); border-color: #15803D; }
.toast--error { background: var(--c-red); border-color: var(--c-red-soft); }
.toast--warning { background: var(--c-amber); border-color: #B45309; }
.toast__icon { font-size: 1.15rem; flex-shrink: 0; margin-top: 2px; }
.toast__content { flex: 1; min-width: 0; }
.toast__title { font-size: 0.95rem; }
.toast__message { font-size: 0.86rem; opacity: 0.92; margin-top: 2px; }`
);

/* ═══════════════ 16. NOTIFICATIONS.CSS ═══════════════ */
F(
  "src/styles/notifications.css",
  `.notif-item { display: flex; gap: 12px; padding: 18px 22px; border-radius: var(--radius); border: 1px solid var(--c-line); background: var(--c-white); transition: all 0.18s; position: relative; cursor: pointer; overflow: hidden; box-shadow: var(--shadow-xs); }
.notif-item:hover { border-color: var(--c-line-mid); background: var(--c-off-white); }
.notif-item--unread { background: #FFFBFC; border-color: #FCA5A5; }
.notif-item--unread::before { content: ''; position: absolute; left: 0; top: 16px; bottom: 16px; width: 3px; background: var(--c-red); border-radius: 0 3px 3px 0; }
.notif-item__body { flex: 1; min-width: 0; }
.notif-item__title { font-size: 1rem; color: var(--c-ink); line-height: 1.5; word-break: break-word; }
.notif-item__message { font-size: 0.88rem; color: var(--c-ink-muted); margin-top: 4px; line-height: 1.65; word-break: break-word; }
.notif-item__meta { display: flex; gap: 8px; margin-top: 10px; font-size: 0.78rem; color: var(--c-ink-muted); flex-wrap: wrap; align-items: center; }
.notif-item__from { color: var(--c-ink-soft); }
.notif-item__dot { color: var(--c-line-mid); }
.notif-item__priority { margin-left: auto; padding: 2px 10px; border-radius: 999px; font-size: 0.7rem; }
.notif-item__priority--high { background: var(--c-red-tint); color: #991B1B; }
.notif-item__icon { display: none !important; }`
);

/* ═══════════════ 17. LOGIN.CSS ═══════════════ */
F(
  "src/styles/login.css",
  `.login-page { min-height: 100vh; min-height: 100dvh; display: grid; place-items: center; padding: 24px; padding-top: calc(24px + var(--safe-top)); padding-bottom: calc(24px + var(--safe-bottom)); background: radial-gradient(900px 500px at 20% 0%, rgba(193, 39, 45, 0.08), transparent 60%), radial-gradient(700px 400px at 80% 100%, rgba(21, 26, 69, 0.10), transparent 60%), var(--c-navy); }
.login-card { width: 100%; max-width: 440px; background: var(--c-white); border-radius: var(--radius-xl); padding: 44px 36px; box-shadow: var(--shadow-lg); border: 1px solid var(--c-line); animation: login-slide 0.35s; }
@media (min-width: 640px) { .login-card { padding: 52px 44px; } }
@keyframes login-slide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.login-field { margin-bottom: 20px; }
.login-label { display: block; font-size: 0.92rem; color: var(--c-ink-soft); margin-bottom: 8px; }
.login-input { width: 100%; padding: 15px 18px; border-radius: var(--radius-sm); border: 1.5px solid var(--c-line-mid); background: var(--c-white); font-family: inherit; font-size: 1rem; color: var(--c-ink); outline: none; transition: border-color 0.15s, box-shadow 0.15s; direction: ltr; }
.login-input:focus { border-color: var(--c-navy); box-shadow: 0 0 0 4px rgba(21, 26, 69, 0.08); }
.login-submit { width: 100%; padding: 16px; border-radius: var(--radius-sm); border: none; background: var(--c-red); color: #fff; font-family: inherit; font-size: 1rem; cursor: pointer; margin-top: 12px; transition: background 0.15s, transform 0.1s; }
.login-submit:hover:not(:disabled) { background: var(--c-red-soft); }
.login-submit:active:not(:disabled) { transform: scale(0.98); }
.login-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.login-error { background: var(--c-red-tint); color: #991B1B; border: 1px solid #FCA5A5; border-radius: var(--radius-sm); padding: 14px 16px; font-size: 0.92rem; line-height: 1.6; margin-bottom: 18px; }
.login-back { text-align: center; margin-top: 28px; font-size: 0.9rem; }
.login-back a { color: var(--c-ink-muted); transition: color 0.15s; }
.login-back a:hover { color: var(--c-red); }
.change-password-notice { background: var(--c-amber-soft); border: 1px solid #FCD34D; border-radius: var(--radius-sm); padding: 18px; margin-bottom: 26px; font-size: 0.94rem; color: var(--c-amber-text); line-height: 1.7; }
.change-password-notice strong { display: block; margin-bottom: 8px; font-size: 1rem; }`
);

/* ═══════════════ 18. CHAT.CSS ═══════════════ */
F(
  "src/styles/chat.css",
  `.chat-layout { display: grid; grid-template-columns: 1fr; height: calc(100dvh - var(--navbar-h) - var(--bottom-nav-h) - 80px); border: 1px solid var(--c-line); border-radius: var(--radius); overflow: hidden; background: var(--c-white); box-shadow: var(--shadow-xs); max-width: 1280px; margin-inline: auto; }
@media (min-width: 900px) { .chat-layout { grid-template-columns: 340px 1fr; height: calc(100dvh - var(--navbar-h) - 100px); } }
.chat-sidebar { background: var(--c-white); border-right: 1px solid var(--c-line); overflow-y: auto; display: flex; flex-direction: column; }
.chat-sidebar__head { padding: 20px 22px; border-bottom: 1px solid var(--c-line); flex-shrink: 0; background: var(--c-navy); color: #fff; }
.chat-sidebar__title { font-size: 1.15rem; }
.chat-sidebar__new { display: inline-flex; align-items: center; padding: 8px 16px; border-radius: var(--radius-full); background: var(--c-red); color: #fff; font-family: inherit; font-size: 0.85rem; border: none; cursor: pointer; transition: background 0.15s; }
.chat-sidebar__new:hover { background: var(--c-red-soft); }
.chat-conversations { flex: 1; overflow-y: auto; }
.chat-conv { display: flex; align-items: center; gap: 14px; padding: 16px 22px; border-bottom: 1px solid var(--c-line); cursor: pointer; transition: background 0.15s; background: none; border-left: none; border-right: none; border-top: none; width: 100%; text-align: start; font-family: inherit; }
.chat-conv:hover { background: var(--c-off-white); }
.chat-conv.is-active { background: var(--c-red-tint); border-left: 4px solid var(--c-red); padding-left: 18px; }
.chat-conv__avatar { width: 50px; height: 50px; border-radius: 50%; display: grid; place-items: center; font-size: 1.15rem; flex-shrink: 0; color: #fff; background: var(--c-navy); }
.chat-conv__avatar--general { background: linear-gradient(150deg, var(--c-red), var(--c-red-soft)); }
.chat-conv__avatar--team { background: var(--c-navy); }
.chat-conv__avatar--private { background: var(--c-navy-3); }
.chat-conv__body { flex: 1; min-width: 0; }
.chat-conv__top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.chat-conv__name { font-size: 1rem; color: var(--c-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-conv__time { font-size: 0.75rem; color: var(--c-ink-muted); flex-shrink: 0; }
.chat-conv__preview { font-size: 0.86rem; color: var(--c-ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-conv__badge { min-width: 22px; height: 22px; padding: 0 7px; border-radius: 999px; background: var(--c-red); color: #fff; font-size: 0.75rem; display: grid; place-items: center; flex-shrink: 0; }
.chat-panel { display: flex; flex-direction: column; background: var(--c-off-white); overflow: hidden; }
.chat-panel__empty { flex: 1; display: grid; place-items: center; padding: 40px 24px; text-align: center; color: var(--c-ink-muted); }
.chat-panel__empty-icon { font-size: 3.5rem; margin-bottom: 18px; opacity: 0.35; }
.chat-header { display: flex; align-items: center; gap: 14px; padding: 16px 22px; background: var(--c-white); border-bottom: 1px solid var(--c-line); flex-shrink: 0; }
.chat-header__back { display: none; width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--c-off-white); border: 1px solid var(--c-line); color: var(--c-ink); font-size: 1.3rem; cursor: pointer; font-family: inherit; flex-shrink: 0; align-items: center; justify-content: center; }
@media (max-width: 899px) { .chat-header__back { display: flex; } }
.chat-header__avatar { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; font-size: 1.15rem; color: #fff; background: var(--c-navy); flex-shrink: 0; }
.chat-header__avatar--general { background: linear-gradient(150deg, var(--c-red), var(--c-red-soft)); }
.chat-header__avatar--team { background: var(--c-navy); }
.chat-header__avatar--private { background: var(--c-navy-3); }
.chat-header__info { flex: 1; min-width: 0; }
.chat-header__title { font-size: 1.05rem; color: var(--c-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-header__sub { font-size: 0.8rem; color: var(--c-ink-muted); margin-top: 2px; }
.chat-messages { flex: 1; overflow-y: auto; padding: 24px 22px; display: flex; flex-direction: column; gap: 12px; }
.chat-message { display: flex; gap: 10px; max-width: 78%; align-self: flex-start; animation: msg-in 0.2s; }
@keyframes msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.chat-message--mine { align-self: flex-end; flex-direction: row-reverse; }
.chat-message__avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-size: 0.85rem; color: #fff; background: var(--c-navy-3); flex-shrink: 0; align-self: flex-end; }
.chat-message__bubble { padding: 11px 16px; border-radius: 18px; background: var(--c-white); border: 1px solid var(--c-line); font-size: 0.95rem; line-height: 1.6; color: var(--c-ink); word-wrap: break-word; box-shadow: var(--shadow-xs); }
.chat-message--mine .chat-message__bubble { background: var(--c-red); color: #fff; border-color: var(--c-red); border-bottom-right-radius: 6px; }
.chat-message:not(.chat-message--mine) .chat-message__bubble { border-bottom-left-radius: 6px; }
.chat-message__sender { font-size: 0.78rem; color: var(--c-red); margin-bottom: 5px; }
.chat-message--mine .chat-message__sender { display: none; }
.chat-message__time { font-size: 0.72rem; opacity: 0.65; margin-top: 6px; text-align: end; }
.chat-composer { display: flex; align-items: flex-end; gap: 10px; padding: 16px 22px; padding-bottom: calc(16px + var(--safe-bottom)); background: var(--c-white); border-top: 1px solid var(--c-line); flex-shrink: 0; }
@media (min-width: 900px) { .chat-composer { padding-bottom: 16px; } }
.chat-composer__input { flex: 1; min-width: 0; padding: 12px 18px; border-radius: 24px; border: 1.5px solid var(--c-line-mid); background: var(--c-off-white); font-family: inherit; font-size: 0.95rem; color: var(--c-ink); outline: none; resize: none; max-height: 140px; line-height: 1.55; }
.chat-composer__input:focus { background: var(--c-white); border-color: var(--c-navy); }
.chat-composer__send { width: 46px; height: 46px; border-radius: 50%; background: var(--c-red); color: #fff; border: none; cursor: pointer; display: grid; place-items: center; font-size: 1.2rem; flex-shrink: 0; transition: all 0.15s; box-shadow: var(--shadow-red); }
.chat-composer__send:hover:not(:disabled) { background: var(--c-red-soft); transform: scale(1.05); }
.chat-composer__send:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.user-picker { display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; padding: 4px 0; }
.user-picker__search { width: 100%; padding: 12px 16px; border-radius: var(--radius-sm); border: 1.5px solid var(--c-line-mid); background: var(--c-white); font-family: inherit; font-size: 0.95rem; color: var(--c-ink); outline: none; margin-bottom: 8px; }
.user-picker__search:focus { border-color: var(--c-navy); }
.user-picker__item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: var(--radius-sm); border: 1px solid var(--c-line); background: var(--c-white); cursor: pointer; transition: all 0.15s; font-family: inherit; text-align: start; width: 100%; }
.user-picker__item:hover { background: var(--c-off-white); border-color: var(--c-line-mid); }
.user-picker__item:disabled { opacity: 0.6; cursor: not-allowed; }
.user-picker__avatar { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: var(--c-navy); color: #fff; font-size: 1rem; flex-shrink: 0; }
.user-picker__info { flex: 1; min-width: 0; }
.user-picker__name { font-size: 0.95rem; color: var(--c-ink); }
.user-picker__email { font-size: 0.8rem; color: var(--c-ink-muted); margin-top: 2px; direction: ltr; }
.user-picker__empty { padding: 32px 20px; text-align: center; color: var(--c-ink-muted); font-size: 0.92rem; border: 1.5px dashed var(--c-line-mid); border-radius: var(--radius-sm); }
@media (max-width: 899px) { .chat-layout { border-radius: 0; border-left: none; border-right: none; height: calc(100dvh - var(--navbar-h) - var(--bottom-nav-h) - 24px); } .chat-sidebar.is-hidden { display: none; } .chat-panel.is-hidden { display: none; } .chat-messages { padding: 18px 16px; } .chat-composer { padding: 14px 16px; padding-bottom: calc(14px + var(--safe-bottom)); } .chat-message { max-width: 88%; } }`
);

/* ═══════════════ 19. HOME.CSS ═══════════════ */
F(
  "src/styles/home.css",
  `.home-hero { padding-block: 72px 56px; }
@media (max-width: 640px) { .home-hero { padding-block: 48px 40px; } }
.home-hero__title { font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1.15; margin-top: 16px; max-width: 22ch; color: var(--c-navy); }
@media (max-width: 640px) { .home-hero__title { font-size: 1.85rem; max-width: none; } }
.home-hero__brand { color: var(--c-red); }
.home-hero__desc { margin-top: 22px; max-width: 62ch; color: var(--c-ink-soft); font-size: 1.05rem; line-height: 1.9; }
@media (max-width: 640px) { .home-hero__desc { font-size: 0.98rem; margin-top: 16px; } }
.home-hero__actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 32px; }
.home-section { padding-block: 44px; }
@media (min-width: 640px) { .home-section { padding-block: 56px; } }
.home-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (min-width: 640px) { .home-stats { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
.home-stats .stat { padding: 28px 20px; }
.home-stats .stat__value { font-size: 1.95rem; }
@media (min-width: 640px) { .home-stats .stat__value { font-size: 2.1rem; } }
.home-teams-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 480px) { .home-teams-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 900px) { .home-teams-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
.team-card { display: flex; flex-direction: column; gap: 20px; padding: 26px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); text-decoration: none; color: var(--c-ink); transition: all 0.18s; box-shadow: var(--shadow-xs); }
.team-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }
.team-card__head { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.team-card__name { font-size: 1.25rem; color: var(--c-navy); line-height: 1.3; }
.team-card__rank { display: inline-flex; align-items: center; justify-content: center; min-width: 44px; padding: 6px 14px; border-radius: var(--radius-full); background: var(--c-navy); color: #fff; font-size: 0.85rem; flex-shrink: 0; }
.team-card__rank--first { background: var(--c-red); box-shadow: 0 4px 12px rgba(193, 39, 45, 0.35); }
.team-card__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding-top: 18px; border-top: 1px solid var(--c-line); }
.team-card__stat { display: flex; flex-direction: column; gap: 6px; }
.team-card__stat-value { font-size: 1.25rem; color: var(--c-navy); line-height: 1; }
.team-card__stat-label { font-size: 0.78rem; color: var(--c-ink-muted); }
.league-table { background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-xs); }
.league-table__head { display: grid; grid-template-columns: 72px 2.2fr 1.6fr 100px 100px; gap: 16px; padding: 16px 28px; background: var(--c-navy); color: #fff; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; }
.league-table__row { display: grid; grid-template-columns: 72px 2.2fr 1.6fr 100px 100px; gap: 16px; padding: 16px 28px; align-items: center; color: var(--c-ink); text-decoration: none; border-bottom: 1px solid var(--c-line); transition: background 0.15s; }
.league-table__row:last-child { border-bottom: none; }
.league-table__row:hover { background: var(--c-off-white); }
.league-table__row .col-rank { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; background: var(--c-line); color: var(--c-ink-soft); font-size: 0.9rem; flex-shrink: 0; }
.league-table__row .col-rank.rank-1 { background: var(--c-red); color: #fff; box-shadow: 0 3px 10px rgba(193, 39, 45, 0.3); }
.league-table__row .col-rank.rank-2 { background: var(--c-navy-2); color: #fff; }
.league-table__row .col-rank.rank-3 { background: var(--c-navy); color: #fff; }
.league-table__row .col-name { display: flex; align-items: center; gap: 14px; min-width: 0; }
.league-table__name { font-size: 0.95rem; color: var(--c-ink); word-break: break-word; line-height: 1.45; }
.league-table__row .col-team { display: flex; flex-wrap: wrap; gap: 6px; }
.league-table__row .col-hours { color: var(--c-navy); }
.league-table__row .col-points { color: var(--c-red); }
@media (max-width: 700px) {
  .league-table__head { display: none; }
  .league-table { background: transparent; border: none; box-shadow: none; display: flex; flex-direction: column; gap: 12px; }
  .league-table__row { display: grid; grid-template-columns: 48px 1fr auto; grid-template-areas: 'rank name points' 'rank team hours'; gap: 8px 14px; padding: 18px 20px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); box-shadow: var(--shadow-xs); }
  .league-table__row .col-rank { grid-area: rank; align-self: center; }
  .league-table__row .col-name { grid-area: name; }
  .league-table__row .col-team { grid-area: team; }
  .league-table__row .col-points { grid-area: points; text-align: end; align-self: center; }
  .league-table__row .col-hours { grid-area: hours; text-align: end; font-size: 0.8rem; color: var(--c-ink-muted); }
}
.league-filters { display: flex; flex-direction: column; gap: 14px; margin-block: 24px; }
.league-board { display: flex; flex-direction: column; gap: 32px; }
.league-podium { display: grid; grid-template-columns: 1fr; gap: 18px; }
@media (min-width: 640px) { .league-podium { grid-template-columns: repeat(3, 1fr); gap: 22px; } }
.league-podium__card { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 24px; border-radius: var(--radius); border: 1.5px solid var(--c-line); background: var(--c-white); text-decoration: none; color: var(--c-ink); box-shadow: var(--shadow-xs); transition: all 0.18s; text-align: center; }
.league-podium__card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); }
.league-podium__card--1 { border-color: #FCA5A5; }
.league-podium__card--2 { border-color: var(--c-line-mid); }
.league-podium__card--3 { border-color: var(--c-line); }
.league-podium__rank { display: inline-flex; align-items: center; justify-content: center; padding: 5px 16px; border-radius: var(--radius-full); font-size: 0.85rem; margin-bottom: 6px; }
.league-podium__rank--1 { background: var(--c-red); color: #fff; }
.league-podium__rank--2 { background: var(--c-navy-2); color: #fff; }
.league-podium__rank--3 { background: var(--c-navy); color: #fff; }
.league-podium__name { font-size: 1.1rem; color: var(--c-ink); word-break: break-word; }
.league-podium__points { font-size: 1.25rem; color: var(--c-red); }
.league-podium__hours { font-size: 0.85rem; color: var(--c-ink-muted); }
.home-join-cta { padding: 56px 40px; background: var(--c-navy); border-radius: var(--radius-lg); text-align: center; color: #fff; }
@media (max-width: 640px) { .home-join-cta { padding: 40px 28px; } }
.home-join-cta__title { margin-top: 22px; font-size: 1.7rem; color: #fff; }
@media (min-width: 640px) { .home-join-cta__title { font-size: 2rem; } }
.home-join-cta__desc { margin-top: 18px; max-width: 46ch; margin-inline: auto; color: var(--c-paper-soft); font-size: 1rem; line-height: 1.9; }
.home-join-cta__actions { display: flex; justify-content: center; gap: 14px; margin-top: 32px; flex-wrap: wrap; }`
);

/* ═══════════════ 20. ADMIN.CSS ═══════════════ */
F(
  "src/styles/admin.css",
  `.admin-page { padding-block: 24px 60px; }
.admin-welcome { padding: 12px 0 24px; margin-bottom: 8px; }
.admin-welcome__eyebrow { font-size: 0.78rem; color: var(--c-red); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; }
.admin-welcome__name { font-size: clamp(1.6rem, 4vw, 2.2rem); color: var(--c-navy); line-height: 1.25; word-break: break-word; margin: 0; }
.admin-welcome__subtitle { margin-top: 12px; color: var(--c-ink-muted); font-size: 0.98rem; line-height: 1.75; max-width: 60ch; }
.admin-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-block: 32px 44px; }
@media (min-width: 600px) { .admin-stats { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
@media (min-width: 1024px) { .admin-stats { grid-template-columns: repeat(6, 1fr); gap: 18px; } }
.admin-stats .stat { padding: 26px 18px; min-height: 116px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.admin-stats .stat__value { font-size: 1.75rem; }
.admin-stats .stat__label { font-size: 0.78rem; margin-top: 10px; }
.admin-seed { margin-block: 44px; padding: 28px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); box-shadow: var(--shadow-xs); }
@media (max-width: 640px) { .admin-seed { padding: 22px; } }
.admin-seed__head { display: flex; flex-direction: column; gap: 16px; }
@media (min-width: 640px) { .admin-seed__head { flex-direction: row; align-items: center; justify-content: space-between; } }
.admin-seed__title { font-size: 1.1rem; color: var(--c-navy); margin-bottom: 6px; }
.admin-seed__desc { font-size: 0.88rem; color: var(--c-ink-muted); line-height: 1.65; }
.admin-seed__result { margin-top: 20px; padding: 16px 20px; background: var(--c-off-white); border: 1px solid var(--c-line); border-radius: var(--radius-sm); font-size: 0.9rem; line-height: 2; color: var(--c-ink-soft); word-break: break-word; }
.admin-cards { display: grid; grid-template-columns: 1fr; gap: 16px; margin-block: 24px; }
@media (min-width: 600px) { .admin-cards { grid-template-columns: repeat(2, 1fr); gap: 18px; } }
@media (min-width: 1024px) { .admin-cards { grid-template-columns: repeat(3, 1fr); gap: 20px; } }
.admin-card { display: flex; flex-direction: column; gap: 12px; padding: 24px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); text-decoration: none; color: var(--c-ink); transition: all 0.18s; box-shadow: var(--shadow-xs); min-height: 124px; }
.admin-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }
.admin-card__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.admin-card__title { font-size: 1.1rem; color: var(--c-navy); line-height: 1.4; }
.admin-card__count { display: inline-flex; align-items: center; justify-content: center; min-width: 34px; padding: 4px 12px; border-radius: var(--radius-full); background: var(--c-red); color: #fff; font-size: 0.82rem; flex-shrink: 0; }
.admin-card__desc { font-size: 0.88rem; color: var(--c-ink-muted); line-height: 1.65; }
.admin-page .section, .admin-page .section--tight { padding-inline: 0; }
.admin-page .section-head { padding-inline: 0; margin-inline: 0; margin-bottom: 28px; }
.admin-page h1, .admin-page h2 { margin: 0; }
.admin-page .card { padding: 24px; }
@media (max-width: 640px) { .admin-page .card { padding: 20px; } }
.admin-request-card { display: flex; flex-direction: column; gap: 18px; padding: 26px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); box-shadow: var(--shadow-xs); }
@media (min-width: 640px) { .admin-request-card { padding: 28px; } }
.admin-request-card__head { display: flex; flex-direction: column; gap: 14px; }
@media (min-width: 640px) { .admin-request-card__head { flex-direction: row; align-items: flex-start; justify-content: space-between; } }
.admin-request-card__info { flex: 1; min-width: 0; }
.admin-request-card__title { font-size: 1.1rem; color: var(--c-ink); line-height: 1.45; word-break: break-word; }
.admin-request-card__meta { font-size: 0.88rem; color: var(--c-ink-muted); margin-top: 8px; line-height: 1.7; word-break: break-word; }
.admin-request-card__badges { display: flex; gap: 8px; flex-wrap: wrap; }
.admin-request-card__actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--c-line); }
@media (max-width: 700px) {
  .admin-page table.data { display: block; background: transparent; border: none; box-shadow: none; }
  .admin-page table.data thead { display: none; }
  .admin-page table.data tbody { display: block; }
  .admin-page table.data tr { display: block; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); padding: 20px; margin-bottom: 14px; box-shadow: var(--shadow-xs); }
  .admin-page table.data td { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 10px 0; border: none; font-size: 0.92rem; }
  .admin-page table.data td::before { content: attr(data-label); font-size: 0.75rem; color: var(--c-ink-muted); text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0; }
}
.chart-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; font-size: 0.92rem; }
.chart-row > span:first-child { min-width: 110px; flex-shrink: 0; }
.chart-row > span:last-child { min-width: 64px; text-align: end; flex-shrink: 0; }
.chart-bar { flex: 1; height: 12px; background: var(--c-navy); border-radius: 999px; min-width: 6px; transition: width 0.4s ease; }
.chart-bar--red { background: var(--c-red); }`
);

/* ═══════════════ 21. GLOBAL.CSS ═══════════════ */
F(
  "src/styles/global.css",
  `@import './tokens.css';
@import './base.css';
@import './layout.css';
@import './navbar.css';
@import './bottom-nav.css';
@import './sidebar.css';
@import './cards.css';
@import './member-card.css';
@import './badges.css';
@import './buttons.css';
@import './tables.css';
@import './forms.css';
@import './modal.css';
@import './toast.css';
@import './notifications.css';
@import './footer.css';
@import './profile.css';
@import './login.css';
@import './onboarding.css';
@import './calendar.css';
@import './chat.css';
@import './chat-additions.css';
@import './pwa.css';
@import './states.css';
@import './timeline.css';
@import './approvals.css';
@import './print.css';
@import './home.css';
@import './admin.css';
@import './v52-fix.css';`
);

/* ═══════════════ 22. member-card.css ═══════════════ */
F(
  "src/styles/member-card.css",
  `.member-card { display: flex; flex-direction: column; gap: 14px; padding: 20px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); text-decoration: none; color: var(--c-ink); transition: all 0.18s; box-shadow: var(--shadow-xs); min-height: 200px; }
.member-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }
.member-card__head { display: flex; align-items: center; gap: 14px; min-width: 0; }
.member-card__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.member-card__name { font-size: 1.05rem; color: var(--c-ink); line-height: 1.4; word-break: break-word; }
.member-card__role { font-size: 0.82rem; color: var(--c-ink-muted); }
.member-card__teams { display: flex; flex-wrap: wrap; gap: 6px; }
.member-card__team-tag { display: inline-flex; padding: 3px 10px; border-radius: var(--radius-full); background: var(--c-navy); color: #fff; font-size: 0.78rem; white-space: nowrap; }
.member-card__stats { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 12px; border-top: 1px solid var(--c-line); margin-top: auto; }
.member-card__stat { display: flex; flex-direction: column; gap: 2px; }
.member-card__stat--red { align-items: flex-end; }
.member-card__stat-value { font-size: 1.1rem; color: var(--c-navy); line-height: 1; }
.member-card__stat--red .member-card__stat-value { color: var(--c-red); }
.member-card__stat-label { font-size: 0.75rem; color: var(--c-ink-muted); }`
);

/* ═══════════════ 23. member-card component ═══════════════ */
F(
  "src/components/member/MemberCard.tsx",
  `import { Link } from 'react-router-dom';
import type { Member } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { ROLE_LABEL } from '@/lib/permissions';
import { teams } from '@/data/teams';
import { hoursToPoints } from '@/lib/format';

interface MemberCardProps { member: Member; showTeam?: boolean; showCommittee?: boolean; }

export function MemberCard({ member, showTeam = true }: MemberCardProps) {
  const totalPoints = hoursToPoints(member.hours || 0);
  const memberTeams = teams.filter((t) => member.teamIds.includes(t.id));
  return (
    <Link to={'/members/' + member.id} className="member-card">
      <div className="member-card__head">
        <Avatar name={member.name} size={56} variant="navy" />
        <div className="member-card__info">
          <div className="member-card__name">{member.name}</div>
          <div className="member-card__role">{ROLE_LABEL[member.role]}</div>
        </div>
      </div>
      {showTeam && memberTeams.length > 0 ? (
        <div className="member-card__teams">
          {memberTeams.map((t) => <span key={t.id} className="member-card__team-tag">{t.name}</span>)}
        </div>
      ) : null}
      <div className="member-card__stats">
        <div className="member-card__stat"><span className="member-card__stat-value">{member.hours || 0}</span><span className="member-card__stat-label">Hours</span></div>
        <div className="member-card__stat member-card__stat--red"><span className="member-card__stat-value">{totalPoints}</span><span className="member-card__stat-label">Points</span></div>
      </div>
    </Link>
  );
}`
);

/* ═══════════════ 24. AVATAR ═══════════════ */
F(
  "src/components/ui/Avatar.tsx",
  `interface AvatarProps { name?: string; size?: number; variant?: 'navy' | 'red' | 'gradient' | 'light'; src?: string; }

const BG: Record<string, string> = {
  navy: 'var(--c-navy)', red: 'var(--c-red)',
  gradient: 'linear-gradient(150deg, var(--c-red), var(--c-red-soft))',
  light: 'var(--c-off-white)',
};

export function Avatar({ name, size = 44, variant = 'navy', src }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name ?? ''} width={size} height={size} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.9)' }} />;
  }
  return (
    <div aria-label={name ?? 'Member'} title={name} style={{
      width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center',
      background: BG[variant], color: variant === 'light' ? 'var(--c-navy)' : '#fff',
      flexShrink: 0, border: variant === 'light' ? '1.5px solid var(--c-line-mid)' : '2px solid rgba(255,255,255,0.15)',
    }}>
      <svg width={Math.round(size * 0.5)} height={Math.round(size * 0.5)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    </div>
  );
}`
);

/* ═══════════════ 25. TEAM CARD ═══════════════ */
F(
  "src/components/team/TeamCard.tsx",
  `import { Link } from 'react-router-dom';
import type { Team } from '@/types';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { hoursToPoints } from '@/lib/format';
import type { Member } from '@/types';

interface TeamCardProps { team: Team; rank?: number; }

export function TeamCard({ team, rank }: TeamCardProps) {
  const { data: members } = useRealtimeCollection<Member>('members');
  const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
  const totalHours = teamMembers.reduce((sum, m) => sum + (m.hours || 0), 0);
  const totalPoints = hoursToPoints(totalHours);
  const avgPoints = teamMembers.length === 0 ? 0 : Math.round(totalPoints / teamMembers.length);
  return (
    <Link to={'/teams/' + team.id} className="team-card">
      <div className="team-card__head">
        <div className="team-card__name">{team.name}</div>
        {rank !== undefined ? <span className={'team-card__rank' + (rank === 1 ? ' team-card__rank--first' : '')}>#{rank}</span> : null}
      </div>
      <div className="team-card__stats">
        <div className="team-card__stat"><span className="team-card__stat-value">{totalPoints}</span><span className="team-card__stat-label">Points</span></div>
        <div className="team-card__stat"><span className="team-card__stat-value">{teamMembers.length}</span><span className="team-card__stat-label">Members</span></div>
        <div className="team-card__stat"><span className="team-card__stat-value">{avgPoints}</span><span className="team-card__stat-label">Average</span></div>
      </div>
    </Link>
  );
}`
);

/* ═══════════════ 26. FORMAT.TS ═══════════════ */
F(
  "src/lib/format.ts",
  `export function cx(...p: Array<string | false | null | undefined>): string { return p.filter(Boolean).join(' '); }

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
export function formatTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
export function relativeTime(iso: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  if (hrs < 24) return hrs + 'h ago';
  if (days < 30) return days + 'd ago';
  return formatDate(iso);
}
export function initials(name: string): string {
  const parts = name.trim().split(/\\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
export function hoursToPoints(hours: number): number { return Math.round(hours * 5); }
export function truncate(text: string, len = 90): string { return text.length <= len ? text : text.slice(0, len) + '...'; }
export function today(): string { return new Date().toISOString().slice(0, 10); }
const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export function getArabicMonth(m: number): string { return EN_MONTHS[m]; }
export function getDaysInMonth(y: number, m: number): number { return new Date(y, m + 1, 0).getDate(); }
export function getFirstWeekdayOfMonth(y: number, m: number): number { return new Date(y, m, 1).getDay(); }
export const REQUEST_TYPE_LABEL: Record<string, string> = { TRANSFER: 'Transfer', PROMOTION: 'Promotion', RESIGNATION: 'Resignation', COMPLAINT: 'Complaint', SUGGESTION: 'Suggestion', LEAVE: 'Leave' };
export const REQUEST_STATUS_LABEL: Record<string, string> = { PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled', COMPLETED: 'Completed' };
export const PRIORITY_LABEL: Record<string, string> = { LOW: 'Low', NORMAL: 'Normal', HIGH: 'High', URGENT: 'Urgent' };
export const APPROVAL_STATUS_LABEL: Record<string, string> = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', SKIPPED: 'Skipped' };`
);

/* ═══════════════ 27. PERMISSIONS.TS ═══════════════ */
F(
  "src/lib/permissions.ts",
  `import type { AppUser, RoleId, TeamId, RequestRecord, ApprovalStep } from '@/types';

export const ROLE_LEVEL: Record<RoleId, number> = { HEAD: 100, VICE: 95, HEAD_HR: 90, PRESIDENT: 80, VICE_PRESIDENT: 70, HR: 60, MEMBER: 50, VIEWER: 10 };

export function isAdmin(user: AppUser | null): boolean { if (!user) return false; return user.role === 'HEAD' || user.role === 'VICE'; }
export function isManager(user: AppUser | null): boolean { if (!user) return false; return ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(user.role); }
export function seesAllTeams(user: AppUser | null): boolean { if (!user) return false; return ['HEAD', 'VICE', 'HEAD_HR'].includes(user.role); }
export function managedTeam(user: AppUser | null): TeamId | null { if (!user) return null; if (seesAllTeams(user)) return null; return user.teamId; }
export function canApproveStep(user: AppUser | null, step: ApprovalStep): boolean {
  if (!user) return false;
  if (step.status !== 'PENDING') return false;
  if (isAdmin(user)) return true;
  if (user.role !== step.requiredRole) return false;
  if (step.requiredTeamId !== null) return user.teamId === step.requiredTeamId;
  return true;
}
export function canApproveRequest(user: AppUser | null, request: RequestRecord, steps: ApprovalStep[]): boolean {
  if (!user) return false;
  const currentStep = steps.find((s) => s.status === 'PENDING' && s.order === request.currentStepOrder);
  if (!currentStep) return false;
  return canApproveStep(user, currentStep);
}
export function canSendNotifications(user: AppUser | null): boolean { if (!user) return false; return ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(user.role); }
export function canManageMembers(user: AppUser | null): boolean { return isAdmin(user); }
export function canManageConversations(user: AppUser | null): boolean { return isAdmin(user); }
export function canSeeMember(user: AppUser | null, member: { teamIds: TeamId[] }): boolean {
  if (!user) return false;
  if (seesAllTeams(user)) return true;
  if (user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT' || user.role === 'HR') return user.teamId !== null && member.teamIds.includes(user.teamId);
  return true;
}
export const ROLE_LABEL: Record<RoleId, string> = {
  HEAD: 'Head', VICE: 'Vice Head', HEAD_HR: 'Head of HR', PRESIDENT: 'Team President', VICE_PRESIDENT: 'Vice President', HR: 'HR', MEMBER: 'Member', VIEWER: 'Viewer',
};`
);

/* ═══════════════ 28. SITE.TS ═══════════════ */
F(
  "src/data/site.ts",
  `import type { SiteConfig, Season } from '@/types';

export const site: SiteConfig = {
  name: 'sbapiaryy',
  tagline: 'Resala STEM Sub Branches — Season 7',
  description: 'The official platform for Resala STEM Sub Branches',
  organization: 'Resala STEM',
  email: 'hello@resala-stem.org',
};

export const seasons: Season[] = [
  { id: 'S7', label: 'Season 7', labelEn: 'Season 7', start: '2025-09-01', end: '2026-06-30', isActive: true, theme: 'Your youth before your old age' },
  { id: 'S6', label: 'Season 6', labelEn: 'Season 6', start: '2024-09-01', end: '2025-06-30', isActive: false, theme: 'Reach further.' },
];

export const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];`
);

/* ═══════════════ 29. ROLES.TS ═══════════════ */
F(
  "src/data/roles.ts",
  `import type { Role } from '@/types';

export const roles: Role[] = [
  { id: 'HEAD', name: 'Head', nameEn: 'Head', level: 100 },
  { id: 'VICE', name: 'Vice Head', nameEn: 'Vice Head', level: 95 },
  { id: 'HEAD_HR', name: 'Head of HR', nameEn: 'Head of HR', level: 90 },
  { id: 'PRESIDENT', name: 'Team President', nameEn: 'Team President', level: 80 },
  { id: 'VICE_PRESIDENT', name: 'Vice President', nameEn: 'Vice President', level: 70 },
  { id: 'HR', name: 'HR', nameEn: 'HR', level: 60 },
  { id: 'MEMBER', name: 'Member', nameEn: 'Member', level: 50 },
  { id: 'VIEWER', name: 'Viewer', nameEn: 'Viewer', level: 10 },
];

export const roleLabels: Record<string, string> = {
  HEAD: 'Head', VICE: 'Vice Head', HEAD_HR: 'Head of HR', PRESIDENT: 'Team President', VICE_PRESIDENT: 'Vice President', HR: 'HR', MEMBER: 'Member', VIEWER: 'Viewer',
};`
);

/* ═══════════════ 30. ONBOARDING DATA ═══════════════ */
F(
  "src/data/onboarding.ts",
  `import type { OnboardingCard } from '@/types';

export const onboardingCards: OnboardingCard[] = [
  { id: 'welcome', icon: '', title: 'Welcome to sbapiaryy', description: 'The platform for Resala STEM Sub Branches — members, teams, contributions, requests, and achievements in one place.', accentColor: '#C1272D', order: 1 },
  { id: 'teams', icon: '', title: 'Seven Specialized Teams', description: 'Helpers · Heroes · Coders · Enviros · Messages · Masar · RSTC', accentColor: '#60A5FA', order: 2 },
  { id: 'contributions', icon: '', title: 'Log Your Hours', description: 'Every approved hour = 5 points. Log your contributions and get your team president approval.', accentColor: '#16A34A', order: 3 },
  { id: 'league', icon: '', title: 'League & Competition', description: 'Your rank across team, committee, and the whole organization. Track your progress and compete.', accentColor: '#F59E0B', order: 4 },
  { id: 'requests', icon: '', title: 'Requests & Approvals', description: 'Request a transfer, promotion, leave, or file a complaint. Clear approval chain, live tracking.', accentColor: '#A78BFA', order: 5 },
  { id: 'messages', icon: '', title: 'Live Messaging', description: 'Talk with your team, management, or the general chat — all inside the platform.', accentColor: '#EC4899', order: 6 },
  { id: 'calendar', icon: '', title: 'Shared Calendar', description: 'All events, meetings, and deadlines in one place.', accentColor: '#22D3EE', order: 7 },
  { id: 'pwa', icon: '', title: 'Install the App', description: 'Add sbapiaryy to your phone home screen and use it like a native app.', accentColor: '#C1272D', order: 8 },
];`
);

/* ═══════════════ 31. ONBOARDING COMPONENT ═══════════════ */
F(
  "src/components/onboarding/Onboarding.tsx",
  `import { useEffect, useState } from 'react';
import { onboardingCards, site } from '@/data';
import { hasCompletedOnboarding, markOnboardingComplete } from '@/lib/onboarding';

export function Onboarding() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!hasCompletedOnboarding()) { setVisible(true); document.body.style.overflow = 'hidden'; }
    return () => { document.body.style.overflow = ''; };
  }, []);
  const finish = () => { markOnboardingComplete(); setVisible(false); document.body.style.overflow = ''; };
  if (!visible) return null;
  const sorted = [...onboardingCards].sort((a, b) => a.order - b.order);
  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true">
      <div className="onboarding-header">
        <div className="onboarding-header__title">Welcome to {site.name}</div>
        <div className="onboarding-header__subtitle">Learn about the platform in one minute</div>
      </div>
      <div className="onboarding-body">
        <div className="onboarding-grid">
          {sorted.map((card) => (
            <div key={card.id} className="onboarding-card">
              <div className="onboarding-card__title">{card.title}</div>
              <div className="onboarding-card__desc">{card.description}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="onboarding-footer">
        <button type="button" className="onboarding-cta" onClick={finish}>Got it, let's start</button>
      </div>
    </div>
  );
}`
);

/* ═══════════════ 32. ONBOARDING.CSS ═══════════════ */
F(
  "src/styles/onboarding.css",
  `.onboarding-backdrop { position: fixed; inset: 0; background: #FFFFFF; z-index: 500; display: flex; flex-direction: column; padding: 32px 24px; padding-top: calc(32px + var(--safe-top)); padding-bottom: calc(32px + var(--safe-bottom)); overflow-y: auto; animation: onboarding-in 0.35s; }
@keyframes onboarding-in { from { opacity: 0; } to { opacity: 1; } }
.onboarding-header { text-align: center; padding: 24px 16px 8px; flex-shrink: 0; }
.onboarding-header__title { font-size: 1.75rem; color: var(--c-navy); margin-bottom: 10px; }
.onboarding-header__subtitle { font-size: 1rem; color: var(--c-ink-muted); max-width: 40ch; margin: 0 auto; line-height: 1.7; }
.onboarding-body { flex: 1; max-width: 960px; width: 100%; margin-inline: auto; }
.onboarding-grid { display: grid; grid-template-columns: 1fr; gap: 16px; padding-block: 24px; }
@media (min-width: 640px) { .onboarding-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }
.onboarding-card { background: var(--c-white); border: 1.5px solid var(--c-line); border-radius: var(--radius-lg); padding: 24px 22px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow-sm); position: relative; overflow: hidden; }
.onboarding-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--c-red); }
.onboarding-card__title { font-size: 1.15rem; color: var(--c-navy); padding-left: 8px; }
.onboarding-card__desc { font-size: 0.92rem; color: var(--c-ink-soft); line-height: 1.75; padding-left: 8px; }
.onboarding-footer { padding: 24px 20px 8px; text-align: center; flex-shrink: 0; }
.onboarding-cta { display: inline-flex; align-items: center; gap: 8px; padding: 15px 40px; border-radius: var(--radius-full); border: none; background: var(--c-red); color: #fff; font-family: inherit; font-size: 1.1rem; cursor: pointer; transition: all 0.15s; box-shadow: var(--shadow-red); }
.onboarding-cta:hover { background: var(--c-red-soft); transform: translateY(-1px); }
.onboarding-cta:active { transform: scale(0.98); }`
);

/* ═══════════════ 33. NAVBAR COMPONENT ═══════════════ */
F(
  "src/components/layout/Navbar.tsx",
  `import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { logout } from '@/lib/auth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { site } from '@/data';
import { IconBell } from '@/components/ui/Icons';
import type { Notification } from '@/types';

interface NavbarProps { onMenuToggle?: () => void; }

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user } = useAuth();
  const nav = useNavigate();
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');
  const unread = user ? notifs.filter((n) => n.userId === user.uid && !n.read).length : 0;
  const doLogout = async () => { await logout(); nav('/'); };
  return (
    <header className="navbar no-print">
      <div className="container navbar__inner">
        <Link to={user ? '/dashboard' : '/'} className="brand">{site.name}</Link>
        <div className="nav-actions">
          {user ? (
            <>
              {onMenuToggle ? (
                <button type="button" className="nav-action nav-action--icon show-mobile" onClick={onMenuToggle} aria-label="Menu">
                  <span className="nav-action__menu" aria-hidden="true"><span /><span /><span /></span>
                </button>
              ) : null}
              <Link to="/notifications" className="nav-action nav-action--icon" aria-label="Notifications">
                <IconBell size={22} />
                {unread > 0 ? <span className="nav-action__badge">{unread > 99 ? '99+' : unread}</span> : null}
              </Link>
              <button type="button" className="nav-action nav-action--danger" onClick={doLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-action nav-action--primary">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}`
);

/* ═══════════════ 34. FOOTER COMPONENT ═══════════════ */
F(
  "src/components/layout/Footer.tsx",
  `import { Link } from 'react-router-dom';
import { site, activeSeason } from '@/data';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer no-print">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand-col">
            <div className="footer__brand">{site.name}</div>
            <p className="footer__tagline">{site.description}</p>
            <div className="footer__copyright">© {year} {site.organization} — {activeSeason.label}</div>
          </div>
          <div className="footer__links-col">
            <div>
              <div className="footer__group-title">Browse</div>
              <div className="footer__links">
                <Link className="footer__link" to="/">Home</Link>
                <Link className="footer__link" to="/members">Members</Link>
                <Link className="footer__link" to="/teams">Teams</Link>
                <Link className="footer__link" to="/league">League</Link>
              </div>
            </div>
            <div>
              <div className="footer__group-title">Platform</div>
              <div className="footer__links">
                <Link className="footer__link" to="/committees">Committees</Link>
                <Link className="footer__link" to="/achievements">Achievements</Link>
                <Link className="footer__link" to="/calendar">Calendar</Link>
                <Link className="footer__link" to="/search">Search</Link>
              </div>
            </div>
            <div>
              <div className="footer__group-title">About</div>
              <div className="footer__links">
                <Link className="footer__link" to="/about">About</Link>
                <Link className="footer__link" to="/governance">Governance</Link>
                <Link className="footer__link" to="/login">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}`
);

/* ═══════════════ 35. BOTTOM NAV ═══════════════ */
F(
  "src/components/layout/BottomNav.tsx",
  `import { NavLink } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { cx } from '@/lib/format';
import { IconHome, IconMembers, IconChat, IconBell, IconAdmin } from '@/components/ui/Icons';
import type { Notification } from '@/types';

interface NavTab { to: string; label: string; Icon: (props: { size?: number }) => JSX.Element; badge?: number; }

export function BottomNav() {
  const { user, manager } = useAuth();
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');
  if (!user) return null;
  const unread = notifs.filter((n) => n.userId === user.uid && !n.read).length;
  const tabs: NavTab[] = [
    { to: '/dashboard', label: 'Home', Icon: IconHome },
    { to: '/members', label: 'Members', Icon: IconMembers },
    { to: '/conversations', label: 'Chats', Icon: IconChat },
    { to: '/notifications', label: 'Alerts', Icon: IconBell, badge: unread },
    { to: manager ? '/admin' : '/profile', label: manager ? 'Admin' : 'Profile', Icon: IconAdmin },
  ];
  return (
    <nav className="bottom-nav no-print" aria-label="Quick navigation">
      <div className="bottom-nav__inner">
        {tabs.map((tab) => {
          const { Icon } = tab;
          return (
            <NavLink key={tab.to} to={tab.to} end={tab.to === '/dashboard' || tab.to === '/admin'}
              className={({ isActive }) => cx('bottom-nav__item', isActive && 'is-active')}>
              <span className="bottom-nav__icon"><Icon size={24} /></span>
              <span className="bottom-nav__label">{tab.label}</span>
              {tab.badge && tab.badge > 0 ? <span className="bottom-nav__badge">{tab.badge > 99 ? '99+' : tab.badge}</span> : null}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}`
);

/* ═══════════════ 36. SIDEBAR ═══════════════ */
F(
  "src/components/layout/Sidebar.tsx",
  `import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { logout } from '@/lib/auth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { ROLE_LABEL, isAdmin, seesAllTeams } from '@/lib/permissions';
import { cx } from '@/lib/format';
import type { ApprovalStep } from '@/types';

interface NavItem { to: string; label: string; count?: number; }
interface SidebarProps { open: boolean; onClose: () => void; }

function buildAdminNav(pending: number): NavItem[] {
  return [
    { to: '/admin', label: 'Admin Dashboard' },
    { to: '/admin/analytics', label: 'Analytics' },
    { to: '/admin/requests', label: 'Requests', count: pending },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/members', label: 'Members' },
    { to: '/admin/contributions', label: 'Contributions' },
    { to: '/admin/committees', label: 'Committees' },
    { to: '/admin/achievements', label: 'Achievements' },
    { to: '/admin/warnings', label: 'Warnings' },
    { to: '/admin/calendar', label: 'Calendar' },
    { to: '/admin/conversations', label: 'Conversations' },
    { to: '/admin/notifications', label: 'Send Notification' },
    { to: '/admin/governance', label: 'Governance' },
    { to: '/admin/audit', label: 'Audit Log' },
  ];
}
function buildManagerNav(pending: number): NavItem[] {
  return [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/members', label: 'Members' },
    { to: '/requests', label: 'Requests' },
    { to: '/approvals', label: 'Approvals', count: pending },
    { to: '/contributions', label: 'Contributions' },
    { to: '/committees', label: 'Committees' },
    { to: '/league', label: 'League' },
    { to: '/achievements', label: 'Achievements' },
    { to: '/warnings', label: 'Warnings' },
    { to: '/conversations', label: 'Conversations' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/reports', label: 'Reports' },
    { to: '/governance', label: 'Governance' },
  ];
}
function buildMemberNav(): NavItem[] {
  return [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'My Profile' },
    { to: '/my-contributions', label: 'My Contributions' },
    { to: '/requests/new', label: 'New Request' },
    { to: '/my-requests', label: 'My Requests' },
    { to: '/committees', label: 'Committees' },
    { to: '/league', label: 'League' },
    { to: '/achievements', label: 'Achievements' },
    { to: '/conversations', label: 'Conversations' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/governance', label: 'Governance' },
  ];
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const nav = useNavigate();
  const { data: approvals } = useRealtimeCollection<ApprovalStep>('approvals');
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  if (!user) return null;
  const pending = approvals.filter((a) => {
    if (a.status !== 'PENDING') return false;
    if (isAdmin(user)) return true;
    if (a.requiredRole !== user.role) return false;
    if (a.requiredTeamId !== null && a.requiredTeamId !== user.teamId) return false;
    return true;
  }).length;
  let items: NavItem[];
  if (isAdmin(user)) items = buildAdminNav(pending);
  else if (user.role === 'MEMBER' || user.role === 'VIEWER') items = buildMemberNav();
  else items = buildManagerNav(pending);
  const handleLogout = async () => { onClose(); await logout(); nav('/'); };
  const handleNavClick = () => { if (isMobile) onClose(); };
  return (
    <>
      <div className={'sidebar-overlay' + (open ? ' is-open' : '')} onClick={onClose} aria-hidden="true" />
      <aside className={'sidebar no-print' + (open ? ' is-open' : '')}>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">×</button>
        <div className="sidebar__user">
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user.displayName}</div>
            <div className="sidebar__user-role">{ROLE_LABEL[user.role]}</div>
          </div>
        </div>
        <div className="sidebar__group">
          <div className="sidebar__title">{seesAllTeams(user) ? 'Administration' : 'Menu'}</div>
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.to === '/dashboard' || it.to === '/admin' || it.to === '/'}
              onClick={handleNavClick}
              className={({ isActive }) => cx('sidebar__link', isActive && 'is-active')}>
              <span>{it.label}</span>
              {it.count && it.count > 0 ? <span className="sidebar__count">{it.count > 99 ? '99+' : it.count}</span> : null}
            </NavLink>
          ))}
        </div>
        <div className="sidebar__group">
          <div className="sidebar__title">Account</div>
          <button type="button" className="sidebar__link sidebar__link--danger" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
    </>
  );
}`
);

/* ═══════════════ 37. HOMEPAGE ═══════════════ */
F(
  "src/pages/HomePage.tsx",
  `import { Link } from 'react-router-dom';
import { site, activeSeason } from '@/data';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { teams } from '@/data/teams';
import { hoursToPoints } from '@/lib/format';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TeamCard } from '@/components/team/TeamCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Member, Contribution } from '@/types';

export function HomePage() {
  const { user } = useAuth();
  const { data: members, loading: lM } = useRealtimeCollection<Member>('members');
  const { data: contributions, loading: lC } = useRealtimeCollection<Contribution>('contributions');
  const isLoading = lM || lC;
  const activeMembers = members.filter((m) => m.status === 'active');
  const totalHours = contributions.filter((c) => c.status === 'approved').reduce((s, c) => s + c.hours, 0);
  const totalPoints = hoursToPoints(totalHours);
  const teamRanking = teams.map((team) => {
    const tm = activeMembers.filter((m) => m.teamIds.includes(team.id));
    const pts = tm.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);
    return { team, points: pts };
  }).sort((a, b) => b.points - a.points).map((r, i) => ({ ...r, rank: i + 1 }));
  const topMembers = [...activeMembers]
    .filter((m) => m.role !== 'HEAD' && m.role !== 'VICE')
    .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
    .slice(0, 5)
    .map((m, i) => ({ member: m, rank: i + 1 }));
  return (
    <>
      <section className="home-hero">
        <div className="container">
          <div className="section-head__eyebrow">{activeSeason.label}</div>
          <h1 className="home-hero__title">The <span className="home-hero__brand">{site.organization}</span> Sub Branches Hub</h1>
          <p className="home-hero__desc">{site.description}</p>
          <div className="home-hero__actions">
            <Link to="/members" className="btn btn--primary">Browse Members</Link>
            <Link to="/league" className="btn btn--ghost">View League</Link>
            {!user ? <Link to="/login" className="btn btn--ghost">Sign In</Link> : null}
          </div>
        </div>
      </section>
      <section className="home-section">
        <div className="container">
          {isLoading ? <Loading /> : (
            <div className="home-stats">
              <div className="stat"><div className="stat__value">{activeMembers.length}</div><div className="stat__label">Members</div></div>
              <div className="stat"><div className="stat__value">{teams.length}</div><div className="stat__label">Teams</div></div>
              <div className="stat"><div className="stat__value">{totalPoints}</div><div className="stat__label">Total Points</div></div>
              <div className="stat"><div className="stat__value">{totalHours}</div><div className="stat__label">Total Hours</div></div>
            </div>
          )}
        </div>
      </section>
      <section className="home-section">
        <div className="container">
          <SectionHeader eyebrow="Team Standings" title="Teams by Points" action={<Link to="/teams" className="btn btn--ghost btn--sm">All Teams</Link>} />
          {isLoading ? <Loading /> : teamRanking.length === 0 ? <EmptyState title="No data" message="No teams yet." /> : (
            <div className="home-teams-grid">
              {teamRanking.map((r) => <TeamCard key={r.team.id} team={r.team} rank={r.rank} />)}
            </div>
          )}
        </div>
      </section>
      <section className="home-section">
        <div className="container">
          <SectionHeader eyebrow="General Ranking" title="Top Members" action={<Link to="/league" className="btn btn--ghost btn--sm">Full Leaderboard</Link>} />
          {isLoading ? <Loading /> : topMembers.length === 0 ? <EmptyState title="No members" message="No members yet." /> : (
            <div className="league-table">
              <div className="league-table__head"><span>#</span><span>Member</span><span>Team</span><span>Hours</span><span>Points</span></div>
              {topMembers.map((e) => {
                const tm = teams.filter((t) => e.member.teamIds.includes(t.id));
                return (
                  <Link key={e.member.id} to={'/members/' + e.member.id} className="league-table__row">
                    <span className={'col-rank' + (e.rank <= 3 ? ' rank-' + e.rank : '')}>{e.rank}</span>
                    <span className="col-name"><Avatar name={e.member.name} size={32} variant="navy" /><span className="league-table__name">{e.member.name}</span></span>
                    <span className="col-team">{tm.map((t) => <span key={t.id} className="badge">{t.name}</span>)}</span>
                    <span className="col-hours">{e.member.hours}</span>
                    <span className="col-points">{hoursToPoints(e.member.hours)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      {!user ? (
        <section className="home-section">
          <div className="container">
            <div className="home-join-cta">
              <Badge variant="red" dot>{activeSeason.theme}</Badge>
              <h2 className="home-join-cta__title">Join the Hub</h2>
              <p className="home-join-cta__desc">Sign in to track your contributions, league progress, and pending approvals.</p>
              <div className="home-join-cta__actions"><Link to="/login" className="btn btn--primary">Sign In</Link></div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}`
);

/* ═══════════════ 38. LOGIN PAGE ═══════════════ */
F(
  "src/pages/LoginPage.tsx",
  `import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/lib/auth';

export function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try { await login(email.trim(), password); nav('/dashboard'); }
    catch (err: unknown) { setError(translateError(err)); }
    finally { setBusy(false); }
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <form onSubmit={onSubmit}>
          <div className="login-field">
            <label className="login-label">Email</label>
            <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@resala-stem.org" autoComplete="email" required dir="ltr" />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="........" autoComplete="current-password" required dir="ltr" />
          </div>
          {error ? <div className="login-error">{error}</div> : null}
          <button type="submit" className="login-submit" disabled={busy || !email || !password}>{busy ? '...' : 'Sign In'}</button>
        </form>
        <p className="login-back"><Link to="/">Back to Home</Link></p>
      </div>
    </div>
  );
}

function translateError(err: unknown): string {
  const msg = err instanceof Error ? err.message : 'Unexpected error';
  if (msg.includes('invalid-credential')) return 'Invalid email or password';
  if (msg.includes('user-not-found')) return 'No account with this email';
  if (msg.includes('wrong-password')) return 'Incorrect password';
  if (msg.includes('invalid-email')) return 'Invalid email';
  if (msg.includes('network-request-failed')) return 'Network error';
  if (msg.includes('too-many-requests')) return 'Too many attempts. Try later.';
  return msg;
}`
);

/* ═══════════════ 39. NOTIFICATIONS PAGE + ITEM ═══════════════ */
F(
  "src/components/notification/NotificationItem.tsx",
  `import { useNavigate } from 'react-router-dom';
import type { Notification } from '@/types';
import { relativeTime } from '@/lib/format';

interface NotificationItemProps { notification: Notification; onMarkRead?: (id: string) => void; }

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const nav = useNavigate();
  const handleClick = () => {
    if (!notification.read && onMarkRead) onMarkRead(notification.id);
    if (notification.route) nav(notification.route);
  };
  return (
    <div className={'notif-item' + (!notification.read ? ' notif-item--unread' : '')} onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}>
      <div className="notif-item__body">
        <div className="notif-item__title">{notification.title}</div>
        <div className="notif-item__message">{notification.message}</div>
        <div className="notif-item__meta">
          {notification.fromName ? <><span className="notif-item__from">{notification.fromName}</span><span className="notif-item__dot">·</span></> : null}
          <span>{relativeTime(notification.date)}</span>
          {notification.priority === 'high' ? <span className="notif-item__priority notif-item__priority--high">Important</span> : null}
        </div>
      </div>
    </div>
  );
}`
);

F(
  "src/pages/NotificationsPage.tsx",
  `import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { updateOne } from '@/lib/db';
import { PageHeader } from '@/components/ui/PageHeader';
import { NotificationItem } from '@/components/notification/NotificationItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { toast } from '@/components/ui/Toast';
import type { Notification } from '@/types';

export function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifs, loading } = useRealtimeCollection<Notification>('notifications');
  if (!user) return null;
  const mine = notifs.filter((n) => n.userId === user.uid).sort((a, b) => (a.date < b.date ? 1 : -1));
  const unreadCount = mine.filter((n) => !n.read).length;
  const markRead = async (id: string) => { try { await updateOne('notifications', id, { read: true }); } catch { /* ignore */ } };
  const markAllRead = async () => {
    try { for (const n of mine) { if (!n.read) await updateOne('notifications', n.id, { read: true }); } toast.success('All marked as read'); }
    catch { toast.error('Failed to update'); }
  };
  return (
    <div className="container">
      <PageHeader eyebrow="Notifications" title="Notifications" description={unreadCount > 0 ? 'You have ' + unreadCount + ' unread notification(s)' : 'All caught up'}>
        {unreadCount > 0 ? <button type="button" className="btn btn--ghost btn--sm mt-4" onClick={markAllRead}>Mark all as read</button> : null}
      </PageHeader>
      <section className="section">
        {loading ? <SkeletonList count={5} /> : mine.length === 0 ? (
          <EmptyState title="No notifications" message="You have no notifications yet. When something happens related to you, it will appear here." />
        ) : (
          <div className="stack">{mine.map((n) => <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />)}</div>
        )}
      </section>
    </div>
  );
}`
);

/* ═══════════════ 40. CONVERSATIONS PAGE ═══════════════ */
F(
  "src/pages/ConversationsPage.tsx",
  `import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { createOne, updateOne, newId, now } from '@/lib/db';
import { teams } from '@/data/teams';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Composer } from '@/components/chat/Composer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { relativeTime } from '@/lib/format';
import type { Conversation, Message, AppUser, TeamId } from '@/types';

export function ConversationsPage() {
  const { user } = useAuth();
  const { data: conversations, loading: l1 } = useRealtimeCollection<Conversation>('conversations');
  const { data: messages, loading: l2 } = useRealtimeCollection<Message>('messages');
  const { data: users, loading: l3 } = useRealtimeCollection<AppUser>('users');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerType, setPickerType] = useState<'private' | 'team'>('private');
  const [selectedTeam, setSelectedTeam] = useState<TeamId>('helpers');
  const [busy, setBusy] = useState(false);

  const others = useMemo(() => {
    if (!user) return [];
    return users.filter((u) => u.uid !== user.uid).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [users, user]);

  const filteredOthers = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return others;
    return others.filter((u) => u.displayName.toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q));
  }, [others, pickerQuery]);

  const myConvs = useMemo(() => {
    if (!user) return [];
    return conversations.filter((c) => {
      if (c.type === 'general') return true;
      if (c.type === 'team') return c.teamId === user.teamId;
      return c.participantUids.includes(user.uid);
    });
  }, [conversations, user]);

  const defaultId = useMemo(() => myConvs.find((c) => c.type === 'general')?.id ?? null, [myConvs]);
  const currentId = activeId ?? defaultId;
  const active = currentId ? myConvs.find((c) => c.id === currentId) : null;

  const activeMsgs = useMemo(() => {
    if (!currentId) return [];
    return messages.filter((m) => m.conversationId === currentId).sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1));
  }, [messages, currentId]);

  if (!user) return null;
  if (l1 || l2 || l3) return <Loading fullHeight message="Loading conversations..." />;

  const getConvName = (): string => {
    if (!active) return '';
    if (active.type === 'general') return 'General Chat';
    if (active.type === 'team') return 'Team ' + (teams.find((t) => t.id === active.teamId)?.name ?? '');
    const otherUid = active.participantUids.find((u) => u !== user.uid);
    return users.find((u) => u.uid === otherUid)?.displayName ?? 'Private chat';
  };

  const getConvAvatar = (): { text: string; variant: 'general' | 'team' | 'private' } => {
    if (!active) return { text: '?', variant: 'private' };
    if (active.type === 'general') return { text: '#', variant: 'general' };
    if (active.type === 'team') return { text: (teams.find((t) => t.id === active.teamId)?.name ?? 'T').slice(0, 2), variant: 'team' };
    const otherUid = active.participantUids.find((u) => u !== user.uid);
    const other = users.find((u) => u.uid === otherUid);
    return { text: other ? other.displayName.charAt(0) : '?', variant: 'private' };
  };

  const sendMessage = async (text: string) => {
    if (!currentId) return;
    const msg: Message = { id: newId('MSG'), conversationId: currentId, senderUid: user.uid, senderName: user.displayName, text, sentAt: now() };
    try {
      await createOne('messages', msg);
      await updateOne('conversations', currentId, { lastMessageAt: now(), lastMessageText: text, lastMessageSender: user.displayName });
    } catch (e) { toast.error('Failed to send', e instanceof Error ? e.message : ''); }
  };

  const startPrivateChat = async (targetUid: string) => {
    const existing = conversations.find((c) => c.type === 'private' && c.participantUids.length === 2 && c.participantUids.includes(user.uid) && c.participantUids.includes(targetUid));
    if (existing) {
      setActiveId(existing.id);
      setMobileShowChat(true);
      setOpenPicker(false);
      setPickerQuery('');
      toast.info('Chat already exists — opened it');
      return;
    }
    setBusy(true);
    try {
      const id = newId('CONV');
      await createOne('conversations', { id, type: 'private', title: '', participantUids: [user.uid, targetUid], lastMessageAt: now(), createdBy: user.uid });
      setActiveId(id);
      setMobileShowChat(true);
      setOpenPicker(false);
      setPickerQuery('');
      toast.success('Chat created');
    } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
    finally { setBusy(false); }
  };

  const startTeamChat = async () => {
    const id = 'CONV-TEAM-' + selectedTeam;
    const existing = conversations.find((c) => c.id === id);
    if (existing) {
      setActiveId(id);
      setMobileShowChat(true);
      setOpenPicker(false);
      return;
    }
    setBusy(true);
    try {
      await createOne('conversations', { id, type: 'team', title: 'Team ' + (teams.find((t) => t.id === selectedTeam)?.name ?? ''), teamId: selectedTeam, participantUids: [], lastMessageAt: now(), createdBy: user.uid });
      setActiveId(id);
      setMobileShowChat(true);
      setOpenPicker(false);
      toast.success('Team chat created');
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  const avatarInfo = getConvAvatar();

  return (
    <div style={{ paddingTop: 16, paddingBottom: 24 }}>
      <div className="chat-layout">
        <div className={'chat-sidebar' + (mobileShowChat ? ' is-hidden' : '')}>
          <div className="chat-sidebar__head">
            <div className="row row--between" style={{ gap: 10 }}>
              <div className="chat-sidebar__title">Conversations</div>
              <button type="button" className="chat-sidebar__new" onClick={() => { setOpenPicker(true); setPickerQuery(''); }}>+ New</button>
            </div>
          </div>
          <div className="chat-conversations">
            {myConvs.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: 'var(--c-ink-muted)', fontSize: '0.92rem' }}>
                No conversations yet
                <br />
                <button type="button" className="chat-sidebar__new" style={{ marginTop: 16 }} onClick={() => setOpenPicker(true)}>+ Start a chat</button>
              </div>
            ) : (
              [...myConvs].sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1)).map((c) => {
                const name = c.type === 'general' ? 'General Chat' : c.type === 'team' ? 'Team ' + (teams.find((t) => t.id === c.teamId)?.name ?? '') : users.find((u) => u.uid === c.participantUids.find((p) => p !== user.uid))?.displayName ?? 'Chat';
                const avt = c.type === 'general' ? '#' : c.type === 'team' ? 'T' : 'U';
                return (
                  <button key={c.id} type="button" className={'chat-conv' + (currentId === c.id ? ' is-active' : '')} onClick={() => { setActiveId(c.id); setMobileShowChat(true); }}>
                    <div className={'chat-conv__avatar chat-conv__avatar--' + c.type}>{avt}</div>
                    <div className="chat-conv__body">
                      <div className="chat-conv__top">
                        <div className="chat-conv__name">{name}</div>
                        {c.lastMessageAt ? <div className="chat-conv__time">{relativeTime(c.lastMessageAt)}</div> : null}
                      </div>
                      <div className="chat-conv__preview">
                        {c.lastMessageSender ? <strong style={{ color: 'var(--c-red)' }}>{c.lastMessageSender}: </strong> : null}
                        {c.lastMessageText || 'No messages yet'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className={'chat-panel' + (!mobileShowChat ? ' is-hidden' : '')}>
          {!active ? (
            <div className="chat-panel__empty">
              <div className="chat-panel__empty-icon">#</div>
              <div style={{ marginBottom: 8 }}>Select a conversation</div>
              <div className="small muted">Or click "+ New" to start a new one</div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button type="button" className="chat-header__back" onClick={() => setMobileShowChat(false)} aria-label="Back">&lt;</button>
                <div className={'chat-header__avatar chat-header__avatar--' + avatarInfo.variant}>{avatarInfo.text}</div>
                <div className="chat-header__info">
                  <div className="chat-header__title">{getConvName()}</div>
                  <div className="chat-header__sub">{active.type === 'general' ? 'Everyone' : active.type === 'team' ? 'Team chat' : 'Private chat'}</div>
                </div>
              </div>
              <div className="chat-messages">
                {activeMsgs.length === 0 ? <EmptyState title="Start the conversation" message="No messages yet. Be the first to write." /> :
                  activeMsgs.map((m) => <MessageBubble key={m.id} message={m} currentUser={user} />)}
              </div>
              <Composer onSend={sendMessage} />
            </>
          )}
        </div>
      </div>

      <Modal open={openPicker} title="New Conversation" onClose={() => { setOpenPicker(false); setPickerQuery(''); }} wide>
        <div className="chips" style={{ marginBottom: 16 }}>
          <button type="button" className={'chip' + (pickerType === 'private' ? ' is-active' : '')} onClick={() => setPickerType('private')}>Private chat</button>
          <button type="button" className={'chip' + (pickerType === 'team' ? ' is-active' : '')} onClick={() => setPickerType('team')}>Team chat</button>
        </div>
        {pickerType === 'private' ? (
          <>
            <input className="user-picker__search" type="search" placeholder="Search by name or email..." value={pickerQuery} onChange={(e) => setPickerQuery(e.target.value)} autoFocus />
            {filteredOthers.length === 0 ? (
              <div className="user-picker__empty">{others.length === 0 ? 'No other users on the platform yet.' : 'No results match your search.'}</div>
            ) : (
              <div className="user-picker">
                {filteredOthers.map((u) => (
                  <button key={u.uid} type="button" className="user-picker__item" onClick={() => startPrivateChat(u.uid)} disabled={busy}>
                    <div className="user-picker__avatar">{u.displayName.charAt(0)}</div>
                    <div className="user-picker__info">
                      <div className="user-picker__name">{u.displayName}</div>
                      {u.email ? <div className="user-picker__email">{u.email}</div> : null}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="small muted mb-3">Select a team to start a group chat:</p>
            <div className="chips" style={{ marginBottom: 20 }}>
              {teams.map((t) => (
                <button key={t.id} type="button" className={'chip' + (selectedTeam === t.id ? ' is-active' : '')} onClick={() => setSelectedTeam(t.id)}>{t.name}</button>
              ))}
            </div>
            <button type="button" className="btn btn--primary btn--block" onClick={startTeamChat} disabled={busy}>
              {busy ? '...' : 'Create chat for ' + (teams.find((t) => t.id === selectedTeam)?.name ?? '')}
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}`
);

/* ═══════════════ 41. MESSAGE BUBBLE + COMPOSER ═══════════════ */
F(
  "src/components/chat/MessageBubble.tsx",
  `import type { Message, AppUser } from '@/types';
import { formatTime } from '@/lib/format';

interface MessageBubbleProps { message: Message; currentUser: AppUser; }

export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
  const isMine = message.senderUid === currentUser.uid;
  return (
    <div className={'chat-message' + (isMine ? ' chat-message--mine' : '')}>
      {!isMine ? <div className="chat-message__avatar">{message.senderName.charAt(0)}</div> : null}
      <div className="chat-message__bubble">
        {!isMine ? <div className="chat-message__sender">{message.senderName}</div> : null}
        <div>{message.text}</div>
        <div className="chat-message__time">{formatTime(message.sentAt)}</div>
      </div>
    </div>
  );
}`
);

F(
  "src/components/chat/Composer.tsx",
  `import { useState, type KeyboardEvent } from 'react';

interface ComposerProps { onSend: (text: string) => Promise<void> | void; disabled?: boolean; placeholder?: string; }

export function Composer({ onSend, disabled, placeholder = 'Type a message...' }: ComposerProps) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy || disabled) return;
    setBusy(true);
    try { await onSend(trimmed); setText(''); }
    finally { setBusy(false); }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
  };
  return (
    <div className="chat-composer">
      <textarea className="chat-composer__input" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} rows={1} disabled={busy || disabled} />
      <button type="button" className="chat-composer__send" onClick={send} disabled={!text.trim() || busy || disabled} aria-label="Send">↑</button>
    </div>
  );
}`
);

/* ═══════════════ 42. ADMIN HOME ═══════════════ */
F(
  "src/pages/admin/AdminHomePage.tsx",
  `import { Link } from 'react-router-dom';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { seedAll, type SeedResult } from '@/lib/seed';
import { members } from '@/data/members';
import { committees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { toast } from '@/components/ui/Toast';
import type { AppUser, RequestRecord, Contribution, Notification, Member } from '@/types';

interface AdminCard { to: string; title: string; count?: number; description: string; }

export function AdminHomePage() {
  const { user } = useAuth();
  const { data: users } = useRealtimeCollection<AppUser>('users');
  const { data: liveMembers } = useRealtimeCollection<Member>('members');
  const { data: requests } = useRealtimeCollection<RequestRecord>('requests');
  const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const allMembers = liveMembers.length > 0 ? liveMembers : members;
  const pendingReq = requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
  const pendingContribs = contributions.filter((c) => c.status === 'pending').length;
  const totalPoints = allMembers.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);
  const onSeed = async () => {
    if (!window.confirm('This will upload the seed data. Continue?')) return;
    setSeeding(true);
    try { const r = await seedAll(); setResult(r); toast.success('Data uploaded'); }
    catch (err) { toast.error('Failed', err instanceof Error ? err.message : ''); }
    finally { setSeeding(false); }
  };
  const cards: AdminCard[] = [
    { to: '/admin/analytics', title: 'Analytics', description: 'Overview of all statistics' },
    { to: '/admin/requests', title: 'Requests', count: pendingReq, description: 'Manage all requests' },
    { to: '/admin/users', title: 'Users', count: users.length, description: 'Accounts and roles' },
    { to: '/admin/members', title: 'Members', count: allMembers.length, description: 'Member data' },
    { to: '/admin/contributions', title: 'Contributions', count: pendingContribs, description: 'Approve contributions' },
    { to: '/admin/committees', title: 'Committees', count: committees.length, description: 'Manage committees' },
    { to: '/admin/achievements', title: 'Achievements', description: 'Manage achievements' },
    { to: '/admin/warnings', title: 'Warnings', description: 'Issue and track warnings' },
    { to: '/admin/calendar', title: 'Calendar', description: 'Manage events' },
    { to: '/admin/conversations', title: 'Conversations', description: 'Manage chats' },
    { to: '/admin/notifications', title: 'Send Notification', count: notifs.length, description: 'Bulk notifications' },
    { to: '/admin/governance', title: 'Governance', description: 'Policies and documents' },
    { to: '/admin/audit', title: 'Audit Log', description: 'All admin actions' },
  ];
  return (
    <div className="admin-page">
      <section className="admin-welcome">
        <div className="admin-welcome__eyebrow">Admin Panel</div>
        <h1 className="admin-welcome__name">Welcome, {user?.displayName || 'Admin'}</h1>
        <p className="admin-welcome__subtitle">Full control over content, members, and requests.</p>
      </section>
      <section className="admin-stats">
        <div className="stat"><div className="stat__value">{users.length}</div><div className="stat__label">Users</div></div>
        <div className="stat"><div className="stat__value">{allMembers.length}</div><div className="stat__label">Members</div></div>
        <div className="stat stat--red"><div className="stat__value">{pendingReq}</div><div className="stat__label">Pending Requests</div></div>
        <div className="stat stat--amber"><div className="stat__value">{pendingContribs}</div><div className="stat__label">Pending Contributions</div></div>
        <div className="stat"><div className="stat__value">{totalPoints}</div><div className="stat__label">Total Points</div></div>
        <div className="stat"><div className="stat__value">{notifs.length}</div><div className="stat__label">Notifications</div></div>
      </section>
      <section className="admin-seed">
        <div className="admin-seed__head">
          <div>
            <div className="admin-seed__title">Upload Seed Data</div>
            <div className="admin-seed__desc">One-time only — if Firestore is empty.</div>
          </div>
          <button type="button" className="btn btn--primary" onClick={onSeed} disabled={seeding}>{seeding ? 'Uploading...' : 'Upload Data'}</button>
        </div>
        {result ? (
          <div className="admin-seed__result">✓ Members: {result.members} · Teams: {result.teams} · Contributions: {result.contributions} · Requests: {result.requests} · Approvals: {result.approvals} · Warnings: {result.warnings} · Achievements: {result.achievements} · Notifications: {result.notifications}</div>
        ) : null}
      </section>
      <section style={{ marginTop: 32 }}>
        <SectionHeader eyebrow="Sections" title="Quick Links" />
        <div className="admin-cards">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="admin-card">
              <div className="admin-card__head">
                <div className="admin-card__title">{c.title}</div>
                {c.count !== undefined && c.count > 0 ? <span className="admin-card__count">{c.count > 99 ? '99+' : c.count}</span> : null}
              </div>
              <div className="admin-card__desc">{c.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}`
);

/* ═══════════════ 43. ADMIN REQUESTS ═══════════════ */
F(
  "src/pages/admin/AdminRequestsPage.tsx",
  `import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { adminApproveAll, rejectStep } from '@/lib/approvals';
import { listWhere } from '@/lib/db';
import { teams } from '@/data/teams';
import { REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL, PRIORITY_LABEL, formatDate, cx } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, TextArea } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import type { RequestRecord, ApprovalStep, RequestStatus } from '@/types';

const STATUSES: Array<RequestStatus | 'all'> = ['all', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
const STATUS_TAB: Record<string, string> = { all: 'All', PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected' };

export function AdminRequestsPage() {
  const { user } = useAuth();
  const { data: requests, loading } = useCollection<RequestRecord>('requests');
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [rejecting, setRejecting] = useState<RequestRecord | null>(null);
  const [rejectStepData, setRejectStepData] = useState<ApprovalStep | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [toApproveAll, setToApproveAll] = useState<RequestRecord | null>(null);
  const filtered = useMemo(() => requests.filter((r) => status === 'all' || r.status === status).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)), [requests, status]);
  const openReject = async (req: RequestRecord) => {
    if (!user) return;
    const steps = await listWhere<ApprovalStep>('approvals', 'requestId', req.id);
    const step = steps.find((s) => s.status === 'PENDING' && s.order === req.currentStepOrder);
    if (!step) { toast.error('No pending step'); return; }
    setRejecting(req);
    setRejectStepData(step);
    setComment('');
  };
  const doReject = async () => {
    if (!user || !rejecting || !rejectStepData) return;
    if (!comment.trim()) { toast.error('Rejection reason is required'); return; }
    setBusy(true);
    try {
      await rejectStep(rejecting, rejectStepData, user, comment);
      toast.success('Request rejected');
      setRejecting(null);
      setRejectStepData(null);
      setComment('');
    } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
    finally { setBusy(false); }
  };
  const doApproveAll = async () => {
    if (!user || !toApproveAll) return;
    setBusy(true);
    try {
      await adminApproveAll(toApproveAll, user);
      toast.success('Final approval — all stages skipped');
      setToApproveAll(null);
    } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
    finally { setBusy(false); }
  };
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Requests" description="Your approval as admin = final. Skips all stages with one click." />
      <div className="chips mb-4">
        {STATUSES.map((s) => (
          <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_TAB[s]}</button>
        ))}
      </div>
      <SectionHeader eyebrow="List" title={'Requests (' + filtered.length + ')'} />
      {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? <EmptyState title="No requests" message="No matching requests." /> : (
        <div className="stack">
          {filtered.map((r) => {
            const fromTeam = r.fromTeamId ? teams.find((t) => t.id === r.fromTeamId) : null;
            const toTeam = r.toTeamId ? teams.find((t) => t.id === r.toTeamId) : null;
            const isActive = r.status === 'PENDING' || r.status === 'IN_REVIEW';
            return (
              <div key={r.id} className="admin-request-card">
                <div className="admin-request-card__head">
                  <div className="admin-request-card__info">
                    <div className="admin-request-card__title">{r.title}</div>
                    <div className="admin-request-card__meta">
                      {r.requesterName} · {formatDate(r.submittedAt)}
                      {fromTeam ? ' · from ' + fromTeam.name : ''}
                      {toTeam ? ' · to ' + toTeam.name : ''}
                    </div>
                  </div>
                  <div className="admin-request-card__badges">
                    <Badge variant="neutral">{REQUEST_TYPE_LABEL[r.type]}</Badge>
                    <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : r.status === 'IN_REVIEW' ? 'warning' : 'info'}>{REQUEST_STATUS_LABEL[r.status]}</Badge>
                    <Badge variant="neutral">{PRIORITY_LABEL[r.priority]}</Badge>
                  </div>
                </div>
                <div className="admin-request-card__actions">
                  <Link to={'/requests/' + r.id} className="btn btn--ghost btn--sm">Details</Link>
                  {isActive ? (
                    <>
                      <button type="button" className="btn btn--success btn--sm" onClick={() => setToApproveAll(r)}>✓ Final Approve</button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => openReject(r)}>✕ Reject</button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={rejecting !== null} title="Reject Request" onClose={() => { setRejecting(null); setRejectStepData(null); }}
        footer={<><button type="button" className="btn btn--ghost" onClick={() => { setRejecting(null); setRejectStepData(null); }}>Cancel</button><button type="button" className="btn btn--danger" onClick={doReject} disabled={busy}>{busy ? '...' : 'Confirm Reject'}</button></>}>
        <FormField label="Rejection reason" required><TextArea value={comment} onChange={setComment} rows={3} placeholder="Explain the reason..." /></FormField>
      </Modal>
      <ConfirmDialog open={toApproveAll !== null} title="Final Approval" message={'The request "' + (toApproveAll?.title || '') + '" will be finally approved and all stages skipped. Continue?'} confirmLabel="Final Approve" busy={busy} onConfirm={doApproveAll} onCancel={() => setToApproveAll(null)} />
    </div>
  );
}`
);

/* ═══════════════ 44. APPROVALS LOGIC ═══════════════ */
F(
  "src/lib/approvals.ts",
  `import { updateOne, createOne, newId, today, listWhere } from './db';
import { notifyUser } from './notifications';
import { logAudit } from './audit';
import type { ApprovalStep, RequestRecord, AppUser, RoleId, TeamId } from '@/types';

export interface ApprovalChainStep { role: RoleId; teamId: TeamId | null; }

export function buildApprovalChain(request: RequestRecord): ApprovalChainStep[] {
  const chain: ApprovalChainStep[] = [];
  if (request.type === 'TRANSFER' && request.fromTeamId && request.toTeamId) {
    chain.push({ role: 'PRESIDENT', teamId: request.fromTeamId });
    chain.push({ role: 'PRESIDENT', teamId: request.toTeamId });
    chain.push({ role: 'HEAD_HR', teamId: null });
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'PROMOTION') {
    const t = request.fromTeamId ?? request.toTeamId ?? null;
    if (t) { chain.push({ role: 'PRESIDENT', teamId: t }); chain.push({ role: 'HR', teamId: t }); }
    chain.push({ role: 'HEAD_HR', teamId: null });
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'RESIGNATION') {
    const t = request.fromTeamId ?? request.toTeamId ?? null;
    if (t) { chain.push({ role: 'PRESIDENT', teamId: t }); chain.push({ role: 'HR', teamId: t }); }
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'COMPLAINT') {
    chain.push({ role: 'HEAD_HR', teamId: null });
    chain.push({ role: 'VICE', teamId: null });
  } else if (request.type === 'SUGGESTION') {
    const t = request.fromTeamId ?? request.toTeamId ?? null;
    if (t) chain.push({ role: 'PRESIDENT', teamId: t });
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'LEAVE') {
    const t = request.fromTeamId ?? request.toTeamId ?? null;
    if (t) { chain.push({ role: 'PRESIDENT', teamId: t }); chain.push({ role: 'HR', teamId: t }); }
  } else {
    chain.push({ role: 'HEAD', teamId: null });
  }
  return chain;
}

export async function createRequestWithChain(request: RequestRecord): Promise<void> {
  await createOne('requests', request);
  const chain = buildApprovalChain(request);
  for (let i = 0; i < chain.length; i += 1) {
    await createOne('approvals', { id: newId('APR'), requestId: request.id, order: i + 1, requiredRole: chain[i].role, requiredTeamId: chain[i].teamId, status: 'PENDING' });
  }
}

export async function approveStep(request: RequestRecord, step: ApprovalStep, user: AppUser): Promise<void> {
  await updateOne('approvals', step.id, { status: 'APPROVED', approverUid: user.uid, approverName: user.displayName, actionDate: today() });
  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  const sorted = allSteps.sort((a, b) => a.order - b.order);
  const remaining = sorted.filter((s) => s.status === 'PENDING' && s.id !== step.id);
  if (remaining.length === 0) {
    await updateOne('requests', request.id, { status: 'APPROVED', currentStepOrder: sorted.length, updatedAt: today() });
    await notifyUser(request.requesterUid, 'Request approved', 'Your request "' + request.title + '" was finally approved.', 'request', '/requests/' + request.id, 'high');
    await logAudit(user, 'APPROVE_REQUEST', 'Request', request.id, 'Final approval');
  } else {
    const nextOrder = Math.min(...remaining.map((s) => s.order));
    await updateOne('requests', request.id, { status: 'IN_REVIEW', currentStepOrder: nextOrder, updatedAt: today() });
    await notifyUser(request.requesterUid, 'Request progressing', 'Your request "' + request.title + '" is at step ' + nextOrder + '.', 'approval', '/requests/' + request.id, 'normal');
  }
}

export async function adminApproveAll(request: RequestRecord, user: AppUser): Promise<void> {
  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  const sorted = allSteps.sort((a, b) => a.order - b.order);
  for (const step of sorted) {
    if (step.status === 'PENDING') {
      await updateOne('approvals', step.id, { status: 'APPROVED', approverUid: user.uid, approverName: user.displayName, actionDate: today(), comment: 'Admin final approval' });
    }
  }
  await updateOne('requests', request.id, { status: 'APPROVED', currentStepOrder: sorted.length, updatedAt: today() });
  await notifyUser(request.requesterUid, 'Request approved', 'Your request "' + request.title + '" was finally approved by admin.', 'request', '/requests/' + request.id, 'high');
  await logAudit(user, 'ADMIN_APPROVE_ALL', 'Request', request.id, 'Admin final approval');
}

export async function rejectStep(request: RequestRecord, step: ApprovalStep, user: AppUser, comment: string): Promise<void> {
  await updateOne('approvals', step.id, { status: 'REJECTED', approverUid: user.uid, approverName: user.displayName, comment: comment.trim() || undefined, actionDate: today() });
  await updateOne('requests', request.id, { status: 'REJECTED', updatedAt: today() });
  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  for (const s of allSteps) { if (s.order > step.order && s.status === 'PENDING') await updateOne('approvals', s.id, { status: 'SKIPPED' }); }
  const reasonText = comment.trim() ? ' Reason: ' + comment : '';
  await notifyUser(request.requesterUid, 'Request rejected', 'Your request "' + request.title + '" was rejected.' + reasonText, 'request', '/requests/' + request.id, 'high');
  await logAudit(user, 'REJECT_REQUEST', 'Request', request.id, 'Rejected');
}`
);

/* ═══════════════ 45. ADMIN OTHER PAGES (English) ═══════════════ */
F(
  "src/pages/admin/AdminAnalyticsPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Loading } from '@/components/ui/Loading';
import type { Member, Contribution, RequestRecord } from '@/types';

const REQ_TYPE: Record<string, string> = { TRANSFER: 'Transfer', PROMOTION: 'Promotion', RESIGNATION: 'Resignation', COMPLAINT: 'Complaint', SUGGESTION: 'Suggestion', LEAVE: 'Leave' };
const REQ_STATUS: Record<string, string> = { PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled', COMPLETED: 'Completed' };
const CONTRIB_STATUS: Record<string, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

export function AdminAnalyticsPage() {
  const { data: liveMembers, loading: lM } = useCollection<Member>('members');
  const { data: contributions, loading: lC } = useCollection<Contribution>('contributions');
  const { data: requests, loading: lR } = useCollection<RequestRecord>('requests');
  if (lM || lC || lR) return <Loading fullHeight message="Loading analytics..." />;
  const allMembers = liveMembers.length > 0 ? liveMembers : members;
  const teamStats = teams.map((t) => {
    const tm = allMembers.filter((m) => m.teamIds.includes(t.id));
    return { team: t, points: tm.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0) };
  }).sort((a, b) => b.points - a.points);
  const committeeStats = committees.map((c) => {
    const cm = allMembers.filter((m) => m.committeeIds.includes(c.id));
    return { committee: c, points: cm.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0) };
  }).sort((a, b) => b.points - a.points);
  const maxT = Math.max(1, ...teamStats.map((s) => s.points));
  const maxC = Math.max(1, ...committeeStats.map((s) => s.points));
  const statusCounts: Record<string, number> = {};
  requests.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
  const typeCounts: Record<string, number> = {};
  requests.forEach((r) => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1; });
  const contribCounts: Record<string, number> = {};
  contributions.forEach((c) => { contribCounts[c.status] = (contribCounts[c.status] || 0) + 1; });
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Analytics" description="Overview of all organization data." />
      <section className="section">
        <SectionHeader eyebrow="Teams" title="Team Points" />
        <div className="card no-click">
          {teamStats.map((s) => (
            <div key={s.team.id} className="chart-row">
              <span>{s.team.name}</span>
              <div className="chart-bar" style={{ width: Math.round((s.points / maxT) * 100) + '%' }} />
              <span style={{ color: 'var(--c-navy)' }}>{s.points}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Committees" title="Committee Points" />
        <div className="card no-click">
          {committeeStats.map((s) => (
            <div key={s.committee.id} className="chart-row">
              <span>{s.committee.nameAr}</span>
              <div className="chart-bar chart-bar--red" style={{ width: Math.round((s.points / maxC) * 100) + '%' }} />
              <span style={{ color: 'var(--c-red)' }}>{s.points}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Requests" title="By Status" />
        <div className="grid grid--narrow">
          {Object.entries(statusCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{REQ_STATUS[k] ?? k}</div>
              <div style={{ fontSize: '1.8rem', color: 'var(--c-navy)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Requests" title="By Type" />
        <div className="grid grid--narrow">
          {Object.entries(typeCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{REQ_TYPE[k] ?? k}</div>
              <div style={{ fontSize: '1.8rem', color: 'var(--c-red)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Contributions" title="By Status" />
        <div className="grid grid--narrow">
          {Object.entries(contribCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{CONTRIB_STATUS[k] ?? k}</div>
              <div style={{ fontSize: '1.8rem', color: 'var(--c-navy)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}`
);

F(
  "src/pages/admin/AdminUsersPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { updateOne, removeOne } from '@/lib/db';
import { adminCreateMember } from '@/lib/auth';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { ROLE_LABEL } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, Select, MultiSelect } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import type { AppUser, RoleId, TeamId } from '@/types';

const ROLE_OPTS: Array<{ value: RoleId; label: string }> = (Object.entries(ROLE_LABEL) as Array<[RoleId, string]>).map(([value, label]) => ({ value, label }));

function genPass(): string {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 10; i += 1) p += c.charAt(Math.floor(Math.random() * c.length));
  return p + '@1';
}

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const { data: users, loading } = useCollection<AppUser>('users');
  const { data: liveMembers } = useCollection<{ id: string; name: string }>('members');
  const { data: liveCommittees } = useCollection<{ id: string; nameAr: string }>('committees');
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(genPass());
  const [name, setName] = useState('');
  const [role, setRole] = useState<RoleId>('MEMBER');
  const [teamId, setTeamId] = useState<TeamId>('helpers');
  const [committeeIds, setCommitteeIds] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [created, setCreated] = useState<{ email: string; password: string; name: string } | null>(null);
  const memberList = liveMembers.length > 0 ? liveMembers : members.map((m) => ({ id: m.id, name: m.name }));
  const committeeList = liveCommittees.length > 0 ? liveCommittees : committees.map((c) => ({ id: c.id, nameAr: c.nameAr }));
  const reset = () => { setEmail(''); setPassword(genPass()); setName(''); setRole('MEMBER'); setTeamId('helpers'); setCommitteeIds([]); setBio(''); };
  const create = async () => {
    if (!email.trim() || !name.trim()) { toast.error('Missing data'); return; }
    if (password.length < 6) { toast.error('Password too weak'); return; }
    setBusy(true);
    try {
      await adminCreateMember({ email: email.trim(), temporaryPassword: password, name: name.trim(), role, teamIds: [teamId], committeeIds, bio: bio.trim() || undefined }, me?.uid ?? 'system');
      setCreated({ email: email.trim(), password, name: name.trim() });
      toast.success('Account created');
      reset();
      setOpen(false);
    } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
    finally { setBusy(false); }
  };
  const chRole = async (uid: string, r: RoleId) => { try { await updateOne('users', uid, { role: r }); toast.success('Updated'); } catch { toast.error('Failed'); } };
  const chTeam = async (uid: string, t: TeamId) => { try { await updateOne('users', uid, { teamId: t }); toast.success('Updated'); } catch { toast.error('Failed'); } };
  const linkMember = async (uid: string, mid: string) => { try { await updateOne('users', uid, { memberId: mid || null }); if (mid) await updateOne('members', mid, { linkedUserId: uid }); toast.success('Linked'); } catch { toast.error('Failed'); } };
  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('users', toDelete); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Users" description="Create accounts, assign roles, and link members." />
      <SectionHeader eyebrow="List" title={'Users (' + users.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={() => { reset(); setOpen(true); }}>+ New User</button>} />
      {loading ? <SkeletonList count={6} /> : users.length === 0 ? <EmptyState title="No users" message="Start by creating the first user." /> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Team</th><th>Member</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td data-label="Name" style={{ fontWeight: 700 }}>
                    {u.displayName}
                    {u.mustChangePassword ? <Badge variant="warning" className="mt-2">New</Badge> : null}
                  </td>
                  <td className="muted small" data-label="Email" dir="ltr">{u.email}</td>
                  <td data-label="Role">
                    <select className="input" value={u.role} onChange={(e) => chRole(u.uid, e.target.value as RoleId)} style={{ minWidth: 150 }}>
                      {ROLE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td data-label="Team">
                    <select className="input" value={u.teamId ?? ''} onChange={(e) => chTeam(u.uid, e.target.value as TeamId)} style={{ minWidth: 130 }}>
                      <option value="">— None —</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td data-label="Member">
                    <select className="input" value={u.memberId ?? ''} onChange={(e) => linkMember(u.uid, e.target.value)} style={{ minWidth: 150 }}>
                      <option value="">— Not linked —</option>
                      {memberList.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </td>
                  <td data-label="Actions"><button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(u.uid)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} title="Create New User" onClose={() => setOpen(false)} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="btn btn--primary" onClick={create} disabled={busy}>{busy ? '...' : 'Create'}</button></>}>
        <FormField label="Full name" required><TextInput value={name} onChange={setName} placeholder="e.g. Ahmed Mohamed" /></FormField>
        <FormField label="Email" required><TextInput value={email} onChange={setEmail} type="email" placeholder="name@resala-stem.org" /></FormField>
        <FormField label="Temporary password" required hint="Will be required to change on first login">
          <div style={{ display: 'flex', gap: 8 }}>
            <TextInput value={password} onChange={setPassword} type="text" />
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPassword(genPass())}>Generate</button>
          </div>
        </FormField>
        <FormField label="Role" required><Select value={role} onChange={(v) => setRole(v as RoleId)} options={ROLE_OPTS} /></FormField>
        <FormField label="Team" required><Select value={teamId} onChange={(v) => setTeamId(v as TeamId)} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
        <FormField label="Committees" hint={committeeList.length === 0 ? 'No committees — add them first' : undefined}>
          <MultiSelect values={committeeIds} onChange={setCommitteeIds} options={committeeList.map((c) => ({ value: c.id, label: c.nameAr }))} />
        </FormField>
        <FormField label="Short bio"><TextInput value={bio} onChange={setBio} placeholder="e.g. Frontend developer" /></FormField>
      </Modal>
      <Modal open={created !== null} title="✓ Account Created" onClose={() => setCreated(null)}
        footer={<button type="button" className="btn btn--primary" onClick={() => setCreated(null)}>Got it</button>}>
        <p style={{ marginBottom: 16 }}>Send these credentials to the member:</p>
        <div style={{ background: 'var(--c-off-white)', border: '1px solid var(--c-line)', borderRadius: 10, padding: 16, lineHeight: 2 }}>
          <div><strong>Name:</strong> {created?.name}</div>
          <div style={{ wordBreak: 'break-all' }}><strong>Email:</strong> <span dir="ltr">{created?.email}</span></div>
          <div style={{ wordBreak: 'break-all' }}><strong>Password:</strong> <span dir="ltr">{created?.password}</span></div>
        </div>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="Delete User" message="This cannot be undone." confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}`
);

F(
  "src/pages/admin/AdminMembersPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { ROLE_LABEL } from '@/lib/permissions';
import { hoursToPoints } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, NumberInput, TextArea, Select, MultiSelect } from '@/components/ui/FormField';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from '@/components/ui/Toast';
import type { Member, RoleId, TeamId } from '@/types';

const ROLE_OPTS = Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }));
const EMPTY: Omit<Member, 'id'> = { name: '', role: 'MEMBER', teamIds: [], committeeIds: [], joinedSeason: 7, hours: 0, status: 'active', bio: '', email: '' };

export function AdminMembersPage() {
  const { data: list, loading } = useCollection<Member>('members');
  const { data: liveCommittees } = useCollection<{ id: string; nameAr: string }>('committees');
  const [editing, setEditing] = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Member, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const committeeList = liveCommittees.length > 0 ? liveCommittees : committees.map((c) => ({ id: c.id, nameAr: c.nameAr }));
  const filtered = list.filter((m) => !search.trim() || m.name.toLowerCase().includes(search.trim().toLowerCase()));
  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
  const openEdit = (m: Member) => {
    setForm({ name: m.name, role: m.role, teamIds: m.teamIds, committeeIds: m.committeeIds, joinedSeason: m.joinedSeason, hours: m.hours, status: m.status, bio: m.bio || '', email: m.email || '' });
    setEditing(m);
    setCreating(false);
  };
  const close = () => { setCreating(false); setEditing(null); };
  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (form.teamIds.length === 0) { toast.error('At least one team is required'); return; }
    setBusy(true);
    try {
      if (editing) { await updateOne('members', editing.id, form); toast.success('Updated'); }
      else { const id = 'M-' + Date.now().toString(36).toUpperCase(); await createOne('members', { id, ...form }); toast.success('Added'); }
      close();
    } catch { toast.error('Failed to save'); }
    finally { setBusy(false); }
  };
  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('members', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Members" description="Add, edit, and remove member data." />
      <div className="toolbar"><input className="input" type="search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <SectionHeader eyebrow="List" title={'Members (' + filtered.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Member</button>} />
      {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? <EmptyState title="No members" message="No members found." /> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Name</th><th>Role</th><th>Teams</th><th>Committees</th><th>Hours</th><th>Points</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((m) => {
                const mt = teams.filter((t) => m.teamIds.includes(t.id));
                const mc = committeeList.filter((c) => m.committeeIds.includes(c.id));
                return (
                  <tr key={m.id}>
                    <td data-label="Name"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={m.name} size={32} variant="navy" /><span>{m.name}</span></div></td>
                    <td className="muted small" data-label="Role">{ROLE_LABEL[m.role]}</td>
                    <td data-label="Teams"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mt.map((t) => <span key={t.id} className="badge">{t.name}</span>)}</div></td>
                    <td data-label="Committees"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mc.length === 0 ? <span className="muted small">—</span> : mc.map((c) => <span key={c.id} className="badge">{c.nameAr}</span>)}</div></td>
                    <td data-label="Hours">{m.hours}</td>
                    <td className="points" data-label="Points">{hoursToPoints(m.hours)}</td>
                    <td data-label="Actions"><div style={{ display: 'flex', gap: 4 }}><button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(m)}>Edit</button><button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(m)}>Delete</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'Edit Member' : 'Add Member'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
        <FormField label="Full name" required><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
        <FormField label="Email"><TextInput value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} type="email" /></FormField>
        <FormField label="Role" required><Select value={form.role} onChange={(v) => setForm({ ...form, role: v as RoleId })} options={ROLE_OPTS} /></FormField>
        <FormField label="Teams" required><MultiSelect values={form.teamIds} onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
        <FormField label="Committees"><MultiSelect values={form.committeeIds} onChange={(v) => setForm({ ...form, committeeIds: v })} options={committeeList.map((c) => ({ value: c.id, label: c.nameAr }))} /></FormField>
        <FormField label="Hours"><NumberInput value={form.hours} onChange={(v) => setForm({ ...form, hours: v })} min={0} /></FormField>
        <FormField label="Status"><Select value={form.status} onChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' | 'suspended' })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' }]} /></FormField>
        <FormField label="Bio"><TextArea value={form.bio || ''} onChange={(v) => setForm({ ...form, bio: v })} rows={2} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="Delete Member" message={'Delete "' + (toDelete?.name || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}`
);

F(
  "src/pages/admin/AdminCommitteesPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { Committee, Member } from '@/types';

const EMPTY: Omit<Committee, 'id'> = { name: '', nameAr: '', description: '', color: '#151A45', icon: '' };

export function AdminCommitteesPage() {
  const { data: committees, loading } = useCollection<Committee>('committees');
  const { data: members } = useCollection<Member>('members');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Committee | null>(null);
  const [form, setForm] = useState<Omit<Committee, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<Committee | null>(null);
  const [busy, setBusy] = useState(false);
  const sorted = [...committees].sort((a, b) => a.nameAr.localeCompare(b.nameAr));
  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
  const openEdit = (c: Committee) => { setForm({ name: c.name, nameAr: c.nameAr, description: c.description, color: c.color, icon: c.icon }); setEditing(c); setCreating(false); };
  const close = () => { setCreating(false); setEditing(null); };
  const save = async () => {
    if (!form.nameAr.trim()) { toast.error('Name is required'); return; }
    setBusy(true);
    try {
      const payload = { name: form.name.trim() || form.nameAr.trim(), nameAr: form.nameAr.trim(), description: form.description.trim(), color: form.color, icon: form.icon };
      if (editing) { await updateOne('committees', editing.id, payload); toast.success('Updated'); }
      else { const id = 'COMM-' + Date.now().toString(36).toUpperCase(); await createOne('committees', { id, ...payload }); toast.success('Added'); }
      close();
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };
  const del = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('committees', toDelete.id);
      for (const m of members) { if (m.committeeIds.includes(toDelete.id)) await updateOne('members', m.id, { committeeIds: m.committeeIds.filter((c) => c !== toDelete.id) }); }
      toast.success('Deleted');
      setToDelete(null);
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Committees" description="Add and manage committees." />
      <SectionHeader eyebrow="List" title={'Committees (' + committees.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Committee</button>} />
      {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? (
        <EmptyState title="No committees" message="Add your first committee." action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ Add Committee</button>} />
      ) : (
        <div className="grid grid--wide">
          {sorted.map((c) => {
            const count = members.filter((m) => m.committeeIds.includes(c.id)).length;
            return (
              <div key={c.id} className="card no-click">
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{c.nameAr}</div>
                    {c.name && c.name !== c.nameAr ? <div className="card__meta">{c.name}</div> : null}
                  </div>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: c.color }} />
                </div>
                {c.description ? <p className="small soft mt-3">{c.description}</p> : null}
                <div className="small muted mt-3">{count} members</div>
                <div className="row mt-4" style={{ gap: 6, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(c)}>Edit</button>
                  <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(c)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'Edit Committee' : 'New Committee'} onClose={close}
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
        <FormField label="Name (Arabic)" required><TextInput value={form.nameAr} onChange={(v) => setForm({ ...form, nameAr: v })} /></FormField>
        <FormField label="Name (English)"><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
        <FormField label="Description"><TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} /></FormField>
        <FormField label="Color"><Select value={form.color} onChange={(v) => setForm({ ...form, color: v })} options={[
          { value: '#151A45', label: 'Navy' }, { value: '#C1272D', label: 'Red' }, { value: '#16A34A', label: 'Green' },
          { value: '#2563EB', label: 'Blue' }, { value: '#7C3AED', label: 'Purple' }, { value: '#EC4899', label: 'Pink' },
        ]} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="Delete Committee" message={'Delete "' + (toDelete?.nameAr || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}`
);

F(
  "src/pages/admin/AdminAchievementsPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { teams } from '@/data/teams';
import { members } from '@/data/members';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, TextArea, DateInput, MultiSelect } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { Achievement, TeamId } from '@/types';

const EMPTY: Omit<Achievement, 'id'> = { title: '', description: '', date: new Date().toISOString().slice(0, 10), level: 'branch', teamIds: [], memberIds: [], memberNames: [], seasonId: 'S7' };

export function AdminAchievementsPage() {
  const { data, loading } = useCollection<Achievement>('achievements');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState<Omit<Achievement, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<Achievement | null>(null);
  const [busy, setBusy] = useState(false);
  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
  const openEdit = (a: Achievement) => { setForm({ title: a.title, description: a.description, date: a.date, level: a.level, teamIds: a.teamIds, memberIds: a.memberIds, memberNames: a.memberNames, seasonId: a.seasonId }); setEditing(a); setCreating(false); };
  const close = () => { setCreating(false); setEditing(null); };
  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description are required'); return; }
    setBusy(true);
    try {
      const memberNames = form.memberIds.map((id) => members.find((m) => m.id === id)?.name).filter((n): n is string => Boolean(n));
      const payload = { ...form, memberNames };
      if (editing) { await updateOne('achievements', editing.id, payload); toast.success('Updated'); }
      else { const id = 'A-' + Date.now().toString(36).toUpperCase(); await createOne('achievements', { id, ...payload }); toast.success('Added'); }
      close();
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };
  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('achievements', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Achievements" description="Manage achievements and awards." />
      <SectionHeader eyebrow="List" title={'Achievements (' + data.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Achievement</button>} />
      {loading ? <SkeletonList count={5} /> : data.length === 0 ? <EmptyState title="No achievements" message="Add the first achievement." /> : (
        <div className="stack">
          {data.map((a) => (
            <div key={a.id} className="card no-click">
              <div className="card__title">{a.title}</div>
              <div className="card__meta">{formatDate(a.date)}</div>
              <p className="small soft mt-3">{a.description}</p>
              <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(a)}>Edit</button>
                <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(a)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'Edit Achievement' : 'New Achievement'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
        <FormField label="Title" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
        <FormField label="Description" required><TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={3} /></FormField>
        <FormField label="Date" required><DateInput value={form.date} onChange={(v) => setForm({ ...form, date: v })} /></FormField>
        <FormField label="Teams"><MultiSelect values={form.teamIds} onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
        <FormField label="Members"><MultiSelect values={form.memberIds} onChange={(v) => setForm({ ...form, memberIds: v })} options={members.map((m) => ({ value: m.id, label: m.name }))} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="Delete Achievement" message={'Delete "' + (toDelete?.title || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}`
);

F(
  "src/pages/admin/AdminGovernancePage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, TextArea } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import type { GovernanceDocument } from '@/types';

const EMPTY: Omit<GovernanceDocument, 'id'> = { title: '', category: 'Policies', description: '', content: '', version: '1.0', updatedAt: new Date().toISOString().slice(0, 10) };

export function AdminGovernancePage() {
  const { data, loading } = useCollection<GovernanceDocument>('governance');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GovernanceDocument | null>(null);
  const [form, setForm] = useState<Omit<GovernanceDocument, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<GovernanceDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title));
  const openCreate = () => { setForm({ ...EMPTY, updatedAt: new Date().toISOString().slice(0, 10) }); setCreating(true); setEditing(null); };
  const openEdit = (d: GovernanceDocument) => { setForm({ title: d.title, category: d.category, description: d.description, content: d.content, version: d.version, updatedAt: d.updatedAt }); setEditing(d); setCreating(false); };
  const close = () => { setCreating(false); setEditing(null); };
  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required'); return; }
    setBusy(true);
    try {
      const payload = { ...form, updatedAt: new Date().toISOString().slice(0, 10) };
      if (editing) { await updateOne('governance', editing.id, payload); toast.success('Updated'); }
      else { const id = 'GOV-' + Date.now().toString(36).toUpperCase(); await createOne('governance', { id, ...payload }); toast.success('Added'); }
      close();
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };
  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('governance', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Governance" description="Add policies and documents yourself." />
      <SectionHeader eyebrow="List" title={'Documents (' + data.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Document</button>} />
      {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? (
        <EmptyState title="No documents" message="Add the first document." action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ Add Document</button>} />
      ) : (
        <div className="stack">
          {sorted.map((d) => (
            <div key={d.id} className="card no-click">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{d.title}</div>
                  <div className="card__meta">{d.category} · v{d.version} · Last updated {formatDate(d.updatedAt)}</div>
                </div>
                <Badge variant="info">{d.category}</Badge>
              </div>
              {d.description ? <p className="small soft mt-2">{d.description}</p> : null}
              <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(d)}>Edit</button>
                <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(d)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'Edit Document' : 'New Document'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
        <FormField label="Title" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
        <FormField label="Category" required><TextInput value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Policies / Procedures / Governance" /></FormField>
        <FormField label="Short description"><TextInput value={form.description} onChange={(v) => setForm({ ...form, description: v })} /></FormField>
        <FormField label="Full content" required><TextArea value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={8} /></FormField>
        <FormField label="Version" required><TextInput value={form.version} onChange={(v) => setForm({ ...form, version: v })} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="Delete Document" message={'Delete "' + (toDelete?.title || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}`
);

F(
  "src/pages/admin/AdminNotificationsPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { notifyUser, notifyUsers } from '@/lib/notifications';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { relativeTime } from '@/lib/format';
import type { AppUser, Notification } from '@/types';

export function AdminNotificationsPage() {
  const { user: me } = useAuth();
  const { data: users } = useCollection<AppUser>('users');
  const { data: notifs, loading } = useCollection<Notification>('notifications');
  const [target, setTarget] = useState<string>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!title.trim() || !message.trim()) { toast.error('Title and message are required'); return; }
    setBusy(true);
    try {
      if (target === 'all') await notifyUsers(users, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
      else if (target === 'managers') {
        const managers = users.filter((u) => ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(u.role));
        await notifyUsers(managers, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
      } else {
        if (!users.find((u) => u.uid === target)) { toast.error('User not found'); setBusy(false); return; }
        await notifyUser(target, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
      }
      setTitle('');
      setMessage('');
      toast.success('Sent');
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };
  const sorted = [...notifs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30);
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Send Notification" description="Real-time notifications to members and managers." />
      <SectionHeader eyebrow="Send" title="New Notification" />
      <div className="card no-click" style={{ maxWidth: 760 }}>
        <FormField label="Recipient" required>
          <Select value={target} onChange={setTarget} options={[
            { value: 'all', label: 'Everyone (' + users.length + ')' },
            { value: 'managers', label: 'Managers only' },
            ...users.map((u) => ({ value: u.uid, label: u.displayName + ' (' + u.email + ')' })),
          ]} />
        </FormField>
        <FormField label="Title" required><TextInput value={title} onChange={setTitle} /></FormField>
        <FormField label="Message" required><TextArea value={message} onChange={setMessage} rows={4} /></FormField>
        <FormField label="Priority"><Select value={priority} onChange={(v) => setPriority(v as 'low' | 'normal' | 'high')} options={[
          { value: 'low', label: 'Low' }, { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' },
        ]} /></FormField>
        <button type="button" className="btn btn--primary btn--block" onClick={send} disabled={busy}>{busy ? '...' : 'Send Notification'}</button>
      </div>
      <SectionHeader eyebrow="History" title={'Recent Notifications (' + notifs.length + ')'} />
      {loading ? <SkeletonList count={6} /> : sorted.length === 0 ? <EmptyState title="No notifications" message="No notifications sent yet." /> : (
        <div className="stack">
          {sorted.map((n) => (
            <div key={n.id} className="card no-click">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{n.title}</div>
                  <div className="card__meta">{n.message}</div>
                </div>
                {!n.read ? <Badge variant="red">New</Badge> : <Badge variant="success">Read</Badge>}
              </div>
              <div className="tiny muted mt-2">{relativeTime(n.date)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`
);

/* ═══════════════ 46. ONBOARDING DATA ═══════════════ */
F(
  "src/pages/ChangePasswordPage.tsx",
  `import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { changePassword, logout } from '@/lib/auth';
import { toast } from '@/components/ui/Toast';
import { Loading } from '@/components/ui/Loading';

export function ChangePasswordPage() {
  const nav = useNavigate();
  const { user, loading, mustChangePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading) return <Loading fullHeight />;
  if (!user) { nav('/login'); return null; }
  if (!mustChangePassword) { nav('/dashboard'); return null; }
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password too weak', 'Must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setBusy(true);
    try { await changePassword(newPassword); toast.success('Password updated'); nav('/dashboard'); }
    catch (err) { toast.error('Failed to update', err instanceof Error ? err.message : ''); }
    finally { setBusy(false); }
  };
  const handleLogout = async () => { await logout(); nav('/login'); };
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="change-password-notice">
          <strong>Welcome, {user.displayName}</strong>
          Your account is new. You must set a new password to continue.
        </div>
        <form onSubmit={onSubmit}>
          <div className="login-field">
            <label className="login-label">New Password</label>
            <input className="login-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" required dir="ltr" />
          </div>
          <div className="login-field">
            <label className="login-label">Confirm Password</label>
            <input className="login-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="........" autoComplete="new-password" required dir="ltr" />
          </div>
          <button type="submit" className="login-submit" disabled={busy || !newPassword || !confirmPassword}>{busy ? '...' : 'Save Password & Continue'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <button type="button" onClick={handleLogout} style={{ color: 'var(--c-ink-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
        </p>
      </div>
    </div>
  );
}`
);

F(
  "src/pages/NotFoundPage.tsx",
  `import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container notfound">
      <div className="notfound__code">404</div>
      <h2 className="mt-4">Page not found</h2>
      <p className="muted mt-3" style={{ maxWidth: '40ch', lineHeight: 1.7 }}>The page you are looking for does not exist.</p>
      <div className="row mt-6" style={{ justifyContent: 'center' }}>
        <Link to="/" className="btn btn--primary">Back to Home</Link>
      </div>
    </div>
  );
}`
);

/* ═══════════════ 47. PWA BANNER ═══════════════ */
F(
  "src/components/pwa/PwaInstallBanner.tsx",
  `import { useEffect, useState } from 'react';
import { canInstallPwa, promptInstall, isStandalone, isIos } from '@/lib/pwa';
import { toast } from '@/components/ui/Toast';

const DISMISSED_KEY = 'sbapiaryy-pwa-dismissed-v2';
const SHOW_AFTER_MS = 8000;

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISSED_KEY) === 'yes') return;
    const check = () => {
      if (canInstallPwa()) { setVisible(true); setIosMode(false); }
      else if (isIos()) { setVisible(true); setIosMode(true); }
    };
    const t = setTimeout(check, SHOW_AFTER_MS);
    const handler = () => { setVisible(true); setIosMode(false); };
    window.addEventListener('pwa-install-available', handler);
    return () => { clearTimeout(t); window.removeEventListener('pwa-install-available', handler); };
  }, []);
  const dismiss = () => { setVisible(false); localStorage.setItem(DISMISSED_KEY, 'yes'); };
  const install = async () => {
    if (iosMode) { toast.info('To install on iPhone', 'Tap Share → Add to Home Screen'); return; }
    const result = await promptInstall();
    if (result === 'accepted') { toast.success('Installed', 'Open the app from your home screen'); setVisible(false); }
    else if (result === 'dismissed') dismiss();
    else toast.info('Install unavailable', 'Use browser menu → Install app');
  };
  if (!visible) return null;
  return (
    <div className="pwa-install-banner no-print" role="dialog" aria-label="Install app">
      <div className="pwa-install-banner__body">
        <div className="pwa-install-banner__title">Install sbapiaryy</div>
        <div className="pwa-install-banner__desc">{iosMode ? 'From Safari: tap Share → Add to Home Screen' : 'Faster access and notifications, no browser bar'}</div>
      </div>
      <div className="pwa-install-banner__actions">
        <button type="button" className="btn btn--ghost btn--xs" onClick={dismiss}>Later</button>
        <button type="button" className="btn btn--primary btn--xs" onClick={install}>Install</button>
      </div>
    </div>
  );
}`
);

F(
  "src/styles/pwa.css",
  `.pwa-install-banner { position: fixed; bottom: calc(24px + var(--safe-bottom)); left: 20px; right: 20px; z-index: 350; background: var(--c-navy); color: #fff; border-radius: var(--radius-lg); padding: 18px 20px; box-shadow: 0 20px 60px -15px rgba(21, 26, 69, 0.55); display: flex; align-items: center; gap: 16px; flex-wrap: wrap; border: 1px solid var(--c-navy-2); animation: pwa-slide-in 0.4s var(--ease-bounce); }
@media (min-width: 640px) { .pwa-install-banner { left: auto; right: 24px; max-width: 460px; padding: 20px 22px; } }
@keyframes pwa-slide-in { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.pwa-install-banner__body { flex: 1; min-width: 200px; }
.pwa-install-banner__title { font-size: 1rem; margin-bottom: 4px; }
.pwa-install-banner__desc { font-size: 0.86rem; color: var(--c-paper-soft); line-height: 1.6; }
.pwa-install-banner__actions { display: flex; gap: 8px; flex-shrink: 0; }`
);

/* ═══════════════ RUN ═══════════════ */
const sh = (cmd) => execSync(cmd, { cwd: ROOT, stdio: "inherit" });

console.log("");
console.log(
  `${C.b}${C.m}╔══════════════════════════════════════════════════════╗${C.r}`
);
console.log(
  `${C.b}${C.m}║  fix.cjs — Complete English + LTR + Gochi Hand       ║${C.r}`
);
console.log(
  `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
);
console.log("");

const bkDir = path.join(
  ROOT,
  ".fix-backups",
  "complete-" + Date.now().toString()
);
fs.mkdirSync(bkDir, { recursive: true });
console.log(`${C.c}📦 backup: .fix-backups/${path.basename(bkDir)}${C.r}\n`);

let count = 0;
for (const [rel, content] of Object.entries(files)) {
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs)) {
    const dst = path.join(bkDir, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(abs, dst);
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
  console.log(`${C.g}✓${C.r} ${rel}`);
  count++;
}

console.log("");
console.log(`${C.b}═══ Files: ${count} ═══${C.r}\n`);

console.log(`${C.b}▶ TypeScript check${C.r}\n`);
let ok = false;
try {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  ok = true;
  console.log(`\n${C.g}✓ No TypeScript errors${C.r}`);
} catch {
  console.log(`\n${C.y}⚠ TypeScript errors — check above${C.r}`);
}

if (!ok) {
  console.log(`\n${C.red}Push skipped. Fix errors first, then run:${C.r}`);
  console.log(
    `  ${C.c}git add -A && git commit -m "fix" && git push origin main --force${C.r}\n`
  );
  process.exit(1);
}

console.log("");
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
    console.log(`${C.y}ℹ No changes${C.r}\n`);
    process.exit(0);
  }
  sh(
    'git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "feat: complete English + LTR + Gochi Hand + all fixes"'
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
