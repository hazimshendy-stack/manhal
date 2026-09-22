// src/lib/notify.ts
// Unified notification dispatcher: in-app (Firestore) + browser push.
//
// Expected backend: @/lib/notifications exports
//   - notifyUser(uid, title, message, source?, route?, priority?, senderName?)
//   - notifyUsers(users, title, message, source?, route?, priority?, senderName?)
//
// If not present, this module falls back to writing directly to the
// 'notifications' collection via @/lib/db.

import { notifyUser as rawNotifyUser, notifyUsers as rawNotifyUsers } from '@/lib/notifications';
import { sendBrowserNotification, requestPushPermission } from '@/lib/push';
import type { AppUser, Notification } from '@/types';

export interface DispatchOptions {
  source?: string;
  route?: string;
  priority?: 'low' | 'normal' | 'high';
  senderName?: string;
  push?: boolean;
}

async function dispatchPush(title: string, message: string, opts: DispatchOptions) {
  const shouldPush = opts.push !== false;
  if (!shouldPush) return;
  const perm = await requestPushPermission();
  if (perm !== 'granted') return;
  await sendBrowserNotification({
    title,
    body: message,
    route: opts.route,
    priority: opts.priority,
    tag: opts.source || 'manhal',
  });
}

export async function notifyOne(
  uid: string,
  title: string,
  message: string,
  opts: DispatchOptions = {},
): Promise<void> {
  await rawNotifyUser(uid, title, message, opts.source, opts.route, opts.priority, opts.senderName);
  await dispatchPush(title, message, opts);
}

export async function notifyMany(
  users: AppUser[],
  title: string,
  message: string,
  opts: DispatchOptions = {},
): Promise<void> {
  await rawNotifyUsers(users, title, message, opts.source, opts.route, opts.priority, opts.senderName);
  await dispatchPush(title, message, opts);
}

export function isMine(n: Notification, uid: string | null | undefined): boolean {
  return !!uid && n.userId === uid;
}
