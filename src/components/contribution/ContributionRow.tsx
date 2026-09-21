import type { Contribution } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { formatDate, hoursToPoints } from '@/lib/format';

interface ContributionRowProps {
  contribution: Contribution;
  showMember?: boolean;
  showTeam?: boolean;
  showCommittee?: boolean;
}

export function ContributionRow({ contribution, showMember = true, showTeam = true, showCommittee = false }: ContributionRowProps) {
  const team = teams.find((t) => t.id === contribution.teamId);
  const committee = contribution.committeeId ? committees.find((c) => c.id === contribution.committeeId) : null;
  const statusVariant = contribution.status === 'approved' ? 'success' : contribution.status === 'pending' ? 'warning' : 'danger';
  const statusLabel = contribution.status === 'approved' ? 'Approved' : contribution.status === 'pending' ? 'Pending' : 'Rejected';
  const points = contribution.status === 'approved' ? hoursToPoints(contribution.hours) : 0;

  return (
    <tr>
      {showMember ? <td data-label="Member" style={{ fontWeight: 700 }}>{contribution.memberName}</td> : null}
      {showTeam ? <td data-label="Team" className="muted small">{team ? team.name : contribution.teamId}</td> : null}
      {showCommittee ? <td data-label="Committee" className="muted small">{committee ? committee.nameAr : '—'}</td> : null}
      <td data-label="Title">{contribution.title}</td>
      <td data-label="Date" className="muted small nowrap">{formatDate(contribution.date)}</td>
      <td data-label="Hours" style={{ fontFamily: 'var(--font-en)' }}>{contribution.hours}</td>
      <td data-label="Points" className="points">{points > 0 ? points : '—'}</td>
      <td data-label="Status"><Badge variant={statusVariant}>{statusLabel}</Badge></td>
    </tr>
  );
}