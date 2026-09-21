import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { hoursToPoints } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import {
     FormField,
     TextInput,
     NumberInput,
     TextArea,
     Select,
     MultiSelect,
   } from '@/components/ui/FormField';
   import { Avatar } from '@/components/ui/Avatar';
   import { toast } from '@/components/ui/Toast';
   import type { Member, RoleId, TeamId } from '@/types';

   const ROLE_OPTIONS = Object.entries(ROLE_LABEL).map(([value, label]) => ({
     value,
     label,
   }));

   const EMPTY_MEMBER: Omit<Member, 'id'> = {
     name: '',
     role: 'MEMBER',
     teamIds: [],
     committeeIds: [],
     joinedSeason: 7,
     hours: 0,
     status: 'active',
     bio: '',
     email: '',
   };

   export function AdminMembersPage() {
     const { user: me } = useAuth();
     const { data: members, loading } = useCollection<Member>('members');

     const [editing, setEditing] = useState<Member | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<Member, 'id'>>(EMPTY_MEMBER);
     const [toDelete, setToDelete] = useState<Member | null>(null);
     const [busy, setBusy] = useState(false);
     const [search, setSearch] = useState('');

     const filtered = members.filter(
       (m) => !search.trim() || m.name.includes(search.trim()),
     );

     const openCreate = () => {
       setForm(EMPTY_MEMBER);
       setCreating(true);
       setEditing(null);
     };

     const openEdit = (m: Member) => {
       setForm({
         name: m.name,
         role: m.role,
         teamIds: m.teamIds,
         committeeIds: m.committeeIds,
         joinedSeason: m.joinedSeason,
         hours: m.hours,
         status: m.status,
         bio: m.bio || '',
         email: m.email || '',
       });
       setEditing(m);
       setCreating(false);
     };

     const close = () => {
       setCreating(false);
       setEditing(null);
     };

     const save = async () => {
       if (!form.name.trim()) {
         toast.error('الاسم مطلوب');
         return;
       }
       if (form.teamIds.length === 0) {
         toast.error('يجب اختيار فريق واحد على الأقل');
         return;
       }
       setBusy(true);
       try {
         if (editing) {
           await updateOne('members', editing.id, form);
           await logAudit(me, 'UPDATE_MEMBER', 'Member', editing.id, form.name);
           toast.success('تم التحديث');
         } else {
           const id = 'M-' + Date.now().toString(36).toUpperCase();
           await createOne('members', { id, ...form });
           await logAudit(me, 'CREATE_MEMBER', 'Member', id, form.name);
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
         await removeOne('members', toDelete.id);
         await logAudit(me, 'DELETE_MEMBER', 'Member', toDelete.id, toDelete.name);
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
           title="الأعضاء"
           description="إضافة وتعديل وحذف بيانات الأعضاء."
         />

         <div className="toolbar">
           <input
             className="input"
             type="search"
             placeholder="ابحث..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
         </div>

         <SectionHeader
           eyebrow="القائمة"
           title={'الأعضاء (' + filtered.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={openCreate}
             >
               + عضو جديد
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={6} />
         ) : filtered.length === 0 ? (
           <EmptyState
             icon="👥"
             title="لا أعضاء"
             message="لم يتم العثور على أعضاء."
           />
         ) : (
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>الاسم</th>
                   <th>الدور</th>
                   <th>الفرق</th>
                   <th>الساعات</th>
                   <th>النقاط</th>
                   <th>إجراءات</th>
                 </tr>
               </thead>
               <tbody>
                 {filtered.map((m) => {
                   const memberTeams = teams.filter((t) =>
                     m.teamIds.includes(t.id),
                   );
                   return (
                     <tr key={m.id}>
                       <td data-label="الاسم">
                         <div
                           style={{
                             display: 'flex',
                             alignItems: 'center',
                             gap: 10,
                           }}
                         >
                           <Avatar name={m.name} size={30} variant="navy" />
                           <span style={{ fontWeight: 700 }}>{m.name}</span>
                         </div>
                       </td>
                       <td className="muted small" data-label="الدور">
                         {ROLE_LABEL[m.role]}
                       </td>
                       <td data-label="الفرق">
                         <div
                           style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}
                         >
                           {memberTeams.map((t) => (
                             <span key={t.id} className="badge">
                               {t.name}
                             </span>
                           ))}
                         </div>
                       </td>
                       <td
                         style={{ fontFamily: 'var(--font-en)' }}
                         data-label="الساعات"
                       >
                         {m.hours}
                       </td>
                       <td className="points" data-label="النقاط">
                         {hoursToPoints(m.hours)}
                       </td>
                       <td data-label="إجراءات">
                         <div style={{ display: 'flex', gap: 4 }}>
                           <button
                             type="button"
                             className="btn btn--ghost btn--xs"
                             onClick={() => openEdit(m)}
                           >
                             تعديل
                           </button>
                           <button
                             type="button"
                             className="btn btn--danger btn--xs"
                             onClick={() => setToDelete(m)}
                           >
                             حذف
                           </button>
                         </div>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
         )}

         <Modal
           open={creating || editing !== null}
           title={editing ? 'تعديل عضو' : 'إضافة عضو'}
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
           <FormField label="الاسم الكامل" required>
             <TextInput
               value={form.name}
               onChange={(v) => setForm({ ...form, name: v })}
               placeholder="الاسم الحقيقي"
             />
           </FormField>

           <FormField label="البريد الإلكتروني">
             <TextInput
               value={form.email || ''}
               onChange={(v) => setForm({ ...form, email: v })}
               type="email"
             />
           </FormField>

           <FormField label="الدور" required>
             <Select
               value={form.role}
               onChange={(v) => setForm({ ...form, role: v as RoleId })}
               options={ROLE_OPTIONS}
             />
           </FormField>

           <FormField label="الفرق" required>
             <MultiSelect
               values={form.teamIds}
               onChange={(v) =>
                 setForm({ ...form, teamIds: v as TeamId[] })
               }
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField label="اللجان">
             <MultiSelect
               values={form.committeeIds}
               onChange={(v) => setForm({ ...form, committeeIds: v })}
               options={committees.map((c) => ({
                 value: c.id,
                 label: c.icon + ' ' + c.nameAr,
               }))}
             />
           </FormField>

           <FormField label="الساعات">
             <NumberInput
               value={form.hours}
               onChange={(v) => setForm({ ...form, hours: v })}
               min={0}
             />
           </FormField>

           <FormField label="الحالة">
             <Select
               value={form.status}
               onChange={(v) =>
                 setForm({
                   ...form,
                   status: v as 'active' | 'inactive' | 'suspended',
                 })
               }
               options={[
                 { value: 'active', label: 'نشط' },
                 { value: 'inactive', label: 'غير نشط' },
                 { value: 'suspended', label: 'موقوف' },
               ]}
             />
           </FormField>

           <FormField label="نبذة">
             <TextArea
               value={form.bio || ''}
               onChange={(v) => setForm({ ...form, bio: v })}
               rows={2}
             />
           </FormField>
         </Modal>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف العضو"
           message={
             'سيتم حذف "' + (toDelete?.name || '') + '". هل أنت متأكد؟'
           }
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   