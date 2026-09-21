
import type { Team } from '@/types';

import type { Member } from '@/types';

interface TeamCardProps { team: Team; rank?: number; }

export function TeamCard({ team, rank }: TeamCardProps) {
  const { data: members } = useRealtimeCollection<Member>('members');
  const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
  const totalHours = teamMembers.reduce((sum, m) => sum + (m.hours || 0), 0);
  const totalPoints = hoursToPoints(totalHours);
  const avgPoints = teamMembers.length === 0 ? 0 : Math.round(totalPoints / teamMembers.length);
  return (
    <Link to={'/teams/' + team.id} className="team-card">
      <div className="team-card__head">
        <div className="team-card__name">{team.name}</div>
        {rank !== undefined ? <span className={'team-card__rank' + (rank === 1 ? ' team-card__rank--first' : '')}>#{rank}</span> : null}
      </div>
      <div className="team-card__stats">
        <div className="team-card__stat"><span className="team-card__stat-value">{totalPoints}</span><span className="team-card__stat-label">Points</span></div>
        <div className="team-card__stat"><span className="team-card__stat-value">{teamMembers.length}</span><span className="team-card__stat-label">Members</span></div>
        <div className="team-card__stat"><span className="team-card__stat-value">{avgPoints}</span><span className="team-card__stat-label">Average</span></div>
      </div>
    </Link>
  );
}