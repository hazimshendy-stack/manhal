// [auto-fix] v7 — migrations:
//   1) purge legacy sequential-approval requests + their approval steps
//   2) rename legacy roles (HEAD_HR_TEAM → HR)
//   3) rename legacy team ids (messages → messengers, masar → track, enviros → innovators)
// Each migration is guarded by a localStorage flag so it runs at most once.
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FLAG_PURGE_REQUESTS = 'manhal.migration.v7.requests.purge.done';
const FLAG_ROLE_TEAM_RENAME = 'manhal.migration.v7.roles-teams.rename.done';

/* ═══════════════ 1. Purge legacy requests ═══════════════ */

export async function purgeLegacyRequestsOnce() {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem(FLAG_PURGE_REQUESTS) === '1') return null;

  let deleted = 0;
  let rewritten = 0;

  try {
    const aprSnap = await getDocs(collection(db, 'approvals'));
    const reqSnap = await getDocs(collection(db, 'requests'));

    const legacyRequestIds = new Set<string>();
    reqSnap.forEach((d) => {
      const data = d.data() || {};
      const isLegacy = data.singleApprover !== true;
      if (isLegacy && data.status !== 'APPROVED' && data.status !== 'REJECTED') {
        legacyRequestIds.add(d.id);
      }
    });

    for (const a of aprSnap.docs) {
      const aData = a.data() || {};
      if (aData.requestId && legacyRequestIds.has(aData.requestId)) {
        await deleteDoc(doc(db, 'approvals', a.id));
        deleted += 1;
      }
    }

    for (const id of legacyRequestIds) {
      await deleteDoc(doc(db, 'requests', id));
    }

    for (const d of reqSnap.docs) {
      const data = d.data() || {};
      if (data.status === 'PENDING' && data.singleApprover !== true) {
        try {
          await updateDoc(doc(db, 'requests', d.id), { singleApprover: true });
          rewritten += 1;
        } catch { /* ignore */ }
      }
    }

    window.localStorage.setItem(FLAG_PURGE_REQUESTS, '1');
    // eslint-disable-next-line no-console
    console.info('[migration] v7 purge requests done', { deleted, rewritten });
    return { deleted, rewritten };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migration] v7 purge requests failed', err);
    return null;
  }
}

/* ═══════════════ 2. Rename legacy role + team ids ═══════════════ */

const LEGACY_ROLE_MAP = { HEAD_HR_TEAM: 'HR' };

const LEGACY_TEAM_MAP = {
  messages: 'messengers',
  masar: 'track',
  enviros: 'innovators',
};

async function renameInCollection(collectionName, fields) {
  let changed = 0;
  try {
    const snap = await getDocs(collection(db, collectionName));
    for (const d of snap.docs) {
      const data = d.data() || {};
      const patchObj = {};

      for (const field of fields) {
        const value = data[field];

        // Scalar string fields (role, teamId, committeeId)
        if (typeof value === 'string') {
          if (LEGACY_ROLE_MAP[value]) patchObj[field] = LEGACY_ROLE_MAP[value];
          else if (LEGACY_TEAM_MAP[value]) patchObj[field] = LEGACY_TEAM_MAP[value];
        }

        // Array fields (teamIds, committeeIds)
        if (Array.isArray(value)) {
          const mapped = value.map((x) => {
            if (typeof x !== 'string') return x;
            return LEGACY_ROLE_MAP[x] || LEGACY_TEAM_MAP[x] || x;
          });
          if (mapped.some((x, i) => x !== value[i])) patchObj[field] = mapped;
        }
      }

      if (Object.keys(patchObj).length > 0) {
        try {
          await updateDoc(doc(db, collectionName, d.id), patchObj);
          changed += 1;
        } catch { /* ignore per-doc failure */ }
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migration] rename in ' + collectionName + ' failed', err);
  }
  return changed;
}

export async function migrateRoleAndTeamIdsOnce() {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem(FLAG_ROLE_TEAM_RENAME) === '1') return null;

  try {
    const usersRenamed = await renameInCollection('users', ['role', 'teamId']);
    const membersRenamed = await renameInCollection('members', ['role', 'teamIds']);
    const committeesRenamed = await renameInCollection('committees', ['teamId']);
    const contribRenamed = await renameInCollection('contributions', ['teamId', 'currentStage']);
    const requestsRenamed = await renameInCollection('requests', ['fromTeamId', 'toTeamId']);
    const approvalsRenamed = await renameInCollection('approvals', ['requiredTeamId']);
    const calendarRenamed = await renameInCollection('calendar', ['teamId']);

    window.localStorage.setItem(FLAG_ROLE_TEAM_RENAME, '1');
    // eslint-disable-next-line no-console
    console.info('[migration] v7 role/team rename done', {
      usersRenamed,
      membersRenamed,
      committeesRenamed,
      contribRenamed,
      requestsRenamed,
      approvalsRenamed,
      calendarRenamed,
    });
    return {
      usersRenamed,
      membersRenamed,
      committeesRenamed,
      contribRenamed,
      requestsRenamed,
      approvalsRenamed,
      calendarRenamed,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migration] v7 role/team rename failed', err);
    return null;
  }
}

/* ═══════════════ Orchestrator ═══════════════ */

export async function runAllMigrationsOnce() {
  try { await purgeLegacyRequestsOnce(); } catch { /* ignore */ }
  try { await migrateRoleAndTeamIdsOnce(); } catch { /* ignore */ }
}
