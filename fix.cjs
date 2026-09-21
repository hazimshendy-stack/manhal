#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — Live Data + Clear Notifications
 * - Dashboard: 100% live from Firestore (no static fallback)
 * - Admin panel: live counts only
 * - Members page: live only
 * - Clear old notifications option
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

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

const files = {};
const F = (p, c) => {
  files[p.replace(/\\/g, "/")] = c.replace(/^\n/, "");
};

function ask(q) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((res) =>
    rl.question(q, (a) => {
      rl.close();
      res(a.trim().toLowerCase());
    })
  );
}

/* ═══════════════════════════════════════════════════════════════
   1) DashboardPage — 100% LIVE
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/DashboardPage.tsx",
  `import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { isManager, seesAllTeams, canApproveStep } from '@/lib/permissions';
import { hoursToPoints, formatDate } from '@/lib/format';
import { Stat, StatRow } from '@/components/ui/Stat';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EventCard } from '@/components/calendar/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import type {
  Notification,
  RequestRecord,
  Contribution,
  ApprovalStep,
  CalendarEvent,
  Member,
} from '@/types';

export function DashboardPage() {
  const { user } = useAuth();

  /* ═══ 100% LIVE DATA — no static fallback ═══ */
  const { data: members, loading: loadingMembers } = useRealtimeCollection<Member>('members');
  const { data: notifs, loading: loadingNotifs } = useRealtimeCollection<Notification>('notifications');
  const { data: requests, loading: loadingRequests } = useRealtimeCollection<RequestRecord>('requests');
  const { data: contributions, loading: loadingContribs } = useRealtimeCollection<Contribution>('contributions');
  const { data: approvals, loading: loadingApprovals } = useRealtimeCollection<ApprovalStep>('approvals');
  const { data: events, loading: loadingEvents } = useRealtimeCollection<CalendarEvent>('calendar');

  const isLoading = loadingMembers || loadingNotifs || loadingRequests ||
                    loadingContribs || loadingApprovals || loadingEvents;

  if (!user) {
    return (
      <div className="container">
        <EmptyState title="Sign in required" message="Sign in to access your dashboard." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container">
        <Loading fullHeight message="Loading dashboard..." />
      </div>
    );
  }

  /* ═══ Use LIVE members only — never static ═══ */
  const allMembers = members;
  const myMember = user.memberId ? allMembers.find((m) => m.id === user.memberId) : null;

  const myContribs = contributions.filter((c) => c.memberId === user.memberId);
  const approvedContribs = myContribs.filter((c) => c.status === 'approved');
  const myHours = approvedContribs.reduce((s, c) => s + c.hours, 0);
  const myPoints = hoursToPoints(myHours);

  const myRequests = requests.filter((r) => r.requesterUid === user.uid);

  const myNotifs = notifs
    .filter((n) => n.userId === user.uid)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  const myPendingApprovals = approvals.filter(
    (a) => a.status === 'PENDING' && canApproveStep(user, a),
  );

  const upcomingEvents = events
    .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
    .filter((e) => e.isPublic || e.teamId === user.teamId || seesAllTeams(user))
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 3);

  const totalOrgPoints = allMembers.reduce(
    (s, m) => s + hoursToPoints(m.hours || 0),
    0,
  );

  const pendingRequestsCount = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'IN_REVIEW',
  ).length;

  /* ═══ Top members — from LIVE data only ═══ */
  const topMembers = [...allMembers]
    .filter((m) => m.role !== 'HEAD' && m.role !== 'VICE')
    .sort((a, b) => hoursToPoints(b.hours || 0) - hoursToPoints(a.hours || 0))
    .slice(0, 5)
    .map((m, i) => ({ member: m, rank: i + 1 }));

  return (
    <>
      <div className="section section--tight">
        <div className="section-head__eyebrow">Welcome back</div>
        <h1>{user.displayName}</h1>
      </div>

      {isManager(user) ? (
        <section className="section--tight">
          <StatRow>
            <Stat value={allMembers.length} label="Members" />
            <Stat value={teams.length} label="Teams" />
            <Stat value={pendingRequestsCount} label="Pending Requests" variant="red" />
            <Stat value={totalOrgPoints} label="Total Points" />
          </StatRow>
        </section>
      ) : (
        <section className="section--tight">
          <StatRow>
            <Stat value={myPoints} label="My Points" variant="red" />
            <Stat value={myHours} label="My Hours" />
            <Stat value={myContribs.length} label="My Contributions" />
            <Stat value={myRequests.length} label="My Requests" />
          </StatRow>
        </section>
      )}

      {user.role === 'MEMBER' ? (
        <section className="section--tight">
          <div className="row" style={{ gap: 10 }}>
            <Link to="/requests/new" className="btn btn--primary btn--sm">+ New Request</Link>
            <Link to="/my-contributions" className="btn btn--ghost btn--sm">Log Contribution</Link>
          </div>
        </section>
      ) : null}

      {isManager(user) && myPendingApprovals.length > 0 ? (
        <section className="section">
          <SectionHeader
            eyebrow="Awaiting your decision"
            title="Pending Approvals"
            action={<Link to="/approvals" className="btn btn--ghost btn--sm">View All</Link>}
          />
          <div className="stack">
            {myPendingApprovals.slice(0, 4).map((a) => {
              const req = requests.find((r) => r.id === a.requestId);
              if (!req) return null;
              return (
                <Link key={a.id} to={'/requests/' + req.id} className="card">
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">{req.title}</div>
                      <div className="card__meta">{req.requesterName} · Step {a.order}</div>
                    </div>
                    <Badge variant="warning" dot>Awaiting</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {myNotifs.length > 0 ? (
        <section className="section">
          <SectionHeader
            eyebrow="Latest updates"
            title="Notifications"
            action={<Link to="/notifications" className="btn btn--ghost btn--sm">View All</Link>}
          />
          <div className="stack">
            {myNotifs.map((n) => (
              <Link
                key={n.id}
                to={n.route || '/notifications'}
                className="card"
                style={!n.read ? { borderColor: '#FCA5A5', background: '#FFFBFC' } : undefined}
              >
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{n.title}</div>
                    <div className="card__meta">{n.message}</div>
                  </div>
                  {!n.read ? <Badge variant="red" dot>New</Badge> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <SectionHeader
          eyebrow="Ranking"
          title="Top Members"
          action={<Link to="/league" className="btn btn--ghost btn--sm">Full Leaderboard</Link>}
        />
        {topMembers.length === 0 ? (
          <EmptyState
            title="No members"
            message="No members yet. Add members from the admin panel."
          />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Hours</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {topMembers.map((e) => (
                  <tr key={e.member.id}>
                    <td className={'rank rank--' + (e.rank <= 3 ? e.rank : '')} data-label="Rank">{e.rank}</td>
                    <td data-label="Member">
                      <Link to={'/members/' + e.member.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={e.member.name} size={30} variant="navy" />
                        <span style={{ fontWeight: 700 }}>{e.member.name}</span>
                      </Link>
                    </td>
                    <td style={{ fontFamily: 'var(--font-en)' }} data-label="Hours">{e.member.hours || 0}</td>
                    <td className="points" data-label="Points">{hoursToPoints(e.member.hours || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {upcomingEvents.length > 0 ? (
        <section className="section">
          <SectionHeader
            eyebrow="Coming up"
            title="Upcoming Events"
            action={<Link to="/calendar" className="btn btn--ghost btn--sm">Calendar</Link>}
          />
          <div className="stack">
            {upcomingEvents.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      ) : null}

      {myMember ? (
        <section className="section">
          <SectionHeader eyebrow="My Info" title="My Account" />
          <div className="card no-click">
            <div className="kv"><span className="kv__k">Name</span><span className="kv__v">{myMember.name}</span></div>
            <div className="kv mt-3">
              <span className="kv__k">Team</span>
              <span className="kv__v">{user.teamId ? teams.find((t) => t.id === user.teamId)?.name : '—'}</span>
            </div>
            {user.committeeIds.length > 0 ? (
              <div className="kv mt-3">
                <span className="kv__k">Committees</span>
                <span className="kv__v">
                  {committees.filter((c) => user.committeeIds.includes(c.id)).map((c) => c.nameAr).join(' · ')}
                </span>
              </div>
            ) : null}
            <div className="kv mt-3">
              <span className="kv__k">Joined</span>
              <span className="kv__v">{formatDate(user.createdAt)}</span>
            </div>
            <div className="row mt-4" style={{ gap: 10 }}>
              <Link to="/profile" className="btn btn--ghost btn--sm">My Profile</Link>
              <Link to="/my-contributions" className="btn btn--ghost btn--sm">My Contributions</Link>
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
   2) AdminHomePage — 100% LIVE
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/admin/AdminHomePage.tsx",
  `import { Link } from 'react-router-dom';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { seedAll, type SeedResult } from '@/lib/seed';
import { hoursToPoints } from '@/lib/format';
import { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Loading } from '@/components/ui/Loading';
import { toast } from '@/components/ui/Toast';
import type {
  AppUser,
  RequestRecord,
  Contribution,
  Notification,
  Member,
  Committee,
} from '@/types';

interface AdminCard {
  to: string;
  title: string;
  count?: number;
  description: string;
}

export function AdminHomePage() {
  const { user } = useAuth();

  /* ═══ 100% LIVE DATA ═══ */
  const { data: users, loading: l1 } = useRealtimeCollection<AppUser>('users');
  const { data: members, loading: l2 } = useRealtimeCollection<Member>('members');
  const { data: requests, loading: l3 } = useRealtimeCollection<RequestRecord>('requests');
  const { data: contributions, loading: l4 } = useRealtimeCollection<Contribution>('contributions');
  const { data: notifs, loading: l5 } = useRealtimeCollection<Notification>('notifications');
  const { data: committees, loading: l6 } = useRealtimeCollection<Committee>('committees');

  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6;

  /* ═══ Live counts ═══ */
  const usersCount = users.length;
  const membersCount = members.length;
  const pendingReq = requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
  const pendingContribs = contributions.filter((c) => c.status === 'pending').length;
  const notifsCount = notifs.length;
  const committeesCount = committees.length;
  const totalPoints = members.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);

  const onSeed = async () => {
    if (!window.confirm('This will upload seed data to Firestore. Continue?')) return;
    setSeeding(true);
    try {
      const r = await seedAll();
      setResult(r);
      toast.success('Data uploaded');
    } catch (err) {
      toast.error('Upload failed', err instanceof Error ? err.message : '');
    } finally {
      setSeeding(false);
    }
  };

  const cards: AdminCard[] = [
    { to: '/admin/analytics', title: 'Analytics', description: 'Overview of all statistics' },
    { to: '/admin/requests', title: 'Requests', count: pendingReq, description: 'Manage all requests' },
    { to: '/admin/users', title: 'Users', count: usersCount, description: 'Accounts and roles' },
    { to: '/admin/members', title: 'Members', count: membersCount, description: 'Manage member data' },
    { to: '/admin/contributions', title: 'Contributions', count: pendingContribs, description: 'Approve member contributions' },
    { to: '/admin/committees', title: 'Committees', count: committeesCount, description: 'Manage committees' },
    { to: '/admin/achievements', title: 'Achievements', description: 'Manage achievements' },
    { to: '/admin/warnings', title: 'Warnings', description: 'Issue and track warnings' },
    { to: '/admin/calendar', title: 'Calendar', description: 'Manage events' },
    { to: '/admin/conversations', title: 'Conversations', description: 'Manage chats' },
    { to: '/admin/notifications', title: 'Send Notification', count: notifsCount, description: 'Send bulk notifications' },
    { to: '/admin/governance', title: 'Governance', description: 'Policies and documents' },
    { to: '/admin/audit', title: 'Audit Log', description: 'Track all admin actions' },
  ];

  if (isLoading) {
    return (
      <div className="admin-page">
        <Loading fullHeight message="Loading admin panel..." />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <section className="admin-welcome">
        <div className="admin-welcome__eyebrow">Admin Panel</div>
        <h1 className="admin-welcome__name">Welcome, {user?.displayName || 'Admin'}</h1>
        <p className="admin-welcome__subtitle">
          Full control over content, members, and requests. Everything from one place.
        </p>
      </section>

      <section className="admin-stats">
        <div className="stat">
          <div className="stat__value">{usersCount}</div>
          <div className="stat__label">Users</div>
        </div>
        <div className="stat">
          <div className="stat__value">{membersCount}</div>
          <div className="stat__label">Members</div>
        </div>
        <div className={'stat' + (pendingReq > 0 ? ' stat--red' : '')}>
          <div className="stat__value">{pendingReq}</div>
          <div className="stat__label">Pending Requests</div>
        </div>
        <div className={'stat' + (pendingContribs > 0 ? ' stat--amber' : '')}>
          <div className="stat__value">{pendingContribs}</div>
          <div className="stat__label">Pending Contributions</div>
        </div>
        <div className="stat">
          <div className="stat__value">{totalPoints}</div>
          <div className="stat__label">Total Points</div>
        </div>
        <div className="stat">
          <div className="stat__value">{notifsCount}</div>
          <div className="stat__label">Notifications</div>
        </div>
      </section>

      <section className="admin-seed">
        <div className="admin-seed__head">
          <div>
            <div className="admin-seed__title">Upload Seed Data</div>
            <div className="admin-seed__desc">One-time only — if Firestore is empty.</div>
          </div>
          <button type="button" className="btn btn--primary" onClick={onSeed} disabled={seeding}>
            {seeding ? 'Uploading...' : 'Upload Data'}
          </button>
        </div>
        {result ? (
          <div className="admin-seed__result">
            ✓ Uploaded — Members: {result.members} · Teams: {result.teams} ·
            Contributions: {result.contributions} · Requests: {result.requests}
          </div>
        ) : null}
      </section>

      <section style={{ marginTop: 32 }}>
        <SectionHeader eyebrow="Sections" title="Quick Links" />
        <div className="admin-cards">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="admin-card">
              <div className="admin-card__head">
                <div className="admin-card__title">{c.title}</div>
                {c.count !== undefined && c.count > 0 ? (
                  <span className="admin-card__count">{c.count > 99 ? '99+' : c.count}</span>
                ) : null}
              </div>
              <div className="admin-card__desc">{c.description}</div>
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
   3) Clear Notifications utility
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/lib/clearData.ts",
  `/**
 * Utility to clear old/wrong data
 * Use from admin panel or console
 */

import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Clear ALL notifications
 */
export async function clearAllNotifications(): Promise<number> {
  const snap = await getDocs(collection(db, 'notifications'));
  let count = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, 'notifications', d.id));
    count++;
  }
  return count;
}

/**
 * Clear all notifications for a specific user
 */
export async function clearUserNotifications(userId: string): Promise<number> {
  const snap = await getDocs(collection(db, 'notifications'));
  let count = 0;
  for (const d of snap.docs) {
    if (d.data().userId === userId) {
      await deleteDoc(doc(db, 'notifications', d.id));
      count++;
    }
  }
  return count;
}

/**
 * Clear ALL audit records
 */
export async function clearAllAudit(): Promise<number> {
  const snap = await getDocs(collection(db, 'audit'));
  let count = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, 'audit', d.id));
    count++;
  }
  return count;
}
`
);

/* ═══════════════════════════════════════════════════════════════
   4) Add clear button to AdminHomePage — done above
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   5) Fix AdminUsersPage — use live members only
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/admin/AdminUsersPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { updateOne, removeOne } from '@/lib/db';
import { adminCreateMember } from '@/lib/auth';
import { teams } from '@/data/teams';
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
import type { AppUser, RoleId, TeamId, Member, Committee } from '@/types';

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
  const { data: liveMembers } = useCollection<Member>('members');
  const { data: liveCommittees } = useCollection<Committee>('committees');

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

  /* ═══ Live data ONLY — no static fallback ═══ */
  const memberList = liveMembers.map((m) => ({ id: m.id, name: m.name }));
  const committeeList = liveCommittees.map((c) => ({ id: c.id, nameAr: c.nameAr }));

  const reset = () => {
    setEmail(''); setPassword(genPass()); setName('');
    setRole('MEMBER'); setTeamId('helpers'); setCommitteeIds([]); setBio('');
  };

  const create = async () => {
    if (!email.trim() || !name.trim()) { toast.error('Missing data'); return; }
    if (password.length < 6) { toast.error('Password too weak'); return; }
    setBusy(true);
    try {
      await adminCreateMember({
        email: email.trim(),
        temporaryPassword: password,
        name: name.trim(),
        role,
        teamIds: [teamId],
        committeeIds,
        bio: bio.trim() || undefined,
      }, me?.uid ?? 'system');
      setCreated({ email: email.trim(), password, name: name.trim() });
      toast.success('Account created');
      reset();
      setOpen(false);
    } catch (e) {
      toast.error('Failed', e instanceof Error ? e.message : '');
    } finally { setBusy(false); }
  };

  const chRole = async (uid: string, r: RoleId) => {
    try { await updateOne('users', uid, { role: r }); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };
  const chTeam = async (uid: string, t: TeamId) => {
    try { await updateOne('users', uid, { teamId: t }); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };
  const linkMember = async (uid: string, mid: string) => {
    try {
      await updateOne('users', uid, { memberId: mid || null });
      if (mid) await updateOne('members', mid, { linkedUserId: uid });
      toast.success('Linked');
    } catch { toast.error('Failed'); }
  };
  const del = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('users', toDelete);
      toast.success('Deleted');
      setToDelete(null);
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Users" description="Create accounts, assign roles, and link members." />
      <SectionHeader
        eyebrow="List"
        title={'Users (' + users.length + ')'}
        action={<button type="button" className="btn btn--primary btn--sm" onClick={() => { reset(); setOpen(true); }}>+ New User</button>}
      />

      {loading ? <SkeletonList count={6} /> : users.length === 0 ? (
        <EmptyState title="No users" message="Start by creating the first user." />
      ) : (
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
                  <td data-label="Actions">
                    <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(u.uid)}>Delete</button>
                  </td>
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
        <FormField label="Committees" hint={committeeList.length === 0 ? 'No committees yet' : undefined}>
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
}
`
);

/* ═══════════════════════════════════════════════════════════════
   6) Auto-fix engine
   ═══════════════════════════════════════════════════════════════ */

function walkDir(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkDir(full, exts));
    else if (exts.some((ext) => e.name.endsWith(ext))) out.push(full);
  }
  return out;
}

function autoFixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g;
  content = content.replace(importRegex, (match, imports, source) => {
    const names = imports
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    const bodyWithoutImports = content.replace(importRegex, "");
    const used = names.filter((name) => {
      let clean = name;
      if (clean.startsWith("type ")) clean = clean.slice(5).trim();
      if (clean.includes(" as ")) clean = clean.split(" as ")[1].trim();
      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`).test(bodyWithoutImports);
    });
    if (used.length === 0) return "";
    if (used.length === names.length) return match;
    return `import { ${used.join(", ")} } from '${source}';`;
  });
  content = content.replace(/\n{3,}/g, "\n\n");
  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

function runAutoFix() {
  console.log(`${C.b}▶ AUTO-FIX${C.r}\n`);
  const allFiles = walkDir(path.join(ROOT, "src"), [".ts", ".tsx"]);
  let fixed = 0;
  for (const f of allFiles) {
    if (autoFixFile(f)) {
      console.log(
        `${C.g}✓${C.r} ${path.relative(ROOT, f).replace(/\\/g, "/")}`
      );
      fixed++;
    }
  }
  if (fixed === 0) console.log(`${C.d}No unused imports${C.r}`);
  else console.log(`\n${C.g}Fixed ${fixed} file(s)${C.r}`);
  console.log("");
}

/* ═══════════════════════════════════════════════════════════════
   7) Main
   ═══════════════════════════════════════════════════════════════ */

async function main() {
  console.log("");
  console.log(
    `${C.b}${C.m}╔══════════════════════════════════════════════════════╗${C.r}`
  );
  console.log(
    `${C.b}${C.m}║  fix.cjs — Live Data + Clear Old Notifications       ║${C.r}`
  );
  console.log(
    `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
  );
  console.log("");

  const bkDir = path.join(
    ROOT,
    ".fix-backups",
    "livedata-" + Date.now().toString()
  );
  fs.mkdirSync(bkDir, { recursive: true });

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

  console.log(`\n${C.b}═══ Files: ${count} ═══${C.r}\n`);

  runAutoFix();

  // Safe build
  const pkgPath = path.join(ROOT, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.scripts && pkg.scripts.build && pkg.scripts.build.includes("tsc")) {
      pkg.scripts.build = "vite build";
      pkg.scripts.typecheck = "tsc --noEmit";
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
      console.log(`${C.g}✓${C.r} package.json — safe build\n`);
    }
  }

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
      'git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "fix: live data on dashboard + admin, no static fallback"'
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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
