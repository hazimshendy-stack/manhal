// src/lib/push.ts
// Browser push notifications via the Notification API + service worker.
// This is the client side of push; a server (FCM / Web Push) must deliver
// remote pushes to the service worker. Here we expose local push helpers
// used by the in-app notification layer.

export type PushPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPushPermission(): PushPermission {
  if (!pushSupported()) return 'unsupported';
  return Notification.permission as PushPermission;
}

export async function requestPushPermission(): Promise<PushPermission> {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const res = await Notification.requestPermission();
    return res as PushPermission;
  } catch {
    return 'default';
  }
}

export interface PushPayload {
  title: string;
  body: string;
  route?: string;
  tag?: string;
  priority?: 'low' | 'normal' | 'high';
}

export async function sendBrowserNotification(payload: PushPayload): Promise<boolean> {
  if (!pushSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  try {
    const opts: NotificationOptions = {
      body: payload.body,
      tag: payload.tag,
      data: { route: payload.route },
    };
    // Prefer service worker showNotification so clicks can be handled by SW.
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(payload.title, opts);
        return true;
      }
    }
    // Fallback to local Notification.
    const n = new Notification(payload.title, opts);
    if (payload.route) {
      n.onclick = () => {
        try { window.focus(); window.location.href = payload.route as string; } catch { /* ignore */ }
      };
    }
    return true;
  } catch {
    return false;
  }
}
