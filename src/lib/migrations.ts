// src/lib/migrations.ts
// One-shot data migrations. Safe to call on app boot (idempotent).
//
// Fix #8: purges legacy sequential-chain requests and their approval steps,
// and rewrites remaining PENDING requests to the new parallel model.

import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MIGRATION_KEY = 'manhal.migration.v8.requests.parallel';
const MIGRATION_FLAG = 'manhal.migration.v8.requests.parallel.done';

export async function purgeLegacyRequestsOnce(): Promise<{ deleted: number; rewritten: number } | null> {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem(MIGRATION_FLAG) === '1') return null;

  let deleted = 0;
  let rewritten = 0;
  try {
    const reqSnap = await getDocs(collection(db, 'requests'));
    const legacyIds: string[] = [];
    reqSnap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const isLegacy = data.parallelApproval !== true;
      if (isLegacy && data.status !== 'APPROVED' && data.status !== 'REJECTED') {
        legacyIds.push(d.id);
      }
    });

    for (const id of legacyIds) {
      // Best-effort: delete related approval steps first.
      try {
        const aprSnap = await getDocs(collection(db, 'approvals'));
        for (const a of aprSnap.docs) {
          const aData = a.data() as { requestId?: string };
          if (aData.requestId === id) {
            await deleteDoc(doc(db, 'approvals', a.id));
          }
        }
      } catch { /* ignore */ }
      await deleteDoc(doc(db, 'requests', id));
      deleted++;
    }

    // Mark remaining PENDING requests as parallel.
    for (const d of reqSnap.docs) {
      const data = d.data() as { status?: string; parallelApproval?: boolean };
      if (data.status === 'PENDING' && data.parallelApproval !== true) {
        try { await updateDoc(doc(db, 'requests', d.id), { parallelApproval: true }); rewritten++; } catch { /* ignore */ }
      }
    }

    window.localStorage.setItem(MIGRATION_FLAG, '1');
    // eslint-disable-next-line no-console
    console.info('[migration] ' + MIGRATION_KEY + ' done', { deleted, rewritten });
    return { deleted, rewritten };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migration] failed:', err);
    return null;
  }
}
