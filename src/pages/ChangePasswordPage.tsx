import { useState, type FormEvent } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { changePassword, logout } from '@/lib/auth';
   import { toast } from '@/components/ui/Toast';
   import { Loading } from '@/components/ui/Loading';

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
       if (newPassword.length < 6) { toast.error('Password too weak'); return; }
       if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
       setBusy(true);
       try { await changePassword(newPassword); toast.success('Password updated'); nav('/dashboard'); }
       catch (err) { toast.error('Failed', err instanceof Error ? err.message : ''); }
       finally { setBusy(false); }
     };
     const handleLogout = async () => { await logout(); nav('/login'); };
     return (
       <div className="login-page">
         <div className="login-card">
           <p style={{ marginBottom: 20 }}>Welcome, {user.displayName}. Please set a new password.</p>
           <form onSubmit={onSubmit}>
             <div className="login-field"><label className="login-label">New Password</label><input className="login-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required dir="ltr" /></div>
             <div className="login-field"><label className="login-label">Confirm Password</label><input className="login-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required dir="ltr" /></div>
             <button type="submit" className="login-submit" disabled={busy}>{busy ? '...' : 'Save Password'}</button>
           </form>
           <p style={{ textAlign: 'center', marginTop: 20 }}><button type="button" onClick={handleLogout} style={{ color: 'var(--c-ink-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button></p>
         </div>
       </div>
     );
   }
   