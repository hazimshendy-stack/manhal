// src/lib/postsApproval.ts
// Fix #9 — Posts approval rebuilt as a 3-stage flow with strict verification.
//
// Contract (client side):
//   - A post can only be approved by a user who is:
//       * same TEAM as the author
//       * same COMMITTEE as the author
//       * HR (COMMITTEE_HR / HEAD_HR_TEAM) for stage 1
//   - Stage 1 must be the committee HR of the author's committee.
//   - Stage 2 and 3 are sequential with identical "same team + same committee"
//     verification, moving up the role ladder.
//   - A single approver cannot approve the same post twice (dedup via ledger).
//   - After stage 3 APPROVED: award points, write ledger, notify everyone.
//   - Approve: comment OPTIONAL. Reject: comment REQUIRED.
//
// The actual write endpoints are expected on the backend:
//   POST /posts/{postId}/approve   { stage, approverUid, comment? }
//   POST /posts/{postId}/reject    { stage, approverUid, comment }
//   POST /posts/{postId}/award     { memberId, points }

import type { AppUser, PostRecord, PointsLedgerEntry, RoleId, TeamId } from '@/types';

const COMMITTEE_HR_ROLES: RoleId[] = ['COMMITTEE_HR', 'HEAD_HR_TEAM'];

export interface VerificationResult { ok: boolean; reason?: string; }

export function isSameTeamAndCommittee(
  approver: AppUser | null | undefined,
  author: { teamId?: TeamId | null; committeeId?: string | null } | null | undefined,
): boolean {
  if (!approver || !author) return false;
  if (!approver.teamId || !approver.committeeId) return false;
  if (!author.teamId || !author.committeeId) return false;
  return approver.teamId === author.teamId && approver.committeeId === author.committeeId;
}

export function verifyStageApprover(
  stage: 1 | 2 | 3,
  approver: AppUser | null | undefined,
  author: { teamId?: TeamId | null; committeeId?: string | null } | null | undefined,
): VerificationResult {
  if (!approver) return { ok: false, reason: 'No approver.' };
  if (!isSameTeamAndCommittee(approver, author)) {
    return { ok: false, reason: 'Approver must be in the same team and same committee as the author.' };
  }
  if (stage === 1) {
    if (!COMMITTEE_HR_ROLES.includes(approver.role)) {
      return { ok: false, reason: 'Stage 1 must be performed by the committee HR.' };
    }
  }
  return { ok: true };
}

export function hasAlreadyApproved(
  ledger: PointsLedgerEntry[],
  approverUid: string,
  postId: string,
): boolean {
  return ledger.some((e) => e.postId === postId && e.approverUid === approverUid);
}

export interface ApproveInput {
  stage: 1 | 2 | 3;
  comment?: string;   // OPTIONAL on approve
}

export interface RejectInput {
  stage: 1 | 2 | 3;
  comment: string;    // REQUIRED on reject
}

export function validateApprove(_input: ApproveInput): void {
  // Comment is intentionally optional on approve.
}

export function validateReject(input: RejectInput): void {
  if (!input.comment || !input.comment.trim()) {
    throw new Error('A comment is required when rejecting a post.');
  }
}

export function nextStage(current: 1 | 2 | 3): 1 | 2 | 3 | 'DONE' {
  if (current === 1) return 2;
  if (current === 2) return 3;
  return 'DONE';
}

export function computeAwardedPoints(post: PostRecord): number {
  // Points are computed by the backend; this is a display-side fallback.
  if (typeof post.points === 'number' && post.points > 0) return post.points;
  return 0;
}
