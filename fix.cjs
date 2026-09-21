#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — فراغات ومسافات فقط
 * كل الصفحات لازم يكون عندها padding جانبي محترم
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
  c: "\x1b[36m",
  m: "\x1b[35m",
  red: "\x1b[31m",
};

const files = {};
const F = (p, c) => {
  files[p.replace(/\\/g, "/")] = c.replace(/^\n/, "");
};

/* ═══════════════════════════════════════════════════════════════
   1) layout.css — الـ container الأساسي
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/layout.css",
  `
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: var(--safe-top);
  overflow-x: hidden;
}

.app-main {
  flex: 1;
  padding-bottom: var(--safe-bottom);
  overflow-x: hidden;
}

/* ═══ أهم حاجة: الـ container عنده padding جانبي دائمًا ═══ */
.container {
  width: 100%;
  max-width: 1240px;
  margin-inline: auto;
  padding-inline: 32px;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .container { padding-inline: 28px; }
}

@media (max-width: 640px) {
  .container { padding-inline: 24px; }
}

@media (max-width: 420px) {
  .container { padding-inline: 20px; }
}

@media (min-width: 1280px) {
  .container { padding-inline: 56px; }
}

/* ═══ كل عنصر جوه container مش لازق ═══ */
.container > * {
  margin-inline: 0;
}

/* ═══ Sections ═══ */
.section { padding-block: 32px; }
.section--tight { padding-block: 20px; }

@media (min-width: 640px) {
  .section { padding-block: 44px; }
  .section--tight { padding-block: 24px; }
}

/* ═══ Section head ═══ */
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

/* ═══ Stack ═══ */
.stack { display: flex; flex-direction: column; gap: 18px; }
.stack--sm { gap: 12px; }
.stack--lg { gap: 26px; }

/* ═══ Row ═══ */
.row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.row--between { justify-content: space-between; }
.row--gap-6 { gap: 6px; }
.row--gap-16 { gap: 16px; }

/* ═══ Utilities ═══ */
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
@media (min-width: 768px) {
  .hide-mobile { display: block; }
  .show-mobile { display: none !important; }
}
`
);

/* ═══════════════════════════════════════════════════════════════
   2) admin.css — الفراغات في كل صفحات الأدمن
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/admin.css",
  `
/* ═══════════════════════════════════════════════════════════════
   Admin — الفراغات أولوية قصوى
   ═══════════════════════════════════════════════════════════════ */

.admin-page {
  padding-block: 20px 60px;
  padding-inline: 0;
}

/* ═══ Welcome ═══ */
.admin-welcome {
  padding: 16px 0 20px;
  margin-bottom: 12px;
}

.admin-welcome__eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--c-red);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.admin-welcome__name {
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 900;
  color: var(--c-navy);
  line-height: 1.25;
  letter-spacing: -0.02em;
  word-break: break-word;
  margin: 0;
}

.admin-welcome__subtitle {
  margin-top: 12px;
  color: var(--c-ink-muted);
  font-size: 0.94rem;
  line-height: 1.75;
  max-width: 60ch;
}

/* ═══ Stats — الفراغات الكبيرة دي اللي كانت ناقصة ═══ */
.admin-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-block: 32px 40px;
}

@media (min-width: 600px) {
  .admin-stats { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}

@media (min-width: 1024px) {
  .admin-stats { grid-template-columns: repeat(6, 1fr); gap: 18px; }
}

.admin-stats .stat {
  padding: 26px 18px;
  min-height: 116px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius);
}

.admin-stats .stat__value { font-size: 1.75rem; }
.admin-stats .stat__label { font-size: 0.74rem; margin-top: 10px; }

/* ═══ Seed Section ═══ */
.admin-seed {
  margin-block: 40px;
  padding: 28px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
}

@media (max-width: 640px) {
  .admin-seed { padding: 22px; }
}

