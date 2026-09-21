import { Link } from 'react-router-dom';
import type { Team } from '@/types';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { hoursToPoints } from '@/lib/format';
import type { Member } from '@/types';

interface TeamCardProps {
  team: Team;
  rank?: number;
}

export function TeamCard({ team, rank }: TeamCardProps) {
  const { data: members } = useRealtimeCollection<Member>('members');
  const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
  const totalHours = teamMembers.reduce((sum, m) => sum + (m.hours || 0), 0);
  const totalPoints = hoursToPoints(totalHours);
  const avgPoints = teamMembers.length === 0 ? 0 : Math.round(totalPoints / teamMembers.length);

  return (
    <Link to={'/teams/' + team.id} className="card">
      <div className="row row--between">
        <div className="card__title">{team.name}</div>
        {rank !== undefined ? <span className="badge badge--red">#{rank}</span> : null}
      </div>

      <div className="card__meta">{team.description}</div>

      <div className="row" style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--c-line)', gap: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--c-navy)' }}>{totalPoints}</div>
          <div className="tiny muted">نقاط</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--c-navy)' }}>{teamMembers.length}</div>
          <div className="tiny muted">أعضاء</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--c-navy)' }}>{avgPoints}</div>
          <div className="tiny muted">متوسط</div>
        </div>
      </div>
    </Link>
  );
}
