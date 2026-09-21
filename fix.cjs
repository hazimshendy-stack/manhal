#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const STAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const BACKUP = path.join(ROOT, ".fix-backups", STAMP);
const C = {
  r: "\x1b[0m",
  b: "\x1b[1m",
  d: "\x1b[2m",
  g: "\x1b[32m",
  y: "\x1b[33m",
  r2: "\x1b[31m",
  c: "\x1b[36m",
  m: "\x1b[35m",
};

const files = {};
const F = (p, c) => {
  files[p.replace(/\\/g, "/")] = c.replace(/^\n/, "");
};
const mk = (p) => fs.mkdirSync(p, { recursive: true });
const bk = (rel) => {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  const dst = path.join(BACKUP, rel);
  mk(path.dirname(dst));
  fs.copyFileSync(abs, dst);
};

/* ═══════════════════════════════════════════════════════════════
   1) App.tsx — كل المسارات (CRITICAL FIX)
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/App.tsx",
  `
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';

import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
import { AboutPage } from '@/pages/AboutPage';
import { MembersPage } from '@/pages/MembersPage';
import { MemberProfilePage } from '@/pages/MemberProfilePage';
import { TeamsPage } from '@/pages/TeamsPage';
import { TeamDetailPage } from '@/pages/TeamDetailPage';
import { LeaguePage } from '@/pages/LeaguePage';
import { CommitteesPage } from '@/pages/CommitteesPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { GovernancePage } from '@/pages/GovernancePage';
import { SearchPage } from '@/pages/SearchPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { DashboardPage } from '@/pages/DashboardPage';
import { MyProfilePage } from '@/pages/MyProfilePage';
import { MyContributionsPage } from '@/pages/MyContributionsPage';
import { MyRequestsPage } from '@/pages/MyRequestsPage';
import { NewRequestPage } from '@/pages/NewRequestPage';
import { RequestsPage } from '@/pages/RequestsPage';
import { RequestDetailPage } from '@/pages/RequestDetailPage';
import { ApprovalsPage } from '@/pages/ApprovalsPage';
import { ContributionsPage } from '@/pages/ContributionsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ConversationsPage } from '@/pages/ConversationsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AuditPage } from '@/pages/AuditPage';

import { AdminHomePage } from '@/pages/admin/AdminHomePage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminMembersPage } from '@/pages/admin/AdminMembersPage';
import { AdminContributionsPage } from '@/pages/admin/AdminContributionsPage';
import { AdminCommitteesPage } from '@/pages/admin/AdminCommitteesPage';
import { AdminAchievementsPage } from '@/pages/admin/AdminAchievementsPage';
import { AdminWarningsPage } from '@/pages/admin/AdminWarningsPage';
import { AdminCalendarPage } from '@/pages/admin/AdminCalendarPage';
import { AdminConversationsPage } from '@/pages/admin/AdminConversationsPage';
import { AdminNotificationsPage } from '@/pages/admin/AdminNotificationsPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminGovernancePage } from '@/pages/admin/AdminGovernancePage';
import { AdminRequestsPage } from '@/pages/admin/AdminRequestsPage';
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';

const ADMIN_ROLES: any[] = ['HEAD', 'VICE'];

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* ═══ Public ═══ */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/members/:memberId" element={<MemberProfilePage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:teamId" element={<TeamDetailPage />} />
            <Route path="/league" element={<LeaguePage />} />
            <Route path="/committees" element={<CommitteesPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* ═══ Protected ═══ */}
            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><MyProfilePage /></RequireAuth>} />
            <Route path="/my-contributions" element={<RequireAuth><MyContributionsPage /></RequireAuth>} />
            <Route path="/my-requests" element={<RequireAuth><MyRequestsPage /></RequireAuth>} />
            <Route path="/requests/new" element={<RequireAuth><NewRequestPage /></RequireAuth>} />
            <Route path="/requests" element={<RequireAuth roles={['HEAD','VICE','HEAD_HR','PRESIDENT','VICE_PRESIDENT','HR']}><RequestsPage /></RequireAuth>} />
            <Route path="/requests/:requestId" element={<RequireAuth><RequestDetailPage /></RequireAuth>} />
            <Route path="/approvals" element={<RequireAuth roles={['HEAD','VICE','HEAD_HR','PRESIDENT','VICE_PRESIDENT','HR']}><ApprovalsPage /></RequireAuth>} />
            <Route path="/contributions" element={<RequireAuth roles={['HEAD','VICE','HEAD_HR','PRESIDENT','VICE_PRESIDENT','HR']}><ContributionsPage /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
            <Route path="/conversations" element={<RequireAuth><ConversationsPage /></RequireAuth>} />
            <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth roles={['HEAD','VICE','HEAD_HR','PRESIDENT','VICE_PRESIDENT','HR']}><ReportsPage /></RequireAuth>} />
            <Route path="/audit" element={<RequireAuth roles={['HEAD','VICE']}><AuditPage /></RequireAuth>} />

            {/* ═══ Admin ═══ */}
            <Route path="/admin" element={<RequireAuth roles={ADMIN_ROLES}><AdminHomePage /></RequireAuth>} />
            <Route path="/admin/analytics" element={<RequireAuth roles={ADMIN_ROLES}><AdminAnalyticsPage /></RequireAuth>} />
            <Route path="/admin/requests" element={<RequireAuth roles={ADMIN_ROLES}><AdminRequestsPage /></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth roles={ADMIN_ROLES}><AdminUsersPage /></RequireAuth>} />
            <Route path="/admin/members" element={<RequireAuth roles={ADMIN_ROLES}><AdminMembersPage /></RequireAuth>} />
            <Route path="/admin/contributions" element={<RequireAuth roles={ADMIN_ROLES}><AdminContributionsPage /></RequireAuth>} />
            <Route path="/admin/committees" element={<RequireAuth roles={ADMIN_ROLES}><AdminCommitteesPage /></RequireAuth>} />
            <Route path="/admin/achievements" element={<RequireAuth roles={ADMIN_ROLES}><AdminAchievementsPage /></RequireAuth>} />
            <Route path="/admin/warnings" element={<RequireAuth roles={ADMIN_ROLES}><AdminWarningsPage /></RequireAuth>} />
            <Route path="/admin/calendar" element={<RequireAuth roles={ADMIN_ROLES}><AdminCalendarPage /></RequireAuth>} />
            <Route path="/admin/conversations" element={<RequireAuth roles={ADMIN_ROLES}><AdminConversationsPage /></RequireAuth>} />
            <Route path="/admin/notifications" element={<RequireAuth roles={ADMIN_ROLES}><AdminNotificationsPage /></RequireAuth>} />
            <Route path="/admin/governance" element={<RequireAuth roles={ADMIN_ROLES}><AdminGovernancePage /></RequireAuth>} />
            <Route path="/admin/audit" element={<RequireAuth roles={ADMIN_ROLES}><AdminAuditPage /></RequireAuth>} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <ToastContainer />
        <Onboarding />
        <PwaInstallBanner />
      </HashRouter>
    </ErrorBoundary>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   2) global.css
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
   3) layout.css — الهوامش الجانبية
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/layout.css",
  `
.app-shell { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; padding-top: var(--safe-top); overflow-x: hidden; }
.app-main { flex: 1; padding-bottom: var(--safe-bottom); overflow-x: hidden; }

.container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 24px;
  box-sizing: border-box;
}
@media (min-width: 640px) { .container { padding-inline: 32px; } }
@media (min-width: 1024px) { .container { padding-inline: 48px; } }
@media (max-width: 480px) { .container { padding-inline: 20px; } }

.section { padding-block: 28px; }
.section--tight { padding-block: 18px; }
@media (min-width: 640px) { .section { padding-block: 36px; } .section--tight { padding-block: 22px; } }

.section-head { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
@media (min-width: 640px) { .section-head { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 28px; } }

.section-head__eyebrow { font-size: 0.72rem; font-weight: 800; color: var(--c-red); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
.section-head h2 { font-size: 1.4rem; font-weight: 800; }
.section-head__desc { color: var(--c-ink-muted); font-size: 0.9rem; margin-top: 8px; max-width: 62ch; line-height: 1.65; }

.grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
@media (min-width: 480px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 18px; } }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; } }

.grid--wide { grid-template-columns: 1fr; }
@media (min-width: 640px) { .grid--wide { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid--wide { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); } }

.grid--narrow { grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (min-width: 640px) { .grid--narrow { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; } }

.grid--2 { grid-template-columns: 1fr; }
@media (min-width: 768px) { .grid--2 { grid-template-columns: repeat(2, 1fr); } }

.stack { display: flex; flex-direction: column; gap: 16px; }
.stack--sm { gap: 10px; }
.stack--lg { gap: 24px; }
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
`
);

/* ═══════════════════════════════════════════════════════════════
   4) admin.css — كل تنسيقات الأدمن
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/admin.css",
  `
/* ══════════ Admin Page ══════════ */
.admin-page { padding-block: 12px 40px; }

.admin-welcome { padding: 20px 0 12px; margin-bottom: 8px; }
.admin-welcome__eyebrow { font-size: 0.72rem; font-weight: 800; color: var(--c-red); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 10px; }
.admin-welcome__name { font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 900; color: var(--c-navy); line-height: 1.2; letter-spacing: -0.02em; word-break: break-word; margin: 0; }
.admin-welcome__subtitle { margin-top: 10px; color: var(--c-ink-muted); font-size: 0.94rem; line-height: 1.7; max-width: 60ch; }

