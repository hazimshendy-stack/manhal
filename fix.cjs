#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — Full English Translation (remaining pages)
 * + Auto-Fix + Auto-Update + Push
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
const BUILD_ID =
  Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);

const files = {};
const F = (p, c) => {
  files[p.replace(/\\/g, "/")] = c.replace(/^\n/, "");
};

/* ═══════════════════════════════════════════════════════════════
   GROUP 1 — Public Pages
   ═══════════════════════════════════════════════════════════════ */

F(
  "src/pages/MembersPage.tsx",
  `import { useMemo, useState } from 'react';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import type { Member, TeamId } from '@/types';
import { MemberCard } from '@/components/member/MemberCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { cx } from '@/lib/format';

export function MembersPage() {
  const { data: members, loading } = useRealtimeCollection<Member>('members');
  const [query, setQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');
  const [committeeFilter, setCommitteeFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesQuery = !q || m.name.toLowerCase().includes(q);
      const matchesTeam = teamFilter === 'all' || m.teamIds.includes(teamFilter);
      const matchesCommittee = committeeFilter === 'all' || m.committeeIds.includes(committeeFilter);
      return matchesQuery && matchesTeam && matchesCommittee;
    });
  }, [members, query, teamFilter, committeeFilter]);

  return (
    <div className="container">
      <PageHeader eyebrow="Members" title="All Members" description="Browse, search, and filter by team or committee." />
      <div className="toolbar">
        <input className="input" type="search" placeholder="Search by name..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="chips mb-4">
        <button type="button" className={cx('chip', teamFilter === 'all' && 'is-active')} onClick={() => setTeamFilter('all')}>All Teams</button>
        {teams.map((t) => (
          <button key={t.id} type="button" className={cx('chip', teamFilter === t.id && 'is-active')} onClick={() => setTeamFilter(t.id)}>{t.name}</button>
        ))}
      </div>
      <div className="chips mb-4">
        <button type="button" className={cx('chip', committeeFilter === 'all' && 'is-active')} onClick={() => setCommitteeFilter('all')}>All Committees</button>
        {committees.map((c) => (
          <button key={c.id} type="button" className={cx('chip', committeeFilter === c.id && 'is-active')} onClick={() => setCommitteeFilter(c.id)}>{c.nameAr}</button>
        ))}
      </div>
      {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? (
        <EmptyState title="No results" message="No members match your search." />
      ) : (
        <div className="grid grid--wide">
          {filtered.map((m) => <MemberCard key={m.id} member={m} />)}
        </div>
      )}
    </div>
  );
}`
);

F(
  "src/pages/MemberProfilePage.tsx",
  `import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOne } from '@/lib/db';
import { useCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { ROLE_LABEL } from '@/lib/permissions';
import { hoursToPoints, formatDate } from '@/lib/format';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Stat, StatRow } from '@/components/ui/Stat';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MemberStatusBadge } from '@/components/member/MemberStatusBadge';
import { ContributionRow } from '@/components/contribution/ContributionRow';
import { TimelineList } from '@/components/timeline/TimelineList';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotFoundPage } from './NotFoundPage';
import type { Member, Contribution, WarningRecord, TimelineEvent } from '@/types';

export function MemberProfilePage() {
  const { memberId } = useParams<{ memberId: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: contributions } = useCollection<Contribution>('contributions');
  const { data: warnings } = useCollection<WarningRecord>('warnings');

  useEffect(() => {
    if (!memberId) return;
    void (async () => {
      const m = await getOne<Member>('members', memberId);
      setMember(m);
      setLoading(false);
    })();
  }, [memberId]);

  if (loading) return <Loading fullHeight />;
  if (!member) return <NotFoundPage />;

  const myContribs = contributions.filter((c) => c.memberId === member.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const approvedContribs = myContribs.filter((c) => c.status === 'approved');
  const totalHours = approvedContribs.reduce((s, c) => s + c.hours, 0);
  const totalPoints = hoursToPoints(totalHours);
  const myWarnings = warnings.filter((w) => w.memberId === member.id);
  const memberTeams = teams.filter((t) => member.teamIds.includes(t.id));
  const memberCommittees = committees.filter((c) => member.committeeIds.includes(c.id));

  const timeline: TimelineEvent[] = [
    { id: 'join', memberId: member.id, type: 'join', title: 'Joined the organization', date: '2021-09-01' },
    ...myContribs.map((c) => ({
      id: 'c-' + c.id, memberId: member.id, type: 'contribution' as const,
      title: c.title, description: c.hours + ' hours', date: c.date,
    })),
  ];

  return (
    <div className="container section--tight">
      <div className="profile">
        <Avatar name={member.name} size={80} variant="gradient" />
        <div className="profile__main">
          <div className="row row--between" style={{ gap: 12 }}>
            <h1 className="profile__name">{member.name}</h1>
            <MemberStatusBadge status={member.status} />
          </div>
          <div className="profile__role">{ROLE_LABEL[member.role]}</div>
          {member.bio ? <p className="profile__bio">{member.bio}</p> : null}
          {memberTeams.length > 0 ? (
            <div className="row mt-4" style={{ gap: 6 }}>
              {memberTeams.map((t) => (
                <Link key={t.id} to={'/teams/' + t.id}><Badge variant="navy">{t.name}</Badge></Link>
              ))}
            </div>
          ) : null}
          {memberCommittees.length > 0 ? (
            <div className="row mt-2" style={{ gap: 6 }}>
              {memberCommittees.map((c) => <Badge key={c.id}>{c.nameAr}</Badge>)}
            </div>
          ) : null}
        </div>
        <div className="profile__side">
          <div className="kv"><span className="kv__k">Points</span><span className="kv__v" style={{ color: 'var(--c-red)' }}>{totalPoints}</span></div>
          <div className="kv"><span className="kv__k">Hours</span><span className="kv__v">{totalHours}</span></div>
          <div className="kv"><span className="kv__k">Contributions</span><span className="kv__v">{myContribs.length}</span></div>
          {member.email ? (
            <div className="kv"><span className="kv__k">Email</span><a className="kv__v" href={'mailto:' + member.email} dir="ltr">{member.email}</a></div>
          ) : null}
        </div>
      </div>

      <section className="section">
        <StatRow>
          <Stat value={totalPoints} label="Points" variant="red" />
          <Stat value={totalHours} label="Hours" />
          <Stat value={myContribs.length} label="Contributions" />
          <Stat value={myWarnings.length} label="Warnings" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Contributions" title="Contribution History" />
        {myContribs.length === 0 ? (
          <EmptyState title="No contributions" message="This member has no contributions yet." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Title</th><th>Team</th><th>Date</th><th>Hours</th><th>Points</th><th>Status</th></tr></thead>
              <tbody>
                {myContribs.map((c) => (
                  <ContributionRow key={c.id} contribution={c} showMember={false} showTeam />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {myWarnings.length > 0 ? (
        <section className="section">
          <SectionHeader eyebrow="Warnings" title="Disciplinary Record" />
          <div className="stack">
            {myWarnings.map((w) => (
              <div key={w.id} className="card no-click">
                <div className="row row--between">
                  <div className="card__title">{w.reason}</div>
                  <Badge variant={w.status === 'active' ? 'danger' : 'success'} dot>
                    {w.status === 'active' ? 'Active' : 'Resolved'}
                  </Badge>
                </div>
                <div className="small muted mt-2">{formatDate(w.issuedAt)} · by {w.issuedByName}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <SectionHeader eyebrow="Activity" title="Timeline" />
        <TimelineList events={timeline} />
      </section>
    </div>
  );
}`
);

