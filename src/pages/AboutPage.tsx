import { site, activeSeason, seasons } from '@/data';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { formatDate, hoursToPoints } from '@/lib/format';

   export function AboutPage() {
     const activeMembers = members.filter((m) => m.status === 'active');
     const totalHours = members.reduce((s, m) => s + (m.hours || 0), 0);
     const totalPoints = hoursToPoints(totalHours);

     return (
       <div className="container">
         <PageHeader
           eyebrow="عن المنحل"
           title={site.name}
           description={site.description}
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={activeMembers.length} label="الأعضاء" />
             <Stat value={teams.length} label="الفرق" />
             <Stat value={totalPoints} label="مجموع النقاط" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader
             eyebrow="الموسم الحالي"
             title={activeSeason.label}
             description={activeSeason.theme}
           />
           <div className="card no-click">
             <div className="kv">
               <span className="kv__k">البداية</span>
               <span className="kv__v">{formatDate(activeSeason.start)}</span>
             </div>
             <div className="kv mt-4">
               <span className="kv__k">النهاية</span>
               <span className="kv__v">{formatDate(activeSeason.end)}</span>
             </div>
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="المواسم" title="السجل" />
           <div className="stack">
             {seasons.map((s) => (
               <div key={s.id} className="card no-click">
                 <div className="row row--between">
                   <div className="card__title">{s.label}</div>
                   <span className="muted small">{s.theme}</span>
                 </div>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader
             eyebrow="الفرق"
             title="سبع فرق متخصصة"
             description="كل فريق يغطي مجالًا مختلفًا من عمل المنظمة."
           />
           <div className="stack">
             {teams.map((t) => (
               <div key={t.id} className="card no-click">
                 <div className="row row--between">
                   <div>
                     <div className="card__title">{t.name}</div>
                     <div className="card__meta">{t.nameAr}</div>
                   </div>
                 </div>
                 <p className="small soft mt-3">{t.description}</p>
               </div>
             ))}
           </div>
         </section>
       </div>
     );
   }
   