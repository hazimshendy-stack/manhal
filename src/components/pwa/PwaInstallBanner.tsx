import { useEffect, useState } from 'react';
   import {
     canInstallPwa,
     promptInstall,
     isStandalone,
     isIos,
   } from '@/lib/pwa';
   import { toast } from '@/components/ui/Toast';

   const DISMISSED_KEY = 'sbapiaryy-pwa-dismissed';

   export function PwaInstallBanner() {
     const [visible, setVisible] = useState(false);
     const [iosMode, setIosMode] = useState(false);

     useEffect(() => {
       if (isStandalone()) return;
       if (localStorage.getItem(DISMISSED_KEY) === 'yes') return;

       const check = () => {
         if (canInstallPwa()) {
           setVisible(true);
           setIosMode(false);
         } else if (isIos()) {
           setVisible(true);
           setIosMode(true);
         }
       };

       check();
       const t = setTimeout(check, 2000);

       const handler = () => {
         setVisible(true);
         setIosMode(false);
       };
       window.addEventListener('pwa-install-available', handler);

       return () => {
         clearTimeout(t);
         window.removeEventListener('pwa-install-available', handler);
       };
     }, []);

     const dismiss = () => {
       setVisible(false);
       localStorage.setItem(DISMISSED_KEY, 'yes');
     };

     const install = async () => {
       if (iosMode) {
         toast.info(
           'للتثبيت على iPhone',
           'اضغط زر المشاركة ← Add to Home Screen',
         );
         return;
       }
       const result = await promptInstall();
       if (result === 'accepted') {
         toast.success('تم التثبيت', 'افتح التطبيق من الشاشة الرئيسية');
         setVisible(false);
       } else if (result === 'dismissed') {
         dismiss();
       } else {
         toast.info(
           'التثبيت غير متاح',
           'استخدم قائمة المتصفح ← Install app',
         );
       }
     };

     if (!visible) return null;

     return (
       <div className="pwa-install-banner no-print">
         <div className="pwa-install-banner__icon">S</div>
         <div className="pwa-install-banner__body">
           <div className="pwa-install-banner__title">
             ثبّت sbapiaryy كتطبيق
           </div>
           <div className="pwa-install-banner__desc">
             {iosMode ? 'من Safari: اضغط Share ← Add to Home Screen' : 'وصول أسرع من شاشة هاتفك'}
           </div>
         </div>
         <div className="pwa-install-banner__actions">
           <button
             type="button"
             className="btn btn--ghost btn--xs"
             onClick={dismiss}
           >
             لاحقًا
           </button>
           <button
             type="button"
             className="btn btn--primary btn--xs"
             onClick={install}
           >
             تثبيت
           </button>
         </div>
       </div>
     );
   }
   