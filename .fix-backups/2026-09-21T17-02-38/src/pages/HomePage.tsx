import { Link } from 'react-router-dom';
   import { site, activeSeason } from '@/data';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { contributions } from '@/data/contributions';
   import { hoursToPoints } from '@/lib/format';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { TeamCard } from '@/components/team/TeamCard';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';

   export function HomePage() {
     const activeMembers = members.filter((m) => m.status === 'active');
     const totalHours = contributions
       .filter((c) => c.status === 'approved')
       .reduce((s, c) => s + c.hours, 0);
     const totalPoints = hoursToPoints(totalHours);

     const teamRanking = teams
       .map((team) => {
         const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
         const teamPoints = teamMembers.reduce(
           (sum, m) => sum + hoursToPoints(m.hours || 0),
           0,
         );
         return { team, points: teamPoints, count: teamMembers.length };
       })
       .sort((a, b) => b.points - a.points)
       .map((r, i) => ({ ...r, rank: i + 1 }));

     const topMembers = [...members]
       .filter((m) => m.role !== 'HEAD' && m.role !== 'VICE')
       .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
       .slice(0, 5)
       .map((m, i) => ({ member: m, rank: i + 1 }));

     return (
       <>
         <section className="hero" style={{ padding: '48px 0 32px' }}>
           <div className="container">
             <div className="section-head__eyebrow">{activeSeason.label}</div>
             <h1
               style={{
                 fontSize: 'clamp(1.9rem, 5vw, 2.8rem)',
                 fontWeight: 900,
                 lineHeight: 1.15,
                 marginTop: 12,
                 maxWidth: '18ch',
               }}
             >
               منصة{' '}
               <span style={{ color: 'var(--c-navy-3)' }}>
                 {site.organization}
               </span>{' '}
               Sub Branches
             </h1>
             <p
               className="hero__desc"
               style={{
                 marginTop: 16,
                 maxWidth: '58ch',
                 color: 'var(--c-ink-soft)',
                 fontSize: '1rem',
                 lineHeight: 1.75,
               }}
             >
               {site.description}
             </p>
             <div
               className="row"
               style={{ marginTop: 24, gap: 10 }}
             >
               <Link to="/members" className="btn btn--primary">
                 تصفح الأعضاء
               </Link>
               <Link to="/league" className="btn btn--ghost">
                 الترتيب العام
               </Link>
               <Link to="/login" className="btn btn--ghost">
                 انضم إلينا
               </Link>
             </div>
           </div>
         </section>

         <section className="container section--tight">
           <StatRow>
             <Stat value={activeMembers.length} label="الأعضاء" />
             <Stat value={teams.length} label="الفرق" />
             <Stat value={totalPoints} label="مجموع النقاط" />
             <Stat value={totalHours} label="مجموع الساعات" />
           </StatRow>
         </section>

         <section className="container section">
           <SectionHeader
             eyebrow="ترتيب الفرق"
             title="الفرق حسب النقاط"
             description="الترتيب تلقائي بمجموع نقاط الأعضاء."
             action={
               <Link to="/teams" className="btn btn--ghost btn--sm">
                 كل الفرق
               </Link>
             }
           />
           <div className="grid">
             {teamRanking.map((r) => (
               <TeamCard key={r.team.id} team={r.team} rank={r.rank} />
             ))}
           </div>
         </section>

         <section className="container section">
           <SectionHeader
             eyebrow="الترتيب العام"
             title="أعلى الأعضاء"
             action={
               <Link to="/league" className="btn btn--ghost btn--sm">
                 الترتيب الكامل
               </Link>
             }
           />
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>#</th>
                   <th>العضو</th>
                   <th>الفرق</th>
                   <th>الساعات</th>
                   <th>النقاط</th>
                 </tr>
               </thead>
               <tbody>
                 {topMembers.map((e) => {
                   const memberTeams = teams.filter((t) =>
                     e.member.teamIds.includes(t.id),
                   );
                   return (
                     <tr key={e.member.id}>
                       <td
                         className={'rank rank--' + (e.rank <= 3 ? e.rank : '')}
                         data-label="الترتيب"
                       >
                         {e.rank}
                       </td>
                       <td data-label="العضو">
                         <Link
                           to={'/members/' + e.member.id}
                           style={{
                             display: 'flex',
                             alignItems: 'center',
                             gap: 10,
                           }}
                         >
                           <Avatar name={e.member.name} size={32} variant="navy" />
                           <span style={{ fontWeight: 700 }}>{e.member.name}</span>
                         </Link>
                       </td>
                       <td data-label="الفرق">
                         <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                           {memberTeams.map((t) => (
                             <span key={t.id} className="badge">
                               {t.name}
                             </span>
                           ))}
                         </div>
                       </td>
                       <td
                         style={{ fontFamily: 'var(--font-en)' }}
                         data-label="الساعات"
                       >
                         {e.member.hours}
                       </td>
                       <td className="points" data-label="النقاط">
                         {hoursToPoints(e.member.hours)}
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
         </section>

         <section className="container section">
           <div
             className="card card--navy no-click"
             style={{
               padding: '28px 24px',
               textAlign: 'center',
             }}
           >
             <Badge variant="red" dot>
               {activeSeason.theme}
             </Badge>
             <h2
               style={{
                 marginTop: 14,
                 fontSize: '1.4rem',
                 color: '#fff',
               }}
             >
               انضم إلى المنحل
             </h2>
             <p
               style={{
                 marginTop: 10,
                 maxWidth: '44ch',
                 marginInline: 'auto',
                 color: 'var(--c-paper-soft)',
                 fontSize: '0.92rem',
                 lineHeight: 1.75,
               }}
             >
               سجّل دخولك لمتابعة مشاركاتك، التقدم في الليج، والموافقات على طلباتك.
             </p>
             <div
               className="row"
               style={{ marginTop: 20, justifyContent: 'center' }}
             >
               <Link to="/login" className="btn btn--primary">
                 تسجيل الدخول
               </Link>
             </div>
           </div>
         </section>
       </>
     );
   }
   