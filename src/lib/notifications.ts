import { createOne, newId, now } from './db';
   import type { Notification, NotificationType, AppUser } from '@/types';

   export async function notifyUser(
     userId: string,
     title: string,
     message: string,
     type: NotificationType,
     route?: string,
     priority: 'low' | 'normal' | 'high' = 'normal',
     fromName?: string,
   ): Promise<void> {
     if (!userId) return;

     const notif: Notification = {
       id: newId('N'),
       userId,
       title,
       message,
       type,
       date: now(),
       read: false,
       route,
       priority,
       fromName,
     };

     try {
       await createOne('notifications', notif);
     } catch {
       // silent
     }
   }

   export async function notifyUsers(
     users: AppUser[],
     title: string,
     message: string,
     type: NotificationType,
     route?: string,
     priority: 'low' | 'normal' | 'high' = 'normal',
     fromName?: string,
   ): Promise<void> {
     for (const u of users) {
       await notifyUser(u.uid, title, message, type, route, priority, fromName);
     }
   }

   /* ═══════════════════════════════════════════════════════════════
      إشعارات الأحداث الإدارية — تُرسل لذوي المناصب فقط
      ═══════════════════════════════════════════════════════════════ */

   export async function notifyManagers(
     allUsers: AppUser[],
     title: string,
     message: string,
     type: NotificationType,
     route?: string,
     priority: 'low' | 'normal' | 'high' = 'normal',
     fromName?: string,
   ): Promise<void> {
     const managers = allUsers.filter((u) =>
       ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(u.role),
     );
     await notifyUsers(managers, title, message, type, route, priority, fromName);
   }

   export async function notifyTeamManagers(
     allUsers: AppUser[],
     teamId: string,
     title: string,
     message: string,
     type: NotificationType,
     route?: string,
     priority: 'low' | 'normal' | 'high' = 'normal',
     fromName?: string,
   ): Promise<void> {
     const targets = allUsers.filter(
       (u) =>
         (u.role === 'PRESIDENT' || u.role === 'VICE_PRESIDENT' || u.role === 'HR') &&
         u.teamId === teamId,
     );
     await notifyUsers(targets, title, message, type, route, priority, fromName);
   }
   