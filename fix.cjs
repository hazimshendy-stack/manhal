#!/usr/bin/env node
/**
 * fix.cjs v5
 * - SVG icons احترافية (فيسبوك ستايل) للأزرار الرئيسية فقط
 * - إزالة حرف S من كل مكان
 * - إزالة كل الإيموجيز والأيقونات الأخرى
 * - اللجان ديناميكية (Admin يضيفها)
 * - CSS محسّن + padding احترافي
 * - إزالة "نسيت كلمة المرور"
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname;
const files = {};

/* ═══════════════════════════════════════════════════════════════
   1. أيقونات SVG احترافية (بدون ألوان - currentColor)
   ═══════════════════════════════════════════════════════════════ */

files["src/components/ui/Icons.tsx"] = `interface IconProps {
  size?: number;
  className?: string;
}

export function IconHome({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M11.3 2.4a1 1 0 0 1 1.4 0l9 8.2a1 1 0 0 1-.7 1.7h-1.5v8.2a1 1 0 0 1-1 1h-4.6v-5.5a1.5 1.5 0 0 0-1.5-1.5h-.8a1.5 1.5 0 0 0-1.5 1.5v5.5H5.5a1 1 0 0 1-1-1v-8.2H3a1 1 0 0 1-.7-1.7l9-8.2z" />
    </svg>
  );
}

export function IconMembers({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="4" />
      <path d="M2.5 20.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1z" />
      <circle cx="17.5" cy="7.5" r="3.2" />
      <path d="M14.6 20.6c-.1-2.3 1.1-4.4 3-5.5 2.3.8 3.9 3 3.9 5.5a.9.9 0 0 1-.9.9h-5.1a.9.9 0 0 1-.9-.9z" />
    </svg>
  );
}

export function IconChat({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.5C6.2 2.5 1.5 6.5 1.5 11.5c0 2.8 1.6 5.3 4.2 7l-.8 3.4a.6.6 0 0 0 .9.6l3.9-2.3c.8.1 1.5.2 2.3.2 5.8 0 10.5-4 10.5-9S17.8 2.5 12 2.5z" />
    </svg>
  );
}

export function IconBell({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a2 2 0 0 0-2 2v.6A6.5 6.5 0 0 0 5 11v4.2L3.3 17.8a1 1 0 0 0 .9 1.5h15.6a1 1 0 0 0 .9-1.5L19 15.2V11a6.5 6.5 0 0 0-5-6.4V4a2 2 0 0 0-2-2z" />
      <path d="M10 21.2a2 2 0 0 0 4 0h-4z" />
    </svg>
  );
}

export function IconAdmin({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2 3.5 5.5v6.2c0 5.3 3.7 9.7 8.5 10.8 4.8-1.1 8.5-5.5 8.5-10.8V5.5L12 2zm0 5.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    </svg>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   2. BottomNav — أيقونات SVG فقط
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/components/layout/BottomNav.tsx"
] = `import { NavLink } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { cx } from '@/lib/format';
import {
  IconHome,
  IconMembers,
  IconChat,
  IconBell,
  IconAdmin,
} from '@/components/ui/Icons';
import type { Notification } from '@/types';

interface NavTab {
  to: string;
  label: string;
  Icon: (props: { size?: number }) => JSX.Element;
  badge?: number;
}

