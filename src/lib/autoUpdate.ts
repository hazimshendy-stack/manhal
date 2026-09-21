/* ═══════════════════════════════════════════════════════════════
   Auto-Update System
   - Registers Service Worker
   - Checks for updates every 60s
   - Auto-reloads when new version detected
   - Also checks: on tab focus, on network restore
   ═══════════════════════════════════════════════════════════════ */

import { toast } from '@/components/ui/Toast';

const CHECK_INTERVAL_MS = 60_000;
const VERSION_URL = './version.json';
const LOCAL_VERSION_KEY = 'sbapiaryy-local-version';

let currentBuildId: string | null = null;
let registration: ServiceWorkerRegistration | null = null;
let updateTimer: ReturnType<typeof setInterval> | null = null;

async function fetchServerVersion(): Promise<string | null> {
  try {
    const res = await fetch(VERSION_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.buildId ?? null;
  } catch {
    return null;
  }
}

async function forceReload(newBuildId: string) {
  console.log('[AutoUpdate] New build:', newBuildId);

  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
  if (registration?.active) {
    registration.active.postMessage({ type: 'CLEAR_CACHE' });
  }

  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch { /* ignore */ }
  }

  localStorage.setItem(LOCAL_VERSION_KEY, newBuildId);
  toast.success('Update available', 'Reloading...');
  setTimeout(() => window.location.reload(), 1000);
}

async function checkForUpdates() {
  const serverBuild = await fetchServerVersion();
  if (!serverBuild) return;

  if (!currentBuildId) {
    currentBuildId = serverBuild;
    localStorage.setItem(LOCAL_VERSION_KEY, serverBuild);
    return;
  }

  if (serverBuild !== currentBuildId) {
    const localBuild = localStorage.getItem(LOCAL_VERSION_KEY);
    if (localBuild !== serverBuild) {
      currentBuildId = serverBuild;
      await forceReload(serverBuild);
    }
  }

  if (registration) {
    try { await registration.update(); } catch { /* ignore */ }
  }
}

async function registerSW(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    registration = await navigator.serviceWorker.register('./sw.js', {
      scope: './',
      updateViaCache: 'none',
    });

    registration.addEventListener('updatefound', () => {
      const newWorker = registration?.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          newWorker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  } catch (err) {
    console.warn('[AutoUpdate] SW registration failed:', err);
  }
}

export async function initAutoUpdate(): Promise<void> {
  if (import.meta.env.DEV) return;

  console.log('[AutoUpdate] Starting...');

  const serverBuild = await fetchServerVersion();
  if (serverBuild) {
    currentBuildId = serverBuild;
    localStorage.setItem(LOCAL_VERSION_KEY, serverBuild);
  }

  await registerSW();

  if (updateTimer) clearInterval(updateTimer);
  updateTimer = setInterval(checkForUpdates, CHECK_INTERVAL_MS);

  setTimeout(checkForUpdates, 5_000);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkForUpdates();
  });

  window.addEventListener('online', checkForUpdates);
}

export function stopAutoUpdate(): void {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
}
