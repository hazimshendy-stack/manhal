import { createOne, newId, now } from './db';
   import type { AuditRecord, AppUser } from '@/types';

   export async function logAudit(
     user: AppUser | null,
     action: string,
     entity: string,
     entityId: string,
     description: string,
   ): Promise<void> {
     const record: AuditRecord = {
       id: newId('AUD'),
       actorUid: user?.uid ?? 'system',
       actorName: user?.displayName ?? 'النظام',
       action,
       entity,
       entityId,
       date: now(),
       description,
     };
     try {
       await createOne('audit', record);
     } catch {
       // silent
     }
   }
   