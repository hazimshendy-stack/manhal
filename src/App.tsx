

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
