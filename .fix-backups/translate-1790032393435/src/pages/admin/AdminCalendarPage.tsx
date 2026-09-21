import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
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
     TimeInput,
     Select,
   } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { CalendarEvent, TeamId } from '@/types';

   const EMPTY: Omit<CalendarEvent, 'id'> = {
     title: '',
     description: '',
     date: new Date().toISOString().slice(0, 10),
     time: '',
     endTime: '',
     teamId: null,
     isPublic: true,
     type: 'meeting',
     location: '',
     seasonId: 'S7',
     createdBy: '',
     createdByName: '',
   };

   export function AdminCalendarPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<CalendarEvent>('calendar');
     const [editing, setEditing] = useState<CalendarEvent | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<CalendarEvent, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<CalendarEvent | null>(null);
     const [busy, setBusy] = useState(false);

     const sorted = [...data].sort((a, b) => (a.date > b.date ? 1 : -1));

     const openCreate = () => {
       setForm({
         ...EMPTY,
         createdBy: me?.uid ?? '',
         createdByName: me?.displayName ?? '',
       });
       setCreating(true);
       setEditing(null);
     };

     const openEdit = (e: CalendarEvent) => {
       setForm({
         title: e.title,
         description: e.description || '',
         date: e.date,
         time: e.time || '',
         endTime: e.endTime || '',
         teamId: e.teamId ?? null,
         isPublic: e.isPublic,
         type: e.type,
         location: e.location || '',
         seasonId: e.seasonId,
         createdBy: e.createdBy,
         createdByName: e.createdByName,
       });
       setEditing(e);
       setCreating(false);
     };

     const close = () => {
       setCreating(false);
       setEditing(null);
     };

     const save = async () => {
       if (!form.title.trim() || !form.date) {
         toast.error('العنوان والتاريخ مطلوبان');
         return;
       }
       setBusy(true);
       try {
         const payload = {
           ...form,
           teamId: form.isPublic ? null : form.teamId,
         };
         if (editing) {
           await updateOne('calendar', editing.id, payload);
           await logAudit(me, 'UPDATE_EVENT', 'Calendar', editing.id, form.title);
           toast.success('تم التحديث');
         } else {
           const id = 'EVT-' + Date.now().toString(36).toUpperCase();
           await createOne('calendar', { id, ...payload });
           await logAudit(me, 'CREATE_EVENT', 'Calendar', id, form.title);
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
         await removeOne('calendar', toDelete.id);
         await logAudit(me, 'DELETE_EVENT', 'Calendar', toDelete.id, toDelete.title);
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
           title="التقويم"
           description="إدارة الأحداث العامة وأحداث الفرق."
         />

         <SectionHeader
           eyebrow="القائمة"
           title={'الأحداث (' + data.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={openCreate}
             >
               + حدث جديد
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={5} />
         ) : sorted.length === 0 ? (
           <EmptyState
             icon="📅"
             title="لا أحداث"
             message="أضف أول حدث."
           />
         ) : (
           <div className="stack">
             {sorted.map((e) => {
               const team = e.teamId ? teams.find((t) => t.id === e.teamId) : null;
               return (
                 <div key={e.id} className="card no-click">
                   <div className="row row--between">
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="card__title">{e.title}</div>
                       <div className="card__meta">
                         {formatDate(e.date)}
                         {e.time ? ' · ' + e.time : ''}
                         {e.endTime ? ' — ' + e.endTime : ''}
                       </div>
                     </div>
                     <Badge variant={e.isPublic ? 'info' : 'neutral'}>
                       {e.isPublic ? 'عام' : team?.name || 'فريق'}
                     </Badge>
                   </div>
                   <div
                     className="row mt-3"
                     style={{ gap: 6, justifyContent: 'flex-end' }}
                   >
                     <button
                       type="button"
                       className="btn btn--ghost btn--xs"
                       onClick={() => openEdit(e)}
                     >
                       تعديل
                     </button>
                     <button
                       type="button"
                       className="btn btn--danger btn--xs"
                       onClick={() => setToDelete(e)}
                     >
                       حذف
                     </button>
                   </div>
                 </div>
               );
             })}
           </div>
         )}

         <Modal
           open={creating || editing !== null}
           title={editing ? 'تعديل حدث' : 'حدث جديد'}
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

           <FormField label="الوصف">
             <TextArea
               value={form.description || ''}
               onChange={(v) => setForm({ ...form, description: v })}
               rows={2}
             />
           </FormField>

           <FormField label="التاريخ" required>
             <DateInput
               value={form.date}
               onChange={(v) => setForm({ ...form, date: v })}
             />
           </FormField>

           <FormField label="وقت البداية">
             <TimeInput
               value={form.time || ''}
               onChange={(v) => setForm({ ...form, time: v })}
             />
           </FormField>

           <FormField label="وقت النهاية">
             <TimeInput
               value={form.endTime || ''}
               onChange={(v) => setForm({ ...form, endTime: v })}
             />
           </FormField>

           <FormField label="النوع">
             <Select
               value={form.type}
               onChange={(v) =>
                 setForm({ ...form, type: v as CalendarEvent['type'] })
               }
               options={[
                 { value: 'meeting', label: 'اجتماع' },
                 { value: 'event', label: 'فعالية' },
                 { value: 'workshop', label: 'ورشة' },
                 { value: 'deadline', label: 'موعد نهائي' },
               ]}
             />
           </FormField>

           <FormField
             label="النطاق"
             required
             hint="عام = يظهر للجميع، الفريق = يظهر لأعضاء فريق واحد فقط"
           >
             <Select
               value={form.isPublic ? 'public' : form.teamId ?? 'helpers'}
               onChange={(v) => {
                 if (v === 'public') {
                   setForm({ ...form, isPublic: true, teamId: null });
                 } else {
                   setForm({ ...form, isPublic: false, teamId: v as TeamId });
                 }
               }}
               options={[
                 { value: 'public', label: 'عام — للجميع' },
                 ...teams.map((t) => ({ value: t.id, label: 'فريق ' + t.name })),
               ]}
             />
           </FormField>

           <FormField label="المكان">
             <TextInput
               value={form.location || ''}
               onChange={(v) => setForm({ ...form, location: v })}
               placeholder="مثال: أونلاين — Zoom"
             />
           </FormField>
         </Modal>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف الحدث"
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
   