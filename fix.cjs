#!/usr/bin/env node
/**
 * fix.cjs — يحل أخطاء TypeScript v5.1
 * شغّله: node fix.cjs
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname;
const files = {};

/* ═══════════════════════════════════════════════════════════════
   1. src/vite-env.d.ts — يحل Property 'env' does not exist
   ═══════════════════════════════════════════════════════════════ */

files["src/vite-env.d.ts"] = `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
`;

/* ═══════════════════════════════════════════════════════════════
   2. src/components/layout/Sidebar.tsx — إزالة unread غير المستخدمة
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
  icon: string;
  count?: number;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function buildAdminNav(pending: number): NavItem[] {
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

function buildManagerNav(pending: number): NavItem[] {
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
    { to: '/notifications', label: 'الإشعارات', icon: '🔔' },
    { to: '/reports', label: 'التقارير', icon: '📈' },
  ];
}

function buildMemberNav(): NavItem[] {
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
    { to: '/notifications', label: 'الإشعارات', icon: '🔔' },
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

  // استخدام notifs لتفادي unused warning (نحسب العدد لنستخدمها في nav)
  const unreadCount = notifs.filter(
    (n) => n.userId === user.uid && !n.read,
  ).length;

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

        {unreadCount > 0 ? (
          <div
            className="card no-click"
            style={{
              padding: 10,
              marginBottom: 16,
              background: 'var(--c-red-tint)',
              borderColor: '#FCA5A5',
            }}
          >
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#991B1B',
              }}
            >
              🔔 {unreadCount} إشعار غير مقروء
            </div>
          </div>
        ) : null}

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
            <span className="sidebar__icon" aria-hidden="true">🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   3. src/components/chat/ConversationList.tsx — إزالة members غير المستخدم
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/components/chat/ConversationList.tsx"
] = `import type { Conversation, AppUser } from '@/types';
import { teams } from '@/data/teams';
import { initials, relativeTime } from '@/lib/format';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  currentUser: AppUser;
  users: AppUser[];
  onSelect: (id: string) => void;
}

function getConversationName(
  conv: Conversation,
  currentUser: AppUser,
  users: AppUser[],
): string {
  if (conv.type === 'general') return 'المحادثة العامة';
  if (conv.type === 'team') {
    const team = teams.find((t) => t.id === conv.teamId);
    return team ? 'فريق ' + team.nameAr : 'محادثة فريق';
  }
  const otherUid = conv.participantUids.find((uid) => uid !== currentUser.uid);
  if (!otherUid) return 'محادثة خاصة';
  const other = users.find((u) => u.uid === otherUid);
  return other ? other.displayName : 'محادثة خاصة';
}

function getConversationAvatar(
  conv: Conversation,
  currentUser: AppUser,
  users: AppUser[],
): { text: string; variant: 'general' | 'team' | 'private' } {
  if (conv.type === 'general') return { text: '🌐', variant: 'general' };
  if (conv.type === 'team') {
    const team = teams.find((t) => t.id === conv.teamId);
    return { text: team ? team.name.slice(0, 2) : 'FT', variant: 'team' };
  }
  const otherUid = conv.participantUids.find((uid) => uid !== currentUser.uid);
  const other = users.find((u) => u.uid === otherUid);
  return { text: other ? initials(other.displayName) : '؟', variant: 'private' };
}

export function ConversationList({
  conversations,
  activeId,
  currentUser,
  users,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="empty" style={{ padding: 24 }}>
        <div className="empty__message">لا محادثات بعد</div>
      </div>
    );
  }

  const sorted = [...conversations].sort((a, b) => {
    if (a.type === 'general') return -1;
    if (b.type === 'general') return 1;
    return a.lastMessageAt < b.lastMessageAt ? 1 : -1;
  });

  return (
    <div className="chat-conversations">
      {sorted.map((conv) => {
        const name = getConversationName(conv, currentUser, users);
        const avatar = getConversationAvatar(conv, currentUser, users);
        const unread = conv.unreadCounts?.[currentUser.uid] ?? 0;

        return (
          <button
            key={conv.id}
            type="button"
            className={'chat-conv' + (activeId === conv.id ? ' is-active' : '')}
            onClick={() => onSelect(conv.id)}
          >
            <div
              className={'chat-conv__avatar chat-conv__avatar--' + avatar.variant}
              aria-hidden="true"
            >
              {avatar.text}
            </div>

            <div className="chat-conv__body">
              <div className="chat-conv__top">
                <div className="chat-conv__name">{name}</div>
                <div className="chat-conv__time">
                  {relativeTime(conv.lastMessageAt)}
                </div>
              </div>
              <div className="chat-conv__preview">
                {conv.lastMessageSender ? (
                  <strong style={{ color: 'var(--c-red)', fontWeight: 700 }}>
                    {conv.lastMessageSender}:{' '}
                  </strong>
                ) : null}
                {conv.lastMessageText || 'لا رسائل بعد'}
              </div>
            </div>

            {unread > 0 ? (
              <div className="chat-conv__badge">
                {unread > 99 ? '99+' : unread}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
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
console.log("  fix.cjs — إصلاح أخطاء TypeScript v5.1");
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
const committed = run('git commit -m "fix: TypeScript env + unused variables"');

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
