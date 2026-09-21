export interface BeforeInstallPromptEvent extends Event {
     prompt: () => Promise<void>;
     userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
   }

   let deferredPrompt: BeforeInstallPromptEvent | null = null;

   export function initPwa(): void {
     if (typeof window === 'undefined') return;

     window.addEventListener('beforeinstallprompt', (e) => {
       e.preventDefault();
       deferredPrompt = e as BeforeInstallPromptEvent;
       window.dispatchEvent(new CustomEvent('pwa-install-available'));
     });

     window.addEventListener('appinstalled', () => {
       deferredPrompt = null;
       window.dispatchEvent(new CustomEvent('pwa-installed'));
     });

     if ('serviceWorker' in navigator && import.meta.env.PROD) {
       window.addEventListener('load', () => {
         navigator.serviceWorker.register('./sw.js').catch(() => {
           // ignore
         });
       });
     }
   }

   export function canInstallPwa(): boolean {
     return deferredPrompt !== null;
   }

   export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
     if (!deferredPrompt) return 'unavailable';
     try {
       await deferredPrompt.prompt();
       const choice = await deferredPrompt.userChoice;
       if (choice.outcome === 'accepted') {
         deferredPrompt = null;
       }
       return choice.outcome;
     } catch {
       return 'unavailable';
     }
   }

   export function isStandalone(): boolean {
     if (typeof window === 'undefined') return false;
     return (
       window.matchMedia('(display-mode: standalone)').matches ||
       (window.navigator as Navigator & { standalone?: boolean }).standalone === true
     );
   }

   export function isIos(): boolean {
     if (typeof window === 'undefined') return false;
     return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
   }

   export function isAndroid(): boolean {
     if (typeof window === 'undefined') return false;
     return /Android/.test(navigator.userAgent);
   }
   