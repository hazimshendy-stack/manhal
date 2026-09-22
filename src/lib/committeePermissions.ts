import type { AppUser, Contribution } from '@/types';
   import { safeArray } from './safe';
   import { isAdmin } from './permissions';

   /* ═══════════════════════════════════════════════════════════════
      3-Stage Flexible Approval:
      ─────────────────────────────────────────────────────────────
      STAGE 1: Committee HR (mandatory) — assigns points flexibly
      STAGE 2: Team Head HR OR Team Head (one of them)
      STAGE 2: HR of Team (final) — awards points to the member.
      */

   function hasCommittee(user: AppUser | null, committeeId: string): boolean {
     if (!user) return false;
     return safeArray(user.committeeIds).includes(committeeId);
   }

   export function userIsCommitteeHR(user: AppUser | null, committeeId: string): boolean {
     if (!user || !committeeId) return false;
     if (user.role !== 'COMMITTEE_HR') return false;
     return hasCommittee(user, committeeId);
   }

   // [auto-fix] v7 teamHR helper
export function userIsTeamHR(user: AppUser | null, teamId: string): boolean {
  if (!user || !teamId) return false;
  if (user.role !== 'HR') return false;
  return user.teamId === teamId;
}

   export function userIsTeamHead(user: AppUser | null, teamId: string): boolean {
     if (!user || !teamId) return false;
     return (user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT') && user.teamId === teamId;
   }

   export function userIsGlobalHR(user: AppUser | null): boolean {
     return user?.role === 'HEAD_HR_GLOBAL';
   }

   export function userIsSubBranchesHead(user: AppUser | null): boolean {
     if (!user) return false;
     return user.role === 'HEAD' || user.role === 'VICE';
   }

   export function getStage(c: Contribution): 1 | 2 | 3 | 4 {
  const s = c.currentStage;
  if (s === 1 || s === 2) return s;
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
         label: 'Committee HR — assign points',
         canApprove: userIsCommitteeHR(user, c.committeeId || '') || isAdmin(user),
         assignPoints: true,
       };
     }
     if (stage === 2) {
    return {
      stage: 2,
      label: 'HR of Team',
      canApprove: userIsTeamHR(user, c.teamId) || isAdmin(user),
      assignPoints: false,
    };
  }
     if (stage === 3) {
    return { stage: 4, label: 'Completed', canApprove: false, assignPoints: false };
  }
     return { stage: 4, label: 'Completed', canApprove: false, assignPoints: false };
   }

   export function canReviewContribution(user: AppUser | null, c: Contribution): boolean {
     if (!user) return false;
     if (isAdmin(user)) return true;
     const stage = getStage(c);
     if (stage === 1) return userIsCommitteeHR(user, c.committeeId || '');
     if (stage === 2) return userIsTeamHeadHR(user, c.teamId) || userIsTeamHead(user, c.teamId);
     if (stage === 3) return false;
     return false;
   }
   