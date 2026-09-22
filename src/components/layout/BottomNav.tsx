import { NavLink } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { cx } from '@/lib/format';
   import { IconHome, IconMembers, IconChat, IconBell, IconAdmin } from '@/components/ui/Icons';
   import type { Notification } from '@/types';
import { IconHome } from '@/components/ui/Icons';
import { IconMembers } from '@/components/ui/Icons';
import { IconChat } from '@/components/ui/Icons';
import { IconBell } from '@/components/ui/Icons';
import { IconAdmin } from '@/components/ui/Icons';
import { BottomNav } from '@/components/layout/BottomNav';
import { cx } from '@/lib/format';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { members } from '@/data/members';
import { notifications } from '@/data/notifications';
import { conversations } from '@/data/conversations';

   interface NavTab { to: string; label: string; Icon: (props: { size?: number }) => JSX.Element; badge?: number; }

   export function BottomNav() {
     const { user, manager } = useAuth();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');
     if (!user) return null;
     const unread = notifs.filter((n) => n.userId === user.uid && !n.read).length;
     const tabs: NavTab[] = [
       { to: '/dashboard', label: 'Home', Icon: IconHome },
       { to: '/members', label: 'Members', Icon: IconMembers },
       { to: '/conversations', label: 'Chats', Icon: IconChat },
       { to: '/notifications', label: 'Alerts', Icon: IconBell, badge: unread },
       { to: manager ? '/admin' : '/profile', label: manager ? 'Admin' : 'Profile', Icon: IconAdmin },
     ];
     return (
       <nav className="bottom-nav no-print" aria-label="Quick navigation">
         <div className="bottom-nav__inner">
           {tabs.map((tab) => {
             const { Icon } = tab;
             return (
               <NavLink key={tab.to} to={tab.to} end={tab.to === '/dashboard' || tab.to === '/admin'}
                 className={({ isActive }) => cx('bottom-nav__item', isActive && 'is-active')}>
                 <span className="bottom-nav__icon"><Icon size={24} /></span>
                 <span className="bottom-nav__label">{tab.label}</span>
                 {tab.badge && tab.badge > 0 ? <span className="bottom-nav__badge">{tab.badge > 99 ? '99+' : tab.badge}</span> : null}
               </NavLink>
             );
           })}
         </div>
       </nav>
     );
   }
   