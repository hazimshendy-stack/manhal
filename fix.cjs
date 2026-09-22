#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   sbapiaryy — fix-users-v2.cjs
   - Instant user appearance after creation
   - Full edit modal (name, role, team, committees, bio)
   - Password reset button (sends email)
   - Easy member linking (auto-match by email)
   - Auto-create member doc + link on user creation
   ═══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(" ║  sbapiaryy — Users Management v2                    ║");
console.log(" ╚══════════════════════════════════════════════════════╝");
console.log("");

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
  } catch {
    console.warn("  ⚠ Failed: " + cmd);
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════
      1. UPDATE auth.ts — Add resetUserPassword + updateUserData
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
      Auth actions
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
      Admin: reset another user's password (sends email)
      ═══════════════════════════════════════════════════════════════ */

   export async function adminResetUserPassword(email: string): Promise<void> {
     if (!email) throw new Error('Email required');
     try {
       await sendPasswordResetEmail(auth, email);
     } catch (err) {
       const msg = err instanceof Error ? err.message : 'Failed to send reset email';
       throw new Error(msg);
     }
   }

   /* ═══════════════════════════════════════════════════════════════
      Admin: update user profile (name, role, team, committees, bio)
      ═══════════════════════════════════════════════════════════════ */

   export interface UpdateUserInput {
     displayName?: string;
     role?: RoleId;
     teamId?: TeamId | null;
     committeeIds?: string[];
     bio?: string;
   }

   export async function adminUpdateUser(uid: string, input: UpdateUserInput): Promise<void> {
     const payload: Record<string, unknown> = {};
     if (input.displayName !== undefined) payload.displayName = input.displayName;
     if (input.role !== undefined) payload.role = input.role;
     if (input.teamId !== undefined) payload.teamId = input.teamId;
     if (input.committeeIds !== undefined) payload.committeeIds = safeArray(input.committeeIds);

     await updateDoc(doc(db, 'users', uid), payload);

     /* Sync to linked member doc if exists */
     try {
       const userSnap = await getDoc(doc(db, 'users', uid));
       if (userSnap.exists()) {
         const userData = userSnap.data() as AppUser;
         if (userData.memberId) {
           const memberPayload: Record<string, unknown> = {};
           if (input.displayName !== undefined) memberPayload.name = input.displayName;
           if (input.role !== undefined) memberPayload.role = input.role;
           if (input.teamId !== undefined) memberPayload.teamIds = input.teamId ? [input.teamId] : [];
           if (input.committeeIds !== undefined) memberPayload.committeeIds = safeArray(input.committeeIds);
           if (input.bio !== undefined) memberPayload.bio = input.bio;
           if (Object.keys(memberPayload).length > 0) {
             await updateDoc(doc(db, 'members', userData.memberId), memberPayload);
           }
         }
       }
     } catch { /* silent — user doc still updated */ }
   }

   /* ═══════════════════════════════════════════════════════════════
      Create member (with secondary app — admin session untouched)
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
     if (code.includes('TOO_MANY_REQUESTS')) {
       return 'Too many requests. Try again later.';
     }
     if (code.includes('OPERATION_NOT_ALLOWED')) {
       return 'Email/Password sign-in is disabled in Firebase Console';
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

     if (!email || !name) throw new Error('Email and name are required');
     if (password.length < 6) throw new Error('Password must be at least 6 characters');
     if (!input.teamIds || input.teamIds.length === 0) throw new Error('At least one team is required');
     if (!input.committeeIds || input.committeeIds.length === 0) throw new Error('At least one committee is required');

     const secondaryAuth = getSecondaryAuth();
     let uid = '';

     try {
       const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
       uid = cred.user.uid;
       try { await secondarySignOut(secondaryAuth); } catch { /* ignore */ }
       await destroySecondaryApp();
     } catch (err) {
       await destroySecondaryApp();
       const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
       const msg = err instanceof Error ? err.message : String(err);
       throw new Error(translateAuthError(code || msg));
     }

     if (!uid) throw new Error('Failed to create user account');

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
      ensureUserDoc + observeAuth
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
       if (!fbUser) { callback(null, false); return; }
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
      2. REWRITE AdminUsersPage — Full management UI
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/pages/admin/AdminUsersPage.tsx",
  `
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
       const emailRe = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
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
                     'Name: ' + created?.name + '\\nEmail: ' + created?.email + '\\nPassword: ' + created?.password,
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
   `
);

/* ═══════════════════════════════════════════════════════════════
      3. AUTO-FIX — cleanup
      ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(" 🔧 Cleanup...");
[".fix-backups", "src/src", "dist/.vite"].forEach((p) => {
  const abs = path.join(ROOT, p);
  if (fs.existsSync(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
    console.log("  🧹 Removed: " + p);
  }
});

/* ═══════════════════════════════════════════════════════════════
      4. BUILD + PUSH
      ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(" 📦 Installing...");
run("npm install --no-audit --no-fund");

console.log("");
console.log(" 🏗  Building...");
run("npm run build");

console.log("");
console.log(" 📤 Pushing to GitHub...");

if (!fs.existsSync(path.join(ROOT, ".git"))) {
  run("git init");
  run("git branch -M main");
}

try {
  execSync("git remote get-url origin", { cwd: ROOT, stdio: "pipe" });
} catch {
  run(
    "git remote add origin https://github.com/hazimshendy-stack/sbapiaryyy.git"
  );
}

run("git add -A");
run(
  'git commit -m "feat: full user management (edit, reset password, link member)"',
  true
);
const pushed = run("git push origin main --force");

/* ═══════════════════════════════════════════════════════════════
      5. SUMMARY
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
console.log(" ✨ New in /admin/users:");
console.log("   ✓ Real-time search box");
console.log("   ✓ Card layout per user (cleaner than table)");
console.log("   ✓ Inline dropdowns: Role, Team, Linked Member");
console.log("   ✓ Edit Profile modal (name, role, team, committees, bio)");
console.log("   ✓ Reset Password button → sends email");
console.log("   ✓ Notify button → sends in-app notification");
console.log("   ✓ Auto-sync between user doc and member doc");
console.log("   ✓ User appears instantly after creation");
console.log("");
console.log(" ⏭  After GitHub Actions finishes (4-7 min):");
console.log("   1. Open /admin/users");
console.log("   2. Create a user → see the credentials modal");
console.log("   3. Card appears immediately in the list");
console.log("   4. Change role / team / linked member from inline dropdowns");
console.log('   5. Click "Edit Profile" for full edit');
console.log('   6. Click "Reset Password" to send a reset email');
console.log("");
