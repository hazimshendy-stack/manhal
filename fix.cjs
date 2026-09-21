#!/usr/bin/env node
/**
 * fix.cjs v3 — إصلاح شامل
 * - Add labels to format.ts
 * - Remove unused imports
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname;
const files = {};

/* ═══════════════════════════════════════════════════════════════
   1. src/lib/format.ts — إضافة التسميات (Labels)
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/lib/format.ts"
] = `export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatShortDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' });
}

export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ar-EG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

export function relativeTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return 'قبل ' + mins + ' دقيقة';
  if (hrs < 24) return 'قبل ' + hrs + ' ساعة';
  if (days < 30) return 'قبل ' + days + ' يوم';
  return formatDate(iso);
}

export function initials(name: string): string {
  const trimmed = name.trim();
  const parts: string[] = [];
  let current = '';
  for (let i = 0; i < trimmed.length; i += 1) {
    const c = trimmed[i];
    if (c === ' ') {
      if (current.length > 0) {
        parts.push(current);
        current = '';
      }
    } else {
      current += c;
    }
  }
  if (current.length > 0) parts.push(current);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]).trim();
}

export function hoursToPoints(hours: number): number {
  return Math.round(hours * 5);
}

export function truncate(text: string, len = 90): string {
  return text.length <= len ? text : text.slice(0, len) + '...';
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ═══════════ Arabic Month Helpers ═══════════ */

const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export function getArabicMonth(month: number): string {
  return AR_MONTHS[month];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/* ═══════════ Request / Status / Priority Labels ═══════════ */

export const REQUEST_TYPE_LABEL: Record<string, string> = {
  TRANSFER: 'نقل',
  PROMOTION: 'ترقية',
  RESIGNATION: 'استقالة',
  COMPLAINT: 'شكوى',
  SUGGESTION: 'اقتراح',
  LEAVE: 'إجازة',
};

export const REQUEST_STATUS_LABEL: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  IN_REVIEW: 'قيد المراجعة',
  APPROVED: 'معتمد',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغى',
  COMPLETED: 'مكتمل',
};

export const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'منخفضة',
  NORMAL: 'عادية',
  HIGH: 'مرتفعة',
  URGENT: 'عاجلة',
};

export const APPROVAL_STATUS_LABEL: Record<string, string> = {
  PENDING: 'بانتظار الموافقة',
  APPROVED: 'موافق عليه',
  REJECTED: 'مرفوض',
  SKIPPED: 'تم تخطيه',
};
`;

/* ═══════════════════════════════════════════════════════════════
   2. src/pages/RequestDetailPage.tsx — إزالة Link غير المستخدم
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/pages/RequestDetailPage.tsx"
] = `import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOne, listWhere } from '@/lib/db';
import { useAuth } from '@/lib/useAuth';
import { canApproveStep } from '@/lib/permissions';
import { approveStep, rejectStep } from '@/lib/approvals';
import { teams } from '@/data/teams';
import {
  REQUEST_TYPE_LABEL,
  REQUEST_STATUS_LABEL,
  PRIORITY_LABEL,
  formatDate,
} from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Modal } from '@/components/ui/Modal';
import { FormField, TextArea } from '@/components/ui/FormField';
import { ApprovalChain } from '@/components/request/ApprovalChain';
import { Loading } from '@/components/ui/Loading';
import { NotFoundPage } from './NotFoundPage';
import { toast } from '@/components/ui/Toast';
import type { RequestRecord, ApprovalStep } from '@/types';

