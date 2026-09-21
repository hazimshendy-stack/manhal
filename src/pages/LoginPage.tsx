import { useState, type FormEvent } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { login, sendPasswordReset } from '@/lib/auth';
   import { FormField, TextInput } from '@/components/ui/FormField';

   type Mode = 'login' | 'forgot';

   export function LoginPage() {
     const nav = useNavigate();
     const [mode, setMode] = useState<Mode>('login');
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [success, setSuccess] = useState('');
     const [busy, setBusy] = useState(false);

     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();
       setError('');
       setSuccess('');
       setBusy(true);
       try {
         await login(email.trim(), password);
         nav('/dashboard');
       } catch (err: unknown) {
         setError(translateError(err));
       } finally {
         setBusy(false);
       }
     };

     const onForgot = async (e: FormEvent) => {
       e.preventDefault();
       setError('');
       setSuccess('');
       setBusy(true);
       try {
         await sendPasswordReset(email.trim());
         setSuccess('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني');
         setTimeout(() => setMode('login'), 2500);
       } catch (err: unknown) {
         setError(translateError(err));
       } finally {
         setBusy(false);
       }
     };

     return (
       <div className="login-page">
         <div className="login-card">
           <div className="login-tabs">
             <button
               type="button"
               className={'login-tab' + (mode === 'login' ? ' is-active' : '')}
               onClick={() => {
                 setMode('login');
                 setError('');
                 setSuccess('');
               }}
             >
               تسجيل الدخول
             </button>
             <button
               type="button"
               className={'login-tab' + (mode === 'forgot' ? ' is-active' : '')}
               onClick={() => {
                 setMode('forgot');
                 setError('');
                 setSuccess('');
               }}
             >
               نسيت كلمة المرور
             </button>
           </div>

           {error ? <div className="login-error">{error}</div> : null}
           {success ? <div className="login-success">{success}</div> : null}

           {mode === 'login' ? (
             <form onSubmit={onSubmit}>
               <div className="login-field">
                 <label className="login-label">البريد الإلكتروني</label>
                 <input
                   className="login-input"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="name@resala-stem.org"
                   autoComplete="email"
                   required
                   dir="ltr"
                   style={{ textAlign: 'left' }}
                 />
               </div>

               <div className="login-field">
                 <label className="login-label">كلمة المرور</label>
                 <input
                   className="login-input"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   autoComplete="current-password"
                   required
                   dir="ltr"
                   style={{ textAlign: 'left' }}
                 />
               </div>

               <button
                 type="submit"
                 className="login-submit"
                 disabled={busy || !email || !password}
               >
                 {busy ? '...' : 'تسجيل الدخول'}
               </button>
             </form>
           ) : (
             <form onSubmit={onForgot}>
               <div className="login-field">
                 <label className="login-label">البريد الإلكتروني</label>
                 <input
                   className="login-input"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="name@resala-stem.org"
                   autoComplete="email"
                   required
                   dir="ltr"
                   style={{ textAlign: 'left' }}
                 />
               </div>
               <button
                 type="submit"
                 className="login-submit"
                 disabled={busy || !email}
               >
                 {busy ? '...' : 'إرسال رابط الاستعادة'}
               </button>
             </form>
           )}

           <p style={{ textAlign: 'center', marginTop: 20 }}>
             <Link
               to="/"
               style={{
                 fontSize: '0.82rem',
                 color: 'var(--c-ink-muted)',
               }}
             >
               العودة للرئيسية
             </Link>
           </p>
         </div>
       </div>
     );
   }

   function translateError(err: unknown): string {
     const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
     if (msg.includes('invalid-credential')) return 'البريد أو كلمة المرور غير صحيحة';
     if (msg.includes('user-not-found')) return 'لا يوجد حساب بهذا البريد';
     if (msg.includes('wrong-password')) return 'كلمة المرور غير صحيحة';
     if (msg.includes('invalid-email')) return 'البريد الإلكتروني غير صالح';
     if (msg.includes('network-request-failed')) return 'تعذر الاتصال بالشبكة';
     if (msg.includes('too-many-requests')) return 'حاول مجددًا بعد قليل';
     return msg;
   }
   