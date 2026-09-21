

import type { Contribution, ContributionApproval, AppUser } from '@/types';

function getCurrentStage(contribution: Contribution): 1 | 2 | 3 | 4 {
  const s = contribution.currentStage;
  if (s === 1 || s === 2 || s === 3 || s === 4) return s;
  if (contribution.status === 'approved' || contribution.status === 'rejected') return 4;
  return 1;
}

function getApprovals(contribution: Contribution): ContributionApproval[] {
  return Array.isArray(contribution.approvals) ? [...contribution.approvals] : [
    { stage: 1, status: 'pending' },
    { stage: 2, status: 'pending' },
    { stage: 3, status: 'pending' },
  ];
}

export async function approveContributionStage(
  contribution: Contribution,
  user: AppUser,
  points?: number,
  comment?: string,
): Promise<void> {
  const nowStr = now();
  const stage = getCurrentStage(contribution);

  if (stage < 1 || stage > 3) {
    throw new Error('Invalid stage');
  }

  const approvals = getApprovals(contribution);
  const existingIndex = approvals.findIndex((a) => a.stage === stage);

  const newApproval: ContributionApproval = {
    stage: stage as 1 | 2 | 3,
    status: 'approved',
    approvedBy: user.uid,
    approvedByName: user.displayName,
    approvedByRole: user.role,
    approvedAt: nowStr,
    comment: comment?.trim() || undefined,
  };

  if (existingIndex >= 0) {
    approvals[existingIndex] = newApproval;
  } else {
    approvals.push(newApproval);
  }

  let updatedPoints = contribution.points || 0;

  if (stage === 1) {
    if (typeof points !== 'number') {
      throw new Error('Points must be assigned at stage 1');
    }
    updatedPoints = points;
  }

  if (stage === 3) {
    await updateOne('contributions', contribution.id, {
      approvals,
      points: updatedPoints,
      status: 'approved',
      currentStage: 4,
    });

    if (updatedPoints > 0) {
      const member = await getOne<{ points?: number; hours?: number }>('members', contribution.memberId);
      if (member) {
        await updateOne('members', contribution.memberId, {
          points: (member.points || 0) + updatedPoints,
          hours: (member.hours || 0) + (contribution.hours || 0),
        });
      }
    }

    await notifyUser(
      contribution.createdBy,
      'Contribution approved',
      '"' + contribution.title + '" — +' + updatedPoints + ' points',
      'participation',
      '/my-contributions',
      'high',
      user.displayName,
    );

    await logAudit(user, 'APPROVE_CONTRIBUTION_FINAL', 'Contribution', contribution.id, contribution.title);
  } else {
    const nextStage = (stage + 1) as 2 | 3;
    await updateOne('contributions', contribution.id, {
      approvals,
      points: updatedPoints,
      status: 'in_review',
      currentStage: nextStage,
    });

    await notifyUser(
      contribution.createdBy,
      'Contribution progressed',
      '"' + contribution.title + '" — stage ' + nextStage + ' of 3',
      'approval',
      '/my-contributions',
      'normal',
      user.displayName,
    );

    await logAudit(user, 'APPROVE_CONTRIBUTION_STAGE', 'Contribution', contribution.id, 'Stage ' + stage);
  }
}

export async function rejectContributionStage(
  contribution: Contribution,
  user: AppUser,
  comment: string,
): Promise<void> {
  if (!comment.trim()) throw new Error('Rejection reason is required');

  const stage = getCurrentStage(contribution);
  const approvals = getApprovals(contribution);
  const existingIndex = approvals.findIndex((a) => a.stage === stage);

  const newApproval: ContributionApproval = {
    stage: stage as 1 | 2 | 3,
    status: 'rejected',
    approvedBy: user.uid,
    approvedByName: user.displayName,
    approvedByRole: user.role,
    approvedAt: now(),
    comment: comment.trim(),
  };

  if (existingIndex >= 0) {
    approvals[existingIndex] = newApproval;
  } else {
    approvals.push(newApproval);
  }

  for (let s = stage + 1; s <= 3; s++) {
    if (!approvals.some((a) => a.stage === s)) {
      approvals.push({ stage: s as 1 | 2 | 3, status: 'skipped' });
    }
  }

  await updateOne('contributions', contribution.id, {
    approvals,
    status: 'rejected',
  });

  await notifyUser(
    contribution.createdBy,
    'Contribution rejected',
    '"' + contribution.title + '" — Reason: ' + comment,
    'participation',
    '/my-contributions',
    'high',
    user.displayName,
  );

  await logAudit(user, 'REJECT_CONTRIBUTION', 'Contribution', contribution.id, comment);
}

export function newContributionApprovals(): ContributionApproval[] {
  return [
    { stage: 1, status: 'pending' },
    { stage: 2, status: 'pending' },
    { stage: 3, status: 'pending' },
  ];
}