export function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestRecord | null>(null);
  const [steps, setSteps] = useState<ApprovalStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!requestId) return;
    setLoading(true);
    const r = await getOne<RequestRecord>('requests', requestId);
    if (r) {
      const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', r.id);
      setSteps(allSteps.sort((a, b) => a.order - b.order));
    }
    setRequest(r);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [requestId]);

  if (loading) return <Loading fullHeight />;
  if (!request) return <NotFoundPage />;

  const currentStep = steps.find(
    (s) => s.status === 'PENDING' && s.order === request.currentStepOrder,
  );
  const canAct = user && currentStep && canApproveStep(user, currentStep);

  const fromTeam = request.fromTeamId
    ? teams.find((t) => t.id === request.fromTeamId)
    : null;
  const toTeam = request.toTeamId
    ? teams.find((t) => t.id === request.toTeamId)
    : null;

  const doAction = async () => {
    if (!user || !currentStep || !actionType) return;
    setBusy(true);
    try {
      if (actionType === 'approve') {
        await approveStep(request, currentStep, user);
        toast.success('تمت الموافقة');
      } else {
        if (!comment.trim()) {
          toast.error('سبب الرفض مطلوب');
          setBusy(false);
          return;
        }
        await rejectStep(request, currentStep, user, comment);
        toast.success('تم رفض الطلب');
      }
      setActionType(null);
      setComment('');
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الإجراء';
      toast.error('فشل الإجراء', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <PageHeader eyebrow="الطلب" title={request.title} />

      <section className="section">
        <div className="grid grid--2">
          <div className="card no-click">
            <div className="kv">
              <span className="kv__k">النوع</span>
              <span className="kv__v">
                {REQUEST_TYPE_LABEL[request.type]}
              </span>
            </div>
            <div className="kv mt-4">
              <span className="kv__k">مقدم الطلب</span>
              <span className="kv__v">{request.requesterName}</span>
            </div>
            <div className="kv mt-4">
              <span className="kv__k">التاريخ</span>
              <span className="kv__v">{formatDate(request.submittedAt)}</span>
            </div>
            {fromTeam ? (
              <div className="kv mt-4">
                <span className="kv__k">من فريق</span>
                <span className="kv__v">{fromTeam.name}</span>
              </div>
            ) : null}
            {toTeam ? (
              <div className="kv mt-4">
                <span className="kv__k">إلى فريق</span>
                <span className="kv__v">{toTeam.name}</span>
              </div>
            ) : null}
          </div>

          <div className="card no-click">
            <div className="row row--between">
              <span className="muted small">الحالة</span>
              <Badge
                variant={
                  request.status === 'APPROVED'
                    ? 'success'
                    : request.status === 'REJECTED'
                      ? 'danger'
                      : 'warning'
                }
              >
                {REQUEST_STATUS_LABEL[request.status]}
              </Badge>
            </div>
            <div className="row row--between mt-4">
              <span className="muted small">الأولوية</span>
              <Badge variant="neutral">{PRIORITY_LABEL[request.priority]}</Badge>
            </div>
            <div className="row row--between mt-4">
              <span className="muted small">المرحلة الحالية</span>
              <span className="kv__v">
                {request.currentStepOrder} من {steps.length}
              </span>
            </div>
            <div className="mt-5">
              <div className="muted small">الوصف</div>
              <p className="mt-2" style={{ lineHeight: 1.8 }}>
                {request.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {canAct ? (
        <section className="section">
          <SectionHeader eyebrow="قرارك" title="الإجراء المطلوب منك" />
          <div className="card no-click">
            <p className="muted small mb-4">
              أنت مخوّل باتخاذ القرار في هذه المرحلة.
            </p>
            <div className="row" style={{ gap: 10 }}>
              <button
                type="button"
                className="btn btn--success"
                onClick={() => setActionType('approve')}
              >
                موافقة
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => setActionType('reject')}
              >
                رفض
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <SectionHeader eyebrow="سلسلة الموافقات" title="الموافقات" />
        <ApprovalChain steps={steps} />
      </section>

      <Modal
        open={actionType !== null}
        title={actionType === 'approve' ? 'موافقة على الطلب' : 'رفض الطلب'}
        onClose={() => {
          setActionType(null);
          setComment('');
        }}
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setActionType(null);
                setComment('');
              }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className={
                'btn ' +
                (actionType === 'approve' ? 'btn--success' : 'btn--danger')
              }
              onClick={doAction}
              disabled={busy}
            >
              {busy
                ? '...'
                : actionType === 'approve'
                  ? 'تأكيد الموافقة'
                  : 'تأكيد الرفض'}
            </button>
          </>
        }
      >
        <FormField
          label={actionType === 'approve' ? 'تعليق (اختياري)' : 'سبب الرفض'}
          required={actionType === 'reject'}
        >
          <TextArea
            value={comment}
            onChange={setComment}
            placeholder={
              actionType === 'approve'
                ? 'ملاحظات إضافية...'
                : 'اشرح سبب الرفض'
            }
            rows={3}
          />
        </FormField>
      </Modal>
    </div>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   3. src/pages/SearchPage.tsx — إزالة Avatar غير المستخدم
   ═══════════════════════════════════════════════════════════════ */

files["src/pages/SearchPage.tsx"] = `import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import type { Member, Contribution, Achievement, CalendarEvent } from '@/types';

interface SearchResult {
  id: string;
  type: 'member' | 'contribution' | 'achievement' | 'event' | 'team' | 'committee';
  title: string;
  subtitle?: string;
  route: string;
  icon: string;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: members } = useRealtimeCollection<Member>('members');
  const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
  const { data: achievements } = useRealtimeCollection<Achievement>('achievements');
  const { data: events } = useRealtimeCollection<CalendarEvent>('calendar');

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const out: SearchResult[] = [];

    members.forEach((m) => {
      if (m.name.toLowerCase().includes(q)) {
        out.push({
          id: m.id,
          type: 'member',
          title: m.name,
          subtitle: m.bio?.slice(0, 80),
          route: '/members/' + m.id,
          icon: '👤',
        });
      }
    });

    contributions.forEach((c) => {
      if (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      ) {
        out.push({
          id: c.id,
          type: 'contribution',
          title: c.title,
          subtitle: c.memberName + ' · ' + c.hours + ' ساعة',
          route: '/contributions/' + c.id,
          icon: '📝',
        });
      }
    });

    achievements.forEach((a) => {
      if (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      ) {
        out.push({
          id: a.id,
          type: 'achievement',
          title: a.title,
          subtitle: a.description.slice(0, 80),
          route: '/achievements',
          icon: '🏆',
        });
      }
    });

    events.forEach((e) => {
      if (e.title.toLowerCase().includes(q)) {
        out.push({
          id: e.id,
          type: 'event',
          title: e.title,
          subtitle: e.date,
          route: '/calendar',
          icon: '📅',
        });
      }
    });

    teams.forEach((t) => {
      if (t.name.toLowerCase().includes(q) || t.nameAr.includes(query)) {
        out.push({
          id: t.id,
          type: 'team',
          title: t.name,
          subtitle: t.nameAr,
          route: '/teams/' + t.id,
          icon: '🏅',
        });
      }
    });

    committees.forEach((c) => {
      if (c.nameAr.includes(query) || c.name.toLowerCase().includes(q)) {
        out.push({
          id: c.id,
          type: 'committee',
          title: c.nameAr,
          subtitle: c.description,
          route: '/committees',
          icon: '🏛️',
        });
      }
    });

    return out.slice(0, 50);
  }, [query, members, contributions, achievements, events]);

  return (
    <div className="container">
      <PageHeader
        eyebrow="بحث"
        title="بحث شامل"
        description="ابحث في الأعضاء، المشاركات، الإنجازات، الأحداث، الفرق، واللجان."
      />

      <input
        className="input"
        type="search"
        placeholder="اكتب حرفين على الأقل..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        style={{ marginBottom: 20 }}
      />

      {query.length < 2 ? (
        <EmptyState
          icon="🔍"
          title="ابدأ الكتابة"
          message="اكتب حرفين على الأقل للبحث."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="لا نتائج"
          message={'لم يتم العثور على نتائج لـ "' + query + '".'}
        />
      ) : (
        <div className="stack">
          {results.map((r) => (
            <Link
              key={r.type + '-' + r.id}
              to={r.route}
              className="card"
            >
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--c-off-white)',
                    border: '1px solid var(--c-line)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.15rem',
                    flexShrink: 0,
                  }}
                >
                  {r.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{r.title}</div>
                  {r.subtitle ? (
                    <div className="card__meta">{r.subtitle}</div>
                  ) : null}
                </div>
                <Badge variant="neutral">{r.type}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   4. src/pages/MembersPage.tsx — إزالة Loading + ROLE_LABEL
   ═══════════════════════════════════════════════════════════════ */

files["src/pages/MembersPage.tsx"] = `import { useMemo, useState } from 'react';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import type { Member, TeamId } from '@/types';
import { MemberCard } from '@/components/member/MemberCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { cx } from '@/lib/format';

export function MembersPage() {
  const { data: members, loading } = useRealtimeCollection<Member>('members');
  const [query, setQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');
  const [committeeFilter, setCommitteeFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim();
    return members.filter((m) => {
      const matchesQuery = !q || m.name.includes(q);
      const matchesTeam =
        teamFilter === 'all' || m.teamIds.includes(teamFilter);
      const matchesCommittee =
        committeeFilter === 'all' ||
        m.committeeIds.includes(committeeFilter);
      return matchesQuery && matchesTeam && matchesCommittee;
    });
  }, [members, query, teamFilter, committeeFilter]);

  return (
    <div className="container">
      <PageHeader
        eyebrow="الأعضاء"
        title="جميع الأعضاء"
        description="تصفّح، ابحث، وفلتر بالفريق واللجنة."
      />

      <div className="toolbar">
        <input
          className="input"
          type="search"
          placeholder="ابحث بالاسم..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chips mb-4">
        <button
          type="button"
          className={cx('chip', teamFilter === 'all' && 'is-active')}
          onClick={() => setTeamFilter('all')}
        >
          كل الفرق
        </button>
        {teams.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cx('chip', teamFilter === t.id && 'is-active')}
            onClick={() => setTeamFilter(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="chips mb-4">
        <button
          type="button"
          className={cx('chip', committeeFilter === 'all' && 'is-active')}
          onClick={() => setCommitteeFilter('all')}
        >
          كل اللجان
        </button>
        {committees.map((c) => (
          <button
            key={c.id}
            type="button"
            className={cx('chip', committeeFilter === c.id && 'is-active')}
            onClick={() => setCommitteeFilter(c.id)}
          >
            {c.icon} {c.nameAr}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="لا نتائج"
          message="لم يتم العثور على أعضاء مطابقين للبحث."
        />
      ) : (
        <div className="grid grid--wide">
          {filtered.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   5. src/pages/LoginPage.tsx — إزالة FormField + TextInput
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/pages/LoginPage.tsx"
] = `import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, sendPasswordReset } from '@/lib/auth';

type Mode = 'login' | 'forgot';

export function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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

  const onForgot = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await sendPasswordReset(email.trim());
      setSuccess('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني');
      setTimeout(() => setMode('login'), 2500);
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-tabs">
          <button
            type="button"
            className={'login-tab' + (mode === 'login' ? ' is-active' : '')}
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
            }}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            className={'login-tab' + (mode === 'forgot' ? ' is-active' : '')}
            onClick={() => {
              setMode('forgot');
              setError('');
              setSuccess('');
            }}
          >
            نسيت كلمة المرور
          </button>
        </div>

        {error ? <div className="login-error">{error}</div> : null}
        {success ? <div className="login-success">{success}</div> : null}

        {mode === 'login' ? (
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
                style={{ textAlign: 'left' }}
              />
            </div>

            <div className="login-field">
              <label className="login-label">كلمة المرور</label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={busy || !email || !password}
            >
              {busy ? '...' : 'تسجيل الدخول'}
            </button>
          </form>
        ) : (
          <form onSubmit={onForgot}>
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
                style={{ textAlign: 'left' }}
              />
            </div>
            <button
              type="submit"
              className="login-submit"
              disabled={busy || !email}
            >
              {busy ? '...' : 'إرسال رابط الاستعادة'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link
            to="/"
            style={{
              fontSize: '0.82rem',
              color: 'var(--c-ink-muted)',
            }}
          >
            العودة للرئيسية
          </Link>
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
   6. src/pages/LeaguePage.tsx — إزالة Loading
   ═══════════════════════════════════════════════════════════════ */

files["src/pages/LeaguePage.tsx"] = `import { useMemo, useState } from 'react';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat, StatRow } from '@/components/ui/Stat';
import { SkeletonList } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { cx } from '@/lib/format';
import type { Member, TeamId, RoleId } from '@/types';

const LEAGUE_EXCLUDED: RoleId[] = ['HEAD', 'VICE'];

type FilterType = 'all' | 'team' | 'committee';

export function LeaguePage() {
  const { data: members, loading } = useRealtimeCollection<Member>('members');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterId, setFilterId] = useState<string>('all');

  const eligible = useMemo(
    () => members.filter((m) => !LEAGUE_EXCLUDED.includes(m.role)),
    [members],
  );

  const filtered = useMemo(() => {
    if (filterType === 'all' || filterId === 'all') return eligible;
    if (filterType === 'team') {
      return eligible.filter((m) => m.teamIds.includes(filterId as TeamId));
    }
    return eligible.filter((m) => m.committeeIds.includes(filterId));
  }, [eligible, filterType, filterId]);

  const board = useMemo(() => {
    return [...filtered]
      .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
      .map((m, i) => ({
        member: m,
        rank: i + 1,
        points: hoursToPoints(m.hours),
      }));
  }, [filtered]);

  const totalPoints = board.reduce((s, e) => s + e.points, 0);
  const totalHours = filtered.reduce((s, m) => s + (m.hours || 0), 0);

  const title =
    filterType === 'all'
      ? 'الترتيب العام'
      : filterType === 'team'
        ? 'ترتيب فريق ' + (teams.find((t) => t.id === filterId)?.nameAr || '')
        : 'ترتيب لجنة ' +
          (committees.find((c) => c.id === filterId)?.nameAr || '');

  return (
    <div className="container">
      <PageHeader
        eyebrow="الترتيب"
        title="الليج"
        description="ترتيب الأعضاء على مستوى المنظمة، الفريق، واللجنة."
      />

      <section className="section--tight">
        <StatRow>
          <Stat value={board.length} label="الأعضاء" />
          <Stat value={totalPoints} label="مجموع النقاط" />
          <Stat value={totalHours} label="مجموع الساعات" />
        </StatRow>
      </section>

      <div className="chips mb-3">
        <button
          type="button"
          className={cx('chip', filterType === 'all' && 'is-active')}
          onClick={() => {
            setFilterType('all');
            setFilterId('all');
          }}
        >
          عام
        </button>
        <button
          type="button"
          className={cx('chip', filterType === 'team' && 'is-active')}
          onClick={() => {
            setFilterType('team');
            setFilterId('all');
          }}
        >
          حسب الفريق
        </button>
        <button
          type="button"
          className={cx('chip', filterType === 'committee' && 'is-active')}
          onClick={() => {
            setFilterType('committee');
            setFilterId('all');
          }}
        >
          حسب اللجنة
        </button>
      </div>

      {filterType === 'team' ? (
        <div className="chips mb-4">
          <button
            type="button"
            className={cx('chip', filterId === 'all' && 'is-active')}
            onClick={() => setFilterId('all')}
          >
            كل الفرق
          </button>
          {teams.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cx('chip', filterId === t.id && 'is-active')}
              onClick={() => setFilterId(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>
      ) : null}

      {filterType === 'committee' ? (
        <div className="chips mb-4">
          <button
            type="button"
            className={cx('chip', filterId === 'all' && 'is-active')}
            onClick={() => setFilterId('all')}
          >
            كل اللجان
          </button>
          {committees.map((c) => (
            <button
              key={c.id}
              type="button"
              className={cx('chip', filterId === c.id && 'is-active')}
              onClick={() => setFilterId(c.id)}
            >
              {c.icon} {c.nameAr}
            </button>
          ))}
        </div>
      ) : null}

      <section className="section">
        <SectionHeader eyebrow="الترتيب" title={title} />

        {loading ? (
          <SkeletonList count={8} />
        ) : board.length === 0 ? (
          <EmptyState
            icon="🥇"
            title="لا بيانات"
            message="لا توجد مشاركات مسجلة لهذا التصنيف."
          />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>#</th>
                  <th>العضو</th>
                  <th>الفريق</th>
                  <th>الساعات</th>
                  <th>النقاط</th>
                </tr>
              </thead>
              <tbody>
                {board.map((e) => {
                  const memberTeams = teams.filter((t) =>
                    e.member.teamIds.includes(t.id),
                  );
                  return (
                    <tr key={e.member.id}>
                      <td
                        className={
                          'rank rank--' + (e.rank <= 3 ? e.rank : '')
                        }
                        data-label="الترتيب"
                      >
                        {e.rank}
                      </td>
                      <td data-label="العضو">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <Avatar name={e.member.name} size={32} variant="navy" />
                          <span style={{ fontWeight: 700 }}>
                            {e.member.name}
                          </span>
                        </div>
                      </td>
                      <td data-label="الفريق">
                        <div
                          style={{
                            display: 'flex',
                            gap: 4,
                            flexWrap: 'wrap',
                          }}
                        >
                          {memberTeams.map((t) => (
                            <span key={t.id} className="badge">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td
                        style={{ fontFamily: 'var(--font-en)' }}
                        data-label="الساعات"
                      >
                        {e.member.hours}
                      </td>
                      <td className="points" data-label="النقاط">
                        {e.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   7. src/pages/DashboardPage.tsx — إزالة isAdmin
   ═══════════════════════════════════════════════════════════════ */

files["src/pages/DashboardPage.tsx"] = `import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import {
  isManager,
  seesAllTeams,
  canApproveStep,
} from '@/lib/permissions';
import { hoursToPoints, formatDate } from '@/lib/format';
import { Stat, StatRow } from '@/components/ui/Stat';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EventCard } from '@/components/calendar/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type {
  Notification,
  RequestRecord,
  Contribution,
  ApprovalStep,
  CalendarEvent,
  Member,
} from '@/types';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');
  const { data: requests } = useRealtimeCollection<RequestRecord>('requests');
  const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
  const { data: approvals } = useRealtimeCollection<ApprovalStep>('approvals');
  const { data: events } = useRealtimeCollection<CalendarEvent>('calendar');
  const { data: liveMembers } = useRealtimeCollection<Member>('members');

  if (!user) {
    return (
      <div className="container">
        <EmptyState
          icon="🔒"
          title="يجب تسجيل الدخول"
          message="سجّل دخولك للوصول إلى لوحة التحكم."
        />
      </div>
    );
  }

  const allMembers = liveMembers.length > 0 ? liveMembers : members;
  const myMember = user.memberId
    ? allMembers.find((m) => m.id === user.memberId)
    : null;

  const myContribs = contributions.filter((c) => c.memberId === user.memberId);
  const approvedContribs = myContribs.filter((c) => c.status === 'approved');
  const myHours = approvedContribs.reduce((s, c) => s + c.hours, 0);
  const myPoints = hoursToPoints(myHours);

  const myRequests = requests.filter((r) => r.requesterUid === user.uid);

  const myNotifs = notifs
    .filter((n) => n.userId === user.uid)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  const myPendingApprovals = approvals.filter(
    (a) => a.status === 'PENDING' && canApproveStep(user, a),
  );

  const upcomingEvents = events
    .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
    .filter(
      (e) => e.isPublic || e.teamId === user.teamId || seesAllTeams(user),
    )
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 3);

  const totalOrgPoints = allMembers.reduce(
    (s, m) => s + hoursToPoints(m.hours || 0),
    0,
  );

  const pendingRequestsCount = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'IN_REVIEW',
  ).length;

  return (
    <>
      <div className="section section--tight">
        <div className="section-head__eyebrow">أهلاً بك</div>
        <h1>{user.displayName}</h1>
      </div>

      {isManager(user) ? (
        <section className="section--tight">
          <StatRow>
            <Stat value={allMembers.length} label="الأعضاء" />
            <Stat value={teams.length} label="الفرق" />
            <Stat
              value={pendingRequestsCount}
              label="طلبات قيد المعالجة"
              variant="red"
            />
            <Stat value={totalOrgPoints} label="مجموع النقاط" />
          </StatRow>
        </section>
      ) : (
        <section className="section--tight">
          <StatRow>
            <Stat value={myPoints} label="نقاطي" variant="red" />
            <Stat value={myHours} label="ساعاتي" />
            <Stat value={myContribs.length} label="مشاركاتي" />
            <Stat value={myRequests.length} label="طلباتي" />
          </StatRow>
        </section>
      )}

      {user.role === 'MEMBER' ? (
        <section className="section--tight">
          <div className="row" style={{ gap: 10 }}>
            <Link to="/requests/new" className="btn btn--primary btn--sm">
              + طلب جديد
            </Link>
            <Link
              to="/my-contributions"
              className="btn btn--ghost btn--sm"
            >
              تسجيل مشاركة
            </Link>
          </div>
        </section>
      ) : null}

      {isManager(user) && myPendingApprovals.length > 0 ? (
        <section className="section">
          <SectionHeader
            eyebrow="بانتظار قرارك"
            title="الموافقات المعلّقة"
            action={
              <Link to="/approvals" className="btn btn--ghost btn--sm">
                الكل
              </Link>
            }
          />
          <div className="stack">
            {myPendingApprovals.slice(0, 4).map((a) => {
              const req = requests.find((r) => r.id === a.requestId);
              if (!req) return null;
              return (
                <Link
                  key={a.id}
                  to={'/requests/' + req.id}
                  className="card"
                >
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">{req.title}</div>
                      <div className="card__meta">
                        {req.requesterName} · مرحلة {a.order}
                      </div>
                    </div>
                    <Badge variant="warning" dot>
                      بانتظارك
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {myNotifs.length > 0 ? (
        <section className="section">
          <SectionHeader
            eyebrow="آخر التحديثات"
            title="الإشعارات"
            action={
              <Link to="/notifications" className="btn btn--ghost btn--sm">
                الكل
              </Link>
            }
          />
          <div className="stack">
            {myNotifs.map((n) => (
              <Link
                key={n.id}
                to={n.route || '/notifications'}
                className="card"
                style={
                  !n.read
                    ? { borderColor: '#FCA5A5', background: '#FFFBFC' }
                    : undefined
                }
              >
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{n.title}</div>
                    <div className="card__meta">{n.message}</div>
                  </div>
                  {!n.read ? (
                    <Badge variant="red" dot>
                      جديد
                    </Badge>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <SectionHeader
          eyebrow="الترتيب"
          title="أعلى الأعضاء"
          action={
            <Link to="/league" className="btn btn--ghost btn--sm">
              الليج الكامل
            </Link>
          }
        />
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>#</th>
                <th>العضو</th>
                <th>الساعات</th>
                <th>النقاط</th>
              </tr>
            </thead>
            <tbody>
              {[...allMembers]
                .filter((m) => m.role !== 'HEAD' && m.role !== 'VICE')
                .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
                .slice(0, 5)
                .map((m, i) => (
                  <tr key={m.id}>
                    <td
                      className={'rank rank--' + (i + 1 <= 3 ? i + 1 : '')}
                      data-label="الترتيب"
                    >
                      {i + 1}
                    </td>
                    <td data-label="العضو">
                      <Link
                        to={'/members/' + m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <Avatar name={m.name} size={30} variant="navy" />
                        <span style={{ fontWeight: 700 }}>{m.name}</span>
                      </Link>
                    </td>
                    <td
                      style={{ fontFamily: 'var(--font-en)' }}
                      data-label="الساعات"
                    >
                      {m.hours}
                    </td>
                    <td className="points" data-label="النقاط">
                      {hoursToPoints(m.hours)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {upcomingEvents.length > 0 ? (
        <section className="section">
          <SectionHeader
            eyebrow="قريبًا"
            title="الأحداث القادمة"
            action={
              <Link to="/calendar" className="btn btn--ghost btn--sm">
                التقويم
              </Link>
            }
          />
          <div className="stack">
            {upcomingEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      ) : null}

      {myMember ? (
        <section className="section">
          <SectionHeader eyebrow="معلوماتي" title="حسابي" />
          <div className="card no-click">
            <div className="kv">
              <span className="kv__k">الاسم</span>
              <span className="kv__v">{myMember.name}</span>
            </div>
            <div className="kv mt-3">
              <span className="kv__k">الفريق</span>
              <span className="kv__v">
                {user.teamId
                  ? teams.find((t) => t.id === user.teamId)?.name
                  : '—'}
              </span>
            </div>
            {user.committeeIds.length > 0 ? (
              <div className="kv mt-3">
                <span className="kv__k">اللجان</span>
                <span className="kv__v">
                  {committees
                    .filter((c) => user.committeeIds.includes(c.id))
                    .map((c) => c.nameAr)
                    .join(' · ')}
                </span>
              </div>
            ) : null}
            <div className="kv mt-3">
              <span className="kv__k">تاريخ الانضمام</span>
              <span className="kv__v">{formatDate(user.createdAt)}</span>
            </div>
            <div className="row mt-4" style={{ gap: 10 }}>
              <Link to="/profile" className="btn btn--ghost btn--sm">
                ملفي الشخصي
              </Link>
              <Link
                to="/my-contributions"
                className="btn btn--ghost btn--sm"
              >
                مشاركاتي
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
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
console.log("  fix.cjs v3 — إصلاح شامل");
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
const committed = run('git commit -m "fix: format labels + unused imports"');

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
