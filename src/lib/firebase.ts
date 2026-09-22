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
   