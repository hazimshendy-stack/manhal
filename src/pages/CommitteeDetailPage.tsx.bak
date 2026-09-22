import { useParams } from 'react-router-dom';
   import { useCollection, useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { getCommitteeRanking } from '@/lib/rankings';
   import { teams } from '@/data/teams';
   import { MemberCard } from '@/components/member/MemberCard';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { NotFoundPage } from './NotFoundPage';
   import type { Committee, Member, Contribution } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat } from '@/components/ui/Stat';
import { StatRow } from '@/components/ui/Stat';
import { MemberCard } from '@/components/member/MemberCard';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { useCollection } from '@/lib/useRealtimeCollection';
import { getCommitteeRanking } from '@/lib/rankings';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';

   export function CommitteeDetailPage() {
     const { committeeId } = useParams<{ committeeId: string }>();
     const { data: committees } = useCollection<Committee>('committees');
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const committee = committees.find((c) => c.id === committeeId);
     if (!committee) return <NotFoundPage />;
     const cm = members.filter((m) => Array.isArray(m.committeeIds) && m.committeeIds.includes(committee.id));
     const board = getCommitteeRanking(members, contributions, committee.id);
     const totalPoints = board.reduce((s, e) => s + e.points, 0);
     const team = committee.teamId ? teams.find((t) => t.id === committee.teamId) : null;
     return (
       <div className="container section--tight">
         <div className="profile"><div className="profile__main">
           <h1 className="profile__name">{committee.nameAr}</h1>
           <div className="profile__role">{committee.description}</div>
           {team ? <div className="small muted mt-3">Team: {team.name}</div> : null}
         </div></div>
         <section className="section"><StatRow><Stat value={cm.length} label="Members" /><Stat value={totalPoints} label="Total Points" /></StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="Ranking" title="Committee Ranking" />
           {board.length === 0 ? <EmptyState title="No data" message="No ranking data." /> : (
             <div className="table-wrap"><table className="data"><thead><tr><th>#</th><th>Member</th><th>Points</th></tr></thead>
               <tbody>{board.map((e) => <tr key={e.member.id}><td className={'rank rank--' + (e.rank <= 3 ? e.rank : '')}>{e.rank}</td><td style={{ fontWeight: 700 }}>{e.member.name}</td><td className="points">{e.points}</td></tr>)}</tbody>
             </table></div>
           )}
         </section>
         <section className="section">
           <SectionHeader eyebrow="Members" title="Committee Members" />
           {cm.length === 0 ? <EmptyState title="No members" message="No members yet." /> : <div className="grid grid--wide">{cm.map((m) => <MemberCard key={m.id} member={m} showTeam={false} />)}</div>}
         </section>
       </div>
     );
   }
   