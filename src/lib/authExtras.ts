// src/lib/authExtras.ts
// Client-side password management wired to Firebase Auth.
//
// Expected backend contract (Firebase Auth):
//   - changePassword(currentPassword, newPassword)
//       -> reauthenticate with EmailAuthProvider.credential(user.email, current)
//       -> updatePassword(user, newPassword)
//   - requestPasswordReset(email)
//       -> sendPasswordResetEmail(auth, email)
//
// If you use a custom backend instead, replace the bodies with your API calls.
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!currentPassword) throw new Error('Current password is required.');
  if (!newPassword || newPassword.length < 6) throw new Error('New password must be at least 6 characters.');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No signed-in user.');
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!email || !email.includes('@')) throw new Error('A valid email is required.');
  const auth = getAuth();
  await sendPasswordResetEmail(auth, email);
}

export function translatePasswordError(err: unknown): string {
  const msg = err && typeof err === 'object' && 'code' in err
    ? String((err as { code: unknown }).code)
    : err instanceof Error ? err.message : String(err);
  if (msg.includes('wrong-password') || msg.includes('invalid-credential')) return 'Current password is incorrect.';
  if (msg.includes('weak-password')) return 'New password is too weak.';
  if (msg.includes('user-not-found')) return 'No account found for that email.';
  if (msg.includes('too-many-requests')) return 'Too many attempts. Try again later.';
  if (msg.includes('network-request-failed')) return 'Network error. Try again.';
  return msg;
}
