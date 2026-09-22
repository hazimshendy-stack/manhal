   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { Loading } from '@/components/ui/Loading';
import { now } from '@/lib/db';
import { login } from '@/lib/auth';

   export function PendingApprovalPage() {
     const { user, loading } = useAuth();
     const nav = useNavigate();

     if (loading) return <Loading fullHeight />;

     if (!user) {
       return (
         <div className="login-page">
           <div className="login-card">
             <h1 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Session ended</h1>
             <p className="muted" style={{ lineHeight: 1.8, marginBottom: 20 }}>
               Please sign in again.
             </p>
             <button
               type="button"
               className="login-submit"
               onClick={() => nav('/login')}
             >
               Back to Login
             </button>
           </div>
         </div>
       );
     }

     const handleLogout = async () => {
       await logout();
       nav('/');
     };

     /* ─── Rejected state ─── */
     if (user.status === 'rejected') {
       return (
         <div className="login-page">
           <div className="login-card" style={{ maxWidth: 520 }}>
             <div
               style={{
                 display: 'inline-block',
                 padding: '6px 14px',
                 background: 'var(--c-red-tint)',
                 color: '#991B1B',
                 borderRadius: 'var(--radius-full)',
                 fontSize: '0.78rem',
                 fontWeight: 800,
                 letterSpacing: '0.06em',
                 marginBottom: 16,
               }}
             >
               REGISTRATION REJECTED
             </div>
             <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>
               Sorry, {user.displayName}
             </h1>
             <p className="muted" style={{ lineHeight: 1.8, marginBottom: 20 }}>
               Your registration request was not approved. If you think
               this is a mistake, please contact the administration.
             </p>
             {user.rejectionReason ? (
               <div
                 style={{
                   background: 'var(--c-off-white)',
                   border: '1px solid var(--c-line)',
                   borderRadius: 'var(--radius-sm)',
                   padding: 14,
                   fontSize: '0.9rem',
                   lineHeight: 1.7,
                   marginBottom: 20,
                   color: 'var(--c-ink-soft)',
                 }}
               >
                 <strong style={{ display: 'block', marginBottom: 4 }}>
                   Reason:
                 </strong>
                 {user.rejectionReason}
               </div>
             ) : null}
             <button
               type="button"
               className="btn btn--ghost btn--block"
               onClick={handleLogout}
             >
               Sign out
             </button>
           </div>
         </div>
       );
     }

     /* ─── Pending state (default) ─── */
     return (
       <div className="login-page">
         <div className="login-card" style={{ maxWidth: 520 }}>
           <div
             style={{
               display: 'inline-block',
               padding: '6px 14px',
               background: 'var(--c-amber-soft)',
               color: 'var(--c-amber-text)',
               borderRadius: 'var(--radius-full)',
               fontSize: '0.78rem',
               fontWeight: 800,
               letterSpacing: '0.06em',
               marginBottom: 16,
             }}
           >
             AWAITING APPROVAL
           </div>

           <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>
             Welcome, {user.displayName}!
           </h1>

           <p className="muted" style={{ lineHeight: 1.85, marginBottom: 20 }}>
             Your account has been created and is now waiting for an
             administrator to review and approve it. This usually takes
             a short time.
           </p>

           <div
             style={{
               background: 'var(--c-off-white)',
               border: '1px solid var(--c-line)',
               borderRadius: 'var(--radius-sm)',
               padding: 16,
               fontSize: '0.9rem',
               lineHeight: 1.9,
               marginBottom: 20,
             }}
           >
             <div>
               <strong>Email:</strong>{' '}
               <span dir="ltr">{user.email}</span>
             </div>
             <div>
               <strong>Status:</strong>{' '}
               <span style={{ color: 'var(--c-amber-text)', fontWeight: 700 }}>
                 Pending approval
               </span>
             </div>
             {user.preferredTeamId ? (
               <div>
                 <strong>Preferred team:</strong> {user.preferredTeamId}
               </div>
             ) : null}
           </div>

           <p
             className="small muted"
             style={{ lineHeight: 1.75, marginBottom: 20 }}
           >
             You will receive a notification once your account is approved.
             You can safely close this page and come back later.
           </p>

           <button
             type="button"
             className="btn btn--ghost btn--block"
             onClick={handleLogout}
           >
             Sign out
           </button>
         </div>
       </div>
     );
   }
   