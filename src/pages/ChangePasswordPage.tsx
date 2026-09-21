

export function ChangePasswordPage() {
  const nav = useNavigate();
  const { user, loading, mustChangePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading) return <Loading fullHeight />;
  if (!user) { nav('/login'); return null; }
  if (!mustChangePassword) { nav('/dashboard'); return null; }
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password too weak', 'Must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setBusy(true);
    try { await changePassword(newPassword); toast.success('Password updated'); nav('/dashboard'); }
    catch (err) { toast.error('Failed to update', err instanceof Error ? err.message : ''); }
    finally { setBusy(false); }
  };
  const handleLogout = async () => { await logout(); nav('/login'); };
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="change-password-notice">
          <strong>Welcome, {user.displayName}</strong>
          Your account is new. You must set a new password to continue.
        </div>
        <form onSubmit={onSubmit}>
          <div className="login-field">
            <label className="login-label">New Password</label>
            <input className="login-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" required dir="ltr" />
          </div>
          <div className="login-field">
            <label className="login-label">Confirm Password</label>
            <input className="login-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="........" autoComplete="new-password" required dir="ltr" />
          </div>
          <button type="submit" className="login-submit" disabled={busy || !newPassword || !confirmPassword}>{busy ? '...' : 'Save Password & Continue'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <button type="button" onClick={handleLogout} style={{ color: 'var(--c-ink-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
        </p>
      </div>
    </div>
  );
}