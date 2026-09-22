import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getTeamTotalPoints } from '@/lib/rankings';
   import { TeamCard } from '@/components/team/TeamCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import type { Member, Contribution } from '@/types';

   export function TeamsPage() {
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const ranking = teams.map((team) => ({ team, points: getTeamTotalPoints(members, contributions, team.id) }))
       .sort((a, b) => b.points - a.points).map((r, i) => ({ team: r.team, rank: i + 1 }));
     const totalPoints = ranking.reduce((s, r) => s + r.points, 0);
     return (
       <div className="container">
         <PageHeader eyebrow="Structure" title="Teams" description="Seven specialized teams." />
         <section className="section--tight">
           <StatRow>
             <Stat value={teams.length} label="Teams" />
             <Stat value={members.length} label="Members" />
             <Stat value={totalPoints} label="Total Points" />
           </StatRow>
         </section>
         <section className="section">
           <div className="grid">{ranking.map((r) => <TeamCard key={r.team.id} team={r.team} rank={r.rank} />)}</div>
         </section>
       </div>
     );
   }
   