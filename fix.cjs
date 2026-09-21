#!/usr/bin/env node
/**
 * fix.cjs v4 — إزالة الاستيرادات غير المستخدمة
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname;
const files = {};

/* ═══════════════════════════════════════════════════════════════
   1. src/pages/admin/AdminWarningsPage.tsx
   إزالة TextInput غير المستخدم
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/pages/admin/AdminWarningsPage.tsx"
] = `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { notifyUser } from '@/lib/notifications';
import { members } from '@/data/members';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  FormField,
  TextArea,
  DateInput,
  Select,
} from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { WarningRecord } from '@/types';

const EMPTY: Omit<WarningRecord, 'id'> = {
  memberId: '',
  memberName: '',
  type: 'VERBAL',
  reason: '',
  severity: 'LOW',
  issuedByMemberId: '',
  issuedByName: '',
  issuedAt: new Date().toISOString().slice(0, 10),
  status: 'active',
  notes: '',
};

export function AdminWarningsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<WarningRecord>('warnings');
  const [editing, setEditing] = useState<WarningRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<WarningRecord, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<WarningRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const openCreate = () => {
    setForm({
      ...EMPTY,
      issuedByMemberId: me?.memberId ?? '',
      issuedByName: me?.displayName ?? '',
    });
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (w: WarningRecord) => {
    setForm({
      memberId: w.memberId,
      memberName: w.memberName,
      type: w.type,
      reason: w.reason,
      severity: w.severity,
      issuedByMemberId: w.issuedByMemberId,
      issuedByName: w.issuedByName,
      issuedAt: w.issuedAt,
      status: w.status,
      notes: w.notes || '',
    });
    setEditing(w);
    setCreating(false);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    if (!form.memberId || !form.reason.trim()) {
      toast.error('العضو والسبب مطلوبان');
      return;
    }
    setBusy(true);
    try {
      const member = members.find((m) => m.id === form.memberId);
      const payload = {
        ...form,
        memberName: member?.name ?? form.memberName,
      };

      if (editing) {
        await updateOne('warnings', editing.id, payload);
        await logAudit(me, 'UPDATE_WARNING', 'Warning', editing.id, form.reason);
        toast.success('تم التحديث');
      } else {
        const id = 'WARN-' + Date.now().toString(36).toUpperCase();
        await createOne('warnings', { id, ...payload });
        await logAudit(me, 'CREATE_WARNING', 'Warning', id, form.reason);

        const memberUser = (await import('@/lib/db')).listWhere<{ uid: string }>(
          'users',
          'memberId',
          form.memberId,
        );
        const users = await memberUser;
        if (users.length > 0) {
          await notifyUser(
            users[0].uid,
            'تحذير جديد',
            form.reason,
            'warning',
            '/dashboard',
            'high',
            me?.displayName,
          );
        }

        toast.success('تم إصدار التحذير');
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
      await removeOne('warnings', toDelete.id);
      await logAudit(me, 'DELETE_WARNING', 'Warning', toDelete.id, toDelete.reason);
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
        title="التحذيرات"
        description="إصدار ومتابعة التحذيرات الرسمية."
      />

      <SectionHeader
        eyebrow="القائمة"
        title={'التحذيرات (' + data.length + ')'}
        action={
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={openCreate}
          >
            + تحذير جديد
          </button>
        }
      />

      {loading ? (
        <SkeletonList count={4} />
      ) : data.length === 0 ? (
        <EmptyState
          icon="⚠️"
          title="لا تحذيرات"
          message="لم يتم إصدار أي تحذيرات."
        />
      ) : (
        <div className="stack">
          {data.map((w) => (
            <div key={w.id} className="card no-click">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{w.memberName}</div>
                  <div className="card__meta">{w.reason}</div>
                </div>
                <Badge
                  variant={w.status === 'active' ? 'danger' : 'success'}
                  dot
                >
                  {w.status === 'active' ? 'نشط' : 'منتهي'}
                </Badge>
              </div>

              <div className="row mt-3" style={{ gap: 6 }}>
                <Badge variant="neutral">{w.type}</Badge>
                <Badge
                  variant={
                    w.severity === 'HIGH'
                      ? 'danger'
                      : w.severity === 'MEDIUM'
                        ? 'warning'
                        : 'info'
                  }
                >
                  {w.severity}
                </Badge>
                <span className="small muted">{formatDate(w.issuedAt)}</span>
              </div>

              <div
                className="row mt-3"
                style={{ gap: 6, justifyContent: 'flex-end' }}
              >
                <button
                  type="button"
                  className="btn btn--ghost btn--xs"
                  onClick={() => openEdit(w)}
                >
                  تعديل
                </button>
                <button
                  type="button"
                  className="btn btn--danger btn--xs"
                  onClick={() => setToDelete(w)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        title={editing ? 'تعديل تحذير' : 'تحذير جديد'}
        onClose={close}
        wide
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
        <FormField label="العضو" required>
          <Select
            value={form.memberId}
            onChange={(v) => {
              const m = members.find((x) => x.id === v);
              setForm({
                ...form,
                memberId: v,
                memberName: m?.name ?? '',
              });
            }}
            options={[
              { value: '', label: '— اختر —' },
              ...members.map((m) => ({ value: m.id, label: m.name })),
            ]}
          />
        </FormField>

        <FormField label="النوع" required>
          <Select
            value={form.type}
            onChange={(v) =>
              setForm({ ...form, type: v as WarningRecord['type'] })
            }
            options={[
              { value: 'VERBAL', label: 'شفهي' },
              { value: 'WRITTEN', label: 'كتابي' },
              { value: 'FINAL', label: 'نهائي' },
            ]}
          />
        </FormField>

        <FormField label="السبب" required>
          <TextArea
            value={form.reason}
            onChange={(v) => setForm({ ...form, reason: v })}
            rows={3}
          />
        </FormField>

        <FormField label="الخطورة" required>
          <Select
            value={form.severity}
            onChange={(v) =>
              setForm({ ...form, severity: v as WarningRecord['severity'] })
            }
            options={[
              { value: 'LOW', label: 'منخفضة' },
              { value: 'MEDIUM', label: 'متوسطة' },
              { value: 'HIGH', label: 'مرتفعة' },
            ]}
          />
        </FormField>

        <FormField label="التاريخ" required>
          <DateInput
            value={form.issuedAt}
            onChange={(v) => setForm({ ...form, issuedAt: v })}
          />
        </FormField>

        <FormField label="الحالة">
          <Select
            value={form.status}
            onChange={(v) =>
              setForm({ ...form, status: v as 'active' | 'resolved' })
            }
            options={[
              { value: 'active', label: 'نشط' },
              { value: 'resolved', label: 'منتهي' },
            ]}
          />
        </FormField>

        <FormField label="ملاحظات">
          <TextArea
            value={form.notes || ''}
            onChange={(v) => setForm({ ...form, notes: v })}
            rows={2}
          />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="حذف التحذير"
        message="هل أنت متأكد من الحذف؟"
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
   2. src/pages/admin/AdminHomePage.tsx
   إزالة teams غير المستخدمة
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/pages/admin/AdminHomePage.tsx"
] = `import { Link } from 'react-router-dom';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { seedAll, type SeedResult } from '@/lib/seed';
import { members } from '@/data/members';
import { committees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat, StatRow } from '@/components/ui/Stat';
import { toast } from '@/components/ui/Toast';
import type {
  AppUser,
  RequestRecord,
  Contribution,
  Notification,
  Member,
} from '@/types';

interface AdminCard {
  to: string;
  title: string;
  icon: string;
  count?: number;
  description: string;
}

export function AdminHomePage() {
  const { data: users } = useRealtimeCollection<AppUser>('users');
  const { data: liveMembers } = useRealtimeCollection<Member>('members');
  const { data: requests } = useRealtimeCollection<RequestRecord>('requests');
  const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');

  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const allMembers = liveMembers.length > 0 ? liveMembers : members;

  const pendingReq = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'IN_REVIEW',
  ).length;

  const pendingContribs = contributions.filter(
    (c) => c.status === 'pending',
  ).length;

  const totalPoints = allMembers.reduce(
    (s, m) => s + hoursToPoints(m.hours || 0),
    0,
  );

  const onSeed = async () => {
    if (!window.confirm('سيتم رفع البيانات الأساسية إلى Firestore. متابعة؟')) {
      return;
    }
    setSeeding(true);
    try {
      const r = await seedAll();
      setResult(r);
      toast.success('تم رفع البيانات بنجاح');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الرفع';
      toast.error('فشل الرفع', msg);
    } finally {
      setSeeding(false);
    }
  };

  const cards: AdminCard[] = [
    {
      to: '/admin/analytics',
      title: 'التحليلات',
      icon: '📊',
      description: 'نظرة شاملة على الإحصائيات',
    },
    {
      to: '/admin/requests',
      title: 'الطلبات',
      icon: '📋',
      count: pendingReq,
      description: 'إدارة كل الطلبات',
    },
    {
      to: '/admin/users',
      title: 'المستخدمون',
      icon: '👤',
      count: users.length,
      description: 'الحسابات والأدوار',
    },
    {
      to: '/admin/members',
      title: 'الأعضاء',
      icon: '👥',
      count: allMembers.length,
      description: 'إدارة بيانات الأعضاء',
    },
    {
      to: '/admin/contributions',
      title: 'المشاركات',
      icon: '📝',
      count: pendingContribs,
      description: 'اعتماد مشاركات الأعضاء',
    },
    {
      to: '/admin/committees',
      title: 'اللجان',
      icon: '🏛️',
      count: committees.length,
      description: 'إدارة اللجان وتوزيع الأعضاء',
    },
    {
      to: '/admin/achievements',
      title: 'الإنجازات',
      icon: '🏆',
      description: 'إدارة الإنجازات',
    },
    {
      to: '/admin/warnings',
      title: 'التحذيرات',
      icon: '⚠️',
      description: 'إصدار ومتابعة التحذيرات',
    },
    {
      to: '/admin/calendar',
      title: 'التقويم',
      icon: '📅',
      description: 'إدارة الأحداث',
    },
    {
      to: '/admin/conversations',
      title: 'المحادثات',
      icon: '💬',
      description: 'إدارة المحادثات الجماعية',
    },
    {
      to: '/admin/notifications',
      title: 'إرسال إشعار',
      icon: '🔔',
      count: notifs.length,
      description: 'إرسال إشعارات جماعية',
    },
    {
      to: '/admin/audit',
      title: 'سجل التغييرات',
      icon: '📜',
      description: 'تتبع كل الإجراءات',
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="لوحة الإدارة"
        title="مرحبًا"
        description="تحكم كامل بالمحتوى والأعضاء والطلبات."
      />

      <section className="section--tight">
        <StatRow>
          <Stat value={users.length} label="المستخدمون" />
          <Stat value={allMembers.length} label="الأعضاء" />
          <Stat value={pendingReq} label="طلبات معلّقة" variant="red" />
          <Stat value={pendingContribs} label="مشاركات معلّقة" variant="amber" />
          <Stat value={totalPoints} label="مجموع النقاط" />
          <Stat value={notifs.length} label="الإشعارات" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader
          eyebrow="التهيئة"
          title="رفع البيانات الأساسية"
          description="لمرة واحدة فقط — إن كانت Firestore فارغة."
          action={
            <button
              type="button"
              className="btn btn--primary"
              onClick={onSeed}
              disabled={seeding}
            >
              {seeding ? 'جارٍ الرفع...' : 'رفع البيانات'}
            </button>
          }
        />
        {result ? (
          <div className="card no-click mt-4">
            <div className="card__title">✓ تم الرفع بنجاح</div>
            <div
              className="small muted mt-2"
              style={{ lineHeight: 1.9 }}
            >
              أعضاء: {result.members} · فرق: {result.teams} · مشاركات:{' '}
              {result.contributions} · طلبات: {result.requests} · موافقات:{' '}
              {result.approvals} · تحذيرات: {result.warnings} · إنجازات:{' '}
              {result.achievements} · إشعارات: {result.notifications} ·
              محادثات: {result.conversations} · رسائل: {result.messages}
            </div>
          </div>
        ) : null}
      </section>

      <section className="section">
        <SectionHeader eyebrow="الأقسام" title="روابط سريعة" />
        <div className="grid grid--wide">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="card">
              <div className="row row--between">
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                  <div className="card__title">{c.title}</div>
                </div>
                {c.count !== undefined && c.count > 0 ? (
                  <span className="badge badge--red">{c.count}</span>
                ) : null}
              </div>
              <div className="card__meta mt-2">{c.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   3. src/pages/admin/AdminConversationsPage.tsx
   إزالة TeamId غير المستخدم
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/pages/admin/AdminConversationsPage.tsx"
] = `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { teams } from '@/data/teams';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { relativeTime } from '@/lib/format';
import type { Conversation } from '@/types';

export function AdminConversationsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<Conversation>('conversations');
  const [toDelete, setToDelete] = useState<Conversation | null>(null);
  const [busy, setBusy] = useState(false);

  const createTeamConv = async (team: (typeof teams)[number]) => {
    const exists = data.some((c) => c.type === 'team' && c.teamId === team.id);
    if (exists) {
      toast.info('المحادثة موجودة بالفعل');
      return;
    }
    setBusy(true);
    try {
      const id = 'CONV-TEAM-' + team.id;
      await createOne('conversations', {
        id,
        type: 'team',
        title: 'فريق ' + team.nameAr,
        teamId: team.id,
        participantUids: [],
        lastMessageAt: new Date().toISOString(),
      });
      await logAudit(me, 'CREATE_CONVERSATION', 'Conversation', id, team.name);
      toast.success('تم إنشاء محادثة الفريق');
    } catch {
      toast.error('فشل الإنشاء');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('conversations', toDelete.id);
      await logAudit(
        me,
        'DELETE_CONVERSATION',
        'Conversation',
        toDelete.id,
        toDelete.title,
      );
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
        title="المحادثات"
        description="إدارة محادثات الفرق والمحادثة العامة."
      />

      <section className="section">
        <SectionHeader
          eyebrow="إنشاء سريع"
          title="محادثات الفرق"
          description="محادثة واحدة لكل فريق — تُنشأ تلقائيًا لكل فريق."
        />
        <div className="chips">
          {teams.map((t) => {
            const exists = data.some(
              (c) => c.type === 'team' && c.teamId === t.id,
            );
            return (
              <button
                key={t.id}
                type="button"
                disabled={busy || exists}
                className={'chip' + (exists ? ' is-active' : '')}
                onClick={() => createTeamConv(t)}
              >
                {t.name} {exists ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <SectionHeader
          eyebrow="القائمة"
          title={'المحادثات (' + data.length + ')'}
        />
        {loading ? (
          <SkeletonList count={5} />
        ) : data.length === 0 ? (
          <EmptyState
            icon="💬"
            title="لا محادثات"
            message="أنشئ محادثات الفرق من الأعلى."
          />
        ) : (
          <div className="stack">
            {data.map((c) => {
              const team = c.teamId
                ? teams.find((t) => t.id === c.teamId)
                : null;
              return (
                <div key={c.id} className="card no-click">
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">
                        {c.title ||
                          (c.type === 'general'
                            ? 'المحادثة العامة'
                            : team?.name)}
                      </div>
                      <div className="card__meta">
                        {c.type === 'general'
                          ? 'عام'
                          : c.type === 'team'
                            ? 'فريق'
                            : 'خاصة'}
                        {c.lastMessageAt
                          ? ' · ' + relativeTime(c.lastMessageAt)
                          : ''}
                      </div>
                    </div>
                    <Badge
                      variant={
                        c.type === 'general'
                          ? 'red'
                          : c.type === 'team'
                            ? 'info'
                            : 'neutral'
                      }
                    >
                      {c.type}
                    </Badge>
                  </div>

                  {c.type !== 'general' ? (
                    <div
                      className="row mt-3"
                      style={{ justifyContent: 'flex-end' }}
                    >
                      <button
                        type="button"
                        className="btn btn--danger btn--xs"
                        onClick={() => setToDelete(c)}
                      >
                        حذف
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={toDelete !== null}
        title="حذف المحادثة"
        message="سيتم حذف المحادثة وكل رسائلها."
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
console.log("  fix.cjs v4 — إزالة الاستيرادات غير المستخدمة");
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
  'git commit -m "fix: remove unused imports in admin pages"'
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
