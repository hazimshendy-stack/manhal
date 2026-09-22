// [auto-fix] v7.1 — strict 2-stage routing. No admin bypass.
//   Stage 1 → HR of Committee (assigns points, cannot double-approve)
//   Stage 2 → HR of Team (final: awards points, notifies everyone)
// Every transition updates pendingApproverId + pendingApproverRole.
// Every action / failed attempt writes an audit entry.
import { updateOne, getOne, now, listAll } from './db';
import { notifyUser } from './notifications';
import { logAudit } from './audit';
import { safeNumber } from './safe';
import { resolveStageApprover } from './contributionRouting';
import type { Contribution, ContributionApproval, AppUser } from '@/types';

function getStage(c: Contribution): 1 | 2 | 3 | 4 {
  const s = c.currentStage;
  if (s === 1 || s === 2) return s;
  if (s === 3 || s === 4) return 4;
  if (c.status === 'approved' || c.status === 'rejected') return 4;
  return 1;
}

function getApprovals(c: Contribution): ContributionApproval[] {
  if (Array.isArray(c.approvals) && c.approvals.length > 0) return [...c.approvals];
  return [
    { stage: 1, status: 'pending' },
    { stage: 2, status: 'pending' },
  ];
}

export function newContributionApprovals(): ContributionApproval[] {
  return [
    { stage: 1, status: 'pending' },
    { stage: 2, status: 'pending' },
  ];
}

function verifyApprover(
  approver: AppUser,
  c: Contribution,
  stage: 1 | 2,
): { ok: boolean; reason?: string } {
  const teamId = c.teamId ?? null;
  const committeeId = c.committeeId ?? null;

  if (!teamId) return { ok: false, reason: 'Contribution is missing team context.' };

  if (stage === 1) {
    if (approver.role !== 'COMMITTEE_HR') {
      return { ok: false, reason: 'Stage 1 must be performed by the HR of the committee.' };
    }
    if (approver.teamId !== teamId) {
      return { ok: false, reason: "You must be inside the author's team." };
    }
    if (
      !committeeId ||
      !Array.isArray(approver.committeeIds) ||
      !approver.committeeIds.includes(committeeId)
    ) {
      return { ok: false, reason: "You are not the HR of the author's committee." };
    }
    return { ok: true };
  }

  if (stage === 2) {
    if (approver.role !== 'HR') {
      return { ok: false, reason: 'Stage 2 must be performed by the HR of the team.' };
    }
    if (approver.teamId !== teamId) {
      return { ok: false, reason: "You must belong to the author's team." };
    }
    return { ok: true };
  }

  return { ok: false, reason: 'Unknown stage.' };
}

async function auditReject(
  user: AppUser,
  c: Contribution,
  stage: 1 | 2,
  reason: string,
): Promise<void> {
  try {
    await logAudit(
      user,
      'REJECTED_APPROVAL_ATTEMPT',
      'Contribution',
      c.id,
      'stage=' + stage + ' reason=' + reason,
    );
  } catch { /* ignore */ }
}

