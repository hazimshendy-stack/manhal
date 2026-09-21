import type { AppUser, RoleId, TeamId, RequestRecord, ApprovalStep } from '@/types';

   /* ═══════════════════════════════════════════════════════════════
      مستويات الأدوار
      ═══════════════════════════════════════════════════════════════ */

   export const ROLE_LEVEL: Record<RoleId, number> = {
     HEAD: 100,
     VICE: 95,
     HEAD_HR: 90,
     PRESIDENT: 80,
     VICE_PRESIDENT: 70,
     HR: 60,
     MEMBER: 50,
     VIEWER: 10,
   };

   /* ═══════════════════════════════════════════════════════════════
      Admin (كل الصلاحيات)
      ═══════════════════════════════════════════════════════════════ */

   export function isAdmin(user: AppUser | null): boolean {
     if (!user) return false;
     return user.role === 'HEAD' || user.role === 'VICE';
   }

   /* ═══════════════════════════════════════════════════════════════
      Manager (له لوحة إدارة)
      ═══════════════════════════════════════════════════════════════ */

   export function isManager(user: AppUser | null): boolean {
     if (!user) return false;
     return ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(user.role);
   }

   /* ═══════════════════════════════════════════════════════════════
      هل يرى كل الفرق؟
      ═══════════════════════════════════════════════════════════════ */

   export function seesAllTeams(user: AppUser | null): boolean {
     if (!user) return false;
     return ['HEAD', 'VICE', 'HEAD_HR'].includes(user.role);
   }

   /* ═══════════════════════════════════════════════════════════════
      الفريق الذي يدير المستخدم
      ═══════════════════════════════════════════════════════════════ */

   export function managedTeam(user: AppUser | null): TeamId | null {
     if (!user) return null;
     if (seesAllTeams(user)) return null;
     return user.teamId;
   }

   /* ═══════════════════════════════════════════════════════════════
      هل يستطيع الموافقة على هذه المرحلة؟
      — شرط: الدور يطابق requiredRole + الفريق يطابق requiredTeamId
      ═══════════════════════════════════════════════════════════════ */

   export function canApproveStep(user: AppUser | null, step: ApprovalStep): boolean {
     if (!user) return false;
     if (step.status !== 'PENDING') return false;

     // Admin يتخطى الكل
     if (isAdmin(user)) return true;

     // يطابق الدور؟
     if (user.role !== step.requiredRole) return false;

     // إذا كانت المرحلة مقيّدة بفريق:
     if (step.requiredTeamId !== null) {
       return user.teamId === step.requiredTeamId;
     }

     // مرحلة Head HR أو HEAD — أي شخص بالدور المطابق
     return true;
   }

   /* ═══════════════════════════════════════════════════════════════
      هل يستطيع الموافقة على هذه المرحلة من خلال الطلب؟
      ═══════════════════════════════════════════════════════════════ */

   export function canApproveRequest(
     user: AppUser | null,
     request: RequestRecord,
     steps: ApprovalStep[],
   ): boolean {
     if (!user) return false;

     const currentStep = steps.find(
       (s) => s.status === 'PENDING' && s.order === request.currentStepOrder,
     );

     if (!currentStep) return false;
     return canApproveStep(user, currentStep);
   }

   /* ═══════════════════════════════════════════════════════════════
      هل يمكنه إرسال إشعار جماعي؟
      ═══════════════════════════════════════════════════════════════ */

   export function canSendNotifications(user: AppUser | null): boolean {
     if (!user) return false;
     return ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(user.role);
   }

   /* ═══════════════════════════════════════════════════════════════
      هل يمكنه إدارة الأعضاء والطلبات؟
      ═══════════════════════════════════════════════════════════════ */

   export function canManageMembers(user: AppUser | null): boolean {
     return isAdmin(user);
   }

   export function canManageConversations(user: AppUser | null): boolean {
     return isAdmin(user);
   }

   /* ═══════════════════════════════════════════════════════════════
      تصنيف الأعضاء المرئيين للمستخدم
      ═══════════════════════════════════════════════════════════════ */

   export function canSeeMember(user: AppUser | null, member: { teamIds: TeamId[] }): boolean {
     if (!user) return false;
     if (seesAllTeams(user)) return true;
     if (user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT' || user.role === 'HR') {
       return user.teamId !== null && member.teamIds.includes(user.teamId);
     }
     // الأعضاء العاديون يرون الجميع
     return true;
   }

   /* ═══════════════════════════════════════════════════════════════
      التسميات العربية
      ═══════════════════════════════════════════════════════════════ */

   export const ROLE_LABEL: Record<RoleId, string> = {
     HEAD: 'رئيس الفروع',
     VICE: 'نائب رئيس الفروع',
     HEAD_HR: 'رئيس الموارد البشرية',
     PRESIDENT: 'رئيس فريق',
     VICE_PRESIDENT: 'نائب رئيس فريق',
     HR: 'موارد بشرية',
     MEMBER: 'عضو',
     VIEWER: 'زائر',
   };
   