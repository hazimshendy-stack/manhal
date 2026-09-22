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
      Friendly error translation — exported for reuse
      ═══════════════════════════════════════════════════════════════ */

   export function translateAuthError(err: unknown): string {
     const code = err && typeof err === 'object' && 'code' in err
       ? String((err as { code?: string }).code)
       : '';
     const raw = err instanceof Error ? err.message : String(err ?? '');
     const combined = (code + ' ' + raw).toLowerCase();

     if (
       combined.includes('invalid-credential') ||
       combined.includes('wrong-password') ||
       combined.includes('user-not-found') ||
       combined.includes('invalid-login-credentials')
     ) {
       return 'الإيميل أو الباسورد خطأ';
     }
     if (combined.includes('invalid-email')) return 'الإيميل مش صح';
     if (combined.includes('user-disabled')) return 'الحساب ده متوقف';
     if (combined.includes('too-many-requests')) return 'حاول تاني بعد شوية';
     if (combined.includes('network-request-failed')) return 'في مشكلة في الاتصال بالإنترنت';
     if (combined.includes('email-already-in-use') || combined.includes('email_exists')) {
       return 'الإيميل ده مستخدم بالفعل';
     }
     if (combined.includes('weak-password')) return 'الباسورد ضعيف — لازم 6 حروف على الأقل';
     if (combined.includes('operation-not-allowed')) return 'التسجيل معطل حاليًا';
     if (combined.includes('requires-recent-login')) return 'سجل دخول تاني وحاول';
     if (combined.includes('missing-password')) return 'لازم تدخل الباسورد';
     return raw || 'حصل خطأ غير متوقع';
   }

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
      Admin: reset another user's password
      ═══════════════════════════════════════════════════════════════ */

   export async function adminResetUserPassword(email: string): Promise<void> {
     if (!email) throw new Error('Email required');
     await sendPasswordResetEmail(auth, email);
   }

   /* ═══════════════════════════════════════════════════════════════
      Admin: update user profile
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
      Admin: create member (secondary app)
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
       throw new Error(translateAuthError(err));
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


   /* ═══════════════════════════════════════════════════════════════════════
      Self-registration — يُنشئ الحساب بحالة pending
      ═══════════════════════════════════════════════════════════════════════ */

   export interface RegisterSelfInput {
     email: string;
     password: string;
     name: string;
     preferredTeamId?: TeamId | null;
     note?: string;
   }

   export async function registerSelf(input: RegisterSelfInput): Promise<AppUser> {
     const email = input.email.trim().toLowerCase();
     const name = input.name.trim();
     const password = input.password;

     if (!email) throw new Error('Email required');
     if (!name) throw new Error('Name required');
     if (password.length < 6) throw new Error('Password must be at least 6 characters');

     /* 1) أنشئ حساب Firebase Auth */
     let uid = '';
     try {
       const cred = await createUserWithEmailAndPassword(auth, email, password);
       uid = cred.user.uid;
     } catch (err) {
       throw new Error(translateAuthError(err));
     }

     /* 2) أنشئ user doc بحالة pending */
     const userData: AppUser = {
       uid,
       email,
       displayName: name,
       role: 'VIEWER',
       teamId: null,
       committeeIds: [],
       memberId: null,
       createdAt: new Date().toISOString(),
       emailVerified: false,
       mustChangePassword: false,
       status: 'pending',
       preferredTeamId: input.preferredTeamId ?? null,
       registrationNote: input.note?.trim() || undefined,
     };

     await setDoc(doc(db, 'users', uid), userData);

     return userData;
   }

   /* ═══════════════════════════════════════════════════════════════════════
      Admin: Approve a pending user
      ─────────────────────────────────────────────────────────────────────
      - Updates user doc: status=active, role, teamId, committeeIds
      - Creates a linked member doc
      ═══════════════════════════════════════════════════════════════════════ */

   export interface ApproveUserInput {
     role: RoleId;
     teamIds: TeamId[];
     committeeIds: string[];
   }

   export async function adminApproveUser(
     user: AppUser,
     input: ApproveUserInput,
     adminUid: string,
   ): Promise<void> {
     const memberId = user.memberId || ('M-' + user.uid.slice(0, 8).toUpperCase());

     /* 1) Update user doc */
     await setDoc(
       doc(db, 'users', user.uid),
       {
         role: input.role,
         teamId: input.teamIds[0] ?? null,
         committeeIds: input.committeeIds || [],
         memberId,
         status: 'active',
         approvedAt: new Date().toISOString(),
         approvedBy: adminUid,
       },
       { merge: true },
     );

     /* 2) Create member doc */
     const memberData: Member = {
       id: memberId,
       name: user.displayName,
       role: input.role,
       teamIds: input.teamIds,
       committeeIds: input.committeeIds || [],
       joinedSeason: 7,
       hours: 0,
       points: 0,
       status: 'active',
       email: user.email,
       linkedUserId: user.uid,
     };

     await setDoc(doc(db, 'members', memberId), memberData);

     /* 3) Link member back on user doc (already done above) */
   }

   /* ═══════════════════════════════════════════════════════════════════════
      Admin: Reject a pending user
      ═══════════════════════════════════════════════════════════════════════ */

   export async function adminRejectUser(
     uid: string,
     reason: string,
     adminUid: string,
   ): Promise<void> {
     await setDoc(
       doc(db, 'users', uid),
       {
         status: 'rejected',
         rejectionReason: reason?.trim() || 'No reason provided',
         rejectedAt: new Date().toISOString(),
         rejectedBy: adminUid,
       },
       { merge: true },
     );
   }
   
