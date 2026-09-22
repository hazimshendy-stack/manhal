import { useParams } from 'react-router-dom';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getTeamRanking, getTeamTotalPoints } from '@/lib/rankings';
   import { MemberCard } from '@/components/member/MemberCard';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { NotFoundPage } from './NotFoundPage';
   import type { TeamId, Member, Contribution } from '@/types';
import { Stat } from '@/components/ui/Stat';
import { StatRow } from '@/components/ui/Stat';
import { getTeamRanking } from '@/lib/rankings';
import { getTeamTotalPoints } from '@/lib/rankings';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';

   export function TeamDetailPage() {
     const { teamId } = useParams<{ teamId: string }>();
     const team = teams.find((t) => t.id === (teamId as TeamId));
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     if (!team) return <NotFoundPage />;
     const tm = members.filter((m) => Array.isArray(m.teamIds) && m.teamIds.includes(team.id));
     const board = getTeamRanking(members, contributions, team.id);
     const totalPoints = getTeamTotalPoints(members, contributions, team.id);
     const avg = tm.length === 0 ? 0 : Math.round(totalPoints / tm.length);
     return (
       <div className="container section--tight">
         <div className="profile"><div className="profile__main"><h1 className="profile__name">{team.name}</h1><div className="profile__role">{team.description}</div></div></div>
         <section className="section"><StatRow><Stat value={tm.length} label="Members" /><Stat value={totalPoints} label="Total Points" /><Stat value={avg} label="Average" /></StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="Members" title="Team Members" />
           {tm.length === 0 ? <EmptyState title="No members" message="No members yet." /> : <div className="grid grid--wide">{tm.map((m) => <MemberCard key={m.id} member={m} showTeam={false} />)}</div>}
         </section>
         <section className="section">
           <SectionHeader eyebrow="Ranking" title="Team Ranking" />
           {board.length === 0 ? <EmptyState title="No data" message="No ranking data." /> : (
             <div className="table-wrap"><table className="data"><thead><tr><th>#</th><th>Member</th><th>Hours</th><th>Points</th></tr></thead>
               <tbody>{board.map((e) => <tr key={e.member.id}><td className={'rank rank--' + (e.rank <= 3 ? e.rank : '')}>{e.rank}</td><td style={{ fontWeight: 700 }}>{e.member.name}</td><td>{e.member.hours || 0}</td><td className="points">{e.points}</td></tr>)}</tbody>
             </table></div>
           )}
         </section>
       </div>
     );
   }
   