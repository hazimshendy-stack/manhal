#!/usr/bin/env node
/**
 * fix.cjs v6 — إزالة آخر استيرادات غير مستخدمة
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname;
const files = {};

/* ═══════════════════════════════════════════════════════════════
   1. src/components/layout/Sidebar.tsx
   إزالة Notification غير المستخدمة
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
`;

/* ═══════════════════════════════════════════════════════════════
   2. src/pages/admin/AdminCommitteesPage.tsx
   إزالة teams غير المستخدمة
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/pages/admin/AdminCommitteesPage.tsx"
] = `import { useMemo, useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
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

                <div
                  className="row mt-4"
                  style={{ gap: 6, justifyContent: 'flex-end' }}
                >
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
console.log("  fix.cjs v6 — إزالة آخر استيرادات");
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
const committed = run('git commit -m "fix: remove last unused imports"');

if (!committed) {
  console.log("  ℹ️  لا تغييرات جديدة للـ commit");
}

console.log("  🚀 Git push...");
const pushed = run("git push origin main --force");

console.log("");
if (pushed) {
  console.log("  ═══════════════════════════════════════════════════");
  console.log("  ✅ تم! GitHub Actions سيبدأ البناء");
  console.log("  ═══════════════════════════════════════════════════");
  console.log("");
  console.log("  راقب: https://github.com/hazimshendy-stack/ngg/actions");
} else {
  console.log("  ❌ فشل الـ push. جرّب:");
  console.log("    git push origin main --force");
}
console.log("");
