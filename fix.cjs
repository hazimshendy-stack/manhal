#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   fix-v73.cjs
   ─────────────────────────────────────────────────────────────────────
   • إزالة Onboarding + boot screen نهائيًا
   • إزالة Chat/Conversations من الموقع بالكامل
   • استبدال "Chats" في BottomNav بـ "League" (موبايل + ديسكتوب)
   • إصلاح اسم التطبيق في Install banner → Manhal
   • BottomNav على الديسكتوب = نفس الموبايل (full width, labels واضحة)
   • إعادة تصميم صفحة الليج (conservative)
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();

console.log("");
console.log(
  " ╔══════════════════════════════════════════════════════════════╗"
);
console.log(
  " ║   fix-v73.cjs                                                ║"
);
console.log(
  " ╚══════════════════════════════════════════════════════════════╝"
);
console.log("");

function write(rel, content) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/^\n/, ""), "utf8");
  console.log("   ✓ " + rel);
}

function del(rel) {
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
    console.log("   ✗ " + rel);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
      1. حذف Onboarding + Chat كامل
      ═══════════════════════════════════════════════════════════════════════ */
console.log(" 🧹 حذف Onboarding + Chat…");
del("src/components/onboarding");
del("src/components/chat");
del("src/pages/ConversationsPage.tsx");
del("src/styles/onboarding.css");
del("src/styles/chat.css");
del("src/styles/chat-additions.css");

/* ═══════════════════════════════════════════════════════════════════════
      2. index.html — بدون boot screen نهائيًا
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 🏠 index.html — بدون Boot screen…");

write(
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
       <meta name="apple-mobile-web-app-title" content="Manhal" />
       <meta name="description" content="Manhal — Resala STEM Sub Branches official platform" />

       <title>Manhal</title>

       <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
       <link rel="icon" type="image/png" href="./icon-192.png" />
       <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
       <link rel="manifest" href="./manifest.json" />

       <link rel="preconnect" href="https://fonts.googleapis.com" />
       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
       <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

       <style>
         html, body {
           margin: 0;
           padding: 0;
           background: #FAFBFD;
           min-height: 100%;
         }
         #root { min-height: 100vh; }
       </style>

       <script>
         (function (l) {
           if (l.search[1] === '/') {
             var decoded = l.search.slice(1).split('&').map(function (s) {
               return s.replace(/~and~/g, '&');
             }).join('?');
             window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
           }
         })(window.location);
       </script>
     </head>
     <body>
       <div id="root"></div>
       <script type="module" src="./src/main.tsx"></script>
     </body>
   </html>
   `
);

/* ═══════════════════════════════════════════════════════════════════════
      3. App.tsx — بدون Onboarding + بدون Conversations
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 🧭 App.tsx…");

write(
  "src/App.tsx",
  `import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
   import { Layout } from '@/components/layout/Layout';
   import { RequireAuth } from '@/components/layout/RequireAuth';
   import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
   import { ToastContainer } from '@/components/ui/Toast';
   import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';

   import { HomePage } from '@/pages/HomePage';
   import { LoginPage } from '@/pages/LoginPage';
   import { RegisterPage } from '@/pages/RegisterPage';
   import { PendingApprovalPage } from '@/pages/PendingApprovalPage';
   import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
   import { AboutPage } from '@/pages/AboutPage';
   import { MembersPage } from '@/pages/MembersPage';
   import { MemberProfilePage } from '@/pages/MemberProfilePage';
   import { TeamsPage } from '@/pages/TeamsPage';
   import { TeamDetailPage } from '@/pages/TeamDetailPage';
   import { CommitteesPage } from '@/pages/CommitteesPage';
   import { CommitteeDetailPage } from '@/pages/CommitteeDetailPage';
   import { LeaguePage } from '@/pages/LeaguePage';
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
   import { CalendarPage } from '@/pages/CalendarPage';
   import { ReportsPage } from '@/pages/ReportsPage';
   import { AuditPage } from '@/pages/AuditPage';

   import { AdminHomePage } from '@/pages/admin/AdminHomePage';
   import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
   import { AdminPendingUsersPage } from '@/pages/admin/AdminPendingUsersPage';
   import { AdminMembersPage } from '@/pages/admin/AdminMembersPage';
   import { AdminContributionsPage } from '@/pages/admin/AdminContributionsPage';
   import { AdminCommitteesPage } from '@/pages/admin/AdminCommitteesPage';
   import { AdminAchievementsPage } from '@/pages/admin/AdminAchievementsPage';
   import { AdminWarningsPage } from '@/pages/admin/AdminWarningsPage';
   import { AdminCalendarPage } from '@/pages/admin/AdminCalendarPage';
   import { AdminNotificationsPage } from '@/pages/admin/AdminNotificationsPage';
   import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
   import { AdminGovernancePage } from '@/pages/admin/AdminGovernancePage';
   import { AdminRequestsPage } from '@/pages/admin/AdminRequestsPage';
   import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';

   export default function App() {
     return (
       <ErrorBoundary>
         <HashRouter>
           <Routes>
             <Route element={<Layout />}>
               {/* ═══ Public ═══ */}
               <Route path="/" element={<HomePage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/register" element={<RegisterPage />} />
               <Route path="/pending-approval" element={<PendingApprovalPage />} />
               <Route path="/change-password" element={<ChangePasswordPage />} />
               <Route path="/about" element={<AboutPage />} />
               <Route path="/members" element={<MembersPage />} />
               <Route path="/members/:memberId" element={<MemberProfilePage />} />
               <Route path="/teams" element={<TeamsPage />} />
               <Route path="/teams/:teamId" element={<TeamDetailPage />} />
               <Route path="/committees" element={<CommitteesPage />} />
               <Route path="/committees/:committeeId" element={<CommitteeDetailPage />} />
               <Route path="/league" element={<LeaguePage />} />
               <Route path="/achievements" element={<AchievementsPage />} />
               <Route path="/governance" element={<GovernancePage />} />
               <Route path="/search" element={<SearchPage />} />

               {/* ═══ Protected ═══ */}
               <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
               <Route path="/profile" element={<RequireAuth><MyProfilePage /></RequireAuth>} />
               <Route path="/my-contributions" element={<RequireAuth><MyContributionsPage /></RequireAuth>} />
               <Route path="/my-requests" element={<RequireAuth><MyRequestsPage /></RequireAuth>} />
               <Route path="/requests/new" element={<RequireAuth><NewRequestPage /></RequireAuth>} />
               <Route path="/requests" element={<RequireAuth><RequestsPage /></RequireAuth>} />
               <Route path="/requests/:requestId" element={<RequireAuth><RequestDetailPage /></RequireAuth>} />
               <Route path="/approvals" element={<RequireAuth><ApprovalsPage /></RequireAuth>} />
               <Route path="/contributions" element={<RequireAuth><ContributionsPage /></RequireAuth>} />
               <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
               <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
               <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
               <Route path="/audit" element={<RequireAuth roles={['HEAD', 'VICE']}><AuditPage /></RequireAuth>} />

               {/* ═══ Admin ═══ */}
               <Route path="/admin" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminHomePage /></RequireAuth>} />
               <Route path="/admin/analytics" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminAnalyticsPage /></RequireAuth>} />
               <Route path="/admin/pending-users" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminPendingUsersPage /></RequireAuth>} />
               <Route path="/admin/requests" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminRequestsPage /></RequireAuth>} />
               <Route path="/admin/users" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminUsersPage /></RequireAuth>} />
               <Route path="/admin/members" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminMembersPage /></RequireAuth>} />
               <Route path="/admin/contributions" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminContributionsPage /></RequireAuth>} />
               <Route path="/admin/committees" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminCommitteesPage /></RequireAuth>} />
               <Route path="/admin/achievements" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminAchievementsPage /></RequireAuth>} />
               <Route path="/admin/warnings" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminWarningsPage /></RequireAuth>} />
               <Route path="/admin/calendar" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminCalendarPage /></RequireAuth>} />
               <Route path="/admin/notifications" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminNotificationsPage /></RequireAuth>} />
               <Route path="/admin/governance" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminGovernancePage /></RequireAuth>} />
               <Route path="/admin/audit" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminAuditPage /></RequireAuth>} />
               <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

               <Route path="*" element={<NotFoundPage />} />
             </Route>
           </Routes>
           <ToastContainer />
           <PwaInstallBanner />
         </HashRouter>
       </ErrorBoundary>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════════════
      4. BottomNav.tsx — استبدال Chat بـ League
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 🔻 BottomNav…");

