#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   sbapiaryy — add-registration.cjs
   Self-registration + admin approval flow
   ═══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(" ║  sbapiaryy — Add Registration                       ║");
console.log(" ║  Self-signup + Admin approval                       ║");
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
      1. TYPES — add status to AppUser
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/types/index.ts",
  `
   export type RoleId =
     | 'HEAD' | 'VICE'
     | 'HEAD_HR_GLOBAL'
     | 'HEAD_HR_TEAM'
     | 'PRESIDENT' | 'VICE_PRESIDENT'
     | 'HR'
     | 'COMMITTEE_HR'
     | 'MEMBER' | 'VIEWER';

   export type TeamId = 'helpers' | 'heroes' | 'coders' | 'enviros' | 'messages' | 'masar' | 'rstc';

   export type UserStatus = 'active' | 'pending' | 'rejected';

   export type RequestType = 'TRANSFER' | 'PROMOTION' | 'RESIGNATION' | 'COMPLAINT' | 'SUGGESTION' | 'LEAVE';
   export type RequestStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
   export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
   export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
   export type ContributionStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
   export type ConversationType = 'private' | 'team' | 'general';
   export type NotificationType = 'approval' | 'request' | 'participation' | 'achievement' | 'system' | 'warning' | 'message';

   export interface AppUser {
     uid: string;
     email: string;
     displayName: string;
     role: RoleId;
     teamId?: TeamId | null;
     committeeIds?: string[];
     memberId?: string | null;
     createdAt?: string;
     emailVerified?: boolean;
     mustChangePassword?: boolean;
     createdByAdmin?: string;
     status?: UserStatus;
     /* Self-registration extras */
     preferredTeamId?: TeamId | null;
     registrationNote?: string;
     approvedAt?: string;
     approvedBy?: string;
     rejectionReason?: string;
   }

   export interface Role { id: RoleId; name: string; nameEn: string; level: number; }
   export interface Team { id: TeamId; name: string; nameAr: string; description: string; color: string; }

   export interface Committee {
     id: string;
     name: string;
     nameAr: string;
     description: string;
     color: string;
     icon: string;
     teamId?: TeamId | null;
   }

   export interface Member {
     id: string;
     name: string;
     role: RoleId;
     teamIds?: TeamId[];
     committeeIds?: string[];
     joinedSeason?: number;
     hours?: number;
     points?: number;
     status?: 'active' | 'inactive' | 'suspended';
     bio?: string;
     email?: string;
     linkedUserId?: string;
   }

   export interface ContributionApproval {
     stage: 1 | 2 | 3;
     status: 'pending' | 'approved' | 'rejected' | 'skipped';
     approvedBy?: string;
     approvedByName?: string;
     approvedByRole?: string;
     approvedAt?: string;
     comment?: string;
     points?: number;
   }

   export interface Contribution {
     id: string;
     memberId: string;
     memberName?: string;
     teamId: TeamId;
     committeeId?: string;
     category?: string;
     title: string;
     description?: string;
     date: string;
     hours?: number;
     points?: number;
     status?: ContributionStatus;
     seasonId?: string;
     createdBy?: string;
     approvals?: ContributionApproval[];
     currentStage?: 1 | 2 | 3 | 4;
   }

   export interface ApprovalStep {
     id: string;
     requestId: string;
     order: number;
     requiredRole: RoleId;
     requiredTeamId?: TeamId | null;
     approverUid?: string;
     approverName?: string;
     status: ApprovalStatus;
     comment?: string;
     actionDate?: string;
   }

   export interface RequestRecord {
     id: string;
     type: RequestType;
     requesterUid: string;
     requesterMemberId?: string;
     requesterName?: string;
     subjectMemberId?: string;
     fromTeamId?: TeamId;
     toTeamId?: TeamId;
     title: string;
     description?: string;
     status: RequestStatus;
     currentStepOrder: number;
     priority: Priority;
     submittedAt: string;
     updatedAt: string;
     seasonId?: string;
   }

   export interface WarningRecord {
     id: string;
     memberId: string;
     memberName?: string;
     type: 'VERBAL' | 'WRITTEN' | 'FINAL';
     reason: string;
     severity: 'LOW' | 'MEDIUM' | 'HIGH';
     issuedByMemberId?: string;
     issuedByName?: string;
     issuedAt: string;
     status: 'active' | 'resolved';
     notes?: string;
   }

   export interface Achievement {
     id: string;
     title: string;
     description: string;
     date: string;
     level?: 'branch' | 'national' | 'international';
     teamIds?: TeamId[];
     memberIds?: string[];
     memberNames?: string[];
     seasonId?: string;
   }

   export interface Notification {
     id: string;
     userId: string;
     title: string;
     message: string;
     type: NotificationType;
     date: string;
     read?: boolean;
     route?: string;
     priority?: 'low' | 'normal' | 'high';
     fromName?: string;
   }

   export interface Conversation {
     id: string;
     type: ConversationType;
     title?: string;
     participantUids?: string[];
     teamId?: TeamId;
     lastMessageAt?: string;
     lastMessageText?: string;
     lastMessageSender?: string;
     unreadCounts?: Record<string, number>;
     createdBy?: string;
   }

   export interface Message {
     id: string;
     conversationId: string;
     senderUid: string;
     senderName?: string;
     text: string;
     sentAt: string;
     readBy?: string[];
   }

   export interface CalendarEvent {
     id: string;
     title: string;
     description?: string;
     date: string;
     time?: string;
     endTime?: string;
     teamId?: TeamId | null;
     isPublic?: boolean;
     type?: 'meeting' | 'event' | 'deadline' | 'workshop';
     location?: string;
     participantUids?: string[];
     seasonId?: string;
     createdBy?: string;
     createdByName?: string;
   }

   export interface TimelineEvent {
     id: string;
     memberId?: string;
     memberName?: string;
     teamId?: TeamId;
     type: string;
     title: string;
     description?: string;
     date: string;
     relatedId?: string;
   }

   export interface AuditRecord {
     id: string;
     actorUid?: string;
     actorName?: string;
     action: string;
     entity?: string;
     entityId?: string;
     date: string;
     description?: string;
   }

   export interface GovernanceDocument {
     id: string;
     title: string;
     category: string;
     description?: string;
     content: string;
     version?: string;
     updatedAt: string;
   }

   export interface SiteConfig { name: string; tagline: string; description: string; organization: string; email: string; }
   export interface OnboardingCard { id: string; icon: string; title: string; description: string; accentColor: string; order: number; }
   export interface Season { id: string; label: string; labelEn: string; start: string; end: string; isActive: boolean; theme: string; }
   `
);

