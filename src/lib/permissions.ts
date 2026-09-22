import type { AppUser, RoleId, TeamId } from '@/types';

export const ROLE_LEVEL: Record<RoleId, number> = {
  HEAD: 100, VICE: 95, HEAD_HR: 90, PRESIDENT: 80,
  VICE_PRESIDENT: 70, HR: 60, COMMITTEE_HR: 55, MEMBER: 50, VIEWER: 10,
};

export function isAdmin(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD' || user.role === 'VICE';
}

export function isManager(user: AppUser | null): boolean {
  if (!user) return false;
  return ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR', 'COMMITTEE_HR'].includes(user.role);
}

export function seesAllTeams(user: AppUser | null): boolean {
  if (!user) return false;
  return ['HEAD', 'VICE', 'HEAD_HR'].includes(user.role);
}

export function managedTeam(user: AppUser | null): TeamId | null {
  if (!user) return null;
  if (seesAllTeams(user)) return null;
  return user.teamId ?? null;
}

export function hasRole(user: AppUser | null, roles: RoleId[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function canApproveStep(user: AppUser | null, step: { status: string; requiredRole: string; requiredTeamId?: TeamId | null }): boolean {
  if (!user) return false;
  if (step.status !== 'PENDING') return false;
  if (isAdmin(user)) return true;
  if (user.role !== step.requiredRole) return false;
  if (step.requiredTeamId) return user.teamId === step.requiredTeamId;
  return true;
}

export const ROLE_LABEL: Record<RoleId, string> = {
  HEAD: 'Head Sub Branches',
  VICE: 'Vice Sub Branches',
  HEAD_HR: 'Head HR Global',
  PRESIDENT: 'Team Head',
  VICE_PRESIDENT: 'Team Vice Head',
  HR: 'Team HR',
  COMMITTEE_HR: 'Committee HR',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};