export function BottomNav() {
  const { user, manager } = useAuth();
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');

  if (!user) return null;

  const unread = notifs.filter((n) => n.userId === user.uid && !n.read).length;

  const tabs: NavTab[] = [
    { to: '/dashboard', label: 'الرئيسية', Icon: IconHome },
    { to: '/members', label: 'الأعضاء', Icon: IconMembers },
    { to: '/conversations', label: 'المحادثات', Icon: IconChat },
    { to: '/notifications', label: 'الإشعارات', Icon: IconBell, badge: unread },
    {
      to: manager ? '/admin' : '/profile',
      label: manager ? 'الإدارة' : 'ملفي',
      Icon: IconAdmin,
    },
  ];

  return (
    <nav className="bottom-nav no-print" aria-label="التنقل السريع">
      <div className="bottom-nav__inner">
        {tabs.map((tab) => {
          const { Icon } = tab;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/dashboard' || tab.to === '/admin'}
              className={({ isActive }) =>
                cx('bottom-nav__item', isActive && 'is-active')
              }
            >
              <span className="bottom-nav__icon">
                <Icon size={24} />
              </span>
              <span className="bottom-nav__label">{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="bottom-nav__badge">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   3. Navbar — بدون حرف S، Bell SVG فقط
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/components/layout/Navbar.tsx"
] = `import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { logout } from '@/lib/auth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { site } from '@/data';
import { IconBell } from '@/components/ui/Icons';
import type { Notification } from '@/types';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user } = useAuth();
  const nav = useNavigate();
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');
  const unread = user
    ? notifs.filter((n) => n.userId === user.uid && !n.read).length
    : 0;

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
                  <span className="nav-action__menu" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              ) : null}

              <Link
                to="/notifications"
                className="nav-action nav-action--icon"
                aria-label="الإشعارات"
              >
                <IconBell size={22} />
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
`;

/* ═══════════════════════════════════════════════════════════════
   4. Footer — بدون حرف S
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/components/layout/Footer.tsx"
] = `import { Link } from 'react-router-dom';
import { site, activeSeason } from '@/data';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer no-print">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand-col">
            <div className="footer__brand">{site.name}</div>
            <p className="footer__tagline">{site.description}</p>
            <div className="footer__copyright">
              © {year} {site.organization} — {activeSeason.label}
            </div>
          </div>

          <div className="footer__links-col">
            <div>
              <div className="footer__group-title">التصفح</div>
              <div className="footer__links">
                <Link className="footer__link" to="/">الرئيسية</Link>
                <Link className="footer__link" to="/members">الأعضاء</Link>
                <Link className="footer__link" to="/teams">الفرق</Link>
                <Link className="footer__link" to="/league">الليج</Link>
              </div>
            </div>

            <div>
              <div className="footer__group-title">المنصة</div>
              <div className="footer__links">
                <Link className="footer__link" to="/committees">اللجان</Link>
                <Link className="footer__link" to="/achievements">الإنجازات</Link>
                <Link className="footer__link" to="/calendar">التقويم</Link>
                <Link className="footer__link" to="/search">بحث</Link>
              </div>
            </div>

            <div>
              <div className="footer__group-title">عن المنظمة</div>
              <div className="footer__links">
                <Link className="footer__link" to="/about">عن المنحل</Link>
                <Link className="footer__link" to="/governance">الحوكمة</Link>
                <Link className="footer__link" to="/login">تسجيل الدخول</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   5. Sidebar — نص فقط (بدون أي إيموجي أو أيقونات)
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/components/layout/Sidebar.tsx"
] = `import { NavLink, useNavigate } from 'react-router-dom';
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
`;

/* ═══════════════════════════════════════════════════════════════
   6. Onboarding — بدون S، بدون أيقونات
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/components/onboarding/Onboarding.tsx"
] = `import { useEffect, useState } from 'react';
import { onboardingCards } from '@/data';
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
} from '@/lib/onboarding';
import { site } from '@/data';

export function Onboarding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const finish = () => {
    markOnboardingComplete();
    setVisible(false);
    document.body.style.overflow = '';
  };

  if (!visible) return null;

  const sorted = [...onboardingCards].sort((a, b) => a.order - b.order);

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true">
      <div className="onboarding-header">
        <div className="onboarding-header__title">أهلاً في {site.name}</div>
        <div className="onboarding-header__subtitle">
          تعرّف على المنصة في دقيقة واحدة
        </div>
      </div>

      <div className="onboarding-body">
        <div className="onboarding-grid">
          {sorted.map((card) => (
            <div key={card.id} className="onboarding-card">
              <div className="onboarding-card__title">{card.title}</div>
              <div className="onboarding-card__desc">{card.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="onboarding-footer">
        <button type="button" className="onboarding-cta" onClick={finish}>
          فهمت، لنبدأ
        </button>
      </div>
    </div>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   7. PWA Install Banner — بدون S
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/components/pwa/PwaInstallBanner.tsx"
] = `import { useEffect, useState } from 'react';
import {
  canInstallPwa,
  promptInstall,
  isStandalone,
  isIos,
} from '@/lib/pwa';
import { toast } from '@/components/ui/Toast';

const DISMISSED_KEY = 'sbapiaryy-pwa-dismissed';

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISSED_KEY) === 'yes') return;

    const check = () => {
      if (canInstallPwa()) {
        setVisible(true);
        setIosMode(false);
      } else if (isIos()) {
        setVisible(true);
        setIosMode(true);
      }
    };

    check();
    const t = setTimeout(check, 2000);

    const handler = () => {
      setVisible(true);
      setIosMode(false);
    };
    window.addEventListener('pwa-install-available', handler);

    return () => {
      clearTimeout(t);
      window.removeEventListener('pwa-install-available', handler);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, 'yes');
  };

  const install = async () => {
    if (iosMode) {
      toast.info(
        'للتثبيت على iPhone',
        'اضغط زر المشاركة ← Add to Home Screen',
      );
      return;
    }
    const result = await promptInstall();
    if (result === 'accepted') {
      toast.success('تم التثبيت', 'افتح التطبيق من الشاشة الرئيسية');
      setVisible(false);
    } else if (result === 'dismissed') {
      dismiss();
    } else {
      toast.info('التثبيت غير متاح', 'استخدم قائمة المتصفح ← Install app');
    }
  };

  if (!visible) return null;

  return (
    <div className="pwa-install-banner no-print">
      <div className="pwa-install-banner__body">
        <div className="pwa-install-banner__title">ثبّت التطبيق</div>
        <div className="pwa-install-banner__desc">
          {iosMode
            ? 'من Safari: اضغط Share ← Add to Home Screen'
            : 'وصول أسرع من شاشة هاتفك'}
        </div>
      </div>
      <div className="pwa-install-banner__actions">
        <button type="button" className="btn btn--ghost btn--xs" onClick={dismiss}>
          لاحقًا
        </button>
        <button type="button" className="btn btn--primary btn--xs" onClick={install}>
          تثبيت
        </button>
      </div>
    </div>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   8. LoginPage — بدون "نسيت كلمة المرور"
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/pages/LoginPage.tsx"
] = `import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/lib/auth';

export function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
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

  return (
    <div className="login-page">
      <div className="login-card">
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
            />
          </div>

          <div className="login-field">
            <label className="login-label">كلمة المرور</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="........"
              autoComplete="current-password"
              required
              dir="ltr"
            />
          </div>

          {error ? <div className="login-error">{error}</div> : null}

          <button
            type="submit"
            className="login-submit"
            disabled={busy || !email || !password}
          >
            {busy ? '...' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="login-back">
          <Link to="/">العودة للرئيسية</Link>
        </p>
      </div>
    </div>
  );
}

function translateError(err: unknown): string {
  const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
  if (msg.includes('invalid-credential'))
    return 'البريد أو كلمة المرور غير صحيحة';
  if (msg.includes('user-not-found')) return 'لا يوجد حساب بهذا البريد';
  if (msg.includes('wrong-password')) return 'كلمة المرور غير صحيحة';
  if (msg.includes('invalid-email')) return 'البريد الإلكتروني غير صالح';
  if (msg.includes('network-request-failed')) return 'تعذر الاتصال بالشبكة';
  if (msg.includes('too-many-requests')) return 'حاول مجددًا بعد قليل';
  return msg;
}
`;

/* ═══════════════════════════════════════════════════════════════
   9. اللجان — مصفوفة فارغة (الأدمن يضيفها)
   ═══════════════════════════════════════════════════════════════ */

files["src/data/committees.ts"] = `import type { Committee } from '@/types';

/**
 * لا توجد لجان افتراضية.
 * الأدمن يضيف اللجان من /admin/committees.
 */
export const committees: Committee[] = [];
`;

/* ═══════════════════════════════════════════════════════════════
   10. seed.ts — لا يزرع لجانًا
   ═══════════════════════════════════════════════════════════════ */

files["src/lib/seed.ts"] = `import { teams } from '@/data/teams';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';
import { requests } from '@/data/requests';
import { approvals } from '@/data/approvals';
import { warnings } from '@/data/warnings';
import { achievements } from '@/data/achievements';
import { notifications } from '@/data/notifications';
import { conversations, messages } from '@/data/conversations';
import { calendarEvents } from '@/data/calendar';
import { governanceDocuments } from '@/data/governance';
import { createOne, listAll } from './db';

export interface SeedResult {
  teams: number;
  committees: number;
  members: number;
  contributions: number;
  requests: number;
  approvals: number;
  warnings: number;
  achievements: number;
  notifications: number;
  conversations: number;
  messages: number;
  calendar: number;
  governance: number;
}

export async function seedAll(): Promise<SeedResult> {
  const existingTeams = await listAll('teams').catch(() => []);
  if (existingTeams.length > 0) {
    throw new Error(
      'البيانات موجودة مسبقًا. امسح المجموعات من Firebase Console إن أردت إعادة الرفع.',
    );
  }

  for (const t of teams) await createOne('teams', t);
  for (const m of members) await createOne('members', m);
  for (const c of contributions) await createOne('contributions', c);
  for (const r of requests) await createOne('requests', r);
  for (const a of approvals) await createOne('approvals', a);
  for (const w of warnings) await createOne('warnings', w);
  for (const a of achievements) await createOne('achievements', a);
  for (const n of notifications) await createOne('notifications', n);
  for (const c of conversations) await createOne('conversations', c);
  for (const m of messages) await createOne('messages', m);
  for (const e of calendarEvents) await createOne('calendar', e);
  for (const g of governanceDocuments) await createOne('governance', g);

  return {
    teams: teams.length,
    committees: 0,
    members: members.length,
    contributions: contributions.length,
    requests: requests.length,
    approvals: approvals.length,
    warnings: warnings.length,
    achievements: achievements.length,
    notifications: notifications.length,
    conversations: conversations.length,
    messages: messages.length,
    calendar: calendarEvents.length,
    governance: governanceDocuments.length,
  };
}
`;

/* ═══════════════════════════════════════════════════════════════
   11. AdminCommitteesPage — CRUD كامل للأدمن
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/pages/admin/AdminCommitteesPage.tsx"
] = `import { useMemo, useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { teams } from '@/data/teams';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
import { toast } from '@/components/ui/toast-or-fallback';
import type { Committee, Member } from '@/types';

const EMPTY: Omit<Committee, 'id'> = {
  name: '',
  nameAr: '',
  description: '',
  color: '#151A45',
  icon: '',
};

export function AdminCommitteesPage() {
  const { user: me } = useAuth();
  const { data: committees, loading } = useCollection<Committee>('committees');
  const { data: members } = useCollection<Member>('members');

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Committee | null>(null);
  const [form, setForm] = useState<Omit<Committee, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<Committee | null>(null);
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(
    () => [...committees].sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar')),
    [committees],
  );

  const openCreate = () => {
    setForm(EMPTY);
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (c: Committee) => {
    setForm({
      name: c.name,
      nameAr: c.nameAr,
      description: c.description,
      color: c.color,
      icon: c.icon,
    });
    setEditing(c);
    setCreating(false);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    if (!form.nameAr.trim()) {
      toast.error('اسم اللجنة مطلوب');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim() || form.nameAr.trim(),
        nameAr: form.nameAr.trim(),
        description: form.description.trim(),
        color: form.color,
        icon: form.icon,
      };

      if (editing) {
        await updateOne('committees', editing.id, payload);
        await logAudit(me, 'UPDATE_COMMITTEE', 'Committee', editing.id, form.nameAr);
        toast.success('تم التحديث');
      } else {
        const id = 'COMM-' + Date.now().toString(36).toUpperCase();
        await createOne('committees', { id, ...payload });
        await logAudit(me, 'CREATE_COMMITTEE', 'Committee', id, form.nameAr);
        toast.success('تمت الإضافة');
      }
      close();
    } catch {
      toast.error('فشل الحفظ');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('committees', toDelete.id);
      // إزالة اللجنة من كل الأعضاء
      for (const m of members) {
        if (m.committeeIds.includes(toDelete.id)) {
          const newIds = m.committeeIds.filter((c) => c !== toDelete.id);
          await updateOne('members', m.id, { committeeIds: newIds });
        }
      }
      await logAudit(me, 'DELETE_COMMITTEE', 'Committee', toDelete.id, toDelete.nameAr);
      toast.success('تم الحذف');
      setToDelete(null);
    } catch {
      toast.error('فشل الحذف');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="إدارة"
        title="اللجان"
        description="أضف اللجان التي تريدها. لن تظهر أي لجنة حتى تضيفها."
      />

      <SectionHeader
        eyebrow="القائمة"
        title={'اللجان (' + committees.length + ')'}
        action={
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={openCreate}
          >
            + لجنة جديدة
          </button>
        }
      />

      {loading ? (
        <SkeletonList count={4} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="لا لجان بعد"
          message="أضف أول لجنة لتظهر للأعضاء عند التسجيل."
          action={
            <button
              type="button"
              className="btn btn--primary"
              onClick={openCreate}
            >
              + إضافة لجنة
            </button>
          }
        />
      ) : (
        <div className="grid grid--wide">
          {sorted.map((c) => {
            const memberCount = members.filter((m) =>
              m.committeeIds.includes(c.id),
            ).length;
            return (
              <div key={c.id} className="card no-click">
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{c.nameAr}</div>
                    {c.name ? (
                      <div className="card__meta">{c.name}</div>
                    ) : null}
                  </div>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 4,
                      background: c.color,
                      flexShrink: 0,
                    }}
                  />
                </div>

                {c.description ? (
                  <p className="small soft mt-3">{c.description}</p>
                ) : null}

                <div className="small muted mt-3">
                  {memberCount} عضو
                </div>

                <div className="row mt-4" style={{ gap: 6, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn--ghost btn--xs"
                    onClick={() => openEdit(c)}
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger btn--xs"
                    onClick={() => setToDelete(c)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        title={editing ? 'تعديل لجنة' : 'لجنة جديدة'}
        onClose={close}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={close}>
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={save}
              disabled={busy}
            >
              {busy ? '...' : 'حفظ'}
            </button>
          </>
        }
      >
        <FormField label="الاسم بالعربية" required>
          <TextInput
            value={form.nameAr}
            onChange={(v) => setForm({ ...form, nameAr: v })}
            placeholder="مثال: لجنة الأنشطة"
          />
        </FormField>

        <FormField label="الاسم بالإنجليزية (اختياري)">
          <TextInput
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="Activities Committee"
          />
        </FormField>

        <FormField label="الوصف">
          <TextArea
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            placeholder="ماذا تفعل هذه اللجنة؟"
            rows={2}
          />
        </FormField>

        <FormField label="اللون" required>
          <Select
            value={form.color}
            onChange={(v) => setForm({ ...form, color: v })}
            options={[
              { value: '#151A45', label: 'كحلي' },
              { value: '#C1272D', label: 'أحمر' },
              { value: '#16A34A', label: 'أخضر' },
              { value: '#2563EB', label: 'أزرق' },
              { value: '#7C3AED', label: 'بنفسجي' },
              { value: '#EC4899', label: 'وردي' },
              { value: '#D97706', label: 'برتقالي' },
              { value: '#0891B2', label: 'سماوي' },
            ]}
          />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="حذف اللجنة"
        message={
          'سيتم حذف "' +
          (toDelete?.nameAr || '') +
          '" وإزالتها من جميع الأعضاء. متابعة؟'
        }
        confirmLabel="حذف"
        danger
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   12. Toast fallback — لو غير موجود
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/components/ui/toast-or-fallback.ts"
] = `import { toast as realToast } from './Toast';
export { realToast as toast };
`;

/* ═══════════════════════════════════════════════════════════════
   13. Favicon — بدون S
   ═══════════════════════════════════════════════════════════════ */

files[
  "public/favicon.svg"
] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#151A45"/>
</svg>
`;

/* ═══════════════════════════════════════════════════════════════
   14. manifest.json — بدون أيقونات
   ═══════════════════════════════════════════════════════════════ */

files["public/manifest.json"] = `{
  "name": "sbapiaryy — Resala STEM Sub Branches",
  "short_name": "sbapiaryy",
  "description": "المنصة الرسمية لمتابعة Resala STEM Sub Branches",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#151A45",
  "theme_color": "#151A45",
  "lang": "ar",
  "dir": "rtl"
}
`;

/* ═══════════════════════════════════════════════════════════════
   15. index.html — بدون S في شاشة البداية
   ═══════════════════════════════════════════════════════════════ */

files["index.html"] = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover"
    />
    <meta name="theme-color" content="#151A45" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="sbapiaryy" />
    <meta
      name="description"
      content="المنصة الرسمية لمتابعة Resala STEM Sub Branches"
    />

    <title>sbapiaryy</title>

    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="manifest" href="./manifest.json" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <style>
      html, body { margin: 0; padding: 0; background: #151A45; }
      #root { min-height: 100vh; }

      .boot-screen {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #151A45;
        color: #fff;
        font-family: 'Tajawal', system-ui, sans-serif;
        flex-direction: column;
        gap: 20px;
        z-index: 9999;
        transition: opacity 0.3s ease;
      }

      .boot-screen.hidden { opacity: 0; pointer-events: none; }

      .boot-screen__name {
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: 0.02em;
      }

      .boot-screen__hint {
        font-size: 0.85rem;
        color: #D5DAF0;
        opacity: 0.7;
      }
    </style>

    <script>
      (function (l) {
        if (l.search[1] === '/') {
          var decoded = l.search
            .slice(1)
            .split('&')
            .map(function (s) {
              return s.replace(/~and~/g, '&');
            })
            .join('?');
          window.history.replaceState(
            null,
            null,
            l.pathname.slice(0, -1) + decoded + l.hash,
          );
        }
      })(window.location);
    </script>
  </head>
  <body>
    <div id="boot">
      <div class="boot-screen">
        <div class="boot-screen__name">sbapiaryy</div>
        <div class="boot-screen__hint">جارٍ التحميل...</div>
      </div>
    </div>

    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>

    <script>
      setTimeout(function () {
        var boot = document.querySelector('.boot-screen');
        if (boot) boot.classList.add('hidden');
        setTimeout(function () {
          var bootEl = document.getElementById('boot');
          if (bootEl) bootEl.remove();
        }, 350);
      }, 800);
    </script>
  </body>
</html>
`;

/* ═══════════════════════════════════════════════════════════════
   16. CSS — إعادة كتابة الأنماط المطلوبة
   ═══════════════════════════════════════════════════════════════ */

// navbar.css — إزالة brand::before
files[
  "src/styles/navbar.css"
] = `/* ═══════════════════════════════════════════════════════════════
   Navbar — مبسّط: الاسم + أيقونة الإشعارات + خروج
   ═══════════════════════════════════════════════════════════════ */

.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  height: var(--navbar-h);
  display: flex;
  align-items: center;
  background: var(--c-navy);
  border-bottom: 1px solid var(--c-navy-2);
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.brand {
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--c-paper);
  letter-spacing: 0.02em;
  transition: opacity 0.15s;
}

.brand:hover { opacity: 0.85; }

/* ═══════════ الأزرار اليمين ═══════════ */

.nav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--c-paper-soft);
  transition: all 0.15s var(--ease);
  background: transparent;
  border: 1px solid transparent;
  font-family: inherit;
  cursor: pointer;
}

.nav-action:hover {
  background: var(--c-navy-2);
  color: var(--c-paper);
}

.nav-action--primary {
  background: var(--c-red);
  color: #fff;
  border-color: var(--c-red);
}

.nav-action--primary:hover {
  background: var(--c-red-soft);
  border-color: var(--c-red-soft);
  color: #fff;
}

.nav-action--danger {
  color: var(--c-red);
  border-color: var(--c-red);
}

.nav-action--danger:hover {
  background: var(--c-red);
  color: #fff;
}

.nav-action--icon {
  padding: 8px;
  min-width: 40px;
  min-height: 40px;
  position: relative;
  color: var(--c-paper-soft);
}

.nav-action--icon svg {
  display: block;
  width: 22px;
  height: 22px;
}

.nav-action--icon:hover {
  color: var(--c-paper);
}

.nav-action__badge {
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--c-red);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  font-family: var(--font-en);
  display: grid;
  place-items: center;
  border: 2px solid var(--c-navy);
}

/* ═══════════ أيقونة القائمة (3 خطوط) ═══════════ */

.nav-action__menu {
  width: 20px;
  height: 14px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.nav-action__menu span {
  display: block;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
}

/* ═══════════ الجوال ═══════════ */

@media (max-width: 900px) {
  .navbar {
    height: calc(var(--navbar-h) + var(--safe-top));
    padding-top: var(--safe-top);
  }

  .brand { font-size: 1.02rem; }

  .nav-action { font-size: 0.82rem; padding: 8px 12px; }

  .nav-action--icon { padding: 8px; min-width: 38px; min-height: 38px; }
}
`;

// footer.css — إزالة footer__brand::before
files[
  "src/styles/footer.css"
] = `/* ═══════════════════════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════════════════════ */

.footer {
  margin-top: 48px;
  background: var(--c-navy);
  color: var(--c-paper);
  border-top: 4px solid var(--c-red);
  padding-block: 32px 24px;
  padding-bottom: calc(24px + var(--safe-bottom));
}

@media (min-width: 900px) {
  .footer { padding-bottom: 24px; }
}

.footer__inner {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .footer__inner { grid-template-columns: 1fr 1fr; }
}

@media (min-width: 900px) {
  .footer__inner { grid-template-columns: 2fr 3fr; gap: 40px; }
}

.footer__brand-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__brand {
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 1.3rem;
  color: var(--c-paper);
}

.footer__tagline {
  font-size: 0.88rem;
  color: var(--c-paper-soft);
  line-height: 1.7;
  max-width: 40ch;
}

.footer__copyright {
  font-size: 0.78rem;
  color: var(--c-paper-muted);
  padding-top: 12px;
  border-top: 1px solid var(--c-navy-2);
  margin-top: 4px;
}

.footer__links-col {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 640px) {
  .footer__links-col { grid-template-columns: repeat(3, 1fr); }
}

.footer__group-title {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--c-red);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer__link {
  font-size: 0.86rem;
  color: var(--c-paper-soft);
  transition: color 0.15s var(--ease);
  line-height: 1.5;
}

.footer__link:hover { color: var(--c-red); }

@media print { .footer { display: none; } }
`;

// login.css — بدون شعار
files[
  "src/styles/login.css"
] = `/* ═══════════════════════════════════════════════════════════════
   Login Page — بدون أيقونة، بدون تبويبات
   ═══════════════════════════════════════════════════════════════ */

.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 20px;
  padding-top: calc(20px + var(--safe-top));
  padding-bottom: calc(20px + var(--safe-bottom));
  background:
    radial-gradient(900px 500px at 20% 0%, rgba(193, 39, 45, 0.08), transparent 60%),
    radial-gradient(700px 400px at 80% 100%, rgba(21, 26, 69, 0.10), transparent 60%),
    var(--c-navy);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--c-white);
  border-radius: var(--radius-xl);
  padding: 36px 28px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--c-line);
  animation: login-slide 0.35s var(--ease);
}

@media (min-width: 640px) {
  .login-card { padding: 44px 36px; }
}

@keyframes login-slide {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.login-field { margin-bottom: 18px; }

.login-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--c-ink-soft);
  margin-bottom: 8px;
}

.login-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--c-line-mid);
  background: var(--c-white);
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--c-ink);
  outline: none;
  transition: border-color 0.15s var(--ease), box-shadow 0.15s var(--ease);
}

.login-input:focus {
  border-color: var(--c-navy);
  box-shadow: 0 0 0 4px rgba(21, 26, 69, 0.08);
}

.login-submit {
  width: 100%;
  padding: 15px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--c-red);
  color: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.15s var(--ease), transform 0.1s;
}

.login-submit:hover:not(:disabled) { background: var(--c-red-soft); }
.login-submit:active:not(:disabled) { transform: scale(0.98); }
.login-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.login-error {
  background: var(--c-red-tint);
  color: #991B1B;
  border: 1px solid #FCA5A5;
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 0.85rem;
  line-height: 1.6;
  margin-bottom: 16px;
}

.login-back {
  text-align: center;
  margin-top: 24px;
  font-size: 0.82rem;
}

.login-back a {
  color: var(--c-ink-muted);
  transition: color 0.15s;
}

.login-back a:hover { color: var(--c-red); }

/* ═══════════ صفحة تغيير كلمة المرور ═══════════ */

.change-password-notice {
  background: var(--c-amber-soft);
  border: 1px solid #FCD34D;
  border-radius: var(--radius-sm);
  padding: 16px;
  margin-bottom: 24px;
  font-size: 0.88rem;
  color: var(--c-amber-text);
  line-height: 1.7;
}

.change-password-notice strong {
  display: block;
  margin-bottom: 6px;
  font-size: 0.95rem;
}
`;

// onboarding.css — بدون شعار
files[
  "src/styles/onboarding.css"
] = `/* ═══════════════════════════════════════════════════════════════
   Onboarding — بدون أيقونات
   ═══════════════════════════════════════════════════════════════ */

.onboarding-backdrop {
  position: fixed;
  inset: 0;
  background: linear-gradient(150deg, var(--c-navy), var(--c-navy-2));
  z-index: 500;
  display: flex;
  flex-direction: column;
  padding: 24px;
  padding-top: calc(24px + var(--safe-top));
  padding-bottom: calc(24px + var(--safe-bottom));
  overflow-y: auto;
  animation: onboarding-in 0.4s var(--ease);
}

@keyframes onboarding-in {
  from { opacity: 0; transform: scale(0.98); }
  to   { opacity: 1; transform: scale(1); }
}

.onboarding-header {
  text-align: center;
  padding: 24px 16px;
  color: #fff;
  flex-shrink: 0;
}

.onboarding-header__title {
  font-size: 1.6rem;
  font-weight: 900;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.onboarding-header__subtitle {
  font-size: 0.95rem;
  color: var(--c-paper-soft);
  max-width: 40ch;
  margin: 0 auto;
  line-height: 1.7;
}

.onboarding-body {
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin-inline: auto;
}

.onboarding-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding-block: 16px;
}

@media (min-width: 640px) {
  .onboarding-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
}

.onboarding-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  padding: 22px 20px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.onboarding-card__title {
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.3;
}

.onboarding-card__desc {
  font-size: 0.86rem;
  color: var(--c-paper-soft);
  line-height: 1.7;
}

.onboarding-footer {
  padding: 20px;
  padding-top: 8px;
  text-align: center;
  flex-shrink: 0;
}

.onboarding-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--c-red);
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-red);
}

.onboarding-cta:hover { background: var(--c-red-soft); transform: translateY(-1px); }
.onboarding-cta:active { transform: scale(0.98); }
`;

// bottom-nav.css — أيقونات SVG سوداء على أبيض
files[
  "src/styles/bottom-nav.css"
] = `/* ═══════════════════════════════════════════════════════════════
   Bottom Navigation — الجوال فقط
   ═══════════════════════════════════════════════════════════════ */

.bottom-nav { display: none; }

@media (max-width: 900px) {
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    inset-inline: 0;
    z-index: 60;
    height: calc(var(--bottom-nav-h) + var(--safe-bottom));
    padding-bottom: var(--safe-bottom);
    background: var(--c-white);
    border-top: 1px solid var(--c-line);
    box-shadow: 0 -2px 12px rgba(21, 26, 69, 0.06);
  }

  .bottom-nav__inner {
    display: flex;
    align-items: stretch;
    justify-content: space-around;
    width: 100%;
    padding-inline: 4px;
  }

  .bottom-nav__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 8px 4px 6px;
    color: var(--c-ink-muted);
    font-size: 0.68rem;
    font-weight: 700;
    text-decoration: none;
    transition: color 0.15s;
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  .bottom-nav__item:active { background: var(--c-off-white); }

  .bottom-nav__item.is-active { color: var(--c-navy); }

  .bottom-nav__item.is-active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 26px;
    height: 2px;
    background: var(--c-navy);
    border-radius: 0 0 3px 3px;
  }

  .bottom-nav__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    color: inherit;
  }

  .bottom-nav__icon svg {
    width: 24px;
    height: 24px;
    display: block;
  }

  .bottom-nav__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    line-height: 1.2;
  }

  .bottom-nav__badge {
    position: absolute;
    top: 4px;
    inset-inline-end: 50%;
    margin-inline-end: -22px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--c-red);
    color: #fff;
    font-size: 0.6rem;
    font-weight: 800;
    font-family: var(--font-en);
    display: grid;
    place-items: center;
    border: 2px solid var(--c-white);
  }

  .app-main {
    padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 8px);
  }
}
`;

// v5.1-fix.css — تصحيحات شاملة للـ padding
files[
  "src/styles/v51-fix.css"
] = `/* ═══════════════════════════════════════════════════════════════
   v5.1 Fix — إصلاحات شاملة
   ═══════════════════════════════════════════════════════════════ */

/* ─── مساحة كافية حول النصوص ─── */

body { padding: 0; }

.section,
.section--tight {
  padding-inline: 0;
}

.hero {
  padding-inline: 0;
}

.section-head {
  padding-inline: 0;
  margin-bottom: 24px;
}

.section-head h1,
.section-head h2,
.page-header h1 {
  padding-inline: 0;
}

/* البطاقات - مساحة داخلية أفضل */
.card {
  padding: 20px;
}

@media (min-width: 640px) {
  .card { padding: 22px; }
}

/* الجداول - مساحة أفقية أفضل */
.table-wrap {
  margin-inline: 0;
}

table.data th,
table.data td {
  padding: 14px 18px;
}

/* الجداول على الجوال - مساحة أفضل */
@media (max-width: 640px) {
  table.data tr {
    padding: 16px;
  }

  table.data td {
    padding: 8px 0;
  }
}

/* الحاويات - تأكيد وجود padding */
.container {
  padding-inline: 18px;
}

@media (min-width: 640px) {
  .container { padding-inline: 24px; }
}

@media (min-width: 1024px) {
  .container { padding-inline: 32px; }
}

/* الـ hero - مساحة أفضل */
.hero h1 {
  padding-inline: 0;
}

/* الصفحات - هوامش من الأعلى */
.app-main > .container > *:first-child {
  margin-top: 8px;
}

/* الـ page header - مساحة أفضل */
.section.section--tight:first-child {
  padding-top: 24px;
}

/* الـ profile - مساحة داخلية أفضل */
.profile {
  padding: 24px;
}

@media (min-width: 640px) {
  .profile { padding: 32px; }
}

/* الـ stat - مساحة أفضل */
.stat {
  padding: 20px 16px;
}

/* الـ empty state - مساحة أفضل */
.empty {
  padding: 48px 24px;
}

/* الـ modal - مساحة أفضل */
.modal__body {
  padding: 24px;
}

.modal__head {
  padding: 18px 24px;
}

.modal__foot {
  padding: 16px 24px;
}

/* الـ toolbar - مساحة أفضل */
.toolbar {
  margin-bottom: 20px;
}

/* الـ chips - مساحة أفضل على الجوال */
@media (max-width: 640px) {
  .chips {
    margin-inline: -18px;
    padding-inline: 18px;
  }
}

/* الـ avatar في sidebar - أفضل */
.sidebar__avatar {
  border-radius: 50%;
}

/* ─── إزالة كل الأنماط التي فيها حرف S ─── */

.brand::before,
.footer__brand::before,
.boot-screen__logo,
.login__logo,
.onboarding-header__logo,
.login__title,
.login__desc,
.login__tabs,
.login__tab,
.login__hint,
.login__hint-title,
.login__hint-row,
.login__hint-user,
.login__hint-pass,
.pwa-install-banner__icon,
.sidebar__icon,
.onboarding-card__icon,
.login-forgot,
.change-password-notice + * {
  /* لا شيء - كل هذه الأنماط القديمة أُزيلت من JSX */
}

/* الـ nav-action__icon القديم */
.nav-action__icon {
  display: none;
}

/* ─── الحواف على الجوال ─── */

@media (max-width: 640px) {
  h1 { font-size: 1.55rem; line-height: 1.25; padding-inline: 0; }
  h2 { font-size: 1.2rem; padding-inline: 0; }
  h3 { font-size: 1rem; padding-inline: 0; }
  p  { padding-inline: 0; }

  .hero__desc {
    font-size: 0.95rem;
    line-height: 1.75;
  }

  .section-head__desc {
    font-size: 0.85rem;
  }
}

/* ─── ألوان موحدة للأيقونات ─── */

.bottom-nav__item svg {
  transition: color 0.15s;
}

.bottom-nav__item.is-active svg {
  color: var(--c-navy);
}

.bottom-nav__item:not(.is-active) svg {
  color: var(--c-ink-muted);
}

.nav-action--icon svg {
  color: inherit;
}

.nav-action--icon svg:hover {
  color: var(--c-paper);
}

/* ─── إزالة أيقونة القائمة القديمة ─── */

.sidebar-close {
  display: none !important;
}

@media (max-width: 900px) {
  .sidebar-close {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--c-off-white);
    color: var(--c-ink);
    font-size: 1.2rem;
    cursor: pointer;
    margin-inline-start: auto;
    margin-bottom: 20px;
    border: 1px solid var(--c-line);
    font-family: inherit;
  }
}

/* ─── الفوتر - إزالة أيقونة S ─── */

.footer__brand::before {
  content: none !important;
  display: none !important;
}

/* ─── الـ Brand - بدون أيقونة ─── */

.brand::before {
  content: none !important;
  display: none !important;
}
`;

// استيراد ملفات CSS الجديدة
files["src/styles/global.css"] = `/* APIARY v5.1 — Global CSS */

@import './tokens.css';
@import './base.css';
@import './layout.css';
@import './navbar.css';
@import './bottom-nav.css';
@import './sidebar.css';
@import './cards.css';
@import './badges.css';
@import './buttons.css';
@import './tables.css';
@import './forms.css';
@import './modal.css';
@import './toast.css';
@import './notifications.css';
@import './footer.css';
@import './profile.css';
@import './login.css';
@import './onboarding.css';
@import './calendar.css';
@import './chat.css';
@import './states.css';
@import './timeline.css';
@import './approvals.css';
@import './print.css';
@import './v51-fix.css';
`;

/* ═══════════════════════════════════════════════════════════════
   WRITE + GIT
   ═══════════════════════════════════════════════════════════════ */

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit", cwd: ROOT, shell: true });
    return true;
  } catch {
    return false;
  }
}

console.log("");
console.log("  ═══════════════════════════════════════════════════");
console.log("  fix.cjs v5 — أيقونات + لجان + CSS");
console.log("  ═══════════════════════════════════════════════════");
console.log("");

let written = 0;
for (const [rel, content] of Object.entries(files)) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
  console.log("  ✓ " + rel);
  written += 1;
}

console.log("");
console.log("  Files written: " + written);
console.log("");

if (!fs.existsSync(path.join(ROOT, ".git"))) {
  console.log("  ⚠️  لا يوجد .git — شغّل git init يدويًا");
  process.exit(0);
}

console.log("  📦 Git add...");
run("git add .");

console.log("  💾 Git commit...");
const committed = run(
  'git commit -m "feat: SVG icons + dynamic committees + CSS overhaul"'
);

if (!committed) {
  console.log("  ℹ️  لا تغييرات جديدة للـ commit");
}

console.log("  🚀 Git push...");
const pushed = run("git push origin main --force");

console.log("");
if (pushed) {
  console.log("  ═══════════════════════════════════════════════════");
  console.log("  ✅ تم! GitHub Actions سيبدأ البناء الآن");
  console.log("  ═══════════════════════════════════════════════════");
  console.log("");
  console.log("  راقب: https://github.com/hazimshendy-stack/ngg/actions");
} else {
  console.log("  ❌ فشل الـ push. جرّب:");
  console.log("    git push origin main --force");
}
console.log("");
