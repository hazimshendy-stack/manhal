   import { useState, useMemo } from 'react';
   import { Link } from 'react-router-dom';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { updateOne, removeOne } from '@/lib/db';
   import {
     adminCreateMember,
     adminResetUserPassword,
     adminUpdateUser,
     type UpdateUserInput,
   } from '@/lib/auth';
   import { logAudit } from '@/lib/audit';
   import { notifyUser } from '@/lib/notifications';
   import { teams } from '@/data/teams';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextInput, Select, MultiSelect, TextArea } from '@/components/ui/FormField';
   import { Badge } from '@/components/ui/Badge';
   import { Avatar } from '@/components/ui/Avatar';
   import { toast } from '@/components/ui/Toast';
   import type { AppUser, RoleId, TeamId, Member, Committee } from '@/types';
import { useState } from 'react';
import { useMemo } from 'react';
import { Loading } from '@/components/ui/Loading';
import { FormField } from '@/components/ui/FormField';
import { TextInput } from '@/components/ui/FormField';
import { TextArea } from '@/components/ui/FormField';
import { Select } from '@/components/ui/FormField';
import { MultiSelect } from '@/components/ui/FormField';
import { updateOne } from '@/lib/db';
import { removeOne } from '@/lib/db';
import { login } from '@/lib/auth';
import { adminCreateMember } from '@/lib/auth';
import { adminUpdateUser } from '@/lib/auth';
import { adminResetUserPassword } from '@/lib/auth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { committees } from '@/data/committees';
import { members } from '@/data/members';

   const ROLE_OPTS: Array<{ value: RoleId; label: string }> = (
     Object.entries(ROLE_LABEL) as Array<[RoleId, string]>
   ).map(([value, label]) => ({ value, label }));

   const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

   function genPass(): string {
     let p = '';
     for (let i = 0; i < 10; i += 1) {
       p += PASSWORD_CHARS.charAt(Math.floor(Math.random() * PASSWORD_CHARS.length));
     }
     return p + '@1';
   }

   function copyToClipboard(text: string, label: string) {
     if (navigator.clipboard && navigator.clipboard.writeText) {
       navigator.clipboard.writeText(text)
         .then(() => toast.success(label + ' copied'))
         .catch(() => toast.error('Copy failed'));
     } else {
       const ta = document.createElement('textarea');
       ta.value = text;
       document.body.appendChild(ta);
       ta.select();
       try { document.execCommand('copy'); toast.success(label + ' copied'); }
       catch { toast.error('Copy failed'); }
       document.body.removeChild(ta);
     }
   }

   export function AdminUsersPage() {
     const { user: me } = useAuth();
     const { data: users, loading } = useCollection<AppUser>('users');
     const { data: liveMembers } = useCollection<Member>('members');
     const { data: liveCommittees } = useCollection<Committee>('committees');

     /* ─── Create form ─── */
     const [open, setOpen] = useState(false);
     const [busy, setBusy] = useState(false);
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState(genPass());
     const [name, setName] = useState('');
     const [role, setRole] = useState<RoleId>('MEMBER');
     const [teamId, setTeamId] = useState<TeamId>('helpers');
     const [committeeIds, setCommitteeIds] = useState<string[]>([]);
     const [bio, setBio] = useState('');

     /* ─── Credentials modal ─── */
     const [created, setCreated] = useState<{
       email: string; password: string; name: string;
     } | null>(null);

     /* ─── Edit modal ─── */
     const [editUser, setEditUser] = useState<AppUser | null>(null);
     const [editForm, setEditForm] = useState<UpdateUserInput>({});
     const [editBusy, setEditBusy] = useState(false);

     /* ─── Password reset ─── */
     const [resetTarget, setResetTarget] = useState<AppUser | null>(null);
     const [resetBusy, setResetBusy] = useState(false);

     /* ─── Delete ─── */
     const [toDelete, setToDelete] = useState<AppUser | null>(null);
     const [deleteBusy, setDeleteBusy] = useState(false);

     /* ─── Search ─── */
     const [search, setSearch] = useState('');

     const filteredUsers = useMemo(() => {
       const q = search.trim().toLowerCase();
       if (!q) return users;
       return users.filter(
         (u) =>
           u.displayName.toLowerCase().includes(q) ||
           u.email.toLowerCase().includes(q),
       );
     }, [users, search]);

     const committees = useMemo(
       () => liveCommittees.map((c) => ({ id: c.id, nameAr: c.nameAr })),
       [liveCommittees],
     );

     const resetForm = () => {
       setEmail('');
       setPassword(genPass());
       setName('');
       setRole('MEMBER');
       setTeamId('helpers');
       setCommitteeIds([]);
       setBio('');
     };

     /* ═══════════════════════════════════════════════════════════
        CREATE
        ═══════════════════════════════════════════════════════════ */

     const handleCreate = async () => {
       if (!email.trim() || !name.trim()) {
         toast.error('Missing data', 'Email and name required');
         return;
       }
       const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRe.test(email.trim())) {
         toast.error('Invalid email');
         return;
       }
       if (password.length < 6) {
         toast.error('Password too weak', 'Min 6 characters');
         return;
       }
       if (committeeIds.length === 0) {
         toast.error('Committee required', 'Select at least one');
         return;
       }

       setBusy(true);
       try {
         const result = await adminCreateMember(
           {
             email: email.trim(),
             temporaryPassword: password,
             name: name.trim(),
             role,
             teamIds: [teamId],
             committeeIds,
             bio: bio.trim() || undefined,
           },
           me?.uid ?? 'system',
         );

         try {
           await logAudit(me, 'CREATE_USER', 'User', result.uid, 'Created: ' + name);
         } catch { /* ignore */ }

         setCreated({ email: result.email, password, name: name.trim() });
         setOpen(false);
         resetForm();
         toast.success('User created', 'Appears in list instantly');
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'Creation failed';
         toast.error('Failed', msg);
       } finally {
         setBusy(false);
       }
     };

     /* ═══════════════════════════════════════════════════════════
        EDIT — open modal with prefilled form
        ═══════════════════════════════════════════════════════════ */

     const openEdit = (u: AppUser) => {
       setEditUser(u);
       setEditForm({
         displayName: u.displayName,
         role: u.role,
         teamId: u.teamId ?? null,
         committeeIds: u.committeeIds ?? [],
       });
     };

     const saveEdit = async () => {
       if (!editUser) return;
       setEditBusy(true);
       try {
         await adminUpdateUser(editUser.uid, editForm);
         try {
           await logAudit(me, 'UPDATE_USER', 'User', editUser.uid, 'Updated profile');
         } catch { /* ignore */ }
         toast.success('User updated');
         setEditUser(null);
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'Update failed';
         toast.error('Failed', msg);
       } finally {
         setEditBusy(false);
       }
     };

     /* ═══════════════════════════════════════════════════════════
        RESET PASSWORD — sends email
        ═══════════════════════════════════════════════════════════ */

     const confirmReset = async () => {
       if (!resetTarget) return;
       setResetBusy(true);
       try {
         await adminResetUserPassword(resetTarget.email);
         try {
           await logAudit(me, 'RESET_PASSWORD', 'User', resetTarget.uid, 'Password reset email sent');
         } catch { /* ignore */ }

         /* Also notify in-app */
         try {
           await notifyUser(
             resetTarget.uid,
             'Password reset requested',
             'A password reset email was sent to your inbox. Check your email.',
             'system',
             '/dashboard',
             'high',
             me?.displayName,
           );
         } catch { /* ignore */ }

         toast.success('Reset email sent', 'Check ' + resetTarget.email);
         setResetTarget(null);
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'Reset failed';
         toast.error('Failed', msg);
       } finally {
         setResetBusy(false);
       }
     };

     /* ═══════════════════════════════════════════════════════════
        QUICK ACTIONS (inline)
        ═══════════════════════════════════════════════════════════ */

     const changeRole = async (uid: string, newRole: RoleId) => {
       try {
         await updateOne('users', uid, { role: newRole });
         try { await logAudit(me, 'CHANGE_ROLE', 'User', uid, 'Role → ' + newRole); } catch { /* ignore */ }
         toast.success('Role updated');
       } catch { toast.error('Failed'); }
     };

     const changeTeam = async (uid: string, newTeam: TeamId) => {
       try {
         await updateOne('users', uid, { teamId: newTeam });
         try { await logAudit(me, 'CHANGE_TEAM', 'User', uid, 'Team → ' + newTeam); } catch { /* ignore */ }
         toast.success('Team updated');
       } catch { toast.error('Failed'); }
     };

     const linkMember = async (uid: string, memberId: string) => {
       try {
         await updateOne('users', uid, { memberId: memberId || null });
         if (memberId) {
           await updateOne('members', memberId, { linkedUserId: uid });
         }
         try { await logAudit(me, 'LINK_MEMBER', 'User', uid, 'Member → ' + memberId); } catch { /* ignore */ }
         toast.success('Member linked');
       } catch { toast.error('Failed'); }
     };

     const sendWelcome = async (u: AppUser) => {
       try {
         await notifyUser(
           u.uid,
           'Welcome to sbapiaryy',
           'Your account is ready. Please change your password if you have not already.',
           'system',
           '/dashboard',
           'normal',
           me?.displayName,
         );
         toast.success('Notification sent to ' + u.displayName);
       } catch { toast.error('Failed to send'); }
     };

     /* ═══════════════════════════════════════════════════════════
        DELETE
        ═══════════════════════════════════════════════════════════ */

     const confirmDelete = async () => {
       if (!toDelete) return;
       setDeleteBusy(true);
       try {
         await removeOne('users', toDelete.uid);
         try {
           await logAudit(me, 'DELETE_USER', 'User', toDelete.uid, 'Deleted user doc');
         } catch { /* ignore */ }
         toast.success('User removed');
         setToDelete(null);
       } catch {
         toast.error('Failed to delete');
       } finally {
         setDeleteBusy(false);
       }
     };

     /* ═══════════════════════════════════════════════════════════
        RENDER
        ═══════════════════════════════════════════════════════════ */

     return (
       <div className="admin-page">
         <PageHeader
           eyebrow="Admin"
           title="Users"
           description="Create, edit, and manage accounts. Changes appear instantly."
         />

         <div className="toolbar">
           <input
             className="input"
             type="search"
             placeholder="Search by name or email..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
           <button
             type="button"
             className="btn btn--primary"
             onClick={() => { resetForm(); setOpen(true); }}
           >
             + New User
           </button>
         </div>

         <SectionHeader
           eyebrow="List"
           title={'Users (' + filteredUsers.length + ')'}
         />

         {loading ? (
           <SkeletonList count={6} />
         ) : filteredUsers.length === 0 ? (
           <EmptyState
             title={search ? 'No matches' : 'No users yet'}
             message={search ? 'Try a different search.' : 'Create the first user.'}
           />
         ) : (
           <div className="stack">
             {filteredUsers.map((u) => {
               const linkedMember = liveMembers.find((m) => m.id === u.memberId);
               const userCommittees = liveCommittees.filter(
                 (c) => Array.isArray(u.committeeIds) && u.committeeIds.includes(c.id),
               );
               return (
                 <div key={u.uid} className="card no-click">
                   {/* ─── Header ─── */}
                   <div className="row row--between" style={{ gap: 12 }}>
                     <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0 }}>
                       <Avatar name={u.displayName} size={48} variant="navy" />
                       <div style={{ flex: 1, minWidth: 0 }}>
                         <div className="card__title" style={{ fontSize: '1rem' }}>
                           {u.displayName}
                           {u.mustChangePassword ? (
                             <Badge variant="warning" className="mt-2">New</Badge>
                           ) : null}
                         </div>
                         <div className="card__meta" dir="ltr" style={{ textAlign: 'start' }}>
                           {u.email}
                         </div>
                       </div>
                     </div>
                     <Badge variant="navy">{ROLE_LABEL[u.role]}</Badge>
                   </div>

                   {/* ─── Meta row ─── */}
                   <div className="row mt-3" style={{ gap: 8, flexWrap: 'wrap' }}>
                     {u.teamId ? (
                       <Badge variant="info">
                         {teams.find((t) => t.id === u.teamId)?.name ?? u.teamId}
                       </Badge>
                     ) : null}
                     {userCommittees.map((c) => (
                       <Badge key={c.id} variant="neutral">{c.nameAr}</Badge>
                     ))}
                     {linkedMember ? (
                       <Link to={'/members/' + linkedMember.id}>
                         <Badge variant="success">
                           Linked: {linkedMember.name}
                         </Badge>
                       </Link>
                     ) : (
                       <Badge variant="danger">Not linked to member</Badge>
                     )}
                   </div>

                   {/* ─── Inline controls ─── */}
                   <div className="row mt-4" style={{ gap: 10, flexWrap: 'wrap' }}>
                     <div style={{ flex: '1 1 180px', minWidth: 160 }}>
                       <div className="tiny muted" style={{ marginBottom: 4 }}>Role</div>
                       <select
                         className="input"
                         value={u.role}
                         onChange={(e) => changeRole(u.uid, e.target.value as RoleId)}
                       >
                         {ROLE_OPTS.map((o) => (
                           <option key={o.value} value={o.value}>{o.label}</option>
                         ))}
                       </select>
                     </div>

                     <div style={{ flex: '1 1 140px', minWidth: 130 }}>
                       <div className="tiny muted" style={{ marginBottom: 4 }}>Team</div>
                       <select
                         className="input"
                         value={u.teamId ?? ''}
                         onChange={(e) => changeTeam(u.uid, e.target.value as TeamId)}
                       >
                         <option value="">— None —</option>
                         {teams.map((t) => (
                           <option key={t.id} value={t.id}>{t.name}</option>
                         ))}
                       </select>
                     </div>

                     <div style={{ flex: '1 1 180px', minWidth: 160 }}>
                       <div className="tiny muted" style={{ marginBottom: 4 }}>Linked Member</div>
                       <select
                         className="input"
                         value={u.memberId ?? ''}
                         onChange={(e) => linkMember(u.uid, e.target.value)}
                       >
                         <option value="">— Not linked —</option>
                         {liveMembers.map((m) => (
                           <option key={m.id} value={m.id}>{m.name}</option>
                         ))}
                       </select>
                     </div>
                   </div>

                   {/* ─── Actions ─── */}
                   <div className="row mt-4" style={{ gap: 8, justifyContent: 'flex-end', paddingTop: 14, borderTop: '1px solid var(--c-line)' }}>
                     <button
                       type="button"
                       className="btn btn--ghost btn--sm"
                       onClick={() => openEdit(u)}
                     >
                       Edit Profile
                     </button>
                     <button
                       type="button"
                       className="btn btn--ghost btn--sm"
                       onClick={() => setResetTarget(u)}
                     >
                       Reset Password
                     </button>
                     <button
                       type="button"
                       className="btn btn--ghost btn--sm"
                       onClick={() => sendWelcome(u)}
                     >
                       Notify
                     </button>
                     <button
                       type="button"
                       className="btn btn--danger btn--sm"
                       onClick={() => setToDelete(u)}
                     >
                       Delete
                     </button>
                   </div>
                 </div>
               );
             })}
           </div>
         )}

         {/* ═══════════════════════════════════════════════════════
            CREATE MODAL
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={open}
           title="Create New User"
           onClose={() => setOpen(false)}
           wide
           footer={
             <>
               <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)} disabled={busy}>
                 Cancel
               </button>
               <button type="button" className="btn btn--primary" onClick={handleCreate} disabled={busy}>
                 {busy ? 'Creating...' : 'Create Account'}
               </button>
             </>
           }
         >
           <p className="small muted" style={{ marginBottom: 18, lineHeight: 1.7 }}>
             The user will appear immediately. They can log in with this email
             and password, and will be asked to change their password on first login.
           </p>

           <FormField label="Full name" required>
             <TextInput value={name} onChange={setName} placeholder="e.g. Ahmed Mohamed" />
           </FormField>

           <FormField label="Email" required>
             <TextInput value={email} onChange={setEmail} type="email" placeholder="name@resala-stem.org" />
           </FormField>

           <FormField label="Temporary password" required hint="Min 6 characters">
             <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
               <TextInput value={password} onChange={setPassword} type="text" />
               <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPassword(genPass())}>
                 Generate
               </button>
               <button type="button" className="btn btn--ghost btn--sm" onClick={() => copyToClipboard(password, 'Password')}>
                 Copy
               </button>
             </div>
           </FormField>

           <FormField label="Role" required>
             <Select value={role} onChange={(v) => setRole(v as RoleId)} options={ROLE_OPTS} />
           </FormField>

           <FormField label="Team" required>
             <Select
               value={teamId}
               onChange={(v) => setTeamId(v as TeamId)}
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField
             label="Committees"
             required
             hint={committees.length === 0 ? 'Create a committee first from /admin/committees' : 'At least one required'}
           >
             <MultiSelect
               values={committeeIds}
               onChange={setCommitteeIds}
               options={committees.map((c) => ({ value: c.id, label: c.nameAr }))}
             />
           </FormField>

           <FormField label="Short bio">
             <TextInput value={bio} onChange={setBio} placeholder="Optional" />
           </FormField>
         </Modal>

         {/* ═══════════════════════════════════════════════════════
            CREDENTIALS MODAL
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={created !== null}
           title="✓ Account Created"
           onClose={() => setCreated(null)}
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={() =>
                   copyToClipboard(
                     'Name: ' + created?.name + '\nEmail: ' + created?.email + '\nPassword: ' + created?.password,
                     'All credentials',
                   )
                 }
               >
                 Copy All
               </button>
               <button type="button" className="btn btn--primary" onClick={() => setCreated(null)}>
                 Done
               </button>
             </>
           }
         >
           <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
             Send these credentials to the member:
           </p>
           <div style={{
             background: 'var(--c-off-white)',
             border: '1px solid var(--c-line)',
             borderRadius: 'var(--radius-sm)',
             padding: 16,
             fontSize: '0.9rem',
             lineHeight: 2,
           }}>
             <div><strong>Name:</strong> {created?.name}</div>
             <div style={{ wordBreak: 'break-all', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
               <span><strong>Email:</strong> <span dir="ltr">{created?.email}</span></span>
               <button type="button" className="btn btn--ghost btn--xs" onClick={() => copyToClipboard(created?.email || '', 'Email')}>Copy</button>
             </div>
             <div style={{ wordBreak: 'break-all', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
               <span><strong>Password:</strong> <span dir="ltr" style={{ fontFamily: 'var(--font-en)' }}>{created?.password}</span></span>
               <button type="button" className="btn btn--ghost btn--xs" onClick={() => copyToClipboard(created?.password || '', 'Password')}>Copy</button>
             </div>
           </div>
           <p style={{ fontSize: '0.82rem', color: 'var(--c-ink-muted)', marginTop: 16, lineHeight: 1.7 }}>
             ⚠ Save these somewhere safe. Password will not be shown again.
           </p>
         </Modal>

         {/* ═══════════════════════════════════════════════════════
            EDIT MODAL
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={editUser !== null}
           title={'Edit: ' + (editUser?.displayName ?? '')}
           onClose={() => setEditUser(null)}
           wide
           footer={
             <>
               <button type="button" className="btn btn--ghost" onClick={() => setEditUser(null)} disabled={editBusy}>
                 Cancel
               </button>
               <button type="button" className="btn btn--primary" onClick={saveEdit} disabled={editBusy}>
                 {editBusy ? 'Saving...' : 'Save Changes'}
               </button>
             </>
           }
         >
           <FormField label="Display name" required>
             <TextInput
               value={editForm.displayName ?? ''}
               onChange={(v) => setEditForm({ ...editForm, displayName: v })}
             />
           </FormField>

           <FormField label="Role" required>
             <Select
               value={editForm.role ?? 'MEMBER'}
               onChange={(v) => setEditForm({ ...editForm, role: v as RoleId })}
               options={ROLE_OPTS}
             />
           </FormField>

           <FormField label="Team">
             <Select
               value={editForm.teamId ?? ''}
               onChange={(v) => setEditForm({ ...editForm, teamId: (v as TeamId) || null })}
               options={[{ value: '', label: '— None —' }, ...teams.map((t) => ({ value: t.id, label: t.name }))]}
             />
           </FormField>

           <FormField label="Committees">
             <MultiSelect
               values={editForm.committeeIds ?? []}
               onChange={(v) => setEditForm({ ...editForm, committeeIds: v })}
               options={committees.map((c) => ({ value: c.id, label: c.nameAr }))}
             />
           </FormField>

           <FormField label="Bio">
             <TextArea
               value={editForm.bio ?? ''}
               onChange={(v) => setEditForm({ ...editForm, bio: v })}
               rows={2}
             />
           </FormField>
         </Modal>

         {/* ═══════════════════════════════════════════════════════
            RESET PASSWORD MODAL
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={resetTarget !== null}
           title="Reset Password"
           onClose={() => setResetTarget(null)}
           footer={
             <>
               <button type="button" className="btn btn--ghost" onClick={() => setResetTarget(null)} disabled={resetBusy}>
                 Cancel
               </button>
               <button type="button" className="btn btn--primary" onClick={confirmReset} disabled={resetBusy}>
                 {resetBusy ? 'Sending...' : 'Send Reset Email'}
               </button>
             </>
           }
         >
           <p style={{ lineHeight: 1.8 }}>
             A password reset link will be sent to:
           </p>
           <div style={{
             background: 'var(--c-off-white)',
             borderRadius: 'var(--radius-sm)',
             padding: 14,
             marginTop: 10,
             fontFamily: 'var(--font-en)',
             direction: 'ltr',
             textAlign: 'start',
           }}>
             {resetTarget?.email}
           </div>
           <p style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', marginTop: 14, lineHeight: 1.7 }}>
             The user will receive an email with a link to set a new password.
             Their current password will remain valid until they change it.
           </p>
         </Modal>

         {/* ═══════════════════════════════════════════════════════
            DELETE CONFIRM
            ═══════════════════════════════════════════════════════ */}

         <ConfirmDialog
           open={toDelete !== null}
           title="Delete User"
           message={'Remove "' + (toDelete?.displayName || '') + '" from Firestore? The Firebase Auth account must be deleted manually from Firebase Console if needed.'}
           confirmLabel="Delete"
           danger
           busy={deleteBusy}
           onConfirm={confirmDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   