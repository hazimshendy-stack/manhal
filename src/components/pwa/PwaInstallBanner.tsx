import { useEffect, useState } from 'react';
   import { canInstallPwa, promptInstall, isStandalone, isIos } from '@/lib/pwa';
   import { toast } from '@/components/ui/Toast';
import { toast } from '@/components/ui/Toast';
import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';
import { canInstallPwa } from '@/lib/pwa';
import { promptInstall } from '@/lib/pwa';
import { isStandalone } from '@/lib/pwa';
import { isIos } from '@/lib/pwa';

   const DISMISSED_KEY = 'sbapiaryy-pwa-dismissed-v6';
   export function PwaInstallBanner() {
     const [visible, setVisible] = useState(false);
     const [iosMode, setIosMode] = useState(false);
     useEffect(() => {
       if (isStandalone()) return;
       if (localStorage.getItem(DISMISSED_KEY) === 'yes') return;
       const check = () => {
         if (canInstallPwa()) { setVisible(true); setIosMode(false); }
         else if (isIos()) { setVisible(true); setIosMode(true); }
       };
       const t = setTimeout(check, 8000);
       const handler = () => { setVisible(true); setIosMode(false); };
       window.addEventListener('pwa-install-available', handler);
       return () => { clearTimeout(t); window.removeEventListener('pwa-install-available', handler); };
     }, []);
     const dismiss = () => { setVisible(false); localStorage.setItem(DISMISSED_KEY, 'yes'); };
     const install = async () => {
       if (iosMode) { toast.info('To install on iPhone', 'Tap Share → Add to Home Screen'); return; }
       const result = await promptInstall();
       if (result === 'accepted') { toast.success('Installed'); setVisible(false); }
       else if (result === 'dismissed') dismiss();
       else toast.info('Install unavailable');
     };
     if (!visible) return null;
     return (
       <div className="pwa-install-banner no-print" role="dialog">
         <div className="pwa-install-banner__body">
           <div className="pwa-install-banner__title">Install sbapiaryy</div>
           <div className="pwa-install-banner__desc">{iosMode ? 'From Safari: tap Share → Add to Home Screen' : 'Faster access, no browser bar'}</div>
         </div>
         <div className="pwa-install-banner__actions">
           <button type="button" className="btn btn--ghost btn--xs" onClick={dismiss}>Later</button>
           <button type="button" className="btn btn--primary btn--xs" onClick={install}>Install</button>
         </div>
       </div>
     );
   }
   