import {
     signInWithEmailAndPassword,
     signOut,
     onAuthStateChanged,
     sendPasswordResetEmail,
     updatePassword,
     type User as FirebaseUser,
   } from 'firebase/auth';
   import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
   import { auth, db } from './firebase';
   import type { AppUser, RoleId, TeamId, Member } from '@/types';

   /* ═══════════════════════════════════════════════════════════════
      تسجيل الدخول
      ═══════════════════════════════════════════════════════════════ */

   export async function login(email: string, password: string): Promise<AppUser> {
     const cred = await signInWithEmailAndPassword(auth, email, password);
     return await ensureUserDoc(cred.user);
   }

   export async function logout(): Promise<void> {
     await signOut(auth);
   }

   /* ═══════════════════════════════════════════════════════════════
      إعادة تعيين كلمة المرور (Forgot password)
      ═══════════════════════════════════════════════════════════════ */

   export async function sendPasswordReset(email: string): Promise<void> {
     await sendPasswordResetEmail(auth, email);
   }

   /* ═══════════════════════════════════════════════════════════════
      تغيير كلمة المرور (بعد first-login)
      ═══════════════════════════════════════════════════════════════ */

   export async function changePassword(newPassword: string): Promise<void> {
     const user = auth.currentUser;
     if (!user) throw new Error('لا يوجد مستخدم مسجل');
     await updatePassword(user, newPassword);
     await updateDoc(doc(db, 'users', user.uid), {
       mustChangePassword: false,
     });
   }

   /* ═══════════════════════════════════════════════════════════════
      إنشاء حساب من الأدمن (بريد + باسورد مؤقت)
      — يتم إنشاء العضو مباشرة بالاسم والدور والفريق واللجنة
      — العضو يُلزَم بتغيير كلمة المرور عند أول دخول
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

   export async function adminCreateMember(input: CreateMemberInput, adminUid: string): Promise<string> {
     const response = await fetch(
       `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${import.meta.env.VITE_FIREBASE_API_KEY}`,
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           email: input.email.trim(),
           password: input.temporaryPassword,
           returnSecureToken: true,
         }),
       },
     );

     const data = await response.json();
     if (!response.ok) {
       const code = data?.error?.message ?? '';
       if (code.includes('EMAIL_EXISTS')) throw new Error('البريد مستخدم بالفعل');
       if (code.includes('WEAK_PASSWORD')) throw new Error('كلمة المرور ضعيفة');
       if (code.includes('INVALID_EMAIL')) throw new Error('البريد الإلكتروني غير صالح');
       throw new Error('فشل إنشاء الحساب');
     }

     const uid: string = data.localId;
     const memberId = 'M-' + uid.slice(0, 8).toUpperCase();

     const userData: AppUser = {
       uid,
       email: input.email.trim(),
       displayName: input.name.trim(),
       role: input.role,
       teamId: input.teamIds[0] ?? null,
       committeeIds: input.committeeIds,
       memberId,
       createdAt: new Date().toISOString(),
       emailVerified: false,
       mustChangePassword: true,
       createdByAdmin: adminUid,
     };

     await setDoc(doc(db, 'users', uid), userData);

     const memberData: Member = {
       id: memberId,
       name: input.name.trim(),
       role: input.role,
       teamIds: input.teamIds,
       committeeIds: input.committeeIds,
       joinedSeason: 7,
       hours: 0,
       status: 'active',
       bio: input.bio?.trim() || undefined,
       email: input.email.trim(),
       linkedUserId: uid,
     };

     await setDoc(doc(db, 'members', memberId), memberData);

     return uid;
   }

   /* ═══════════════════════════════════════════════════════════════
      مزامنة user doc
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
       displayName: fbUser.displayName ?? fbUser.email ?? 'عضو',
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

   /* ═══════════════════════════════════════════════════════════════
      Observer
      ═══════════════════════════════════════════════════════════════ */

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
   