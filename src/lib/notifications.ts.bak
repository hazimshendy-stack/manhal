import { createOne, newId, now } from './db';
   import { safeArray } from './safe';
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
     try { await createOne('notifications', notif); } catch { /* ignore */ }
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
     for (const u of safeArray(users)) {
       await notifyUser(u.uid, title, message, type, route, priority, fromName);
     }
   }

   export async function notifyManagers(
     allUsers: AppUser[],
     title: string,
     message: string,
     type: NotificationType,
     route?: string,
     priority: 'low' | 'normal' | 'high' = 'normal',
     fromName?: string,
   ): Promise<void> {
     const managers = safeArray(allUsers).filter((u) =>
       ['HEAD', 'VICE', 'HEAD_HR_GLOBAL', 'PRESIDENT', 'VICE_PRESIDENT', 'HEAD_HR_TEAM', 'HR', 'COMMITTEE_HR'].includes(u.role),
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
     const targets = safeArray(allUsers).filter(
       (u) => (u.role === 'PRESIDENT' || u.role === 'VICE_PRESIDENT' || u.role === 'HR' || u.role === 'HEAD_HR_TEAM') && u.teamId === teamId,
     );
     await notifyUsers(targets, title, message, type, route, priority, fromName);
   }
   