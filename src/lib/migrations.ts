// [auto-fix] v7 — purge every legacy request + approval step, force the
// new single-approver model. Runs once per browser (localStorage flag).
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FLAG_KEY = 'manhal.migration.v7.requests.single-approver.done';

export async function purgeLegacyRequestsOnce(): Promise<{ deleted: number; rewritten: number } | null> {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem(FLAG_KEY) === '1') return null;

  let deleted = 0;
  let rewritten = 0;

  try {
    // 1) Delete every approval step whose request is legacy.
    const aprSnap = await getDocs(collection(db, 'approvals'));
    const legacyRequestIds = new Set<string>();

    const reqSnap = await getDocs(collection(db, 'requests'));
    reqSnap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const isLegacy = data.singleApprover !== true;
      if (isLegacy && data.status !== 'APPROVED' && data.status !== 'REJECTED') {
        legacyRequestIds.add(d.id);
      }
    });

    for (const a of aprSnap.docs) {
      const aData = a.data() as { requestId?: string };
      if (aData.requestId && legacyRequestIds.has(aData.requestId)) {
        await deleteDoc(doc(db, 'approvals', a.id));
        deleted += 1;
      }
    }

    // 2) Delete the legacy requests themselves.
    for (const id of legacyRequestIds) {
      await deleteDoc(doc(db, 'requests', id));
    }

    // 3) Mark remaining PENDING requests as single-approver.
    for (const d of reqSnap.docs) {
      const data = d.data() as { status?: string; singleApprover?: boolean };
      if (data.status === 'PENDING' && data.singleApprover !== true) {
        await updateDoc(doc(db, 'requests', d.id), { singleApprover: true });
        rewritten += 1;
      }
    }

    window.localStorage.setItem(FLAG_KEY, '1');
    // eslint-disable-next-line no-console
    console.info('[migration] v7 purge done', { deleted, rewritten });
    return { deleted, rewritten };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migration] v7 purge failed', err);
    return null;
  }
}
