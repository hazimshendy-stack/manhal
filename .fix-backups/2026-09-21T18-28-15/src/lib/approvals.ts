import { updateOne, createOne, newId, today, listWhere } from './db';
   import { notifyUser } from './notifications';
   import { logAudit } from './audit';
   import type { ApprovalStep, RequestRecord, AppUser, RoleId, TeamId } from '@/types';

   /* ═══════════════════════════════════════════════════════════════
      سلسلة الموافقات الصحيحة
      ═══════════════════════════════════════════════════════════════ */

   export interface ApprovalChainStep {
     role: RoleId;
     teamId: TeamId | null;
   }

   export function buildApprovalChain(request: RequestRecord): ApprovalChainStep[] {
     const chain: ApprovalChainStep[] = [];

     if (request.type === 'TRANSFER' && request.fromTeamId && request.toTeamId) {
       // نقل: رئيس الفريق الحالي → رئيس الفريق الجديد → Head HR → HEAD
       chain.push({ role: 'PRESIDENT', teamId: request.fromTeamId });
       chain.push({ role: 'PRESIDENT', teamId: request.toTeamId });
       chain.push({ role: 'HEAD_HR', teamId: null });
       chain.push({ role: 'HEAD', teamId: null });
     } else if (request.type === 'PROMOTION') {
       // ترقية: رئيس الفريق → HR الفريق → Head HR → HEAD
       const teamId = request.fromTeamId ?? request.toTeamId ?? null;
       if (teamId) {
         chain.push({ role: 'PRESIDENT', teamId });
         chain.push({ role: 'HR', teamId });
       }
       chain.push({ role: 'HEAD_HR', teamId: null });
       chain.push({ role: 'HEAD', teamId: null });
     } else if (request.type === 'RESIGNATION') {
       // استقالة: رئيس الفريق → HR الفريق → HEAD
       const teamId = request.fromTeamId ?? request.toTeamId ?? null;
       if (teamId) {
         chain.push({ role: 'PRESIDENT', teamId });
         chain.push({ role: 'HR', teamId });
       }
       chain.push({ role: 'HEAD', teamId: null });
     } else if (request.type === 'COMPLAINT') {
       // شكوى: Head HR → VICE
       chain.push({ role: 'HEAD_HR', teamId: null });
       chain.push({ role: 'VICE', teamId: null });
     } else if (request.type === 'SUGGESTION') {
       // اقتراح: رئيس الفريق → HEAD
       const teamId = request.fromTeamId ?? request.toTeamId ?? null;
       if (teamId) chain.push({ role: 'PRESIDENT', teamId });
       chain.push({ role: 'HEAD', teamId: null });
     } else if (request.type === 'LEAVE') {
       // إجازة: رئيس الفريق → HR الفريق
       const teamId = request.fromTeamId ?? request.toTeamId ?? null;
       if (teamId) {
         chain.push({ role: 'PRESIDENT', teamId });
         chain.push({ role: 'HR', teamId });
       }
     } else {
       // default
       chain.push({ role: 'HEAD', teamId: null });
     }

     return chain;
   }

   /* ═══════════════════════════════════════════════════════════════
      إنشاء طلب مع سلسلة الموافقات
      ═══════════════════════════════════════════════════════════════ */

   export async function createRequestWithChain(request: RequestRecord): Promise<void> {
     await createOne('requests', request);

     const chain = buildApprovalChain(request);
     for (let i = 0; i < chain.length; i += 1) {
       const step: ApprovalStep = {
         id: newId('APR'),
         requestId: request.id,
         order: i + 1,
         requiredRole: chain[i].role,
         requiredTeamId: chain[i].teamId,
         status: 'PENDING',
       };
       await createOne('approvals', step);
     }
   }

   /* ═══════════════════════════════════════════════════════════════
      الموافقة على المرحلة الحالية
      ═══════════════════════════════════════════════════════════════ */

   export async function approveStep(
     request: RequestRecord,
     step: ApprovalStep,
     user: AppUser,
   ): Promise<void> {
     await updateOne('approvals', step.id, {
       status: 'APPROVED',
       approverUid: user.uid,
       approverName: user.displayName,
       actionDate: today(),
     });

     const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
     const sorted = allSteps.sort((a, b) => a.order - b.order);
     const remaining = sorted.filter((s) => s.status === 'PENDING' && s.id !== step.id);

     if (remaining.length === 0) {
       await updateOne('requests', request.id, {
         status: 'APPROVED',
         currentStepOrder: sorted.length,
         updatedAt: today(),
       });
       await notifyUser(
         request.requesterUid,
         'تمت الموافقة على طلبك',
         'طلبك "' + request.title + '" تمت الموافقة النهائية عليه.',
         'request',
         '/requests/' + request.id,
         'high',
       );
       await logAudit(user, 'APPROVE_REQUEST', 'Request', request.id, 'موافقة نهائية على الطلب');
     } else {
       const nextOrder = Math.min(...remaining.map((s) => s.order));
       await updateOne('requests', request.id, {
         status: 'IN_REVIEW',
         currentStepOrder: nextOrder,
         updatedAt: today(),
       });
       await notifyUser(
         request.requesterUid,
         'تقدّم طلبك',
         'طلبك "' + request.title + '" في المرحلة ' + nextOrder + '.',
         'approval',
         '/requests/' + request.id,
         'normal',
       );
       await logAudit(user, 'APPROVE_STEP', 'Approval', step.id, 'موافقة على المرحلة ' + step.order);
     }
   }

   /* ═══════════════════════════════════════════════════════════════
      الرفض
      ═══════════════════════════════════════════════════════════════ */

   export async function rejectStep(
     request: RequestRecord,
     step: ApprovalStep,
     user: AppUser,
     comment: string,
   ): Promise<void> {
     await updateOne('approvals', step.id, {
       status: 'REJECTED',
       approverUid: user.uid,
       approverName: user.displayName,
       comment: comment.trim() || undefined,
       actionDate: today(),
     });

     await updateOne('requests', request.id, {
       status: 'REJECTED',
       updatedAt: today(),
     });

     const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
     for (const s of allSteps) {
       if (s.order > step.order && s.status === 'PENDING') {
         await updateOne('approvals', s.id, { status: 'SKIPPED' });
       }
     }

     const reasonText = comment.trim() ? ' السبب: ' + comment : '';
     await notifyUser(
       request.requesterUid,
       'تم رفض طلبك',
       'طلبك "' + request.title + '" رُفض.' + reasonText,
       'request',
       '/requests/' + request.id,
       'high',
     );
     await logAudit(user, 'REJECT_REQUEST', 'Request', request.id, 'رفض الطلب');
   }
   