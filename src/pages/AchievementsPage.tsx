import { useCollection } from '@/lib/useRealtimeCollection';
   import { AchievementCard } from '@/components/achievement/AchievementCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonCard } from '@/components/ui/Loading';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import type { Achievement } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { achievements } from '@/data/achievements';

   export function AchievementsPage() {
     const { data, loading } = useCollection<Achievement>('achievements');
     const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));
     return (
       <div className="container">
         <PageHeader eyebrow="Achievements" title="Organization Awards" description="Everything we've accomplished." />
         <section className="section">
           <SectionHeader eyebrow="List" title="All Achievements" />
           {loading ? <div className="stack"><SkeletonCard count={4} /></div> : sorted.length === 0 ? (
             <EmptyState title="No achievements" message="No achievements yet." />
           ) : (
             <div className="stack">{sorted.map((a) => <AchievementCard key={a.id} achievement={a} />)}</div>
           )}
         </section>
       </div>
     );
   }
   