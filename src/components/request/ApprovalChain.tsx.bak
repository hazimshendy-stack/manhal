import type { ApprovalStep } from '@/types';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { formatDate } from '@/lib/format';
import { ApprovalChain } from '@/components/request/ApprovalChain';
import { formatDate } from '@/lib/format';
import { ROLE_LABEL } from '@/lib/permissions';

   const STATUS_LABEL: Record<string, string> = { PENDING: 'Awaiting', APPROVED: 'Approved', REJECTED: 'Rejected', SKIPPED: 'Skipped' };
   interface ApprovalChainProps { steps: ApprovalStep[]; }
   export function ApprovalChain({ steps }: ApprovalChainProps) {
     if (steps.length === 0) return <div className="empty">No approval steps</div>;
     const sorted = [...steps].sort((a, b) => a.order - b.order);
     return (
       <div className="approval-chain">
         {sorted.map((step) => {
           const cls = step.status === 'APPROVED' ? 'approval-step--done' : step.status === 'REJECTED' ? 'approval-step--rejected' : step.status === 'PENDING' ? 'approval-step--pending' : '';
           return (
             <div key={step.id} className={'approval-step ' + cls}>
               <div className="approval-step__index">{step.order}</div>
               <div className="approval-step__body">
                 <div className="approval-step__title">{ROLE_LABEL[step.requiredRole] ?? step.requiredRole}</div>
                 <div className="approval-step__meta">{STATUS_LABEL[step.status]}{step.actionDate ? ' · ' + formatDate(step.actionDate) : ''}{step.approverName ? ' · ' + step.approverName : ''}</div>
                 {step.comment ? <div className="approval-step__comment">{step.comment}</div> : null}
               </div>
             </div>
           );
         })}
       </div>
     );
   }
   