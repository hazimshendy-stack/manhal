import { useCollection } from '@/lib/useRealtimeCollection';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Loading } from '@/components/ui/Loading';
   import type { Member, Contribution, RequestRecord } from '@/types';

   export function AdminAnalyticsPage() {
     const { data: liveMembers, loading: loadingM } = useCollection<Member>('members');
     const { data: contributions, loading: loadingC } = useCollection<Contribution>('contributions');
     const { data: requests, loading: loadingR } = useCollection<RequestRecord>('requests');

     if (loadingM || loadingC || loadingR) {
       return <Loading fullHeight message="جارٍ تحميل التحليلات..." />;
     }

     const allMembers = liveMembers.length > 0 ? liveMembers : members;

     const teamStats = teams
       .map((t) => {
         const teamMembers = allMembers.filter((m) => m.teamIds.includes(t.id));
         const points = teamMembers.reduce(
           (s, m) => s + hoursToPoints(m.hours || 0),
           0,
         );
         return { team: t, points, count: teamMembers.length };
       })
       .sort((a, b) => b.points - a.points);

     const committeeStats = committees
       .map((c) => {
         const committeeMembers = allMembers.filter((m) =>
           m.committeeIds.includes(c.id),
         );
         const points = committeeMembers.reduce(
           (s, m) => s + hoursToPoints(m.hours || 0),
           0,
         );
         return { committee: c, points, count: committeeMembers.length };
       })
       .sort((a, b) => b.points - a.points);

     const maxTeamPoints = Math.max(1, ...teamStats.map((s) => s.points));
     const maxCommitteePoints = Math.max(1, ...committeeStats.map((s) => s.points));

     const statusCounts: Record<string, number> = {};
     requests.forEach((r) => {
       statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
     });

     const typeCounts: Record<string, number> = {};
     requests.forEach((r) => {
       typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
     });

     const contributionsStatusCounts: Record<string, number> = {};
     contributions.forEach((c) => {
       contributionsStatusCounts[c.status] =
         (contributionsStatusCounts[c.status] || 0) + 1;
     });

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="التحليلات"
           description="نظرة شاملة على بيانات المنظمة."
         />

         <section className="section">
           <SectionHeader eyebrow="الفرق" title="نقاط الفرق" />
           <div className="card no-click">
             {teamStats.map((s) => (
               <div key={s.team.id} className="chart-row">
                 <span style={{ fontWeight: 700 }}>{s.team.name}</span>
                 <div
                   className="chart-bar"
                   style={{
                     width: Math.round((s.points / maxTeamPoints) * 100) + '%',
                   }}
                 />
                 <span
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontWeight: 800,
                     color: 'var(--c-navy)',
                   }}
                 >
                   {s.points}
                 </span>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="اللجان" title="نقاط اللجان" />
           <div className="card no-click">
             {committeeStats.map((s) => (
               <div key={s.committee.id} className="chart-row">
                 <span style={{ fontWeight: 700 }}>
                   {s.committee.icon} {s.committee.nameAr}
                 </span>
                 <div
                   className="chart-bar chart-bar--red"
                   style={{
                     width: Math.round((s.points / maxCommitteePoints) * 100) + '%',
                   }}
                 />
                 <span
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontWeight: 800,
                     color: 'var(--c-red)',
                   }}
                 >
                   {s.points}
                 </span>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الطلبات" title="حسب الحالة" />
           <div className="grid grid--narrow">
             {Object.entries(statusCounts).map(([k, v]) => (
               <div key={k} className="card no-click">
                 <div className="card__meta">{k}</div>
                 <div
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontSize: '1.8rem',
                     fontWeight: 800,
                     color: 'var(--c-navy)',
                     marginTop: 6,
                   }}
                 >
                   {v}
                 </div>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الطلبات" title="حسب النوع" />
           <div className="grid grid--narrow">
             {Object.entries(typeCounts).map(([k, v]) => (
               <div key={k} className="card no-click">
                 <div className="card__meta">{k}</div>
                 <div
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontSize: '1.8rem',
                     fontWeight: 800,
                     color: 'var(--c-red)',
                     marginTop: 6,
                   }}
                 >
                   {v}
                 </div>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="المشاركات" title="حسب الحالة" />
           <div className="grid grid--narrow">
             {Object.entries(contributionsStatusCounts).map(([k, v]) => (
               <div key={k} className="card no-click">
                 <div className="card__meta">{k}</div>
                 <div
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontSize: '1.8rem',
                     fontWeight: 800,
                     color: 'var(--c-navy)',
                     marginTop: 6,
                   }}
                 >
                   {v}
                 </div>
               </div>
             ))}
           </div>
         </section>
       </div>
     );
   }
   