// [auto-fix] v7 — clean, deduplicated permissions module.
import type { AppUser, RoleId, TeamId } from '@/types';

/* ═══════════════════════════════════════════════════════════════
   Role levels (top → bottom)
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   Core role predicates
   ═══════════════════════════════════════════════════════════════ */

// [auto-fix] v7 isAdmin is HEAD-only.
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

// [auto-fix] v7 HEAD or VICE — Sub-Branches leadership.
export function isSubBranchesHead(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD' || user.role === 'VICE';
}

// [auto-fix] v7 HEAD_HR_GLOBAL.
export function isGlobalHR(user: AppUser | null): boolean {
  return user?.role === 'HEAD_HR_GLOBAL';
}

// [auto-fix] v7 PRESIDENT.
export function isTeamHead(user: AppUser | null): boolean {
  return user?.role === 'PRESIDENT';
}

// [auto-fix] v7 VICE_PRESIDENT.
export function isTeamViceHead(user: AppUser | null): boolean {
  return user?.role === 'VICE_PRESIDENT';
}

// [auto-fix] v7 HR — team HR.
export function isTeamHR(user: AppUser | null): boolean {
  return user?.role === 'HR';
}

// [auto-fix] v7 COMMITTEE_HR.
export function isCommitteeHR(user: AppUser | null): boolean {
  return user?.role === 'COMMITTEE_HR';
}

// [auto-fix] v7 manager — any elevated role.
export function isManager(user: AppUser | null): boolean {
  if (!user) return false;
  return [
    'HEAD',
    'VICE',
    'HEAD_HR_GLOBAL',
    'PRESIDENT',
    'VICE_PRESIDENT',
    'HR',
    'COMMITTEE_HR',
  ].includes(user.role);
}

// [auto-fix] v7 sees-all-teams: HEAD, VICE, HEAD_HR_GLOBAL.
export function seesAllTeams(user: AppUser | null): boolean {
  if (!user) return false;
  return ['HEAD', 'VICE', 'HEAD_HR_GLOBAL'].includes(user.role);
}

// [auto-fix] v7 managed-team — null means "all teams".
export function managedTeam(user: AppUser | null): TeamId | null {
  if (!user) return null;
  if (seesAllTeams(user)) return null;
  return user.teamId ?? null;
}

// [auto-fix] v7 can-approve-step.
export function canApproveStep(
  user: AppUser | null,
  step: { status: string; requiredRole: string; requiredTeamId?: TeamId | null },
): boolean {
  if (!user) return false;
  if (step.status !== 'PENDING') return false;
  if (isAdmin(user)) return true;
  if (user.role !== step.requiredRole) return false;
  if (step.requiredTeamId) return user.teamId === step.requiredTeamId;
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   Arabic role labels for the UI
   ═══════════════════════════════════════════════════════════════ */

// [auto-fix] v7 ROLE_LABEL.
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
