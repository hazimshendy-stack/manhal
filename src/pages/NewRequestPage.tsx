import { useState, type FormEvent } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { newId, today } from '@/lib/db';
   import { createRequestWithChain } from '@/lib/approvals';
   import { logAudit } from '@/lib/audit';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { RequestRecord, RequestType, Priority, TeamId } from '@/types';

   const TYPE_LABEL: Record<RequestType, string> = {
     TRANSFER: 'نقل بين الفرق',
     PROMOTION: 'ترقية',
     RESIGNATION: 'استقالة',
     COMPLAINT: 'شكوى',
     SUGGESTION: 'اقتراح',
     LEAVE: 'إجازة',
   };

   export function NewRequestPage() {
     const nav = useNavigate();
     const { user } = useAuth();
     const [type, setType] = useState<RequestType>('TRANSFER');
     const [title, setTitle] = useState('');
     const [description, setDescription] = useState('');
     const [priority, setPriority] = useState<Priority>('NORMAL');
     const [fromTeamId, setFromTeamId] = useState<TeamId | ''>(
       (user?.teamId as TeamId) || '',
     );
     const [toTeamId, setToTeamId] = useState<TeamId | ''>('');
     const [busy, setBusy] = useState(false);

     if (!user) return null;

     const myMember = members.find((m) => m.id === user.memberId);

     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();

       if (!title.trim() || !description.trim()) {
         toast.error('العنوان والوصف مطلوبان');
         return;
       }

       if (type === 'TRANSFER' && (!fromTeamId || !toTeamId)) {
         toast.error('يجب اختيار الفريق الحالي والفريق الجديد');
         return;
       }

       setBusy(true);
       try {
         const id = newId('REQ');
         const newReq: RequestRecord = {
           id,
           type,
           requesterUid: user.uid,
           requesterMemberId: user.memberId ?? '',
           requesterName: myMember?.name ?? user.displayName,
           subjectMemberId: user.memberId ?? undefined,
           title: title.trim(),
           description: description.trim(),
           status: 'PENDING',
           currentStepOrder: 1,
           priority,
           submittedAt: today(),
           updatedAt: today(),
           seasonId: 'S7',
           fromTeamId: fromTeamId || undefined,
           toTeamId: toTeamId || undefined,
         };

         await createRequestWithChain(newReq);
         await logAudit(user, 'CREATE_REQUEST', 'Request', id, 'إنشاء طلب: ' + title);

         toast.success(
           'تم إرسال طلبك',
           'سيتم إشعارك عند كل تحديث على طلبك',
         );
         nav('/my-requests');
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل الإرسال';
         toast.error('فشل الإرسال', msg);
       } finally {
         setBusy(false);
       }
     };

     return (
       <div className="container">
         <PageHeader
           eyebrow="طلب جديد"
           title="إرسال طلب"
           description="يمر الطلب بسلسلة موافقات واضحة. تابعها لحظيًا."
         />

         <form
           onSubmit={onSubmit}
           className="card no-click"
           style={{ maxWidth: 720 }}
         >
           <FormField label="نوع الطلب" required>
             <Select
               value={type}
               onChange={(v) => setType(v as RequestType)}
               options={Object.entries(TYPE_LABEL).map(([k, v]) => ({
                 value: k,
                 label: v,
               }))}
             />
           </FormField>

           <FormField label="الأولوية" required>
             <Select
               value={priority}
               onChange={(v) => setPriority(v as Priority)}
               options={[
                 { value: 'LOW', label: 'منخفضة' },
                 { value: 'NORMAL', label: 'عادية' },
                 { value: 'HIGH', label: 'مرتفعة' },
                 { value: 'URGENT', label: 'عاجلة' },
               ]}
             />
           </FormField>

           {type === 'TRANSFER' ? (
             <>
               <FormField label="من فريق" required>
                 <Select
                   value={fromTeamId}
                   onChange={(v) => setFromTeamId(v as TeamId | '')}
                   options={[
                     { value: '', label: '— اختر —' },
                     ...teams.map((t) => ({ value: t.id, label: t.name })),
                   ]}
                 />
               </FormField>

               <FormField label="إلى فريق" required>
                 <Select
                   value={toTeamId}
                   onChange={(v) => setToTeamId(v as TeamId | '')}
                   options={[
                     { value: '', label: '— اختر —' },
                     ...teams
                       .filter((t) => t.id !== fromTeamId)
                       .map((t) => ({ value: t.id, label: t.name })),
                   ]}
                 />
               </FormField>
             </>
           ) : null}

           <FormField label="العنوان" required>
             <TextInput
               value={title}
               onChange={setTitle}
               placeholder="عنوان واضح للطلب"
             />
           </FormField>

           <FormField label="الوصف" required>
             <TextArea
               value={description}
               onChange={setDescription}
               placeholder="اشرح طلبك بالتفصيل"
               rows={5}
             />
           </FormField>

           <button
             type="submit"
             className="btn btn--primary btn--block mt-5"
             disabled={busy}
           >
             {busy ? '...' : 'إرسال الطلب'}
           </button>
         </form>
       </div>
     );
   }
   