// [auto-fix] v7.1 — resolve the exact approver for a contribution stage.
// This module is the single source of truth for Stage-1 (HR of Committee)
// and Stage-2 (HR of Team) routing.
import type { AppUser, TeamId } from '@/types';

export interface ApproverRef {
  uid: string;
  role: string;
  name: string;
}

/** Find the committee HR of a given team + committee. */
export function findCommitteeHR(
  users: AppUser[],
  teamId: TeamId | null | undefined,
  committeeId: string | null | undefined,
): ApproverRef | null {
  if (!teamId || !committeeId) return null;
  const u = users.find(
    (x) =>
      x.role === 'COMMITTEE_HR' &&
      x.teamId === teamId &&
      Array.isArray(x.committeeIds) &&
      x.committeeIds.includes(committeeId),
  );
  return u ? { uid: u.uid, role: 'COMMITTEE_HR', name: u.displayName } : null;
}

/** Find the team HR (role === 'HR') of a given team. */
export function findTeamHR(
  users: AppUser[],
  teamId: TeamId | null | undefined,
): ApproverRef | null {
  if (!teamId) return null;
  const u = users.find((x) => x.role === 'HR' && x.teamId === teamId);
  return u ? { uid: u.uid, role: 'HR', name: u.displayName } : null;
}

/** Find the team head (role === 'PRESIDENT'). */
export function findTeamHead(
  users: AppUser[],
  teamId: TeamId | null | undefined,
): ApproverRef | null {
  if (!teamId) return null;
  const u = users.find((x) => x.role === 'PRESIDENT' && x.teamId === teamId);
  return u ? { uid: u.uid, role: 'PRESIDENT', name: u.displayName } : null;
}

/** Resolve the approver for a specific contribution stage. */
export function resolveStageApprover(
  users: AppUser[],
  stage: 1 | 2,
  teamId: TeamId | null | undefined,
  committeeId: string | null | undefined,
): ApproverRef | null {
  if (stage === 1) return findCommitteeHR(users, teamId, committeeId);
  if (stage === 2) return findTeamHR(users, teamId);
  return null;
}
