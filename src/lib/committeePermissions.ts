import type { AppUser, Contribution } from '@/types';

function safeArray<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}

function hasCommittee(user: AppUser | null, committeeId: string): boolean {
  if (!user) return false;
  return safeArray(user.committeeIds).includes(committeeId);
}

export function isCommitteeHR(user: AppUser | null, committeeId: string): boolean {
  if (!user) return false;
  if (!committeeId) return false;
  if (user.role !== 'HR' && user.role !== 'COMMITTEE_HR') return false;
  return hasCommittee(user, committeeId);
}

export function isTeamHR(user: AppUser | null, teamId: string): boolean {
  if (!user) return false;
  if (user.role !== 'HR' && user.role !== 'HEAD_HR') return false;
  if (user.role === 'HEAD_HR') return true;
  return user.teamId === teamId;
}

export function isTeamHead(user: AppUser | null, teamId: string): boolean {
  if (!user) return false;
  if (user.role !== 'PRESIDENT') return false;
  return user.teamId === teamId;
}

export function isTeamHeadHR(user: AppUser | null, teamId: string): boolean {
  if (!user) return false;
  if (user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT') return user.teamId === teamId;
  if (user.role === 'HR') return user.teamId === teamId;
  return false;
}

export function isGlobalHR(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD_HR';
}

export function isSubBranchesHead(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD' || user.role === 'VICE';
}

export interface StageInfo {
  stage: 1 | 2 | 3 | 4;
  label: string;
  canApprove: boolean;
  assignPoints: boolean;
}

function getCurrentStage(contribution: Contribution): 1 | 2 | 3 | 4 {
  const s = contribution.currentStage;
  if (s === 1 || s === 2 || s === 3 || s === 4) return s;
  // Fallback for old contributions
  if (contribution.status === 'approved') return 4;
  if (contribution.status === 'rejected') return 4;
  return 1;
}

export function getContributionStage(user: AppUser | null, contribution: Contribution): StageInfo {
  const stage = getCurrentStage(contribution);

  if (!user) {
    return { stage, label: 'Unknown', canApprove: false, assignPoints: false };
  }

  if (stage === 1) {
    return {
      stage: 1,
      label: 'Committee HR Approval',
      canApprove: isCommitteeHR(user, contribution.committeeId || '') || isAdmin(user),
      assignPoints: true,
    };
  }

  if (stage === 2) {
    return {
      stage: 2,
      label: 'Team Head HR / Team Head Approval',
      canApprove: isTeamHeadHR(user, contribution.teamId) || isTeamHead(user, contribution.teamId) || isAdmin(user),
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

  return {
    stage: 4,
    label: 'Completed',
    canApprove: false,
    assignPoints: false,
  };
}

export function canReviewContribution(user: AppUser | null, contribution: Contribution): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;

  const stage = getCurrentStage(contribution);

  if (stage === 1) return isCommitteeHR(user, contribution.committeeId || '');
  if (stage === 2) return isTeamHeadHR(user, contribution.teamId) || isTeamHead(user, contribution.teamId);
  if (stage === 3) return isGlobalHR(user) || isSubBranchesHead(user);
  return false;
}
