import { useEffect, useState } from 'react';
   import { useParams } from 'react-router-dom';
   import { getOne, listWhere, updateOne, today } from '@/lib/db';
   import { useAuth } from '@/lib/useAuth';
   import { canApproveStep } from '@/lib/permissions';
   import { notifyUser } from '@/lib/notifications';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
   import { REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL, PRIORITY_LABEL, formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Badge } from '@/components/ui/Badge';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Modal } from '@/components/ui/Modal';
   import { FormField, TextArea } from '@/components/ui/FormField';
   import { ApprovalChain } from '@/components/request/ApprovalChain';
   import { Loading } from '@/components/ui/Loading';
   import { NotFoundPage } from './NotFoundPage';
   import { toast } from '@/components/ui/Toast';
   import type { RequestRecord, ApprovalStep, AppUser } from '@/types';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { FormField } from '@/components/ui/FormField';
import { TextArea } from '@/components/ui/FormField';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ApprovalChain } from '@/components/request/ApprovalChain';
import { formatDate } from '@/lib/format';
import { today } from '@/lib/db';
import { REQUEST_TYPE_LABEL } from '@/lib/format';
import { REQUEST_STATUS_LABEL } from '@/lib/format';
import { PRIORITY_LABEL } from '@/lib/format';
import { updateOne } from '@/lib/db';
import { listWhere } from '@/lib/db';
import { getOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { canApproveStep } from '@/lib/permissions';
import { notifyUser } from '@/lib/notifications';
import { useAuth } from '@/lib/useAuth';
import { teams } from '@/data/teams';
import { requests } from '@/data/requests';
import { approvals } from '@/data/approvals';

   async function approveStep(request: RequestRecord, step: ApprovalStep, user: AppUser) {
     await updateOne('approvals', step.id, { status: 'APPROVED', approverUid: user.uid, approverName: user.displayName, actionDate: today() });
     const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
     const remaining = allSteps.filter((s) => s.status === 'PENDING' && s.id !== step.id);
     if (remaining.length === 0) {
       await updateOne('requests', request.id, { status: 'APPROVED', currentStepOrder: allSteps.length, updatedAt: today() });
       await notifyUser(request.requesterUid, 'Request approved', '"' + request.title + '" approved.', 'request', '/requests/' + request.id, 'high');
     } else {
       const next = Math.min(...remaining.map((s) => s.order));
       await updateOne('requests', request.id, { status: 'IN_REVIEW', currentStepOrder: next, updatedAt: today() });
     }
   }

   async function rejectStep(request: RequestRecord, step: ApprovalStep, user: AppUser, comment: string) {
     await updateOne('approvals', step.id, { status: 'REJECTED', approverUid: user.uid, approverName: user.displayName, comment, actionDate: today() });
     await updateOne('requests', request.id, { status: 'REJECTED', updatedAt: today() });
     await notifyUser(request.requesterUid, 'Request rejected', '"' + request.title + '". Reason: ' + comment, 'request', '/requests/' + request.id, 'high');
   }

   export function RequestDetailPage() {
     const { requestId } = useParams<{ requestId: string }>();
     const { user } = useAuth();
     const [request, setRequest] = useState<RequestRecord | null>(null);
     const [steps, setSteps] = useState<ApprovalStep[]>([]);
     const [loading, setLoading] = useState(true);
     const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
     const [comment, setComment] = useState('');
     const [busy, setBusy] = useState(false);
     const load = async () => {
       if (!requestId) return;
       setLoading(true);
       const r = await getOne<RequestRecord>('requests', requestId);
       if (r) { const s = await listWhere<ApprovalStep>('approvals', 'requestId', r.id); setSteps(s.sort((a, b) => a.order - b.order)); }
       setRequest(r);
       setLoading(false);
     };
     useEffect(() => { void load(); }, [requestId]);
     if (loading) return <Loading fullHeight />;
     if (!request) return <NotFoundPage />;
     const currentStep = steps.find((s) => s.status === 'PENDING' && s.order === request.currentStepOrder);
     const canAct = user && currentStep && canApproveStep(user, currentStep);
     const doAction = async () => {
       if (!user || !currentStep || !actionType) return;
       setBusy(true);
       try {
         if (actionType === 'approve') { await approveStep(request, currentStep, user); toast.success('Approved'); }
         else { if (!comment.trim()) { toast.error('Reason required'); setBusy(false); return; } await rejectStep(request, currentStep, user, comment); toast.success('Rejected'); }
         setActionType(null); setComment(''); await load();
       } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
       finally { setBusy(false); }
     };
     return (
       <div className="container">
         <PageHeader eyebrow="Request" title={request.title} />
         <section className="section">
           <div className="grid grid--2">
             <div className="card no-click">
               <div className="kv"><span className="kv__k">Type</span><span className="kv__v">{REQUEST_TYPE_LABEL[request.type]}</span></div>
               <div className="kv mt-4"><span className="kv__k">Requester</span><span className="kv__v">{request.requesterName}</span></div>
               <div className="kv mt-4"><span className="kv__k">Date</span><span className="kv__v">{formatDate(request.submittedAt)}</span></div>
             </div>
             <div className="card no-click">
               <div className="row row--between"><span className="muted small">Status</span><Badge variant={request.status === 'APPROVED' ? 'success' : request.status === 'REJECTED' ? 'danger' : 'warning'}>{REQUEST_STATUS_LABEL[request.status]}</Badge></div>
               <div className="row row--between mt-4"><span className="muted small">Priority</span><Badge variant="neutral">{PRIORITY_LABEL[request.priority]}</Badge></div>
               <div className="mt-5"><div className="muted small">Description</div><p className="mt-2">{request.description}</p></div>
             </div>
           </div>
         </section>
         {canAct ? (
           <section className="section">
             <SectionHeader eyebrow="Your Decision" title="Action Required" />
             <div className="card no-click">
               <div className="row" style={{ gap: 10 }}>
                 <button type="button" className="btn btn--success" onClick={() => setActionType('approve')}>Approve</button>
                 <button type="button" className="btn btn--danger" onClick={() => setActionType('reject')}>Reject</button>
               </div>
             </div>
           </section>
         ) : null}
         <section className="section"><SectionHeader eyebrow="Approvals" title="Chain" /><ApprovalChain steps={steps} /></section>
         <Modal open={actionType !== null} title={actionType === 'approve' ? 'Approve' : 'Reject'} onClose={() => { setActionType(null); setComment(''); }}
           footer={<><button type="button" className="btn btn--ghost" onClick={() => { setActionType(null); setComment(''); }}>Cancel</button><button type="button" className={'btn ' + (actionType === 'approve' ? 'btn--success' : 'btn--danger')} onClick={doAction} disabled={busy}>{busy ? '...' : 'Confirm'}</button></>}>
           <FormField label={actionType === 'approve' ? 'Comment (optional)' : 'Reason'} required={actionType === 'reject'}>
             <TextArea value={comment} onChange={setComment} rows={3} />
           </FormField>
         </Modal>
       </div>
     );
   }
   