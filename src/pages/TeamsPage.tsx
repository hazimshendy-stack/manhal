import { teams } from '@/data/teams';
   import { members } from '@/data/members';
   import { hoursToPoints } from '@/lib/format';
   import { TeamCard } from '@/components/team/TeamCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';

   export function TeamsPage() {
     const ranking = teams
       .map((team) => {
         const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
         const points = teamMembers.reduce(
           (sum, m) => sum + hoursToPoints(m.hours || 0),
           0,
         );
         return { team, points };
       })
       .sort((a, b) => b.points - a.points)
       .map((r, i) => ({ team: r.team, rank: i + 1 }));

     return (
       <div className="container">
         <PageHeader
           eyebrow="الهيكل"
           title="الفرق"
           description="سبع فرق متخصصة داخل المنظمة."
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={teams.length} label="الفرق" />
             <Stat value={members.length} label="الأعضاء" />
             <Stat
               value={members.reduce(
                 (s, m) => s + hoursToPoints(m.hours || 0),
                 0,
               )}
               label="مجموع النقاط"
             />
           </StatRow>
         </section>

         <section className="section">
           <div className="grid">
             {ranking.map((r) => (
               <TeamCard key={r.team.id} team={r.team} rank={r.rank} />
             ))}
           </div>
         </section>
       </div>
     );
   }
   