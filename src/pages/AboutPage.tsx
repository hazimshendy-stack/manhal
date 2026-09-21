import { site, activeSeason, seasons } from '@/data';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat, StatRow } from '@/components/ui/Stat';
import { formatDate, hoursToPoints } from '@/lib/format';
import type { Member } from '@/types';

export function AboutPage() {
  const { data: members } = useRealtimeCollection<Member>('members');
  const activeMembers = members.filter((m) => m.status === 'active');
  const totalHours = members.reduce((s, m) => s + (m.hours || 0), 0);
  const totalPoints = hoursToPoints(totalHours);

  return (
    <div className="container">
      <PageHeader eyebrow="About" title={site.name} description={site.description} />

      <section className="section--tight">
        <StatRow>
          <Stat value={activeMembers.length} label="Members" />
          <Stat value={teams.length} label="Teams" />
          <Stat value={totalPoints} label="Total Points" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Current Season" title={activeSeason.label} description={activeSeason.theme} />
        <div className="card no-click">
          <div className="kv"><span className="kv__k">Start</span><span className="kv__v">{formatDate(activeSeason.start)}</span></div>
          <div className="kv mt-4"><span className="kv__k">End</span><span className="kv__v">{formatDate(activeSeason.end)}</span></div>
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Seasons" title="History" />
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
        <SectionHeader eyebrow="Teams" title="Seven Specialized Teams" description="Each team covers a different area of the organization's work." />
        <div className="stack">
          {teams.map((t) => (
            <div key={t.id} className="card no-click">
              <div className="card__title">{t.name}</div>
              <p className="small soft mt-3">{t.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}