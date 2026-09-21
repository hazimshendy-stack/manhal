/**
 * Auto-Update System
 * - يسجّل Service Worker
 * - يفحص التحديثات كل 60 ثانية
 * - يعمل reload لما يلاقي نسخة جديدة
 * - يعرض toast للمستخدم
 */

import { toast } from '@/components/ui/Toast';

const CHECK_INTERVAL_MS = 60_000; // 60 ثانية
const VERSION_URL = './version.json';
const LOCAL_VERSION_KEY = 'sbapiaryy-local-version';

let currentBuildId: string | null = null;
let registration: ServiceWorkerRegistration | null = null;
let updateTimer: ReturnType<typeof setInterval> | null = null;

/* ─── جيب النسخة الحالية من السيرفر ─── */
async function fetchServerVersion(): Promise<string | null> {
  try {
    const res = await fetch(VERSION_URL + '?t=' + Date.now(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.buildId ?? null;
  } catch {
    return null;
  }
}

/* ─── امسح كل الكاشات + reload ─── */
async function forceReload(newBuildId: string) {
  console.log('[AutoUpdate] New build detected:', newBuildId);

  // بلّغ الـ SW
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
  if (registration?.active) {
    registration.active.postMessage({ type: 'CLEAR_CACHE' });
  }

  // امسح كل الكاشات يدويًا كـ backup
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch { /* ignore */ }
  }

  // احفظ النسخة الجديدة
  localStorage.setItem(LOCAL_VERSION_KEY, newBuildId);

  // toast سريع
  toast.success('Update available', 'Reloading...');

  // reload بعد ثانية
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

/* ─── فحص التحديثات ─── */
async function checkForUpdates() {
  // 1) فحص version.json
  const serverBuild = await fetchServerVersion();
  if (!serverBuild) return;

  if (!currentBuildId) {
    currentBuildId = serverBuild;
    localStorage.setItem(LOCAL_VERSION_KEY, serverBuild);
    return;
  }

  if (serverBuild !== currentBuildId) {
    const localBuild = localStorage.getItem(LOCAL_VERSION_KEY);
    // لو النسخة المحلية أقدم من النسخة على السيرفر
    if (localBuild !== serverBuild) {
      currentBuildId = serverBuild;
      await forceReload(serverBuild);
    }
  }

  // 2) فحص Service Worker update
  if (registration) {
    try {
      await registration.update();
    } catch { /* ignore */ }
  }
}

/* ─── تسجيل Service Worker ─── */
async function registerSW(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    registration = await navigator.serviceWorker.register('./sw.js', {
      scope: './',
      updateViaCache: 'none', // مهم: ممنوع caching لملف SW
    });

    // لما SW جديد يبقى جاهز
    registration.addEventListener('updatefound', () => {
      const newWorker = registration?.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          console.log('[AutoUpdate] SW update ready');
          newWorker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });

    // لما الـ controller يتغير → reload تلقائي
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      console.log('[AutoUpdate] Controller changed — reloading');
      window.location.reload();
    });
  } catch (err) {
    console.warn('[AutoUpdate] SW registration failed:', err);
  }
}

/* ─── ابدأ النظام ─── */
export async function initAutoUpdate(): Promise<void> {
  if (import.meta.env.DEV) {
    console.log('[AutoUpdate] Disabled in dev mode');
    return;
  }

  console.log('[AutoUpdate] Starting...');

  // 1) جيب النسخة الحالية من السيرفر
  const serverBuild = await fetchServerVersion();
  if (serverBuild) {
    currentBuildId = serverBuild;
    localStorage.setItem(LOCAL_VERSION_KEY, serverBuild);
  }

  // 2) سجّل Service Worker
  await registerSW();

  // 3) ابدأ الفحص الدوري
  if (updateTimer) clearInterval(updateTimer);
  updateTimer = setInterval(checkForUpdates, CHECK_INTERVAL_MS);

  // 4) فحص فوري بعد 5 ثواني
  setTimeout(checkForUpdates, 5_000);

  // 5) لما المستخدم يرجع للتاب → فحص فوري
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkForUpdates();
    }
  });

  // 6) فحص لما النت يرجع
  window.addEventListener('online', checkForUpdates);
}

/* ─── إيقاف النظام (للاختبار) ─── */
export function stopAutoUpdate(): void {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
}
