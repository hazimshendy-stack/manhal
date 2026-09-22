import type { Contribution } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';
   import { safeNumber } from '@/lib/safe';
import { Badge } from '@/components/ui/Badge';
import { ContributionRow } from '@/components/contribution/ContributionRow';
import { formatDate } from '@/lib/format';
import { safeNumber } from '@/lib/safe';
import { teams } from '@/data/teams';

   interface ContributionRowProps { contribution: Contribution; showMember?: boolean; showTeam?: boolean; }
   export function ContributionRow({ contribution, showMember = true, showTeam = true }: ContributionRowProps) {
     const team = teams.find((t) => t.id === contribution.teamId);
     const statusVariant = contribution.status === 'approved' ? 'success' : contribution.status === 'pending' ? 'info' : contribution.status === 'in_review' ? 'warning' : 'danger';
     const statusLabel = contribution.status === 'approved' ? 'Approved' : contribution.status === 'pending' ? 'Pending' : contribution.status === 'in_review' ? 'In Review' : 'Rejected';
     return (
       <tr>
         {showMember ? <td data-label="Member" style={{ fontWeight: 700 }}>{contribution.memberName}</td> : null}
         {showTeam ? <td data-label="Team" className="muted small">{team ? team.name : contribution.teamId}</td> : null}
         <td data-label="Title">{contribution.title}</td>
         <td data-label="Date" className="muted small nowrap">{formatDate(contribution.date)}</td>
         <td data-label="Hours">{safeNumber(contribution.hours)}</td>
         <td data-label="Points" className="points">{safeNumber(contribution.points)}</td>
         <td data-label="Status"><Badge variant={statusVariant}>{statusLabel}</Badge></td>
       </tr>
     );
   }
   