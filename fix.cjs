#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — v6.0
 * الحل الجذري للفراغات + إعادة بناء المحادثات + إصلاح الطلبات
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
};

const files = {};
const F = (p, c) => {
  files[p.replace(/\\/g, "/")] = c.replace(/^\n/, "");
};

/* ═══════════════════════════════════════════════════════════════
   1) layout.css — الفراغ على app-main نفسه
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/layout.css",
  `
/* ═══════════════════════════════════════════════════════════════
   Layout — الفراغ على app-main (يوزع على كل الصفحات تلقائيًا)
   ═══════════════════════════════════════════════════════════════ */

.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: var(--safe-top);
  overflow-x: hidden;
}

/* ═══ الحل الجذري: الفراغ هنا مش في .container ═══ */
.app-main {
  flex: 1;
  padding-bottom: var(--safe-bottom);
  padding-inline: 20px;
  overflow-x: hidden;
  box-sizing: border-box;
}

@media (min-width: 480px) {
  .app-main { padding-inline: 24px; }
}

@media (min-width: 640px) {
  .app-main { padding-inline: 32px; }
}

@media (min-width: 900px) {
  .app-main { padding-inline: 44px; }
}

@media (min-width: 1280px) {
  .app-main { padding-inline: 64px; }
}

@media (min-width: 1600px) {
  .app-main { padding-inline: 96px; }
}

/* ═══ .container — الآن بدون padding جانبي (الفراغ على app-main) ═══ */
.container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 0;
  box-sizing: border-box;
}

/* ═══ لو حاجة محتاجة فراغ كامل ═══ */
.container--full {
  max-width: 100%;
}

/* ═══ Sections ═══ */
.section { padding-block: 32px; }
.section--tight { padding-block: 22px; }

@media (min-width: 640px) {
  .section { padding-block: 44px; }
  .section--tight { padding-block: 26px; }
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

@media (min-width: 640px) {
  .section-head {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 32px;
  }
}

.section-head__eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--c-red);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.section-head h2 { font-size: 1.4rem; font-weight: 800; }
.section-head__desc {
  color: var(--c-ink-muted);
  font-size: 0.9rem;
  margin-top: 8px;
  max-width: 62ch;
  line-height: 1.65;
}

/* ═══ Grid ═══ */
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
.small { font-size: 0.82rem; }
.tiny { font-size: 0.72rem; }
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
@media (min-width: 768px) { .hide-mobile { display: block; } .show-mobile { display: none !important; } }

/* ═══ محادثات — بدون فراغ إضافي (الفراغ على app-main) ═══ */
.chat-page-wrapper {
  margin-inline: 0;
}
`
);

/* ═══════════════════════════════════════════════════════════════
   2) admin.css — الفراغات في كل صفحات الأدمن
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/admin.css",
  `
.admin-page { padding-block: 24px 60px; }
.admin-welcome { padding: 12px 0 24px; margin-bottom: 8px; }
.admin-welcome__eyebrow {
  font-size: 0.72rem; font-weight: 800; color: var(--c-red);
  letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 12px;
}
.admin-welcome__name {
  font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 900;
  color: var(--c-navy); line-height: 1.25; letter-spacing: -0.02em;
  word-break: break-word; margin: 0;
}
.admin-welcome__subtitle {
  margin-top: 12px; color: var(--c-ink-muted);
  font-size: 0.94rem; line-height: 1.75; max-width: 60ch;
}

.admin-stats {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 14px; margin-block: 32px 44px;
}
@media (min-width: 600px) { .admin-stats { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
@media (min-width: 1024px) { .admin-stats { grid-template-columns: repeat(6, 1fr); gap: 18px; } }

.admin-stats .stat {
  padding: 26px 18px; min-height: 116px;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
}
.admin-stats .stat__value { font-size: 1.75rem; }
.admin-stats .stat__label { font-size: 0.74rem; margin-top: 10px; }

.admin-seed {
  margin-block: 44px; padding: 28px;
  background: var(--c-white); border: 1px solid var(--c-line);
  border-radius: var(--radius); box-shadow: var(--shadow-xs);
}
@media (max-width: 640px) { .admin-seed { padding: 22px; } }
.admin-seed__head { display: flex; flex-direction: column; gap: 16px; }
@media (min-width: 640px) { .admin-seed__head { flex-direction: row; align-items: center; justify-content: space-between; } }
.admin-seed__title { font-size: 1.05rem; font-weight: 800; color: var(--c-navy); margin-bottom: 6px; }
.admin-seed__desc { font-size: 0.86rem; color: var(--c-ink-muted); line-height: 1.65; }
.admin-seed__result {
  margin-top: 20px; padding: 16px 20px; background: var(--c-off-white);
  border: 1px solid var(--c-line); border-radius: var(--radius-sm);
  font-size: 0.85rem; line-height: 2; color: var(--c-ink-soft); word-break: break-word;
}

.admin-cards {
  display: grid; grid-template-columns: 1fr;
  gap: 16px; margin-block: 24px;
}
@media (min-width: 600px) { .admin-cards { grid-template-columns: repeat(2, 1fr); gap: 18px; } }
@media (min-width: 1024px) { .admin-cards { grid-template-columns: repeat(3, 1fr); gap: 20px; } }

.admin-card {
  display: flex; flex-direction: column; gap: 12px;
  padding: 24px; background: var(--c-white);
  border: 1px solid var(--c-line); border-radius: var(--radius);
  text-decoration: none; color: var(--c-ink);
  transition: all 0.18s var(--ease); box-shadow: var(--shadow-xs);
  min-height: 124px;
}
.admin-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }
.admin-card__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.admin-card__title { font-size: 1.05rem; font-weight: 800; color: var(--c-navy); line-height: 1.4; }
.admin-card__count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 34px; padding: 4px 12px; border-radius: var(--radius-full);
  background: var(--c-red); color: #fff; font-family: var(--font-en);
  font-size: 0.75rem; font-weight: 800; flex-shrink: 0;
}
.admin-card__desc { font-size: 0.86rem; color: var(--c-ink-muted); line-height: 1.65; }