/* ═══════════════════════════════════════════════════════════════
      2. AUTH — add selfRegister + approve/reject functions
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
      Login / Logout / Reset
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
      SELF REGISTRATION — anyone can sign up
      Result: pending status, awaiting admin approval
      ═══════════════════════════════════════════════════════════════ */

   export interface RegisterSelfInput {
     email: string;
     password: string;
     name: string;
     preferredTeamId?: TeamId | null;
     note?: string;
   }

   function translateError(code: string): string {
     if (code.includes('EMAIL_EXISTS') || code.includes('email-already-in-use')) {
       return 'This email is already registered. Try logging in instead.';
     }
     if (code.includes('WEAK_PASSWORD') || code.includes('weak-password')) {
       return 'Password is too weak (min 6 characters)';
     }
     if (code.includes('INVALID_EMAIL') || code.includes('invalid-email')) {
       return 'Invalid email address';
     }
     if (code.includes('TOO_MANY_REQUESTS')) {
       return 'Too many attempts. Please wait and try again.';
     }
     if (code.includes('OPERATION_NOT_ALLOWED')) {
       return 'Registration is currently disabled in Firebase Console';
     }
     if (code.includes('NETWORK')) {
       return 'Network error. Check your connection.';
     }
     return code || 'Registration failed';
   }

   export async function registerSelf(
     input: RegisterSelfInput,
   ): Promise<{ uid: string; email: string }> {
     const email = input.email.trim().toLowerCase();
     const name = input.name.trim();
     const password = input.password;

     if (!email || !name) throw new Error('Email and name are required');
     if (password.length < 6) throw new Error('Password must be at least 6 characters');

     /* Create the Firebase Auth user on MAIN app — user will be auto-logged-in
        No need for secondary app here because there's no other session */
     let uid = '';
     try {
       const cred = await createUserWithEmailAndPassword(auth, email, password);
       uid = cred.user.uid;
     } catch (err) {
       const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
       const msg = err instanceof Error ? err.message : String(err);
       throw new Error(translateError(code || msg));
     }

     if (!uid) throw new Error('Registration failed');

     /* Create user doc with PENDING status */
     const userData: AppUser = {
       uid,
       email,
       displayName: name,
       role: 'VIEWER',                 /* No role until approved */
       teamId: null,
       committeeIds: [],
       memberId: null,
       createdAt: new Date().toISOString(),
       emailVerified: false,
       mustChangePassword: false,
       status: 'pending',              /* ⚑ Awaiting admin approval */
       preferredTeamId: input.preferredTeamId ?? null,
       registrationNote: input.note?.trim() || undefined,
     };

     await setDoc(doc(db, 'users', uid), userData);

     return { uid, email };
   }

   /* ═══════════════════════════════════════════════════════════════
      ADMIN: Approve pending user
      — Sets role, team, committees
      — Creates member doc
      — Updates status → active
      ═══════════════════════════════════════════════════════════════ */

   export interface ApproveUserInput {
     role: RoleId;
     teamIds: TeamId[];
     committeeIds: string[];
     bio?: string;
   }

   export async function adminApproveUser(
     pendingUser: AppUser,
     input: ApproveUserInput,
     adminUid: string,
   ): Promise<{ memberId: string }> {
     const uid = pendingUser.uid;

     if (!input.teamIds || input.teamIds.length === 0) {
       throw new Error('At least one team is required');
     }
     if (!input.committeeIds || input.committeeIds.length === 0) {
       throw new Error('At least one committee is required');
     }

     const memberId = 'M-' + uid.slice(0, 8).toUpperCase();

     /* Update user doc → active */
     await updateDoc(doc(db, 'users', uid), {
       role: input.role,
       teamId: input.teamIds[0] ?? null,
       committeeIds: safeArray(input.committeeIds),
       memberId,
       status: 'active',
       approvedAt: new Date().toISOString(),
       approvedBy: adminUid,
       rejectionReason: null,
     });

     /* Create member doc */
     const memberData: Member = {
       id: memberId,
       name: pendingUser.displayName,
       role: input.role,
       teamIds: input.teamIds,
       committeeIds: safeArray(input.committeeIds),
       joinedSeason: 7,
       hours: 0,
       points: 0,
       status: 'active',
       bio: input.bio?.trim() || undefined,
       email: pendingUser.email,
       linkedUserId: uid,
     };

     await setDoc(doc(db, 'members', memberId), memberData);

     return { memberId };
   }

   /* ═══════════════════════════════════════════════════════════════
      ADMIN: Reject pending user
      ═══════════════════════════════════════════════════════════════ */

   export async function adminRejectUser(
     uid: string,
     reason: string,
     adminUid: string,
   ): Promise<void> {
     if (!reason.trim()) throw new Error('Reason required');
     await updateDoc(doc(db, 'users', uid), {
       status: 'rejected',
       rejectionReason: reason.trim(),
       approvedBy: adminUid,
     });
   }

   /* ═══════════════════════════════════════════════════════════════
      ADMIN: reset another user's password
      ═══════════════════════════════════════════════════════════════ */

   export async function adminResetUserPassword(email: string): Promise<void> {
     if (!email) throw new Error('Email required');
     await sendPasswordResetEmail(auth, email);
   }

   /* ═══════════════════════════════════════════════════════════════
      ADMIN: update user profile
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
     } catch { /* silent */ }
   }

   /* ═══════════════════════════════════════════════════════════════
      ADMIN: create member directly (with secondary app)
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
       throw new Error(translateError(code || msg));
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
       status: 'active',
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
       return {
         uid: fbUser.uid,
         ...data,
         emailVerified: fbUser.emailVerified,
         /* Existing users with no status → active */
         status: data.status ?? 'active',
       };
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
       status: 'pending',
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
      3. Register page
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/pages/RegisterPage.tsx",
  `
   import { useState, type FormEvent } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { registerSelf } from '@/lib/auth';
   import { teams } from '@/data/teams';
   import { FormField, TextInput, Select, TextArea } from '@/components/ui/FormField';
   import type { TeamId } from '@/types';

   export function RegisterPage() {
     const nav = useNavigate();
     const [name, setName] = useState('');
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [confirm, setConfirm] = useState('');
     const [preferredTeam, setPreferredTeam] = useState<TeamId | ''>('');
     const [note, setNote] = useState('');
     const [error, setError] = useState('');
     const [busy, setBusy] = useState(false);

     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();
       setError('');

       if (password.length < 6) {
         setError('Password must be at least 6 characters');
         return;
       }
       if (password !== confirm) {
         setError('Passwords do not match');
         return;
       }

       setBusy(true);
       try {
         await registerSelf({
           email,
           password,
           name,
           preferredTeamId: (preferredTeam as TeamId) || null,
           note,
         });
         /* Auto-logged-in. RequireAuth will redirect to /pending-approval */
         nav('/pending-approval');
       } catch (err) {
         setError(err instanceof Error ? err.message : 'Registration failed');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div className="login-page">
         <div className="login-card" style={{ maxWidth: 520 }}>
           <div style={{ marginBottom: 24 }}>
             <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Create your account</h1>
             <p className="small muted" style={{ lineHeight: 1.7 }}>
               Fill in your info. Your account will be reviewed by the
               admin before you can access the platform.
             </p>
           </div>

           <form onSubmit={onSubmit}>
             <FormField label="Full name" required>
               <TextInput value={name} onChange={setName} placeholder="e.g. Ahmed Mohamed" />
             </FormField>

             <FormField label="Email" required>
               <TextInput value={email} onChange={setEmail} type="email" placeholder="name@resala-stem.org" />
             </FormField>

             <FormField label="Password" required hint="Min 6 characters">
               <input
                 className="login-input"
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="At least 6 characters"
                 autoComplete="new-password"
                 required
                 dir="ltr"
               />
             </FormField>

             <FormField label="Confirm password" required>
               <input
                 className="login-input"
                 type="password"
                 value={confirm}
                 onChange={(e) => setConfirm(e.target.value)}
                 placeholder="Repeat password"
                 autoComplete="new-password"
                 required
                 dir="ltr"
               />
             </FormField>

             <FormField
               label="Preferred team (optional)"
               hint="Just a preference — admin makes the final decision"
             >
               <Select
                 value={preferredTeam}
                 onChange={(v) => setPreferredTeam(v as TeamId | '')}
                 options={[
                   { value: '', label: '— No preference —' },
                   ...teams.map((t) => ({ value: t.id, label: t.name })),
                 ]}
               />
             </FormField>

             <FormField
               label="A short note (optional)"
               hint="Anything you want the admin to know"
             >
               <TextArea
                 value={note}
                 onChange={setNote}
                 rows={3}
                 placeholder="e.g. I have 2 years of experience in web development"
               />
             </FormField>

             {error ? <div className="login-error">{error}</div> : null}

             <button
               type="submit"
               className="login-submit"
               disabled={busy || !email || !name || !password || !confirm}
             >
               {busy ? '...' : 'Create Account'}
             </button>
           </form>

           <p className="login-back" style={{ marginTop: 20 }}>
             Already have an account? <Link to="/login">Sign in</Link>
           </p>
           <p className="login-back" style={{ marginTop: 6 }}>
             <Link to="/">Back to Home</Link>
           </p>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      4. Pending approval page
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/pages/PendingApprovalPage.tsx",
  `
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { Loading } from '@/components/ui/Loading';

   export function PendingApprovalPage() {
     const { user, loading } = useAuth();
     const nav = useNavigate();

     if (loading) return <Loading fullHeight />;

     if (!user) {
       return (
         <div className="login-page">
           <div className="login-card">
             <h1 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Session ended</h1>
             <p className="muted" style={{ lineHeight: 1.8, marginBottom: 20 }}>
               Please sign in again.
             </p>
             <button
               type="button"
               className="login-submit"
               onClick={() => nav('/login')}
             >
               Back to Login
             </button>
           </div>
         </div>
       );
     }

     const handleLogout = async () => {
       await logout();
       nav('/');
     };

     /* ─── Rejected state ─── */
     if (user.status === 'rejected') {
       return (
         <div className="login-page">
           <div className="login-card" style={{ maxWidth: 520 }}>
             <div
               style={{
                 display: 'inline-block',
                 padding: '6px 14px',
                 background: 'var(--c-red-tint)',
                 color: '#991B1B',
                 borderRadius: 'var(--radius-full)',
                 fontSize: '0.78rem',
                 fontWeight: 800,
                 letterSpacing: '0.06em',
                 marginBottom: 16,
               }}
             >
               REGISTRATION REJECTED
             </div>
             <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>
               Sorry, {user.displayName}
             </h1>
             <p className="muted" style={{ lineHeight: 1.8, marginBottom: 20 }}>
               Your registration request was not approved. If you think
               this is a mistake, please contact the administration.
             </p>
             {user.rejectionReason ? (
               <div
                 style={{
                   background: 'var(--c-off-white)',
                   border: '1px solid var(--c-line)',
                   borderRadius: 'var(--radius-sm)',
                   padding: 14,
                   fontSize: '0.9rem',
                   lineHeight: 1.7,
                   marginBottom: 20,
                   color: 'var(--c-ink-soft)',
                 }}
               >
                 <strong style={{ display: 'block', marginBottom: 4 }}>
                   Reason:
                 </strong>
                 {user.rejectionReason}
               </div>
             ) : null}
             <button
               type="button"
               className="btn btn--ghost btn--block"
               onClick={handleLogout}
             >
               Sign out
             </button>
           </div>
         </div>
       );
     }

     /* ─── Pending state (default) ─── */
     return (
       <div className="login-page">
         <div className="login-card" style={{ maxWidth: 520 }}>
           <div
             style={{
               display: 'inline-block',
               padding: '6px 14px',
               background: 'var(--c-amber-soft)',
               color: 'var(--c-amber-text)',
               borderRadius: 'var(--radius-full)',
               fontSize: '0.78rem',
               fontWeight: 800,
               letterSpacing: '0.06em',
               marginBottom: 16,
             }}
           >
             AWAITING APPROVAL
           </div>

           <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>
             Welcome, {user.displayName}!
           </h1>

           <p className="muted" style={{ lineHeight: 1.85, marginBottom: 20 }}>
             Your account has been created and is now waiting for an
             administrator to review and approve it. This usually takes
             a short time.
           </p>

           <div
             style={{
               background: 'var(--c-off-white)',
               border: '1px solid var(--c-line)',
               borderRadius: 'var(--radius-sm)',
               padding: 16,
               fontSize: '0.9rem',
               lineHeight: 1.9,
               marginBottom: 20,
             }}
           >
             <div>
               <strong>Email:</strong>{' '}
               <span dir="ltr">{user.email}</span>
             </div>
             <div>
               <strong>Status:</strong>{' '}
               <span style={{ color: 'var(--c-amber-text)', fontWeight: 700 }}>
                 Pending approval
               </span>
             </div>
             {user.preferredTeamId ? (
               <div>
                 <strong>Preferred team:</strong> {user.preferredTeamId}
               </div>
             ) : null}
           </div>

           <p
             className="small muted"
             style={{ lineHeight: 1.75, marginBottom: 20 }}
           >
             You will receive a notification once your account is approved.
             You can safely close this page and come back later.
           </p>

           <button
             type="button"
             className="btn btn--ghost btn--block"
             onClick={handleLogout}
           >
             Sign out
           </button>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      5. Admin Pending Users page
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/pages/admin/AdminPendingUsersPage.tsx",
  `
   import { useState, useMemo } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { adminApproveUser, adminRejectUser } from '@/lib/auth';
   import { logAudit } from '@/lib/audit';
   import { notifyUser } from '@/lib/notifications';
   import { teams } from '@/data/teams';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, Select, MultiSelect, TextArea } from '@/components/ui/FormField';
   import { Badge } from '@/components/ui/Badge';
   import { Avatar } from '@/components/ui/Avatar';
   import { toast } from '@/components/ui/Toast';
   import type { AppUser, RoleId, TeamId, Committee } from '@/types';

   const ROLE_OPTS: Array<{ value: RoleId; label: string }> = (
     Object.entries(ROLE_LABEL) as Array<[RoleId, string]>
   ).map(([value, label]) => ({ value, label }));

   type Tab = 'pending' | 'rejected' | 'all';

   export function AdminPendingUsersPage() {
     const { user: me } = useAuth();
     const { data: users, loading } = useCollection<AppUser>('users');
     const { data: liveCommittees } = useCollection<Committee>('committees');

     const [tab, setTab] = useState<Tab>('pending');

     /* Approve modal */
     const [approveTarget, setApproveTarget] = useState<AppUser | null>(null);
     const [approveRole, setApproveRole] = useState<RoleId>('MEMBER');
     const [approveTeam, setApproveTeam] = useState<TeamId>('helpers');
     const [approveCommittees, setApproveCommittees] = useState<string[]>([]);
     const [approveBusy, setApproveBusy] = useState(false);

     /* Reject modal */
     const [rejectTarget, setRejectTarget] = useState<AppUser | null>(null);
     const [rejectReason, setRejectReason] = useState('');
     const [rejectBusy, setRejectBusy] = useState(false);

     const pending = useMemo(
       () => users.filter((u) => u.status === 'pending'),
       [users],
     );
     const rejected = useMemo(
       () => users.filter((u) => u.status === 'rejected'),
       [users],
     );

     const list = useMemo(() => {
       if (tab === 'pending') return pending;
       if (tab === 'rejected') return rejected;
       return users;
     }, [tab, pending, rejected, users]);

     const committees = useMemo(
       () => liveCommittees.map((c) => ({ id: c.id, nameAr: c.nameAr })),
       [liveCommittees],
     );

     /* ═══════════════════════════════════════════════════════════
        Approve handlers
        ═══════════════════════════════════════════════════════════ */

     const openApprove = (u: AppUser) => {
       setApproveTarget(u);
       setApproveRole('MEMBER');
       setApproveTeam((u.preferredTeamId as TeamId) || 'helpers');
       setApproveCommittees([]);
     };

     const closeApprove = () => {
       setApproveTarget(null);
       setApproveRole('MEMBER');
       setApproveTeam('helpers');
       setApproveCommittees([]);
     };

     const doApprove = async () => {
       if (!approveTarget || !me) return;
       if (approveCommittees.length === 0) {
         toast.error('Committee required', 'Select at least one');
         return;
       }
       setApproveBusy(true);
       try {
         await adminApproveUser(
           approveTarget,
           {
             role: approveRole,
             teamIds: [approveTeam],
             committeeIds: approveCommittees,
           },
           me.uid,
         );

         try {
           await logAudit(
             me,
             'APPROVE_USER',
             'User',
             approveTarget.uid,
             'Approved: ' + approveTarget.displayName,
           );
         } catch { /* ignore */ }

         try {
           await notifyUser(
             approveTarget.uid,
             'Your account is approved! 🎉',
             'Welcome to sbapiaryy. You can now access all features.',
             'system',
             '/dashboard',
             'high',
             me.displayName,
           );
         } catch { /* ignore */ }

         toast.success('User approved', 'They can now log in');
         closeApprove();
       } catch (err) {
         toast.error('Failed', err instanceof Error ? err.message : '');
       } finally {
         setApproveBusy(false);
       }
     };

     /* ═══════════════════════════════════════════════════════════
        Reject handlers
        ═══════════════════════════════════════════════════════════ */

     const openReject = (u: AppUser) => {
       setRejectTarget(u);
       setRejectReason('');
     };

     const closeReject = () => {
       setRejectTarget(null);
       setRejectReason('');
     };

     const doReject = async () => {
       if (!rejectTarget || !me) return;
       if (!rejectReason.trim()) {
         toast.error('Reason required');
         return;
       }
       setRejectBusy(true);
       try {
         await adminRejectUser(rejectTarget.uid, rejectReason, me.uid);
         try {
           await logAudit(
             me,
             'REJECT_USER',
             'User',
             rejectTarget.uid,
             'Rejected: ' + rejectReason,
           );
         } catch { /* ignore */ }

         toast.success('User rejected');
         closeReject();
       } catch (err) {
         toast.error('Failed', err instanceof Error ? err.message : '');
       } finally {
         setRejectBusy(false);
       }
     };

     /* ═══════════════════════════════════════════════════════════
        RENDER
        ═══════════════════════════════════════════════════════════ */

     return (
       <div className="admin-page">
         <PageHeader
           eyebrow="Admin"
           title="Pending Registrations"
           description="Review new sign-ups. Approve them to grant access."
         />

         <div className="chips mb-4">
           <button
             type="button"
             className={'chip' + (tab === 'pending' ? ' is-active' : '')}
             onClick={() => setTab('pending')}
           >
             Pending ({pending.length})
           </button>
           <button
             type="button"
             className={'chip' + (tab === 'rejected' ? ' is-active' : '')}
             onClick={() => setTab('rejected')}
           >
             Rejected ({rejected.length})
           </button>
           <button
             type="button"
             className={'chip' + (tab === 'all' ? ' is-active' : '')}
             onClick={() => setTab('all')}
           >
             All Users ({users.length})
           </button>
         </div>

         <SectionHeader
           eyebrow="List"
           title={
             tab === 'pending'
               ? 'Pending (' + pending.length + ')'
               : tab === 'rejected'
                 ? 'Rejected (' + rejected.length + ')'
                 : 'All Users (' + users.length + ')'
           }
         />

         {loading ? (
           <SkeletonList count={5} />
         ) : list.length === 0 ? (
           <EmptyState
             title="Nothing here"
             message={
               tab === 'pending'
                 ? 'No pending registrations. Everyone is approved.'
                 : 'No users in this view.'
             }
           />
         ) : (
           <div className="stack">
             {list.map((u) => (
               <div key={u.uid} className="card no-click">
                 <div
                   className="row row--between"
                   style={{ gap: 12, alignItems: 'flex-start' }}
                 >
                   <div
                     style={{
                       display: 'flex',
                       gap: 14,
                       alignItems: 'center',
                       flex: 1,
                       minWidth: 0,
                     }}
                   >
                     <Avatar name={u.displayName} size={52} variant="navy" />
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="card__title" style={{ fontSize: '1.05rem' }}>
                         {u.displayName}
                       </div>
                       <div
                         className="card__meta"
                         dir="ltr"
                         style={{ textAlign: 'start' }}
                       >
                         {u.email}
                       </div>
                       {u.createdAt ? (
                         <div className="tiny muted mt-1">
                           Registered {formatDate(u.createdAt)}
                         </div>
                       ) : null}
                     </div>
                   </div>

                   <Badge
                     variant={
                       u.status === 'pending'
                         ? 'warning'
                         : u.status === 'rejected'
                           ? 'danger'
                           : 'success'
                     }
                     dot
                   >
                     {u.status ?? 'active'}
                   </Badge>
                 </div>

                 {/* Extra info */}
                 {(u.preferredTeamId || u.registrationNote) ? (
                   <div
                     className="mt-3"
                     style={{
                       padding: 12,
                       background: 'var(--c-off-white)',
                       border: '1px solid var(--c-line)',
                       borderRadius: 'var(--radius-sm)',
                       fontSize: '0.85rem',
                       lineHeight: 1.7,
                     }}
                   >
                     {u.preferredTeamId ? (
                       <div>
                         <strong>Preferred team:</strong>{' '}
                         {teams.find((t) => t.id === u.preferredTeamId)?.name ??
                           u.preferredTeamId}
                       </div>
                     ) : null}
                     {u.registrationNote ? (
                       <div style={{ marginTop: 4 }}>
                         <strong>Note:</strong> {u.registrationNote}
                       </div>
                     ) : null}
                     {u.rejectionReason ? (
                       <div style={{ marginTop: 4 }}>
                         <strong>Rejection reason:</strong> {u.rejectionReason}
                       </div>
                     ) : null}
                   </div>
                 ) : null}

                 {/* Actions */}
                 {u.status === 'pending' ? (
                   <div
                     className="row mt-4"
                     style={{
                       gap: 8,
                       justifyContent: 'flex-end',
                       paddingTop: 14,
                       borderTop: '1px solid var(--c-line)',
                     }}
                   >
                     <button
                       type="button"
                       className="btn btn--success btn--sm"
                       onClick={() => openApprove(u)}
                     >
                       ✓ Approve
                     </button>
                     <button
                       type="button"
                       className="btn btn--outline-danger btn--sm"
                       onClick={() => openReject(u)}
                     >
                       ✕ Reject
                     </button>
                   </div>
                 ) : null}
               </div>
             ))}
           </div>
         )}

         {/* ═══════════════════════════════════════════════════════
            APPROVE MODAL
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={approveTarget !== null}
           title={'Approve: ' + (approveTarget?.displayName ?? '')}
           onClose={closeApprove}
           wide
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={closeApprove}
                 disabled={approveBusy}
               >
                 Cancel
               </button>
               <button
                 type="button"
                 className="btn btn--success"
                 onClick={doApprove}
                 disabled={approveBusy}
               >
                 {approveBusy ? 'Approving...' : 'Confirm Approval'}
               </button>
             </>
           }
         >
           <p
             className="small muted"
             style={{ marginBottom: 18, lineHeight: 1.7 }}
           >
             Assign a role, team, and committees. The user will get a member
             profile created automatically and will be able to log in
             immediately.
           </p>

           <div
             style={{
               background: 'var(--c-off-white)',
               border: '1px solid var(--c-line)',
               borderRadius: 'var(--radius-sm)',
               padding: 14,
               marginBottom: 18,
               fontSize: '0.9rem',
               lineHeight: 1.8,
             }}
           >
             <div>
               <strong>Name:</strong> {approveTarget?.displayName}
             </div>
             <div style={{ wordBreak: 'break-all' }}>
               <strong>Email:</strong>{' '}
               <span dir="ltr">{approveTarget?.email}</span>
             </div>
           </div>

           <FormField label="Role" required>
             <Select
               value={approveRole}
               onChange={(v) => setApproveRole(v as RoleId)}
               options={ROLE_OPTS}
             />
           </FormField>

           <FormField label="Team" required>
             <Select
               value={approveTeam}
               onChange={(v) => setApproveTeam(v as TeamId)}
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField
             label="Committees"
             required
             hint={committees.length === 0 ? 'Create a committee first' : 'At least one required'}
           >
             <MultiSelect
               values={approveCommittees}
               onChange={setApproveCommittees}
               options={committees.map((c) => ({
                 value: c.id,
                 label: c.nameAr,
               }))}
             />
           </FormField>
         </Modal>

         {/* ═══════════════════════════════════════════════════════
            REJECT MODAL
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={rejectTarget !== null}
           title={'Reject: ' + (rejectTarget?.displayName ?? '')}
           onClose={closeReject}
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={closeReject}
                 disabled={rejectBusy}
               >
                 Cancel
               </button>
               <button
                 type="button"
                 className="btn btn--danger"
                 onClick={doReject}
                 disabled={rejectBusy}
               >
                 {rejectBusy ? 'Rejecting...' : 'Confirm Rejection'}
               </button>
             </>
           }
         >
           <p
             className="small muted"
             style={{ marginBottom: 16, lineHeight: 1.7 }}
           >
             The user will see this reason when they try to access the platform.
           </p>
           <FormField label="Rejection reason" required>
             <TextArea
               value={rejectReason}
               onChange={setRejectReason}
               rows={3}
               placeholder="e.g. We could not verify your affiliation"
             />
           </FormField>
         </Modal>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      6. RequireAuth — block pending users
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/components/layout/RequireAuth.tsx",
  `
   import type { ReactNode } from 'react';
   import { Navigate, useLocation } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { Loading } from '@/components/ui/Loading';
   import type { RoleId } from '@/types';

   interface RequireAuthProps {
     children: ReactNode;
     roles?: RoleId[];
   }

   export function RequireAuth({ children, roles }: RequireAuthProps) {
     const { user, loading, mustChangePassword } = useAuth();
     const { pathname } = useLocation();

     if (loading) {
       return <Loading message="Verifying session..." fullHeight />;
     }

     if (!user) {
       return <Navigate to="/login" replace />;
     }

     /* ─── Pending / rejected users → force to pending page ─── */
     if (user.status === 'pending' || user.status === 'rejected') {
       if (pathname !== '/pending-approval') {
         return <Navigate to="/pending-approval" replace />;
       }
       return <>{children}</>;
     }

     if (mustChangePassword && pathname !== '/change-password') {
       return <Navigate to="/change-password" replace />;
     }

     if (roles && !roles.includes(user.role)) {
       return <Navigate to="/dashboard" replace />;
     }

     return <>{children}</>;
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      7. Layout — redirect pending users
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/components/layout/Layout.tsx",
  `
   import { useEffect, useState } from 'react';
   import { Outlet, useLocation, useNavigate } from 'react-router-dom';
   import { Navbar } from './Navbar';
   import { BottomNav } from './BottomNav';
   import { Sidebar } from './Sidebar';
   import { Footer } from './Footer';
   import { useAuth } from '@/lib/useAuth';
   import { initPwa } from '@/lib/pwa';

   export function Layout() {
     const { pathname } = useLocation();
     const nav = useNavigate();
     const { user, mustChangePassword, loading } = useAuth();
     const [sidebarOpen, setSidebarOpen] = useState(false);

     useEffect(() => { initPwa(); }, []);
     useEffect(() => {
       window.scrollTo(0, 0);
       setSidebarOpen(false);
     }, [pathname]);

     /* ─── Handle redirects ─── */
     useEffect(() => {
       if (loading) return;

       /* Pending or rejected → forced to waiting page */
       if (user && (user.status === 'pending' || user.status === 'rejected')) {
         if (pathname !== '/pending-approval' && pathname !== '/login' && pathname !== '/') {
           nav('/pending-approval');
         }
         return;
       }

       /* Force password change */
       if (user && mustChangePassword && pathname !== '/change-password') {
         nav('/change-password');
       }
     }, [user, mustChangePassword, pathname, nav, loading]);

     const handleMenuToggle = () => setSidebarOpen((v) => !v);
     const handleSidebarClose = () => setSidebarOpen(false);

     const isPending = user && (user.status === 'pending' || user.status === 'rejected');
     const showNav = user && !isPending;

     return (
       <div className="app-shell">
         <Navbar onMenuToggle={showNav ? handleMenuToggle : undefined} />
         <main className="app-main">
           <Outlet />
           {showNav && sidebarOpen ? (
             <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
           ) : null}
         </main>
         {showNav ? <BottomNav /> : null}
         {!isPending ? <Footer /> : null}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      8. Sidebar — add pending users with badge
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/components/layout/Sidebar.tsx",
  `
   import { NavLink, useNavigate } from 'react-router-dom';
   import { useEffect, useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { ROLE_LABEL, isAdmin, seesAllTeams } from '@/lib/permissions';
   import { cx } from '@/lib/format';
   import type { ApprovalStep, AppUser } from '@/types';

   interface NavItem { to: string; label: string; count?: number; }
   interface SidebarProps { open: boolean; onClose: () => void; }

   function buildAdminNav(pendingApprovals: number, pendingUsers: number): NavItem[] {
     return [
       { to: '/admin', label: 'Admin Dashboard' },
       { to: '/admin/analytics', label: 'Analytics' },
       { to: '/admin/pending-users', label: 'Pending Users', count: pendingUsers },
       { to: '/admin/requests', label: 'Requests', count: pendingApprovals },
       { to: '/admin/users', label: 'Users' },
       { to: '/admin/members', label: 'Members' },
       { to: '/admin/contributions', label: 'Contributions' },
       { to: '/admin/committees', label: 'Committees' },
       { to: '/admin/achievements', label: 'Achievements' },
       { to: '/admin/warnings', label: 'Warnings' },
       { to: '/admin/calendar', label: 'Calendar' },
       { to: '/admin/conversations', label: 'Conversations' },
       { to: '/admin/notifications', label: 'Send Notification' },
       { to: '/admin/governance', label: 'Governance' },
       { to: '/admin/audit', label: 'Audit Log' },
     ];
   }

   function buildManagerNav(pending: number): NavItem[] {
     return [
       { to: '/dashboard', label: 'Dashboard' },
       { to: '/members', label: 'Members' },
       { to: '/requests', label: 'Requests' },
       { to: '/approvals', label: 'Approvals', count: pending },
       { to: '/contributions', label: 'Contributions' },
       { to: '/committees', label: 'Committees' },
       { to: '/league', label: 'League' },
       { to: '/achievements', label: 'Achievements' },
       { to: '/warnings', label: 'Warnings' },
       { to: '/conversations', label: 'Conversations' },
       { to: '/calendar', label: 'Calendar' },
       { to: '/notifications', label: 'Notifications' },
       { to: '/reports', label: 'Reports' },
     ];
   }

   function buildMemberNav(): NavItem[] {
     return [
       { to: '/dashboard', label: 'Dashboard' },
       { to: '/profile', label: 'My Profile' },
       { to: '/my-contributions', label: 'My Contributions' },
       { to: '/requests/new', label: 'New Request' },
       { to: '/my-requests', label: 'My Requests' },
       { to: '/committees', label: 'Committees' },
       { to: '/league', label: 'League' },
       { to: '/achievements', label: 'Achievements' },
       { to: '/conversations', label: 'Conversations' },
       { to: '/calendar', label: 'Calendar' },
       { to: '/notifications', label: 'Notifications' },
       { to: '/governance', label: 'Governance' },
     ];
   }

   export function Sidebar({ open, onClose }: SidebarProps) {
     const { user } = useAuth();
     const nav = useNavigate();
     const { data: approvals } = useRealtimeCollection<ApprovalStep>('approvals');
     const { data: users } = useRealtimeCollection<AppUser>('users');
     const [isMobile, setIsMobile] = useState(false);

     useEffect(() => {
       const mq = window.matchMedia('(max-width: 900px)');
       const update = () => setIsMobile(mq.matches);
       update();
       mq.addEventListener('change', update);
       return () => mq.removeEventListener('change', update);
     }, []);

     if (!user) return null;

     const pendingApprovals = approvals.filter((a) => {
       if (a.status !== 'PENDING') return false;
       if (isAdmin(user)) return true;
       if (a.requiredRole !== user.role) return false;
       if (a.requiredTeamId !== null && a.requiredTeamId !== user.teamId) return false;
       return true;
     }).length;

     const pendingUsers = users.filter((u) => u.status === 'pending').length;

     let items: NavItem[];
     if (isAdmin(user)) items = buildAdminNav(pendingApprovals, pendingUsers);
     else if (user.role === 'MEMBER' || user.role === 'VIEWER') items = buildMemberNav();
     else items = buildManagerNav(pendingApprovals);

     const handleLogout = async () => { onClose(); await logout(); nav('/'); };
     const handleNavClick = () => { if (isMobile) onClose(); };

     return (
       <>
         <div className={'sidebar-overlay' + (open ? ' is-open' : '')} onClick={onClose} aria-hidden="true" />
         <aside className={'sidebar no-print' + (open ? ' is-open' : '')}>
           <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">×</button>
           <div className="sidebar__user">
             <div className="sidebar__user-info">
               <div className="sidebar__user-name">{user.displayName}</div>
               <div className="sidebar__user-role">{ROLE_LABEL[user.role]}</div>
             </div>
           </div>
           <div className="sidebar__group">
             <div className="sidebar__title">{seesAllTeams(user) ? 'Administration' : 'Menu'}</div>
             {items.map((it) => (
               <NavLink key={it.to} to={it.to} end={it.to === '/dashboard' || it.to === '/admin' || it.to === '/'}
                 onClick={handleNavClick}
                 className={({ isActive }) => cx('sidebar__link', isActive && 'is-active')}>
                 <span>{it.label}</span>
                 {it.count && it.count > 0 ? (
                   <span className="sidebar__count">{it.count > 99 ? '99+' : it.count}</span>
                 ) : null}
               </NavLink>
             ))}
           </div>
           <div className="sidebar__group">
             <div className="sidebar__title">Account</div>
             <button type="button" className="sidebar__link sidebar__link--danger" onClick={handleLogout}>Logout</button>
           </div>
         </aside>
       </>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      9. Login page — add "Create account" link
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/pages/LoginPage.tsx",
  `
   import { useState, type FormEvent } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { login } from '@/lib/auth';
   import { useAuth } from '@/lib/useAuth';

   export function LoginPage() {
     const nav = useNavigate();
     const { user } = useAuth();
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [busy, setBusy] = useState(false);

     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();
       setError('');
       setBusy(true);
       try {
         const appUser = await login(email.trim(), password);

         /* Route based on status */
         if (appUser.status === 'pending' || appUser.status === 'rejected') {
           nav('/pending-approval');
         } else if (appUser.mustChangePassword) {
           nav('/change-password');
         } else {
           nav('/dashboard');
         }
       } catch (err) {
         setError(err instanceof Error ? err.message : 'Login failed');
       } finally {
         setBusy(false);
       }
     };

     /* If already logged in */
     if (user) {
       if (user.status === 'pending' || user.status === 'rejected') {
         nav('/pending-approval');
       } else {
         nav('/dashboard');
       }
       return null;
     }

     return (
       <div className="login-page">
         <div className="login-card">
           <form onSubmit={onSubmit}>
             <div className="login-field">
               <label className="login-label">Email</label>
               <input
                 className="login-input"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="name@resala-stem.org"
                 autoComplete="email"
                 required
                 dir="ltr"
               />
             </div>
             <div className="login-field">
               <label className="login-label">Password</label>
               <input
                 className="login-input"
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="........"
                 autoComplete="current-password"
                 required
                 dir="ltr"
               />
             </div>
             {error ? <div className="login-error">{error}</div> : null}
             <button
               type="submit"
               className="login-submit"
               disabled={busy || !email || !password}
             >
               {busy ? '...' : 'Sign In'}
             </button>
           </form>

           <p
             className="login-back"
             style={{ marginTop: 20, lineHeight: 1.7 }}
           >
             New here?{' '}
             <Link
               to="/register"
               style={{ color: 'var(--c-red)', fontWeight: 700 }}
             >
               Create an account
             </Link>
           </p>

           <p className="login-back" style={{ marginTop: 6 }}>
             <Link to="/">Back to Home</Link>
           </p>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      10. App.tsx — add routes
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/App.tsx",
  `
   import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
   import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
   import { Layout } from '@/components/layout/Layout';
   import { RequireAuth } from '@/components/layout/RequireAuth';
   import { ToastContainer } from '@/components/ui/Toast';
   import { Onboarding } from '@/components/onboarding/Onboarding';
   import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';

   import { HomePage } from '@/pages/HomePage';
   import { LoginPage } from '@/pages/LoginPage';
   import { RegisterPage } from '@/pages/RegisterPage';
   import { PendingApprovalPage } from '@/pages/PendingApprovalPage';
   import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
   import { AboutPage } from '@/pages/AboutPage';
   import { MembersPage } from '@/pages/MembersPage';
   import { MemberProfilePage } from '@/pages/MemberProfilePage';
   import { TeamsPage } from '@/pages/TeamsPage';
   import { TeamDetailPage } from '@/pages/TeamDetailPage';
   import { CommitteesPage } from '@/pages/CommitteesPage';
   import { CommitteeDetailPage } from '@/pages/CommitteeDetailPage';
   import { LeaguePage } from '@/pages/LeaguePage';
   import { AchievementsPage } from '@/pages/AchievementsPage';
   import { GovernancePage } from '@/pages/GovernancePage';
   import { SearchPage } from '@/pages/SearchPage';
   import { NotFoundPage } from '@/pages/NotFoundPage';

   import { DashboardPage } from '@/pages/DashboardPage';
   import { MyProfilePage } from '@/pages/MyProfilePage';
   import { MyContributionsPage } from '@/pages/MyContributionsPage';
   import { MyRequestsPage } from '@/pages/MyRequestsPage';
   import { NewRequestPage } from '@/pages/NewRequestPage';
   import { RequestsPage } from '@/pages/RequestsPage';
   import { RequestDetailPage } from '@/pages/RequestDetailPage';
   import { ApprovalsPage } from '@/pages/ApprovalsPage';
   import { ContributionsPage } from '@/pages/ContributionsPage';
   import { NotificationsPage } from '@/pages/NotificationsPage';
   import { ConversationsPage } from '@/pages/ConversationsPage';
   import { CalendarPage } from '@/pages/CalendarPage';
   import { ReportsPage } from '@/pages/ReportsPage';
   import { AuditPage } from '@/pages/AuditPage';

   import { AdminHomePage } from '@/pages/admin/AdminHomePage';
   import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
   import { AdminPendingUsersPage } from '@/pages/admin/AdminPendingUsersPage';
   import { AdminMembersPage } from '@/pages/admin/AdminMembersPage';
   import { AdminContributionsPage } from '@/pages/admin/AdminContributionsPage';
   import { AdminCommitteesPage } from '@/pages/admin/AdminCommitteesPage';
   import { AdminAchievementsPage } from '@/pages/admin/AdminAchievementsPage';
   import { AdminWarningsPage } from '@/pages/admin/AdminWarningsPage';
   import { AdminCalendarPage } from '@/pages/admin/AdminCalendarPage';
   import { AdminConversationsPage } from '@/pages/admin/AdminConversationsPage';
   import { AdminNotificationsPage } from '@/pages/admin/AdminNotificationsPage';
   import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
   import { AdminGovernancePage } from '@/pages/admin/AdminGovernancePage';
   import { AdminRequestsPage } from '@/pages/admin/AdminRequestsPage';
   import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';

   export default function App() {
     return (
       <ErrorBoundary>
         <HashRouter>
           <Routes>
             <Route element={<Layout />}>
               {/* ═══ Public ═══ */}
               <Route path="/" element={<HomePage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/register" element={<RegisterPage />} />
               <Route path="/pending-approval" element={<PendingApprovalPage />} />
               <Route path="/change-password" element={<ChangePasswordPage />} />
               <Route path="/about" element={<AboutPage />} />
               <Route path="/members" element={<MembersPage />} />
               <Route path="/members/:memberId" element={<MemberProfilePage />} />
               <Route path="/teams" element={<TeamsPage />} />
               <Route path="/teams/:teamId" element={<TeamDetailPage />} />
               <Route path="/committees" element={<CommitteesPage />} />
               <Route path="/committees/:committeeId" element={<CommitteeDetailPage />} />
               <Route path="/league" element={<LeaguePage />} />
               <Route path="/achievements" element={<AchievementsPage />} />
               <Route path="/governance" element={<GovernancePage />} />
               <Route path="/search" element={<SearchPage />} />

               {/* ═══ Protected ═══ */}
               <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
               <Route path="/profile" element={<RequireAuth><MyProfilePage /></RequireAuth>} />
               <Route path="/my-contributions" element={<RequireAuth><MyContributionsPage /></RequireAuth>} />
               <Route path="/my-requests" element={<RequireAuth><MyRequestsPage /></RequireAuth>} />
               <Route path="/requests/new" element={<RequireAuth><NewRequestPage /></RequireAuth>} />
               <Route path="/requests" element={<RequireAuth><RequestsPage /></RequireAuth>} />
               <Route path="/requests/:requestId" element={<RequireAuth><RequestDetailPage /></RequireAuth>} />
               <Route path="/approvals" element={<RequireAuth><ApprovalsPage /></RequireAuth>} />
               <Route path="/contributions" element={<RequireAuth><ContributionsPage /></RequireAuth>} />
               <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
               <Route path="/conversations" element={<RequireAuth><ConversationsPage /></RequireAuth>} />
               <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
               <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
               <Route path="/audit" element={<RequireAuth roles={['HEAD', 'VICE']}><AuditPage /></RequireAuth>} />

               {/* ═══ Admin ═══ */}
               <Route path="/admin" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminHomePage /></RequireAuth>} />
               <Route path="/admin/analytics" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminAnalyticsPage /></RequireAuth>} />
               <Route path="/admin/pending-users" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminPendingUsersPage /></RequireAuth>} />
               <Route path="/admin/requests" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminRequestsPage /></RequireAuth>} />
               <Route path="/admin/users" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminUsersPage /></RequireAuth>} />
               <Route path="/admin/members" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminMembersPage /></RequireAuth>} />
               <Route path="/admin/contributions" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminContributionsPage /></RequireAuth>} />
               <Route path="/admin/committees" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminCommitteesPage /></RequireAuth>} />
               <Route path="/admin/achievements" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminAchievementsPage /></RequireAuth>} />
               <Route path="/admin/warnings" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminWarningsPage /></RequireAuth>} />
               <Route path="/admin/calendar" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminCalendarPage /></RequireAuth>} />
               <Route path="/admin/conversations" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminConversationsPage /></RequireAuth>} />
               <Route path="/admin/notifications" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminNotificationsPage /></RequireAuth>} />
               <Route path="/admin/governance" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminGovernancePage /></RequireAuth>} />
               <Route path="/admin/audit" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminAuditPage /></RequireAuth>} />
               <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

               <Route path="*" element={<NotFoundPage />} />
             </Route>
           </Routes>
           <ToastContainer />
           <Onboarding />
           <PwaInstallBanner />
         </HashRouter>
       </ErrorBoundary>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      11. Admin home — add Pending Users card
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/pages/admin/AdminHomePage.tsx",
  `
   import { Link } from 'react-router-dom';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { seedAll, type SeedResult } from '@/lib/seed';
   import { useState } from 'react';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { toast } from '@/components/ui/Toast';
   import { Loading } from '@/components/ui/Loading';
   import type { AppUser, RequestRecord, Contribution, Notification, Member, Committee } from '@/types';

   interface AdminCard { to: string; title: string; count?: number; description: string; }

   export function AdminHomePage() {
     const { user } = useAuth();
     const { data: users, loading: l1 } = useRealtimeCollection<AppUser>('users');
     const { data: members, loading: l2 } = useRealtimeCollection<Member>('members');
     const { data: requests, loading: l3 } = useRealtimeCollection<RequestRecord>('requests');
     const { data: contributions, loading: l4 } = useRealtimeCollection<Contribution>('contributions');
     const { data: notifs, loading: l5 } = useRealtimeCollection<Notification>('notifications');
     const { data: committees, loading: l6 } = useRealtimeCollection<Committee>('committees');
     const [seeding, setSeeding] = useState(false);
     const [result, setResult] = useState<SeedResult | null>(null);

     if (l1 || l2 || l3 || l4 || l5 || l6) {
       return <div className="admin-page"><Loading fullHeight message="Loading..." /></div>;
     }

     const pendingUsers = users.filter((u) => u.status === 'pending').length;
     const pendingReq = requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
     const pendingContribs = contributions.filter((c) => c.status === 'pending' || c.status === 'in_review').length;
     const totalPoints = members.reduce((s, m) => s + (m.points || 0), 0);

     const onSeed = async () => {
       if (!window.confirm('Upload seed data?')) return;
       setSeeding(true);
       try {
         const r = await seedAll();
         setResult(r);
         toast.success('Uploaded');
       } catch (err) {
         toast.error('Failed', err instanceof Error ? err.message : '');
       } finally {
         setSeeding(false);
       }
     };

     const cards: AdminCard[] = [
       { to: '/admin/pending-users', title: 'Pending Registrations', count: pendingUsers, description: 'Approve or reject new sign-ups' },
       { to: '/admin/analytics', title: 'Analytics', description: 'Overview' },
       { to: '/admin/requests', title: 'Requests', count: pendingReq, description: 'Manage requests' },
       { to: '/admin/users', title: 'Users', count: users.length, description: 'Accounts & roles' },
       { to: '/admin/members', title: 'Members', count: members.length, description: 'Member data' },
       { to: '/admin/contributions', title: 'Contributions', count: pendingContribs, description: 'Approve contributions' },
       { to: '/admin/committees', title: 'Committees', count: committees.length, description: 'Manage committees' },
       { to: '/admin/achievements', title: 'Achievements', description: 'Manage achievements' },
       { to: '/admin/warnings', title: 'Warnings', description: 'Issue warnings' },
       { to: '/admin/calendar', title: 'Calendar', description: 'Manage events' },
       { to: '/admin/conversations', title: 'Conversations', description: 'Manage chats' },
       { to: '/admin/notifications', title: 'Send Notification', count: notifs.length, description: 'Send notifications' },
       { to: '/admin/governance', title: 'Governance', description: 'Policies' },
       { to: '/admin/audit', title: 'Audit Log', description: 'Actions log' },
     ];

     return (
       <div className="admin-page">
         <section className="admin-welcome">
           <div className="admin-welcome__eyebrow">Admin Panel</div>
           <h1 className="admin-welcome__name">Welcome, {user?.displayName || 'Admin'}</h1>
           <p className="admin-welcome__subtitle">Full control over content, members, and requests.</p>
         </section>

         <section className="admin-stats">
           <div className="stat"><div className="stat__value">{users.length}</div><div className="stat__label">Users</div></div>
           <div className="stat"><div className="stat__value">{members.length}</div><div className="stat__label">Members</div></div>
           <div className={'stat' + (pendingUsers > 0 ? ' stat--red' : '')}>
             <div className="stat__value">{pendingUsers}</div>
             <div className="stat__label">Pending Users</div>
           </div>
           <div className="stat stat--red"><div className="stat__value">{pendingReq}</div><div className="stat__label">Pending Requests</div></div>
           <div className="stat stat--amber"><div className="stat__value">{pendingContribs}</div><div className="stat__label">Pending Contributions</div></div>
           <div className="stat"><div className="stat__value">{totalPoints}</div><div className="stat__label">Total Points</div></div>
         </section>

         <section className="admin-seed">
           <div className="admin-seed__head">
             <div>
               <div className="admin-seed__title">Upload Seed Data</div>
               <div className="admin-seed__desc">One-time — only if Firestore is empty.</div>
             </div>
             <button type="button" className="btn btn--primary" onClick={onSeed} disabled={seeding}>
               {seeding ? 'Uploading...' : 'Upload Data'}
             </button>
           </div>
           {result ? (
             <div className="admin-seed__result">✓ Teams: {result.teams} · Committees: {result.committees}</div>
           ) : null}
         </section>

         <section style={{ marginTop: 32 }}>
           <SectionHeader eyebrow="Sections" title="Quick Links" />
           <div className="admin-cards">
             {cards.map((c) => (
               <Link key={c.to} to={c.to} className="admin-card">
                 <div className="admin-card__head">
                   <div className="admin-card__title">{c.title}</div>
                   {c.count !== undefined && c.count > 0 ? (
                     <span className="admin-card__count">{c.count > 99 ? '99+' : c.count}</span>
                   ) : null}
                 </div>
                 <div className="admin-card__desc">{c.description}</div>
               </Link>
             ))}
           </div>
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      12. Firestore rules — allow self-registration
      ═══════════════════════════════════════════════════════════════ */

write(
  "firestore.rules",
  `rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       function isSignedIn() { return request.auth != null; }
       function userDoc() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
       function userDocExists() { return exists(/databases/$(database)/documents/users/$(request.auth.uid)); }
       function userRole() { return userDoc().role; }
       function userStatus() { return userDoc().status; }
       function userTeam() { return userDoc().teamId; }
       function userCommittees() { return userDoc().committeeIds; }

       function isSubBranchesHead() { return isSignedIn() && userDocExists() && userRole() in ['HEAD', 'VICE']; }
       function isGlobalHR() { return isSignedIn() && userDocExists() && userRole() == 'HEAD_HR_GLOBAL'; }
       function isTeamHead() { return isSignedIn() && userDocExists() && userRole() == 'PRESIDENT'; }
       function isTeamHeadHR() { return isSignedIn() && userDocExists() && userRole() == 'HEAD_HR_TEAM'; }
       function isCommitteeHR() { return isSignedIn() && userDocExists() && userRole() == 'COMMITTEE_HR'; }
       function isManager() {
         return isSignedIn() && userDocExists() &&
           userRole() in ['HEAD', 'VICE', 'HEAD_HR_GLOBAL', 'PRESIDENT', 'VICE_PRESIDENT', 'HEAD_HR_TEAM', 'HR', 'COMMITTEE_HR'];
       }

       /* ═══════════ USERS ═══════════ */
       /* Users can create their own doc during registration.
          They can only modify status-safe fields on their own doc. */
       match /users/{uid} {
         allow read: if isSignedIn() && (request.auth.uid == uid || isManager());
         allow create: if isSignedIn() && request.auth.uid == uid;
         allow update: if isSubBranchesHead()
           || (request.auth.uid == uid && (
             /* Self-update limited to non-privileged fields */
             !('role' in request.resource.data.diff(resource.data).affectedKeys())
             && !('status' in request.resource.data.diff(resource.data).affectedKeys())
             && !('teamId' in request.resource.data.diff(resource.data).affectedKeys())
             && !('committeeIds' in request.resource.data.diff(resource.data).affectedKeys())
             && !('memberId' in request.resource.data.diff(resource.data).affectedKeys())
           ));
         allow delete: if isSubBranchesHead();
       }

       match /members/{id} {
         allow read: if isSignedIn();
         allow write: if isSubBranchesHead() || isManager();
       }

       match /teams/{id} {
         allow read: if true;
         allow write: if isSubBranchesHead();
       }

       match /committees/{id} {
         allow read: if true;
         allow write: if isSubBranchesHead();
       }

       match /contributions/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && request.resource.data.createdBy == request.auth.uid;
         allow update: if isSubBranchesHead() || isGlobalHR() || isTeamHeadHR() || isTeamHead() || isCommitteeHR() || isManager();
         allow delete: if isSubBranchesHead();
       }

       match /warnings/{id} {
         allow read: if isManager();
         allow write: if isSubBranchesHead() || isManager();
       }

       match /achievements/{id} { allow read: if true; allow write: if isSubBranchesHead(); }

       match /notifications/{id} {
         allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isManager());
         allow create: if isSignedIn();
         allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isSubBranchesHead());
         allow delete: if isSubBranchesHead();
       }

       match /conversations/{id} {
         allow read: if isSignedIn();
         allow create, update: if isSignedIn();
         allow delete: if isSubBranchesHead();
       }

       match /messages/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && request.resource.data.senderUid == request.auth.uid;
         allow update, delete: if isSubBranchesHead();
       }

       match /calendar/{id} { allow read: if true; allow write: if isManager(); }
       match /governance/{id} { allow read: if true; allow write: if isSubBranchesHead(); }

       match /audit/{id} {
         allow read: if isSubBranchesHead();
         allow create: if isSignedIn();
       }

       match /requests/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn();
         allow update: if isManager();
         allow delete: if isSubBranchesHead();
       }

       match /approvals/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn();
         allow update, delete: if isManager();
       }
     }
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      AUTO-FIX + BUILD + PUSH
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
run('git commit -m "feat: self-registration + admin approval flow"', true);
const pushed = run("git push origin main --force");

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(
  " ║  " +
    (pushed ? "✅ DONE — Pushed to GitHub" : "⚠ Pushed with warnings") +
    "                ║"
);
console.log(" ╚══════════════════════════════════════════════════════╝");
console.log("");
console.log(" ✨ What was added:");
console.log("   ✓ /register — public self-registration page");
console.log("   ✓ /pending-approval — waiting screen with status");
console.log("   ✓ /admin/pending-users — admin approval dashboard");
console.log("   ✓ Sidebar badge showing pending count");
console.log("   ✓ Auto-redirect pending users away from dashboard");
console.log("   ✓ On approve: creates member + assigns role/team/committees");
console.log("   ✓ On reject: saves reason, user sees it on next visit");
console.log("   ✓ Welcome notification sent on approval");
console.log("");
console.log(" ⏭  After GitHub Actions (4-7 min):");
console.log("   1. User goes to /register → fills form");
console.log('   2. Sees "awaiting approval" screen immediately');
console.log('   3. Admin sees badge in sidebar: "Pending Users (1)"');
console.log("   4. Admin opens /admin/pending-users → clicks Approve");
console.log("   5. Assigns role/team/committee → user becomes active");
console.log("   6. User receives welcome notification + full access");
console.log("");
console.log(" ⚠  IMPORTANT — Firebase Console:");
console.log("   Authentication → Settings → Authorized domains");
console.log("   Make sure hazimshendy-stack.github.io is added");
console.log("");
