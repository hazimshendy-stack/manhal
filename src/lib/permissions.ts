import type { AppUser, RoleId, TeamId } from '@/types';
   import { safeArray } from './safe';

   /* ═══════════════════════════════════════════════════════════════
      Hierarchy (top → bottom):
      HEAD  →  VICE  →  HEAD_HR_GLOBAL
      ↓
      Per Team: PRESIDENT → VICE_PRESIDENT → HEAD_HR_TEAM → HR
      Per Committee: COMMITTEE_HR
      ↓
      MEMBER → VIEWER
      ═══════════════════════════════════════════════════════════════ */

   // [auto-fix] v7 ROLE_LEVEL — HEAD_HR_TEAM removed
export const ROLE_LEVEL: Record<RoleId, number> = {
  HEAD: 100,
  VICE: 95,
  HEAD_HR_GLOBAL: 90,
  PRESIDENT: 80,
  VICE_PRESIDENT: 70,
  HR: 60,
  COMMITTEE_HR: 55,
  MEMBER: 50,
  VIEWER: 10,
};

   // [auto-fix] v7: admin is HEAD only — VICE has full permissions but no admin-only actions.
// [auto-fix] v7 isAdmin is HEAD-only
export function isAdmin(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD';
}

// [auto-fix] v7 VICE has full permissions but not admin-only actions.
export function isViceHead(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'VICE';
}

// [auto-fix] v7 admin-panel access for HEAD + VICE.
export function canAccessAdminPanel(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD' || user.role === 'VICE';
}

// [auto-fix] v7: VICE keeps full permissions except admin-only actions.
export function isViceHead(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'VICE';
}

// [auto-fix] v7: allow admin-panel access to HEAD + VICE.
export function canAccessAdminPanel(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD' || user.role === 'VICE';
}

   export function isSubBranchesHead(user: AppUser | null): boolean {
     if (!user) return false;
     return user.role === 'HEAD' || user.role === 'VICE';
   }

   export function isGlobalHR(user: AppUser | null): boolean {
     return user?.role === 'HEAD_HR_GLOBAL';
   }

   export function isTeamHead(user: AppUser | null): boolean {
     return user?.role === 'PRESIDENT';
   }

   export function isTeamViceHead(user: AppUser | null): boolean {
     return user?.role === 'VICE_PRESIDENT';
   }

   // [auto-fix] v7: isTeamHeadHR removed — team HR role collapsed into HR.

   export function isTeamHR(user: AppUser | null): boolean {
     return user?.role === 'HR';
   }

   export function isCommitteeHR(user: AppUser | null): boolean {
     return user?.role === 'COMMITTEE_HR';
   }

   export function isManager(user: AppUser | null): boolean {
     if (!user) return false;
     return ['HEAD', 'VICE', 'HEAD_HR_GLOBAL', 'PRESIDENT', 'VICE_PRESIDENT', 'HEAD_HR_TEAM', 'HR', 'COMMITTEE_HR'].includes(user.role);
   }

   export function seesAllTeams(user: AppUser | null): boolean {
     if (!user) return false;
     return ['HEAD', 'VICE', 'HEAD_HR_GLOBAL'].includes(user.role);
   }

   export function managedTeam(user: AppUser | null): TeamId | null {
     if (!user) return null;
     if (seesAllTeams(user)) return null;
     return user.teamId ?? null;
   }

   export function canApproveStep(user: AppUser | null, step: { status: string; requiredRole: string; requiredTeamId?: TeamId | null }): boolean {
     if (!user) return false;
     if (step.status !== 'PENDING') return false;
     if (isAdmin(user)) return true;
     if (user.role !== step.requiredRole) return false;
     if (step.requiredTeamId) return user.teamId === step.requiredTeamId;
     return true;
   }

   // [auto-fix] v7 ROLE_LABEL
export const ROLE_LABEL: Record<RoleId, string> = {
  HEAD: 'رئيس الفروع',
  VICE: 'نائب رئيس الفروع',
  HEAD_HR_GLOBAL: 'رئيس الموارد البشرية',
  PRESIDENT: 'رئيس فريق',
  VICE_PRESIDENT: 'نائب رئيس فريق',
  HR: 'موارد بشرية الفريق',
  COMMITTEE_HR: 'موارد بشرية اللجنة',
  MEMBER: 'عضو',
  VIEWER: 'زائر',
};
   