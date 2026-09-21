import type { ApprovalStep } from '@/types';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';

   const STATUS_LABEL: Record<string, string> = {
     PENDING: 'بانتظار الموافقة',
     APPROVED: 'موافق عليه',
     REJECTED: 'مرفوض',
     SKIPPED: 'تم تخطيه',
   };

   interface ApprovalChainProps {
     steps: ApprovalStep[];
   }

   export function ApprovalChain({ steps }: ApprovalChainProps) {
     if (steps.length === 0) {
       return <div className="empty">لا توجد مراحل موافقة</div>;
     }

     const sorted = [...steps].sort((a, b) => a.order - b.order);

     return (
       <div className="approval-chain">
         {sorted.map((step) => {
           const cls =
             step.status === 'APPROVED'
               ? 'approval-step--done'
               : step.status === 'REJECTED'
                 ? 'approval-step--rejected'
                 : step.status === 'PENDING'
                   ? 'approval-step--pending'
                   : '';

           const teamName = step.requiredTeamId
             ? teams.find((t) => t.id === step.requiredTeamId)?.name
             : null;

           const roleName = ROLE_LABEL[step.requiredRole] ?? step.requiredRole;

           return (
             <div key={step.id} className={'approval-step ' + cls}>
               <div className="approval-step__index">{step.order}</div>
               <div className="approval-step__body">
                 <div className="approval-step__title">
                   {roleName}
                   {teamName ? ' — ' + teamName : ''}
                 </div>
                 <div className="approval-step__meta">
                   {STATUS_LABEL[step.status]}
                   {step.actionDate ? ' · ' + formatDate(step.actionDate) : ''}
                   {step.approverName ? ' · ' + step.approverName : ''}
                 </div>
                 {step.comment ? (
                   <div className="approval-step__comment">{step.comment}</div>
                 ) : null}
               </div>
             </div>
           );
         })}
       </div>
     );
   }
   