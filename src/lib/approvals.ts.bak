

import type { ApprovalStep, RequestRecord, AppUser, RoleId, TeamId } from '@/types';

export interface ApprovalChainStep { role: RoleId; teamId: TeamId | null; }

export function buildApprovalChain(request: RequestRecord): ApprovalChainStep[] {
  const chain: ApprovalChainStep[] = [];
  if (request.type === 'TRANSFER' && request.fromTeamId && request.toTeamId) {
    chain.push({ role: 'PRESIDENT', teamId: request.fromTeamId });
    chain.push({ role: 'PRESIDENT', teamId: request.toTeamId });
    chain.push({ role: 'HEAD_HR', teamId: null });
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'PROMOTION') {
    const t = request.fromTeamId ?? request.toTeamId ?? null;
    if (t) { chain.push({ role: 'PRESIDENT', teamId: t }); chain.push({ role: 'HR', teamId: t }); }
    chain.push({ role: 'HEAD_HR', teamId: null });
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'RESIGNATION') {
    const t = request.fromTeamId ?? request.toTeamId ?? null;
    if (t) { chain.push({ role: 'PRESIDENT', teamId: t }); chain.push({ role: 'HR', teamId: t }); }
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'COMPLAINT') {
    chain.push({ role: 'HEAD_HR', teamId: null });
    chain.push({ role: 'VICE', teamId: null });
  } else if (request.type === 'SUGGESTION') {
    const t = request.fromTeamId ?? request.toTeamId ?? null;
    if (t) chain.push({ role: 'PRESIDENT', teamId: t });
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'LEAVE') {
    const t = request.fromTeamId ?? request.toTeamId ?? null;
    if (t) { chain.push({ role: 'PRESIDENT', teamId: t }); chain.push({ role: 'HR', teamId: t }); }
  } else {
    chain.push({ role: 'HEAD', teamId: null });
  }
  return chain;
}

export async function createRequestWithChain(request: RequestRecord): Promise<void> {
  await createOne('requests', request);
  const chain = buildApprovalChain(request);
  for (let i = 0; i < chain.length; i += 1) {
    await createOne('approvals', { id: newId('APR'), requestId: request.id, order: i + 1, requiredRole: chain[i].role, requiredTeamId: chain[i].teamId, status: 'PENDING' });
  }
}

export async function approveStep(request: RequestRecord, step: ApprovalStep, user: AppUser): Promise<void> {
  await updateOne('approvals', step.id, { status: 'APPROVED', approverUid: user.uid, approverName: user.displayName, actionDate: today() });
  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  const sorted = allSteps.sort((a, b) => a.order - b.order);
  const remaining = sorted.filter((s) => s.status === 'PENDING' && s.id !== step.id);
  if (remaining.length === 0) {
    await updateOne('requests', request.id, { status: 'APPROVED', currentStepOrder: sorted.length, updatedAt: today() });
    await notifyUser(request.requesterUid, 'Request approved', 'Your request "' + request.title + '" was finally approved.', 'request', '/requests/' + request.id, 'high');
    await logAudit(user, 'APPROVE_REQUEST', 'Request', request.id, 'Final approval');
  } else {
    const nextOrder = Math.min(...remaining.map((s) => s.order));
    await updateOne('requests', request.id, { status: 'IN_REVIEW', currentStepOrder: nextOrder, updatedAt: today() });
    await notifyUser(request.requesterUid, 'Request progressing', 'Your request "' + request.title + '" is at step ' + nextOrder + '.', 'approval', '/requests/' + request.id, 'normal');
  }
}

export async function adminApproveAll(request: RequestRecord, user: AppUser): Promise<void> {
  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  const sorted = allSteps.sort((a, b) => a.order - b.order);
  for (const step of sorted) {
    if (step.status === 'PENDING') {
      await updateOne('approvals', step.id, { status: 'APPROVED', approverUid: user.uid, approverName: user.displayName, actionDate: today(), comment: 'Admin final approval' });
    }
  }
  await updateOne('requests', request.id, { status: 'APPROVED', currentStepOrder: sorted.length, updatedAt: today() });
  await notifyUser(request.requesterUid, 'Request approved', 'Your request "' + request.title + '" was finally approved by admin.', 'request', '/requests/' + request.id, 'high');
  await logAudit(user, 'ADMIN_APPROVE_ALL', 'Request', request.id, 'Admin final approval');
}

export async function rejectStep(request: RequestRecord, step: ApprovalStep, user: AppUser, comment: string): Promise<void> {
  await updateOne('approvals', step.id, { status: 'REJECTED', approverUid: user.uid, approverName: user.displayName, comment: comment.trim() || undefined, actionDate: today() });
  await updateOne('requests', request.id, { status: 'REJECTED', updatedAt: today() });
  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  for (const s of allSteps) { if (s.order > step.order && s.status === 'PENDING') await updateOne('approvals', s.id, { status: 'SKIPPED' }); }
  const reasonText = comment.trim() ? ' Reason: ' + comment : '';
  await notifyUser(request.requesterUid, 'Request rejected', 'Your request "' + request.title + '" was rejected.' + reasonText, 'request', '/requests/' + request.id, 'high');
  await logAudit(user, 'REJECT_REQUEST', 'Request', request.id, 'Rejected');
}