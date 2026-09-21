

import type { Achievement } from '@/types';

export function AchievementsPage() {
  const { data, loading } = useCollection<Achievement>('achievements');
  const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="container">
      <PageHeader eyebrow="Achievements" title="Organization Awards" description="Everything the organization has accomplished." />
      <section className="section">
        <SectionHeader eyebrow="List" title="All Achievements" />
        {loading ? (
          <div className="stack"><SkeletonCard count={4} /></div>
        ) : sorted.length === 0 ? (
          <EmptyState title="No achievements yet" message="No achievements recorded yet." />
        ) : (
          <div className="stack">
            {sorted.map((a) => <AchievementCard key={a.id} achievement={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}