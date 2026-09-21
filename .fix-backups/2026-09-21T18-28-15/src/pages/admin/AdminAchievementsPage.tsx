import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
   import { members } from '@/data/members';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import {
     FormField,
     TextInput,
     TextArea,
     DateInput,
     Select,
     MultiSelect,
   } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Achievement, TeamId } from '@/types';

   const LEVEL_OPTIONS = [
     { value: 'branch', label: 'على مستوى الفرع' },
     { value: 'national', label: 'على المستوى الوطني' },
     { value: 'international', label: 'على المستوى الدولي' },
   ];

   const EMPTY: Omit<Achievement, 'id'> = {
     title: '',
     description: '',
     date: new Date().toISOString().slice(0, 10),
     level: 'branch',
     teamIds: [],
     memberIds: [],
     memberNames: [],
     seasonId: 'S7',
   };

   export function AdminAchievementsPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<Achievement>('achievements');
     const [editing, setEditing] = useState<Achievement | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<Achievement, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<Achievement | null>(null);
     const [busy, setBusy] = useState(false);

     const openCreate = () => {
       setForm(EMPTY);
       setCreating(true);
       setEditing(null);
     };

     const openEdit = (a: Achievement) => {
       setForm({
         title: a.title,
         description: a.description,
         date: a.date,
         level: a.level,
         teamIds: a.teamIds,
         memberIds: a.memberIds,
         memberNames: a.memberNames,
         seasonId: a.seasonId,
       });
       setEditing(a);
       setCreating(false);
     };

     const close = () => {
       setCreating(false);
       setEditing(null);
     };

     const save = async () => {
       if (!form.title.trim() || !form.description.trim()) {
         toast.error('العنوان والوصف مطلوبان');
         return;
       }
       setBusy(true);
       try {
         const memberNames = form.memberIds
           .map((id) => members.find((m) => m.id === id)?.name)
           .filter((n): n is string => Boolean(n));

         const payload = { ...form, memberNames };

         if (editing) {
           await updateOne('achievements', editing.id, payload);
           await logAudit(me, 'UPDATE_ACHIEVEMENT', 'Achievement', editing.id, form.title);
           toast.success('تم التحديث');
         } else {
           const id = 'A-' + Date.now().toString(36).toUpperCase();
           await createOne('achievements', { id, ...payload });
           await logAudit(me, 'CREATE_ACHIEVEMENT', 'Achievement', id, form.title);
           toast.success('تم الإضافة');
         }
         close();
       } catch {
         toast.error('فشل الحفظ');
       } finally {
         setBusy(false);
       }
     };

     const handleDelete = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('achievements', toDelete.id);
         await logAudit(me, 'DELETE_ACHIEVEMENT', 'Achievement', toDelete.id, toDelete.title);
         toast.success('تم الحذف');
         setToDelete(null);
       } catch {
         toast.error('فشل الحذف');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="الإنجازات"
           description="إضافة وتعديل وحذف الإنجازات."
         />

         <SectionHeader
           eyebrow="القائمة"
           title={'الإنجازات (' + data.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={openCreate}
             >
               + إنجاز جديد
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={5} />
         ) : data.length === 0 ? (
           <EmptyState
             icon="🏆"
             title="لا إنجازات"
             message="أضف أول إنجاز للمنظمة."
           />
         ) : (
           <div className="stack">
             {data.map((a) => (
               <div key={a.id} className="card no-click">
                 <div className="row row--between">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{a.title}</div>
                     <div className="card__meta">{formatDate(a.date)}</div>
                   </div>
                   <Badge
                     variant={
                       a.level === 'international'
                         ? 'red'
                         : a.level === 'national'
                           ? 'warning'
                           : 'info'
                     }
                   >
                     {a.level}
                   </Badge>
                 </div>
                 <p className="small soft mt-2">{a.description}</p>
                 <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                   <button
                     type="button"
                     className="btn btn--ghost btn--xs"
                     onClick={() => openEdit(a)}
                   >
                     تعديل
                   </button>
                   <button
                     type="button"
                     className="btn btn--danger btn--xs"
                     onClick={() => setToDelete(a)}
                   >
                     حذف
                   </button>
                 </div>
               </div>
             ))}
           </div>
         )}

         <Modal
           open={creating || editing !== null}
           title={editing ? 'تعديل إنجاز' : 'إنجاز جديد'}
           onClose={close}
           wide
           footer={
             <>
               <button type="button" className="btn btn--ghost" onClick={close}>
                 إلغاء
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={save}
                 disabled={busy}
               >
                 {busy ? '...' : 'حفظ'}
               </button>
             </>
           }
         >
           <FormField label="العنوان" required>
             <TextInput
               value={form.title}
               onChange={(v) => setForm({ ...form, title: v })}
             />
           </FormField>

           <FormField label="الوصف" required>
             <TextArea
               value={form.description}
               onChange={(v) => setForm({ ...form, description: v })}
               rows={3}
             />
           </FormField>

           <FormField label="التاريخ" required>
             <DateInput
               value={form.date}
               onChange={(v) => setForm({ ...form, date: v })}
             />
           </FormField>

           <FormField label="المستوى" required>
             <Select
               value={form.level}
               onChange={(v) =>
                 setForm({
                   ...form,
                   level: v as Achievement['level'],
                 })
               }
               options={LEVEL_OPTIONS}
             />
           </FormField>

           <FormField label="الفرق">
             <MultiSelect
               values={form.teamIds}
               onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })}
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField label="الأعضاء">
             <MultiSelect
               values={form.memberIds}
               onChange={(v) => setForm({ ...form, memberIds: v })}
               options={members.map((m) => ({ value: m.id, label: m.name }))}
             />
           </FormField>
         </Modal>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف الإنجاز"
           message={'سيتم حذف "' + (toDelete?.title || '') + '".'}
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   