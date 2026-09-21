import { Link } from 'react-router-dom';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { canApproveStep, ROLE_LABEL } from '@/lib/permissions';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import type { ApprovalStep, RequestRecord } from '@/types';

   export function ApprovalsPage() {
     const { user } = useAuth();
     const { data: approvals, loading } = useCollection<ApprovalStep>('approvals');
     const { data: requests } = useCollection<RequestRecord>('requests');

     if (!user) return null;

     const myPending = approvals.filter(
       (a) => a.status === 'PENDING' && canApproveStep(user, a),
     );
     const done = approvals
       .filter((a) => a.status !== 'PENDING')
       .filter((a) => a.approverUid === user.uid)
       .sort((a, b) => (a.actionDate && b.actionDate ? (a.actionDate < b.actionDate ? 1 : -1) : 0))
       .slice(0, 15);

     const reqOf = (id: string) => requests.find((r) => r.id === id);

     const renderStep = (a: ApprovalStep) => {
       const req = reqOf(a.requestId);
       const teamName = a.requiredTeamId
         ? teams.find((t) => t.id === a.requiredTeamId)?.name
         : null;
       return (
         <Link key={a.id} to={'/requests/' + a.requestId} className="card">
           <div className="row row--between">
             <div style={{ flex: 1, minWidth: 0 }}>
               <div className="card__title">{req?.title ?? a.requestId}</div>
               <div className="card__meta">
                 {ROLE_LABEL[a.requiredRole]}
                 {teamName ? ' — ' + teamName : ''}
                 {' · مرحلة ' + a.order}
               </div>
             </div>
             <Badge variant="warning" dot>
               بانتظارك
             </Badge>
           </div>
         </Link>
       );
     };

     return (
       <div className="container">
         <PageHeader
           eyebrow="سير العمل"
           title="الموافقات"
           description="المراحل التي تنتظر قرارك."
         />

         <section className="section">
           <SectionHeader
             eyebrow="بانتظارك"
             title={'موافقاتك (' + myPending.length + ')'}
           />
           {loading ? (
             <SkeletonList count={3} />
           ) : myPending.length === 0 ? (
             <EmptyState
               icon="✅"
               title="لا شيء بانتظارك"
               message="جميع الموافقات المطلوبة منك تم إنجازها."
             />
           ) : (
             <div className="stack">{myPending.map(renderStep)}</div>
           )}
         </section>

         {done.length > 0 ? (
           <section className="section">
             <SectionHeader eyebrow="منتهية" title="قراراتك السابقة" />
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>الطلب</th>
                     <th>المرحلة</th>
                     <th>الحالة</th>
                     <th>التاريخ</th>
                   </tr>
                 </thead>
                 <tbody>
                   {done.map((a) => (
                     <tr key={a.id}>
                       <td data-label="الطلب">
                         <Link to={'/requests/' + a.requestId}>
                           {a.requestId}
                         </Link>
                       </td>
                       <td data-label="المرحلة">{a.order}</td>
                       <td data-label="الحالة">
                         {a.status === 'APPROVED' ? (
                           <Badge variant="success">موافق</Badge>
                         ) : a.status === 'REJECTED' ? (
                           <Badge variant="danger">مرفوض</Badge>
                         ) : (
                           <Badge variant="neutral">تم تخطيه</Badge>
                         )}
                       </td>
                       <td className="muted small" data-label="التاريخ">
                         {a.actionDate ? formatDate(a.actionDate) : '—'}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </section>
         ) : null}
       </div>
     );
   }
   