.admin-seed__head {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 640px) {
  .admin-seed__head {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.admin-seed__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--c-navy);
  margin-bottom: 6px;
}

.admin-seed__desc {
  font-size: 0.86rem;
  color: var(--c-ink-muted);
  line-height: 1.65;
}

.admin-seed__result {
  margin-top: 20px;
  padding: 16px 20px;
  background: var(--c-off-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  line-height: 2;
  color: var(--c-ink-soft);
  word-break: break-word;
}

/* ═══ Admin Cards Grid — الفراغات ═══ */
.admin-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-block: 24px;
}

@media (min-width: 600px) {
  .admin-cards { grid-template-columns: repeat(2, 1fr); gap: 18px; }
}

@media (min-width: 1024px) {
  .admin-cards { grid-template-columns: repeat(3, 1fr); gap: 20px; }
}

.admin-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--c-ink);
  transition: all 0.18s var(--ease);
  box-shadow: var(--shadow-xs);
  min-height: 124px;
}

.admin-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-sm);
  border-color: var(--c-line-mid);
}

.admin-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.admin-card__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--c-navy);
  line-height: 1.4;
}

.admin-card__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--c-red);
  color: #fff;
  font-family: var(--font-en);
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
}

.admin-card__desc {
  font-size: 0.86rem;
  color: var(--c-ink-muted);
  line-height: 1.65;
}

/* ═══ Admin Section Head — الفراغات ═══ */
.admin-page .section,
.admin-page .section--tight {
  padding-inline: 0;
}

.admin-page .section-head {
  padding-inline: 0;
  margin-inline: 0;
  margin-bottom: 28px;
}

.admin-page h1,
.admin-page h2 {
  margin: 0;
}

/* ═══ Admin Cards (general) ═══ */
.admin-page .card {
  padding: 24px;
}

@media (max-width: 640px) {
  .admin-page .card { padding: 20px; }
}

/* ═══ Admin Request Card ═══ */
.admin-request-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
}

@media (min-width: 640px) {
  .admin-request-card { padding: 26px; }
}

.admin-request-card__head {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (min-width: 640px) {
  .admin-request-card__head {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
}

.admin-request-card__info { flex: 1; min-width: 0; }

.admin-request-card__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--c-ink);
  line-height: 1.45;
  word-break: break-word;
}

.admin-request-card__meta {
  font-size: 0.85rem;
  color: var(--c-ink-muted);
  margin-top: 8px;
  line-height: 1.7;
  word-break: break-word;
}

.admin-request-card__badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.admin-request-card__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--c-line);
}

/* ═══ Mobile Tables → Cards ═══ */
@media (max-width: 700px) {
  .admin-page table.data {
    display: block;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .admin-page table.data thead { display: none; }
  .admin-page table.data tbody { display: block; }

  .admin-page table.data tr {
    display: block;
    background: var(--c-white);
    border: 1px solid var(--c-line);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 14px;
    box-shadow: var(--shadow-xs);
  }

  .admin-page table.data td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    padding: 10px 0;
    border: none;
    font-size: 0.88rem;
  }

  .admin-page table.data td::before {
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--c-ink-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
}

/* ═══ Chart Bars ═══ */
.chart-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  font-size: 0.88rem;
}

.chart-row > span:first-child {
  min-width: 110px;
  flex-shrink: 0;
  font-weight: 700;
}

.chart-row > span:last-child {
  min-width: 64px;
  text-align: end;
  flex-shrink: 0;
  font-family: var(--font-en);
  font-weight: 800;
}

.chart-bar {
  flex: 1;
  height: 12px;
  background: var(--c-navy);
  border-radius: 999px;
  min-width: 6px;
  transition: width 0.4s ease;
}

.chart-bar--red { background: var(--c-red); }
`
);

/* ═══════════════════════════════════════════════════════════════
   3) home.css — الفراغات في الرئيسية
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/home.css",
  `
/* ═══ Hero ═══ */
.home-hero {
  padding-block: 72px 56px;
}