.admin-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-block: 24px 32px; }
@media (min-width: 600px) { .admin-stats { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
@media (min-width: 1024px) { .admin-stats { grid-template-columns: repeat(6, 1fr); gap: 16px; } }
.admin-stats .stat { padding: 24px 14px; min-height: 112px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.admin-stats .stat__value { font-size: 1.7rem; }
.admin-stats .stat__label { font-size: 0.72rem; margin-top: 10px; }

.admin-seed { margin-block: 28px; padding: 24px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); box-shadow: var(--shadow-xs); }
@media (max-width: 640px) { .admin-seed { padding: 18px; } }
.admin-seed__head { display: flex; flex-direction: column; gap: 14px; }
@media (min-width: 640px) { .admin-seed__head { flex-direction: row; align-items: center; justify-content: space-between; } }
.admin-seed__title { font-size: 1.05rem; font-weight: 800; color: var(--c-navy); margin-bottom: 4px; }
.admin-seed__desc { font-size: 0.86rem; color: var(--c-ink-muted); line-height: 1.6; }
.admin-seed__result { margin-top: 18px; padding: 14px 18px; background: var(--c-off-white); border: 1px solid var(--c-line); border-radius: var(--radius-sm); font-size: 0.85rem; line-height: 2; color: var(--c-ink-soft); word-break: break-word; }

.admin-cards { display: grid; grid-template-columns: 1fr; gap: 14px; margin-block: 20px; }
@media (min-width: 600px) { .admin-cards { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
@media (min-width: 1024px) { .admin-cards { grid-template-columns: repeat(3, 1fr); gap: 18px; } }

.admin-card { display: flex; flex-direction: column; gap: 10px; padding: 22px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); text-decoration: none; color: var(--c-ink); transition: all 0.18s var(--ease); box-shadow: var(--shadow-xs); min-height: 118px; }
.admin-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }
.admin-card__head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.admin-card__title { font-size: 1.05rem; font-weight: 800; color: var(--c-navy); line-height: 1.35; }
.admin-card__count { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; padding: 3px 10px; border-radius: var(--radius-full); background: var(--c-red); color: #fff; font-family: var(--font-en); font-size: 0.75rem; font-weight: 800; flex-shrink: 0; }
.admin-card__desc { font-size: 0.85rem; color: var(--c-ink-muted); line-height: 1.6; }

.admin-page .section, .admin-page .section--tight { padding-inline: 0; }
.admin-page .section-head { padding-inline: 0; margin-inline: 0; }
.admin-page h1, .admin-page h2 { margin: 0; }
.admin-page .card { padding: 22px; }
@media (max-width: 640px) { .admin-page .card { padding: 18px; } }

/* Approval Request Card */
.admin-request-card { display: flex; flex-direction: column; gap: 16px; padding: 20px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); box-shadow: var(--shadow-xs); }
@media (min-width: 640px) { .admin-request-card { padding: 22px; } }
.admin-request-card__head { display: flex; flex-direction: column; gap: 12px; }
@media (min-width: 640px) { .admin-request-card__head { flex-direction: row; align-items: flex-start; justify-content: space-between; } }
.admin-request-card__info { flex: 1; min-width: 0; }
.admin-request-card__title { font-size: 1.05rem; font-weight: 800; color: var(--c-ink); line-height: 1.4; word-break: break-word; }
.admin-request-card__meta { font-size: 0.84rem; color: var(--c-ink-muted); margin-top: 6px; line-height: 1.6; word-break: break-word; }
.admin-request-card__badges { display: flex; gap: 6px; flex-wrap: wrap; }
.admin-request-card__actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; padding-top: 14px; border-top: 1px solid var(--c-line); }

/* Mobile tables → cards */
@media (max-width: 700px) {
  .admin-page table.data { display: block; background: transparent; border: none; box-shadow: none; }
  .admin-page table.data thead { display: none; }
  .admin-page table.data tbody { display: block; }
  .admin-page table.data tr { display: block; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; box-shadow: var(--shadow-xs); }
  .admin-page table.data td { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; border: none; font-size: 0.88rem; }
  .admin-page table.data td::before { content: attr(data-label); font-size: 0.72rem; font-weight: 800; color: var(--c-ink-muted); text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0; }
}

/* Chart Bars */
.chart-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; font-size: 0.88rem; }
.chart-row > span:first-child { min-width: 100px; flex-shrink: 0; font-weight: 700; }
.chart-row > span:last-child { min-width: 60px; text-align: end; flex-shrink: 0; font-family: var(--font-en); font-weight: 800; }
.chart-bar { flex: 1; height: 12px; background: var(--c-navy); border-radius: 999px; min-width: 6px; transition: width 0.4s ease; }
.chart-bar--red { background: var(--c-red); }
`
);

/* ═══════════════════════════════════════════════════════════════
   5) home.css — Homepage + League + TeamCard
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/home.css",
  `
.home-hero { padding-block: 56px 40px; }
@media (max-width: 640px) { .home-hero { padding-block: 40px 32px; } }
.home-hero__title { font-size: clamp(1.9rem, 5vw, 3rem); font-weight: 900; line-height: 1.15; margin-top: 14px; max-width: 22ch; color: var(--c-navy); letter-spacing: -0.02em; }
@media (max-width: 640px) { .home-hero__title { font-size: 1.75rem; max-width: none; } }
.home-hero__brand { color: var(--c-red); }
.home-hero__desc { margin-top: 18px; max-width: 62ch; color: var(--c-ink-soft); font-size: 1.02rem; line-height: 1.85; }
@media (max-width: 640px) { .home-hero__desc { font-size: 0.94rem; margin-top: 14px; } }
.home-hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }

.home-section { padding-block: 32px; }
@media (min-width: 640px) { .home-section { padding-block: 44px; } }

.home-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (min-width: 640px) { .home-stats { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
.home-stats .stat { padding: 24px 16px; }
.home-stats .stat__value { font-size: 1.85rem; }
@media (min-width: 640px) { .home-stats .stat__value { font-size: 2rem; } }

.home-teams-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 480px) { .home-teams-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 900px) { .home-teams-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; } }

