import { useEffect, useState } from 'react';
   import { useParams, Link } from 'react-router-dom';
   import { getOne } from '@/lib/db';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { getUserRanks } from '@/lib/rankings';
   import { safeArray } from '@/lib/safe';
   import { formatDate } from '@/lib/format';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { ContributionRow } from '@/components/contribution/ContributionRow';
   import { Loading } from '@/components/ui/Loading';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { NotFoundPage } from './NotFoundPage';
   import type { Member, Contribution, Committee } from '@/types';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat } from '@/components/ui/Stat';
import { StatRow } from '@/components/ui/Stat';
import { ContributionRow } from '@/components/contribution/ContributionRow';
import { formatDate } from '@/lib/format';
import { safeArray } from '@/lib/safe';
import { getOne } from '@/lib/db';
import { ROLE_LABEL } from '@/lib/permissions';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { useCollection } from '@/lib/useRealtimeCollection';
import { getUserRanks } from '@/lib/rankings';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';

   export function MemberProfilePage() {
     const { memberId } = useParams<{ memberId: string }>();
     const [member, setMember] = useState<Member | null>(null);
     const [loading, setLoading] = useState(true);
     const { data: contributions } = useCollection<Contribution>('contributions');
     const { data: allMembers } = useCollection<Member>('members');
     const { data: committees } = useCollection<Committee>('committees');
     useEffect(() => {
       if (!memberId) return;
       void (async () => { const m = await getOne<Member>('members', memberId); setMember(m); setLoading(false); })();
     }, [memberId]);
     if (loading) return <Loading fullHeight />;
     if (!member) return <NotFoundPage />;
     const myContribs = safeArray(contributions).filter((c) => c.memberId === member.id).sort((a, b) => (a.date < b.date ? 1 : -1));
     const myRanks = getUserRanks(member.id, allMembers, contributions);
     const memberTeams = teams.filter((t) => safeArray(member.teamIds).includes(t.id));
     const memberCommittees = committees.filter((c) => safeArray(member.committeeIds).includes(c.id));
     return (
       <div className="container section--tight">
         <div className="profile">
           <Avatar name={member.name} size={80} variant="gradient" />
           <div className="profile__main">
             <h1 className="profile__name">{member.name}</h1>
             <div className="profile__role">{ROLE_LABEL[member.role]}</div>
             {member.bio ? <p className="profile__bio">{member.bio}</p> : null}
             {memberTeams.length > 0 ? <div className="row mt-4" style={{ gap: 6 }}>{memberTeams.map((t) => <Link key={t.id} to={'/teams/' + t.id}><Badge variant="navy">{t.name}</Badge></Link>)}</div> : null}
             {memberCommittees.length > 0 ? <div className="row mt-2" style={{ gap: 6 }}>{memberCommittees.map((c) => <Badge key={c.id}>{c.nameAr}</Badge>)}</div> : null}
           </div>
         </div>
         <section className="section">
           <SectionHeader eyebrow="My Ranking" title="Where I Stand" />
           <div className="grid grid--2">
             {myRanks.global ? <div className="card no-click"><div className="row row--between"><div className="card__title">Global</div><Badge variant="red">#{myRanks.global.rank}</Badge></div><div className="card__meta">Out of {myRanks.global.total} · {myRanks.global.points} pts</div></div> : null}
             {myRanks.team ? <div className="card no-click"><div className="row row--between"><div className="card__title">Team Ranking</div><Badge variant="navy">#{myRanks.team.rank}</Badge></div><div className="card__meta">Out of {myRanks.team.total} · {myRanks.team.points} pts</div></div> : null}
             {myRanks.committees.map((cr) => {
               const c = committees.find((x) => x.id === cr.committeeId);
               return <div key={cr.committeeId} className="card no-click"><div className="row row--between"><div className="card__title">{c?.nameAr || cr.committeeId}</div><Badge variant="info">#{cr.rank}</Badge></div><div className="card__meta">Out of {cr.total} · {cr.points} pts</div></div>;
             })}
           </div>
         </section>
         <section className="section">
           <SectionHeader eyebrow="Contributions" title="History" />
           {myContribs.length === 0 ? <EmptyState title="No contributions" message="No contributions yet." /> : (
             <div className="table-wrap">
               <table className="data">
                 <thead><tr><th>Title</th><th>Team</th><th>Date</th><th>Hours</th><th>Points</th><th>Status</th></tr></thead>
                 <tbody>{myContribs.map((c) => <ContributionRow key={c.id} contribution={c} showMember={false} showTeam />)}</tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   