export async function approveContributionStage(
  contribution: Contribution,
  user: AppUser,
  points?: number,
  comment?: string,
): Promise<void> {
  const stage = getStage(contribution);
  if (stage < 1 || stage > 2) throw new Error('This contribution is already finalised.');

  const v = verifyApprover(user, contribution, stage);
  if (!v.ok) {
    await auditReject(user, contribution, stage, v.reason || 'unknown');
    throw new Error(v.reason || 'You are not authorised to approve this stage.');
  }

  const approvals = getApprovals(contribution);

  const stageEntry = approvals.find((a) => a.stage === stage);
  if (stageEntry && stageEntry.status === 'approved') {
    await auditReject(user, contribution, stage, 'already-approved-by-this-stage');
    throw new Error('This stage has already been approved.');
  }

  if (stage === 1) {
    if (typeof points !== 'number' || Number.isNaN(points) || points < 0) {
      throw new Error('Points must be assigned at stage 1.');
    }
  }

  const idx = approvals.findIndex((a) => a.stage === stage);
  const newApproval: ContributionApproval = {
    stage: stage as 1 | 2,
    status: 'approved',
    approvedBy: user.uid,
    approvedByName: user.displayName,
    approvedByRole: user.role,
    approvedAt: now(),
    comment: comment && comment.trim() ? comment.trim() : undefined,
    points: stage === 1 ? points : undefined,
  };
  if (idx >= 0) approvals[idx] = newApproval;
  else approvals.push(newApproval);

  let updatedPoints = safeNumber(contribution.points);
  if (stage === 1 && typeof points === 'number') updatedPoints = points;

  const allUsers = await listAll<AppUser>('users');

  /* ─── STAGE 2 → FINAL ─── */
  if (stage === 2) {
    await updateOne('contributions', contribution.id, {
      approvals,
      points: updatedPoints,
      status: 'approved',
      currentStage: 4,
      pendingApproverId: null,
      pendingApproverRole: null,
    });

    if (updatedPoints > 0) {
      try {
        const member = await getOne<{ points?: number; hours?: number }>(
          'members',
          contribution.memberId,
        );
        if (member) {
          await updateOne('members', contribution.memberId, {
            points: safeNumber(member.points) + updatedPoints,
            hours: safeNumber(member.hours) + safeNumber(contribution.hours),
          });
        }
      } catch (e) {
        console.warn('Member update failed:', e);
      }
    }

    try {
      await notifyUser(
        contribution.createdBy || '',
        'Contribution approved',
        '"' + (contribution.title || '') + '" — +' + updatedPoints + ' points',
        'participation',
        '/my-contributions',
        'high',
        user.displayName,
      );
    } catch { /* ignore */ }

    const notified = new Set<string>();
    notified.add(contribution.createdBy || '');
    notified.add(user.uid);
    approvals.forEach((a) => {
      if (a.approvedBy) notified.add(a.approvedBy);
    });
    for (const uid of notified) {
      if (!uid || uid === user.uid) continue;
      try {
        await notifyUser(
          uid,
          'Contribution finalised',
          '"' + (contribution.title || '') + '" awarded ' + updatedPoints + ' points.',
          'approval',
          '/my-contributions',
          'normal',
          user.displayName,
        );
      } catch { /* ignore */ }
    }

    try {
      await logAudit(
        user,
        'APPROVE_CONTRIBUTION_FINAL',
        'Contribution',
        contribution.id,
        'stage=2 points=' + updatedPoints,
      );
    } catch { /* ignore */ }

    return;
  }

  /* ─── STAGE 1 → 2 ─── */
  const nextApprover = resolveStageApprover(
    allUsers,
    2,
    contribution.teamId ?? null,
    contribution.committeeId ?? null,
  );

  const patchObj = {
    approvals,
    points: updatedPoints,
    status: nextApprover ? 'in_review' : 'blocked_no_approver',
    currentStage: 2,
    pendingApproverId: nextApprover ? nextApprover.uid : null,
    pendingApproverRole: nextApprover ? nextApprover.role : null,
    blockedReason: nextApprover
      ? null
      : 'No HR of Team found for team ' + (contribution.teamId || ''),
  };

  await updateOne('contributions', contribution.id, patchObj);

  if (nextApprover) {
    try {
      await notifyUser(
        nextApprover.uid,
        'Contribution awaiting your approval',
        '"' + (contribution.title || '') + '" — Stage 2 (HR of Team).',
        'approval',
        '/approvals',
        'high',
        user.displayName,
      );
    } catch { /* ignore */ }
  }

  try {
    await logAudit(
      user,
      'APPROVE_CONTRIBUTION_STAGE',
      'Contribution',
      contribution.id,
      'stage=1 points=' + updatedPoints + ' next=' + (nextApprover ? nextApprover.uid : 'none'),
    );
  } catch { /* ignore */ }
}

export async function rejectContributionStage(
  contribution: Contribution,
  user: AppUser,
  comment: string,
): Promise<void> {
  if (!comment || !comment.trim()) {
    throw new Error('A comment is required when rejecting.');
  }

  const stage = getStage(contribution);
  if (stage < 1 || stage > 2) throw new Error('This contribution is already finalised.');

  const v = verifyApprover(user, contribution, stage);
  if (!v.ok) {
    await auditReject(user, contribution, stage, v.reason || 'unknown');
    throw new Error(v.reason || 'You are not authorised to reject this stage.');
  }

  const approvals = getApprovals(contribution);
  const idx = approvals.findIndex((a) => a.stage === stage);

  const newApproval: ContributionApproval = {
    stage: stage as 1 | 2,
    status: 'rejected',
    approvedBy: user.uid,
    approvedByName: user.displayName,
    approvedByRole: user.role,
    approvedAt: now(),
    comment: comment.trim(),
  };
  if (idx >= 0) approvals[idx] = newApproval;
  else approvals.push(newApproval);

  for (let s = stage + 1; s <= 2; s++) {
    if (!approvals.some((a) => a.stage === s)) {
      approvals.push({ stage: s as 1 | 2, status: 'skipped' });
    }
  }

  await updateOne('contributions', contribution.id, {
    approvals,
    status: 'rejected',
    pendingApproverId: null,
    pendingApproverRole: null,
  });

  try {
    await notifyUser(
      contribution.createdBy || '',
      'Contribution rejected',
      '"' + (contribution.title || '') + '" — ' + comment,
      'participation',
      '/my-contributions',
      'high',
      user.displayName,
    );
  } catch { /* ignore */ }

  try {
    await logAudit(
      user,
      'REJECT_CONTRIBUTION',
      'Contribution',
      contribution.id,
      'stage=' + stage + ' ' + comment,
    );
  } catch { /* ignore */ }
}
