// [auto-fix] v7 — strict notification + approval routing helpers.
// Every notification/approval MUST target exactly ONE intended recipient
// (or an explicitly whitelisted group). No implicit broadcasting.
import type { AppUser, Contribution, RequestRecord, RoleId, TeamId } from '@/types';
import { logAudit } from './audit';

export interface RoutingResult { ok: boolean; reason?: string; }

/** Assert an approver is allowed to act on a given contribution's stage. */
export function verifyContributionApprover(
  approver: AppUser | null,
  contribution: Contribution,
  stage: 1 | 2,
): RoutingResult {
  if (!approver) return { ok: false, reason: 'No approver.' };

  const authorTeamId = contribution.teamId as TeamId | undefined;
  const authorCommitteeId = contribution.committeeId;

  if (!authorTeamId || !authorCommitteeId) {
    return { ok: false, reason: 'Post is missing team or committee context.' };
  }

  // Admin (HEAD) bypasses — must log the override.
  if (approver.role === 'HEAD') return { ok: true };

  if (stage === 1) {
    if (approver.role !== 'COMMITTEE_HR') {
      return { ok: false, reason: 'Stage 1 must be performed by the HR of the committee.' };
    }
    if (approver.teamId !== authorTeamId) {
      return { ok: false, reason: 'Committee HR must be inside the author\'s team.' };
    }
    if (!Array.isArray(approver.committeeIds) || !approver.committeeIds.includes(authorCommitteeId)) {
      return { ok: false, reason: 'Approver is not HR of the author\'s committee.' };
    }
    return { ok: true };
  }

  if (stage === 2) {
    if (approver.role !== 'HR') {
      return { ok: false, reason: 'Stage 2 must be performed by the HR of the team.' };
    }
    if (approver.teamId !== authorTeamId) {
      return { ok: false, reason: 'HR must belong to the author\'s team.' };
    }
    return { ok: true };
  }

  return { ok: false, reason: 'Unknown stage.' };
}

/** Assert only the whitelisted roles may edit or delete a post. */
export function canEditOrDeletePost(
  user: AppUser | null,
  contribution: Contribution,
): boolean {
  if (!user) return false;
  const authorTeamId = contribution.teamId as TeamId | undefined;
  if (!authorTeamId) return false;

  // Head of Sub-Branches — always.
  if (user.role === 'HEAD') return true;

  // Head of HRs (Sub-Branches) — always.
  if (user.role === 'HEAD_HR_GLOBAL') return true;

  // Head of the SAME team.
  if (user.role === 'PRESIDENT' && user.teamId === authorTeamId) return true;

  // Vice Head of the SAME team.
  if (user.role === 'VICE_PRESIDENT' && user.teamId === authorTeamId) return true;

  return false;
}

/** Only the Head of the requester's team can act on a request. */
export function verifyRequestApprover(
  approver: AppUser | null,
  request: RequestRecord,
): RoutingResult {
  if (!approver) return { ok: false, reason: 'No approver.' };

  // Head of Sub-Branches can always act.
  if (approver.role === 'HEAD') return { ok: true };

  const teamId = request.fromTeamId ?? request.toTeamId;
  if (!teamId) {
    return { ok: false, reason: 'Request is missing team context.' };
  }
  if (approver.role !== 'PRESIDENT') {
    return { ok: false, reason: 'Only the Head of the team can decide on this request.' };
  }
  if (approver.teamId !== teamId) {
    return { ok: false, reason: 'You can only decide on requests from your own team.' };
  }
  return { ok: true };
}

/** Audit helper — records a rejected-action attempt. */
export async function logRejectedAction(
  user: AppUser | null,
  kind: 'contribution' | 'request',
  targetId: string,
  reason: string,
): Promise<void> {
  try {
    await logAudit(
      user,
      'REJECTED_ACTION',
      kind === 'contribution' ? 'Contribution' : 'Request',
      targetId,
      reason,
    );
  } catch {
    /* ignore */
  }
}