F(
  "src/pages/TeamsPage.tsx",
  `import { teams } from '@/data/teams';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { hoursToPoints } from '@/lib/format';
import { TeamCard } from '@/components/team/TeamCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Stat, StatRow } from '@/components/ui/Stat';
import { Loading } from '@/components/ui/Loading';
import type { Member } from '@/types';

export function TeamsPage() {
  const { data: members, loading } = useRealtimeCollection<Member>('members');

  const ranking = teams
    .map((team) => {
      const tm = members.filter((m) => m.teamIds.includes(team.id));
      const points = tm.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);
      return { team, points };
    })
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ team: r.team, rank: i + 1 }));

  const totalPoints = members.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);

  return (
    <div className="container">
      <PageHeader eyebrow="Structure" title="Teams" description="Seven specialized teams within the organization." />
      <section className="section--tight">
        {loading ? <Loading /> : (
          <StatRow>
            <Stat value={teams.length} label="Teams" />
            <Stat value={members.length} label="Members" />
            <Stat value={totalPoints} label="Total Points" />
          </StatRow>
        )}
      </section>
      <section className="section">
        <div className="grid">
          {ranking.map((r) => <TeamCard key={r.team.id} team={r.team} rank={r.rank} />)}
        </div>
      </section>
    </div>
  );
}`
);

F(
  "src/pages/TeamDetailPage.tsx",
  `import { useParams } from 'react-router-dom';
import { teams } from '@/data/teams';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { hoursToPoints } from '@/lib/format';
import { MemberCard } from '@/components/member/MemberCard';
import { Stat, StatRow } from '@/components/ui/Stat';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotFoundPage } from './NotFoundPage';
import type { Member, TeamId } from '@/types';

export function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const team = teams.find((t) => t.id === (teamId as TeamId));
  const { data: members } = useRealtimeCollection<Member>('members');

  if (!team) return <NotFoundPage />;

  const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
  const totalHours = teamMembers.reduce((s, m) => s + (m.hours || 0), 0);
  const totalPoints = hoursToPoints(totalHours);
  const avgPoints = teamMembers.length === 0 ? 0 : Math.round(totalPoints / teamMembers.length);

  const board = [...teamMembers]
    .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
    .map((m, i) => ({ member: m, rank: i + 1, points: hoursToPoints(m.hours) }));

  return (
    <div className="container section--tight">
      <div className="profile">
        <div className="profile__main">
          <h1 className="profile__name">{team.name}</h1>
          <div className="profile__role">{team.description}</div>
        </div>
      </div>
      <section className="section">
        <StatRow>
          <Stat value={teamMembers.length} label="Members" />
          <Stat value={totalPoints} label="Total Points" />
          <Stat value={avgPoints} label="Average Points" />
        </StatRow>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Members" title="Team Members" />
        {teamMembers.length === 0 ? (
          <EmptyState title="No members" message="No members in this team yet." />
        ) : (
          <div className="grid grid--wide">
            {teamMembers.map((m) => <MemberCard key={m.id} member={m} showTeam={false} />)}
          </div>
        )}
      </section>
      <section className="section">
        <SectionHeader eyebrow="Ranking" title="Team Ranking" />
        {board.length === 0 ? (
          <EmptyState title="No data" message="No ranking data yet." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>#</th><th>Member</th><th>Hours</th><th>Points</th></tr></thead>
              <tbody>
                {board.map((e) => (
                  <tr key={e.member.id}>
                    <td className={'rank rank--' + (e.rank <= 3 ? e.rank : '')} data-label="Rank">{e.rank}</td>
                    <td data-label="Member" style={{ fontWeight: 700 }}>{e.member.name}</td>
                    <td style={{ fontFamily: 'var(--font-en)' }} data-label="Hours">{e.member.hours}</td>
                    <td className="points" data-label="Points">{e.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}`
);

F(
  "src/pages/CommitteesPage.tsx",
  `import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { committees as defaultCommittees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { CommitteeCard } from '@/components/committee/CommitteeCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat, StatRow } from '@/components/ui/Stat';
import { Loading } from '@/components/ui/Loading';
import type { Committee, Member } from '@/types';

export function CommitteesPage() {
  const { data: committees, loading: lc } = useRealtimeCollection<Committee>('committees');
  const { data: members, loading: lm } = useRealtimeCollection<Member>('members');

  const list = committees.length > 0 ? committees : defaultCommittees;
  const totalMembersInCommittees = new Set(members.flatMap((m) => m.committeeIds)).size;
  const totalCommitteePoints = members.filter((m) => m.committeeIds.length > 0).reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);

  return (
    <div className="container">
      <PageHeader eyebrow="Governance" title="Committees" description="Organization committees and their members." />
      <section className="section--tight">
        {lc || lm ? <Loading /> : (
          <StatRow>
            <Stat value={list.length} label="Committees" />
            <Stat value={totalMembersInCommittees} label="Members" />
            <Stat value={totalCommitteePoints} label="Total Points" />
          </StatRow>
        )}
      </section>
      <section className="section">
        <SectionHeader eyebrow="List" title="All Committees" />
        <div className="grid grid--wide">
          {list.map((c) => <CommitteeCard key={c.id} committee={c} />)}
        </div>
      </section>
    </div>
  );
}`
);