@media (max-width: 640px) {
  .home-hero { padding-block: 48px 40px; }
}

.home-hero__title {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  line-height: 1.15;
  margin-top: 16px;
  max-width: 22ch;
  color: var(--c-navy);
  letter-spacing: -0.02em;
}

@media (max-width: 640px) {
  .home-hero__title { font-size: 1.85rem; max-width: none; }
}

.home-hero__brand { color: var(--c-red); }

.home-hero__desc {
  margin-top: 22px;
  max-width: 62ch;
  color: var(--c-ink-soft);
  font-size: 1.05rem;
  line-height: 1.9;
}

@media (max-width: 640px) {
  .home-hero__desc { font-size: 0.96rem; margin-top: 16px; }
}

.home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}

/* ═══ Sections ═══ */
.home-section {
  padding-block: 44px;
}

@media (min-width: 640px) {
  .home-section { padding-block: 56px; }
}

/* ═══ Stats — الفراغات ═══ */
.home-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 640px) {
  .home-stats { grid-template-columns: repeat(4, 1fr); gap: 20px; }
}

.home-stats .stat {
  padding: 28px 20px;
  border-radius: var(--radius);
}

.home-stats .stat__value { font-size: 1.95rem; }
@media (min-width: 640px) { .home-stats .stat__value { font-size: 2.1rem; } }

/* ═══ Teams Grid ═══ */
.home-teams-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 480px) {
  .home-teams-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 900px) {
  .home-teams-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
}

/* ═══ Team Card ═══ */
.team-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 26px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--c-ink);
  transition: all 0.18s var(--ease);
  box-shadow: var(--shadow-xs);
}

.team-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-sm);
  border-color: var(--c-line-mid);
}

.team-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.team-card__name {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--c-navy);
  font-family: var(--font-en);
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.team-card__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: var(--c-navy);
  color: #fff;
  font-family: var(--font-en);
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
}

.team-card__rank--first {
  background: var(--c-red);
  color: #fff;
  box-shadow: 0 4px 12px rgba(193, 39, 45, 0.35);
}

.team-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid var(--c-line);
}

.team-card__stat { display: flex; flex-direction: column; gap: 6px; }

.team-card__stat-value {
  font-family: var(--font-en);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--c-navy);
  line-height: 1;
}

.team-card__stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c-ink-muted);
}

/* ═══ League Table ═══ */
.league-table {
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}

.league-table__head {
  display: grid;
  grid-template-columns: 72px 2.2fr 1.6fr 100px 100px;
  gap: 16px;
  padding: 16px 28px;
  background: var(--c-navy);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.league-table__row {
  display: grid;
  grid-template-columns: 72px 2.2fr 1.6fr 100px 100px;
  gap: 16px;
  padding: 16px 28px;
  align-items: center;
  color: var(--c-ink);
  text-decoration: none;
  border-bottom: 1px solid var(--c-line);
  transition: background 0.15s;
}

.league-table__row:last-child { border-bottom: none; }
.league-table__row:hover { background: var(--c-off-white); }

.league-table__row .col-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--c-line);
  color: var(--c-ink-soft);
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.league-table__row .col-rank.rank-1 {
  background: var(--c-red);
  color: #fff;
  box-shadow: 0 3px 10px rgba(193, 39, 45, 0.3);
}

