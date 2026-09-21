import { useState, type FormEvent } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { changePassword } from '@/lib/auth';
   import { logout } from '@/lib/auth';
   import { toast } from '@/components/ui/Toast';
   import { Loading } from '@/components/ui/Loading';

   export function ChangePasswordPage() {
     const nav = useNavigate();
     const { user, loading, mustChangePassword } = useAuth();
     const [newPassword, setNewPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [busy, setBusy] = useState(false);

     if (loading) return <Loading fullHeight />;

     if (!user) {
       nav('/login');
       return null;
     }

     if (!mustChangePassword) {
       nav('/dashboard');
       return null;
     }

     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();

       if (newPassword.length < 6) {
         toast.error('كلمة المرور ضعيفة', 'يجب أن تكون 6 أحرف على الأقل');
         return;
       }
       if (newPassword !== confirmPassword) {
         toast.error('كلمتا المرور غير متطابقتين');
         return;
       }

       setBusy(true);
       try {
         await changePassword(newPassword);
         toast.success('تم تحديث كلمة المرور');
         nav('/dashboard');
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل التحديث';
         toast.error('فشل التحديث', msg);
       } finally {
         setBusy(false);
       }
     };

     const handleLogout = async () => {
       await logout();
       nav('/login');
     };

     return (
       <div className="login-page">
         <div className="login-card">
           <div className="change-password-notice">
             <strong>مرحبًا {user.displayName} 👋</strong>
             حسابك جديد على المنصة. يجب تعيين كلمة مرور جديدة قبل المتابعة.
           </div>

           <form onSubmit={onSubmit}>
             <div className="login-field">
               <label className="login-label">كلمة المرور الجديدة</label>
               <input
                 className="login-input"
                 type="password"
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 placeholder="6 أحرف على الأقل"
                 autoComplete="new-password"
                 required
                 dir="ltr"
                 style={{ textAlign: 'left' }}
               />
             </div>

             <div className="login-field">
               <label className="login-label">تأكيد كلمة المرور</label>
               <input
                 className="login-input"
                 type="password"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 placeholder="••••••••"
                 autoComplete="new-password"
                 required
                 dir="ltr"
                 style={{ textAlign: 'left' }}
               />
             </div>

             <button
               type="submit"
               className="login-submit"
               disabled={busy || !newPassword || !confirmPassword}
             >
               {busy ? '...' : 'حفظ كلمة المرور والمتابعة'}
             </button>
           </form>

           <p style={{ textAlign: 'center', marginTop: 20 }}>
             <button
               type="button"
               onClick={handleLogout}
               style={{
                 fontSize: '0.82rem',
                 color: 'var(--c-ink-muted)',
                 background: 'none',
                 border: 'none',
                 cursor: 'pointer',
                 fontFamily: 'inherit',
               }}
             >
               تسجيل الخروج
             </button>
           </p>
         </div>
       </div>
     );
   }
   