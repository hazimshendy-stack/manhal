import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import {
  isManager,
  seesAllTeams,
  canApproveStep,
} from '@/lib/permissions';
import { hoursToPoints, formatDate } from '@/lib/format';
import { Stat, StatRow } from '@/components/ui/Stat';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EventCard } from '@/components/calendar/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
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
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');
  const { data: requests } = useRealtimeCollection<RequestRecord>('requests');
  const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
  const { data: approvals } = useRealtimeCollection<ApprovalStep>('approvals');
  const { data: events } = useRealtimeCollection<CalendarEvent>('calendar');
  const { data: liveMembers } = useRealtimeCollection<Member>('members');

  if (!user) {
    return (
      <div className="container">
        <EmptyState
          title="Sign in required"
          message="Sign in to access your dashboard."
        />
      </div>
    );
  }

  const allMembers = liveMembers.length > 0 ? liveMembers : members;
  const myMember = user.memberId
    ? allMembers.find((m) => m.id === user.memberId)
    : null;

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
    .filter(
      (e) => e.isPublic || e.teamId === user.teamId || seesAllTeams(user),
    )
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 3);

  const totalOrgPoints = allMembers.reduce(
    (s, m) => s + hoursToPoints(m.hours || 0),
    0,
  );

  const pendingRequestsCount = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'IN_REVIEW',
  ).length;

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
            <Stat
              value={pendingRequestsCount}
              label="Pending Requests"
              variant="red"
            />
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
            <Link to="/requests/new" className="btn btn--primary btn--sm">
              + New Request
            </Link>
            <Link to="/my-contributions" className="btn btn--ghost btn--sm">
              Log Contribution
            </Link>
          </div>
        </section>
      ) : null}

      {isManager(user) && myPendingApprovals.length > 0 ? (
        <section className="section">
          <SectionHeader
            eyebrow="Awaiting your decision"
            title="Pending Approvals"
            action={
              <Link to="/approvals" className="btn btn--ghost btn--sm">
                View All
              </Link>
            }
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
                      <div className="card__meta">
                        {req.requesterName} · Step {a.order}
                      </div>
                    </div>
                    <Badge variant="warning" dot>
                      Awaiting
                    </Badge>
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
            action={
              <Link to="/notifications" className="btn btn--ghost btn--sm">
                View All
              </Link>
            }
          />
          <div className="stack">
            {myNotifs.map((n) => (
              <Link
                key={n.id}
                to={n.route || '/notifications'}
                className="card"
                style={
                  !n.read
                    ? { borderColor: '#FCA5A5', background: '#FFFBFC' }
                    : undefined
                }
              >
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{n.title}</div>
                    <div className="card__meta">{n.message}</div>
                  </div>
                  {!n.read ? (
                    <Badge variant="red" dot>
                      New
                    </Badge>
                  ) : null}
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
          action={
            <Link to="/league" className="btn btn--ghost btn--sm">
              Full Leaderboard
            </Link>
          }
        />
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
              {[...allMembers]
                .filter((m) => m.role !== 'HEAD' && m.role !== 'VICE')
                .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
                .slice(0, 5)
                .map((m, i) => (
                  <tr key={m.id}>
                    <td
                      className={'rank rank--' + (i + 1 <= 3 ? i + 1 : '')}
                      data-label="Rank"
                    >
                      {i + 1}
                    </td>
                    <td data-label="Member">
                      <Link
                        to={'/members/' + m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <Avatar name={m.name} size={30} variant="navy" />
                        <span style={{ fontWeight: 700 }}>{m.name}</span>
                      </Link>
                    </td>
                    <td style={{ fontFamily: 'var(--font-en)' }} data-label="Hours">
                      {m.hours}
                    </td>
                    <td className="points" data-label="Points">
                      {hoursToPoints(m.hours)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {upcomingEvents.length > 0 ? (
        <section className="section">
          <SectionHeader
            eyebrow="Coming up"
            title="Upcoming Events"
            action={
              <Link to="/calendar" className="btn btn--ghost btn--sm">
                Calendar
              </Link>
            }
          />
          <div className="stack">
            {upcomingEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      ) : null}

      {myMember ? (
        <section className="section">
          <SectionHeader eyebrow="My Info" title="My Account" />
          <div className="card no-click">
            <div className="kv">
              <span className="kv__k">Name</span>
              <span className="kv__v">{myMember.name}</span>
            </div>
            <div className="kv mt-3">
              <span className="kv__k">Team</span>
              <span className="kv__v">
                {user.teamId
                  ? teams.find((t) => t.id === user.teamId)?.name
                  : '—'}
              </span>
            </div>
            {user.committeeIds.length > 0 ? (
              <div className="kv mt-3">
                <span className="kv__k">Committees</span>
                <span className="kv__v">
                  {committees
                    .filter((c) => user.committeeIds.includes(c.id))
                    .map((c) => c.nameAr)
                    .join(' · ')}
                </span>
              </div>
            ) : null}
            <div className="kv mt-3">
              <span className="kv__k">Joined</span>
              <span className="kv__v">{formatDate(user.createdAt)}</span>
            </div>
            <div className="row mt-4" style={{ gap: 10 }}>
              <Link to="/profile" className="btn btn--ghost btn--sm">
                My Profile
              </Link>
              <Link to="/my-contributions" className="btn btn--ghost btn--sm">
                My Contributions
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
