import { Link } from 'react-router-dom';
   import type { RequestRecord, RequestStatus } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { formatDate, REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { RequestCard } from '@/components/request/RequestCard';
import { formatDate } from '@/lib/format';
import { REQUEST_TYPE_LABEL } from '@/lib/format';
import { REQUEST_STATUS_LABEL } from '@/lib/format';
import { requests } from '@/data/requests';

   function statusVariant(s: RequestStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
     if (s === 'APPROVED') return 'success';
     if (s === 'REJECTED') return 'danger';
     if (s === 'IN_REVIEW') return 'warning';
     if (s === 'PENDING') return 'info';
     return 'neutral';
   }
   interface RequestCardProps { request: RequestRecord; }
   export function RequestCard({ request }: RequestCardProps) {
     return (
       <Link to={'/requests/' + request.id} className="card">
         <div className="row row--between">
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{request.title}</div>
             <div className="card__meta">{request.requesterName} · {formatDate(request.submittedAt)}</div>
           </div>
         </div>
         <div className="row mt-3" style={{ gap: 6 }}>
           <Badge variant="neutral">{REQUEST_TYPE_LABEL[request.type] ?? request.type}</Badge>
           <Badge variant={statusVariant(request.status)}>{REQUEST_STATUS_LABEL[request.status]}</Badge>
         </div>
       </Link>
     );
   }
   