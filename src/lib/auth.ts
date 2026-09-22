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
   