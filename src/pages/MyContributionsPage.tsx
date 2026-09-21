import { useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { createOne, newId, today } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { notifyTeamManagers } from '@/lib/notifications';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints, formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { FormField, TextInput, NumberInput, TextArea, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Contribution, TeamId, AppUser } from '@/types';

   export function MyContributionsPage() {
     const { user } = useAuth();
     const { data: contributions, loading } = useRealtimeCollection<Contribution>('contributions');
     const { data: users } = useRealtimeCollection<AppUser>('users');

     const [open, setOpen] = useState(false);
     const [busy, setBusy] = useState(false);
     const [title, setTitle] = useState('');
     const [desc, setDesc] = useState('');
     const [hours, setHours] = useState(1);
     const [teamId, setTeamId] = useState<TeamId>((user?.teamId as TeamId) || 'helpers');
     const [committeeId, setCommitteeId] = useState<string>('');
     const [category, setCategory] = useState('عام');

     if (!user?.memberId) {
       return (
         <div className="container">
           <EmptyState
             icon="👤"
             title="لا يوجد عضو مرتبط"
             message="حسابك غير مرتبط بملف عضو."
           />
         </div>
       );
     }

     const myMember = members.find((m) => m.id === user.memberId);
     const myContribs = contributions
       .filter((c) => c.memberId === user.memberId)
       .sort((a, b) => (a.date < b.date ? 1 : -1));

     const approved = myContribs.filter((c) => c.status === 'approved');
     const totalHours = approved.reduce((s, c) => s + c.hours, 0);
     const totalPoints = hoursToPoints(totalHours);
     const pending = myContribs.filter((c) => c.status === 'pending').length;

     const reset = () => {
       setTitle('');
       setDesc('');
       setHours(1);
       setCategory('عام');
       setCommitteeId('');
     };

     const submit = async () => {
       if (!title.trim() || !desc.trim()) {
         toast.error('العنوان والوصف مطلوبان');
         return;
       }
       if (hours <= 0) {
         toast.error('الساعات يجب أن تكون موجبة');
         return;
       }

       setBusy(true);
       try {
         const contrib: Contribution = {
           id: newId('C'),
           memberId: user.memberId!,
           memberName: myMember?.name ?? user.displayName,
           teamId,
           committeeId: committeeId || undefined,
           category,
           title: title.trim(),
           description: desc.trim(),
           date: today(),
           hours,
           status: 'pending',
           seasonId: 'S7',
           createdBy: user.uid,
         };

         await createOne('contributions', contrib);
         await logAudit(user, 'CREATE_CONTRIBUTION', 'Contribution', contrib.id, 'تسجيل مشاركة');

         await notifyTeamManagers(
           users,
           teamId,
           'مشاركة جديدة بانتظار الاعتماد',
           myMember?.name + ' سجّل مشاركة "' + contrib.title + '"',
           'participation',
           '/contributions',
           'normal',
           myMember?.name,
         );

         toast.success('تم الإرسال', 'مشاركتك قيد المراجعة من رئيس الفريق والموارد البشرية');
         setOpen(false);
         reset();
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
           eyebrow="مشاركاتي"
           title="مشاركاتي"
           description="سجّل ساعات عملك. كل ساعة معتمدة = 5 نقاط."
         >
           <button
             type="button"
             className="btn btn--primary mt-4"
             onClick={() => setOpen(true)}
           >
             + تسجيل مشاركة
           </button>
         </PageHeader>

         <section className="section--tight">
           <StatRow>
             <Stat value={totalPoints} label="النقاط" variant="red" />
             <Stat value={totalHours} label="الساعات" />
             <Stat value={myContribs.length} label="المشاركات" />
             <Stat value={pending} label="معلّقة" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader eyebrow="السجل" title="كل مشاركاتي" />
           {loading ? (
             <SkeletonList count={5} />
           ) : myContribs.length === 0 ? (
             <EmptyState
               icon="📝"
               title="لا مشاركات بعد"
               message="سجّل أول مشاركة لك للحصول على النقاط."
               action={
                 <button
                   type="button"
                   className="btn btn--primary"
                   onClick={() => setOpen(true)}
                 >
                   + تسجيل أول مشاركة
                 </button>
               }
             />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>العنوان</th>
                     <th>الفريق</th>
                     <th>التاريخ</th>
                     <th>الساعات</th>
                     <th>النقاط</th>
                     <th>الحالة</th>
                   </tr>
                 </thead>
                 <tbody>
                   {myContribs.map((c) => {
                     const team = teams.find((t) => t.id === c.teamId);
                     const committee = c.committeeId
                       ? committees.find((x) => x.id === c.committeeId)
                       : null;
                     return (
                       <tr key={c.id}>
                         <td data-label="العنوان">
                           {c.title}
                           {committee ? (
                             <div className="tiny muted mt-1">
                               {committee.icon} {committee.nameAr}
                             </div>
                           ) : null}
                         </td>
                         <td className="muted small" data-label="الفريق">
                           {team?.name ?? c.teamId}
                         </td>
                         <td className="muted small nowrap" data-label="التاريخ">
                           {formatDate(c.date)}
                         </td>
                         <td
                           style={{ fontFamily: 'var(--font-en)' }}
                           data-label="الساعات"
                         >
                           {c.hours}
                         </td>
                         <td className="points" data-label="النقاط">
                           {c.status === 'approved' ? hoursToPoints(c.hours) : '—'}
                         </td>
                         <td data-label="الحالة">
                           {c.status === 'approved' ? (
                             <Badge variant="success">معتمد</Badge>
                           ) : c.status === 'pending' ? (
                             <Badge variant="warning">معلّق</Badge>
                           ) : (
                             <Badge variant="danger">مرفوض</Badge>
                           )}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           )}
         </section>

         <Modal
           open={open}
           title="تسجيل مشاركة جديدة"
           onClose={() => setOpen(false)}
           wide
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={() => setOpen(false)}
               >
                 إلغاء
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={submit}
                 disabled={busy}
               >
                 {busy ? '...' : 'إرسال'}
               </button>
             </>
           }
         >
           <FormField label="العنوان" required>
             <TextInput
               value={title}
               onChange={setTitle}
               placeholder="عنوان المشاركة"
             />
           </FormField>

           <FormField label="الوصف" required>
             <TextArea
               value={desc}
               onChange={setDesc}
               placeholder="تفاصيل المشاركة"
               rows={3}
             />
           </FormField>

           <FormField label="الفريق" required>
             <Select
               value={teamId}
               onChange={(v) => setTeamId(v as TeamId)}
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField label="اللجنة (اختياري)">
             <Select
               value={committeeId}
               onChange={setCommitteeId}
               options={[
                 { value: '', label: '— بدون لجنة —' },
                 ...committees.map((c) => ({
                   value: c.id,
                   label: c.icon + ' ' + c.nameAr,
                 })),
               ]}
             />
           </FormField>

           <FormField label="التصنيف">
             <TextInput value={category} onChange={setCategory} />
           </FormField>

           <FormField label="عدد الساعات" required>
             <NumberInput value={hours} onChange={setHours} min={1} max={100} />
           </FormField>
         </Modal>
       </div>
     );
   }
   