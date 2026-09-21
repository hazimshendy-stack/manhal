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
  const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="container">
      <PageHeader
        eyebrow="الإنجازات"
        title="تكريمات المنظمة"
        description="كل ما حققته المنظمة من إنجازات وتكريمات."
      />

      <section className="section--tight">
        <StatRow>
          <Stat value={data.length} label="إجمالي الإنجازات" />
          <Stat value={data.filter((a) => a.date >= '2026-01-01').length} label="هذا الموسم" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader eyebrow="القائمة" title="كل الإنجازات" />
        {loading ? (
          <div className="stack"><SkeletonCard count={4} /></div>
        ) : sorted.length === 0 ? (
          <EmptyState title="لا إنجازات بعد" message="لم يتم تسجيل أي إنجازات." />
        ) : (
          <div className="stack">
            {sorted.map((a) => <AchievementCard key={a.id} achievement={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}
