import { Link } from 'react-router-dom';
   import type { RequestRecord, RequestStatus } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { formatDate } from '@/lib/format';

   const TYPE_LABEL: Record<string, string> = {
     TRANSFER: 'نقل',
     PROMOTION: 'ترقية',
     RESIGNATION: 'استقالة',
     COMPLAINT: 'شكوى',
     SUGGESTION: 'اقتراح',
     LEAVE: 'إجازة',
   };

   const STATUS_LABEL: Record<RequestStatus, string> = {
     PENDING: 'قيد الانتظار',
     IN_REVIEW: 'قيد المراجعة',
     APPROVED: 'معتمد',
     REJECTED: 'مرفوض',
     CANCELLED: 'ملغى',
     COMPLETED: 'مكتمل',
   };

   function statusVariant(status: RequestStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
     if (status === 'APPROVED') return 'success';
     if (status === 'REJECTED') return 'danger';
     if (status === 'IN_REVIEW') return 'warning';
     if (status === 'PENDING') return 'info';
     return 'neutral';
   }

   interface RequestCardProps {
     request: RequestRecord;
   }

   export function RequestCard({ request }: RequestCardProps) {
     return (
       <Link to={'/requests/' + request.id} className="card">
         <div className="row row--between">
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{request.title}</div>
             <div className="card__meta">
               {request.requesterName} · {formatDate(request.submittedAt)}
             </div>
           </div>
         </div>

         <div className="row mt-3" style={{ gap: 6 }}>
           <Badge variant="neutral">{TYPE_LABEL[request.type] ?? request.type}</Badge>
           <Badge variant={statusVariant(request.status)}>
             {STATUS_LABEL[request.status]}
           </Badge>
         </div>
       </Link>
     );
   }
   