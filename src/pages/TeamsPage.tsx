

import type { Member } from '@/types';

export function TeamsPage() {
  const { data: members, loading } = useRealtimeCollection<Member>('members');

  const ranking = teams
    .map((team) => {
      const tm = members.filter((m) => m.teamIds.includes(team.id));
      const points = tm.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);
      return { team, points };
    })
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ team: r.team, rank: i + 1 }));

  const totalPoints = members.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);

  return (
    <div className="container">
      <PageHeader eyebrow="Structure" title="Teams" description="Seven specialized teams within the organization." />
      <section className="section--tight">
        {loading ? <Loading /> : (
          <StatRow>
            <Stat value={teams.length} label="Teams" />
            <Stat value={members.length} label="Members" />
            <Stat value={totalPoints} label="Total Points" />
          </StatRow>
        )}
      </section>
      <section className="section">
        <div className="grid">
          {ranking.map((r) => <TeamCard key={r.team.id} team={r.team} rank={r.rank} />)}
        </div>
      </section>
    </div>
  );
}