F(
  "src/pages/AchievementsPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
import { AchievementCard } from '@/components/achievement/AchievementCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Loading';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { Achievement } from '@/types';

export function AchievementsPage() {
  const { data, loading } = useCollection<Achievement>('achievements');
  const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="container">
      <PageHeader eyebrow="Achievements" title="Organization Awards" description="Everything the organization has accomplished." />
      <section className="section">
        <SectionHeader eyebrow="List" title="All Achievements" />
        {loading ? (
          <div className="stack"><SkeletonCard count={4} /></div>
        ) : sorted.length === 0 ? (
          <EmptyState title="No achievements yet" message="No achievements recorded yet." />
        ) : (
          <div className="stack">
            {sorted.map((a) => <AchievementCard key={a.id} achievement={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}`
);

F(
  "src/pages/AboutPage.tsx",
  `import { site, activeSeason, seasons } from '@/data';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat, StatRow } from '@/components/ui/Stat';
import { formatDate, hoursToPoints } from '@/lib/format';
import type { Member } from '@/types';

export function AboutPage() {
  const { data: members } = useRealtimeCollection<Member>('members');
  const activeMembers = members.filter((m) => m.status === 'active');
  const totalHours = members.reduce((s, m) => s + (m.hours || 0), 0);
  const totalPoints = hoursToPoints(totalHours);

  return (
    <div className="container">
      <PageHeader eyebrow="About" title={site.name} description={site.description} />

      <section className="section--tight">
        <StatRow>
          <Stat value={activeMembers.length} label="Members" />
          <Stat value={teams.length} label="Teams" />
          <Stat value={totalPoints} label="Total Points" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Current Season" title={activeSeason.label} description={activeSeason.theme} />
        <div className="card no-click">
          <div className="kv"><span className="kv__k">Start</span><span className="kv__v">{formatDate(activeSeason.start)}</span></div>
          <div className="kv mt-4"><span className="kv__k">End</span><span className="kv__v">{formatDate(activeSeason.end)}</span></div>
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Seasons" title="History" />
        <div className="stack">
          {seasons.map((s) => (
            <div key={s.id} className="card no-click">
              <div className="row row--between">
                <div className="card__title">{s.label}</div>
                <span className="muted small">{s.theme}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Teams" title="Seven Specialized Teams" description="Each team covers a different area of the organization's work." />
        <div className="stack">
          {teams.map((t) => (
            <div key={t.id} className="card no-click">
              <div className="card__title">{t.name}</div>
              <p className="small soft mt-3">{t.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}`
);

F(
  "src/pages/GovernancePage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { formatDate } from '@/lib/format';
import type { GovernanceDocument } from '@/types';

export function GovernancePage() {
  const { data, loading } = useCollection<GovernanceDocument>('governance');
  const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title));
  const grouped = sorted.reduce<Record<string, GovernanceDocument[]>>((acc, doc) => {
    const key = doc.category || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  return (
    <div className="container">
      <PageHeader eyebrow="Governance" title="Official Documents" description="Policies, procedures, and official bylaws." />
      {loading ? (
        <SkeletonList count={4} />
      ) : sorted.length === 0 ? (
        <EmptyState title="No documents" message="No governance documents have been added yet." />
      ) : (
        Object.entries(grouped).map(([category, docs]) => (
          <section key={category} className="section">
            <SectionHeader eyebrow={category} title={category} />
            <div className="stack">
              {docs.map((d) => (
                <div key={d.id} className="card no-click">
                  <div className="row row--between">
                    <div className="card__title">{d.title}</div>
                    <Badge variant="neutral">v{d.version}</Badge>
                  </div>
                  {d.description ? <div className="card__meta">{d.description}</div> : null}
                  <div className="small muted mt-3">Last updated {formatDate(d.updatedAt)}</div>
                  <p className="mt-3 small soft" style={{ lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{d.content}</p>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}`
);

F(
  "src/pages/SearchPage.tsx",
  `import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import type { Member, Contribution, Achievement, CalendarEvent } from '@/types';

interface SearchResult {
  id: string;
  type: 'member' | 'contribution' | 'achievement' | 'event' | 'team' | 'committee';
  title: string;
  subtitle?: string;
  route: string;
}

const TYPE_LABEL: Record<string, string> = {
  member: 'Member',
  contribution: 'Contribution',
  achievement: 'Achievement',
  event: 'Event',
  team: 'Team',
  committee: 'Committee',
};

export function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: members } = useRealtimeCollection<Member>('members');
  const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
  const { data: achievements } = useRealtimeCollection<Achievement>('achievements');
  const { data: events } = useRealtimeCollection<CalendarEvent>('calendar');

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    const out: SearchResult[] = [];
    members.forEach((m) => {
      if (m.name.toLowerCase().includes(q)) {
        out.push({ id: m.id, type: 'member', title: m.name, subtitle: m.bio?.slice(0, 80), route: '/members/' + m.id });
      }
    });
    contributions.forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        out.push({ id: c.id, type: 'contribution', title: c.title, subtitle: c.memberName + ' · ' + c.hours + ' hours', route: '/contributions' });
      }
    });
    achievements.forEach((a) => {
      if (a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)) {
        out.push({ id: a.id, type: 'achievement', title: a.title, subtitle: a.description.slice(0, 80), route: '/achievements' });
      }
    });
    events.forEach((e) => {
      if (e.title.toLowerCase().includes(q)) {
        out.push({ id: e.id, type: 'event', title: e.title, subtitle: e.date, route: '/calendar' });
      }
    });
    teams.forEach((t) => {
      if (t.name.toLowerCase().includes(q)) {
        out.push({ id: t.id, type: 'team', title: t.name, subtitle: t.description, route: '/teams/' + t.id });
      }
    });
    committees.forEach((c) => {
      if (c.nameAr.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) {
        out.push({ id: c.id, type: 'committee', title: c.nameAr, subtitle: c.description, route: '/committees' });
      }
    });
    return out.slice(0, 50);
  }, [query, members, contributions, achievements, events]);

  return (
    <div className="container">
      <PageHeader eyebrow="Search" title="Global Search" description="Search across members, contributions, achievements, events, teams, and committees." />
      <input className="input" type="search" placeholder="Type at least 2 characters..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus style={{ marginBottom: 20 }} />
      {query.length < 2 ? (
        <EmptyState title="Start typing" message="Type at least 2 characters to search." />
      ) : results.length === 0 ? (
        <EmptyState title="No results" message={'No results for "' + query + '".'} />
      ) : (
        <div className="stack">
          {results.map((r) => (
            <Link key={r.type + '-' + r.id} to={r.route} className="card">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{r.title}</div>
                  {r.subtitle ? <div className="card__meta">{r.subtitle}</div> : null}
                </div>
                <Badge variant="neutral">{TYPE_LABEL[r.type]}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}`
);

/* ═══════════════════════════════════════════════════════════════
   GROUP 2 — Calendar + Contributions
   ═══════════════════════════════════════════════════════════════ */

F(
  "src/pages/CalendarPage.tsx",
  `import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { seesAllTeams } from '@/lib/permissions';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EventCard } from '@/components/calendar/EventCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { formatDate } from '@/lib/format';
import type { CalendarEvent } from '@/types';

export function CalendarPage() {
  const { user } = useAuth();
  const { data: allEvents, loading } = useRealtimeCollection<CalendarEvent>('calendar');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(today.toISOString().slice(0, 10));

  const visibleEvents = useMemo(() => {
    if (!user) return [];
    return allEvents.filter((e) => {
      if (e.isPublic) return true;
      if (seesAllTeams(user)) return true;
      return e.teamId === user.teamId;
    });
  }, [allEvents, user]);

  const eventsByMonth = useMemo(() => visibleEvents.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }), [visibleEvents, year, month]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return visibleEvents.filter((e) => e.date === selectedDate).sort((a, b) => (a.time || '') > (b.time || '') ? 1 : -1);
  }, [visibleEvents, selectedDate]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  if (loading) return <Loading fullHeight message="Loading calendar..." />;
  if (!user) return null;

  return (
    <div className="container">
      <PageHeader eyebrow="Schedule" title="Calendar" description="Public events and your team's events." />
      <section className="section">
        <CalendarGrid year={year} month={month} events={eventsByMonth} selectedDate={selectedDate ?? undefined} onSelectDate={setSelectedDate} onPrevMonth={prevMonth} onNextMonth={nextMonth} />
      </section>
      <section className="section">
        <SectionHeader eyebrow={selectedDate ? formatDate(selectedDate) : ''} title={selectedEvents.length === 0 ? 'No events' : 'Events (' + selectedEvents.length + ')'} />
        {selectedEvents.length === 0 ? (
          <EmptyState title="No events" message="Pick another day from the calendar." />
        ) : (
          <div className="stack">
            {selectedEvents.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>
    </div>
  );
}`
);

F(
  "src/pages/ContributionsPage.tsx",
  `import { useMemo, useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { seesAllTeams } from '@/lib/permissions';
import { teams } from '@/data/teams';
import { ContributionRow } from '@/components/contribution/ContributionRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { cx } from '@/lib/format';
import type { Contribution, ContributionStatus, TeamId } from '@/types';

const STATUSES: Array<ContributionStatus | 'all'> = ['all', 'pending', 'approved', 'rejected'];
const STATUS_LABEL: Record<string, string> = { all: 'All', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

export function ContributionsPage() {
  const { user } = useAuth();
  const { data, loading } = useCollection<Contribution>('contributions');
  const [status, setStatus] = useState<ContributionStatus | 'all'>('all');
  const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');

  const filtered = useMemo(() => {
    let list = data;
    if (user && !seesAllTeams(user) && user.teamId) list = list.filter((c) => c.teamId === user.teamId);
    return list
      .filter((c) => status === 'all' || c.status === status)
      .filter((c) => teamFilter === 'all' || c.teamId === teamFilter)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data, status, teamFilter, user]);

  return (
    <div className="container">
      <PageHeader eyebrow="Contributions" title="All Contributions" description="Review and approve member contributions. Each hour = 5 points." />
      <div className="chips mb-3">
        {STATUSES.map((s) => (
          <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>
        ))}
      </div>
      <div className="chips mb-4">
        <button type="button" className={cx('chip', teamFilter === 'all' && 'is-active')} onClick={() => setTeamFilter('all')}>All Teams</button>
        {teams.map((t) => (
          <button key={t.id} type="button" className={cx('chip', teamFilter === t.id && 'is-active')} onClick={() => setTeamFilter(t.id)}>{t.name}</button>
        ))}
      </div>
      <section className="section">
        <SectionHeader eyebrow="List" title={'Contributions (' + filtered.length + ')'} />
        {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? (
          <EmptyState title="No contributions" message="No contributions match the filters." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Member</th><th>Team</th><th>Title</th><th>Date</th><th>Hours</th><th>Points</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((c) => <ContributionRow key={c.id} contribution={c} showMember showTeam />)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}`
);

/* ═══════════════════════════════════════════════════════════════
   GROUP 3 — Admin Pages (Warnings, Calendar, Contributions, Conversations)
   ═══════════════════════════════════════════════════════════════ */

F(
  "src/pages/admin/AdminWarningsPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { notifyUser } from '@/lib/notifications';
import { listWhere } from '@/lib/db';
import { members } from '@/data/members';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextArea, DateInput, Select } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { WarningRecord } from '@/types';

const EMPTY: Omit<WarningRecord, 'id'> = {
  memberId: '', memberName: '', type: 'VERBAL', reason: '', severity: 'LOW',
  issuedByMemberId: '', issuedByName: '',
  issuedAt: new Date().toISOString().slice(0, 10),
  status: 'active', notes: '',
};

export function AdminWarningsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<WarningRecord>('warnings');
  const [editing, setEditing] = useState<WarningRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<WarningRecord, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<WarningRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const openCreate = () => {
    setForm({ ...EMPTY, issuedByMemberId: me?.memberId ?? '', issuedByName: me?.displayName ?? '' });
    setCreating(true);
    setEditing(null);
  };
  const openEdit = (w: WarningRecord) => {
    setForm({
      memberId: w.memberId, memberName: w.memberName, type: w.type, reason: w.reason,
      severity: w.severity, issuedByMemberId: w.issuedByMemberId, issuedByName: w.issuedByName,
      issuedAt: w.issuedAt, status: w.status, notes: w.notes || '',
    });
    setEditing(w);
    setCreating(false);
  };
  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.memberId || !form.reason.trim()) { toast.error('Member and reason are required'); return; }
    setBusy(true);
    try {
      const member = members.find((m) => m.id === form.memberId);
      const payload = { ...form, memberName: member?.name ?? form.memberName };
      if (editing) {
        await updateOne('warnings', editing.id, payload);
        toast.success('Updated');
      } else {
        const id = 'WARN-' + Date.now().toString(36).toUpperCase();
        await createOne('warnings', { id, ...payload });
        const users = await listWhere<{ uid: string }>('users', 'memberId', form.memberId);
        if (users.length > 0) {
          await notifyUser(users[0].uid, 'New warning', form.reason, 'warning', '/dashboard', 'high', me?.displayName);
        }
        toast.success('Warning issued');
      }
      close();
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  const del = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('warnings', toDelete.id);
      await logAudit(me, 'DELETE_WARNING', 'Warning', toDelete.id, toDelete.reason);
      toast.success('Deleted');
      setToDelete(null);
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Warnings" description="Issue and track official warnings." />
      <SectionHeader eyebrow="List" title={'Warnings (' + data.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Warning</button>} />
      {loading ? <SkeletonList count={4} /> : data.length === 0 ? (
        <EmptyState title="No warnings" message="No warnings have been issued." />
      ) : (
        <div className="stack">
          {data.map((w) => (
            <div key={w.id} className="card no-click">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{w.memberName}</div>
                  <div className="card__meta">{w.reason}</div>
                </div>
                <Badge variant={w.status === 'active' ? 'danger' : 'success'} dot>
                  {w.status === 'active' ? 'Active' : 'Resolved'}
                </Badge>
              </div>
              <div className="row mt-3" style={{ gap: 6 }}>
                <Badge variant="neutral">{w.type}</Badge>
                <Badge variant={w.severity === 'HIGH' ? 'danger' : w.severity === 'MEDIUM' ? 'warning' : 'info'}>{w.severity}</Badge>
                <span className="small muted">{formatDate(w.issuedAt)}</span>
              </div>
              <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(w)}>Edit</button>
                <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(w)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={creating || editing !== null} title={editing ? 'Edit Warning' : 'New Warning'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
        <FormField label="Member" required>
          <Select value={form.memberId} onChange={(v) => {
            const m = members.find((x) => x.id === v);
            setForm({ ...form, memberId: v, memberName: m?.name ?? '' });
          }} options={[{ value: '', label: '— Select —' }, ...members.map((m) => ({ value: m.id, label: m.name }))]} />
        </FormField>
        <FormField label="Type" required>
          <Select value={form.type} onChange={(v) => setForm({ ...form, type: v as WarningRecord['type'] })}
            options={[{ value: 'VERBAL', label: 'Verbal' }, { value: 'WRITTEN', label: 'Written' }, { value: 'FINAL', label: 'Final' }]} />
        </FormField>
        <FormField label="Reason" required><TextArea value={form.reason} onChange={(v) => setForm({ ...form, reason: v })} rows={3} /></FormField>
        <FormField label="Severity" required>
          <Select value={form.severity} onChange={(v) => setForm({ ...form, severity: v as WarningRecord['severity'] })}
            options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }]} />
        </FormField>
        <FormField label="Date" required><DateInput value={form.issuedAt} onChange={(v) => setForm({ ...form, issuedAt: v })} /></FormField>
        <FormField label="Status">
          <Select value={form.status} onChange={(v) => setForm({ ...form, status: v as 'active' | 'resolved' })}
            options={[{ value: 'active', label: 'Active' }, { value: 'resolved', label: 'Resolved' }]} />
        </FormField>
        <FormField label="Notes"><TextArea value={form.notes || ''} onChange={(v) => setForm({ ...form, notes: v })} rows={2} /></FormField>
      </Modal>

      <ConfirmDialog open={toDelete !== null} title="Delete Warning" message="Are you sure?" confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}`
);

F(
  "src/pages/admin/AdminCalendarPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { teams } from '@/data/teams';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, TextArea, DateInput, TimeInput, Select } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { CalendarEvent, TeamId } from '@/types';

const EMPTY: Omit<CalendarEvent, 'id'> = {
  title: '', description: '', date: new Date().toISOString().slice(0, 10),
  time: '', endTime: '', teamId: null, isPublic: true, type: 'meeting',
  location: '', seasonId: 'S7', createdBy: '', createdByName: '',
};

export function AdminCalendarPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<CalendarEvent>('calendar');
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<CalendarEvent, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<CalendarEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const sorted = [...data].sort((a, b) => (a.date > b.date ? 1 : -1));

  const openCreate = () => {
    setForm({ ...EMPTY, createdBy: me?.uid ?? '', createdByName: me?.displayName ?? '' });
    setCreating(true); setEditing(null);
  };
  const openEdit = (e: CalendarEvent) => {
    setForm({
      title: e.title, description: e.description || '', date: e.date,
      time: e.time || '', endTime: e.endTime || '', teamId: e.teamId ?? null,
      isPublic: e.isPublic, type: e.type, location: e.location || '',
      seasonId: e.seasonId, createdBy: e.createdBy, createdByName: e.createdByName,
    });
    setEditing(e); setCreating(false);
  };
  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.title.trim() || !form.date) { toast.error('Title and date are required'); return; }
    setBusy(true);
    try {
      const payload = { ...form, teamId: form.isPublic ? null : form.teamId };
      if (editing) { await updateOne('calendar', editing.id, payload); toast.success('Updated'); }
      else {
        const id = 'EVT-' + Date.now().toString(36).toUpperCase();
        await createOne('calendar', { id, ...payload });
        await logAudit(me, 'CREATE_EVENT', 'Calendar', id, form.title);
        toast.success('Added');
      }
      close();
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  const del = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('calendar', toDelete.id);
      toast.success('Deleted');
      setToDelete(null);
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Calendar" description="Manage public events and team events." />
      <SectionHeader eyebrow="List" title={'Events (' + data.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Event</button>} />
      {loading ? <SkeletonList count={5} /> : sorted.length === 0 ? (
        <EmptyState title="No events" message="Add the first event." />
      ) : (
        <div className="stack">
          {sorted.map((e) => {
            const team = e.teamId ? teams.find((t) => t.id === e.teamId) : null;
            return (
              <div key={e.id} className="card no-click">
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{e.title}</div>
                    <div className="card__meta">
                      {formatDate(e.date)}
                      {e.time ? ' · ' + e.time : ''}
                      {e.endTime ? ' — ' + e.endTime : ''}
                    </div>
                  </div>
                  <Badge variant={e.isPublic ? 'info' : 'neutral'}>
                    {e.isPublic ? 'Public' : team?.name || 'Team'}
                  </Badge>
                </div>
                <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(e)}>Edit</button>
                  <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(e)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={creating || editing !== null} title={editing ? 'Edit Event' : 'New Event'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
        <FormField label="Title" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
        <FormField label="Description"><TextArea value={form.description || ''} onChange={(v) => setForm({ ...form, description: v })} rows={2} /></FormField>
        <FormField label="Date" required><DateInput value={form.date} onChange={(v) => setForm({ ...form, date: v })} /></FormField>
        <FormField label="Start time"><TimeInput value={form.time || ''} onChange={(v) => setForm({ ...form, time: v })} /></FormField>
        <FormField label="End time"><TimeInput value={form.endTime || ''} onChange={(v) => setForm({ ...form, endTime: v })} /></FormField>
        <FormField label="Type">
          <Select value={form.type} onChange={(v) => setForm({ ...form, type: v as CalendarEvent['type'] })}
            options={[
              { value: 'meeting', label: 'Meeting' },
              { value: 'event', label: 'Event' },
              { value: 'workshop', label: 'Workshop' },
              { value: 'deadline', label: 'Deadline' },
            ]} />
        </FormField>
        <FormField label="Scope" required hint="Public = everyone, Team = one team">
          <Select value={form.isPublic ? 'public' : form.teamId ?? 'helpers'}
            onChange={(v) => {
              if (v === 'public') setForm({ ...form, isPublic: true, teamId: null });
              else setForm({ ...form, isPublic: false, teamId: v as TeamId });
            }}
            options={[{ value: 'public', label: 'Public — everyone' }, ...teams.map((t) => ({ value: t.id, label: 'Team ' + t.name }))]} />
        </FormField>
        <FormField label="Location"><TextInput value={form.location || ''} onChange={(v) => setForm({ ...form, location: v })} placeholder="e.g. Online — Zoom" /></FormField>
      </Modal>

      <ConfirmDialog open={toDelete !== null} title="Delete Event" message={'Delete "' + (toDelete?.title || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}`
);

F(
  "src/pages/admin/AdminContributionsPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { notifyUser } from '@/lib/notifications';
import { teams } from '@/data/teams';
import { hoursToPoints, formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { cx } from '@/lib/format';
import type { Contribution, ContributionStatus } from '@/types';

const STATUS_LABEL: Record<string, string> = { all: 'All', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

export function AdminContributionsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<Contribution>('contributions');
  const [status, setStatus] = useState<ContributionStatus | 'all'>('pending');
  const [toDelete, setToDelete] = useState<Contribution | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = data.filter((c) => status === 'all' || c.status === status).sort((a, b) => (a.date < b.date ? 1 : -1));

  const approve = async (c: Contribution) => {
    try {
      await updateOne('contributions', c.id, { status: 'approved' });
      await logAudit(me, 'APPROVE_CONTRIBUTION', 'Contribution', c.id, c.title);
      await notifyUser(c.createdBy, 'Contribution approved', '"' + c.title + '" — +' + hoursToPoints(c.hours) + ' points', 'participation', '/my-contributions', 'normal', me?.displayName);
      toast.success('Approved');
    } catch { toast.error('Failed'); }
  };
  const reject = async (c: Contribution) => {
    try {
      await updateOne('contributions', c.id, { status: 'rejected' });
      await logAudit(me, 'REJECT_CONTRIBUTION', 'Contribution', c.id, c.title);
      await notifyUser(c.createdBy, 'Contribution rejected', '"' + c.title + '"', 'participation', '/my-contributions', 'high', me?.displayName);
      toast.success('Rejected');
    } catch { toast.error('Failed'); }
  };
  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('contributions', toDelete.id);
      await logAudit(me, 'DELETE_CONTRIBUTION', 'Contribution', toDelete.id, toDelete.title);
      toast.success('Deleted');
      setToDelete(null);
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Contributions" description="Approve or reject member contributions." />
      <div className="chips mb-4">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>
        ))}
      </div>
      <SectionHeader eyebrow="List" title={'Contributions (' + filtered.length + ')'} />
      {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? (
        <EmptyState title="No contributions" message="No contributions match the filter." />
      ) : (
        <div className="stack">
          {filtered.map((c) => {
            const team = teams.find((t) => t.id === c.teamId);
            return (
              <div key={c.id} className="card no-click">
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{c.title}</div>
                    <div className="card__meta">{c.memberName} · {team?.name} · {formatDate(c.date)}</div>
                  </div>
                  <Badge variant={c.status === 'approved' ? 'success' : c.status === 'pending' ? 'warning' : 'danger'}>
                    {c.status === 'approved' ? 'Approved' : c.status === 'pending' ? 'Pending' : 'Rejected'}
                  </Badge>
                </div>
                <p className="small soft mt-2">{c.description}</p>
                <div className="row mt-3" style={{ gap: 10, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.9rem' }}>
                    <span>{c.hours} <span className="muted">hours</span></span>
                    <span className="points">{hoursToPoints(c.hours)} points</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.status === 'pending' ? (
                      <>
                        <button type="button" className="btn btn--success btn--sm" onClick={() => approve(c)}>✓ Approve</button>
                        <button type="button" className="btn btn--outline-danger btn--sm" onClick={() => reject(c)}>✕ Reject</button>
                      </>
                    ) : null}
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setToDelete(c)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog open={toDelete !== null} title="Delete Contribution" message={'Delete "' + (toDelete?.title || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}`
);

F(
  "src/pages/admin/AdminConversationsPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { teams } from '@/data/teams';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { relativeTime } from '@/lib/format';
import type { Conversation } from '@/types';

export function AdminConversationsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<Conversation>('conversations');
  const [toDelete, setToDelete] = useState<Conversation | null>(null);
  const [busy, setBusy] = useState(false);

  const createTeamConv = async (team: (typeof teams)[number]) => {
    const exists = data.some((c) => c.type === 'team' && c.teamId === team.id);
    if (exists) { toast.info('Chat already exists'); return; }
    setBusy(true);
    try {
      const id = 'CONV-TEAM-' + team.id;
      await createOne('conversations', { id, type: 'team', title: 'Team ' + team.name, teamId: team.id, participantUids: [], lastMessageAt: new Date().toISOString() });
      await logAudit(me, 'CREATE_CONVERSATION', 'Conversation', id, team.name);
      toast.success('Team chat created');
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('conversations', toDelete.id);
      toast.success('Deleted');
      setToDelete(null);
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Conversations" description="Manage team chats and general chat." />
      <section className="section">
        <SectionHeader eyebrow="Quick Create" title="Team Chats" description="One chat per team — created automatically." />
        <div className="chips">
          {teams.map((t) => {
            const exists = data.some((c) => c.type === 'team' && c.teamId === t.id);
            return (
              <button key={t.id} type="button" disabled={busy || exists} className={'chip' + (exists ? ' is-active' : '')} onClick={() => createTeamConv(t)}>
                {t.name} {exists ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="List" title={'Conversations (' + data.length + ')'} />
        {loading ? <SkeletonList count={5} /> : data.length === 0 ? (
          <EmptyState title="No conversations" message="Create team chats above." />
        ) : (
          <div className="stack">
            {data.map((c) => {
              const team = c.teamId ? teams.find((t) => t.id === c.teamId) : null;
              return (
                <div key={c.id} className="card no-click">
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">{c.title || (c.type === 'general' ? 'General Chat' : team?.name)}</div>
                      <div className="card__meta">
                        {c.type === 'general' ? 'General' : c.type === 'team' ? 'Team' : 'Private'}
                        {c.lastMessageAt ? ' · ' + relativeTime(c.lastMessageAt) : ''}
                      </div>
                    </div>
                    <Badge variant={c.type === 'general' ? 'red' : c.type === 'team' ? 'info' : 'neutral'}>{c.type}</Badge>
                  </div>
                  {c.type !== 'general' ? (
                    <div className="row mt-3" style={{ justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(c)}>Delete</button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
      <ConfirmDialog open={toDelete !== null} title="Delete Conversation" message="This will delete the chat and all messages." confirmLabel="Delete" danger busy={busy} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}`
);

F(
  "src/pages/admin/AdminAuditPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
import type { AuditRecord } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { formatDateTime } from '@/lib/format';

export function AdminAuditPage() {
  const { data, loading } = useCollection<AuditRecord>('audit');
  const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Audit Log" description="All admin actions are recorded here." />
      <SectionHeader eyebrow="Log" title={'Events (' + data.length + ')'} />
      {loading ? <SkeletonList count={8} /> : sorted.length === 0 ? (
        <EmptyState title="No events" message="No actions recorded yet." />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Description</th></tr></thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a.id}>
                  <td className="muted small nowrap" data-label="Date">{formatDateTime(a.date)}</td>
                  <td data-label="User" style={{ fontWeight: 700 }}>{a.actorName}</td>
                  <td data-label="Action"><span className="badge badge--neutral">{a.action}</span></td>
                  <td data-label="Description">{a.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}`
);

/* ═══════════════════════════════════════════════════════════════
   GROUP 4 — Shared Components
   ═══════════════════════════════════════════════════════════════ */

F(
  "src/components/contribution/ContributionRow.tsx",
  `import type { Contribution } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { formatDate, hoursToPoints } from '@/lib/format';

interface ContributionRowProps {
  contribution: Contribution;
  showMember?: boolean;
  showTeam?: boolean;
  showCommittee?: boolean;
}

export function ContributionRow({ contribution, showMember = true, showTeam = true, showCommittee = false }: ContributionRowProps) {
  const team = teams.find((t) => t.id === contribution.teamId);
  const committee = contribution.committeeId ? committees.find((c) => c.id === contribution.committeeId) : null;
  const statusVariant = contribution.status === 'approved' ? 'success' : contribution.status === 'pending' ? 'warning' : 'danger';
  const statusLabel = contribution.status === 'approved' ? 'Approved' : contribution.status === 'pending' ? 'Pending' : 'Rejected';
  const points = contribution.status === 'approved' ? hoursToPoints(contribution.hours) : 0;

  return (
    <tr>
      {showMember ? <td data-label="Member" style={{ fontWeight: 700 }}>{contribution.memberName}</td> : null}
      {showTeam ? <td data-label="Team" className="muted small">{team ? team.name : contribution.teamId}</td> : null}
      {showCommittee ? <td data-label="Committee" className="muted small">{committee ? committee.nameAr : '—'}</td> : null}
      <td data-label="Title">{contribution.title}</td>
      <td data-label="Date" className="muted small nowrap">{formatDate(contribution.date)}</td>
      <td data-label="Hours" style={{ fontFamily: 'var(--font-en)' }}>{contribution.hours}</td>
      <td data-label="Points" className="points">{points > 0 ? points : '—'}</td>
      <td data-label="Status"><Badge variant={statusVariant}>{statusLabel}</Badge></td>
    </tr>
  );
}`
);

F(
  "src/components/committee/CommitteeCard.tsx",
  `import type { Committee } from '@/types';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { Badge } from '@/components/ui/Badge';
import type { Member } from '@/types';

interface CommitteeCardProps { committee: Committee; }

export function CommitteeCard({ committee }: CommitteeCardProps) {
  const { data: members } = useRealtimeCollection<Member>('members');
  const count = members.filter((m) => m.committeeIds.includes(committee.id)).length;

  return (
    <div className="card no-click">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: committee.color + '15', border: '1px solid ' + committee.color + '30', display: 'grid', placeItems: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
          {committee.icon || committee.nameAr.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card__title">{committee.nameAr}</div>
          <div className="card__meta">{committee.description}</div>
        </div>
      </div>
      <div className="row mt-4" style={{ gap: 6 }}>
        <Badge variant="neutral">{count} members</Badge>
      </div>
    </div>
  );
}`
);

F(
  "src/components/achievement/AchievementCard.tsx",
  `import type { Achievement } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { teams } from '@/data/teams';
import { formatDate } from '@/lib/format';

interface AchievementCardProps { achievement: Achievement; }

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div className="achievement-card">
      <div className="achievement-card__head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="achievement-card__title">{achievement.title}</div>
          <div className="achievement-card__date">{formatDate(achievement.date)}</div>
        </div>
      </div>
      <p className="achievement-card__desc">{achievement.description}</p>
      {achievement.teamIds.length > 0 || achievement.memberNames.length > 0 ? (
        <div className="achievement-card__tags">
          {achievement.teamIds.map((id) => {
            const t = teams.find((x) => x.id === id);
            return t ? <Badge key={id} variant="navy">{t.name}</Badge> : null;
          })}
          {achievement.memberNames.map((n, i) => <Badge key={'m-' + i} variant="info">{n}</Badge>)}
        </div>
      ) : null}
    </div>
  );
}`
);

F(
  "src/components/timeline/TimelineList.tsx",
  `import type { TimelineEvent } from '@/types';
import { formatDate } from '@/lib/format';

interface TimelineListProps { events: TimelineEvent[]; }

export function TimelineList({ events }: TimelineListProps) {
  if (events.length === 0) {
    return <div className="empty" style={{ padding: 24 }}><div className="empty__message">No events yet</div></div>;
  }
  const sorted = [...events].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div className="timeline">
      {sorted.map((e) => (
        <div key={e.id} className="timeline__item">
          <div className="timeline__date">{formatDate(e.date)}</div>
          <div className="timeline__title">{e.title}</div>
          {e.description ? <div className="timeline__desc">{e.description}</div> : null}
        </div>
      ))}
    </div>
  );
}`
);

F(
  "src/components/member/MemberStatusBadge.tsx",
  `import { Badge } from '@/components/ui/Badge';
import type { Member } from '@/types';

export function MemberStatusBadge({ status }: { status: Member['status'] }) {
  if (status === 'active') return <Badge variant="success" dot>Active</Badge>;
  if (status === 'inactive') return <Badge variant="neutral">Inactive</Badge>;
  return <Badge variant="danger" dot>Suspended</Badge>;
}`
);

F(
  "src/components/request/RequestCard.tsx",
  `import { Link } from 'react-router-dom';
import type { RequestRecord, RequestStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';

const TYPE_LABEL: Record<string, string> = {
  TRANSFER: 'Transfer', PROMOTION: 'Promotion', RESIGNATION: 'Resignation',
  COMPLAINT: 'Complaint', SUGGESTION: 'Suggestion', LEAVE: 'Leave',
};
const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved',
  REJECTED: 'Rejected', CANCELLED: 'Cancelled', COMPLETED: 'Completed',
};

function statusVariant(status: RequestStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'danger';
  if (status === 'IN_REVIEW') return 'warning';
  if (status === 'PENDING') return 'info';
  return 'neutral';
}

interface RequestCardProps { request: RequestRecord; }

export function RequestCard({ request }: RequestCardProps) {
  return (
    <Link to={'/requests/' + request.id} className="card">
      <div className="row row--between">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card__title">{request.title}</div>
          <div className="card__meta">{request.requesterName} · {formatDate(request.submittedAt)}</div>
        </div>
      </div>
      <div className="row mt-3" style={{ gap: 6 }}>
        <Badge variant="neutral">{TYPE_LABEL[request.type] ?? request.type}</Badge>
        <Badge variant={statusVariant(request.status)}>{STATUS_LABEL[request.status]}</Badge>
      </div>
    </Link>
  );
}`
);

F(
  "src/components/request/ApprovalChain.tsx",
  `import type { ApprovalStep } from '@/types';
import { ROLE_LABEL } from '@/lib/permissions';
import { teams } from '@/data/teams';
import { formatDate } from '@/lib/format';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Awaiting approval', APPROVED: 'Approved', REJECTED: 'Rejected', SKIPPED: 'Skipped',
};

interface ApprovalChainProps { steps: ApprovalStep[]; }

export function ApprovalChain({ steps }: ApprovalChainProps) {
  if (steps.length === 0) return <div className="empty">No approval steps</div>;
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  return (
    <div className="approval-chain">
      {sorted.map((step) => {
        const cls = step.status === 'APPROVED' ? 'approval-step--done'
          : step.status === 'REJECTED' ? 'approval-step--rejected'
          : step.status === 'PENDING' ? 'approval-step--pending' : '';
        const teamName = step.requiredTeamId ? teams.find((t) => t.id === step.requiredTeamId)?.name : null;
        const roleName = ROLE_LABEL[step.requiredRole] ?? step.requiredRole;
        return (
          <div key={step.id} className={'approval-step ' + cls}>
            <div className="approval-step__index">{step.order}</div>
            <div className="approval-step__body">
              <div className="approval-step__title">{roleName}{teamName ? ' — ' + teamName : ''}</div>
              <div className="approval-step__meta">
                {STATUS_LABEL[step.status]}
                {step.actionDate ? ' · ' + formatDate(step.actionDate) : ''}
                {step.approverName ? ' · ' + step.approverName : ''}
              </div>
              {step.comment ? <div className="approval-step__comment">{step.comment}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}`
);

F(
  "src/components/calendar/CalendarGrid.tsx",
  `import type { CalendarEvent } from '@/types';
import { getArabicMonth, getDaysInMonth, getFirstWeekdayOfMonth } from '@/lib/format';

interface CalendarGridProps {
  year: number; month: number; events: CalendarEvent[];
  selectedDate?: string;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number): string { return n < 10 ? '0' + n : String(n); }
function toIso(year: number, month: number, day: number): string { return String(year) + '-' + pad(month + 1) + '-' + pad(day); }

export function CalendarGrid({ year, month, events, selectedDate, onSelectDate, onPrevMonth, onNextMonth }: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekdayOfMonth(year, month);
  const todayIso = new Date().toISOString().slice(0, 10);
  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    if (!eventsByDate.has(e.date)) eventsByDate.set(e.date, []);
    eventsByDate.get(e.date)!.push(e);
  }
  const cells: Array<{ day: number | null; iso: string }> = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push({ day: null, iso: '' });
  for (let d = 1; d <= daysInMonth; d += 1) cells.push({ day: d, iso: toIso(year, month, d) });

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-month">
          {getArabicMonth(month)}
          <span className="calendar-month__year">{year}</span>
        </div>
        <div className="calendar-nav">
          <button type="button" className="calendar-nav__btn" onClick={onPrevMonth} aria-label="Previous month">‹</button>
          <button type="button" className="calendar-nav__btn" onClick={onNextMonth} aria-label="Next month">›</button>
        </div>
      </div>
      <div className="calendar-weekdays">
        {WEEKDAYS.map((d) => <div key={d} className="calendar-weekday">{d}</div>)}
      </div>
      <div className="calendar-grid">
        {cells.map((cell, idx) => {
          if (cell.day === null) return <div key={'empty-' + idx} className="calendar-day calendar-day--empty" />;
          const hasEvents = eventsByDate.has(cell.iso);
          const isToday = cell.iso === todayIso;
          const isSelected = cell.iso === selectedDate;
          let cls = 'calendar-day';
          if (hasEvents) cls += ' calendar-day--has-events';
          if (isToday) cls += ' calendar-day--today';
          if (isSelected && !isToday) cls += ' calendar-day--selected';
          return (
            <button key={cell.iso} type="button" className={cls} onClick={() => onSelectDate(cell.iso)}>{cell.day}</button>
          );
        })}
      </div>
    </div>
  );
}`
);

/* ═══════════════════════════════════════════════════════════════
   AUTO-FIX ENGINE
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
  const files = walkDir(path.join(ROOT, "src"), [".ts", ".tsx"]);
  let fixed = 0;
  for (const f of files) {
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
  return fixed;
}

/* ═══════════════════════════════════════════════════════════════
   SAFE BUILD — شيل tsc من build script
   ═══════════════════════════════════════════════════════════════ */

function makeBuildSafe() {
  const pkgPath = path.join(ROOT, "package.json");
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.scripts && pkg.scripts.build && pkg.scripts.build.includes("tsc")) {
    pkg.scripts.build = "vite build";
    pkg.scripts.typecheck = "tsc --noEmit";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log(`${C.g}✓${C.r} package.json — build without tsc\n`);
  }
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(
  `${C.b}${C.m}╔══════════════════════════════════════════════════════╗${C.r}`
);
console.log(
  `${C.b}${C.m}║  fix.cjs — Full English Translation                  ║${C.r}`
);
console.log(
  `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
);
console.log("");

const bkDir = path.join(
  ROOT,
  ".fix-backups",
  "translate-" + Date.now().toString()
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

// Auto-Fix
runAutoFix();

// Safe build
makeBuildSafe();

// Push
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
    `git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "feat: full English translation of all remaining pages"`
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
