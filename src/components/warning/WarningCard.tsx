import type { WarningRecord } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { formatDate } from '@/lib/format';

   const TYPE_LABEL: Record<string, string> = {
     VERBAL: 'تحذير شفهي',
     WRITTEN: 'تحذير كتابي',
     FINAL: 'تحذير نهائي',
   };

   const SEVERITY_LABEL: Record<string, string> = {
     LOW: 'منخفضة',
     MEDIUM: 'متوسطة',
     HIGH: 'مرتفعة',
   };

   interface WarningCardProps {
     warning: WarningRecord;
   }

   export function WarningCard({ warning }: WarningCardProps) {
     return (
       <div className="card no-click">
         <div className="row row--between">
           <div className="card__title">{warning.memberName}</div>
           <Badge variant={warning.status === 'active' ? 'danger' : 'success'} dot>
             {warning.status === 'active' ? 'نشط' : 'منتهي'}
           </Badge>
         </div>

         <div className="card__meta" style={{ marginTop: 6 }}>
           {warning.reason}
         </div>

         <div className="row mt-3" style={{ gap: 6 }}>
           <Badge variant="neutral">{TYPE_LABEL[warning.type]}</Badge>
           <Badge
             variant={
               warning.severity === 'HIGH'
                 ? 'danger'
                 : warning.severity === 'MEDIUM'
                   ? 'warning'
                   : 'info'
             }
           >
             {SEVERITY_LABEL[warning.severity]}
           </Badge>
           <span className="small muted">{formatDate(warning.issuedAt)}</span>
         </div>

         {warning.notes ? (
           <p className="small soft mt-3">{warning.notes}</p>
         ) : null}

         <div className="tiny muted" style={{ marginTop: 8 }}>
           بواسطة: {warning.issuedByName}
         </div>
       </div>
     );
   }
   