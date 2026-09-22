   import { useState, useMemo } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { updateOne, removeOne } from '@/lib/db';
   import { adminCreateMember } from '@/lib/auth';
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
   import { FormField, TextInput, Select, MultiSelect } from '@/components/ui/FormField';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import type { AppUser, RoleId, TeamId, Member, Committee } from '@/types';

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
         .then(() => toast.success(label + ' copied to clipboard'))
         .catch(() => toast.error('Copy failed — copy manually'));
     } else {
       /* Fallback for older browsers */
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

     /* ─── Create form state ─── */
     const [open, setOpen] = useState(false);
     const [busy, setBusy] = useState(false);
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState(genPass());
     const [name, setName] = useState('');
     const [role, setRole] = useState<RoleId>('MEMBER');
     const [teamId, setTeamId] = useState<TeamId>('helpers');
     const [committeeIds, setCommitteeIds] = useState<string[]>([]);
     const [bio, setBio] = useState('');

     /* ─── Result state ─── */
     const [created, setCreated] = useState<{
       email: string;
       password: string;
       name: string;
     } | null>(null);

     /* ─── Delete state ─── */
     const [toDelete, setToDelete] = useState<string | null>(null);
     const [deleting, setDeleting] = useState(false);

     /* ─── Edit state ─── */
     const [editUser, setEditUser] = useState<AppUser | null>(null);

     const members = useMemo(
       () => liveMembers.map((m) => ({ id: m.id, name: m.name })),
       [liveMembers],
     );

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
        CREATE USER
        ═══════════════════════════════════════════════════════════ */

     const handleCreate = async () => {
       if (!email.trim() || !name.trim()) {
         toast.error('Missing data', 'Email and name are required');
         return;
       }

       const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRe.test(email.trim())) {
         toast.error('Invalid email', 'Please enter a valid email address');
         return;
       }

       if (password.length < 6) {
         toast.error('Weak password', 'Must be at least 6 characters');
         return;
       }

       if (committeeIds.length === 0) {
         toast.error('Committee required', 'Please select at least one committee');
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

         /* Audit log */
         try {
           await logAudit(me, 'CREATE_USER', 'User', result.uid, 'Created account: ' + name);
         } catch { /* ignore */ }

         /* Show credentials to admin */
         setCreated({
           email: result.email,
           password,
           name: name.trim(),
         });

         /* Auto-close create form + reset */
         setOpen(false);
         resetForm();

         toast.success('Account created successfully', 'Send the credentials to the member');
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'Failed to create account';
         toast.error('Creation failed', msg);
       } finally {
         setBusy(false);
       }
     };

     /* ═══════════════════════════════════════════════════════════
        CHANGE ROLE / TEAM / MEMBER LINK
        ═══════════════════════════════════════════════════════════ */

     const changeRole = async (uid: string, newRole: RoleId) => {
       try {
         await updateOne('users', uid, { role: newRole });
         try { await logAudit(me, 'CHANGE_ROLE', 'User', uid, 'Role → ' + newRole); } catch { /* ignore */ }
         toast.success('Role updated');
       } catch {
         toast.error('Failed to update role');
       }
     };

     const changeTeam = async (uid: string, newTeam: TeamId) => {
       try {
         await updateOne('users', uid, { teamId: newTeam });
         try { await logAudit(me, 'CHANGE_TEAM', 'User', uid, 'Team → ' + newTeam); } catch { /* ignore */ }
         toast.success('Team updated');
       } catch {
         toast.error('Failed to update team');
       }
     };

     const linkMember = async (uid: string, memberId: string) => {
       try {
         await updateOne('users', uid, { memberId: memberId || null });
         if (memberId) {
           await updateOne('members', memberId, { linkedUserId: uid });
         }
         try { await logAudit(me, 'LINK_MEMBER', 'User', uid, 'Linked member: ' + memberId); } catch { /* ignore */ }
         toast.success('Member linked');
       } catch {
         toast.error('Failed to link member');
       }
     };

     /* ═══════════════════════════════════════════════════════════
        SEND CREDENTIALS NOTIFICATION
        ═══════════════════════════════════════════════════════════ */

     const sendNotification = async (uid: string, userName: string) => {
       try {
         await notifyUser(
           uid,
           'Welcome to sbapiaryy',
           'Your account is ready. Please check your credentials and change your password on first login.',
           'system',
           '/dashboard',
           'high',
           me?.displayName,
         );
         toast.success('Notification sent to ' + userName);
       } catch {
         toast.error('Failed to send notification');
       }
     };

     /* ═══════════════════════════════════════════════════════════
        DELETE USER
        ═══════════════════════════════════════════════════════════ */

     const handleDelete = async () => {
       if (!toDelete) return;
       setDeleting(true);
       try {
         await removeOne('users', toDelete);
         try { await logAudit(me, 'DELETE_USER', 'User', toDelete, 'Deleted'); } catch { /* ignore */ }
         toast.success('User removed from Firestore');
         toast.info('Note', 'Auth account still exists — delete it from Firebase Console if needed');
         setToDelete(null);
       } catch {
         toast.error('Failed to delete user');
       } finally {
         setDeleting(false);
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
           description="Create accounts with email + password. They can log in immediately."
         />

         <SectionHeader
           eyebrow="List"
           title={'Users (' + users.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={() => {
                 resetForm();
                 setOpen(true);
               }}
             >
               + New User
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={6} />
         ) : users.length === 0 ? (
           <EmptyState
             title="No users yet"
             message="Start by creating the first user."
             action={
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={() => {
                   resetForm();
                   setOpen(true);
                 }}
               >
                 + Create First User
               </button>
             }
           />
         ) : (
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>Name</th>
                   <th>Email</th>
                   <th>Role</th>
                   <th>Team</th>
                   <th>Member</th>
                   <th>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {users.map((u) => (
                   <tr key={u.uid}>
                     <td data-label="Name" style={{ fontWeight: 700 }}>
                       {u.displayName}
                       {u.mustChangePassword ? (
                         <Badge variant="warning" className="mt-2">New</Badge>
                       ) : null}
                     </td>
                     <td className="muted small" data-label="Email" dir="ltr">
                       {u.email}
                     </td>
                     <td data-label="Role">
                       <select
                         className="input"
                         value={u.role}
                         onChange={(e) => changeRole(u.uid, e.target.value as RoleId)}
                         style={{ minWidth: 170 }}
                       >
                         {ROLE_OPTS.map((o) => (
                           <option key={o.value} value={o.value}>
                             {o.label}
                           </option>
                         ))}
                       </select>
                     </td>
                     <td data-label="Team">
                       <select
                         className="input"
                         value={u.teamId ?? ''}
                         onChange={(e) => changeTeam(u.uid, e.target.value as TeamId)}
                         style={{ minWidth: 130 }}
                       >
                         <option value="">— None —</option>
                         {teams.map((t) => (
                           <option key={t.id} value={t.id}>
                             {t.name}
                           </option>
                         ))}
                       </select>
                     </td>
                     <td data-label="Member">
                       <select
                         className="input"
                         value={u.memberId ?? ''}
                         onChange={(e) => linkMember(u.uid, e.target.value)}
                         style={{ minWidth: 150 }}
                       >
                         <option value="">— Not linked —</option>
                         {members.map((m) => (
                           <option key={m.id} value={m.id}>
                             {m.name}
                           </option>
                         ))}
                       </select>
                     </td>
                     <td data-label="Actions">
                       <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                         <button
                           type="button"
                           className="btn btn--ghost btn--xs"
                           onClick={() => sendNotification(u.uid, u.displayName)}
                           title="Send welcome notification"
                         >
                           Notify
                         </button>
                         <button
                           type="button"
                           className="btn btn--ghost btn--xs"
                           onClick={() => setEditUser(u)}
                         >
                           Details
                         </button>
                         <button
                           type="button"
                           className="btn btn--danger btn--xs"
                           onClick={() => setToDelete(u.uid)}
                         >
                           Delete
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}

         {/* ═══════════════════════════════════════════════════════
            CREATE USER MODAL
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={open}
           title="Create New User"
           onClose={() => setOpen(false)}
           wide
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={() => setOpen(false)}
                 disabled={busy}
               >
                 Cancel
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={handleCreate}
                 disabled={busy}
               >
                 {busy ? 'Creating...' : 'Create Account'}
               </button>
             </>
           }
         >
           <p
             className="small muted"
             style={{ marginBottom: 18, lineHeight: 1.7 }}
           >
             The user will be created immediately with this email and password.
             They can log in right away and will be asked to change their password
             on first login.
           </p>

           <FormField label="Full name" required>
             <TextInput
               value={name}
               onChange={setName}
               placeholder="e.g. Ahmed Mohamed"
             />
           </FormField>

           <FormField label="Email" required>
             <TextInput
               value={email}
               onChange={setEmail}
               type="email"
               placeholder="name@resala-stem.org"
             />
           </FormField>

           <FormField
             label="Temporary password"
             required
             hint="The user must change it on first login. Min 6 characters."
           >
             <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
               <TextInput value={password} onChange={setPassword} type="text" />
               <button
                 type="button"
                 className="btn btn--ghost btn--sm"
                 onClick={() => setPassword(genPass())}
                 style={{ flexShrink: 0 }}
               >
                 Generate
               </button>
               <button
                 type="button"
                 className="btn btn--ghost btn--sm"
                 onClick={() => copyToClipboard(password, 'Password')}
                 style={{ flexShrink: 0 }}
                 title="Copy password"
               >
                 Copy
               </button>
             </div>
           </FormField>

           <FormField label="Role" required>
             <Select
               value={role}
               onChange={(v) => setRole(v as RoleId)}
               options={ROLE_OPTS}
             />
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
             hint={
               committees.length === 0
                 ? 'No committees yet — create one from /admin/committees first'
                 : 'At least one committee is required'
             }
           >
             <MultiSelect
               values={committeeIds}
               onChange={setCommitteeIds}
               options={committees.map((c) => ({
                 value: c.id,
                 label: c.nameAr,
               }))}
             />
           </FormField>

           <FormField label="Short bio">
             <TextInput
               value={bio}
               onChange={setBio}
               placeholder="Optional — e.g. Frontend developer"
             />
           </FormField>
         </Modal>

         {/* ═══════════════════════════════════════════════════════
            CREATED ACCOUNT MODAL — credentials
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={created !== null}
           title="✓ Account Created Successfully"
           onClose={() => setCreated(null)}
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={() =>
                   copyToClipboard(
                     'Name: ' +
                       created?.name +
                       '\nEmail: ' +
                       created?.email +
                       '\nPassword: ' +
                       created?.password,
                     'All credentials',
                   )
                 }
               >
                 Copy All
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={() => setCreated(null)}
               >
                 Got it
               </button>
             </>
           }
         >
           <p
             style={{
               lineHeight: 1.8,
               marginBottom: 16,
               color: 'var(--c-ink-soft)',
             }}
           >
             Send these credentials to the member. They can log in immediately
             at <strong>/login</strong> and will be asked to change their
             password on first login.
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
             <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
               <div>
                 <strong>Name:</strong> {created?.name}
               </div>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', wordBreak: 'break-all' }}>
               <div>
                 <strong>Email:</strong>{' '}
                 <span dir="ltr">{created?.email}</span>
               </div>
               <button
                 type="button"
                 className="btn btn--ghost btn--xs"
                 onClick={() => copyToClipboard(created?.email || '', 'Email')}
               >
                 Copy
               </button>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', wordBreak: 'break-all' }}>
               <div>
                 <strong>Password:</strong>{' '}
                 <span dir="ltr" style={{ fontFamily: 'var(--font-en)' }}>
                   {created?.password}
                 </span>
               </div>
               <button
                 type="button"
                 className="btn btn--ghost btn--xs"
                 onClick={() => copyToClipboard(created?.password || '', 'Password')}
               >
                 Copy
               </button>
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
             ⚠ Save these credentials somewhere safe before closing this window.
             The password will not be shown again.
           </p>
         </Modal>

         {/* ═══════════════════════════════════════════════════════
            DETAILS MODAL
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={editUser !== null}
           title="User Details"
           onClose={() => setEditUser(null)}
         >
           {editUser ? (
             <>
               <div className="kv">
                 <span className="kv__k">Name</span>
                 <span className="kv__v">{editUser.displayName}</span>
               </div>
               <div className="kv mt-3">
                 <span className="kv__k">Email</span>
                 <span className="kv__v" dir="ltr">
                   {editUser.email}
                 </span>
               </div>
               <div className="kv mt-3">
                 <span className="kv__k">Role</span>
                 <span className="kv__v">{ROLE_LABEL[editUser.role]}</span>
               </div>
               <div className="kv mt-3">
                 <span className="kv__k">UID</span>
                 <span className="kv__v" dir="ltr" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                   {editUser.uid}
                 </span>
               </div>
               {editUser.teamId ? (
                 <div className="kv mt-3">
                   <span className="kv__k">Team</span>
                   <span className="kv__v">
                     {teams.find((t) => t.id === editUser.teamId)?.name}
                   </span>
                 </div>
               ) : null}
               {editUser.memberId ? (
                 <div className="kv mt-3">
                   <span className="kv__k">Linked Member</span>
                   <span className="kv__v">
                     {members.find((m) => m.id === editUser.memberId)?.name}
                   </span>
                 </div>
               ) : null}
             </>
           ) : null}
         </Modal>

         {/* ═══════════════════════════════════════════════════════
            DELETE CONFIRMATION
            ═══════════════════════════════════════════════════════ */}

         <ConfirmDialog
           open={toDelete !== null}
           title="Delete User"
           message="This removes the user from Firestore. The Auth account will still exist in Firebase Console and must be deleted manually if needed. Continue?"
           confirmLabel="Delete"
           danger
           busy={deleting}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   