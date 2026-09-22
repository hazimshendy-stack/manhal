// src/lib/createUserAccount.ts
// Admin-side user creation.
//
// ⚠️ PRODUCTION NOTE:
// User creation should ultimately be done server-side (Firebase Cloud
// Function using the Admin SDK) so the admin's own session is never
// touched and custom claims can be set atomically.
//
// The client-side implementation below works around the "sign in as the
// new user" side effect by spinning up a SECONDARY Firebase App instance.
// It is fine for demos and small teams, but replace with a backend call
// before going live:
//
//   POST /api/admin/create-user
//   Body: { email, password, displayName, role, teamId, memberId, status }
//   Response: { uid: string }
//
import { initializeApp, deleteApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CreateUserInput {
  email: string;
  password: string;
  displayName: string;
  role?: string;
  teamId?: string | null;
  committeeId?: string | null;
  memberId?: string | null;
  status?: string;
}

export interface CreateUserResult {
  uid: string;
}

const SECONDARY_APP_NAME = 'manhal-admin-create-user';

function getSecondaryApp() {
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
  if (existing) return existing;
  const primary = getApp();
  const options = (primary.options || {}) as Record<string, unknown>;
  return initializeApp(options, SECONDARY_APP_NAME);
}

export async function createUserAccount(input: CreateUserInput): Promise<CreateUserResult> {
  if (!input || !input.email || !input.password) {
    throw new Error('email and password are required');
  }

  const secondary = getSecondaryApp();
  const secondaryAuth = getAuth(secondary);
  let uid = '';

  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      input.email.trim().toLowerCase(),
      input.password,
    );
    uid = cred.user.uid;

    try {
      await updateProfile(cred.user, { displayName: input.displayName });
    } catch {
      /* non-fatal */
    }

    const now = new Date().toISOString();
    await setDoc(
      doc(db, 'users', uid),
      {
        uid,
        email: input.email.trim().toLowerCase(),
        displayName: input.displayName,
        realName: input.displayName,
        fullName: input.displayName,
        role: input.role || 'MEMBER',
        status: input.status || 'approved',
        teamId: input.teamId || null,
        committeeId: input.committeeId || null,
        memberId: input.memberId || null,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

    return { uid };
  } finally {
    try { await secondaryAuth.signOut(); } catch { /* ignore */ }
    try { await deleteApp(secondary); } catch { /* ignore */ }
  }
}
