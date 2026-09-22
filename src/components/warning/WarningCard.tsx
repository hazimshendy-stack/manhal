import type { WarningRecord } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { formatDate } from '@/lib/format';

   interface WarningCardProps { warning: WarningRecord; }
   export function WarningCard({ warning }: WarningCardProps) {
     return (
       <div className="card no-click">
         <div className="row row--between">
           <div className="card__title">{warning.memberName}</div>
           <Badge variant={warning.status === 'active' ? 'danger' : 'success'} dot>{warning.status === 'active' ? 'Active' : 'Resolved'}</Badge>
         </div>
         <div className="card__meta" style={{ marginTop: 6 }}>{warning.reason}</div>
         <div className="row mt-3" style={{ gap: 6 }}>
           <Badge variant="neutral">{warning.type}</Badge>
           <Badge variant={warning.severity === 'HIGH' ? 'danger' : warning.severity === 'MEDIUM' ? 'warning' : 'info'}>{warning.severity}</Badge>
           <span className="small muted">{formatDate(warning.issuedAt)}</span>
         </div>
       </div>
     );
   }
   