write(
  "src/components/layout/BottomNav.tsx",
  `import { NavLink } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { cx } from '@/lib/format';
   import { IconHome, IconMembers, IconTrophy, IconBell, IconAdmin } from '@/components/ui/Icons';
   import type { Notification } from '@/types';

   interface NavTab {
     to: string;
     label: string;
     Icon: (props: { size?: number }) => JSX.Element;
     badge?: number;
   }

   export function BottomNav() {
     const { user, manager } = useAuth();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');

     if (!user) return null;

     const unread = notifs.filter((n) => n.userId === user.uid && !n.read).length;

     const tabs: NavTab[] = [
       { to: '/dashboard', label: 'Home',     Icon: IconHome },
       { to: '/members',   label: 'Members',  Icon: IconMembers },
       { to: '/league',    label: 'League',   Icon: IconTrophy },
       { to: '/notifications', label: 'Alerts', Icon: IconBell, badge: unread },
       { to: manager ? '/admin' : '/profile', label: manager ? 'Admin' : 'Profile', Icon: IconAdmin },
     ];

     return (
       <nav className="bottom-nav no-print" aria-label="Quick navigation">
         <div className="bottom-nav__inner">
           {tabs.map((tab) => {
             const { Icon } = tab;
             return (
               <NavLink
                 key={tab.to}
                 to={tab.to}
                 end={tab.to === '/dashboard' || tab.to === '/admin'}
                 className={({ isActive }) => cx('bottom-nav__item', isActive && 'is-active')}
               >
                 <span className="bottom-nav__icon"><Icon size={22} /></span>
                 <span className="bottom-nav__label">{tab.label}</span>
                 {tab.badge && tab.badge > 0 ? (
                   <span className="bottom-nav__badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
                 ) : null}
               </NavLink>
             );
           })}
         </div>
       </nav>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════════════
      5. Icons.tsx — إضافة IconTrophy
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 🎨 Icons…");

const iconsPath = path.join(ROOT, "src/components/ui/Icons.tsx");
if (fs.existsSync(iconsPath)) {
  let icons = fs.readFileSync(iconsPath, "utf8");
  if (!icons.includes("IconTrophy")) {
    icons += `
   export function IconTrophy({ size = 24, className }: IconProps) {
     return (
       <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
         <path d="M6 3h12v3h3v3c0 2.5-2 4.5-4.5 4.5h-.7A6 6 0 0 1 13 16.9V19h3a1 1 0 0 1 1 1v1H7v-1a1 1 0 0 1 1-1h3v-2.1A6 6 0 0 1 8.2 13.5H7.5C5 13.5 3 11.5 3 9V6h3V3zm0 5H4v1c0 1.7 1.3 3 3 3V8zm14 1V8h-2v4c1.7 0 3-1.3 3-3z" />
       </svg>
     );
   }
   `;
    fs.writeFileSync(iconsPath, icons, "utf8");
    console.log("   ✓ IconTrophy added");
  }
}

/* ═══════════════════════════════════════════════════════════════════════
      6. Sidebar.tsx — إزالة روابط Conversations
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 📋 Sidebar…");

const sidebarPath = path.join(ROOT, "src/components/layout/Sidebar.tsx");
if (fs.existsSync(sidebarPath)) {
  let sidebar = fs.readFileSync(sidebarPath, "utf8");
  /* احذف كل سطر فيه /conversations */
  sidebar = sidebar
    .split("\n")
    .filter((l) => !l.includes("'/conversations'"))
    .filter((l) => !l.includes("Conversations"))
    .join("\n");
  fs.writeFileSync(sidebarPath, sidebar, "utf8");
  console.log("   ✓ removed Conversations from Sidebar");
}

/* ═══════════════════════════════════════════════════════════════════════
      7. PwaInstallBanner.tsx — اسم الموقع Manhal
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 📱 PwaInstallBanner…");

write(
  "src/components/pwa/PwaInstallBanner.tsx",
  `import { useEffect, useState } from 'react';
   import { canInstallPwa, promptInstall, isStandalone, isIos } from '@/lib/pwa';
   import { toast } from '@/components/ui/Toast';

   const DISMISSED_KEY = 'manhal-pwa-dismissed';

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

       const t = setTimeout(check, 8000);
       const handler = () => { setVisible(true); setIosMode(false); };
       window.addEventListener('pwa-install-available', handler);

       return () => {
         clearTimeout(t);
         window.removeEventListener('pwa-install-available', handler);
       };
     }, []);

     const dismiss = () => {
       setVisible(false);
       localStorage.setItem(DISMISSED_KEY, 'yes');
     };

     const install = async () => {
       if (iosMode) {
         toast.info('To install on iPhone', 'Tap Share → Add to Home Screen');
         return;
       }
       const result = await promptInstall();
       if (result === 'accepted') {
         toast.success('Installed', 'Open the app from your home screen');
         setVisible(false);
       } else if (result === 'dismissed') {
         dismiss();
       } else {
         toast.info('Install unavailable', 'Use browser menu → Install app');
       }
     };

     if (!visible) return null;

     return (
       <div className="pwa-install-banner no-print" role="dialog" aria-label="Install app">
         <div className="pwa-install-banner__body">
           <div className="pwa-install-banner__title">Install Manhal</div>
           <div className="pwa-install-banner__desc">
             {iosMode
               ? 'From Safari: tap Share → Add to Home Screen'
               : 'Faster access · no browser bar'}
           </div>
         </div>
         <div className="pwa-install-banner__actions">
           <button type="button" className="btn btn--ghost btn--xs" onClick={dismiss}>Later</button>
           <button type="button" className="btn btn--primary btn--xs" onClick={install}>Install</button>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════════════
      8. bottom-nav.css — full width + labels واضحة
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 🎨 bottom-nav.css…");

write(
  "src/styles/bottom-nav.css",
  `/* ═══════════════════════════════════════════════════════════════════════
      Bottom Navigation — Full width on mobile AND desktop
      Identical look · Same design · Labels always visible
      ═══════════════════════════════════════════════════════════════════════ */

   .bottom-nav {
     display: flex;
     position: fixed;
     bottom: 0;
     left: 0;
     right: 0;
     z-index: 60;
     height: calc(var(--bottom-nav-h) + var(--safe-bottom));
     padding-bottom: var(--safe-bottom);
     background: var(--c-white);
     border-top: 1px solid var(--c-line);
     box-shadow: 0 -2px 12px rgba(21, 26, 69, 0.06);
   }

   .bottom-nav__inner {
     display: flex;
     align-items: stretch;
     justify-content: space-around;
     width: 100%;
     max-width: 900px;
     margin-inline: auto;
     padding-inline: 6px;
     gap: 2px;
   }

   .bottom-nav__item {
     flex: 1;
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     gap: 4px;
     padding: 8px 6px 6px;
     color: var(--c-ink-muted);
     font-size: 0.72rem;
     font-weight: 700;
     text-decoration: none;
     position: relative;
     background: none;
     border: none;
     cursor: pointer;
     font-family: inherit;
     transition: color 0.15s var(--ease);
     max-width: 130px;
   }

   .bottom-nav__item:hover { color: var(--c-navy); }

   .bottom-nav__item.is-active { color: var(--c-red); }

   .bottom-nav__item.is-active::before {
     content: '';
     position: absolute;
     top: 0;
     left: 50%;
     transform: translateX(-50%);
     width: 28px;
     height: 3px;
     background: var(--c-red);
     border-radius: 0 0 4px 4px;
   }

   .bottom-nav__icon {
     display: flex;
     align-items: center;
     justify-content: center;
     line-height: 1;
     color: inherit;
   }

   .bottom-nav__icon svg {
     width: 22px;
     height: 22px;
     display: block;
   }

   .bottom-nav__label {
     display: block;
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
     max-width: 100%;
     line-height: 1.2;
     font-size: 0.72rem;
   }

   .bottom-nav__badge {
     position: absolute;
     top: 5px;
     right: 50%;
     margin-right: -22px;
     min-width: 18px;
     height: 18px;
     padding: 0 5px;
     border-radius: 999px;
     background: var(--c-red);
     color: #fff;
     font-size: 0.62rem;
     font-weight: 800;
     display: grid;
     place-items: center;
     border: 2px solid var(--c-white);
   }

   /* اجعل المحتوى يتنفس مكان الناف بار */
   .app-main {
     padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 12px);
   }
   `
);

/* ═══════════════════════════════════════════════════════════════════════
      9. desktop.css — نفس الموبايل بدون إطار إضافي
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 🖥️  desktop.css…");

write(
  "src/styles/desktop.css",
  `/* ═══════════════════════════════════════════════════════════════════════
      DESKTOP — نفس تجربة الموبايل تمامًا
      البوتوم ناف يبقى full width بنفس التصميم، بدون إطار عائم
      ═══════════════════════════════════════════════════════════════════════ */

   @media (min-width: 1024px) {
     .container {
       max-width: 1200px;
       padding-inline: 32px;
     }
   }

   @media (min-width: 1440px) {
     .container {
       max-width: 1320px;
       padding-inline: 40px;
     }
   }

   /* ─── Wider card grids ─── */
   @media (min-width: 1024px) {
     .home-teams-grid { grid-template-columns: repeat(3, 1fr); }
     .grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
     .grid--wide { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
     .grid--narrow { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
     .admin-cards { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
     .admin-stats { grid-template-columns: repeat(3, 1fr); }
     .stat-row { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
   }

   @media (min-width: 1440px) {
     .home-teams-grid { grid-template-columns: repeat(4, 1fr); }
     .admin-stats { grid-template-columns: repeat(6, 1fr); }
   }

   /* ═══════════════════════════════════════════════════════════════════════
      DESKTOP (≥901px) — BottomNav يبقى full width تمامًا زي الموبايل
      ═══════════════════════════════════════════════════════════════════════ */

   @media (min-width: 901px) {

     /* ─── Navbar ─── */
     .navbar {
       height: var(--navbar-h);
       padding-top: 0;
     }

     .navbar__inner {
       max-width: 1200px;
       margin-inline: auto;
       padding-inline: 32px;
     }

     @media (min-width: 1440px) {
       .navbar__inner {
         max-width: 1320px;
         padding-inline: 40px;
       }
     }

     /* زر القائمة ظاهر على الديسكتوب زي الموبايل */
     .show-mobile {
       display: inline-flex !important;
     }

     /* ─── BottomNav: full width بالظبط زي الموبايل ─── */
     .bottom-nav {
       display: flex !important;
       position: fixed !important;
       bottom: 0 !important;
       left: 0 !important;
       right: 0 !important;
       top: auto !important;
       transform: none !important;
       width: 100% !important;
       min-width: 100% !important;
       max-width: 100% !important;
       height: 68px !important;
       border-radius: 0 !important;
       border: none !important;
       border-top: 1px solid var(--c-line) !important;
       background: var(--c-white) !important;
       box-shadow: 0 -2px 12px rgba(21, 26, 69, 0.06) !important;
       padding: 6px 8px !important;
       padding-bottom: 6px !important;
       margin: 0 !important;
       z-index: 60 !important;
     }

     .bottom-nav__inner {
       display: flex !important;
       align-items: stretch !important;
       justify-content: space-around !important;
       width: 100% !important;
       max-width: 900px !important;
       margin-inline: auto !important;
       padding-inline: 6px !important;
       gap: 2px !important;
     }

     .bottom-nav__item {
       flex: 1 !important;
       display: flex !important;
       flex-direction: column !important;
       align-items: center !important;
       justify-content: center !important;
       gap: 4px !important;
       padding: 8px 10px 6px !important;
       border-radius: 0 !important;
       color: var(--c-ink-muted) !important;
       font-size: 0.78rem !important;
       font-weight: 700 !important;
       text-decoration: none !important;
       position: relative !important;
       transition: color 0.15s var(--ease) !important;
       cursor: pointer !important;
       border: none !important;
       background: transparent !important;
       max-width: 140px !important;
       font-family: inherit !important;
     }

     .bottom-nav__item:hover {
       color: var(--c-navy) !important;
       background: transparent !important;
     }

     .bottom-nav__item.is-active {
       color: var(--c-red) !important;
       background: transparent !important;
     }

     .bottom-nav__item.is-active::before {
       content: '' !important;
       display: block !important;
       position: absolute !important;
       top: 0 !important;
       left: 50% !important;
       transform: translateX(-50%) !important;
       width: 28px !important;
       height: 3px !important;
       background: var(--c-red) !important;
       border-radius: 0 0 4px 4px !important;
     }

     .bottom-nav__icon {
       display: flex !important;
       align-items: center !important;
       justify-content: center !important;
       line-height: 1 !important;
       color: inherit !important;
     }

     .bottom-nav__icon svg {
       width: 22px !important;
       height: 22px !important;
       display: block !important;
     }

     .bottom-nav__label {
       display: block !important;
       white-space: nowrap !important;
       overflow: hidden !important;
       text-overflow: ellipsis !important;
       max-width: 100% !important;
       line-height: 1.2 !important;
       font-size: 0.78rem !important;
       color: inherit !important;
       visibility: visible !important;
       opacity: 1 !important;
     }

     .bottom-nav__badge {
       position: absolute !important;
       top: 5px !important;
       right: 50% !important;
       margin-right: -22px !important;
       min-width: 18px !important;
       height: 18px !important;
       padding: 0 5px !important;
       border-radius: 999px !important;
       background: var(--c-red) !important;
       color: #fff !important;
       font-size: 0.62rem !important;
       font-weight: 800 !important;
       display: grid !important;
       place-items: center !important;
       border: 2px solid var(--c-white) !important;
     }

     /* خلي المحتوى يتنفس مكان الناف بار */
     .app-main {
       padding-bottom: 90px !important;
     }

     .footer {
       padding-bottom: 100px !important;
     }

     /* ─── Sidebar drawer (نفس الموبايل) ─── */
     .sidebar {
       position: fixed !important;
       top: 0 !important;
       left: -340px !important;
       right: auto !important;
       inset-inline-end: auto !important;
       width: 320px !important;
       max-width: 90vw !important;
       height: 100vh !important;
       height: 100dvh !important;
       background: var(--c-white) !important;
       z-index: 9999 !important;
       padding: 24px 22px !important;
       padding-top: calc(24px + var(--safe-top)) !important;
       padding-bottom: calc(24px + var(--safe-bottom)) !important;
       overflow-y: auto !important;
       transition: left 0.3s var(--ease) !important;
       box-shadow: 12px 0 60px rgba(21, 26, 69, 0.25) !important;
       border-right: 1px solid var(--c-line) !important;
       border-inline-start: none !important;
       border-inline-end: 1px solid var(--c-line) !important;
       display: block !important;
     }

     .sidebar.is-open { left: 0 !important; }

     .sidebar-overlay {
       display: block !important;
       position: fixed !important;
       inset: 0 !important;
       background: rgba(21, 26, 69, 0.55) !important;
       z-index: 9998 !important;
       opacity: 0 !important;
       pointer-events: none !important;
       transition: opacity 0.3s var(--ease) !important;
       backdrop-filter: blur(3px) !important;
       -webkit-backdrop-filter: blur(3px) !important;
     }

     .sidebar-overlay.is-open { opacity: 1 !important; pointer-events: auto !important; }

     .sidebar-close { display: flex !important; }

     .dashboard-layout {
       grid-template-columns: 1fr !important;
       gap: 20px !important;
     }

     /* ─── Toast top-right ─── */
     .toast-container {
       bottom: auto !important;
       top: 90px !important;
       right: 24px !important;
       left: auto !important;
       max-width: 400px !important;
     }

     /* ─── PWA banner bottom-right ─── */
     .pwa-install-banner {
       left: auto !important;
       right: 24px !important;
       bottom: 90px !important;
       max-width: 420px !important;
       inset-inline: auto !important;
     }
   }
   `
);

/* ═══════════════════════════════════════════════════════════════════════
      10. LeaguePage.tsx — إعادة تصميم تحفظي
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 🏆 LeaguePage — تصميم جديد…");

write(
  "src/pages/LeaguePage.tsx",
  `import { useMemo, useState } from 'react';
   import { Link } from 'react-router-dom';
   import { useRealtimeCollection, useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getGlobalRanking, getTeamRanking, getCommitteeRanking } from '@/lib/rankings';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Avatar } from '@/components/ui/Avatar';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { cx } from '@/lib/format';
   import type { Member, Contribution, TeamId, Committee } from '@/types';

   type FilterType = 'all' | 'team' | 'committee';

   export function LeaguePage() {
     const { data: members, loading } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const { data: liveCommittees } = useCollection<Committee>('committees');

     const [filterType, setFilterType] = useState<FilterType>('all');
     const [filterId, setFilterId] = useState<string>('all');

     const board = useMemo(() => {
       if (filterType === 'all' || filterId === 'all') {
         return getGlobalRanking(members, contributions);
       }
       if (filterType === 'team') {
         return getTeamRanking(members, contributions, filterId as TeamId);
       }
       return getCommitteeRanking(members, contributions, filterId);
     }, [members, contributions, filterType, filterId]);

     const title = useMemo(() => {
       if (filterType === 'all') return 'Global Ranking';
       if (filterType === 'team') {
         const t = teams.find((x) => x.id === filterId);
         return t ? t.name + ' Team' : 'Team Ranking';
       }
       const c = liveCommittees.find((x) => x.id === filterId);
       return c ? c.nameAr : 'Committee Ranking';
     }, [filterType, filterId, liveCommittees]);

     const totalPoints = board.reduce((s, e) => s + e.points, 0);
     const totalHours = board.reduce((s, e) => s + e.hours, 0);

     const top3 = board.slice(0, 3);
     const rest = board.slice(3);

     return (
       <div className="container">
         <PageHeader
           eyebrow="League"
           title="Leaderboard"
           description="Ranked by contribution points. Team, committee, and global standings."
         />

         {/* ═══ Filters ═══ */}
         <div className="chips mb-3">
           <button
             type="button"
             className={cx('chip', filterType === 'all' && 'is-active')}
             onClick={() => { setFilterType('all'); setFilterId('all'); }}
           >
             Global
           </button>
           <button
             type="button"
             className={cx('chip', filterType === 'team' && 'is-active')}
             onClick={() => { setFilterType('team'); setFilterId('all'); }}
           >
             By Team
           </button>
           <button
             type="button"
             className={cx('chip', filterType === 'committee' && 'is-active')}
             onClick={() => { setFilterType('committee'); setFilterId('all'); }}
           >
             By Committee
           </button>
         </div>

         {filterType === 'team' ? (
           <div className="chips mb-4">
             <button
               type="button"
               className={cx('chip', filterId === 'all' && 'is-active')}
               onClick={() => setFilterId('all')}
             >
               All Teams
             </button>
             {teams.map((t) => (
               <button
                 key={t.id}
                 type="button"
                 className={cx('chip', filterId === t.id && 'is-active')}
                 onClick={() => setFilterId(t.id)}
               >
                 {t.name}
               </button>
             ))}
           </div>
         ) : null}

         {filterType === 'committee' ? (
           <div className="chips mb-4">
             <button
               type="button"
               className={cx('chip', filterId === 'all' && 'is-active')}
               onClick={() => setFilterId('all')}
             >
               All Committees
             </button>
             {liveCommittees.map((c) => (
               <button
                 key={c.id}
                 type="button"
                 className={cx('chip', filterId === c.id && 'is-active')}
                 onClick={() => setFilterId(c.id)}
               >
                 {c.nameAr}
               </button>
             ))}
           </div>
         ) : null}

         {/* ═══ Summary ═══ */}
         {!loading && board.length > 0 ? (
           <section className="section--tight">
             <StatRow>
               <Stat value={board.length} label="Ranked" />
               <Stat value={totalPoints} label="Points" variant="red" />
               <Stat value={totalHours} label="Hours" />
             </StatRow>
           </section>
         ) : null}

         {/* ═══ Loading ═══ */}
         {loading ? (
           <section className="section">
             <SkeletonList count={8} />
           </section>
         ) : board.length === 0 ? (
           <section className="section">
             <EmptyState
               icon="🏆"
               title="No ranking yet"
               message="No approved contributions in this category."
             />
           </section>
         ) : (
           <>
             {/* ═══ Podium — Top 3 ═══ */}
             {top3.length > 0 ? (
               <section className="section--tight">
                 <div className="league-podium">
                   {top3.map((e, idx) => (
                     <Link
                       key={e.member.id}
                       to={'/members/' + e.member.id}
                       className={'league-podium__card league-podium__card--' + (idx + 1)}
                     >
                       <span className={'league-podium__rank league-podium__rank--' + (idx + 1)}>
                         #{e.rank}
                       </span>
                       <Avatar name={e.member.name} size={64} variant="gradient" />
                       <div className="league-podium__name">{e.member.name}</div>
                       <div className="league-podium__points">{e.points} pts</div>
                       <div className="league-podium__hours">{e.hours} hrs</div>
                     </Link>
                   ))}
                 </div>
               </section>
             ) : null}

             {/* ═══ Rest of the table ═══ */}
             {rest.length > 0 ? (
               <section className="section">
                 <div className="league-table">
                   <div className="league-table__head">
                     <span>#</span>
                     <span>Member</span>
                     <span>Team</span>
                     <span>Hours</span>
                     <span>Points</span>
                   </div>
                   {rest.map((e) => {
                     const memberTeams = teams.filter((t) =>
                       Array.isArray(e.member.teamIds) && e.member.teamIds.includes(t.id),
                     );
                     return (
                       <Link
                         key={e.member.id}
                         to={'/members/' + e.member.id}
                         className="league-table__row"
                       >
                         <span className="col-rank">
                           <span className={'rank-badge rank-' + (e.rank <= 3 ? e.rank : '')}>
                             {e.rank}
                           </span>
                         </span>
                         <span className="col-name">
                           <Avatar name={e.member.name} size={32} variant="navy" />
                           <span className="league-table__name">{e.member.name}</span>
                         </span>
                         <span className="col-team">
                           {memberTeams.length === 0
                             ? '—'
                             : memberTeams.map((t) => (
                                 <span key={t.id} className="badge">{t.name}</span>
                               ))}
                         </span>
                         <span className="col-hours">{e.hours}</span>
                         <span className="col-points">{e.points}</span>
                       </Link>
                     );
                   })}
                 </div>
               </section>
             ) : null}
           </>
         )}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════════════
      11. league.css — تصميم نظيف
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 🎨 league.css…");

write(
  "src/styles/league.css",
  `/* ═══════════════════════════════════════════════════════════════════════
      League — تصميم نظيف تحفظي
      ═══════════════════════════════════════════════════════════════════════ */

   .league-podium {
     display: grid;
     grid-template-columns: 1fr;
     gap: 12px;
   }

   @media (min-width: 640px) {
     .league-podium {
       grid-template-columns: repeat(3, 1fr);
       gap: 16px;
     }
   }

   .league-podium__card {
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 10px;
     padding: 22px 16px;
     border-radius: var(--radius);
     border: 1.5px solid var(--c-line);
     background: var(--c-white);
     text-decoration: none;
     color: var(--c-ink);
     box-shadow: var(--shadow-xs);
     transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease), border-color 0.18s var(--ease);
     text-align: center;
   }

   .league-podium__card:hover {
     transform: translateY(-2px);
     box-shadow: var(--shadow-sm);
     border-color: var(--c-line-mid);
   }

   .league-podium__card--1 {
     border-color: #FCA5A5;
     background: linear-gradient(180deg, #FFFBFC, #FFFFFF);
   }

   .league-podium__card--2 { border-color: var(--c-line-mid); }
   .league-podium__card--3 { border-color: var(--c-line); }

   .league-podium__rank {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     padding: 3px 12px;
     border-radius: var(--radius-full);
     font-family: var(--font-en);
     font-size: 0.72rem;
     font-weight: 800;
     letter-spacing: 0.04em;
     margin-bottom: 4px;
   }

   .league-podium__rank--1 {
     background: var(--c-red);
     color: #fff;
     box-shadow: 0 4px 12px rgba(193, 39, 45, 0.28);
   }

   .league-podium__rank--2 {
     background: var(--c-navy-2);
     color: #fff;
   }

   .league-podium__rank--3 {
     background: var(--c-navy);
     color: #fff;
   }

   .league-podium__name {
     font-size: 0.98rem;
     font-weight: 800;
     color: var(--c-ink);
     line-height: 1.35;
     word-break: break-word;
     overflow-wrap: anywhere;
     max-width: 100%;
   }

   .league-podium__points {
     font-family: var(--font-en);
     font-size: 1.15rem;
     font-weight: 800;
     color: var(--c-red);
     line-height: 1;
   }

   .league-podium__hours {
     font-family: var(--font-en);
     font-size: 0.78rem;
     color: var(--c-ink-muted);
     font-weight: 700;
   }

   /* ═══════════ Table ═══════════ */

   .league-table {
     background: var(--c-white);
     border: 1px solid var(--c-line);
     border-radius: var(--radius);
     overflow: hidden;
     box-shadow: var(--shadow-xs);
   }

   .league-table__head {
     display: grid;
     grid-template-columns: 60px 2fr 1.4fr 80px 90px;
     gap: 12px;
     padding: 14px 20px;
     background: var(--c-navy);
     color: #fff;
     font-size: 0.7rem;
     font-weight: 800;
     text-transform: uppercase;
     letter-spacing: 0.06em;
   }

   .league-table__row {
     display: grid;
     grid-template-columns: 60px 2fr 1.4fr 80px 90px;
     gap: 12px;
     padding: 12px 20px;
     align-items: center;
     color: var(--c-ink);
     text-decoration: none;
     border-bottom: 1px solid var(--c-line);
     transition: background 0.15s var(--ease);
   }

   .league-table__row:last-child { border-bottom: none; }
   .league-table__row:hover { background: var(--c-off-white); }

   .league-table__row .col-name {
     display: flex;
     align-items: center;
     gap: 10px;
     min-width: 0;
   }

   .league-table__name {
     font-weight: 700;
     font-size: 0.92rem;
     color: var(--c-ink);
     word-break: break-word;
     overflow-wrap: anywhere;
   }

   .col-hours,
   .col-points {
     font-family: var(--font-en);
     font-weight: 800;
     font-size: 0.95rem;
   }

   .col-points { color: var(--c-red); }
   .col-hours { color: var(--c-navy); }

   .col-team {
     display: flex;
     flex-wrap: wrap;
     gap: 4px;
   }

   .rank-badge {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     width: 32px;
     height: 32px;
     border-radius: 50%;
     background: var(--c-line);
     color: var(--c-ink-soft);
     font-family: var(--font-en);
     font-weight: 800;
     font-size: 0.78rem;
   }

   /* ═══════════ Mobile: table → cards ═══════════ */

   @media (max-width: 700px) {
     .league-table__head { display: none; }

     .league-table {
       background: transparent;
       border: none;
       box-shadow: none;
       display: flex;
       flex-direction: column;
       gap: 10px;
     }

     .league-table__row {
       display: grid;
       grid-template-columns: 44px 1fr auto;
       grid-template-areas:
         'rank name points'
         'rank team hours';
       gap: 6px 12px;
       padding: 14px 16px;
       background: var(--c-white);
       border: 1px solid var(--c-line);
       border-radius: var(--radius);
       box-shadow: var(--shadow-xs);
     }

     .league-table__row .col-rank { grid-area: rank; align-self: center; }
     .league-table__row .col-name { grid-area: name; }
     .league-table__row .col-team { grid-area: team; }
     .league-table__row .col-points {
       grid-area: points;
       text-align: end;
       align-self: center;
       font-size: 1rem;
     }
     .league-table__row .col-hours {
       grid-area: hours;
       text-align: end;
       font-size: 0.78rem;
       color: var(--c-ink-muted);
     }
   }
   `
);

/* ═══════════════════════════════════════════════════════════════════════
      12. global.css — إزالة onboarding/chat + إضافة league
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 📦 global.css…");

const globalCssPath = path.join(ROOT, "src/styles/global.css");
let globalCss = fs.existsSync(globalCssPath)
  ? fs.readFileSync(globalCssPath, "utf8")
  : "";

const lines = globalCss
  .split("\n")
  .filter((l) => !l.includes("onboarding.css"))
  .filter((l) => !l.includes("chat.css"))
  .filter((l) => !l.includes("chat-additions.css"))
  .filter((l) => !l.includes("league.css"));

/* تأكد إن league.css موجود قبل desktop.css */
const desktopIdx = lines.findIndex((l) => l.includes("desktop.css"));
if (desktopIdx >= 0) {
  lines.splice(desktopIdx, 0, "@import './league.css';");
} else {
  lines.push("@import './league.css';");
  lines.push("@import './desktop.css';");
}

fs.writeFileSync(globalCssPath, lines.join("\n"), "utf8");
console.log("   ✓ global.css updated");

/* ═══════════════════════════════════════════════════════════════════════
      13. ابحث عن أي إشارة متبقية للمحادثات في الكود
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 🔎 فحص أي إشارات متبقية للمحادثات…");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", ".git", "dist"].includes(e.name)) continue;
      walk(full, files);
    } else if (e.isFile() && /\.(tsx?|jsx?)$/.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

const srcFiles = walk(path.join(ROOT, "src"));
let chatRefs = 0;

for (const f of srcFiles) {
  const c = fs.readFileSync(f, "utf8");
  if (
    /from\s+['"]@\/pages\/ConversationsPage['"]/.test(c) ||
    /from\s+['"]@\/components\/chat/.test(c) ||
    /from\s+['"]@\/components\/onboarding/.test(c)
  ) {
    console.log("   ⚠ " + path.relative(ROOT, f));
    chatRefs += 1;
  }
}

if (chatRefs === 0) {
  console.log("   ✓ لا توجد إشارات متبقية");
}

/* ═══════════════════════════════════════════════════════════════════════
      14. Build + Push
      ═══════════════════════════════════════════════════════════════════════ */
console.log("");
console.log(" 🧹 Cleaning old artifacts…");
["dist", "node_modules/.vite", ".vite"].forEach((p) => {
  const abs = path.join(ROOT, p);
  if (fs.existsSync(abs)) {
    try {
      fs.rmSync(abs, { recursive: true, force: true });
      console.log("   ✗ " + p);
    } catch {}
  }
});

function run(cmd, silent = false) {
  try {
    if (!silent) console.log(" $ " + cmd);
    execSync(cmd, { stdio: silent ? "pipe" : "inherit", cwd: ROOT });
    return true;
  } catch {
    if (!silent) console.log("   (command returned non-zero)");
    return false;
  }
}

if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
  console.log("");
  console.log(" 📦 Installing…");
  run("npm install --no-audit --no-fund");
}

console.log("");
console.log(" 🏗  Building…");
const buildOk = run("npm run build");

if (!buildOk) {
  console.log("");
  console.log(
    " ╔══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    " ║   ❌ BUILD FAILED — ابعتلي السطرين قبل الـ stack trace       ║"
  );
  console.log(
    " ╚══════════════════════════════════════════════════════════════╝"
  );
  process.exit(1);
}

console.log("");
console.log(" 📤 Pushing…");

if (!fs.existsSync(path.join(ROOT, ".git"))) {
  run("git init");
  run("git branch -M main");
}

try {
  execSync("git remote get-url origin", { cwd: ROOT, stdio: "pipe" });
} catch {
  run(
    "git remote add origin https://github.com/hazimshendy-stack/sbapiaryyy.git"
  );
}

run("git add -A");
run(
  'git commit -m "feat(v7.3): remove onboarding+chat, league in bottom nav, full-width desktop nav, league redesign"',
  true
);
const pushed = run("git push origin main --force");

console.log("");
console.log(
  " ╔══════════════════════════════════════════════════════════════╗"
);
console.log(
  pushed
    ? " ║   ✅ DONE — pushed. GitHub Actions ستبدأ خلال دقيقة.         ║"
    : " ║   ⚠️  Push failed — راجع الـ output فوق.                    ║"
);
console.log(
  " ╚══════════════════════════════════════════════════════════════╝"
);
console.log("");
console.log(" ✨ ما تم:");
console.log("   ✓ حذف Onboarding + boot screen");
console.log("   ✓ حذف Chat/Conversations كامل");
console.log("   ✓ League مكان Chats في BottomNav");
console.log("   ✓ BottomNav على الديسكتوب = full width زي الموبايل");
console.log("   ✓ Labels ظاهرة على الديسكتوب");
console.log('   ✓ PWA banner → "Install Manhal"');
console.log("   ✓ League redesign — نظيف وتحفظي");
console.log("");
console.log(" ⚠️  لو Actions فشل في build، ابعتلي السطرين قبل stack trace.");
console.log("");
