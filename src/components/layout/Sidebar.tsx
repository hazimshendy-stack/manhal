import { NavLink, useNavigate } from 'react-router-dom';
   import { useEffect, useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { ROLE_LABEL, isAdmin, seesAllTeams } from '@/lib/permissions';
   import { cx, initials } from '@/lib/format';
   import type { Notification, ApprovalStep } from '@/types';

   interface NavItem {
     to: string;
     label: string;
     icon: string;
     count?: number;
   }

   interface SidebarProps {
     open: boolean;
     onClose: () => void;
   }

   function buildAdminNav(unread: number, pending: number): NavItem[] {
     return [
       { to: '/admin', label: 'لوحة الإدارة', icon: '⚙️' },
       { to: '/admin/analytics', label: 'التحليلات', icon: '📊' },
       { to: '/admin/requests', label: 'الطلبات', icon: '📋', count: pending },
       { to: '/admin/users', label: 'المستخدمون', icon: '👤' },
       { to: '/admin/members', label: 'الأعضاء', icon: '👥' },
       { to: '/admin/contributions', label: 'المشاركات', icon: '📝' },
       { to: '/admin/committees', label: 'اللجان', icon: '🏛️' },
       { to: '/admin/achievements', label: 'الإنجازات', icon: '🏆' },
       { to: '/admin/warnings', label: 'التحذيرات', icon: '⚠️' },
       { to: '/admin/calendar', label: 'التقويم', icon: '📅' },
       { to: '/admin/conversations', label: 'المحادثات', icon: '💬' },
       { to: '/admin/notifications', label: 'إرسال إشعار', icon: '🔔' },
       { to: '/admin/audit', label: 'سجل التغييرات', icon: '📜' },
     ];
   }

   function buildManagerNav(unread: number, pending: number): NavItem[] {
     return [
       { to: '/dashboard', label: 'لوحة التحكم', icon: '🏠' },
       { to: '/members', label: 'الأعضاء', icon: '👥' },
       { to: '/requests', label: 'الطلبات', icon: '📋' },
       { to: '/approvals', label: 'الموافقات', icon: '✅', count: pending },
       { to: '/contributions', label: 'المشاركات', icon: '📝' },
       { to: '/committees', label: 'اللجان', icon: '🏛️' },
       { to: '/league', label: 'الليج', icon: '🥇' },
       { to: '/achievements', label: 'الإنجازات', icon: '🏆' },
       { to: '/warnings', label: 'التحذيرات', icon: '⚠️' },
       { to: '/conversations', label: 'المحادثات', icon: '💬' },
       { to: '/calendar', label: 'التقويم', icon: '📅' },
       { to: '/notifications', label: 'الإشعارات', icon: '🔔', count: unread },
       { to: '/reports', label: 'التقارير', icon: '📈' },
     ];
   }

   function buildMemberNav(unread: number): NavItem[] {
     return [
       { to: '/dashboard', label: 'لوحة التحكم', icon: '🏠' },
       { to: '/profile', label: 'ملفي الشخصي', icon: '👤' },
       { to: '/my-contributions', label: 'مشاركاتي', icon: '📝' },
       { to: '/requests/new', label: 'طلب جديد', icon: '➕' },
       { to: '/my-requests', label: 'طلباتي', icon: '📋' },
       { to: '/committees', label: 'اللجان', icon: '🏛️' },
       { to: '/league', label: 'الليج', icon: '🥇' },
       { to: '/achievements', label: 'الإنجازات', icon: '🏆' },
       { to: '/conversations', label: 'المحادثات', icon: '💬' },
       { to: '/calendar', label: 'التقويم', icon: '📅' },
       { to: '/notifications', label: 'الإشعارات', icon: '🔔', count: unread },
       { to: '/governance', label: 'الحوكمة', icon: '📖' },
     ];
   }

   export function Sidebar({ open, onClose }: SidebarProps) {
     const { user } = useAuth();
     const nav = useNavigate();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');
     const { data: approvals } = useRealtimeCollection<ApprovalStep>('approvals');
     const [isMobile, setIsMobile] = useState(false);

     useEffect(() => {
       const mq = window.matchMedia('(max-width: 900px)');
       const update = () => setIsMobile(mq.matches);
       update();
       mq.addEventListener('change', update);
       return () => mq.removeEventListener('change', update);
     }, []);

     if (!user) return null;

     const unread = notifs.filter((n) => n.userId === user.uid && !n.read).length;
     const pending = approvals.filter((a) => {
       if (a.status !== 'PENDING') return false;
       if (isAdmin(user)) return true;
       if (a.requiredRole !== user.role) return false;
       if (a.requiredTeamId !== null && a.requiredTeamId !== user.teamId) return false;
       return true;
     }).length;

     let items: NavItem[];
     if (isAdmin(user)) {
       items = buildAdminNav(unread, pending);
     } else if (user.role === 'MEMBER' || user.role === 'VIEWER') {
       items = buildMemberNav(unread);
     } else {
       items = buildManagerNav(unread, pending);
     }

     const handleLogout = async () => {
       onClose();
       await logout();
       nav('/');
     };

     const handleNavClick = () => {
       if (isMobile) onClose();
     };

     return (
       <>
         <div
           className={'sidebar-overlay' + (open ? ' is-open' : '')}
           onClick={onClose}
           aria-hidden="true"
         />

         <aside className={'sidebar no-print' + (open ? ' is-open' : '')}>
           <button
             type="button"
             className="sidebar-close"
             onClick={onClose}
             aria-label="إغلاق القائمة"
           >
             ×
           </button>

           <div className="sidebar__user">
             <div className="sidebar__avatar">{initials(user.displayName)}</div>
             <div className="sidebar__user-info">
               <div className="sidebar__user-name">{user.displayName}</div>
               <div className="sidebar__user-role">{ROLE_LABEL[user.role]}</div>
             </div>
           </div>

           <div className="sidebar__group">
             <div className="sidebar__title">
               {seesAllTeams(user) ? 'الإدارة' : 'القائمة'}
             </div>
             {items.map((it) => (
               <NavLink
                 key={it.to}
                 to={it.to}
                 end={it.to === '/dashboard' || it.to === '/admin' || it.to === '/'}
                 onClick={handleNavClick}
                 className={({ isActive }) => cx('sidebar__link', isActive && 'is-active')}
               >
                 <span className="sidebar__icon" aria-hidden="true">{it.icon}</span>
                 <span>{it.label}</span>
                 {it.count && it.count > 0 ? (
                   <span className="sidebar__count">{it.count > 99 ? '99+' : it.count}</span>
                 ) : null}
               </NavLink>
             ))}
           </div>

           <div className="sidebar__group">
             <div className="sidebar__title">الحساب</div>
             <button
               type="button"
               className="sidebar__link sidebar__link--danger"
               onClick={handleLogout}
             >
               <span className="sidebar__icon" aria-hidden="true">🚪</span>
               <span>تسجيل الخروج</span>
             </button>
           </div>
         </aside>
       </>
     );
   }
   