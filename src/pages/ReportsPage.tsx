import { useCollection } from '@/lib/useRealtimeCollection';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { Loading } from '@/components/ui/Loading';
   import type { RequestRecord, Contribution, Member } from '@/types';

   export function ReportsPage() {
     const { data: requests, loading: loadingR } = useCollection<RequestRecord>('requests');
     const { data: contributions, loading: loadingC } = useCollection<Contribution>('contributions');
     const { data: liveMembers, loading: loadingM } = useCollection<Member>('members');

     if (loadingR || loadingC || loadingM) {
       return <Loading fullHeight message="جارٍ تحميل التقارير..." />;
     }

     const allMembers = liveMembers.length > 0 ? liveMembers : members;

     const totalHours = contributions
       .filter((c) => c.status === 'approved')
       .reduce((s, c) => s + c.hours, 0);
     const totalPoints = hoursToPoints(totalHours);

     const byStatus: Record<string, number> = {};
     requests.forEach((r) => {
       byStatus[r.status] = (byStatus[r.status] || 0) + 1;
     });

     const byType: Record<string, number> = {};
     requests.forEach((r) => {
       byType[r.type] = (byType[r.type] || 0) + 1;
     });

     const teamStats = teams.map((t) => {
       const teamMembers = allMembers.filter((m) => m.teamIds.includes(t.id));
       const hours = teamMembers.reduce((s, m) => s + (m.hours || 0), 0);
       return { team: t, memberCount: teamMembers.length, hours, points: hoursToPoints(hours) };
     }).sort((a, b) => b.points - a.points);

     const committeeStats = committees.map((c) => {
       const committeeMembers = allMembers.filter((m) =>
         m.committeeIds.includes(c.id),
       );
       const hours = committeeMembers.reduce((s, m) => s + (m.hours || 0), 0);
       return {
         committee: c,
         memberCount: committeeMembers.length,
         hours,
         points: hoursToPoints(hours),
       };
     }).sort((a, b) => b.points - a.points);

     return (
       <div className="container">
         <PageHeader
           eyebrow="التقارير"
           title="التقارير"
           description="ملخصات شاملة لكل الأنشطة."
         />

         <section className="section">
           <StatRow>
             <Stat value={allMembers.length} label="الأعضاء" />
             <Stat value={totalPoints} label="النقاط" />
             <Stat value={totalHours} label="الساعات" />
             <Stat value={requests.length} label="الطلبات" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الفرق" title="إحصائيات الفرق" />
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>الفريق</th>
                   <th>الأعضاء</th>
                   <th>الساعات</th>
                   <th>النقاط</th>
                 </tr>
               </thead>
               <tbody>
                 {teamStats.map((s) => (
                   <tr key={s.team.id}>
                     <td data-label="الفريق">{s.team.name}</td>
                     <td data-label="الأعضاء">{s.memberCount}</td>
                     <td
                       style={{ fontFamily: 'var(--font-en)' }}
                       data-label="الساعات"
                     >
                       {s.hours}
                     </td>
                     <td className="points" data-label="النقاط">
                       {s.points}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="اللجان" title="إحصائيات اللجان" />
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>اللجنة</th>
                   <th>الأعضاء</th>
                   <th>الساعات</th>
                   <th>النقاط</th>
                 </tr>
               </thead>
               <tbody>
                 {committeeStats.map((s) => (
                   <tr key={s.committee.id}>
                     <td data-label="اللجنة">
                       {s.committee.icon} {s.committee.nameAr}
                     </td>
                     <td data-label="الأعضاء">{s.memberCount}</td>
                     <td
                       style={{ fontFamily: 'var(--font-en)' }}
                       data-label="الساعات"
                     >
                       {s.hours}
                     </td>
                     <td className="points" data-label="النقاط">
                       {s.points}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الطلبات" title="حسب الحالة" />
           <div className="grid grid--narrow">
             {Object.entries(byStatus).map(([k, v]) => (
               <div key={k} className="card no-click">
                 <div className="card__title">{k}</div>
                 <div
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontSize: '1.6rem',
                     fontWeight: 800,
                     color: 'var(--c-red)',
                     marginTop: 8,
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
             {Object.entries(byType).map(([k, v]) => (
               <div key={k} className="card no-click">
                 <div className="card__title">{k}</div>
                 <div
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontSize: '1.6rem',
                     fontWeight: 800,
                     color: 'var(--c-navy)',
                     marginTop: 8,
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
   