.admin-page .section, .admin-page .section--tight { padding-inline: 0; }
.admin-page .section-head { padding-inline: 0; margin-inline: 0; margin-bottom: 28px; }
.admin-page h1, .admin-page h2 { margin: 0; }
.admin-page .card { padding: 24px; }
@media (max-width: 640px) { .admin-page .card { padding: 20px; } }

.admin-request-card {
  display: flex; flex-direction: column; gap: 18px;
  padding: 26px; background: var(--c-white);
  border: 1px solid var(--c-line); border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
}
@media (min-width: 640px) { .admin-request-card { padding: 28px; } }
.admin-request-card__head { display: flex; flex-direction: column; gap: 14px; }
@media (min-width: 640px) {
  .admin-request-card__head { flex-direction: row; align-items: flex-start; justify-content: space-between; }
}
.admin-request-card__info { flex: 1; min-width: 0; }
.admin-request-card__title { font-size: 1.05rem; font-weight: 800; color: var(--c-ink); line-height: 1.45; word-break: break-word; }
.admin-request-card__meta { font-size: 0.85rem; color: var(--c-ink-muted); margin-top: 8px; line-height: 1.7; word-break: break-word; }
.admin-request-card__badges { display: flex; gap: 8px; flex-wrap: wrap; }
.admin-request-card__actions {
  display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;
  padding-top: 16px; border-top: 1px solid var(--c-line);
}

@media (max-width: 700px) {
  .admin-page table.data { display: block; background: transparent; border: none; box-shadow: none; }
  .admin-page table.data thead { display: none; }
  .admin-page table.data tbody { display: block; }
  .admin-page table.data tr {
    display: block; background: var(--c-white); border: 1px solid var(--c-line);
    border-radius: var(--radius); padding: 20px; margin-bottom: 14px;
    box-shadow: var(--shadow-xs);
  }
  .admin-page table.data td {
    display: flex; justify-content: space-between; align-items: center;
    gap: 14px; padding: 10px 0; border: none; font-size: 0.88rem;
  }
  .admin-page table.data td::before {
    content: attr(data-label); font-size: 0.72rem; font-weight: 800;
    color: var(--c-ink-muted); text-transform: uppercase;
    letter-spacing: 0.04em; flex-shrink: 0;
  }
}

.chart-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; font-size: 0.88rem; }
.chart-row > span:first-child { min-width: 110px; flex-shrink: 0; font-weight: 700; }
.chart-row > span:last-child { min-width: 64px; text-align: end; flex-shrink: 0; font-family: var(--font-en); font-weight: 800; }
.chart-bar { flex: 1; height: 12px; background: var(--c-navy); border-radius: 999px; min-width: 6px; transition: width 0.4s ease; }
.chart-bar--red { background: var(--c-red); }
`
);

/* ═══════════════════════════════════════════════════════════════
   3) chat.css — إعادة بناء كاملة
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/chat.css",
  `
/* ═══════════════════════════════════════════════════════════════
   Chat — Messenger-style rebuild
   ═══════════════════════════════════════════════════════════════ */

.chat-layout {
  display: grid;
  grid-template-columns: 1fr;
  height: calc(100vh - var(--navbar-h) - var(--bottom-nav-h) - 80px);
  height: calc(100dvh - var(--navbar-h) - var(--bottom-nav-h) - 80px);
  gap: 0;
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--c-white);
  box-shadow: var(--shadow-xs);
  max-width: 1280px;
  margin-inline: auto;
}

@media (min-width: 900px) {
  .chat-layout {
    grid-template-columns: 340px 1fr;
    height: calc(100vh - var(--navbar-h) - 100px);
    height: calc(100dvh - var(--navbar-h) - 100px);
  }
}

/* ═══ Sidebar ═══ */
.chat-sidebar {
  background: var(--c-white);
  border-inline-end: 1px solid var(--c-line);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.chat-sidebar__head {
  padding: 20px 22px;
  border-bottom: 1px solid var(--c-line);
  flex-shrink: 0;
  background: var(--c-navy);
  color: #fff;
}

.chat-sidebar__title {
  font-size: 1.1rem;
  font-weight: 800;
}

.chat-sidebar__new {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: var(--c-red);
  color: #fff;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.chat-sidebar__new:hover { background: var(--c-red-soft); }
.chat-sidebar__new:active { transform: scale(0.97); }

.chat-conversations { flex: 1; overflow-y: auto; }

.chat-conv {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 22px;
  border-bottom: 1px solid var(--c-line);
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
  background: none;
  border-inline: none;
  border-top: none;
  width: 100%;
  text-align: start;
  font-family: inherit;
}

.chat-conv:hover { background: var(--c-off-white); }

.chat-conv.is-active {
  background: var(--c-red-tint);
  border-inline-start: 4px solid var(--c-red);
  padding-inline-start: 18px;
}

.chat-conv__avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 1.05rem;
  flex-shrink: 0;
  color: #fff;
  background: var(--c-navy);
}

.chat-conv__avatar--general { background: linear-gradient(150deg, var(--c-red), var(--c-red-soft)); }
.chat-conv__avatar--team { background: var(--c-navy); }
.chat-conv__avatar--private { background: var(--c-navy-3); }

.chat-conv__body { flex: 1; min-width: 0; }

.chat-conv__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.chat-conv__name {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--c-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-conv__time {
  font-size: 0.72rem;
  color: var(--c-ink-muted);
  font-family: var(--font-en);
  flex-shrink: 0;
}

.chat-conv__preview {
  font-size: 0.84rem;
  color: var(--c-ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.chat-conv__badge {
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--c-red);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  font-family: var(--font-en);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

/* ═══ Chat Panel ═══ */
.chat-panel {
  display: flex;
  flex-direction: column;
  background: var(--c-off-white);
  overflow: hidden;
  position: relative;
}

.chat-panel__empty {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 40px 24px;
  text-align: center;
  color: var(--c-ink-muted);
}

.chat-panel__empty-icon {
  font-size: 3.5rem;
  margin-bottom: 18px;
  opacity: 0.35;
}

/* ═══ Chat Header ═══ */
.chat-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 22px;
  background: var(--c-white);
  border-bottom: 1px solid var(--c-line);
  flex-shrink: 0;
}

.chat-header__back {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--c-off-white);
  border: 1px solid var(--c-line);
  color: var(--c-ink);
  font-size: 1.2rem;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

@media (max-width: 899px) {
  .chat-header__back { display: flex; }
}

.chat-header__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  color: #fff;
  background: var(--c-navy);
  flex-shrink: 0;
}

.chat-header__avatar--general { background: linear-gradient(150deg, var(--c-red), var(--c-red-soft)); }
.chat-header__avatar--team { background: var(--c-navy); }
.chat-header__avatar--private { background: var(--c-navy-3); }

.chat-header__info { flex: 1; min-width: 0; }
.chat-header__title { font-size: 1rem; font-weight: 800; color: var(--c-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-header__sub { font-size: 0.78rem; color: var(--c-ink-muted); margin-top: 2px; }

/* ═══ Messages ═══ */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  -webkit-overflow-scrolling: touch;
}

.chat-message {
  display: flex;
  gap: 10px;
  max-width: 78%;
  align-self: flex-start;
  animation: msg-in 0.2s var(--ease);
}

@keyframes msg-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-message--mine { align-self: flex-end; flex-direction: row-reverse; }

.chat-message__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 0.78rem;
  color: #fff;
  background: var(--c-navy-3);
  flex-shrink: 0;
  align-self: flex-end;
}

.chat-message__bubble {
  padding: 11px 16px;
  border-radius: 18px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--c-ink);
  word-wrap: break-word;
  word-break: break-word;
  box-shadow: var(--shadow-xs);
}

.chat-message--mine .chat-message__bubble {
  background: var(--c-red);
  color: #fff;
  border-color: var(--c-red);
  border-bottom-right-radius: 6px;
}

.chat-message:not(.chat-message--mine) .chat-message__bubble {
  border-bottom-left-radius: 6px;
}

.chat-message__sender {
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--c-red);
  margin-bottom: 5px;
}

