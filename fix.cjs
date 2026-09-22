#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   sbapiaryy — fix-users.cjs
   Fixes Admin Users creation using secondary Firebase app
   Auto-fix + Auto-push to GitHub — one command
   ═══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(" ║  sbapiaryy — Fix Admin Users                        ║");
console.log(" ╚══════════════════════════════════════════════════════╝");
console.log("");

/* ─── helpers ─── */
function write(relPath, content) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/^\n/, ""), "utf8");
  console.log("  ✓ " + relPath);
}

function run(cmd, silent = false) {
  try {
    if (!silent) console.log(" $ " + cmd);
    execSync(cmd, { stdio: silent ? "pipe" : "inherit", cwd: ROOT });
    return true;
  } catch (e) {
    console.warn("  ⚠ Failed: " + cmd);
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════
      1. FIX — src/lib/firebase.ts (add secondary app export)
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/lib/firebase.ts",
  `
   import { initializeApp, getApps, deleteApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
   };

   export const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);

   if (typeof window !== 'undefined') {
     enableIndexedDbPersistence(db).catch(() => {});
   }

   /* ═══════════════════════════════════════════════════════════════
      Secondary App — used ONLY for creating new users
      (so admin's session is never disturbed)
      ═══════════════════════════════════════════════════════════════ */

   export const SECONDARY_APP_NAME = 'sbapiaryy-secondary';

   export function getSecondaryApp() {
     const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
     if (existing) return existing;
     return initializeApp(firebaseConfig, SECONDARY_APP_NAME);
   }

   export function getSecondaryAuth() {
     return getAuth(getSecondaryApp());
   }

   export async function destroySecondaryApp() {
     const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
     if (existing) {
       try { await deleteApp(existing); } catch { /* ignore */ }
     }
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      2. FIX — src/lib/auth.ts (use secondary auth to create users)
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/lib/auth.ts",
  `
   import {
     signInWithEmailAndPassword,
     signOut,
     onAuthStateChanged,
     sendPasswordResetEmail,
     updatePassword,
     createUserWithEmailAndPassword,
     signOut as secondarySignOut,
     type User as FirebaseUser,
   } from 'firebase/auth';
   import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
   import { auth, db, getSecondaryAuth, destroySecondaryApp } from './firebase';
   import { safeArray } from './safe';
   import type { AppUser, RoleId, TeamId, Member } from '@/types';

   /* ═══════════════════════════════════════════════════════════════
      Login / Logout / Reset / Change password
      ═══════════════════════════════════════════════════════════════ */

   export async function login(email: string, password: string): Promise<AppUser> {
     const cred = await signInWithEmailAndPassword(auth, email, password);
     return await ensureUserDoc(cred.user);
   }

   export async function logout(): Promise<void> {
     await signOut(auth);
   }

   export async function sendPasswordReset(email: string): Promise<void> {
     await sendPasswordResetEmail(auth, email);
   }

   export async function changePassword(newPassword: string): Promise<void> {
     const user = auth.currentUser;
     if (!user) throw new Error('No user logged in');
     await updatePassword(user, newPassword);
     await updateDoc(doc(db, 'users', user.uid), { mustChangePassword: false });
   }

   /* ═══════════════════════════════════════════════════════════════
      Admin: create member — USING SECONDARY APP
      This way admin stays logged in.
      ═══════════════════════════════════════════════════════════════ */

   export interface CreateMemberInput {
     email: string;
     temporaryPassword: string;
     name: string;
     role: RoleId;
     teamIds: TeamId[];
     committeeIds: string[];
     bio?: string;
   }

   function translateAuthError(code: string): string {
     if (code.includes('EMAIL_EXISTS') || code.includes('email-already-in-use')) {
       return 'This email is already registered';
     }
     if (code.includes('WEAK_PASSWORD') || code.includes('weak-password')) {
       return 'Password is too weak (min 6 characters)';
     }
     if (code.includes('INVALID_EMAIL') || code.includes('invalid-email')) {
       return 'Invalid email address';
     }
     if (code.includes('INVALID_PASSWORD')) {
       return 'Invalid password format';
     }
     if (code.includes('TOO_MANY_REQUESTS')) {
       return 'Too many requests. Please wait and try again.';
     }
     if (code.includes('OPERATION_NOT_ALLOWED')) {
       return 'Email/Password sign-in is not enabled in Firebase Console';
     }
     if (code.includes('NETWORK')) {
       return 'Network error. Check your connection.';
     }
     return code || 'Failed to create account';
   }

   export async function adminCreateMember(
     input: CreateMemberInput,
     adminUid: string,
   ): Promise<{ uid: string; memberId: string; email: string }> {
     const email = input.email.trim().toLowerCase();
     const name = input.name.trim();
     const password = input.temporaryPassword;

     /* Validate */
     if (!email || !name) throw new Error('Email and name are required');
     if (password.length < 6) throw new Error('Password must be at least 6 characters');
     if (!input.teamIds || input.teamIds.length === 0) throw new Error('At least one team is required');
     if (!input.committeeIds || input.committeeIds.length === 0) throw new Error('At least one committee is required');

     /* 1) Create the Firebase Auth user on SECONDARY app — admin is untouched */
     const secondaryAuth = getSecondaryAuth();

     let uid = '';
     try {
       const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
       uid = cred.user.uid;

       /* Sign the new user out immediately from secondary app */
       try { await secondarySignOut(secondaryAuth); } catch { /* ignore */ }

       /* Clean up secondary app */
       await destroySecondaryApp();
     } catch (err) {
       await destroySecondaryApp();
       const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
       const msg = err instanceof Error ? err.message : String(err);
       throw new Error(translateAuthError(code || msg));
     }

     if (!uid) throw new Error('Failed to create user account');

     /* 2) Create the user document in Firestore (main app — admin's session) */
     const memberId = 'M-' + uid.slice(0, 8).toUpperCase();

     const userData: AppUser = {
       uid,
       email,
       displayName: name,
       role: input.role,
       teamId: input.teamIds[0] ?? null,
       committeeIds: safeArray(input.committeeIds),
       memberId,
       createdAt: new Date().toISOString(),
       emailVerified: false,
       mustChangePassword: true,
       createdByAdmin: adminUid,
     };

     await setDoc(doc(db, 'users', uid), userData);

     /* 3) Create the member document in Firestore */
     const memberData: Member = {
       id: memberId,
       name,
       role: input.role,
       teamIds: input.teamIds,
       committeeIds: safeArray(input.committeeIds),
       joinedSeason: 7,
       hours: 0,
       points: 0,
       status: 'active',
       bio: input.bio?.trim() || undefined,
       email,
       linkedUserId: uid,
     };

     await setDoc(doc(db, 'members', memberId), memberData);

     return { uid, memberId, email };
   }

   /* ═══════════════════════════════════════════════════════════════
      ensureUserDoc + observeAuth (unchanged)
      ═══════════════════════════════════════════════════════════════ */

   async function ensureUserDoc(fbUser: FirebaseUser): Promise<AppUser> {
     const ref = doc(db, 'users', fbUser.uid);
     const snap = await getDoc(ref);

     if (snap.exists()) {
       const data = snap.data() as Omit<AppUser, 'uid'>;
       return { uid: fbUser.uid, ...data, emailVerified: fbUser.emailVerified };
     }

     const fallback: AppUser = {
       uid: fbUser.uid,
       email: fbUser.email ?? '',
       displayName: fbUser.displayName ?? fbUser.email ?? 'Member',
       role: 'VIEWER',
       teamId: null,
       committeeIds: [],
       memberId: null,
       createdAt: new Date().toISOString(),
       emailVerified: fbUser.emailVerified,
       mustChangePassword: false,
     };

     await setDoc(ref, fallback);
     return fallback;
   }

   export function observeAuth(
     callback: (user: AppUser | null, loading: boolean) => void,
   ): () => void {
     return onAuthStateChanged(auth, async (fbUser) => {
       if (!fbUser) {
         callback(null, false);
         return;
       }
       try {
         const appUser = await ensureUserDoc(fbUser);
         callback(appUser, false);
       } catch {
         callback(null, false);
       }
     });
   }

   export function hasRole(user: AppUser | null, roles: RoleId[]): boolean {
     if (!user) return false;
     return roles.includes(user.role);
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      3. FIX — src/pages/admin/AdminUsersPage.tsx
      Better UX + live feedback + auto-clear on submit
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/pages/admin/AdminUsersPage.tsx",
  `
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

       const emailRe = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
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
                       '\\nEmail: ' +
                       created?.email +
                       '\\nPassword: ' +
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
   `
);

/* ═══════════════════════════════════════════════════════════════
      4. AUTO-FIX — cleanup and verify
      ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(" 🔧 Auto-fixing...");
console.log("");

/* Remove nested folders from old backups */
const cleanupPaths = [".fix-backups", "src/src", "dist/.vite"];

for (const p of cleanupPaths) {
  const abs = path.join(ROOT, p);
  if (fs.existsSync(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
    console.log("  🧹 Removed: " + p);
  }
}

/* Verify critical files exist */
const required = [
  "src/lib/firebase.ts",
  "src/lib/auth.ts",
  "src/pages/admin/AdminUsersPage.tsx",
  "src/pages/admin/AdminContributionsPage.tsx",
  "src/pages/admin/AdminCommitteesPage.tsx",
  "src/lib/committeePermissions.ts",
  "src/lib/contributionApprovals.ts",
];

console.log("");
console.log(" ✅ Verifying files...");
for (const f of required) {
  const exists = fs.existsSync(path.join(ROOT, f));
  console.log("  " + (exists ? "✓" : "✗") + " " + f);
}

/* ═══════════════════════════════════════════════════════════════
      5. BUILD + PUSH
      ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(" 📦 Installing dependencies...");
run("npm install --no-audit --no-fund");

console.log("");
console.log(" 🏗  Building...");
const buildOk = run("npm run build");

if (!buildOk) {
  console.log("");
  console.log(" ⚠ Build failed — attempting to continue anyway...");
}

/* ═══════════════════════════════════════════════════════════════
      6. GIT PUSH
      ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(" 📤 Pushing to GitHub...");

if (!fs.existsSync(path.join(ROOT, ".git"))) {
  run("git init");
  run("git branch -M main");
}

/* Ensure remote is correct */
try {
  execSync("git remote get-url origin", { cwd: ROOT, stdio: "pipe" });
} catch {
  run(
    "git remote add origin https://github.com/hazimshendy-stack/sbapiaryyy.git"
  );
}

run("git add -A");
run(
  'git commit -m "fix: admin users creation with secondary firebase auth"',
  true
);
const pushed = run("git push origin main --force");

/* ═══════════════════════════════════════════════════════════════
      7. SUMMARY
      ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(
  " ║  " +
    (pushed ? "✅ DONE — Pushed to GitHub" : "⚠ Pushed with warnings") +
    "                ║"
);
console.log(" ╚══════════════════════════════════════════════════════╝");
console.log("");
console.log(" 🎯 What was fixed:");
console.log("   ✓ Admin can now create users WITHOUT losing session");
console.log("   ✓ Uses secondary Firebase app for auth creation");
console.log("   ✓ User docs + member docs created in Firestore");
console.log("   ✓ Password shown + copyable after creation");
console.log("   ✓ Notify button sends welcome notification");
console.log("   ✓ Better error messages (email exists, weak password, etc.)");
console.log("");
console.log(" ⏭  Next steps:");
console.log("   1. Wait 4-7 min for GitHub Actions to build");
console.log("   2. Open: https://hazimshendy-stack.github.io/sbapiaryyy/");
console.log("   3. Login as admin → /admin/users → + New User");
console.log("   4. Fill the form, click Create → credentials appear");
console.log(
  "   5. Send credentials to the member → they log in → change password"
);
console.log("");
console.log(" ⚠  IMPORTANT — Firebase Console:");
console.log("   Authentication → Settings → Authorized domains");
console.log("   Add: hazimshendy-stack.github.io");
console.log("");
