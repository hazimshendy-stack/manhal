import { NavLink } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { cx } from '@/lib/format';
   import type { Notification } from '@/types';

   interface NavTab {
     to: string;
     label: string;
     icon: string;
     badge?: number;
   }

   export function BottomNav() {
     const { user, manager } = useAuth();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');

     if (!user) return null;

     const unread = notifs.filter((n) => n.userId === user.uid && !n.read).length;

     const tabs: NavTab[] = [
       { to: '/dashboard', label: 'الرئيسية', icon: '🏠' },
       { to: '/members', label: 'الأعضاء', icon: '👥' },
       { to: '/conversations', label: 'المحادثات', icon: '💬' },
       { to: '/notifications', label: 'الإشعارات', icon: '🔔', badge: unread },
       { to: manager ? '/admin' : '/profile', label: manager ? 'الإدارة' : 'ملفي', icon: manager ? '⚙️' : '👤' },
     ];

     return (
       <nav className="bottom-nav no-print" aria-label="التنقل السريع">
         <div className="bottom-nav__inner">
           {tabs.map((tab) => (
             <NavLink
               key={tab.to}
               to={tab.to}
               end={tab.to === '/dashboard' || tab.to === '/admin'}
               className={({ isActive }) => cx('bottom-nav__item', isActive && 'is-active')}
             >
               <span className="bottom-nav__icon" aria-hidden="true">{tab.icon}</span>
               <span className="bottom-nav__label">{tab.label}</span>
               {tab.badge && tab.badge > 0 ? (
                 <span className="bottom-nav__badge">
                   {tab.badge > 99 ? '99+' : tab.badge}
                 </span>
               ) : null}
             </NavLink>
           ))}
         </div>
       </nav>
     );
   }
   