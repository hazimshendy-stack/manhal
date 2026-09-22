import { Link } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { isManager, seesAllTeams, canApproveStep } from '@/lib/permissions';
   import { getMemberPoints, getMemberHours, getUserRanks } from '@/lib/rankings';
   import { safeArray } from '@/lib/safe';
   import { formatDate } from '@/lib/format';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading } from '@/components/ui/Loading';
   import type { Notification, RequestRecord, Contribution, ApprovalStep, Member, Committee } from '@/types';

   export function DashboardPage() {
     const { user } = useAuth();
     const { data: members, loading: l1 } = useRealtimeCollection<Member>('members');
     const { data: contributions, loading: l2 } = useRealtimeCollection<Contribution>('contributions');
     const { data: notifs, loading: l3 } = useRealtimeCollection<Notification>('notifications');
     const { data: requests, loading: l4 } = useRealtimeCollection<RequestRecord>('requests');
     const { data: approvals, loading: l5 } = useRealtimeCollection<ApprovalStep>('approvals');
     const { data: liveCommittees } = useRealtimeCollection<Committee>('committees');

     if (!user) return <div className="container"><EmptyState title="Sign in required" message="Please sign in." /></div>;
     if (l1 || l2 || l3 || l4 || l5) return <div className="container"><Loading fullHeight message="Loading..." /></div>;

     const myMember = user.memberId ? members.find((m) => m.id === user.memberId) : null;
     const myPoints = user.memberId ? getMemberPoints(user.memberId, contributions) : 0;
     const myHours = user.memberId ? getMemberHours(user.memberId, contributions) : 0;
     const myContribs = safeArray(contributions).filter((c) => c.memberId === user.memberId);
     const myRequests = safeArray(requests).filter((r) => r.requesterUid === user.uid);
     const myNotifs = safeArray(notifs).filter((n) => n.userId === user.uid).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
     const myPendingApprovals = safeArray(approvals).filter((a) => a.status === 'PENDING' && canApproveStep(user, a));
     const pendingRequestsCount = safeArray(requests).filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
     const totalOrgPoints = safeArray(members).reduce((s, m) => s + getMemberPoints(m.id, contributions), 0);
     const myRanks = getUserRanks(user.memberId, members, contributions);

     return (
       <>
         <div className="section section--tight"><div className="section-head__eyebrow">Welcome back</div><h1>{user.displayName}</h1></div>
         {isManager(user) ? (
           <section className="section--tight"><StatRow>
             <Stat value={members.length} label="Members" />
             <Stat value={teams.length} label="Teams" />
             <Stat value={pendingRequestsCount} label="Pending" variant="red" />
             <Stat value={totalOrgPoints} label="Total Points" />
           </StatRow></section>
         ) : (
           <section className="section--tight"><StatRow>
             <Stat value={myPoints} label="My Points" variant="red" />
             <Stat value={myHours} label="My Hours" />
             <Stat value={myContribs.length} label="Contributions" />
             <Stat value={myRequests.length} label="Requests" />
           </StatRow></section>
         )}
         {(myRanks.global || myRanks.team || myRanks.committees.length > 0) ? (
           <section className="section">
             <SectionHeader eyebrow="My Ranking" title="Where I Stand" />
             <div className="grid grid--2">
               {myRanks.global ? <div className="card no-click"><div className="row row--between"><div className="card__title">Global</div><Badge variant="red">#{myRanks.global.rank}</Badge></div><div className="card__meta">Out of {myRanks.global.total} · {myRanks.global.points} pts</div></div> : null}
               {myRanks.team ? <div className="card no-click"><div className="row row--between"><div className="card__title">Team</div><Badge variant="navy">#{myRanks.team.rank}</Badge></div><div className="card__meta">{teams.find((t) => t.id === myRanks.team!.teamId)?.name} · {myRanks.team.points} pts</div></div> : null}
               {myRanks.committees.map((cr) => {
                 const c = liveCommittees.find((x) => x.id === cr.committeeId);
                 return <div key={cr.committeeId} className="card no-click"><div className="row row--between"><div className="card__title">{c?.nameAr || cr.committeeId}</div><Badge variant="info">#{cr.rank}</Badge></div><div className="card__meta">{cr.points} pts</div></div>;
               })}
             </div>
           </section>
         ) : null}
         {user.role === 'MEMBER' ? (
           <section className="section--tight"><div className="row" style={{ gap: 10 }}>
             <Link to="/requests/new" className="btn btn--primary btn--sm">+ New Request</Link>
             <Link to="/my-contributions" className="btn btn--ghost btn--sm">Log Contribution</Link>
           </div></section>
         ) : null}
         {isManager(user) && myPendingApprovals.length > 0 ? (
           <section className="section">
             <SectionHeader eyebrow="Awaiting" title="Pending Approvals" action={<Link to="/approvals" className="btn btn--ghost btn--sm">All</Link>} />
             <div className="stack">{myPendingApprovals.slice(0, 4).map((a) => {
               const req = requests.find((r) => r.id === a.requestId);
               if (!req) return null;
               return <Link key={a.id} to={'/requests/' + req.id} className="card"><div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{req.title}</div><div className="card__meta">{req.requesterName} · Step {a.order}</div></div><Badge variant="warning" dot>Awaiting</Badge></div></Link>;
             })}</div>
           </section>
         ) : null}
         {myNotifs.length > 0 ? (
           <section className="section">
             <SectionHeader eyebrow="Updates" title="Notifications" action={<Link to="/notifications" className="btn btn--ghost btn--sm">All</Link>} />
             <div className="stack">{myNotifs.map((n) => (
               <Link key={n.id} to={n.route || '/notifications'} className="card" style={!n.read ? { borderColor: '#FCA5A5', background: '#FFFBFC' } : undefined}>
                 <div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{n.title}</div><div className="card__meta">{n.message}</div></div>{!n.read ? <Badge variant="red" dot>New</Badge> : null}</div>
               </Link>
             ))}</div>
           </section>
         ) : null}
         {myMember ? (
           <section className="section">
             <SectionHeader eyebrow="Info" title="Account" />
             <div className="card no-click">
               <div className="kv"><span className="kv__k">Name</span><span className="kv__v">{myMember.name}</span></div>
               <div className="kv mt-3"><span className="kv__k">Team</span><span className="kv__v">{user.teamId ? teams.find((t) => t.id === user.teamId)?.name : '—'}</span></div>
               <div className="kv mt-3"><span className="kv__k">Joined</span><span className="kv__v">{user.createdAt ? formatDate(user.createdAt) : '—'}</span></div>
             </div>
           </section>
         ) : null}
       </>
     );
   }
   