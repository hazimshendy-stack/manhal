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


   /* ═══════════════════════════════════════════════════════════════
      Friendly error messages
      ═══════════════════════════════════════════════════════════════ */

   export function translateAuthError(err: unknown): string {
     const code = err && typeof err === 'object' && 'code' in err
       ? String((err as { code?: string }).code)
       : '';
     const raw = err instanceof Error ? err.message : String(err ?? '');
     const combined = (code + ' ' + raw).toLowerCase();

     if (combined.includes('invalid-credential') || combined.includes('wrong-password') || combined.includes('user-not-found') || combined.includes('invalid-login-credentials')) {
       return 'الإيميل أو الباسورد خطأ';
     }
     if (combined.includes('invalid-email')) {
       return 'الإيميل مش صح';
     }
     if (combined.includes('user-disabled')) {
       return 'الحساب ده متوقف';
     }
     if (combined.includes('too-many-requests')) {
       return 'حاول تاني بعد شوية';
     }
     if (combined.includes('network-request-failed')) {
       return 'في مشكلة في الاتصال بالإنترنت';
     }
     if (combined.includes('email-already-in-use') || combined.includes('email_exists')) {
       return 'الإيميل ده مستخدم بالفعل';
     }
     if (combined.includes('weak-password')) {
       return 'الباسورد ضعيف — لازم 6 حروف على الأقل';
     }
     if (combined.includes('operation-not-allowed')) {
       return 'التسجيل معطل حاليًا';
     }
     if (combined.includes('requires-recent-login')) {
       return 'سجل دخول تاني وحاول';
     }
     if (combined.includes('missing-password')) {
       return 'لازم تدخل الباسورد';
     }
     return raw || 'حصل خطأ غير متوقع';
   }
   