import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { adminCreateMember, type CreateMemberInput } from '@/lib/auth';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import {
     FormField,
     TextInput,
     Select,
     MultiSelect,
   } from '@/components/ui/FormField';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import type { AppUser, RoleId, TeamId } from '@/types';

   const ROLE_OPTIONS: Array<{ value: RoleId; label: string }> = (
     Object.entries(ROLE_LABEL) as Array<[RoleId, string]>
   ).map(([value, label]) => ({ value, label }));

   function generatePassword(): string {
     const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
     let pass = '';
     for (let i = 0; i < 10; i += 1) {
       pass += chars.charAt(Math.floor(Math.random() * chars.length));
     }
     return pass + '@1';
   }

   export function AdminUsersPage() {
     const { user: me } = useAuth();
     const { data: users, loading } = useCollection<AppUser>('users');

     const [openCreate, setOpenCreate] = useState(false);
     const [openEdit, setOpenEdit] = useState<AppUser | null>(null);
     const [toDelete, setToDelete] = useState<string | null>(null);
     const [busy, setBusy] = useState(false);

     // Form state
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState(generatePassword());
     const [name, setName] = useState('');
     const [role, setRole] = useState<RoleId>('MEMBER');
     const [teamId, setTeamId] = useState<TeamId>('helpers');
     const [committeeIds, setCommitteeIds] = useState<string[]>([]);
     const [bio, setBio] = useState('');
     const [createdAccount, setCreatedAccount] = useState<{
       email: string;
       password: string;
       name: string;
     } | null>(null);

     const resetForm = () => {
       setEmail('');
       setPassword(generatePassword());
       setName('');
       setRole('MEMBER');
       setTeamId('helpers');
       setCommitteeIds([]);
       setBio('');
     };

     const handleCreate = async () => {
       if (!email.trim() || !password || !name.trim()) {
         toast.error('البيانات ناقصة', 'البريد، كلمة المرور، والاسم مطلوبة');
         return;
       }
       if (password.length < 6) {
         toast.error('كلمة المرور ضعيفة', 'يجب 6 أحرف على الأقل');
         return;
       }
       setBusy(true);
       try {
         const input: CreateMemberInput = {
           email: email.trim(),
           temporaryPassword: password,
           name: name.trim(),
           role,
           teamIds: [teamId],
           committeeIds,
           bio: bio.trim() || undefined,
         };

         await adminCreateMember(input, me?.uid ?? 'system');
         await logAudit(me, 'CREATE_USER', 'User', email, 'إنشاء حساب: ' + name);

         setCreatedAccount({
           email: input.email,
           password: input.temporaryPassword,
           name: input.name,
         });

         toast.success(
           'تم إنشاء الحساب',
           'أرسل بيانات الدخول للعضو',
         );
         resetForm();
         setOpenCreate(false);
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل الإنشاء';
         toast.error('فشل الإنشاء', msg);
       } finally {
         setBusy(false);
       }
     };

     const changeRole = async (uid: string, newRole: RoleId) => {
       try {
         await updateOne('users', uid, { role: newRole });
         await logAudit(me, 'CHANGE_ROLE', 'User', uid, 'تغيير الدور إلى ' + newRole);
         toast.success('تم تغيير الدور');
       } catch {
         toast.error('فشل التغيير');
       }
     };

     const changeTeam = async (uid: string, newTeam: TeamId) => {
       try {
         await updateOne('users', uid, { teamId: newTeam });
         await logAudit(me, 'CHANGE_TEAM', 'User', uid, 'تغيير الفريق إلى ' + newTeam);
         toast.success('تم تغيير الفريق');
       } catch {
         toast.error('فشل التغيير');
       }
     };

     const linkMember = async (uid: string, memberId: string) => {
       try {
         await updateOne('users', uid, { memberId: memberId || null });
         if (memberId) {
           await updateOne('members', memberId, { linkedUserId: uid });
         }
         await logAudit(me, 'LINK_MEMBER', 'User', uid, 'ربط عضو');
         toast.success('تم الربط');
       } catch {
         toast.error('فشل الربط');
       }
     };

     const handleDelete = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('users', toDelete);
         await logAudit(me, 'DELETE_USER', 'User', toDelete, 'حذف مستخدم');
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
           title="المستخدمون"
           description="إنشاء الحسابات، تغيير الأدوار، وربط الأعضاء."
         />

         <SectionHeader
           eyebrow="القائمة"
           title={'المستخدمون (' + users.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={() => {
                 resetForm();
                 setOpenCreate(true);
               }}
             >
               + مستخدم جديد
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={6} />
         ) : users.length === 0 ? (
           <EmptyState
             icon="👤"
             title="لا مستخدمين"
             message="ابدأ بإنشاء أول مستخدم."
           />
         ) : (
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>الاسم</th>
                   <th>البريد</th>
                   <th>الدور</th>
                   <th>الفريق</th>
                   <th>العضو</th>
                   <th>إجراءات</th>
                 </tr>
               </thead>
               <tbody>
                 {users.map((u) => (
                   <tr key={u.uid}>
                     <td data-label="الاسم" style={{ fontWeight: 700 }}>
                       {u.displayName}
                       {u.mustChangePassword ? (
                         <Badge variant="warning" className="mt-2">جديد</Badge>
                       ) : null}
                     </td>
                     <td className="muted small" data-label="البريد" dir="ltr">
                       {u.email}
                     </td>
                     <td data-label="الدور">
                       <select
                         className="input"
                         value={u.role}
                         onChange={(e) =>
                           changeRole(u.uid, e.target.value as RoleId)
                         }
                         style={{ minWidth: 140 }}
                       >
                         {ROLE_OPTIONS.map((o) => (
                           <option key={o.value} value={o.value}>
                             {o.label}
                           </option>
                         ))}
                       </select>
                     </td>
                     <td data-label="الفريق">
                       <select
                         className="input"
                         value={u.teamId ?? ''}
                         onChange={(e) =>
                           changeTeam(u.uid, e.target.value as TeamId)
                         }
                         style={{ minWidth: 120 }}
                       >
                         <option value="">— بدون —</option>
                         {teams.map((t) => (
                           <option key={t.id} value={t.id}>
                             {t.name}
                           </option>
                         ))}
                       </select>
                     </td>
                     <td data-label="العضو">
                       <select
                         className="input"
                         value={u.memberId ?? ''}
                         onChange={(e) => linkMember(u.uid, e.target.value)}
                         style={{ minWidth: 140 }}
                       >
                         <option value="">— غير مرتبط —</option>
                         {members.map((m) => (
                           <option key={m.id} value={m.id}>
                             {m.name}
                           </option>
                         ))}
                       </select>
                     </td>
                     <td data-label="إجراءات">
                       <div style={{ display: 'flex', gap: 4 }}>
                         <button
                           type="button"
                           className="btn btn--ghost btn--xs"
                           onClick={() => setOpenEdit(u)}
                         >
                           تفاصيل
                         </button>
                         <button
                           type="button"
                           className="btn btn--danger btn--xs"
                           onClick={() => setToDelete(u.uid)}
                         >
                           حذف
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}

         {/* Create Modal */}
         <Modal
           open={openCreate}
           title="إنشاء مستخدم جديد"
           onClose={() => setOpenCreate(false)}
           wide
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={() => setOpenCreate(false)}
               >
                 إلغاء
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={handleCreate}
                 disabled={busy}
               >
                 {busy ? '...' : 'إنشاء'}
               </button>
             </>
           }
         >
           <FormField label="الاسم الكامل" required>
             <TextInput
               value={name}
               onChange={setName}
               placeholder="مثال: أحمد محمد"
             />
           </FormField>

           <FormField label="البريد الإلكتروني" required>
             <TextInput
               value={email}
               onChange={setEmail}
               type="email"
               placeholder="name@resala-stem.org"
             />
           </FormField>

           <FormField
             label="كلمة المرور المؤقتة"
             required
             hint="سيُطلب من العضو تغييرها عند أول دخول"
           >
             <div style={{ display: 'flex', gap: 8 }}>
               <TextInput
                 value={password}
                 onChange={setPassword}
                 type="text"
               />
               <button
                 type="button"
                 className="btn btn--ghost btn--sm"
                 onClick={() => setPassword(generatePassword())}
               >
                 توليد
               </button>
             </div>
           </FormField>

           <FormField label="الدور" required>
             <Select
               value={role}
               onChange={(v) => setRole(v as RoleId)}
               options={ROLE_OPTIONS}
             />
           </FormField>

           <FormField label="الفريق" required>
             <Select
               value={teamId}
               onChange={(v) => setTeamId(v as TeamId)}
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField label="اللجان">
             <MultiSelect
               values={committeeIds}
               onChange={setCommitteeIds}
               options={committees.map((c) => ({
                 value: c.id,
                 label: c.icon + ' ' + c.nameAr,
               }))}
             />
           </FormField>

           <FormField label="نبذة قصيرة">
             <TextInput
               value={bio}
               onChange={setBio}
               placeholder="مثال: مطور واجهات"
             />
           </FormField>
         </Modal>

         {/* Show created account info */}
         <Modal
           open={createdAccount !== null}
           title="✓ تم إنشاء الحساب"
           onClose={() => setCreatedAccount(null)}
           footer={
             <button
               type="button"
               className="btn btn--primary"
               onClick={() => setCreatedAccount(null)}
             >
               فهمت
             </button>
           }
         >
           <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
             أرسل بيانات الدخول التالية إلى العضو:
           </p>
           <div
             style={{
               background: 'var(--c-off-white)',
               border: '1px solid var(--c-line)',
               borderRadius: 'var(--radius-sm)',
               padding: 16,
               fontSize: '0.9rem',
               lineHeight: 2,
             }}
           >
             <div>
               <strong>الاسم:</strong> {createdAccount?.name}
             </div>
             <div style={{ wordBreak: 'break-all' }}>
               <strong>البريد:</strong>{' '}
               <span dir="ltr">{createdAccount?.email}</span>
             </div>
             <div style={{ wordBreak: 'break-all' }}>
               <strong>كلمة المرور:</strong>{' '}
               <span dir="ltr" style={{ fontFamily: 'var(--font-en)' }}>
                 {createdAccount?.password}
               </span>
             </div>
           </div>
           <p
             style={{
               fontSize: '0.82rem',
               color: 'var(--c-ink-muted)',
               marginTop: 16,
               lineHeight: 1.7,
             }}
           >
             ⚠️ سيُطلب من العضو تغيير كلمة المرور عند أول تسجيل دخول. احفظ هذه
             البيانات في مكان آمن قبل الإغلاق.
           </p>
         </Modal>

         {/* Edit Modal */}
         <Modal
           open={openEdit !== null}
           title={'تفاصيل المستخدم'}
           onClose={() => setOpenEdit(null)}
         >
           {openEdit ? (
             <>
               <div className="kv">
                 <span className="kv__k">الاسم</span>
                 <span className="kv__v">{openEdit.displayName}</span>
               </div>
               <div className="kv mt-3">
                 <span className="kv__k">البريد</span>
                 <span className="kv__v" dir="ltr">
                   {openEdit.email}
                 </span>
               </div>
               <div className="kv mt-3">
                 <span className="kv__k">الدور</span>
                 <span className="kv__v">{ROLE_LABEL[openEdit.role]}</span>
               </div>
               {openEdit.teamId ? (
                 <div className="kv mt-3">
                   <span className="kv__k">الفريق</span>
                   <span className="kv__v">
                     {teams.find((t) => t.id === openEdit.teamId)?.name}
                   </span>
                 </div>
               ) : null}
               {openEdit.memberId ? (
                 <div className="kv mt-3">
                   <span className="kv__k">العضو المرتبط</span>
                   <span className="kv__v">
                     {members.find((m) => m.id === openEdit.memberId)?.name}
                   </span>
                 </div>
               ) : null}
             </>
           ) : null}
         </Modal>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف المستخدم"
           message="هل أنت متأكد؟ لا يمكن التراجع عن هذه العملية."
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   