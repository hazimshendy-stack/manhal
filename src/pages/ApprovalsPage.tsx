import { Link } from 'react-router-dom';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { canApproveStep, ROLE_LABEL } from '@/lib/permissions';
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
     const myPending = approvals.filter((a) => a.status === 'PENDING' && canApproveStep(user, a));
     return (
       <div className="container">
         <PageHeader eyebrow="Workflow" title="Approvals" description="Stages awaiting your decision." />
         <section className="section">
           <SectionHeader eyebrow="Pending" title={'Awaiting You (' + myPending.length + ')'} />
           {loading ? <SkeletonList count={3} /> : myPending.length === 0 ? <EmptyState title="All clear" message="Nothing pending for you." /> : (
             <div className="stack">{myPending.map((a) => {
               const req = requests.find((r) => r.id === a.requestId);
               return <Link key={a.id} to={'/requests/' + a.requestId} className="card"><div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{req?.title ?? a.requestId}</div><div className="card__meta">{ROLE_LABEL[a.requiredRole]} · Stage {a.order}</div></div><Badge variant="warning" dot>Awaiting</Badge></div></Link>;
             })}</div>
           )}
         </section>
       </div>
     );
   }
   