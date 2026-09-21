import type { AppUser, RoleId, TeamId, RequestRecord, ApprovalStep } from '@/types';

export const ROLE_LEVEL: Record<RoleId, number> = { HEAD: 100, VICE: 95, HEAD_HR: 90, PRESIDENT: 80, VICE_PRESIDENT: 70, HR: 60, MEMBER: 50, VIEWER: 10 };

export function isAdmin(user: AppUser | null): boolean { if (!user) return false; return user.role === 'HEAD' || user.role === 'VICE'; }
export function isManager(user: AppUser | null): boolean { if (!user) return false; return ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(user.role); }
export function seesAllTeams(user: AppUser | null): boolean { if (!user) return false; return ['HEAD', 'VICE', 'HEAD_HR'].includes(user.role); }
export function managedTeam(user: AppUser | null): TeamId | null { if (!user) return null; if (seesAllTeams(user)) return null; return user.teamId; }
export function canApproveStep(user: AppUser | null, step: ApprovalStep): boolean {
  if (!user) return false;
  if (step.status !== 'PENDING') return false;
  if (isAdmin(user)) return true;
  if (user.role !== step.requiredRole) return false;
  if (step.requiredTeamId !== null) return user.teamId === step.requiredTeamId;
  return true;
}
export function canApproveRequest(user: AppUser | null, request: RequestRecord, steps: ApprovalStep[]): boolean {
  if (!user) return false;
  const currentStep = steps.find((s) => s.status === 'PENDING' && s.order === request.currentStepOrder);
  if (!currentStep) return false;
  return canApproveStep(user, currentStep);
}
export function canSendNotifications(user: AppUser | null): boolean { if (!user) return false; return ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(user.role); }
export function canManageMembers(user: AppUser | null): boolean { return isAdmin(user); }
export function canManageConversations(user: AppUser | null): boolean { return isAdmin(user); }
export function canSeeMember(user: AppUser | null, member: { teamIds: TeamId[] }): boolean {
  if (!user) return false;
  if (seesAllTeams(user)) return true;
  if (user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT' || user.role === 'HR') return user.teamId !== null && member.teamIds.includes(user.teamId);
  return true;
}
export const ROLE_LABEL: Record<RoleId, string> = {
  HEAD: 'Head', VICE: 'Vice Head', HEAD_HR: 'Head of HR', PRESIDENT: 'Team President', VICE_PRESIDENT: 'Vice President', HR: 'HR', MEMBER: 'Member', VIEWER: 'Viewer',
};