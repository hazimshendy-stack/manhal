import { useEffect, useState } from 'react';
   import { useParams, Link } from 'react-router-dom';
   import { getOne, listWhere } from '@/lib/db';
   import { useAuth } from '@/lib/useAuth';
   import { canApproveStep } from '@/lib/permissions';
   import { approveStep, rejectStep } from '@/lib/approvals';
   import { teams } from '@/data/teams';
   import {
     REQUEST_TYPE_LABEL,
     REQUEST_STATUS_LABEL,
     PRIORITY_LABEL,
     formatDate,
   } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Badge } from '@/components/ui/Badge';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Modal } from '@/components/ui/Modal';
   import { FormField, TextArea } from '@/components/ui/FormField';
   import { ApprovalChain } from '@/components/request/ApprovalChain';
   import { Loading } from '@/components/ui/Loading';
   import { NotFoundPage } from './NotFoundPage';
   import { toast } from '@/components/ui/Toast';
   import type { RequestRecord, ApprovalStep } from '@/types';

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
       if (r) {
         const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', r.id);
         setSteps(allSteps.sort((a, b) => a.order - b.order));
       }
       setRequest(r);
       setLoading(false);
     };

     useEffect(() => {
       void load();
     }, [requestId]);

     if (loading) return <Loading fullHeight />;
     if (!request) return <NotFoundPage />;

     const currentStep = steps.find(
       (s) => s.status === 'PENDING' && s.order === request.currentStepOrder,
     );
     const canAct = user && currentStep && canApproveStep(user, currentStep);

     const fromTeam = request.fromTeamId
       ? teams.find((t) => t.id === request.fromTeamId)
       : null;
     const toTeam = request.toTeamId
       ? teams.find((t) => t.id === request.toTeamId)
       : null;

     const doAction = async () => {
       if (!user || !currentStep || !actionType) return;
       setBusy(true);
       try {
         if (actionType === 'approve') {
           await approveStep(request, currentStep, user);
           toast.success('تمت الموافقة');
         } else {
           if (!comment.trim()) {
             toast.error('سبب الرفض مطلوب');
             setBusy(false);
             return;
           }
           await rejectStep(request, currentStep, user, comment);
           toast.success('تم رفض الطلب');
         }
         setActionType(null);
         setComment('');
         await load();
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل الإجراء';
         toast.error('فشل الإجراء', msg);
       } finally {
         setBusy(false);
       }
     };

     return (
       <div className="container">
         <PageHeader eyebrow="الطلب" title={request.title} />

         <section className="section">
           <div className="grid grid--2">
             <div className="card no-click">
               <div className="kv">
                 <span className="kv__k">النوع</span>
                 <span className="kv__v">
                   {REQUEST_TYPE_LABEL[request.type]}
                 </span>
               </div>
               <div className="kv mt-4">
                 <span className="kv__k">مقدم الطلب</span>
                 <span className="kv__v">{request.requesterName}</span>
               </div>
               <div className="kv mt-4">
                 <span className="kv__k">التاريخ</span>
                 <span className="kv__v">{formatDate(request.submittedAt)}</span>
               </div>
               {fromTeam ? (
                 <div className="kv mt-4">
                   <span className="kv__k">من فريق</span>
                   <span className="kv__v">{fromTeam.name}</span>
                 </div>
               ) : null}
               {toTeam ? (
                 <div className="kv mt-4">
                   <span className="kv__k">إلى فريق</span>
                   <span className="kv__v">{toTeam.name}</span>
                 </div>
               ) : null}
             </div>

             <div className="card no-click">
               <div className="row row--between">
                 <span className="muted small">الحالة</span>
                 <Badge
                   variant={
                     request.status === 'APPROVED'
                       ? 'success'
                       : request.status === 'REJECTED'
                         ? 'danger'
                         : 'warning'
                   }
                 >
                   {REQUEST_STATUS_LABEL[request.status]}
                 </Badge>
               </div>
               <div className="row row--between mt-4">
                 <span className="muted small">الأولوية</span>
                 <Badge variant="neutral">{PRIORITY_LABEL[request.priority]}</Badge>
               </div>
               <div className="row row--between mt-4">
                 <span className="muted small">المرحلة الحالية</span>
                 <span className="kv__v">
                   {request.currentStepOrder} من {steps.length}
                 </span>
               </div>
               <div className="mt-5">
                 <div className="muted small">الوصف</div>
                 <p className="mt-2" style={{ lineHeight: 1.8 }}>
                   {request.description}
                 </p>
               </div>
             </div>
           </div>
         </section>

         {canAct ? (
           <section className="section">
             <SectionHeader eyebrow="قرارك" title="الإجراء المطلوب منك" />
             <div className="card no-click">
               <p className="muted small mb-4">
                 أنت مخوّل باتخاذ القرار في هذه المرحلة.
               </p>
               <div className="row" style={{ gap: 10 }}>
                 <button
                   type="button"
                   className="btn btn--success"
                   onClick={() => setActionType('approve')}
                 >
                   موافقة
                 </button>
                 <button
                   type="button"
                   className="btn btn--danger"
                   onClick={() => setActionType('reject')}
                 >
                   رفض
                 </button>
               </div>
             </div>
           </section>
         ) : null}

         <section className="section">
           <SectionHeader eyebrow="سلسلة الموافقات" title="الموافقات" />
           <ApprovalChain steps={steps} />
         </section>

         <Modal
           open={actionType !== null}
           title={actionType === 'approve' ? 'موافقة على الطلب' : 'رفض الطلب'}
           onClose={() => {
             setActionType(null);
             setComment('');
           }}
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={() => {
                   setActionType(null);
                   setComment('');
                 }}
               >
                 إلغاء
               </button>
               <button
                 type="button"
                 className={
                   'btn ' + (actionType === 'approve' ? 'btn--success' : 'btn--danger')
                 }
                 onClick={doAction}
                 disabled={busy}
               >
                 {busy
                   ? '...'
                   : actionType === 'approve'
                     ? 'تأكيد الموافقة'
                     : 'تأكيد الرفض'}
               </button>
             </>
           }
         >
           <FormField
             label={actionType === 'approve' ? 'تعليق (اختياري)' : 'سبب الرفض'}
             required={actionType === 'reject'}
           >
             <TextArea
               value={comment}
               onChange={setComment}
               placeholder={
                 actionType === 'approve'
                   ? 'ملاحظات إضافية...'
                   : 'اشرح سبب الرفض'
               }
               rows={3}
             />
           </FormField>
         </Modal>
       </div>
     );
   }
   