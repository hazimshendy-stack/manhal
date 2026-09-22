import { useState, type FormEvent } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { login } from '@/lib/auth';

   export function LoginPage() {
     const nav = useNavigate();
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [busy, setBusy] = useState(false);
     const onSubmit = async (e: FormEvent) => {
       e.preventDefault(); setError(''); setBusy(true);
       try { await login(email.trim(), password); nav('/dashboard'); }
       catch (err: unknown) { setError(err instanceof Error ? err.message : 'Login failed'); }
       finally { setBusy(false); }
     };
     return (
       <div className="login-page">
         <div className="login-card">
           <form onSubmit={onSubmit}>
             <div className="login-field">
               <label className="login-label">Email</label>
               <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@resala-stem.org" autoComplete="email" required dir="ltr" />
             </div>
             <div className="login-field">
               <label className="login-label">Password</label>
               <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="........" autoComplete="current-password" required dir="ltr" />
             </div>
             {error ? <div className="login-error">{error}</div> : null}
             <button type="submit" className="login-submit" disabled={busy || !email || !password}>{busy ? '...' : 'Sign In'}</button>
           </form>
           <p className="login-back"><Link to="/">Back to Home</Link></p>
         </div>
       </div>
     );
   }
   