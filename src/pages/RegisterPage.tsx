   import { useState, type FormEvent } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { registerSelf } from '@/lib/auth';
   import { teams } from '@/data/teams';
   import { FormField, TextInput, Select, TextArea } from '@/components/ui/FormField';
   import type { TeamId } from '@/types';

   export function RegisterPage() {
     const nav = useNavigate();
     const [name, setName] = useState('');
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [confirm, setConfirm] = useState('');
     const [preferredTeam, setPreferredTeam] = useState<TeamId | ''>('');
     const [note, setNote] = useState('');
     const [error, setError] = useState('');
     const [busy, setBusy] = useState(false);

     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();
       setError('');

       if (password.length < 6) {
         setError('Password must be at least 6 characters');
         return;
       }
       if (password !== confirm) {
         setError('Passwords do not match');
         return;
       }

       setBusy(true);
       try {
         await registerSelf({
           email,
           password,
           name,
           preferredTeamId: (preferredTeam as TeamId) || null,
           note,
         });
         /* Auto-logged-in. RequireAuth will redirect to /pending-approval */
         nav('/pending-approval');
       } catch (err) {
         setError(err instanceof Error ? err.message : 'Registration failed');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div className="login-page">
         <div className="login-card" style={{ maxWidth: 520 }}>
           <div style={{ marginBottom: 24 }}>
             <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Create your account</h1>
             <p className="small muted" style={{ lineHeight: 1.7 }}>
               Fill in your info. Your account will be reviewed by the
               admin before you can access the platform.
             </p>
           </div>

           <form onSubmit={onSubmit}>
             <FormField label="Full name" required>
               <TextInput value={name} onChange={setName} placeholder="e.g. Ahmed Mohamed" />
             </FormField>

             <FormField label="Email" required>
               <TextInput value={email} onChange={setEmail} type="email" placeholder="name@resala-stem.org" />
             </FormField>

             <FormField label="Password" required hint="Min 6 characters">
               <input
                 className="login-input"
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="At least 6 characters"
                 autoComplete="new-password"
                 required
                 dir="ltr"
               />
             </FormField>

             <FormField label="Confirm password" required>
               <input
                 className="login-input"
                 type="password"
                 value={confirm}
                 onChange={(e) => setConfirm(e.target.value)}
                 placeholder="Repeat password"
                 autoComplete="new-password"
                 required
                 dir="ltr"
               />
             </FormField>

             <FormField
               label="Preferred team (optional)"
               hint="Just a preference — admin makes the final decision"
             >
               <Select
                 value={preferredTeam}
                 onChange={(v) => setPreferredTeam(v as TeamId | '')}
                 options={[
                   { value: '', label: '— No preference —' },
                   ...teams.map((t) => ({ value: t.id, label: t.name })),
                 ]}
               />
             </FormField>

             <FormField
               label="A short note (optional)"
               hint="Anything you want the admin to know"
             >
               <TextArea
                 value={note}
                 onChange={setNote}
                 rows={3}
                 placeholder="e.g. I have 2 years of experience in web development"
               />
             </FormField>

             {error ? <div className="login-error">{error}</div> : null}

             <button
               type="submit"
               className="login-submit"
               disabled={busy || !email || !name || !password || !confirm}
             >
               {busy ? '...' : 'Create Account'}
             </button>
           </form>

           <p className="login-back" style={{ marginTop: 20 }}>
             Already have an account? <Link to="/login">Sign in</Link>
           </p>
           <p className="login-back" style={{ marginTop: 6 }}>
             <Link to="/">Back to Home</Link>
           </p>
         </div>
       </div>
     );
   }
   