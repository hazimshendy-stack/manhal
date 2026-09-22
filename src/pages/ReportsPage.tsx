import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getTeamTotalPoints } from '@/lib/rankings';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { Loading } from '@/components/ui/Loading';
   import type { Member, Contribution, RequestRecord } from '@/types';
import { Stat } from '@/components/ui/Stat';
import { StatRow } from '@/components/ui/Stat';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';
import { requests } from '@/data/requests';

   export function ReportsPage() {
     const { data: members, loading: lM } = useCollection<Member>('members');
     const { data: contributions, loading: lC } = useCollection<Contribution>('contributions');
     const { data: requests, loading: lR } = useCollection<RequestRecord>('requests');
     if (lM || lC || lR) return <Loading fullHeight message="Loading reports..." />;
     const totalPoints = contributions.filter((c) => c.status === 'approved').reduce((s, c) => s + (c.points || 0), 0);
     const teamStats = teams.map((t) => ({ team: t, points: getTeamTotalPoints(members, contributions, t.id) })).sort((a, b) => b.points - a.points);
     return (
       <div className="container">
         <PageHeader eyebrow="Reports" title="Reports" description="Comprehensive summaries." />
         <section className="section"><StatRow>
           <Stat value={members.length} label="Members" />
           <Stat value={totalPoints} label="Total Points" />
           <Stat value={requests.length} label="Requests" />
         </StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="Teams" title="Team Statistics" />
           <div className="table-wrap"><table className="data">
             <thead><tr><th>Team</th><th>Points</th></tr></thead>
             <tbody>{teamStats.map((s) => <tr key={s.team.id}><td>{s.team.name}</td><td className="points">{s.points}</td></tr>)}</tbody>
           </table></div>
         </section>
       </div>
     );
   }
   