.league-table__row .col-rank.rank-2 { background: var(--c-navy-2); color: #fff; }
.league-table__row .col-rank.rank-3 { background: var(--c-navy); color: #fff; }

.league-table__row .col-name {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.league-table__name {
  font-weight: 700;
  font-size: 0.94rem;
  color: var(--c-ink);
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  line-height: 1.45;
}

.league-table__row .col-team { display: flex; flex-wrap: wrap; gap: 6px; }
.league-table__row .col-hours {
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--c-navy);
}
.league-table__row .col-points {
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 0.98rem;
  color: var(--c-red);
}

/* ═══ Mobile League ═══ */
@media (max-width: 700px) {
  .league-table__head { display: none; }
  .league-table {
    background: transparent;
    border: none;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .league-table__row {
    display: grid;
    grid-template-columns: 48px 1fr auto;
    grid-template-areas:
      'rank name points'
      'rank team hours';
    gap: 8px 14px;
    padding: 18px 20px;
    background: var(--c-white);
    border: 1px solid var(--c-line);
    border-radius: var(--radius);
    box-shadow: var(--shadow-xs);
  }
  .league-table__row .col-rank { grid-area: rank; align-self: center; }
  .league-table__row .col-name { grid-area: name; }
  .league-table__row .col-team { grid-area: team; }
  .league-table__row .col-points { grid-area: points; text-align: end; align-self: center; }
  .league-table__row .col-hours { grid-area: hours; text-align: end; font-size: 0.78rem; color: var(--c-ink-muted); }
}

/* ═══ League Filters ═══ */
.league-filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-block: 24px;
}

.league-board { display: flex; flex-direction: column; gap: 32px; }

.league-podium { display: grid; grid-template-columns: 1fr; gap: 18px; }
@media (min-width: 640px) { .league-podium { grid-template-columns: repeat(3, 1fr); gap: 22px; } }

.league-podium__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 24px;
  border-radius: var(--radius);
  border: 1.5px solid var(--c-line);
  background: var(--c-white);
  text-decoration: none;
  color: var(--c-ink);
  box-shadow: var(--shadow-xs);
  transition: all 0.18s var(--ease);
  text-align: center;
}

.league-podium__card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-sm);
}

