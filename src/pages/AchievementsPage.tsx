import { useCollection } from '@/lib/useRealtimeCollection';
   import { AchievementCard } from '@/components/achievement/AchievementCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonCard } from '@/components/ui/Loading';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import type { Achievement } from '@/types';

   export function AchievementsPage() {
     const { data, loading } = useCollection<Achievement>('achievements');

     const branchCount = data.filter((a) => a.level === 'branch').length;
     const nationalCount = data.filter((a) => a.level === 'national').length;
     const internationalCount = data.filter((a) => a.level === 'international').length;

     const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));

     return (
       <div className="container">
         <PageHeader
           eyebrow="الإنجازات"
           title="تكريمات المنظمة"
           description="كل ما حققته المنظمة على مستوى الفرع، الدولة، والعالم."
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={branchCount} label="مستوى الفرع" />
             <Stat value={nationalCount} label="مستوى وطني" />
             <Stat value={internationalCount} label="مستوى دولي" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader eyebrow="القائمة" title="كل الإنجازات" />
           {loading ? (
             <div className="stack">
               <SkeletonCard count={4} />
             </div>
           ) : sorted.length === 0 ? (
             <EmptyState
               icon="🏆"
               title="لا إنجازات بعد"
               message="لم يتم تسجيل أي إنجازات حتى الآن."
             />
           ) : (
             <div className="stack">
               {sorted.map((a) => (
                 <AchievementCard key={a.id} achievement={a} />
               ))}
             </div>
           )}
         </section>
       </div>
     );
   }
   