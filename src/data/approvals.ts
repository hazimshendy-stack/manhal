import type { ApprovalStep } from '@/types';

 export const approvals: ApprovalStep[] = [
   /* REQ001 — نقل إلى Heroes (Helpers → Heroes) */
   {
     id: 'APR001', requestId: 'REQ001', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'helpers',
     status: 'PENDING',
   },
   {
     id: 'APR002', requestId: 'REQ001', order: 2,
     requiredRole: 'PRESIDENT', requiredTeamId: 'heroes',
     status: 'PENDING',
   },
   {
     id: 'APR003', requestId: 'REQ001', order: 3,
     requiredRole: 'HEAD_HR', requiredTeamId: null,
     status: 'PENDING',
   },
   {
     id: 'APR004', requestId: 'REQ001', order: 4,
     requiredRole: 'HEAD', requiredTeamId: null,
     status: 'PENDING',
   },

   /* REQ002 — ترقية فريدة */
   {
     id: 'APR005', requestId: 'REQ002', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'coders',
     approverUid: 'seed-u-002', approverName: 'ملك هشام',
     status: 'APPROVED', comment: 'أداء ممتاز هذا الموسم.', actionDate: '2026-04-22',
   },
   {
     id: 'APR006', requestId: 'REQ002', order: 2,
     requiredRole: 'HEAD_HR', requiredTeamId: null,
     status: 'PENDING',
   },
   {
     id: 'APR007', requestId: 'REQ002', order: 3,
     requiredRole: 'HEAD', requiredTeamId: null,
     status: 'PENDING',
   },

   /* REQ003 — استقالة منة (Approved) */
   {
     id: 'APR008', requestId: 'REQ003', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'messages',
     approverUid: 'seed-u-006', approverName: 'هنا مصطفى',
     status: 'APPROVED', comment: 'نأسف لرحيلك.', actionDate: '2026-03-12',
   },
   {
     id: 'APR009', requestId: 'REQ003', order: 2,
     requiredRole: 'HEAD_HR', requiredTeamId: null,
     approverUid: 'seed-u-003', approverName: 'سلمى عادل',
     status: 'APPROVED', comment: 'تم تسوية المستحقات.', actionDate: '2026-03-15',
   },
   {
     id: 'APR010', requestId: 'REQ003', order: 3,
     requiredRole: 'HEAD', requiredTeamId: null,
     approverUid: 'seed-u-001', approverName: 'ياسين عبد الرحمن',
     status: 'APPROVED', comment: 'بالتوفيق.', actionDate: '2026-03-18',
   },

   /* REQ004 — شكوى */
   {
     id: 'APR011', requestId: 'REQ004', order: 1,
     requiredRole: 'HEAD_HR', requiredTeamId: null,
     status: 'PENDING',
   },
   {
     id: 'APR012', requestId: 'REQ004', order: 2,
     requiredRole: 'VICE', requiredTeamId: null,
     status: 'PENDING',
   },

   /* REQ005 — اقتراح */
   {
     id: 'APR013', requestId: 'REQ005', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'messages',
     approverUid: 'seed-u-006', approverName: 'هنا مصطفى',
     status: 'APPROVED', comment: 'فكرة رائعة.', actionDate: '2026-02-10',
   },
   {
     id: 'APR014', requestId: 'REQ005', order: 2,
     requiredRole: 'HEAD', requiredTeamId: null,
     approverUid: 'seed-u-001', approverName: 'ياسين عبد الرحمن',
     status: 'APPROVED', comment: 'معتمد.', actionDate: '2026-02-15',
   },

   /* REQ006 — نقل مرفوض */
   {
     id: 'APR015', requestId: 'REQ006', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'coders',
     approverUid: 'seed-u-002', approverName: 'ملك هشام',
     status: 'REJECTED', comment: 'نحتاجك في الفريق هذا الموسم.', actionDate: '2026-01-15',
   },
   {
     id: 'APR016', requestId: 'REQ006', order: 2,
     requiredRole: 'HEAD', requiredTeamId: null,
     status: 'SKIPPED',
   },

   /* REQ007 — إجازة */
   {
     id: 'APR017', requestId: 'REQ007', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'masar',
     approverUid: 'seed-u-007', approverName: 'علي جمال',
     status: 'APPROVED', comment: 'بالتوفيق في دراستك.', actionDate: '2026-04-02',
   },
   {
     id: 'APR018', requestId: 'REQ007', order: 2,
     requiredRole: 'HEAD_HR', requiredTeamId: null,
     approverUid: 'seed-u-003', approverName: 'سلمى عادل',
     status: 'APPROVED', comment: 'مسجّل.', actionDate: '2026-04-03',
   },
 ];
 