.league-podium__card--1 { border-color: #FCA5A5; background: linear-gradient(180deg, #FFFBFC, #FFFFFF); }
.league-podium__card--2 { border-color: var(--c-line-mid); }
.league-podium__card--3 { border-color: var(--c-line); }

.league-podium__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 16px;
  border-radius: var(--radius-full);
  font-family: var(--font-en);
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.league-podium__rank--1 { background: var(--c-red); color: #fff; box-shadow: 0 4px 12px rgba(193, 39, 45, 0.3); }
.league-podium__rank--2 { background: var(--c-navy-2); color: #fff; }
.league-podium__rank--3 { background: var(--c-navy); color: #fff; }

.league-podium__name {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--c-ink);
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.league-podium__points {
  font-family: var(--font-en);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--c-red);
}

.league-podium__hours {
  font-family: var(--font-en);
  font-size: 0.82rem;
  color: var(--c-ink-muted);
  font-weight: 700;
}

/* ═══ Join CTA ═══ */
.home-join-cta {
  padding: 56px 40px;
  background: var(--c-navy);
  border-radius: var(--radius-lg);
  text-align: center;
  color: #fff;
}

@media (max-width: 640px) {
  .home-join-cta { padding: 40px 28px; }
}

.home-join-cta__title {
  margin-top: 22px;
  font-size: 1.7rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
}

@media (min-width: 640px) { .home-join-cta__title { font-size: 2rem; } }

.home-join-cta__desc {
  margin-top: 18px;
  max-width: 46ch;
  margin-inline: auto;
  color: var(--c-paper-soft);
  font-size: 1rem;
  line-height: 1.9;
}

.home-join-cta__actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 32px;
  flex-wrap: wrap;
}
`
);

/* ═══════════════════════════════════════════════════════════════
   4) cards.css — كل بطاقة عنده فراغ داخلي
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/cards.css",
  `
.card {
  position: relative;
  display: block;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  padding: 24px;
  color: var(--c-ink);
  box-shadow: var(--shadow-xs);
  transition: border-color 0.18s var(--ease), transform 0.18s var(--ease), box-shadow 0.18s var(--ease);
}

@media (max-width: 640px) {
  .card { padding: 20px; }
}

a.card:hover,
button.card:hover {
  border-color: var(--c-line-mid);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.card.no-click,
.card--static { cursor: default; }
.card.no-click:hover,
.card--static:hover { transform: none; box-shadow: var(--shadow-xs); }

.card--navy {
  background: var(--c-navy);
  border-color: var(--c-navy-2);
  color: var(--c-paper);
}

.card--navy .card__title { color: var(--c-paper); }
.card--navy .card__meta { color: var(--c-paper-muted); }
.card--navy .card__body { color: var(--c-paper-soft); }

.card__title {
  font-size: 1.02rem;
  font-weight: 800;
  color: var(--c-ink);
  line-height: 1.4;
}

.card__meta {
  font-size: 0.82rem;
  color: var(--c-ink-muted);
  margin-top: 6px;
  line-height: 1.6;
}

.card__body {
  margin-top: 14px;
  font-size: 0.88rem;
  color: var(--c-ink-soft);
  line-height: 1.75;
}

.card__footer {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--c-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* ═══ Stats ═══ */
.stat-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

@media (min-width: 640px) {
  .stat-row { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 18px; }
}

.stat {
  background: var(--c-navy);
  border: 1px solid var(--c-navy-2);
  border-radius: var(--radius);
  padding: 24px 18px;
  text-align: center;
  transition: transform 0.15s var(--ease);
}

@media (min-width: 640px) {
  .stat { padding: 28px 22px; }
}

.stat__value {
  font-family: var(--font-en);
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--c-paper);
  line-height: 1;
  letter-spacing: -0.03em;
}

@media (min-width: 640px) {
  .stat__value { font-size: 2rem; }
}

.stat__label {
  margin-top: 10px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--c-paper-soft);
  letter-spacing: 0.02em;
}

.stat--red .stat__value { color: var(--c-red); }
.stat--success .stat__value { color: var(--c-green); }
.stat--amber .stat__value { color: var(--c-amber); }
`
);

/* ═══════════════════════════════════════════════════════════════
   5) tables.css — الجداول عندها فراغ جانبي
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/tables.css",
  `
.table-wrap {
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--c-white);
  box-shadow: var(--shadow-xs);
}

table.data {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  color: var(--c-ink);
}

table.data th {
  text-align: start;
  padding: 16px 24px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--c-paper);
  background: var(--c-navy);
  border-bottom: 1px solid var(--c-navy-2);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

table.data td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--c-line);
  vertical-align: middle;
}

table.data tr:last-child td { border-bottom: none; }
table.data tbody tr { transition: background 0.15s var(--ease); }
table.data tbody tr:hover { background: var(--c-off-white); }

.rank {
  font-family: var(--font-en);
  font-weight: 800;
  color: var(--c-ink-muted);
  width: 56px;
  font-size: 0.88rem;
}

.rank--1 { color: var(--c-red); font-weight: 900; }
.rank--2 { color: var(--c-navy-2); }
.rank--3 { color: var(--c-ink-soft); }

.points {
  font-family: var(--font-en);
  font-weight: 800;
  color: var(--c-navy);
}

/* ═══ Mobile ═══ */
@media (max-width: 700px) {
  .table-wrap {
    border: none;
    background: transparent;
    box-shadow: none;
    overflow: visible;
  }

  table.data { display: block; font-size: 0.9rem; }
  table.data thead { display: none; }
  table.data tbody { display: block; }

  table.data tr {
    display: block;
    background: var(--c-white);
    border: 1px solid var(--c-line);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 14px;
    box-shadow: var(--shadow-xs);
    position: relative;
  }

  table.data td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border: none;
    gap: 14px;
    font-size: 0.88rem;
  }

  table.data td:not(:first-child)::before {
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--c-ink-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
}
`
);

/* ═══════════════════════════════════════════════════════════════
   6) sidebar.css — التنسيق للـ sidebar
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/sidebar.css",
  `
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding-block: 24px;
}

