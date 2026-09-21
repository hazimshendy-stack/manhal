import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { notifyUser } from '@/lib/notifications';
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
   } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { WarningRecord } from '@/types';

   const EMPTY: Omit<WarningRecord, 'id'> = {
     memberId: '',
     memberName: '',
     type: 'VERBAL',
     reason: '',
     severity: 'LOW',
     issuedByMemberId: '',
     issuedByName: '',
     issuedAt: new Date().toISOString().slice(0, 10),
     status: 'active',
     notes: '',
   };

   export function AdminWarningsPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<WarningRecord>('warnings');
     const [editing, setEditing] = useState<WarningRecord | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<WarningRecord, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<WarningRecord | null>(null);
     const [busy, setBusy] = useState(false);

     const openCreate = () => {
       setForm({
         ...EMPTY,
         issuedByMemberId: me?.memberId ?? '',
         issuedByName: me?.displayName ?? '',
       });
       setCreating(true);
       setEditing(null);
     };

     const openEdit = (w: WarningRecord) => {
       setForm({
         memberId: w.memberId,
         memberName: w.memberName,
         type: w.type,
         reason: w.reason,
         severity: w.severity,
         issuedByMemberId: w.issuedByMemberId,
         issuedByName: w.issuedByName,
         issuedAt: w.issuedAt,
         status: w.status,
         notes: w.notes || '',
       });
       setEditing(w);
       setCreating(false);
     };

     const close = () => {
       setCreating(false);
       setEditing(null);
     };

     const save = async () => {
       if (!form.memberId || !form.reason.trim()) {
         toast.error('العضو والسبب مطلوبان');
         return;
       }
       setBusy(true);
       try {
         const member = members.find((m) => m.id === form.memberId);
         const payload = {
           ...form,
           memberName: member?.name ?? form.memberName,
         };

         if (editing) {
           await updateOne('warnings', editing.id, payload);
           await logAudit(me, 'UPDATE_WARNING', 'Warning', editing.id, form.reason);
           toast.success('تم التحديث');
         } else {
           const id = 'WARN-' + Date.now().toString(36).toUpperCase();
           await createOne('warnings', { id, ...payload });
           await logAudit(me, 'CREATE_WARNING', 'Warning', id, form.reason);

           // إشعار العضو المعني
           const memberUser = (await import('@/lib/db')).listWhere<{ uid: string }>(
             'users',
             'memberId',
             form.memberId,
           );
           const users = await memberUser;
           if (users.length > 0) {
             await notifyUser(
               users[0].uid,
               'تحذير جديد',
               form.reason,
               'warning',
               '/dashboard',
               'high',
               me?.displayName,
             );
           }

           toast.success('تم إصدار التحذير');
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
         await removeOne('warnings', toDelete.id);
         await logAudit(me, 'DELETE_WARNING', 'Warning', toDelete.id, toDelete.reason);
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
           title="التحذيرات"
           description="إصدار ومتابعة التحذيرات الرسمية."
         />

         <SectionHeader
           eyebrow="القائمة"
           title={'التحذيرات (' + data.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={openCreate}
             >
               + تحذير جديد
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={4} />
         ) : data.length === 0 ? (
           <EmptyState
             icon="⚠️"
             title="لا تحذيرات"
             message="لم يتم إصدار أي تحذيرات."
           />
         ) : (
           <div className="stack">
             {data.map((w) => (
               <div key={w.id} className="card no-click">
                 <div className="row row--between">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{w.memberName}</div>
                     <div className="card__meta">{w.reason}</div>
                   </div>
                   <Badge
                     variant={w.status === 'active' ? 'danger' : 'success'}
                     dot
                   >
                     {w.status === 'active' ? 'نشط' : 'منتهي'}
                   </Badge>
                 </div>

                 <div className="row mt-3" style={{ gap: 6 }}>
                   <Badge variant="neutral">{w.type}</Badge>
                   <Badge
                     variant={
                       w.severity === 'HIGH'
                         ? 'danger'
                         : w.severity === 'MEDIUM'
                           ? 'warning'
                           : 'info'
                     }
                   >
                     {w.severity}
                   </Badge>
                   <span className="small muted">{formatDate(w.issuedAt)}</span>
                 </div>

                 <div
                   className="row mt-3"
                   style={{ gap: 6, justifyContent: 'flex-end' }}
                 >
                   <button
                     type="button"
                     className="btn btn--ghost btn--xs"
                     onClick={() => openEdit(w)}
                   >
                     تعديل
                   </button>
                   <button
                     type="button"
                     className="btn btn--danger btn--xs"
                     onClick={() => setToDelete(w)}
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
           title={editing ? 'تعديل تحذير' : 'تحذير جديد'}
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
           <FormField label="العضو" required>
             <Select
               value={form.memberId}
               onChange={(v) => {
                 const m = members.find((x) => x.id === v);
                 setForm({
                   ...form,
                   memberId: v,
                   memberName: m?.name ?? '',
                 });
               }}
               options={[
                 { value: '', label: '— اختر —' },
                 ...members.map((m) => ({ value: m.id, label: m.name })),
               ]}
             />
           </FormField>

           <FormField label="النوع" required>
             <Select
               value={form.type}
               onChange={(v) =>
                 setForm({ ...form, type: v as WarningRecord['type'] })
               }
               options={[
                 { value: 'VERBAL', label: 'شفهي' },
                 { value: 'WRITTEN', label: 'كتابي' },
                 { value: 'FINAL', label: 'نهائي' },
               ]}
             />
           </FormField>

           <FormField label="السبب" required>
             <TextArea
               value={form.reason}
               onChange={(v) => setForm({ ...form, reason: v })}
               rows={3}
             />
           </FormField>

           <FormField label="الخطورة" required>
             <Select
               value={form.severity}
               onChange={(v) =>
                 setForm({ ...form, severity: v as WarningRecord['severity'] })
               }
               options={[
                 { value: 'LOW', label: 'منخفضة' },
                 { value: 'MEDIUM', label: 'متوسطة' },
                 { value: 'HIGH', label: 'مرتفعة' },
               ]}
             />
           </FormField>

           <FormField label="التاريخ" required>
             <DateInput
               value={form.issuedAt}
               onChange={(v) => setForm({ ...form, issuedAt: v })}
             />
           </FormField>

           <FormField label="الحالة">
             <Select
               value={form.status}
               onChange={(v) =>
                 setForm({ ...form, status: v as 'active' | 'resolved' })
               }
               options={[
                 { value: 'active', label: 'نشط' },
                 { value: 'resolved', label: 'منتهي' },
               ]}
             />
           </FormField>

           <FormField label="ملاحظات">
             <TextArea
               value={form.notes || ''}
               onChange={(v) => setForm({ ...form, notes: v })}
               rows={2}
             />
           </FormField>
         </Modal>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف التحذير"
           message="هل أنت متأكد من الحذف؟"
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   