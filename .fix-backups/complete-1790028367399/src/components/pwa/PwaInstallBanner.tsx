import { useEffect, useState } from 'react';
import { canInstallPwa, promptInstall, isStandalone, isIos } from '@/lib/pwa';
import { toast } from '@/components/ui/Toast';

const DISMISSED_KEY = 'sbapiaryy-pwa-dismissed-v2';
const SHOW_AFTER_MS = 8000;

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

    const t = setTimeout(check, SHOW_AFTER_MS);
    const handler = () => { setVisible(true); setIosMode(false); };
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
      toast.info('للتثبيت على iPhone', 'اضغط زر المشاركة ← Add to Home Screen');
      return;
    }
    const result = await promptInstall();
    if (result === 'accepted') {
      toast.success('تم التثبيت', 'افتح التطبيق من الشاشة الرئيسية');
      setVisible(false);
    } else if (result === 'dismissed') {
      dismiss();
    } else {
      toast.info('التثبيت غير متاح', 'استخدم قائمة المتصفح ← Install app');
    }
  };

  if (!visible) return null;

  return (
    <div className="pwa-install-banner no-print" role="dialog" aria-label="تثبيت التطبيق">
      <div className="pwa-install-banner__body">
        <div className="pwa-install-banner__title">ثبّت sbapiaryy على هاتفك</div>
        <div className="pwa-install-banner__desc">
          {iosMode
            ? 'من Safari: اضغط Share ← Add to Home Screen'
            : 'تجربة أسرع، إشعارات، وبدون شريط المتصفح'}
        </div>
      </div>
      <div className="pwa-install-banner__actions">
        <button type="button" className="btn btn--ghost btn--xs" onClick={dismiss}>لاحقًا</button>
        <button type="button" className="btn btn--primary btn--xs" onClick={install}>تثبيت</button>
      </div>
    </div>
  );
}