@media (min-width: 901px) {
  .dashboard-layout {
    grid-template-columns: 280px 1fr;
    gap: 32px;
    padding-block: 32px;
  }
}

.sidebar { display: block; }

@media (min-width: 901px) {
  .sidebar {
    position: sticky;
    top: calc(var(--navbar-h) + 20px);
    align-self: start;
    max-height: calc(100vh - var(--navbar-h) - 40px);
    overflow-y: auto;
    padding-inline-end: 8px;
  }
}

.sidebar-overlay { display: none; }

@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    top: 0;
    inset-inline-end: -320px;
    width: 290px;
    max-width: 88vw;
    height: 100vh;
    height: 100dvh;
    background: var(--c-white);
    z-index: 200;
    padding: 24px 20px;
    padding-top: calc(24px + var(--safe-top));
    padding-bottom: calc(24px + var(--safe-bottom));
    overflow-y: auto;
    transition: inset-inline-end 0.28s var(--ease);
    box-shadow: -12px 0 40px rgba(21, 26, 69, 0.15);
    border-inline-start: 1px solid var(--c-line);
  }

  .sidebar.is-open { inset-inline-end: 0; }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(21, 26, 69, 0.55);
    z-index: 199;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s var(--ease);
  }

  .sidebar-overlay.is-open { opacity: 1; pointer-events: auto; }
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--c-navy);
  color: var(--c-paper);
  margin-bottom: 24px;
}

.sidebar__user-info { flex: 1; min-width: 0; }

.sidebar__user-name {
  font-weight: 800;
  font-size: 0.95rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__user-role {
  font-size: 0.78rem;
  color: var(--c-paper-soft);
  margin-top: 2px;
}

.sidebar__group { margin-bottom: 24px; }

.sidebar__title {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--c-ink-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0 14px;
  margin-bottom: 10px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  color: var(--c-ink-soft);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.15s var(--ease);
  background: transparent;
  border: none;
  width: 100%;
  text-align: start;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
}

.sidebar__link:hover { background: var(--c-off-white); color: var(--c-navy); }
.sidebar__link.is-active { background: var(--c-navy); color: #fff; }

.sidebar__count {
  margin-inline-start: auto;
  font-family: var(--font-en);
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--c-red);
  color: #fff;
  line-height: 1.3;
  min-width: 24px;
  text-align: center;
}

.sidebar__link--danger { color: var(--c-red); }
.sidebar__link--danger:hover { background: var(--c-red-tint); color: var(--c-red-soft); }
`
);

/* ═══════════════════════════════════════════════════════════════
   7) global.css — ترتيب الاستيراد
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
  `${C.b}${C.m}║  fix.cjs — الفراغات والمسافات                        ║${C.r}`
);
console.log(
  `${C.b}${C.m}║  كل الصفحات عندها padding جانبي محترم               ║${C.r}`
);
console.log(
  `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
);
console.log("");

// Backup
const bkDir = path.join(ROOT, ".fix-backups", Date.now().toString());
fs.mkdirSync(bkDir, { recursive: true });
console.log(`${C.c}📦 backup: .fix-backups/${path.basename(bkDir)}${C.r}\n`);

// Write
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
console.log(`${C.b}═══ عدد الملفات: ${count} ═══${C.r}`);
console.log("");

// tsc
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

// Git
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
    'git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "style: comprehensive spacing and padding across all pages"'
  );
  console.log(`\n${C.g}✓ commit${C.r}`);
  sh("git push origin main --force");
  console.log(`\n${C.g}${C.b}✓ تم الـ push${C.r}`);
  console.log(`${C.y}⏱️  استنى 4-7 دقايق، وبعدها Ctrl+Shift+R${C.r}\n`);
} catch (e) {
  console.log(`\n${C.red}✗ فشل الـ push${C.r}`);
  console.log(`${C.y}جرّب يدوي:${C.r}`);
  console.log(`  ${C.c}git push origin main --force${C.r}\n`);
  process.exit(1);
}