.chat-message--mine .chat-message__sender { display: none; }

.chat-message__time {
  font-size: 0.68rem;
  font-family: var(--font-en);
  opacity: 0.65;
  margin-top: 6px;
  text-align: end;
}

/* ═══ Composer ═══ */
.chat-composer {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 16px 22px;
  padding-bottom: calc(16px + var(--safe-bottom));
  background: var(--c-white);
  border-top: 1px solid var(--c-line);
  flex-shrink: 0;
}

@media (min-width: 900px) {
  .chat-composer { padding-bottom: 16px; }
}

.chat-composer__input {
  flex: 1;
  min-width: 0;
  padding: 12px 18px;
  border-radius: 24px;
  border: 1.5px solid var(--c-line-mid);
  background: var(--c-off-white);
  font-family: inherit;
  font-size: 0.92rem;
  color: var(--c-ink);
  outline: none;
  resize: none;
  max-height: 140px;
  line-height: 1.55;
  transition: border-color 0.15s, background 0.15s;
}

.chat-composer__input:focus {
  background: var(--c-white);
  border-color: var(--c-navy);
}

.chat-composer__send {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--c-red);
  color: #fff;
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 1.15rem;
  flex-shrink: 0;
  transition: all 0.15s;
  box-shadow: var(--shadow-red);
}

.chat-composer__send:hover:not(:disabled) { background: var(--c-red-soft); transform: scale(1.05); }
.chat-composer__send:active:not(:disabled) { transform: scale(0.95); }
.chat-composer__send:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

/* ═══ User Picker ═══ */
.user-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;
  padding: 4px 0;
}

.user-picker__search {
  width: 100%;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--c-line-mid);
  background: var(--c-white);
  font-family: inherit;
  font-size: 0.92rem;
  color: var(--c-ink);
  outline: none;
  margin-bottom: 8px;
}

.user-picker__search:focus { border-color: var(--c-navy); }

.user-picker__item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-line);
  background: var(--c-white);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  text-align: start;
  width: 100%;
}

.user-picker__item:hover {
  background: var(--c-off-white);
  border-color: var(--c-line-mid);
}

.user-picker__item.is-selected {
  background: var(--c-red-tint);
  border-color: var(--c-red);
}

.user-picker__avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--c-navy);
  color: #fff;
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.user-picker__info { flex: 1; min-width: 0; }
.user-picker__name { font-weight: 800; font-size: 0.94rem; color: var(--c-ink); }
.user-picker__email { font-size: 0.78rem; color: var(--c-ink-muted); margin-top: 2px; direction: ltr; text-align: start; }

.user-picker__empty {
  padding: 32px 20px;
  text-align: center;
  color: var(--c-ink-muted);
  font-size: 0.9rem;
  border: 1.5px dashed var(--c-line-mid);
  border-radius: var(--radius-sm);
}

/* ═══ Mobile: single column switch ═══ */
@media (max-width: 899px) {
  .chat-layout {
    border-radius: 0;
    border-inline: none;
    height: calc(100dvh - var(--navbar-h) - var(--bottom-nav-h) - 24px);
  }
  .chat-sidebar.is-hidden { display: none; }
  .chat-panel.is-hidden { display: none; }
  .chat-messages { padding: 18px 16px; }
  .chat-composer { padding: 14px 16px; padding-bottom: calc(14px + var(--safe-bottom)); }
  .chat-message { max-width: 88%; }
}
`
);

/* ═══════════════════════════════════════════════════════════════
   4) ConversationsPage — إعادة بناء كاملة
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/ConversationsPage.tsx",
  `
