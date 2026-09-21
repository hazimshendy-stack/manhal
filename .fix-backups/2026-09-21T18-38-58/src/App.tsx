import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
   import { Layout } from '@/components/layout/Layout';
   import { RequireAuth } from '@/components/layout/RequireAuth';
   import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
   import { ToastContainer } from '@/components/ui/Toast';
   import { Onboarding } from '@/components/onboarding/Onboarding';
   import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';

   // ═══════════ Public Pages ═══════════
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

   // ═══════════ Dashboard Pages ═══════════
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

   // ═══════════ Admin Pages ═══════════
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
   import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';

   export default function App() {
     return (
       <ErrorBoundary>
         <HashRouter>
           <Routes>
             <Route element={<Layout />}>
               {/* ═══════ Public ═══════ */}
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

               {/* ═══════ Protected ═══════ */}
               <Route
                 path="/dashboard"
                 element={
                   <RequireAuth>
                     <DashboardPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/profile"
                 element={
                   <RequireAuth>
                     <MyProfilePage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/my-contributions"
                 element={
                   <RequireAuth>
                     <MyContributionsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/my-requests"
                 element={
                   <RequireAuth>
                     <MyRequestsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/requests/new"
                 element={
                   <RequireAuth>
                     <NewRequestPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/requests"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR']}>
                     <RequestsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/requests/:requestId"
                 element={
                   <RequireAuth>
                     <RequestDetailPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/approvals"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR']}>
                     <ApprovalsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/contributions"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR']}>
                     <ContributionsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/notifications"
                 element={
                   <RequireAuth>
                     <NotificationsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/conversations"
                 element={
                   <RequireAuth>
                     <ConversationsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/calendar"
                 element={
                   <RequireAuth>
                     <CalendarPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/reports"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR']}>
                     <ReportsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/audit"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AuditPage />
                   </RequireAuth>
                 }
               />

               {/* ═══════ Admin ═══════ */}
               <Route
                 path="/admin"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminHomePage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/users"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminUsersPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/members"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminMembersPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/contributions"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminContributionsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/committees"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminCommitteesPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/achievements"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminAchievementsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/warnings"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminWarningsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/calendar"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminCalendarPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/conversations"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminConversationsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/notifications"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminNotificationsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/analytics"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminAnalyticsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/audit"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminAuditPage />
                   </RequireAuth>
                 }
               />
               <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

               {/* ═══════ Fallback ═══════ */}
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
   