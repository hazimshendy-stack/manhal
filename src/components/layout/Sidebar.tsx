   import { NavLink, useNavigate } from 'react-router-dom';
   import { useEffect, useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { ROLE_LABEL, isAdmin, seesAllTeams } from '@/lib/permissions';
   import { cx } from '@/lib/format';
   import type { ApprovalStep, AppUser } from '@/types';
import { useState } from 'react';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { cx } from '@/lib/format';
import { ROLE_LABEL } from '@/lib/permissions';
import { isAdmin } from '@/lib/permissions';
import { seesAllTeams } from '@/lib/permissions';
import { logout } from '@/lib/auth';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { committees } from '@/data/committees';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';
import { requests } from '@/data/requests';
import { approvals } from '@/data/approvals';
import { warnings } from '@/data/warnings';
import { achievements } from '@/data/achievements';
import { notifications } from '@/data/notifications';
import { conversations } from '@/data/conversations';
import { audit } from '@/data/audit';

   interface NavItem { to: string; label: string; count?: number; }
   interface SidebarProps { open: boolean; onClose: () => void; }

   function buildAdminNav(pendingApprovals: number, pendingUsers: number): NavItem[] {
     return [
       { to: '/admin', label: 'Admin Dashboard' },
       { to: '/admin/analytics', label: 'Analytics' },
       { to: '/admin/pending-users', label: 'Pending Users', count: pendingUsers },
       { to: '/admin/requests', label: 'Requests', count: pendingApprovals },
       { to: '/admin/users', label: 'Users' },
       { to: '/admin/members', label: 'Members' },
       { to: '/admin/contributions', label: 'Contributions' },
       { to: '/admin/committees', label: 'Committees' },
       { to: '/admin/achievements', label: 'Achievements' },
       { to: '/admin/warnings', label: 'Warnings' },
       { to: '/admin/calendar', label: 'Calendar' },
       { to: '/admin/notifications', label: 'Send Notification' },
       { to: '/admin/governance', label: 'Governance' },
       { to: '/admin/audit', label: 'Audit Log' },
     ];
   }

   function buildManagerNav(pending: number): NavItem[] {
     return [
       { to: '/dashboard', label: 'Dashboard' },
       { to: '/members', label: 'Members' },
       { to: '/requests', label: 'Requests' },
       { to: '/approvals', label: 'Approvals', count: pending },
       { to: '/contributions', label: 'Contributions' },
       { to: '/committees', label: 'Committees' },
       { to: '/league', label: 'League' },
       { to: '/achievements', label: 'Achievements' },
       { to: '/warnings', label: 'Warnings' },
       { to: '/calendar', label: 'Calendar' },
       { to: '/notifications', label: 'Notifications' },
       { to: '/reports', label: 'Reports' },
     ];
   }

   function buildMemberNav(): NavItem[] {
     return [
       { to: '/dashboard', label: 'Dashboard' },
       { to: '/profile', label: 'My Profile' },
       { to: '/my-contributions', label: 'My Contributions' },
       { to: '/requests/new', label: 'New Request' },
       { to: '/my-requests', label: 'My Requests' },
       { to: '/committees', label: 'Committees' },
       { to: '/league', label: 'League' },
       { to: '/achievements', label: 'Achievements' },
       { to: '/calendar', label: 'Calendar' },
       { to: '/notifications', label: 'Notifications' },
       { to: '/governance', label: 'Governance' },
     ];
   }

   export function Sidebar({ open, onClose }: SidebarProps) {
     const { user } = useAuth();
     const nav = useNavigate();
     const { data: approvals } = useRealtimeCollection<ApprovalStep>('approvals');
     const { data: users } = useRealtimeCollection<AppUser>('users');
     const [isMobile, setIsMobile] = useState(false);

     useEffect(() => {
       const mq = window.matchMedia('(max-width: 900px)');
       const update = () => setIsMobile(mq.matches);
       update();
       mq.addEventListener('change', update);
       return () => mq.removeEventListener('change', update);
     }, []);

     if (!user) return null;

     const pendingApprovals = approvals.filter((a) => {
       if (a.status !== 'PENDING') return false;
       if (isAdmin(user)) return true;
       if (a.requiredRole !== user.role) return false;
       if (a.requiredTeamId !== null && a.requiredTeamId !== user.teamId) return false;
       return true;
     }).length;

     const pendingUsers = users.filter((u) => u.status === 'pending').length;

     let items: NavItem[];
     if (isAdmin(user)) items = buildAdminNav(pendingApprovals, pendingUsers);
     else if (user.role === 'MEMBER' || user.role === 'VIEWER') items = buildMemberNav();
     else items = buildManagerNav(pendingApprovals);

     const handleLogout = async () => { onClose(); await logout(); nav('/'); };
     const handleNavClick = () => { if (isMobile) onClose(); };

     return (
       <>
         <div className={'sidebar-overlay' + (open ? ' is-open' : '')} onClick={onClose} aria-hidden="true" />
         <aside className={'sidebar no-print' + (open ? ' is-open' : '')}>
           <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">×</button>
           <div className="sidebar__user">
             <div className="sidebar__user-info">
               <div className="sidebar__user-name">{user.displayName}</div>
               <div className="sidebar__user-role">{ROLE_LABEL[user.role]}</div>
             </div>
           </div>
           <div className="sidebar__group">
             <div className="sidebar__title">{seesAllTeams(user) ? 'Administration' : 'Menu'}</div>
             {items.map((it) => (
               <NavLink key={it.to} to={it.to} end={it.to === '/dashboard' || it.to === '/admin' || it.to === '/'}
                 onClick={handleNavClick}
                 className={({ isActive }) => cx('sidebar__link', isActive && 'is-active')}>
                 <span>{it.label}</span>
                 {it.count && it.count > 0 ? (
                   <span className="sidebar__count">{it.count > 99 ? '99+' : it.count}</span>
                 ) : null}
               </NavLink>
             ))}
           </div>
           <div className="sidebar__group">
             <div className="sidebar__title">Account</div>
             <button type="button" className="sidebar__link sidebar__link--danger" onClick={handleLogout}>Logout</button>
           </div>
         </aside>
       </>
     );
   }
   