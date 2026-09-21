import type { AuditRecord } from '@/types';

 export const audit: AuditRecord[] = [
   {
     id: 'AUD001',
     actorUid: 'seed-u-001',
     actorName: 'ياسين عبد الرحمن',
     action: 'CREATE_REQUEST',
     entity: 'Request',
     entityId: 'REQ001',
     date: '2026-05-01T09:00:00.000Z',
     description: 'إنشاء طلب نقل',
   },
   {
     id: 'AUD002',
     actorUid: 'seed-u-003',
     actorName: 'سلمى عادل',
     action: 'APPROVE_STEP',
     entity: 'Approval',
     entityId: 'APR009',
     date: '2026-03-15T10:00:00.000Z',
     description: 'موافقة على طلب استقالة',
   },
 ];
 