
import type { Member } from '@/types';

interface MemberCardProps { member: Member; showTeam?: boolean; showCommittee?: boolean; }

export function MemberCard({ member, showTeam = true }: MemberCardProps) {
  const totalPoints = hoursToPoints(member.hours || 0);
  const memberTeams = teams.filter((t) => member.teamIds.includes(t.id));
  return (
    <Link to={'/members/' + member.id} className="member-card">
      <div className="member-card__head">
        <Avatar name={member.name} size={56} variant="navy" />
        <div className="member-card__info">
          <div className="member-card__name">{member.name}</div>
          <div className="member-card__role">{ROLE_LABEL[member.role]}</div>
        </div>
      </div>
      {showTeam && memberTeams.length > 0 ? (
        <div className="member-card__teams">
          {memberTeams.map((t) => <span key={t.id} className="member-card__team-tag">{t.name}</span>)}
        </div>
      ) : null}
      <div className="member-card__stats">
        <div className="member-card__stat"><span className="member-card__stat-value">{member.hours || 0}</span><span className="member-card__stat-label">Hours</span></div>
        <div className="member-card__stat member-card__stat--red"><span className="member-card__stat-value">{totalPoints}</span><span className="member-card__stat-label">Points</span></div>
      </div>
    </Link>
  );
}