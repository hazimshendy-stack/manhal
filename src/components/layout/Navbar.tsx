import { Link, useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { site } from '@/data';
   import type { Notification } from '@/types';

   interface NavbarProps {
     onMenuToggle?: () => void;
   }

   export function Navbar({ onMenuToggle }: NavbarProps) {
     const { user } = useAuth();
     const nav = useNavigate();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');
     const unread = user ? notifs.filter((n) => n.userId === user.uid && !n.read).length : 0;

     const doLogout = async () => {
       await logout();
       nav('/');
     };

     return (
       <header className="navbar no-print">
         <div className="container navbar__inner">
           <Link to={user ? '/dashboard' : '/'} className="brand">
             {site.name}
           </Link>

           <div className="nav-actions">
             {user ? (
               <>
                 {onMenuToggle ? (
                   <button
                     type="button"
                     className="nav-action nav-action--icon show-mobile"
                     onClick={onMenuToggle}
                     aria-label="القائمة"
                   >
                     <span className="nav-action__icon">☰</span>
                   </button>
                 ) : null}

                 <Link
                   to="/notifications"
                   className="nav-action nav-action--icon"
                   aria-label="الإشعارات"
                 >
                   <span className="nav-action__icon">🔔</span>
                   {unread > 0 ? (
                     <span className="nav-action__badge">
                       {unread > 99 ? '99+' : unread}
                     </span>
                   ) : null}
                 </Link>

                 <button
                   type="button"
                   className="nav-action nav-action--danger"
                   onClick={doLogout}
                 >
                   خروج
                 </button>
               </>
             ) : (
               <Link to="/login" className="nav-action nav-action--primary">
                 دخول
               </Link>
             )}
           </div>
         </div>
       </header>
     );
   }
   