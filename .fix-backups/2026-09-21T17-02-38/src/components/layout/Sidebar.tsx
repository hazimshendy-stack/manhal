import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { logout } from '@/lib/auth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { ROLE_LABEL, isAdmin, seesAllTeams } from '@/lib/permissions';
import { cx, initials } from '@/lib/format';
import type { ApprovalStep } from '@/types';

interface NavItem {
  to: string;
  label: string;
  count?: number;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function buildAdminNav(pending: number): NavItem[] {
  return [
    { to: '/admin', label: 'لوحة الإدارة' },
    { to: '/admin/analytics', label: 'التحليلات' },
    { to: '/admin/requests', label: 'الطلبات', count: pending },
    { to: '/admin/users', label: 'المستخدمون' },
    { to: '/admin/members', label: 'الأعضاء' },
    { to: '/admin/contributions', label: 'المشاركات' },
    { to: '/admin/committees', label: 'اللجان' },
    { to: '/admin/achievements', label: 'الإنجازات' },
    { to: '/admin/warnings', label: 'التحذيرات' },
    { to: '/admin/calendar', label: 'التقويم' },
    { to: '/admin/conversations', label: 'المحادثات' },
    { to: '/admin/notifications', label: 'إرسال إشعار' },
    { to: '/admin/audit', label: 'سجل التغييرات' },
  ];
}

function buildManagerNav(pending: number): NavItem[] {
  return [
    { to: '/dashboard', label: 'لوحة التحكم' },
    { to: '/members', label: 'الأعضاء' },
    { to: '/requests', label: 'الطلبات' },
    { to: '/approvals', label: 'الموافقات', count: pending },
    { to: '/contributions', label: 'المشاركات' },
    { to: '/committees', label: 'اللجان' },
    { to: '/league', label: 'الليج' },
    { to: '/achievements', label: 'الإنجازات' },
    { to: '/warnings', label: 'التحذيرات' },
    { to: '/conversations', label: 'المحادثات' },
    { to: '/calendar', label: 'التقويم' },
    { to: '/notifications', label: 'الإشعارات' },
    { to: '/reports', label: 'التقارير' },
  ];
}

function buildMemberNav(): NavItem[] {
  return [
    { to: '/dashboard', label: 'لوحة التحكم' },
    { to: '/profile', label: 'ملفي الشخصي' },
    { to: '/my-contributions', label: 'مشاركاتي' },
    { to: '/requests/new', label: 'طلب جديد' },
    { to: '/my-requests', label: 'طلباتي' },
    { to: '/committees', label: 'اللجان' },
    { to: '/league', label: 'الليج' },
    { to: '/achievements', label: 'الإنجازات' },
    { to: '/conversations', label: 'المحادثات' },
    { to: '/calendar', label: 'التقويم' },
    { to: '/notifications', label: 'الإشعارات' },
    { to: '/governance', label: 'الحوكمة' },
  ];
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const nav = useNavigate();
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

  const pending = approvals.filter((a) => {
    if (a.status !== 'PENDING') return false;
    if (isAdmin(user)) return true;
    if (a.requiredRole !== user.role) return false;
    if (a.requiredTeamId !== null && a.requiredTeamId !== user.teamId) return false;
    return true;
  }).length;

  let items: NavItem[];
  if (isAdmin(user)) {
    items = buildAdminNav(pending);
  } else if (user.role === 'MEMBER' || user.role === 'VIEWER') {
    items = buildMemberNav();
  } else {
    items = buildManagerNav(pending);
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
              <span>{it.label}</span>
              {it.count && it.count > 0 ? (
                <span className="sidebar__count">
                  {it.count > 99 ? '99+' : it.count}
                </span>
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
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
