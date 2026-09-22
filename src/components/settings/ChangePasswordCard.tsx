// src/components/settings/ChangePasswordCard.tsx
import { useState, type FormEvent } from 'react';
import { changePassword, translatePasswordError } from '@/lib/authExtras';
import { toast } from '@/components/ui/Toast';

export function ChangePasswordCard() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!current || !next || !confirm) { toast.error('All fields are required'); return; }
    if (next !== confirm) { toast.error('New password and confirmation do not match'); return; }
    if (next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setBusy(true);
    try {
      await changePassword(current, next);
      toast.success('Password changed');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      toast.error(translatePasswordError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card no-click" onSubmit={onSubmit}>
      <div className="card__title">Change Password</div>
      <div className="card__meta">Update the password for your account.</div>
      <div className="mt-4">
        <label className="login-label">Current Password</label>
        <input className="input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" dir="ltr" />
      </div>
      <div className="mt-3">
        <label className="login-label">New Password</label>
        <input className="input" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" dir="ltr" />
      </div>
      <div className="mt-3">
        <label className="login-label">Confirm New Password</label>
        <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" dir="ltr" />
      </div>
      <button type="submit" className="btn btn--primary btn--block mt-5" disabled={busy}>
        {busy ? '...' : 'Change Password'}
      </button>
    </form>
  );
}
