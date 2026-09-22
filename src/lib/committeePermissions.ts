import type { AppUser, Contribution } from '@/types';
import { safeArray } from './safe';
import { isAdmin } from './permissions';

function hasCommittee(user: AppUser | null, committeeId: string): boolean {
  if (!user) return false;
  return safeArray(user.committeeIds).includes(committeeId);
}

export function isCommitteeHR(user: AppUser | null, committeeId: string): boolean {
  if (!user || !committeeId) return false;
  if (user.role !== 'HR' && user.role !== 'COMMITTEE_HR') return false;
  return hasCommittee(user, committeeId);
}

export function isTeamHeadHR(user: AppUser | null, teamId: string): boolean {
  if (!user) return false;
  if (user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT') return user.teamId === teamId;
  if (user.role === 'HR') return user.teamId === teamId;
  return false;
}

export function isTeamHead(user: AppUser | null, teamId: string): boolean {
  if (!user) return false;
  return user.role === 'PRESIDENT' && user.teamId === teamId;
}

export function isGlobalHR(user: AppUser | null): boolean {
  return user?.role === 'HEAD_HR';
}

export function isSubBranchesHead(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD' || user.role === 'VICE';
}

function getStage(c: Contribution): 1 | 2 | 3 | 4 {
  const s = c.currentStage;
  if (s === 1 || s === 2 || s === 3 || s === 4) return s;
  if (c.status === 'approved' || c.status === 'rejected') return 4;
  return 1;
}

export interface StageInfo {
  stage: 1 | 2 | 3 | 4;
  label: string;
  canApprove: boolean;
  assignPoints: boolean;
}

export function getContributionStage(user: AppUser | null, c: Contribution): StageInfo {
  const stage = getStage(c);
  if (!user) return { stage, label: 'Unknown', canApprove: false, assignPoints: false };

  if (stage === 1) {
    return {
      stage: 1,
      label: 'Committee HR Approval',
      canApprove: isCommitteeHR(user, c.committeeId || '') || isAdmin(user),
      assignPoints: true,
    };
  }
  if (stage === 2) {
    return {
      stage: 2,
      label: 'Team Head / Team Head HR',
      canApprove: isTeamHeadHR(user, c.teamId) || isTeamHead(user, c.teamId) || isAdmin(user),
      assignPoints: false,
    };
  }
  if (stage === 3) {
    return {
      stage: 3,
      label: 'Global Review',
      canApprove: isGlobalHR(user) || isSubBranchesHead(user) || isAdmin(user),
      assignPoints: false,
    };
  }
  return { stage: 4, label: 'Completed', canApprove: false, assignPoints: false };
}

export function canReviewContribution(user: AppUser | null, c: Contribution): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const stage = getStage(c);
  if (stage === 1) return isCommitteeHR(user, c.committeeId || '');
  if (stage === 2) return isTeamHeadHR(user, c.teamId) || isTeamHead(user, c.teamId);
  if (stage === 3) return isGlobalHR(user) || isSubBranchesHead(user);
  return false;
}
