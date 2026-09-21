

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
    return () => { clearTimeout(t); window.removeEventListener('pwa-install-available', handler); };
  }, []);
  const dismiss = () => { setVisible(false); localStorage.setItem(DISMISSED_KEY, 'yes'); };
  const install = async () => {
    if (iosMode) { toast.info('To install on iPhone', 'Tap Share → Add to Home Screen'); return; }
    const result = await promptInstall();
    if (result === 'accepted') { toast.success('Installed', 'Open the app from your home screen'); setVisible(false); }
    else if (result === 'dismissed') dismiss();
    else toast.info('Install unavailable', 'Use browser menu → Install app');
  };
  if (!visible) return null;
  return (
    <div className="pwa-install-banner no-print" role="dialog" aria-label="Install app">
      <div className="pwa-install-banner__body">
        <div className="pwa-install-banner__title">Install sbapiaryy</div>
        <div className="pwa-install-banner__desc">{iosMode ? 'From Safari: tap Share → Add to Home Screen' : 'Faster access and notifications, no browser bar'}</div>
      </div>
      <div className="pwa-install-banner__actions">
        <button type="button" className="btn btn--ghost btn--xs" onClick={dismiss}>Later</button>
        <button type="button" className="btn btn--primary btn--xs" onClick={install}>Install</button>
      </div>
    </div>
  );
}