import { useMemo, useState } from 'react';
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
    return users
      .filter((u) => u.uid !== user.uid)
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'ar'));
  }, [users, user]);

  const filteredOthers = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return others;
    return others.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q),
    );
  }, [others, pickerQuery]);

  const myConvs = useMemo(() => {
    if (!user) return [];
    return conversations.filter((c) => {
      if (c.type === 'general') return true;
      if (c.type === 'team') return c.teamId === user.teamId;
      return c.participantUids.includes(user.uid);
    });
  }, [conversations, user]);

  const defaultId = useMemo(
    () => myConvs.find((c) => c.type === 'general')?.id ?? null,
    [myConvs],
  );

  const currentId = activeId ?? defaultId;
  const active = currentId ? myConvs.find((c) => c.id === currentId) : null;

  const activeMsgs = useMemo(() => {
    if (!currentId) return [];
    return messages
      .filter((m) => m.conversationId === currentId)
      .sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1));
  }, [messages, currentId]);

  if (!user) return null;
  if (l1 || l2 || l3) return <Loading fullHeight message="جارٍ تحميل المحادثات..." />;

  const getConvName = (): string => {
    if (!active) return '';
    if (active.type === 'general') return 'المحادثة العامة';
    if (active.type === 'team') {
      return 'فريق ' + (teams.find((t) => t.id === active.teamId)?.name ?? '');
    }
    const otherUid = active.participantUids.find((u) => u !== user.uid);
    return users.find((u) => u.uid === otherUid)?.displayName ?? 'محادثة خاصة';
  };

  const getConvAvatar = (): { text: string; variant: 'general' | 'team' | 'private' } => {
    if (!active) return { text: '?', variant: 'private' };
    if (active.type === 'general') return { text: '🌐', variant: 'general' };
    if (active.type === 'team') {
      return { text: (teams.find((t) => t.id === active.teamId)?.name ?? 'FT').slice(0, 2), variant: 'team' };
    }
    const otherUid = active.participantUids.find((u) => u !== user.uid);
    const other = users.find((u) => u.uid === otherUid);
    return { text: other ? other.displayName.slice(0, 1) : '؟', variant: 'private' };
  };

  const sendMessage = async (text: string) => {
    if (!currentId) return;
    const msg: Message = {
      id: newId('MSG'),
      conversationId: currentId,
      senderUid: user.uid,
      senderName: user.displayName,
      text,
      sentAt: now(),
    };
    try {
      await createOne('messages', msg);
      await updateOne('conversations', currentId, {
        lastMessageAt: now(),
        lastMessageText: text,
        lastMessageSender: user.displayName,
      });
    } catch (e) {
      toast.error('فشل الإرسال', e instanceof Error ? e.message : '');
    }
  };

  const startPrivateChat = async (targetUid: string) => {
    // هل موجودة؟
    const existing = conversations.find(
      (c) =>
        c.type === 'private' &&
        c.participantUids.length === 2 &&
        c.participantUids.includes(user.uid) &&
        c.participantUids.includes(targetUid),
    );
    if (existing) {
      setActiveId(existing.id);
      setMobileShowChat(true);
      setOpenPicker(false);
      setPickerQuery('');
      toast.info('المحادثة موجودة — فتحناها');
      return;
    }
    setBusy(true);
    try {
      const id = newId('CONV');
      await createOne('conversations', {
        id,
        type: 'private',
        title: '',
        participantUids: [user.uid, targetUid],
        lastMessageAt: now(),
        createdBy: user.uid,
      });
      setActiveId(id);
      setMobileShowChat(true);
      setOpenPicker(false);
      setPickerQuery('');
      toast.success('تم إنشاء المحادثة');
    } catch (e) {
      toast.error('فشل الإنشاء', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
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
      await createOne('conversations', {
        id,
        type: 'team',
        title: 'فريق ' + (teams.find((t) => t.id === selectedTeam)?.name ?? ''),
        teamId: selectedTeam,
        participantUids: [],
        lastMessageAt: now(),
        createdBy: user.uid,
      });
      setActiveId(id);
      setMobileShowChat(true);
      setOpenPicker(false);
      toast.success('تم إنشاء محادثة الفريق');
    } catch {
      toast.error('فشل الإنشاء');
    } finally {
      setBusy(false);
    }
  };

  const avatarInfo = getConvAvatar();

  return (
    <div style={{ paddingTop: 16, paddingBottom: 24 }}>
      <div className="chat-layout">
        {/* ═══ Sidebar ═══ */}
        <div className={'chat-sidebar' + (mobileShowChat ? ' is-hidden' : '')}>
          <div className="chat-sidebar__head">
            <div className="row row--between" style={{ gap: 10 }}>
              <div className="chat-sidebar__title">المحادثات</div>
              <button
                type="button"
                className="chat-sidebar__new"
                onClick={() => { setOpenPicker(true); setPickerQuery(''); }}
              >
                + جديدة
              </button>
            </div>
          </div>

          <div className="chat-conversations">
            {myConvs.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: 'var(--c-ink-muted)', fontSize: '0.88rem' }}>
                لا محادثات بعد
                <br />
                <button
                  type="button"
                  className="chat-sidebar__new"
                  style={{ marginTop: 16 }}
                  onClick={() => setOpenPicker(true)}
                >
                  + ابدأ محادثة
                </button>
              </div>
            ) : (
              [...myConvs]
                .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1))
                .map((c) => {
                  const name = c.type === 'general'
                    ? 'المحادثة العامة'
                    : c.type === 'team'
                      ? 'فريق ' + (teams.find((t) => t.id === c.teamId)?.name ?? '')
                      : users.find((u) => u.uid === c.participantUids.find((p) => p !== user.uid))?.displayName ?? 'محادثة';
                  const avt = c.type === 'general' ? '🌐' : c.type === 'team' ? '👥' : '👤';
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={'chat-conv' + (currentId === c.id ? ' is-active' : '')}
                      onClick={() => { setActiveId(c.id); setMobileShowChat(true); }}
                    >
                      <div className={'chat-conv__avatar chat-conv__avatar--' + c.type}>{avt}</div>
                      <div className="chat-conv__body">
                        <div className="chat-conv__top">
                          <div className="chat-conv__name">{name}</div>
                          {c.lastMessageAt ? (
                            <div className="chat-conv__time">{relativeTime(c.lastMessageAt)}</div>
                          ) : null}
                        </div>
                        <div className="chat-conv__preview">
                          {c.lastMessageSender ? (
                            <strong style={{ color: 'var(--c-red)', fontWeight: 700 }}>
                              {c.lastMessageSender}:{' '}
                            </strong>
                          ) : null}
                          {c.lastMessageText || 'لا رسائل بعد'}
                        </div>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* ═══ Chat Panel ═══ */}
        <div className={'chat-panel' + (!mobileShowChat ? ' is-hidden' : '')}>
          {!active ? (
            <div className="chat-panel__empty">
              <div className="chat-panel__empty-icon">💬</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>اختر محادثة</div>
              <div className="small muted">أو اضغط "+ جديدة" لبدء محادثة جديدة</div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button
                  type="button"
                  className="chat-header__back"
                  onClick={() => setMobileShowChat(false)}
                  aria-label="رجوع"
                >
                  ›
                </button>
                <div className={'chat-header__avatar chat-header__avatar--' + avatarInfo.variant}>
                  {avatarInfo.text}
                </div>
                <div className="chat-header__info">
                  <div className="chat-header__title">{getConvName()}</div>
                  <div className="chat-header__sub">
                    {active.type === 'general' ? 'الجميع' : active.type === 'team' ? 'فريق' : 'محادثة خاصة'}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {activeMsgs.length === 0 ? (
                  <EmptyState title="ابدأ المحادثة" message="لا رسائل بعد. كن أول من يكتب." />
                ) : (
                  activeMsgs.map((m) => (
                    <MessageBubble key={m.id} message={m} currentUser={user} />
                  ))
                )}
              </div>

              <Composer onSend={sendMessage} />
            </>
          )}
        </div>
      </div>

      {/* ═══ User Picker Modal ═══ */}
      <Modal
        open={openPicker}
        title="محادثة جديدة"
        onClose={() => { setOpenPicker(false); setPickerQuery(''); }}
        wide
      >
        <div className="chips" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={'chip' + (pickerType === 'private' ? ' is-active' : '')}
            onClick={() => setPickerType('private')}
          >
            محادثة خاصة
          </button>
          <button
            type="button"
            className={'chip' + (pickerType === 'team' ? ' is-active' : '')}
            onClick={() => setPickerType('team')}
          >
            محادثة فريق
          </button>
        </div>

        {pickerType === 'private' ? (
          <>
            <input
              className="user-picker__search"
              type="search"
              placeholder="ابحث بالاسم أو البريد..."
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              autoFocus
            />

            {filteredOthers.length === 0 ? (
              <div className="user-picker__empty">
                {others.length === 0
                  ? 'لا يوجد مستخدمون آخرون في المنصة بعد.'
                  : 'لا نتائج مطابقة للبحث.'}
              </div>
            ) : (
              <div className="user-picker">
                {filteredOthers.map((u) => (
                  <button
                    key={u.uid}
                    type="button"
                    className="user-picker__item"
                    onClick={() => startPrivateChat(u.uid)}
                    disabled={busy}
                  >
                    <div className="user-picker__avatar">
                      {u.displayName.charAt(0)}
                    </div>
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
            <p className="small muted mb-3">اختر الفريق لبدء محادثة جماعية:</p>
            <div className="chips" style={{ marginBottom: 20 }}>
              {teams.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={'chip' + (selectedTeam === t.id ? ' is-active' : '')}
                  onClick={() => setSelectedTeam(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={startTeamChat}
              disabled={busy}
            >
              {busy ? '...' : 'إنشاء محادثة ' + (teams.find((t) => t.id === selectedTeam)?.name ?? '')}
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   5) MessageBubble — نسخة نظيفة
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/components/chat/MessageBubble.tsx",
  `
import type { Message, AppUser } from '@/types';
import { formatTime } from '@/lib/format';

interface MessageBubbleProps {
  message: Message;
  currentUser: AppUser;
}

export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
  const isMine = message.senderUid === currentUser.uid;
  return (
    <div className={'chat-message' + (isMine ? ' chat-message--mine' : '')}>
      {!isMine ? (
        <div className="chat-message__avatar">
          {message.senderName.charAt(0)}
        </div>
      ) : null}
      <div className="chat-message__bubble">
        {!isMine ? <div className="chat-message__sender">{message.senderName}</div> : null}
        <div>{message.text}</div>
        <div className="chat-message__time">{formatTime(message.sentAt)}</div>
      </div>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   6) Composer — نسخة نظيفة
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/components/chat/Composer.tsx",
  `
import { useState, type KeyboardEvent } from 'react';

interface ComposerProps {
  onSend: (text: string) => Promise<void> | void;
  disabled?: boolean;
  placeholder?: string;
}

export function Composer({ onSend, disabled, placeholder = 'اكتب رسالة...' }: ComposerProps) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy || disabled) return;
    setBusy(true);
    try {
      await onSend(trimmed);
      setText('');
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="chat-composer">
      <textarea
        className="chat-composer__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={busy || disabled}
      />
      <button
        type="button"
        className="chat-composer__send"
        onClick={send}
        disabled={!text.trim() || busy || disabled}
        aria-label="إرسال"
      >
        ↑
      </button>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   7) AdminRequestsPage — موافقة نهائية بدل مرحلة
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/admin/AdminRequestsPage.tsx",
  `
import { useMemo, useState } from 'react';
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
const STATUS_TAB: Record<string, string> = {
  all: 'الكل',
  PENDING: 'قيد الانتظار',
  IN_REVIEW: 'قيد المراجعة',
  APPROVED: 'معتمد',
  REJECTED: 'مرفوض',
};

export function AdminRequestsPage() {
  const { user } = useAuth();
  const { data: requests, loading } = useCollection<RequestRecord>('requests');
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [rejecting, setRejecting] = useState<RequestRecord | null>(null);
  const [rejectStepData, setRejectStepData] = useState<ApprovalStep | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [toApproveAll, setToApproveAll] = useState<RequestRecord | null>(null);

  const filtered = useMemo(
    () =>
      requests
        .filter((r) => status === 'all' || r.status === status)
        .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)),
    [requests, status],
  );

  const openReject = async (req: RequestRecord) => {
    if (!user) return;
    const steps = await listWhere<ApprovalStep>('approvals', 'requestId', req.id);
    const step = steps.find((s) => s.status === 'PENDING' && s.order === req.currentStepOrder);
    if (!step) {
      toast.error('لا توجد مرحلة معلّقة');
      return;
    }
    setRejecting(req);
    setRejectStepData(step);
    setComment('');
  };

  const doReject = async () => {
    if (!user || !rejecting || !rejectStepData) return;
    if (!comment.trim()) {
      toast.error('سبب الرفض مطلوب');
      return;
    }
    setBusy(true);
    try {
      await rejectStep(rejecting, rejectStepData, user, comment);
      toast.success('تم رفض الطلب');
      setRejecting(null);
      setRejectStepData(null);
      setComment('');
    } catch (e) {
      toast.error('فشل', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  const doApproveAll = async () => {
    if (!user || !toApproveAll) return;
    setBusy(true);
    try {
      await adminApproveAll(toApproveAll, user);
      toast.success('تمت الموافقة النهائية — تجاوز كل المراحل');
      setToApproveAll(null);
    } catch (e) {
      toast.error('فشل', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="إدارة"
        title="الطلبات"
        description="موافقتك كأدمن = موافقة نهائية. تجاوز كل المراحل بضغطة واحدة."
      />

      <div className="chips mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={cx('chip', status === s && 'is-active')}
            onClick={() => setStatus(s)}
          >
            {STATUS_TAB[s]}
          </button>
        ))}
      </div>

      <SectionHeader eyebrow="القائمة" title={'الطلبات (' + filtered.length + ')'} />

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title="لا طلبات" message="لا توجد طلبات مطابقة." />
      ) : (
        <div className="stack">
          {filtered.map((r) => {
            const fromTeam = r.fromTeamId ? teams.find((t) => t.id === r.fromTeamId) : null;
            const toTeam = r.toTeamId ? teams.find((t) => t.id === r.toTeamId) : null;
            const active = r.status === 'PENDING' || r.status === 'IN_REVIEW';
            return (
              <div key={r.id} className="admin-request-card">
                <div className="admin-request-card__head">
                  <div className="admin-request-card__info">
                    <div className="admin-request-card__title">{r.title}</div>
                    <div className="admin-request-card__meta">
                      {r.requesterName} · {formatDate(r.submittedAt)}
                      {fromTeam ? ' · من ' + fromTeam.name : ''}
                      {toTeam ? ' · إلى ' + toTeam.name : ''}
                    </div>
                  </div>
                  <div className="admin-request-card__badges">
                    <Badge variant="neutral">{REQUEST_TYPE_LABEL[r.type]}</Badge>
                    <Badge
                      variant={
                        r.status === 'APPROVED'
                          ? 'success'
                          : r.status === 'REJECTED'
                            ? 'danger'
                            : r.status === 'IN_REVIEW'
                              ? 'warning'
                              : 'info'
                      }
                    >
                      {REQUEST_STATUS_LABEL[r.status]}
                    </Badge>
                    <Badge variant="neutral">{PRIORITY_LABEL[r.priority]}</Badge>
                  </div>
                </div>

                <div className="admin-request-card__actions">
                  <Link to={'/requests/' + r.id} className="btn btn--ghost btn--sm">
                    تفاصيل
                  </Link>
                  {active ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--success btn--sm"
                        onClick={() => setToApproveAll(r)}
                      >
                        ✓ موافقة نهائية
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => openReject(r)}
                      >
                        ✕ رفض
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal — رفض */}
      <Modal
        open={rejecting !== null}
        title="رفض الطلب"
        onClose={() => { setRejecting(null); setRejectStepData(null); }}
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => { setRejecting(null); setRejectStepData(null); }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={doReject}
              disabled={busy}
            >
              {busy ? '...' : 'تأكيد الرفض'}
            </button>
          </>
        }
      >
        <FormField label="سبب الرفض" required>
          <TextArea value={comment} onChange={setComment} rows={3} placeholder="اشرح سبب الرفض..." />
        </FormField>
      </Modal>

      {/* Confirm — موافقة نهائية */}
      <ConfirmDialog
        open={toApproveAll !== null}
        title="موافقة نهائية"
        message={
          'سيتم اعتماد الطلب "' +
          (toApproveAll?.title || '') +
          '" بشكل نهائي وتجاوز كل مراحل الموافقة. متابعة؟'
        }
        confirmLabel="موافقة نهائية"
        busy={busy}
        onConfirm={doApproveAll}
        onCancel={() => setToApproveAll(null)}
      />
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   8) home.css — الفراغات في الرئيسية
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/home.css",
  `
.home-hero { padding-block: 72px 56px; }
@media (max-width: 640px) { .home-hero { padding-block: 48px 40px; } }

.home-hero__title {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900; line-height: 1.15; margin-top: 16px;
  max-width: 22ch; color: var(--c-navy); letter-spacing: -0.02em;
}
@media (max-width: 640px) { .home-hero__title { font-size: 1.85rem; max-width: none; } }

.home-hero__brand { color: var(--c-red); }

.home-hero__desc {
  margin-top: 22px; max-width: 62ch; color: var(--c-ink-soft);
  font-size: 1.05rem; line-height: 1.9;
}
@media (max-width: 640px) { .home-hero__desc { font-size: 0.96rem; margin-top: 16px; } }

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

.team-card {
  display: flex; flex-direction: column; gap: 20px; padding: 26px;
  background: var(--c-white); border: 1px solid var(--c-line);
  border-radius: var(--radius); text-decoration: none; color: var(--c-ink);
  transition: all 0.18s var(--ease); box-shadow: var(--shadow-xs);
}
.team-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }

.team-card__head { display: flex; align-items: center; justify-content: space-between; gap: 14px; }

.team-card__name {
  font-size: 1.2rem; font-weight: 800; color: var(--c-navy);
  font-family: var(--font-en); letter-spacing: -0.01em; line-height: 1.3;
}

.team-card__rank {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 44px; padding: 6px 14px; border-radius: var(--radius-full);
  background: var(--c-navy); color: #fff; font-family: var(--font-en);
  font-size: 0.78rem; font-weight: 800; flex-shrink: 0;
}

.team-card__rank--first {
  background: var(--c-red); color: #fff;
  box-shadow: 0 4px 12px rgba(193, 39, 45, 0.35);
}

.team-card__stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
  padding-top: 18px; border-top: 1px solid var(--c-line);
}

.team-card__stat { display: flex; flex-direction: column; gap: 6px; }
.team-card__stat-value { font-family: var(--font-en); font-size: 1.2rem; font-weight: 800; color: var(--c-navy); line-height: 1; }
.team-card__stat-label { font-size: 0.72rem; font-weight: 600; color: var(--c-ink-muted); }

.league-table {
  background: var(--c-white); border: 1px solid var(--c-line);
  border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-xs);
}
.league-table__head {
  display: grid; grid-template-columns: 72px 2.2fr 1.6fr 100px 100px;
  gap: 16px; padding: 16px 28px; background: var(--c-navy); color: #fff;
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
}
.league-table__row {
  display: grid; grid-template-columns: 72px 2.2fr 1.6fr 100px 100px;
  gap: 16px; padding: 16px 28px; align-items: center;
  color: var(--c-ink); text-decoration: none;
  border-bottom: 1px solid var(--c-line); transition: background 0.15s;
}
.league-table__row:last-child { border-bottom: none; }
.league-table__row:hover { background: var(--c-off-white); }
.league-table__row .col-rank {
  display: inline-flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border-radius: 50%; background: var(--c-line);
  color: var(--c-ink-soft); font-family: var(--font-en); font-weight: 800;
  font-size: 0.85rem; flex-shrink: 0;
}
.league-table__row .col-rank.rank-1 { background: var(--c-red); color: #fff; box-shadow: 0 3px 10px rgba(193, 39, 45, 0.3); }
.league-table__row .col-rank.rank-2 { background: var(--c-navy-2); color: #fff; }
.league-table__row .col-rank.rank-3 { background: var(--c-navy); color: #fff; }
.league-table__row .col-name { display: flex; align-items: center; gap: 14px; min-width: 0; }
.league-table__name {
  font-weight: 700; font-size: 0.94rem; color: var(--c-ink);
  white-space: normal; word-break: break-word; overflow-wrap: anywhere; line-height: 1.45;
}
.league-table__row .col-team { display: flex; flex-wrap: wrap; gap: 6px; }
.league-table__row .col-hours { font-family: var(--font-en); font-weight: 800; font-size: 0.95rem; color: var(--c-navy); }
.league-table__row .col-points { font-family: var(--font-en); font-weight: 800; font-size: 0.98rem; color: var(--c-red); }

@media (max-width: 700px) {
  .league-table__head { display: none; }
  .league-table { background: transparent; border: none; box-shadow: none; display: flex; flex-direction: column; gap: 12px; }
  .league-table__row {
    display: grid; grid-template-columns: 48px 1fr auto;
    grid-template-areas: 'rank name points' 'rank team hours';
    gap: 8px 14px; padding: 18px 20px; background: var(--c-white);
    border: 1px solid var(--c-line); border-radius: var(--radius); box-shadow: var(--shadow-xs);
  }
  .league-table__row .col-rank { grid-area: rank; align-self: center; }
  .league-table__row .col-name { grid-area: name; }
  .league-table__row .col-team { grid-area: team; }
  .league-table__row .col-points { grid-area: points; text-align: end; align-self: center; }
  .league-table__row .col-hours { grid-area: hours; text-align: end; font-size: 0.78rem; color: var(--c-ink-muted); }
}

.league-filters { display: flex; flex-direction: column; gap: 14px; margin-block: 24px; }
.league-board { display: flex; flex-direction: column; gap: 32px; }
.league-podium { display: grid; grid-template-columns: 1fr; gap: 18px; }
@media (min-width: 640px) { .league-podium { grid-template-columns: repeat(3, 1fr); gap: 22px; } }

.league-podium__card {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 32px 24px; border-radius: var(--radius);
  border: 1.5px solid var(--c-line); background: var(--c-white);
  text-decoration: none; color: var(--c-ink); box-shadow: var(--shadow-xs);
  transition: all 0.18s var(--ease); text-align: center;
}
.league-podium__card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); }
.league-podium__card--1 { border-color: #FCA5A5; background: linear-gradient(180deg, #FFFBFC, #FFFFFF); }
.league-podium__card--2 { border-color: var(--c-line-mid); }
.league-podium__card--3 { border-color: var(--c-line); }
.league-podium__rank {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 5px 16px; border-radius: var(--radius-full);
  font-family: var(--font-en); font-size: 0.78rem; font-weight: 800; margin-bottom: 6px;
}
.league-podium__rank--1 { background: var(--c-red); color: #fff; box-shadow: 0 4px 12px rgba(193, 39, 45, 0.3); }
.league-podium__rank--2 { background: var(--c-navy-2); color: #fff; }
.league-podium__rank--3 { background: var(--c-navy); color: #fff; }
.league-podium__name { font-size: 1.05rem; font-weight: 800; color: var(--c-ink); line-height: 1.4; word-break: break-word; overflow-wrap: anywhere; }
.league-podium__points { font-family: var(--font-en); font-size: 1.2rem; font-weight: 800; color: var(--c-red); }
.league-podium__hours { font-family: var(--font-en); font-size: 0.82rem; color: var(--c-ink-muted); font-weight: 700; }

.home-join-cta {
  padding: 56px 40px; background: var(--c-navy);
  border-radius: var(--radius-lg); text-align: center; color: #fff;
}
@media (max-width: 640px) { .home-join-cta { padding: 40px 28px; } }
.home-join-cta__title { margin-top: 22px; font-size: 1.7rem; font-weight: 900; color: #fff; letter-spacing: -0.02em; }
@media (min-width: 640px) { .home-join-cta__title { font-size: 2rem; } }
.home-join-cta__desc { margin-top: 18px; max-width: 46ch; margin-inline: auto; color: var(--c-paper-soft); font-size: 1rem; line-height: 1.9; }
.home-join-cta__actions { display: flex; justify-content: center; gap: 14px; margin-top: 32px; flex-wrap: wrap; }
`
);

/* ═══════════════════════════════════════════════════════════════
   9) cards.css — padding داخلي للبطاقات
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/cards.css",
  `
.card {
  position: relative; display: block; background: var(--c-white);
  border: 1px solid var(--c-line); border-radius: var(--radius);
  padding: 24px; color: var(--c-ink); box-shadow: var(--shadow-xs);
  transition: border-color 0.18s var(--ease), transform 0.18s var(--ease), box-shadow 0.18s var(--ease);
}
@media (max-width: 640px) { .card { padding: 20px; } }
a.card:hover, button.card:hover { border-color: var(--c-line-mid); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.card.no-click, .card--static { cursor: default; }
.card.no-click:hover, .card--static:hover { transform: none; box-shadow: var(--shadow-xs); }
.card--navy { background: var(--c-navy); border-color: var(--c-navy-2); color: var(--c-paper); }
.card--navy .card__title { color: var(--c-paper); }
.card--navy .card__meta { color: var(--c-paper-muted); }
.card--navy .card__body { color: var(--c-paper-soft); }
.card__title { font-size: 1.02rem; font-weight: 800; color: var(--c-ink); line-height: 1.4; }
.card__meta { font-size: 0.82rem; color: var(--c-ink-muted); margin-top: 6px; line-height: 1.6; }
.card__body { margin-top: 14px; font-size: 0.88rem; color: var(--c-ink-soft); line-height: 1.75; }
.card__footer { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--c-line); display: flex; align-items: center; justify-content: space-between; gap: 12px; }

.stat-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
@media (min-width: 640px) { .stat-row { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 18px; } }

.stat {
  background: var(--c-navy); border: 1px solid var(--c-navy-2);
  border-radius: var(--radius); padding: 24px 18px; text-align: center;
  transition: transform 0.15s var(--ease);
}
@media (min-width: 640px) { .stat { padding: 28px 22px; } }
.stat__value {
  font-family: var(--font-en); font-size: 1.75rem; font-weight: 800;
  color: var(--c-paper); line-height: 1; letter-spacing: -0.03em;
}
@media (min-width: 640px) { .stat__value { font-size: 2rem; } }
.stat__label { margin-top: 10px; font-size: 0.74rem; font-weight: 700; color: var(--c-paper-soft); letter-spacing: 0.02em; }
.stat--red .stat__value { color: var(--c-red); }
.stat--success .stat__value { color: var(--c-green); }
.stat--amber .stat__value { color: var(--c-amber); }
`
);

/* ═══════════════════════════════════════════════════════════════
   10) tables.css
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/tables.css",
  `
.table-wrap {
  border: 1px solid var(--c-line); border-radius: var(--radius);
  overflow: hidden; background: var(--c-white); box-shadow: var(--shadow-xs);
}
table.data { width: 100%; border-collapse: collapse; font-size: 0.9rem; color: var(--c-ink); }
table.data th {
  text-align: start; padding: 16px 24px; font-size: 0.72rem;
  font-weight: 800; color: var(--c-paper); background: var(--c-navy);
  border-bottom: 1px solid var(--c-navy-2); white-space: nowrap;
  text-transform: uppercase; letter-spacing: 0.05em;
}
table.data td { padding: 16px 24px; border-bottom: 1px solid var(--c-line); vertical-align: middle; }
table.data tr:last-child td { border-bottom: none; }
table.data tbody tr { transition: background 0.15s var(--ease); }
table.data tbody tr:hover { background: var(--c-off-white); }
.rank { font-family: var(--font-en); font-weight: 800; color: var(--c-ink-muted); width: 56px; font-size: 0.88rem; }
.rank--1 { color: var(--c-red); font-weight: 900; }
.rank--2 { color: var(--c-navy-2); }
.rank--3 { color: var(--c-ink-soft); }
.points { font-family: var(--font-en); font-weight: 800; color: var(--c-navy); }

@media (max-width: 700px) {
  .table-wrap { border: none; background: transparent; box-shadow: none; overflow: visible; }
  table.data { display: block; font-size: 0.9rem; }
  table.data thead { display: none; }
  table.data tbody { display: block; }
  table.data tr {
    display: block; background: var(--c-white); border: 1px solid var(--c-line);
    border-radius: var(--radius); padding: 20px; margin-bottom: 14px;
    box-shadow: var(--shadow-xs); position: relative;
  }
  table.data td {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border: none; gap: 14px; font-size: 0.88rem;
  }
  table.data td:not(:first-child)::before {
    content: attr(data-label); font-size: 0.72rem; font-weight: 800;
    color: var(--c-ink-muted); text-transform: uppercase;
    letter-spacing: 0.04em; flex-shrink: 0;
  }
}
`
);

/* ═══════════════════════════════════════════════════════════════
   11) global.css
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/global.css",
  `
@import './tokens.css';
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
@import './v52-fix.css';
`
);

/* ═══════════════════════════════════════════════════════════════
   RUN
   ═══════════════════════════════════════════════════════════════ */
const sh = (cmd) => execSync(cmd, { cwd: ROOT, stdio: "inherit" });

console.log("");
console.log(
  `${C.b}${C.m}╔══════════════════════════════════════════════════════╗${C.r}`
);
console.log(
  `${C.b}${C.m}║  fix.cjs — v6.0 الحل الجذري                          ║${C.r}`
);
console.log(
  `${C.b}${C.m}║  الفراغات + المحادثات + الطلبات                     ║${C.r}`
);
console.log(
  `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
);
console.log("");

const bkDir = path.join(ROOT, ".fix-backups", Date.now().toString());
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
console.log(`${C.b}═══ عدد الملفات: ${count} ═══${C.r}\n`);

console.log(`${C.b}▶ TypeScript check${C.r}\n`);
let ok = false;
try {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  ok = true;
  console.log(`\n${C.g}✓ لا أخطاء TypeScript${C.r}`);
} catch {
  console.log(`\n${C.y}⚠ فيه أخطاء${C.r}`);
}

if (!ok) {
  console.log(`\n${C.red}ما تمش الـ push — صلّح الأخطاء الأول${C.r}\n`);
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
  } catch {}
  if (!hasChanges) {
    console.log(`${C.y}ℹ مفيش تغييرات${C.r}\n`);
    process.exit(0);
  }
  sh(
    'git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "feat(v6.0): root padding fix + chat rebuild + request approval"'
  );
  console.log(`\n${C.g}✓ commit${C.r}`);
  sh("git push origin main --force");
  console.log(`\n${C.g}${C.b}✓ تم الـ push${C.r}`);
  console.log(`${C.y}⏱️  استنى 4-7 دقايق، وبعدها Ctrl+Shift+R${C.r}\n`);
} catch {
  console.log(`\n${C.red}✗ فشل الـ push${C.r}`);
  console.log(`  ${C.c}git push origin main --force${C.r}\n`);
  process.exit(1);
}