.team-card { display: flex; flex-direction: column; gap: 18px; padding: 24px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); text-decoration: none; color: var(--c-ink); transition: all 0.18s var(--ease); box-shadow: var(--shadow-xs); }
.team-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }
.team-card__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.team-card__name { font-size: 1.2rem; font-weight: 800; color: var(--c-navy); font-family: var(--font-en); letter-spacing: -0.01em; line-height: 1.25; }
.team-card__rank { display: inline-flex; align-items: center; justify-content: center; min-width: 42px; padding: 5px 12px; border-radius: var(--radius-full); background: var(--c-navy); color: #fff; font-family: var(--font-en); font-size: 0.78rem; font-weight: 800; flex-shrink: 0; }
.team-card__rank--first { background: var(--c-red); color: #fff; box-shadow: 0 4px 12px rgba(193, 39, 45, 0.35); }
.team-card__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-top: 16px; border-top: 1px solid var(--c-line); }
.team-card__stat { display: flex; flex-direction: column; gap: 4px; }
.team-card__stat-value { font-family: var(--font-en); font-size: 1.2rem; font-weight: 800; color: var(--c-navy); line-height: 1; }
.team-card__stat-label { font-size: 0.72rem; font-weight: 600; color: var(--c-ink-muted); }

.league-table { background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-xs); }
.league-table__head { display: grid; grid-template-columns: 64px 2.2fr 1.6fr 90px 90px; gap: 14px; padding: 14px 22px; background: var(--c-navy); color: #fff; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }
.league-table__row { display: grid; grid-template-columns: 64px 2.2fr 1.6fr 90px 90px; gap: 14px; padding: 14px 22px; align-items: center; color: var(--c-ink); text-decoration: none; border-bottom: 1px solid var(--c-line); transition: background 0.15s; }
.league-table__row:last-child { border-bottom: none; }
.league-table__row:hover { background: var(--c-off-white); }
.league-table__row .col-rank { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: var(--c-line); color: var(--c-ink-soft); font-family: var(--font-en); font-weight: 800; font-size: 0.85rem; flex-shrink: 0; }
.league-table__row .col-rank.rank-1 { background: var(--c-red); color: #fff; box-shadow: 0 3px 10px rgba(193, 39, 45, 0.3); }
.league-table__row .col-rank.rank-2 { background: var(--c-navy-2); color: #fff; }
.league-table__row .col-rank.rank-3 { background: var(--c-navy); color: #fff; }
.league-table__row .col-name { display: flex; align-items: center; gap: 12px; min-width: 0; }
.league-table__name { font-weight: 700; font-size: 0.94rem; color: var(--c-ink); white-space: normal; word-break: break-word; overflow-wrap: anywhere; line-height: 1.4; }
.league-table__row .col-team { display: flex; flex-wrap: wrap; gap: 4px; }
.league-table__row .col-hours { font-family: var(--font-en); font-weight: 800; font-size: 0.95rem; color: var(--c-navy); }
.league-table__row .col-points { font-family: var(--font-en); font-weight: 800; font-size: 0.98rem; color: var(--c-red); }

@media (max-width: 700px) {
  .league-table__head { display: none; }
  .league-table { background: transparent; border: none; box-shadow: none; display: flex; flex-direction: column; gap: 10px; }
  .league-table__row { display: grid; grid-template-columns: 44px 1fr auto; grid-template-areas: 'rank name points' 'rank team hours'; gap: 6px 12px; padding: 14px 16px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); box-shadow: var(--shadow-xs); }
  .league-table__row .col-rank { grid-area: rank; align-self: center; }
  .league-table__row .col-name { grid-area: name; }
  .league-table__row .col-team { grid-area: team; }
  .league-table__row .col-points { grid-area: points; text-align: end; align-self: center; }
  .league-table__row .col-hours { grid-area: hours; text-align: end; font-size: 0.78rem; color: var(--c-ink-muted); }
}

.league-filters { display: flex; flex-direction: column; gap: 10px; margin-block: 18px; }
.league-board { display: flex; flex-direction: column; gap: 28px; }
.league-podium { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 640px) { .league-podium { grid-template-columns: repeat(3, 1fr); gap: 18px; } }
.league-podium__card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 28px 20px; border-radius: var(--radius); border: 1.5px solid var(--c-line); background: var(--c-white); text-decoration: none; color: var(--c-ink); box-shadow: var(--shadow-xs); transition: all 0.18s var(--ease); text-align: center; }
.league-podium__card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); }
.league-podium__card--1 { border-color: #FCA5A5; background: linear-gradient(180deg, #FFFBFC, #FFFFFF); }
.league-podium__rank { display: inline-flex; align-items: center; justify-content: center; padding: 4px 14px; border-radius: var(--radius-full); font-family: var(--font-en); font-size: 0.78rem; font-weight: 800; margin-bottom: 4px; }
.league-podium__rank--1 { background: var(--c-red); color: #fff; }
.league-podium__rank--2 { background: var(--c-navy-2); color: #fff; }
.league-podium__rank--3 { background: var(--c-navy); color: #fff; }
.league-podium__name { font-size: 1rem; font-weight: 800; color: var(--c-ink); line-height: 1.35; word-break: break-word; overflow-wrap: anywhere; }
.league-podium__points { font-family: var(--font-en); font-size: 1.15rem; font-weight: 800; color: var(--c-red); }
.league-podium__hours { font-family: var(--font-en); font-size: 0.82rem; color: var(--c-ink-muted); font-weight: 700; }

.home-join-cta { padding: 44px 32px; background: var(--c-navy); border-radius: var(--radius-lg); text-align: center; color: #fff; }
@media (max-width: 640px) { .home-join-cta { padding: 32px 22px; } }
.home-join-cta__title { margin-top: 18px; font-size: 1.6rem; font-weight: 900; color: #fff; }
.home-join-cta__desc { margin-top: 14px; max-width: 46ch; margin-inline: auto; color: var(--c-paper-soft); font-size: 0.98rem; line-height: 1.85; }
.home-join-cta__actions { display: flex; justify-content: center; gap: 12px; margin-top: 26px; flex-wrap: wrap; }
`
);

/* ═══════════════════════════════════════════════════════════════
   6) footer.css
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/styles/footer.css",
  `
.footer { margin-top: 64px; background: var(--c-navy); color: var(--c-paper); border-top: 4px solid var(--c-red); padding-block: 40px 32px; }
@media (min-width: 900px) { .footer { padding-block: 48px 40px; } }
@media (max-width: 900px) { .footer { padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 40px); margin-bottom: 8px; } }
.footer__inner { display: grid; gap: 32px; grid-template-columns: 1fr; }
@media (min-width: 640px) { .footer__inner { grid-template-columns: 1fr 1fr; gap: 36px; } }
@media (min-width: 900px) { .footer__inner { grid-template-columns: 2fr 3fr; gap: 48px; } }
.footer__brand-col { display: flex; flex-direction: column; gap: 14px; }
.footer__brand { font-family: var(--font-en); font-weight: 800; font-size: 1.35rem; color: var(--c-paper); }
.footer__tagline { font-size: 0.9rem; color: var(--c-paper-soft); line-height: 1.75; max-width: 42ch; }
.footer__copyright { font-size: 0.8rem; color: var(--c-paper-muted); padding-top: 14px; border-top: 1px solid var(--c-navy-2); margin-top: 8px; }
.footer__links-col { display: grid; gap: 28px; grid-template-columns: repeat(2, 1fr); }
@media (min-width: 640px) { .footer__links-col { grid-template-columns: repeat(3, 1fr); } }
.footer__group-title { font-size: 0.72rem; font-weight: 800; color: var(--c-red); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
.footer__links { display: flex; flex-direction: column; gap: 10px; }
.footer__link { font-size: 0.88rem; color: var(--c-paper-soft); transition: color 0.15s var(--ease); line-height: 1.5; }
.footer__link:hover { color: var(--c-red); }
@media print { .footer { display: none; } }
`
);

/* ═══════════════════════════════════════════════════════════════
   7) Avatar (بدون حرفين)
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/components/ui/Avatar.tsx",
  `
interface AvatarProps {
  name?: string;
  size?: number;
  variant?: 'navy' | 'red' | 'gradient' | 'light';
  src?: string;
}
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
    <div aria-label={name ?? 'صورة العضو'} title={name} style={{
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
}
`
);

/* ═══════════════════════════════════════════════════════════════
   8) TeamCard (الاسم فقط + #1 أحمر)
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/components/team/TeamCard.tsx",
  `
import { Link } from 'react-router-dom';
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
        <div className="team-card__stat"><span className="team-card__stat-value">{totalPoints}</span><span className="team-card__stat-label">نقاط</span></div>
        <div className="team-card__stat"><span className="team-card__stat-value">{teamMembers.length}</span><span className="team-card__stat-label">أعضاء</span></div>
        <div className="team-card__stat"><span className="team-card__stat-value">{avgPoints}</span><span className="team-card__stat-label">متوسط</span></div>
      </div>
    </Link>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   9) HomePage ("منحل" + داتا حقيقية + إخفاء Join للمسجل)
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/HomePage.tsx",
  `
import { Link } from 'react-router-dom';
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
          <h1 className="home-hero__title">منحل <span className="home-hero__brand">{site.organization}</span> Sub Branches</h1>
          <p className="home-hero__desc">{site.description}</p>
          <div className="home-hero__actions">
            <Link to="/members" className="btn btn--primary">تصفح الأعضاء</Link>
            <Link to="/league" className="btn btn--ghost">الترتيب العام</Link>
            {!user ? <Link to="/login" className="btn btn--ghost">تسجيل الدخول</Link> : null}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          {isLoading ? <Loading /> : (
            <div className="home-stats">
              <div className="stat"><div className="stat__value">{activeMembers.length}</div><div className="stat__label">الأعضاء</div></div>
              <div className="stat"><div className="stat__value">{teams.length}</div><div className="stat__label">الفرق</div></div>
              <div className="stat"><div className="stat__value">{totalPoints}</div><div className="stat__label">مجموع النقاط</div></div>
              <div className="stat"><div className="stat__value">{totalHours}</div><div className="stat__label">مجموع الساعات</div></div>
            </div>
          )}
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <SectionHeader eyebrow="ترتيب الفرق" title="الفرق حسب النقاط"
            action={<Link to="/teams" className="btn btn--ghost btn--sm">كل الفرق</Link>} />
          {isLoading ? <Loading /> : teamRanking.length === 0 ? <EmptyState title="لا بيانات" message="لم تُضف فرق بعد." /> : (
            <div className="home-teams-grid">
              {teamRanking.map((r) => <TeamCard key={r.team.id} team={r.team} rank={r.rank} />)}
            </div>
          )}
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <SectionHeader eyebrow="الترتيب العام" title="أعلى الأعضاء"
            action={<Link to="/league" className="btn btn--ghost btn--sm">الترتيب الكامل</Link>} />
          {isLoading ? <Loading /> : topMembers.length === 0 ? <EmptyState title="لا أعضاء" message="لم يُضف أعضاء بعد." /> : (
            <div className="league-table">
              <div className="league-table__head">
                <span>#</span><span>العضو</span><span>الفريق</span><span>الساعات</span><span>النقاط</span>
              </div>
              {topMembers.map((e) => {
                const tm = teams.filter((t) => e.member.teamIds.includes(t.id));
                return (
                  <Link key={e.member.id} to={'/members/' + e.member.id} className="league-table__row">
                    <span className={'col-rank' + (e.rank <= 3 ? ' rank-' + e.rank : '')}>{e.rank}</span>
                    <span className="col-name">
                      <Avatar name={e.member.name} size={32} variant="navy" />
                      <span className="league-table__name">{e.member.name}</span>
                    </span>
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
              <h2 className="home-join-cta__title">انضم إلى المنحل</h2>
              <p className="home-join-cta__desc">سجّل دخولك لمتابعة مشاركاتك، التقدم في الليج، والموافقات على طلباتك.</p>
              <div className="home-join-cta__actions">
                <Link to="/login" className="btn btn--primary">تسجيل الدخول</Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   10) LeaguePage (تصميم كامل)
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/LeaguePage.tsx",
  `
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { hoursToPoints, cx } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonList } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import type { Member, TeamId, RoleId } from '@/types';

const EXCLUDED: RoleId[] = ['HEAD', 'VICE'];
type FilterType = 'all' | 'team' | 'committee';

export function LeaguePage() {
  const { data: members, loading } = useRealtimeCollection<Member>('members');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterId, setFilterId] = useState<string>('all');

  const eligible = useMemo(() => members.filter((m) => !EXCLUDED.includes(m.role)), [members]);
  const filtered = useMemo(() => {
    if (filterType === 'all' || filterId === 'all') return eligible;
    if (filterType === 'team') return eligible.filter((m) => m.teamIds.includes(filterId as TeamId));
    return eligible.filter((m) => m.committeeIds.includes(filterId));
  }, [eligible, filterType, filterId]);

  const board = useMemo(() => [...filtered]
    .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
    .map((m, i) => ({ member: m, rank: i + 1, points: hoursToPoints(m.hours) })), [filtered]);

  const title = filterType === 'all' ? 'الترتيب العام'
    : filterType === 'team' ? 'ترتيب فريق ' + (teams.find((t) => t.id === filterId)?.name || '')
    : 'ترتيب لجنة ' + (committees.find((c) => c.id === filterId)?.nameAr || '');

  return (
    <div className="container">
      <PageHeader eyebrow="الترتيب" title="الليج" description="ترتيب الأعضاء على مستوى المنظمة، الفريق، واللجنة." />

      <div className="league-filters">
        <div className="chips">
          <button type="button" className={cx('chip', filterType === 'all' && 'is-active')} onClick={() => { setFilterType('all'); setFilterId('all'); }}>عام</button>
          <button type="button" className={cx('chip', filterType === 'team' && 'is-active')} onClick={() => { setFilterType('team'); setFilterId('all'); }}>حسب الفريق</button>
          <button type="button" className={cx('chip', filterType === 'committee' && 'is-active')} onClick={() => { setFilterType('committee'); setFilterId('all'); }}>حسب اللجنة</button>
        </div>
        {filterType === 'team' ? (
          <div className="chips">
            <button type="button" className={cx('chip', filterId === 'all' && 'is-active')} onClick={() => setFilterId('all')}>كل الفرق</button>
            {teams.map((t) => <button key={t.id} type="button" className={cx('chip', filterId === t.id && 'is-active')} onClick={() => setFilterId(t.id)}>{t.name}</button>)}
          </div>
        ) : null}
        {filterType === 'committee' ? (
          <div className="chips">
            <button type="button" className={cx('chip', filterId === 'all' && 'is-active')} onClick={() => setFilterId('all')}>كل اللجان</button>
            {committees.map((c) => <button key={c.id} type="button" className={cx('chip', filterId === c.id && 'is-active')} onClick={() => setFilterId(c.id)}>{c.nameAr}</button>)}
          </div>
        ) : null}
      </div>

      <section className="section">
        <SectionHeader eyebrow="الترتيب" title={title} />
        {loading ? <SkeletonList count={8} /> : board.length === 0 ? (
          <EmptyState title="لا بيانات" message="لا توجد مشاركات مسجلة." />
        ) : (
          <div className="league-board">
            {board.length >= 3 ? (
              <div className="league-podium">
                {board.slice(0, 3).map((e) => (
                  <Link key={e.member.id} to={'/members/' + e.member.id} className={'league-podium__card league-podium__card--' + e.rank}>
                    <span className={'league-podium__rank league-podium__rank--' + e.rank}>#{e.rank}</span>
                    <Avatar name={e.member.name} size={64} variant={e.rank === 1 ? 'red' : 'navy'} />
                    <div className="league-podium__name">{e.member.name}</div>
                    <div className="league-podium__points">{e.points} نقطة</div>
                    <div className="league-podium__hours">{e.member.hours} ساعة</div>
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="league-table">
              <div className="league-table__head"><span>#</span><span>العضو</span><span>الفريق</span><span>الساعات</span><span>النقاط</span></div>
              {board.map((e) => {
                const tm = teams.filter((t) => e.member.teamIds.includes(t.id));
                return (
                  <Link key={e.member.id} to={'/members/' + e.member.id} className="league-table__row">
                    <span className={'col-rank' + (e.rank <= 3 ? ' rank-' + e.rank : '')}>{e.rank}</span>
                    <span className="col-name"><Avatar name={e.member.name} size={32} variant="navy" /><span className="league-table__name">{e.member.name}</span></span>
                    <span className="col-team">{tm.length === 0 ? <span className="muted small">—</span> : tm.map((t) => <span key={t.id} className="badge">{t.name}</span>)}</span>
                    <span className="col-hours">{e.member.hours}</span>
                    <span className="col-points">{e.points}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   11) AdminHomePage — الاسم
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/admin/AdminHomePage.tsx",
  `
import { Link } from 'react-router-dom';
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
    if (!window.confirm('سيتم رفع البيانات الأساسية. متابعة؟')) return;
    setSeeding(true);
    try { const r = await seedAll(); setResult(r); toast.success('تم الرفع'); }
    catch (err) { toast.error('فشل', err instanceof Error ? err.message : ''); }
    finally { setSeeding(false); }
  };

  const cards = [
    { to: '/admin/analytics', title: 'التحليلات', desc: 'إحصائيات شاملة' },
    { to: '/admin/requests', title: 'الطلبات', count: pendingReq, desc: 'إدارة الطلبات' },
    { to: '/admin/users', title: 'المستخدمون', count: users.length, desc: 'الحسابات' },
    { to: '/admin/members', title: 'الأعضاء', count: allMembers.length, desc: 'بيانات الأعضاء' },
    { to: '/admin/contributions', title: 'المشاركات', count: pendingContribs, desc: 'اعتماد المشاركات' },
    { to: '/admin/committees', title: 'اللجان', count: committees.length, desc: 'إدارة اللجان' },
    { to: '/admin/achievements', title: 'الإنجازات', desc: 'التكريمات' },
    { to: '/admin/warnings', title: 'التحذيرات', desc: 'إصدار التحذيرات' },
    { to: '/admin/calendar', title: 'التقويم', desc: 'الأحداث' },
    { to: '/admin/conversations', title: 'المحادثات', desc: 'إدارة المحادثات' },
    { to: '/admin/notifications', title: 'إرسال إشعار', count: notifs.length, desc: 'إشعارات جماعية' },
    { to: '/admin/governance', title: 'الحوكمة', desc: 'السياسات' },
    { to: '/admin/audit', title: 'سجل التغييرات', desc: 'تتبع الإجراءات' },
  ];

  return (
    <div className="admin-page">
      <section className="admin-welcome">
        <div className="admin-welcome__eyebrow">لوحة الإدارة</div>
        <h1 className="admin-welcome__name">مرحبًا، {user?.displayName || 'المدير'}</h1>
        <p className="admin-welcome__subtitle">تحكم كامل بالمحتوى والأعضاء والطلبات.</p>
      </section>

      <section className="admin-stats">
        <div className="stat"><div className="stat__value">{users.length}</div><div className="stat__label">المستخدمون</div></div>
        <div className="stat"><div className="stat__value">{allMembers.length}</div><div className="stat__label">الأعضاء</div></div>
        <div className="stat stat--red"><div className="stat__value">{pendingReq}</div><div className="stat__label">طلبات معلّقة</div></div>
        <div className="stat stat--amber"><div className="stat__value">{pendingContribs}</div><div className="stat__label">مشاركات معلّقة</div></div>
        <div className="stat"><div className="stat__value">{totalPoints}</div><div className="stat__label">مجموع النقاط</div></div>
        <div className="stat"><div className="stat__value">{notifs.length}</div><div className="stat__label">الإشعارات</div></div>
      </section>

      <section className="admin-seed">
        <div className="admin-seed__head">
          <div>
            <div className="admin-seed__title">رفع البيانات الأساسية</div>
            <div className="admin-seed__desc">لمرة واحدة — إن كانت Firestore فارغة.</div>
          </div>
          <button type="button" className="btn btn--primary" onClick={onSeed} disabled={seeding}>
            {seeding ? '...' : 'رفع البيانات'}
          </button>
        </div>
        {result ? <div className="admin-seed__result">✓ أعضاء: {result.members} · فرق: {result.teams} · مشاركات: {result.contributions} · طلبات: {result.requests}</div> : null}
      </section>

      <section style={{ marginTop: 32 }}>
        <SectionHeader eyebrow="الأقسام" title="روابط سريعة" />
        <div className="admin-cards">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="admin-card">
              <div className="admin-card__head">
                <div className="admin-card__title">{c.title}</div>
                {c.count !== undefined && c.count > 0 ? <span className="admin-card__count">{c.count > 99 ? '99+' : c.count}</span> : null}
              </div>
              <div className="admin-card__desc">{c.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   12) AdminAnalyticsPage — ترجمة كاملة
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/admin/AdminAnalyticsPage.tsx",
  `
import { useCollection } from '@/lib/useRealtimeCollection';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Loading } from '@/components/ui/Loading';
import type { Member, Contribution, RequestRecord } from '@/types';

const REQ_TYPE_AR: Record<string, string> = { TRANSFER: 'نقل', PROMOTION: 'ترقية', RESIGNATION: 'استقالة', COMPLAINT: 'شكوى', SUGGESTION: 'اقتراح', LEAVE: 'إجازة' };
const REQ_STATUS_AR: Record<string, string> = { PENDING: 'قيد الانتظار', IN_REVIEW: 'قيد المراجعة', APPROVED: 'معتمد', REJECTED: 'مرفوض', CANCELLED: 'ملغى', COMPLETED: 'مكتمل' };
const CONTRIB_STATUS_AR: Record<string, string> = { pending: 'معلّقة', approved: 'معتمدة', rejected: 'مرفوضة' };

export function AdminAnalyticsPage() {
  const { data: liveMembers, loading: lM } = useCollection<Member>('members');
  const { data: contributions, loading: lC } = useCollection<Contribution>('contributions');
  const { data: requests, loading: lR } = useCollection<RequestRecord>('requests');

  if (lM || lC || lR) return <Loading fullHeight message="جارٍ التحميل..." />;

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
      <PageHeader eyebrow="إدارة" title="التحليلات" description="نظرة شاملة على البيانات." />

      <section className="section">
        <SectionHeader eyebrow="الفرق" title="نقاط الفرق" />
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
        <SectionHeader eyebrow="اللجان" title="نقاط اللجان" />
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
        <SectionHeader eyebrow="الطلبات" title="حسب الحالة" />
        <div className="grid grid--narrow">
          {Object.entries(statusCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{REQ_STATUS_AR[k] ?? k}</div>
              <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-navy)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="الطلبات" title="حسب النوع" />
        <div className="grid grid--narrow">
          {Object.entries(typeCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{REQ_TYPE_AR[k] ?? k}</div>
              <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-red)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="المشاركات" title="حسب الحالة" />
        <div className="grid grid--narrow">
          {Object.entries(contribCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{CONTRIB_STATUS_AR[k] ?? k}</div>
              <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-navy)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   13) AdminRequestsPage — يعمل + موافقة شاملة
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/admin/AdminRequestsPage.tsx",
  `
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { approveStep, rejectStep, adminApproveAll } from '@/lib/approvals';
import { listWhere } from '@/lib/db';
import { canApproveStep, isAdmin } from '@/lib/permissions';
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
const STATUS_TAB: Record<string, string> = { all: 'الكل', PENDING: 'قيد الانتظار', IN_REVIEW: 'قيد المراجعة', APPROVED: 'معتمد', REJECTED: 'مرفوض' };

export function AdminRequestsPage() {
  const { user } = useAuth();
  const { data: requests, loading } = useCollection<RequestRecord>('requests');
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [actionReq, setActionReq] = useState<RequestRecord | null>(null);
  const [actionStep, setActionStep] = useState<ApprovalStep | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [toApproveAll, setToApproveAll] = useState<RequestRecord | null>(null);

  const filtered = useMemo(() => requests
    .filter((r) => status === 'all' || r.status === status)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)), [requests, status]);

  const openAction = async (req: RequestRecord, type: 'approve' | 'reject') => {
    if (!user) return;
    const steps = await listWhere<ApprovalStep>('approvals', 'requestId', req.id);
    const step = steps.find((s) => s.status === 'PENDING' && s.order === req.currentStepOrder);
    if (!step) { toast.error('لا توجد مرحلة معلّقة'); return; }
    if (!canApproveStep(user, step)) { toast.error('لا تملك صلاحية هذه المرحلة'); return; }
    setActionReq(req); setActionStep(step); setActionType(type); setComment('');
  };

  const doAction = async () => {
    if (!user || !actionReq || !actionStep || !actionType) return;
    setBusy(true);
    try {
      if (actionType === 'approve') { await approveStep(actionReq, actionStep, user); toast.success('تمت الموافقة'); }
      else {
        if (!comment.trim()) { toast.error('سبب الرفض مطلوب'); setBusy(false); return; }
        await rejectStep(actionReq, actionStep, user, comment);
        toast.success('تم الرفض');
      }
      setActionReq(null); setActionStep(null); setActionType(null); setComment('');
    } catch (e) { toast.error('فشل', e instanceof Error ? e.message : ''); }
    finally { setBusy(false); }
  };

  const doApproveAll = async () => {
    if (!user || !toApproveAll) return;
    setBusy(true);
    try { await adminApproveAll(toApproveAll, user); toast.success('تمت الموافقة الشاملة'); setToApproveAll(null); }
    catch (e) { toast.error('فشل', e instanceof Error ? e.message : ''); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="الطلبات" description="كل الطلبات مع إجراءات فورية." />

      <div className="chips mb-4">
        {STATUSES.map((s) => (
          <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>
            {STATUS_TAB[s]}
          </button>
        ))}
      </div>

      <SectionHeader eyebrow="القائمة" title={'الطلبات (' + filtered.length + ')'} />

      {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? (
        <EmptyState title="لا طلبات" message="لا توجد طلبات مطابقة." />
      ) : (
        <div className="stack">
          {filtered.map((r) => {
            const fromTeam = r.fromTeamId ? teams.find((t) => t.id === r.fromTeamId) : null;
            const toTeam = r.toTeamId ? teams.find((t) => t.id === r.toTeamId) : null;
            const canBulk = user && isAdmin(user) && (r.status === 'PENDING' || r.status === 'IN_REVIEW');
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
                    <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : r.status === 'IN_REVIEW' ? 'warning' : 'info'}>
                      {REQUEST_STATUS_LABEL[r.status]}
                    </Badge>
                    <Badge variant="neutral">{PRIORITY_LABEL[r.priority]}</Badge>
                  </div>
                </div>
                <div className="admin-request-card__actions">
                  <Link to={'/requests/' + r.id} className="btn btn--ghost btn--sm">تفاصيل</Link>
                  {canBulk ? <button type="button" className="btn btn--primary btn--sm" onClick={() => setToApproveAll(r)}>موافقة شاملة</button> : null}
                  {r.status === 'PENDING' || r.status === 'IN_REVIEW' ? (
                    <>
                      <button type="button" className="btn btn--success btn--sm" onClick={() => openAction(r, 'approve')}>موافقة المرحلة</button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => openAction(r, 'reject')}>رفض</button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={actionType !== null} title={actionType === 'approve' ? 'موافقة' : 'رفض'}
        onClose={() => { setActionType(null); setActionReq(null); setActionStep(null); }}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => { setActionType(null); setActionReq(null); setActionStep(null); }}>إلغاء</button>
            <button type="button" className={'btn ' + (actionType === 'approve' ? 'btn--success' : 'btn--danger')} onClick={doAction} disabled={busy}>{busy ? '...' : 'تأكيد'}</button>
          </>
        }
      >
        <FormField label={actionType === 'approve' ? 'تعليق (اختياري)' : 'سبب الرفض'} required={actionType === 'reject'}>
          <TextArea value={comment} onChange={setComment} rows={3} />
        </FormField>
      </Modal>

      <ConfirmDialog open={toApproveAll !== null} title="موافقة شاملة"
        message={'سيتم اعتماد كل المراحل على "' + (toApproveAll?.title || '') + '" مرة واحدة.'}
        confirmLabel="موافقة شاملة" busy={busy} onConfirm={doApproveAll} onCancel={() => setToApproveAll(null)} />
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   14) lib/approvals.ts — منطق يعمل
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/lib/approvals.ts",
  `
import { updateOne, createOne, newId, today, listWhere } from './db';
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
    await createOne('approvals', {
      id: newId('APR'), requestId: request.id, order: i + 1,
      requiredRole: chain[i].role, requiredTeamId: chain[i].teamId, status: 'PENDING',
    });
  }
}

export async function approveStep(request: RequestRecord, step: ApprovalStep, user: AppUser): Promise<void> {
  await updateOne('approvals', step.id, {
    status: 'APPROVED', approverUid: user.uid,
    approverName: user.displayName, actionDate: today(),
  });
  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  const sorted = allSteps.sort((a, b) => a.order - b.order);
  const remaining = sorted.filter((s) => s.status === 'PENDING' && s.id !== step.id);
  if (remaining.length === 0) {
    await updateOne('requests', request.id, { status: 'APPROVED', currentStepOrder: sorted.length, updatedAt: today() });
    await notifyUser(request.requesterUid, 'تمت الموافقة', 'طلبك "' + request.title + '" تمت الموافقة عليه.', 'request', '/requests/' + request.id, 'high');
    await logAudit(user, 'APPROVE_REQUEST', 'Request', request.id, 'موافقة نهائية');
  } else {
    const nextOrder = Math.min(...remaining.map((s) => s.order));
    await updateOne('requests', request.id, { status: 'IN_REVIEW', currentStepOrder: nextOrder, updatedAt: today() });
    await notifyUser(request.requesterUid, 'تقدّم طلبك', 'طلبك "' + request.title + '" في المرحلة ' + nextOrder + '.', 'approval', '/requests/' + request.id, 'normal');
  }
}

export async function adminApproveAll(request: RequestRecord, user: AppUser): Promise<void> {
  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  const sorted = allSteps.sort((a, b) => a.order - b.order);
  for (const step of sorted) {
    if (step.status === 'PENDING') {
      await updateOne('approvals', step.id, {
        status: 'APPROVED', approverUid: user.uid,
        approverName: user.displayName, actionDate: today(), comment: 'موافقة شاملة',
      });
    }
  }
  await updateOne('requests', request.id, { status: 'APPROVED', currentStepOrder: sorted.length, updatedAt: today() });
  await notifyUser(request.requesterUid, 'تمت الموافقة', 'طلبك "' + request.title + '" معتمد نهائيًا.', 'request', '/requests/' + request.id, 'high');
  await logAudit(user, 'ADMIN_APPROVE_ALL', 'Request', request.id, 'موافقة شاملة');
}

export async function rejectStep(request: RequestRecord, step: ApprovalStep, user: AppUser, comment: string): Promise<void> {
  await updateOne('approvals', step.id, {
    status: 'REJECTED', approverUid: user.uid, approverName: user.displayName,
    comment: comment.trim() || undefined, actionDate: today(),
  });
  await updateOne('requests', request.id, { status: 'REJECTED', updatedAt: today() });
  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  for (const s of allSteps) {
    if (s.order > step.order && s.status === 'PENDING') await updateOne('approvals', s.id, { status: 'SKIPPED' });
  }
  await notifyUser(request.requesterUid, 'تم الرفض', 'طلبك "' + request.title + '" رُفض. ' + comment, 'request', '/requests/' + request.id, 'high');
  await logAudit(user, 'REJECT_REQUEST', 'Request', request.id, 'رفض');
}
`
);

/* ═══════════════════════════════════════════════════════════════
   15) ConversationsPage — إعادة بناء كاملة
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/ConversationsPage.tsx",
  `
import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { createOne, newId, now } from '@/lib/db';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Composer } from '@/components/chat/Composer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, Select } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { Conversation, Message, AppUser, TeamId } from '@/types';

export function ConversationsPage() {
  const { user } = useAuth();
  const { data: conversations, loading: l1 } = useRealtimeCollection<Conversation>('conversations');
  const { data: messages, loading: l2 } = useRealtimeCollection<Message>('messages');
  const { data: users, loading: l3 } = useRealtimeCollection<AppUser>('users');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'private' | 'team'>('private');
  const [target, setTarget] = useState('');
  const [teamId, setTeamId] = useState<TeamId>('helpers');
  const [busy, setBusy] = useState(false);

  const others = useMemo(() => user ? users.filter((u) => u.uid !== user.uid) : [], [users, user]);

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
  const activeMsgs = useMemo(() => !currentId ? [] : messages
    .filter((m) => m.conversationId === currentId)
    .sort((a, b) => a.sentAt > b.sentAt ? 1 : -1), [messages, currentId]);

  if (!user) return null;
  if (l1 || l2 || l3) return <Loading fullHeight message="جارٍ تحميل المحادثات..." />;

  const getName = () => {
    if (!active) return '';
    if (active.type === 'general') return 'المحادثة العامة';
    if (active.type === 'team') return 'فريق ' + (teams.find((t) => t.id === active.teamId)?.name ?? '');
    const ou = active.participantUids.find((u) => u !== user.uid);
    return users.find((u) => u.uid === ou)?.displayName ?? 'محادثة خاصة';
  };

  const send = async (text: string) => {
    if (!currentId) return;
    const myM = members.find((m) => m.id === user.memberId);
    const msg: Message = {
      id: newId('MSG'), conversationId: currentId, senderUid: user.uid,
      senderName: myM?.name ?? user.displayName, text, sentAt: now(),
    };
    try {
      await createOne('messages', msg);
      await createOne('conversations', {
        id: currentId, lastMessageAt: now(),
        lastMessageText: text, lastMessageSender: myM?.name ?? user.displayName,
      });
    } catch (e) { toast.error('فشل الإرسال', e instanceof Error ? e.message : ''); }
  };

  const createConv = async () => {
    if (type === 'private') {
      if (!target) { toast.error('اختر عضوًا'); return; }
      const ex = conversations.find((c) => c.type === 'private' && c.participantUids.includes(user.uid) && c.participantUids.includes(target));
      if (ex) { setActiveId(ex.id); setMobile(true); setOpen(false); toast.info('المحادثة موجودة'); return; }
      setBusy(true);
      try {
        const id = newId('CONV-PRIVATE');
        await createOne('conversations', {
          id, type: 'private', title: '', participantUids: [user.uid, target],
          lastMessageAt: now(), createdBy: user.uid,
        });
        setActiveId(id); setMobile(true); setOpen(false); setTarget(''); toast.success('تم');
      } catch { toast.error('فشل'); } finally { setBusy(false); }
    } else {
      const id = 'CONV-TEAM-' + teamId;
      const ex = conversations.find((c) => c.id === id);
      if (ex) { setActiveId(id); setMobile(true); setOpen(false); toast.info('موجودة'); return; }
      setBusy(true);
      try {
        await createOne('conversations', {
          id, type: 'team', title: 'فريق ' + (teams.find((t) => t.id === teamId)?.name ?? ''),
          teamId, participantUids: [], lastMessageAt: now(), createdBy: user.uid,
        });
        setActiveId(id); setMobile(true); setOpen(false); toast.success('تم');
      } catch { toast.error('فشل'); } finally { setBusy(false); }
    }
  };

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <div className="chat-layout">
        <div className={'chat-sidebar' + (mobile ? ' is-hidden show-desktop' : '')}>
          <div className="chat-sidebar__head">
            <div className="row row--between" style={{ gap: 8 }}>
              <div className="chat-sidebar__title">المحادثات</div>
              <button type="button" className="chat-sidebar__new" onClick={() => setOpen(true)}>+ جديدة</button>
            </div>
          </div>
          <ConversationList conversations={myConvs} activeId={currentId ?? undefined} currentUser={user} users={users} onSelect={(id) => { setActiveId(id); setMobile(true); }} />
        </div>

        <div className={'chat-panel' + (!mobile ? ' is-hidden show-desktop' : '')}>
          {!active ? (
            <div className="chat-panel__empty">
              <div className="chat-panel__empty-icon">💬</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>اختر محادثة</div>
              <div className="small muted">أو اضغط "+ جديدة"</div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button type="button" className="chat-header__back" onClick={() => setMobile(false)} aria-label="رجوع">‹</button>
                <div className="chat-header__info">
                  <div className="chat-header__title">{getName()}</div>
                  <div className="chat-header__sub">{active.type === 'general' ? 'الجميع' : active.type === 'team' ? 'فريق' : 'خاصة'}</div>
                </div>
              </div>
              <div className="chat-messages">
                {activeMsgs.length === 0 ? <EmptyState title="ابدأ المحادثة" message="لا رسائل بعد." /> :
                  activeMsgs.map((m) => <MessageBubble key={m.id} message={m} currentUser={user} />)}
              </div>
              <Composer onSend={send} />
            </>
          )}
        </div>
      </div>

      <Modal open={open} title="محادثة جديدة" onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>إلغاء</button>
            <button type="button" className="btn btn--primary" onClick={createConv} disabled={busy}>{busy ? '...' : 'إنشاء'}</button>
          </>
        }
      >
        <FormField label="النوع" required>
          <Select value={type} onChange={(v) => setType(v as 'private' | 'team')}
            options={[{ value: 'private', label: 'خاصة' }, { value: 'team', label: 'فريق' }]} />
        </FormField>
        {type === 'private' ? (
          <FormField label="العضو" required hint={others.length === 0 ? 'لا يوجد أعضاء' : undefined}>
            <Select value={target} onChange={setTarget}
              options={[{ value: '', label: others.length === 0 ? '— لا يوجد —' : '— اختر —' },
                ...others.map((u) => ({ value: u.uid, label: u.displayName + (u.email ? ' (' + u.email + ')' : '') }))]} />
          </FormField>
        ) : (
          <FormField label="الفريق" required>
            <Select value={teamId} onChange={(v) => setTeamId(v as TeamId)}
              options={teams.map((t) => ({ value: t.id, label: t.name }))} />
          </FormField>
        )}
      </Modal>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   16) NotificationItem — بدون أيقونات
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/components/notification/NotificationItem.tsx",
  `
import { useNavigate } from 'react-router-dom';
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
    <div className={'notif-item' + (!notification.read ? ' notif-item--unread' : '')}
      onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}>
      <div className="notif-item__body">
        <div className="notif-item__title">{notification.title}</div>
        <div className="notif-item__message">{notification.message}</div>
        <div className="notif-item__meta">
          {notification.fromName ? <><span className="notif-item__from">{notification.fromName}</span><span className="notif-item__dot">·</span></> : null}
          <span>{relativeTime(notification.date)}</span>
          {notification.priority === 'high' ? <span className="notif-item__priority notif-item__priority--high">مهم</span> : null}
        </div>
      </div>
    </div>
  );
}
`
);

F(
  "src/styles/notifications.css",
  `
.notif-item { display: flex; gap: 12px; padding: 18px 20px; border-radius: var(--radius); border: 1px solid var(--c-line); background: var(--c-white); transition: all 0.18s; position: relative; cursor: pointer; overflow: hidden; box-shadow: var(--shadow-xs); }
.notif-item:hover { border-color: var(--c-line-mid); background: var(--c-off-white); }
.notif-item--unread { background: #FFFBFC; border-color: #FCA5A5; }
.notif-item--unread::before { content: ''; position: absolute; inset-inline-start: 0; top: 16px; bottom: 16px; width: 3px; background: var(--c-red); border-radius: 0 3px 3px 0; }
.notif-item__body { flex: 1; min-width: 0; }
.notif-item__title { font-weight: 800; font-size: 0.95rem; color: var(--c-ink); line-height: 1.5; word-break: break-word; }
.notif-item__message { font-size: 0.85rem; color: var(--c-ink-muted); margin-top: 4px; line-height: 1.65; word-break: break-word; }
.notif-item__meta { display: flex; gap: 8px; margin-top: 10px; font-size: 0.75rem; color: var(--c-ink-muted); flex-wrap: wrap; align-items: center; }
.notif-item__from { font-weight: 700; color: var(--c-ink-soft); }
.notif-item__dot { color: var(--c-line-mid); }
.notif-item__priority { margin-inline-start: auto; padding: 2px 10px; border-radius: 999px; font-size: 0.68rem; font-weight: 800; }
.notif-item__priority--high { background: var(--c-red-tint); color: #991B1B; }
.notif-item__icon { display: none !important; }
`
);

/* ═══════════════════════════════════════════════════════════════
   17) AdminUsersPage + AdminMembersPage + AdminCommitteesPage
        + AdminAchievementsPage + AdminGovernancePage
        + AdminNotificationsPage
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/admin/AdminUsersPage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { adminCreateMember, type CreateMemberInput } from '@/lib/auth';
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
    if (!email.trim() || !name.trim()) { toast.error('البيانات ناقصة'); return; }
    if (password.length < 6) { toast.error('كلمة المرور ضعيفة'); return; }
    setBusy(true);
    try {
      await adminCreateMember({ email: email.trim(), temporaryPassword: password, name: name.trim(), role, teamIds: [teamId], committeeIds, bio: bio.trim() || undefined }, me?.uid ?? 'system');
      await logAudit(me, 'CREATE_USER', 'User', email, 'إنشاء: ' + name);
      setCreated({ email: email.trim(), password, name: name.trim() });
      toast.success('تم إنشاء الحساب');
      reset(); setOpen(false);
    } catch (e) { toast.error('فشل', e instanceof Error ? e.message : ''); }
    finally { setBusy(false); }
  };

  const chRole = async (uid: string, r: RoleId) => { try { await updateOne('users', uid, { role: r }); toast.success('تم'); } catch { toast.error('فشل'); } };
  const chTeam = async (uid: string, t: TeamId) => { try { await updateOne('users', uid, { teamId: t }); toast.success('تم'); } catch { toast.error('فشل'); } };
  const link = async (uid: string, mid: string) => { try { await updateOne('users', uid, { memberId: mid || null }); if (mid) await updateOne('members', mid, { linkedUserId: uid }); toast.success('تم'); } catch { toast.error('فشل'); } };
  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('users', toDelete); toast.success('تم'); setToDelete(null); } catch { toast.error('فشل'); } finally { setBusy(false); } };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="المستخدمون" description="إنشاء الحسابات والأدوار." />
      <SectionHeader eyebrow="القائمة" title={'المستخدمون (' + users.length + ')'}
        action={<button type="button" className="btn btn--primary btn--sm" onClick={() => { reset(); setOpen(true); }}>+ مستخدم جديد</button>} />

      {loading ? <SkeletonList count={6} /> : users.length === 0 ? <EmptyState title="لا مستخدمين" message="ابدأ." /> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>الفريق</th><th>العضو</th><th>إجراءات</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td data-label="الاسم" style={{ fontWeight: 700 }}>
                    {u.displayName}
                    {u.mustChangePassword ? <Badge variant="warning" className="mt-2">جديد</Badge> : null}
                  </td>
                  <td className="muted small" data-label="البريد" dir="ltr">{u.email}</td>
                  <td data-label="الدور">
                    <select className="input" value={u.role} onChange={(e) => chRole(u.uid, e.target.value as RoleId)} style={{ minWidth: 140 }}>
                      {ROLE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td data-label="الفريق">
                    <select className="input" value={u.teamId ?? ''} onChange={(e) => chTeam(u.uid, e.target.value as TeamId)} style={{ minWidth: 120 }}>
                      <option value="">— بدون —</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td data-label="العضو">
                    <select className="input" value={u.memberId ?? ''} onChange={(e) => link(u.uid, e.target.value)} style={{ minWidth: 140 }}>
                      <option value="">— غير مرتبط —</option>
                      {memberList.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </td>
                  <td data-label="إجراءات"><button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(u.uid)}>حذف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="إنشاء مستخدم جديد" onClose={() => setOpen(false)} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>إلغاء</button><button type="button" className="btn btn--primary" onClick={create} disabled={busy}>{busy ? '...' : 'إنشاء'}</button></>}>
        <FormField label="الاسم الكامل" required><TextInput value={name} onChange={setName} /></FormField>
        <FormField label="البريد" required><TextInput value={email} onChange={setEmail} type="email" /></FormField>
        <FormField label="كلمة المرور المؤقتة" required hint="يجب تغييرها عند أول دخول">
          <div style={{ display: 'flex', gap: 8 }}>
            <TextInput value={password} onChange={setPassword} type="text" />
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPassword(genPass())}>توليد</button>
          </div>
        </FormField>
        <FormField label="الدور" required><Select value={role} onChange={(v) => setRole(v as RoleId)} options={ROLE_OPTS} /></FormField>
        <FormField label="الفريق" required><Select value={teamId} onChange={(v) => setTeamId(v as TeamId)} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
        <FormField label="اللجان" hint={committeeList.length === 0 ? 'لا توجد لجان' : undefined}>
          <MultiSelect values={committeeIds} onChange={setCommitteeIds} options={committeeList.map((c) => ({ value: c.id, label: c.nameAr }))} />
        </FormField>
        <FormField label="نبذة"><TextInput value={bio} onChange={setBio} /></FormField>
      </Modal>

      <Modal open={created !== null} title="✓ تم إنشاء الحساب" onClose={() => setCreated(null)}
        footer={<button type="button" className="btn btn--primary" onClick={() => setCreated(null)}>فهمت</button>}>
        <p style={{ lineHeight: 1.8, marginBottom: 16 }}>أرسل البيانات للعضو:</p>
        <div style={{ background: 'var(--c-off-white)', border: '1px solid var(--c-line)', borderRadius: 10, padding: 16, fontSize: '0.9rem', lineHeight: 2 }}>
          <div><strong>الاسم:</strong> {created?.name}</div>
          <div style={{ wordBreak: 'break-all' }}><strong>البريد:</strong> <span dir="ltr">{created?.email}</span></div>
          <div style={{ wordBreak: 'break-all' }}><strong>المرور:</strong> <span dir="ltr" style={{ fontFamily: 'var(--font-en)' }}>{created?.password}</span></div>
        </div>
      </Modal>

      <ConfirmDialog open={toDelete !== null} title="حذف" message="متأكد؟" confirmLabel="حذف" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}
`
);

F(
  "src/pages/admin/AdminMembersPage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
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
  const { user: me } = useAuth();
  const { data: list, loading } = useCollection<Member>('members');
  const { data: liveCommittees } = useCollection<{ id: string; nameAr: string }>('committees');
  const [editing, setEditing] = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Member, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const committeeList = liveCommittees.length > 0 ? liveCommittees : committees.map((c) => ({ id: c.id, nameAr: c.nameAr }));
  const filtered = list.filter((m) => !search.trim() || m.name.includes(search.trim()));
  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
  const openEdit = (m: Member) => {
    setForm({ name: m.name, role: m.role, teamIds: m.teamIds, committeeIds: m.committeeIds, joinedSeason: m.joinedSeason, hours: m.hours, status: m.status, bio: m.bio || '', email: m.email || '' });
    setEditing(m); setCreating(false);
  };
  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.name.trim()) { toast.error('الاسم مطلوب'); return; }
    if (form.teamIds.length === 0) { toast.error('اختر فريقًا'); return; }
    setBusy(true);
    try {
      if (editing) { await updateOne('members', editing.id, form); toast.success('تم'); }
      else { const id = 'M-' + Date.now().toString(36).toUpperCase(); await createOne('members', { id, ...form }); toast.success('تم'); }
      close();
    } catch { toast.error('فشل'); } finally { setBusy(false); }
  };

  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('members', toDelete.id); toast.success('تم'); setToDelete(null); } catch { toast.error('فشل'); } finally { setBusy(false); } };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="الأعضاء" description="إضافة وتعديل الأعضاء." />
      <div className="toolbar"><input className="input" type="search" placeholder="ابحث..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <SectionHeader eyebrow="القائمة" title={'الأعضاء (' + filtered.length + ')'}
        action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ عضو جديد</button>} />
      {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? <EmptyState title="لا أعضاء" message="-" /> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>الاسم</th><th>الدور</th><th>الفرق</th><th>اللجان</th><th>الساعات</th><th>النقاط</th><th>إجراءات</th></tr></thead>
            <tbody>
              {filtered.map((m) => {
                const mt = teams.filter((t) => m.teamIds.includes(t.id));
                const mc = committeeList.filter((c) => m.committeeIds.includes(c.id));
                return (
                  <tr key={m.id}>
                    <td data-label="الاسم">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={m.name} size={30} variant="navy" /><span style={{ fontWeight: 700 }}>{m.name}</span>
                      </div>
                    </td>
                    <td className="muted small" data-label="الدور">{ROLE_LABEL[m.role]}</td>
                    <td data-label="الفرق"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mt.map((t) => <span key={t.id} className="badge">{t.name}</span>)}</div></td>
                    <td data-label="اللجان"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mc.length === 0 ? <span className="muted small">—</span> : mc.map((c) => <span key={c.id} className="badge">{c.nameAr}</span>)}</div></td>
                    <td style={{ fontFamily: 'var(--font-en)' }} data-label="الساعات">{m.hours}</td>
                    <td className="points" data-label="النقاط">{hoursToPoints(m.hours)}</td>
                    <td data-label="إجراءات"><div style={{ display: 'flex', gap: 4 }}><button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(m)}>تعديل</button><button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(m)}>حذف</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'تعديل عضو' : 'إضافة عضو'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>إلغاء</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'حفظ'}</button></>}>
        <FormField label="الاسم" required><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
        <FormField label="البريد"><TextInput value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} type="email" /></FormField>
        <FormField label="الدور" required><Select value={form.role} onChange={(v) => setForm({ ...form, role: v as RoleId })} options={ROLE_OPTS} /></FormField>
        <FormField label="الفرق" required><MultiSelect values={form.teamIds} onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
        <FormField label="اللجان" hint={committeeList.length === 0 ? 'لا توجد لجان' : undefined}>
          <MultiSelect values={form.committeeIds} onChange={(v) => setForm({ ...form, committeeIds: v })} options={committeeList.map((c) => ({ value: c.id, label: c.nameAr }))} />
        </FormField>
        <FormField label="الساعات"><NumberInput value={form.hours} onChange={(v) => setForm({ ...form, hours: v })} min={0} /></FormField>
        <FormField label="الحالة"><Select value={form.status} onChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' | 'suspended' })} options={[{ value: 'active', label: 'نشط' }, { value: 'inactive', label: 'غير نشط' }, { value: 'suspended', label: 'موقوف' }]} /></FormField>
        <FormField label="نبذة"><TextArea value={form.bio || ''} onChange={(v) => setForm({ ...form, bio: v })} rows={2} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="حذف" message={'حذف "' + (toDelete?.name || '') + '"؟'} confirmLabel="حذف" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}
`
);

F(
  "src/pages/admin/AdminCommitteesPage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
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
  const { user: me } = useAuth();
  const { data: committees, loading } = useCollection<Committee>('committees');
  const { data: members } = useCollection<Member>('members');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Committee | null>(null);
  const [form, setForm] = useState<Omit<Committee, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<Committee | null>(null);
  const [busy, setBusy] = useState(false);

  const sorted = [...committees].sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
  const openEdit = (c: Committee) => { setForm({ name: c.name, nameAr: c.nameAr, description: c.description, color: c.color, icon: c.icon }); setEditing(c); setCreating(false); };
  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.nameAr.trim()) { toast.error('الاسم مطلوب'); return; }
    setBusy(true);
    try {
      const payload = { name: form.name.trim() || form.nameAr.trim(), nameAr: form.nameAr.trim(), description: form.description.trim(), color: form.color, icon: form.icon };
      if (editing) { await updateOne('committees', editing.id, payload); toast.success('تم'); }
      else { const id = 'COMM-' + Date.now().toString(36).toUpperCase(); await createOne('committees', { id, ...payload }); toast.success('تمت الإضافة'); }
      close();
    } catch { toast.error('فشل'); } finally { setBusy(false); }
  };

  const del = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('committees', toDelete.id);
      for (const m of members) {
        if (m.committeeIds.includes(toDelete.id)) {
          await updateOne('members', m.id, { committeeIds: m.committeeIds.filter((c) => c !== toDelete.id) });
        }
      }
      toast.success('تم');
      setToDelete(null);
    } catch { toast.error('فشل'); } finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="اللجان" description="أضف اللجان." />
      <SectionHeader eyebrow="القائمة" title={'اللجان (' + committees.length + ')'}
        action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ لجنة جديدة</button>} />
      {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? (
        <EmptyState title="لا لجان" message="أضف أول لجنة." action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ إضافة</button>} />
      ) : (
        <div className="grid grid--wide">
          {sorted.map((c) => {
            const count = members.filter((m) => m.committeeIds.includes(c.id)).length;
            return (
              <div key={c.id} className="card no-click">
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{c.nameAr}</div>
                    {c.name ? <div className="card__meta">{c.name}</div> : null}
                  </div>
                  <span style={{ width: 12, height: 12, borderRadius: 4, background: c.color }} />
                </div>
                {c.description ? <p className="small soft mt-3">{c.description}</p> : null}
                <div className="small muted mt-3">{count} عضو</div>
                <div className="row mt-4" style={{ gap: 6, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(c)}>تعديل</button>
                  <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(c)}>حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'تعديل لجنة' : 'لجنة جديدة'} onClose={close}
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>إلغاء</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'حفظ'}</button></>}>
        <FormField label="الاسم بالعربية" required><TextInput value={form.nameAr} onChange={(v) => setForm({ ...form, nameAr: v })} /></FormField>
        <FormField label="الاسم بالإنجليزية"><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
        <FormField label="الوصف"><TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} /></FormField>
        <FormField label="اللون"><Select value={form.color} onChange={(v) => setForm({ ...form, color: v })} options={[
          { value: '#151A45', label: 'كحلي' }, { value: '#C1272D', label: 'أحمر' }, { value: '#16A34A', label: 'أخضر' },
          { value: '#2563EB', label: 'أزرق' }, { value: '#7C3AED', label: 'بنفسجي' }, { value: '#EC4899', label: 'وردي' },
        ]} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="حذف لجنة" message={'حذف "' + (toDelete?.nameAr || '') + '"؟'} confirmLabel="حذف" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}
`
);

F(
  "src/pages/admin/AdminAchievementsPage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
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
  const { user: me } = useAuth();
  const { data, loading } = useCollection<Achievement>('achievements');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState<Omit<Achievement, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<Achievement | null>(null);
  const [busy, setBusy] = useState(false);

  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
  const openEdit = (a: Achievement) => { setForm({ ...a }); setEditing(a); setCreating(false); };
  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) { toast.error('العنوان والوصف مطلوبان'); return; }
    setBusy(true);
    try {
      const memberNames = form.memberIds.map((id) => members.find((m) => m.id === id)?.name).filter((n): n is string => Boolean(n));
      const payload = { ...form, memberNames };
      if (editing) { await updateOne('achievements', editing.id, payload); toast.success('تم'); }
      else { const id = 'A-' + Date.now().toString(36).toUpperCase(); await createOne('achievements', { id, ...payload }); toast.success('تم'); }
      close();
    } catch { toast.error('فشل'); } finally { setBusy(false); }
  };

  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('achievements', toDelete.id); toast.success('تم'); setToDelete(null); } catch { toast.error('فشل'); } finally { setBusy(false); } };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="الإنجازات" description="إدارة الإنجازات." />
      <SectionHeader eyebrow="القائمة" title={'الإنجازات (' + data.length + ')'}
        action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ إنجاز جديد</button>} />
      {loading ? <SkeletonList count={5} /> : data.length === 0 ? <EmptyState title="لا إنجازات" message="أضف أول إنجاز." /> : (
        <div className="stack">
          {data.map((a) => (
            <div key={a.id} className="card no-click">
              <div className="card__title">{a.title}</div>
              <div className="card__meta">{formatDate(a.date)}</div>
              <p className="small soft mt-3">{a.description}</p>
              <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(a)}>تعديل</button>
                <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(a)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'تعديل' : 'إنجاز جديد'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>إلغاء</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'حفظ'}</button></>}>
        <FormField label="العنوان" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
        <FormField label="الوصف" required><TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={3} /></FormField>
        <FormField label="التاريخ" required><DateInput value={form.date} onChange={(v) => setForm({ ...form, date: v })} /></FormField>
        <FormField label="الفرق"><MultiSelect values={form.teamIds} onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
        <FormField label="الأعضاء"><MultiSelect values={form.memberIds} onChange={(v) => setForm({ ...form, memberIds: v })} options={members.map((m) => ({ value: m.id, label: m.name }))} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="حذف" message={'حذف "' + (toDelete?.title || '') + '"؟'} confirmLabel="حذف" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}
`
);

F(
  "src/pages/admin/AdminGovernancePage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
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

const EMPTY: Omit<GovernanceDocument, 'id'> = { title: '', category: 'السياسات', description: '', content: '', version: '1.0', updatedAt: new Date().toISOString().slice(0, 10) };

export function AdminGovernancePage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<GovernanceDocument>('governance');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GovernanceDocument | null>(null);
  const [form, setForm] = useState<Omit<GovernanceDocument, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<GovernanceDocument | null>(null);
  const [busy, setBusy] = useState(false);

  const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title, 'ar'));
  const openCreate = () => { setForm({ ...EMPTY, updatedAt: new Date().toISOString().slice(0, 10) }); setCreating(true); setEditing(null); };
  const openEdit = (d: GovernanceDocument) => { setForm({ title: d.title, category: d.category, description: d.description, content: d.content, version: d.version, updatedAt: d.updatedAt }); setEditing(d); setCreating(false); };
  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('العنوان والوصف مطلوبان'); return; }
    setBusy(true);
    try {
      const payload = { ...form, updatedAt: new Date().toISOString().slice(0, 10) };
      if (editing) { await updateOne('governance', editing.id, payload); toast.success('تم'); }
      else { const id = 'GOV-' + Date.now().toString(36).toUpperCase(); await createOne('governance', { id, ...payload }); toast.success('تمت الإضافة'); }
      close();
    } catch { toast.error('فشل'); } finally { setBusy(false); }
  };

  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('governance', toDelete.id); toast.success('تم'); setToDelete(null); } catch { toast.error('فشل'); } finally { setBusy(false); } };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="الحوكمة" description="أضف السياسات بنفسك." />
      <SectionHeader eyebrow="القائمة" title={'الوثائق (' + data.length + ')'}
        action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ وثيقة جديدة</button>} />
      {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? (
        <EmptyState title="لا وثائق" message="أضف أول وثيقة." action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ إضافة</button>} />
      ) : (
        <div className="stack">
          {sorted.map((d) => (
            <div key={d.id} className="card no-click">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{d.title}</div>
                  <div className="card__meta">{d.category} · v{d.version} · آخر تحديث {formatDate(d.updatedAt)}</div>
                </div>
                <Badge variant="info">{d.category}</Badge>
              </div>
              {d.description ? <p className="small soft mt-2">{d.description}</p> : null}
              <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(d)}>تعديل</button>
                <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(d)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'تعديل وثيقة' : 'وثيقة جديدة'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>إلغاء</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'حفظ'}</button></>}>
        <FormField label="العنوان" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
        <FormField label="التصنيف" required><TextInput value={form.category} onChange={(v) => setForm({ ...form, category: v })} /></FormField>
        <FormField label="الوصف المختصر"><TextInput value={form.description} onChange={(v) => setForm({ ...form, description: v })} /></FormField>
        <FormField label="النص الكامل" required><TextArea value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={8} /></FormField>
        <FormField label="الإصدار" required><TextInput value={form.version} onChange={(v) => setForm({ ...form, version: v })} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="حذف" message={'حذف "' + (toDelete?.title || '') + '"؟'} confirmLabel="حذف" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}
`
);

F(
  "src/pages/admin/AdminNotificationsPage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { notifyUser, notifyUsers } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';
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
    if (!title.trim() || !message.trim()) { toast.error('العنوان والرسالة مطلوبان'); return; }
    setBusy(true);
    try {
      if (target === 'all') await notifyUsers(users, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
      else if (target === 'managers') {
        const m = users.filter((u) => ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(u.role));
        await notifyUsers(m, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
      } else {
        if (!users.find((u) => u.uid === target)) { toast.error('المستخدم غير موجود'); setBusy(false); return; }
        await notifyUser(target, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
      }
      await logAudit(me, 'SEND_NOTIFICATION', 'Notification', target, title);
      setTitle(''); setMessage('');
      toast.success('تم الإرسال');
    } catch { toast.error('فشل'); } finally { setBusy(false); }
  };

  const sorted = [...notifs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30);

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="إرسال إشعار" description="إشعارات فورية." />
      <SectionHeader eyebrow="إرسال" title="إشعار جديد" />
      <div className="card no-click" style={{ maxWidth: 720 }}>
        <FormField label="المستقبل" required>
          <Select value={target} onChange={setTarget} options={[
            { value: 'all', label: 'الجميع (' + users.length + ')' },
            { value: 'managers', label: 'المدراء فقط' },
            ...users.map((u) => ({ value: u.uid, label: u.displayName + ' (' + u.email + ')' })),
          ]} />
        </FormField>
        <FormField label="العنوان" required><TextInput value={title} onChange={setTitle} /></FormField>
        <FormField label="الرسالة" required><TextArea value={message} onChange={setMessage} rows={4} /></FormField>
        <FormField label="الأولوية">
          <Select value={priority} onChange={(v) => setPriority(v as 'low' | 'normal' | 'high')} options={[
            { value: 'low', label: 'منخفضة' }, { value: 'normal', label: 'عادية' }, { value: 'high', label: 'مرتفعة' },
          ]} />
        </FormField>
        <button type="button" className="btn btn--primary btn--block" onClick={send} disabled={busy}>{busy ? '...' : 'إرسال'}</button>
      </div>
      <SectionHeader eyebrow="السجل" title={'آخر الإشعارات (' + notifs.length + ')'} />
      {loading ? <SkeletonList count={6} /> : sorted.length === 0 ? <EmptyState title="لا إشعارات" message="-" /> : (
        <div className="stack">
          {sorted.map((n) => (
            <div key={n.id} className="card no-click">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{n.title}</div>
                  <div className="card__meta">{n.message}</div>
                </div>
                {!n.read ? <Badge variant="red">جديد</Badge> : <Badge variant="success">مقروء</Badge>}
              </div>
              <div className="tiny muted mt-2">{relativeTime(n.date)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   18) format.ts + notifications.ts
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/lib/format.ts",
  `
export function cx(...p: Array<string | false | null | undefined>): string { return p.filter(Boolean).join(' '); }
export function formatDate(iso: string): string { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return iso; return d.toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' }); }
export function formatDateTime(iso: string): string { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return iso; return d.toLocaleString('ar-EG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
export function formatTime(iso: string): string { if (!iso) return ''; const d = new Date(iso); if (isNaN(d.getTime())) return ''; return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }); }
export function relativeTime(iso: string): string { if (!iso) return ''; const d = new Date(iso).getTime(); const m = Math.floor((Date.now() - d) / 60000); const h = Math.floor(m / 60); const dy = Math.floor(h / 24); if (m < 1) return 'الآن'; if (m < 60) return 'قبل ' + m + ' دقيقة'; if (h < 24) return 'قبل ' + h + ' ساعة'; if (dy < 30) return 'قبل ' + dy + ' يوم'; return formatDate(iso); }
export function initials(name: string): string { const t = name.trim(); const parts: string[] = []; let c = ''; for (let i = 0; i < t.length; i++) { const ch = t[i]; if (ch === ' ') { if (c) { parts.push(c); c = ''; } } else c += ch; } if (c) parts.push(c); if (!parts.length) return '?'; if (parts.length === 1) return parts[0].slice(0, 2); return (parts[0][0] + parts[parts.length - 1][0]).trim(); }
export function hoursToPoints(h: number): number { return Math.round(h * 5); }
export function truncate(t: string, l = 90): string { return t.length <= l ? t : t.slice(0, l) + '...'; }
export function today(): string { return new Date().toISOString().slice(0, 10); }
const AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
export function getArabicMonth(m: number): string { return AR[m]; }
export function getDaysInMonth(y: number, m: number): number { return new Date(y, m + 1, 0).getDate(); }
export function getFirstWeekdayOfMonth(y: number, m: number): number { return new Date(y, m, 1).getDay(); }
export const REQUEST_TYPE_LABEL: Record<string, string> = { TRANSFER: 'نقل', PROMOTION: 'ترقية', RESIGNATION: 'استقالة', COMPLAINT: 'شكوى', SUGGESTION: 'اقتراح', LEAVE: 'إجازة' };
export const REQUEST_STATUS_LABEL: Record<string, string> = { PENDING: 'قيد الانتظار', IN_REVIEW: 'قيد المراجعة', APPROVED: 'معتمد', REJECTED: 'مرفوض', CANCELLED: 'ملغى', COMPLETED: 'مكتمل' };
export const PRIORITY_LABEL: Record<string, string> = { LOW: 'منخفضة', NORMAL: 'عادية', HIGH: 'مرتفعة', URGENT: 'عاجلة' };
export const APPROVAL_STATUS_LABEL: Record<string, string> = { PENDING: 'بانتظار', APPROVED: 'موافق', REJECTED: 'مرفوض', SKIPPED: 'تم تخطيه' };
`
);

/* ═══════════════════════════════════════════════════════════════
   RUN
   ═══════════════════════════════════════════════════════════════ */
console.log("");
console.log(
  `${C.b}${C.m}╔══════════════════════════════════════════════════════╗${C.r}`
);
console.log(
  `${C.b}${C.m}║  fix.cjs — v5.6 الإصلاح الشامل                       ║${C.r}`
);
console.log(
  `${C.b}${C.m}║  كل التعديلات المضمونة + App.tsx محدّث              ║${C.r}`
);
console.log(
  `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
);
console.log("");

mk(BACKUP);
console.log(`${C.d}Backup: .fix-backups/${STAMP}/${C.r}\n`);

let count = 0;
for (const [rel, content] of Object.entries(files)) {
  bk(rel);
  const abs = path.join(ROOT, rel);
  mk(path.dirname(abs));
  fs.writeFileSync(abs, content, "utf8");
  console.log(`${C.g}✓${C.r} ${rel}`);
  count++;
}

console.log(
  `\n${C.b}═══ الخلاصة ═══${C.r}\n  ${C.g}✓ عدد الملفات: ${count}${C.r}\n`
);

console.log(`${C.b}▶ TypeScript check${C.r}\n`);
let ok = false;
try {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  ok = true;
  console.log(`\n${C.g}${C.b}✓ لا أخطاء!${C.r}`);
} catch {
  console.log(`\n${C.y}⚠ راجع الأخطاء${C.r}`);
}

console.log("");
if (ok) {
  console.log(`${C.b}الخطوة التالية:${C.r}`);
  console.log(`  ${C.c}git add -A`);
  console.log(
    `  git commit -m "feat(v5.6): admin experience + spacing + arabic"`
  );
  console.log(`  git push origin main --force${C.r}`);
} else {
  console.log(
    `${C.y}صلّح الأخطاء ثم: git add -A && git commit -m "fix" && git push origin main --force${C.r}`
  );
}
console.log("");
