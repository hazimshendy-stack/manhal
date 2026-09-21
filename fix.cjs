#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — v5.4
 * Admin Experience Overhaul: spacing + rebuilds + fixes
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const STAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const BACKUP_DIR = path.join(ROOT, ".fix-backups", STAMP);

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const files = {};
const file = (p, c) => {
  files[p.replace(/\\/g, "/")] = c.replace(/^\n/, "");
};
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

function backup(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  const dst = path.join(BACKUP_DIR, rel);
  ensureDir(path.dirname(dst));
  fs.copyFileSync(abs, dst);
}

function writeAll() {
  let count = 0;
  for (const [rel, content] of Object.entries(files)) {
    backup(rel);
    const abs = path.join(ROOT, rel);
    ensureDir(path.dirname(abs));
    fs.writeFileSync(abs, content, "utf8");
    console.log(`${C.green}✓${C.reset} ${rel}`);
    count++;
  }
  return count;
}

/* ═══════════════════════════════════════════════════════════════
   1) v54-admin.css — التنسيق الشامل لكل صفحات الأدمن
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/styles/v54-admin.css",
  `
/* ═══════════════════════════════════════════════════════════════
   v5.4 — Admin + Global Spacing Fix
   كل الصفحات عندها هامش جانبي محترم
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════ Container موحد ═══════════ */

.container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 24px;
  box-sizing: border-box;
}

@media (min-width: 640px) { .container { padding-inline: 32px; } }
@media (min-width: 1024px) { .container { padding-inline: 40px; } }
@media (max-width: 480px) { .container { padding-inline: 20px; } }

/* كل عناصر الصفحة الداخلية تأخذ نفس الهامش */
.app-main > * > .container,
.app-main .container > * {
  padding-inline: 0;
}

/* ═══════════ Admin Layout — هامش داخلي ═══════════ */

.admin-page {
  padding-block: 8px 32px;
}

.admin-page .section,
.admin-page .section--tight {
  padding-inline: 0;
}

.admin-page .section-head {
  padding-inline: 0;
}

.admin-page h1,
.admin-page h2,
.admin-page h3 {
  padding-inline: 0;
}

/* ═══════════ Admin Home ═══════════ */

.admin-welcome {
  padding: 24px 0 8px;
  margin-bottom: 8px;
}

.admin-welcome__eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--c-red);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.admin-welcome__name {
  font-size: clamp(1.5rem, 4vw, 2.1rem);
  font-weight: 900;
  color: var(--c-navy);
  line-height: 1.2;
  letter-spacing: -0.02em;
  word-break: break-word;
}

.admin-welcome__subtitle {
  margin-top: 8px;
  color: var(--c-ink-muted);
  font-size: 0.92rem;
  line-height: 1.7;
  max-width: 60ch;
}

/* ═══════════ Admin Stats Row ═══════════ */

.admin-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-block: 24px;
}

@media (min-width: 640px) {
  .admin-stats { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}

@media (min-width: 1024px) {
  .admin-stats { grid-template-columns: repeat(6, 1fr); }
}

.admin-stats .stat {
  padding: 22px 14px;
  min-height: 108px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.admin-stats .stat__value { font-size: 1.65rem; }
.admin-stats .stat__label { font-size: 0.72rem; }

/* ═══════════ Admin Cards Grid ═══════════ */

.admin-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 600px) {
  .admin-cards { grid-template-columns: repeat(2, 1fr); gap: 16px; }
}

@media (min-width: 1024px) {
  .admin-cards { grid-template-columns: repeat(3, 1fr); gap: 18px; }
}

.admin-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--c-ink);
  transition: all 0.18s var(--ease);
  box-shadow: var(--shadow-xs);
  min-height: 110px;
}

.admin-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-sm);
  border-color: var(--c-line-mid);
}

.admin-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.admin-card__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--c-navy);
  line-height: 1.35;
}

.admin-card__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: var(--c-red);
  color: #fff;
  font-family: var(--font-en);
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
}

.admin-card__desc {
  font-size: 0.85rem;
  color: var(--c-ink-muted);
  line-height: 1.6;
}

/* ═══════════ Admin Seed Section ═══════════ */

.admin-seed {
  margin-block: 32px;
  padding: 24px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
}

@media (max-width: 640px) {
  .admin-seed { padding: 18px; }
}

.admin-seed__head {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
}

@media (min-width: 640px) {
  .admin-seed__head {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.admin-seed__result {
  margin-top: 16px;
  padding: 14px 16px;
  background: var(--c-off-white);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  line-height: 1.9;
  color: var(--c-ink-soft);
  word-break: break-word;
}

/* ═══════════ Approval Card (Admin Requests) ═══════════ */

.admin-request-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
}

.admin-request-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.admin-request-card__title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--c-ink);
  line-height: 1.4;
  word-break: break-word;
}

.admin-request-card__meta {
  font-size: 0.82rem;
  color: var(--c-ink-muted);
  margin-top: 4px;
  line-height: 1.6;
}

.admin-request-card__badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.admin-request-card__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--c-line);
}

/* ═══════════ Admin Tables (على الموبايل) ═══════════ */

@media (max-width: 700px) {
  .admin-page table.data {
    display: block;
  }

  .admin-page table.data thead { display: none; }

  .admin-page table.data tbody { display: block; }

  .admin-page table.data tr {
    display: block;
    background: var(--c-white);
    border: 1px solid var(--c-line);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: var(--shadow-xs);
  }

  .admin-page table.data td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border: none;
    font-size: 0.88rem;
  }

  .admin-page table.data td::before {
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--c-ink-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
}

/* ═══════════ Chips — mobile safe ═══════════ */

@media (max-width: 640px) {
  .chips {
    margin-inline: -20px;
    padding-inline: 20px;
  }
}

/* ═══════════ Forms داخل الأدمن ═══════════ */

.admin-page .form-field {
  margin-bottom: 18px;
}

.admin-page .input {
  font-size: 0.92rem;
}

/* ═══════════ Modal داخل الأدمن ═══════════ */

.admin-page .modal__body {
  padding: 24px;
}

/* ═══════════ Achievement بدون تصنيف ═══════════ */

.achievement-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
}

.achievement-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.achievement-card__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--c-navy);
  line-height: 1.4;
  word-break: break-word;
}

.achievement-card__date {
  font-size: 0.78rem;
  color: var(--c-ink-muted);
  margin-top: 4px;
  font-family: var(--font-en);
  font-weight: 700;
}

.achievement-card__desc {
  font-size: 0.88rem;
  color: var(--c-ink-soft);
  line-height: 1.7;
}

.achievement-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid var(--c-line);
}

/* ═══════════ إشعارات صفحة — بدون أيقونات ═══════════ */

.notif-item__icon { display: none !important; }

.notif-item {
  padding: 16px 18px !important;
}

/* ═══════════ Welcome header صفحة الأدمن ═══════════ */

.admin-page h1 { font-size: 1.6rem; }

@media (min-width: 640px) {
  .admin-page h1 { font-size: 1.9rem; }
}

/* ═══════════ spacing عام للبطاقات في صفحات الأدمن ═══════════ */

.admin-page .card {
  padding: 20px;
}

@media (min-width: 640px) {
  .admin-page .card { padding: 22px; }
}

/* ═══════════ كل الصفحات — إزالة اللزق ═══════════ */

.page-section,
section.section {
  padding-inline: 0;
}

/* ═══════════ النصوص الطويلة ═══════════ */

.admin-page .card__title,
.admin-page .card__meta,
.admin-page .card__body {
  word-break: break-word;
  overflow-wrap: anywhere;
}
`
);

/* ═══════════════════════════════════════════════════════════════
   2) global.css — تحديث الاستيرادات
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/styles/global.css",
  `
/* sbapiaryy v5.4 — Global CSS */

@import './tokens.css';
@import './base.css';
@import './layout.css';
@import './navbar.css';
@import './bottom-nav.css';
@import './sidebar.css';
@import './cards.css';
@import './member-card.css';
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
@import './chat-additions.css';
@import './pwa.css';
@import './states.css';
@import './timeline.css';
@import './approvals.css';
@import './print.css';
@import './v52-fix.css';
@import './v53-fix.css';
@import './v54-admin.css';
`
);

/* ═══════════════════════════════════════════════════════════════
   3) lib/approvals.ts — إصلاح سلسلة الموافقات
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/lib/approvals.ts",
  `
import { updateOne, createOne, newId, today, listWhere } from './db';
import { notifyUser } from './notifications';
import { logAudit } from './audit';
import type { ApprovalStep, RequestRecord, AppUser, RoleId, TeamId } from '@/types';

export interface ApprovalChainStep {
  role: RoleId;
  teamId: TeamId | null;
}

/* ═══════════════════════════════════════════════════════════════
   سلسلة الموافقات
   ═══════════════════════════════════════════════════════════════ */

export function buildApprovalChain(request: RequestRecord): ApprovalChainStep[] {
  const chain: ApprovalChainStep[] = [];

  if (request.type === 'TRANSFER' && request.fromTeamId && request.toTeamId) {
    chain.push({ role: 'PRESIDENT', teamId: request.fromTeamId });
    chain.push({ role: 'PRESIDENT', teamId: request.toTeamId });
    chain.push({ role: 'HEAD_HR', teamId: null });
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'PROMOTION') {
    const teamId = request.fromTeamId ?? request.toTeamId ?? null;
    if (teamId) {
      chain.push({ role: 'PRESIDENT', teamId });
      chain.push({ role: 'HR', teamId });
    }
    chain.push({ role: 'HEAD_HR', teamId: null });
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'RESIGNATION') {
    const teamId = request.fromTeamId ?? request.toTeamId ?? null;
    if (teamId) {
      chain.push({ role: 'PRESIDENT', teamId });
      chain.push({ role: 'HR', teamId });
    }
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'COMPLAINT') {
    chain.push({ role: 'HEAD_HR', teamId: null });
    chain.push({ role: 'VICE', teamId: null });
  } else if (request.type === 'SUGGESTION') {
    const teamId = request.fromTeamId ?? request.toTeamId ?? null;
    if (teamId) chain.push({ role: 'PRESIDENT', teamId });
    chain.push({ role: 'HEAD', teamId: null });
  } else if (request.type === 'LEAVE') {
    const teamId = request.fromTeamId ?? request.toTeamId ?? null;
    if (teamId) {
      chain.push({ role: 'PRESIDENT', teamId });
      chain.push({ role: 'HR', teamId });
    }
  } else {
    chain.push({ role: 'HEAD', teamId: null });
  }

  return chain;
}

/* ═══════════════════════════════════════════════════════════════
   إنشاء طلب مع سلسلة الموافقات
   ═══════════════════════════════════════════════════════════════ */

export async function createRequestWithChain(request: RequestRecord): Promise<void> {
  await createOne('requests', request);
  const chain = buildApprovalChain(request);
  for (let i = 0; i < chain.length; i += 1) {
    const step: ApprovalStep = {
      id: newId('APR'),
      requestId: request.id,
      order: i + 1,
      requiredRole: chain[i].role,
      requiredTeamId: chain[i].teamId,
      status: 'PENDING',
    };
    await createOne('approvals', step);
  }
}

/* ═══════════════════════════════════════════════════════════════
   الموافقة على مرحلة واحدة
   ═══════════════════════════════════════════════════════════════ */

export async function approveStep(
  request: RequestRecord,
  step: ApprovalStep,
  user: AppUser,
): Promise<void> {
  await updateOne('approvals', step.id, {
    status: 'APPROVED',
    approverUid: user.uid,
    approverName: user.displayName,
    actionDate: today(),
  });

  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  const sorted = allSteps.sort((a, b) => a.order - b.order);
  const remaining = sorted.filter((s) => s.status === 'PENDING' && s.id !== step.id);

  if (remaining.length === 0) {
    await updateOne('requests', request.id, {
      status: 'APPROVED',
      currentStepOrder: sorted.length,
      updatedAt: today(),
    });
    await notifyUser(
      request.requesterUid,
      'تمت الموافقة على طلبك',
      'طلبك "' + request.title + '" تمت الموافقة النهائية عليه.',
      'request',
      '/requests/' + request.id,
      'high',
    );
    await logAudit(user, 'APPROVE_REQUEST', 'Request', request.id, 'موافقة نهائية');
  } else {
    const nextOrder = Math.min(...remaining.map((s) => s.order));
    await updateOne('requests', request.id, {
      status: 'IN_REVIEW',
      currentStepOrder: nextOrder,
      updatedAt: today(),
    });
    await notifyUser(
      request.requesterUid,
      'تقدّم طلبك',
      'طلبك "' + request.title + '" في المرحلة ' + nextOrder + '.',
      'approval',
      '/requests/' + request.id,
      'normal',
    );
    await logAudit(user, 'APPROVE_STEP', 'Approval', step.id, 'المرحلة ' + step.order);
  }
}

/* ═══════════════════════════════════════════════════════════════
   Admin — موافقة كاملة على كل المراحل دفعة واحدة
   ═══════════════════════════════════════════════════════════════ */

export async function adminApproveAll(
  request: RequestRecord,
  user: AppUser,
): Promise<void> {
  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  const sorted = allSteps.sort((a, b) => a.order - b.order);

  for (const step of sorted) {
    if (step.status === 'PENDING') {
      await updateOne('approvals', step.id, {
        status: 'APPROVED',
        approverUid: user.uid,
        approverName: user.displayName,
        actionDate: today(),
        comment: 'موافقة الأدمن الشاملة',
      });
    }
  }

  await updateOne('requests', request.id, {
    status: 'APPROVED',
    currentStepOrder: sorted.length,
    updatedAt: today(),
  });

  await notifyUser(
    request.requesterUid,
    'تمت الموافقة على طلبك',
    'طلبك "' + request.title + '" تمت الموافقة النهائية عليه من الإدارة.',
    'request',
    '/requests/' + request.id,
    'high',
  );

  await logAudit(user, 'ADMIN_APPROVE_ALL', 'Request', request.id, 'موافقة شاملة');
}

/* ═══════════════════════════════════════════════════════════════
   رفض
   ═══════════════════════════════════════════════════════════════ */

export async function rejectStep(
  request: RequestRecord,
  step: ApprovalStep,
  user: AppUser,
  comment: string,
): Promise<void> {
  await updateOne('approvals', step.id, {
    status: 'REJECTED',
    approverUid: user.uid,
    approverName: user.displayName,
    comment: comment.trim() || undefined,
    actionDate: today(),
  });

  await updateOne('requests', request.id, {
    status: 'REJECTED',
    updatedAt: today(),
  });

  const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
  for (const s of allSteps) {
    if (s.order > step.order && s.status === 'PENDING') {
      await updateOne('approvals', s.id, { status: 'SKIPPED' });
    }
  }

  const reasonText = comment.trim() ? ' السبب: ' + comment : '';
  await notifyUser(
    request.requesterUid,
    'تم رفض طلبك',
    'طلبك "' + request.title + '" رُفض.' + reasonText,
    'request',
    '/requests/' + request.id,
    'high',
  );
  await logAudit(user, 'REJECT_REQUEST', 'Request', request.id, 'رفض الطلب');
}
`
);

/* ═══════════════════════════════════════════════════════════════
   4) AdminHomePage — تصميم جديد باسم الأدمن
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/admin/AdminHomePage.tsx",
  `
import { Link } from 'react-router-dom';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { seedAll, type SeedResult } from '@/lib/seed';
import { members } from '@/data/members';
import { committees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat } from '@/components/ui/Stat';
import { toast } from '@/components/ui/Toast';
import type {
  AppUser, RequestRecord, Contribution, Notification, Member,
} from '@/types';

interface AdminCard {
  to: string;
  title: string;
  count?: number;
  description: string;
}

export function AdminHomePage() {
  const { user } = useAuth();
  const { data: users } = useRealtimeCollection<AppUser>('users');
  const { data: liveMembers } = useRealtimeCollection<Member>('members');
  const { data: requests } = useRealtimeCollection<RequestRecord>('requests');
  const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');

  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const allMembers = liveMembers.length > 0 ? liveMembers : members;
  const pendingReq = requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
  const pendingContribs = contributions.filter((c) => c.status === 'pending').length;
  const totalPoints = allMembers.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);

  const onSeed = async () => {
    if (!window.confirm('سيتم رفع البيانات الأساسية. متابعة؟')) return;
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
    { to: '/admin/analytics', title: 'التحليلات', description: 'نظرة شاملة على الإحصائيات' },
    { to: '/admin/requests', title: 'الطلبات', count: pendingReq, description: 'إدارة كل الطلبات' },
    { to: '/admin/users', title: 'المستخدمون', count: users.length, description: 'الحسابات والأدوار' },
    { to: '/admin/members', title: 'الأعضاء', count: allMembers.length, description: 'إدارة بيانات الأعضاء' },
    { to: '/admin/contributions', title: 'المشاركات', count: pendingContribs, description: 'اعتماد مشاركات الأعضاء' },
    { to: '/admin/committees', title: 'اللجان', count: committees.length, description: 'إدارة اللجان' },
    { to: '/admin/achievements', title: 'الإنجازات', description: 'إدارة الإنجازات' },
    { to: '/admin/warnings', title: 'التحذيرات', description: 'إصدار ومتابعة التحذيرات' },
    { to: '/admin/calendar', title: 'التقويم', description: 'إدارة الأحداث' },
    { to: '/admin/conversations', title: 'المحادثات', description: 'إدارة المحادثات' },
    { to: '/admin/notifications', title: 'إرسال إشعار', count: notifs.length, description: 'إشعارات جماعية' },
    { to: '/admin/governance', title: 'الحوكمة', description: 'السياسات واللوائح' },
    { to: '/admin/audit', title: 'سجل التغييرات', description: 'تتبع كل الإجراءات' },
  ];

  return (
    <div className="admin-page">
      {/* ═══ Welcome ═══ */}
      <section className="admin-welcome">
        <div className="admin-welcome__eyebrow">لوحة الإدارة</div>
        <h1 className="admin-welcome__name">
          مرحبًا، {user?.displayName || 'أيها المدير'}
        </h1>
        <p className="admin-welcome__subtitle">
          تحكم كامل بالمحتوى والأعضاء والطلبات. كل شيء من مكان واحد.
        </p>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="admin-stats">
        <Stat value={users.length} label="المستخدمون" />
        <Stat value={allMembers.length} label="الأعضاء" />
        <Stat value={pendingReq} label="طلبات معلّقة" variant="red" />
        <Stat value={pendingContribs} label="مشاركات معلّقة" variant="amber" />
        <Stat value={totalPoints} label="مجموع النقاط" />
        <Stat value={notifs.length} label="الإشعارات" />
      </section>

      {/* ═══ Seed ═══ */}
      <section className="admin-seed">
        <div className="admin-seed__head">
          <div>
            <div className="admin-card__title">رفع البيانات الأساسية</div>
            <div className="admin-card__desc">
              لمرة واحدة فقط — إن كانت Firestore فارغة.
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onSeed}
            disabled={seeding}
          >
            {seeding ? 'جارٍ الرفع...' : 'رفع البيانات'}
          </button>
        </div>
        {result ? (
          <div className="admin-seed__result">
            ✓ تم الرفع — أعضاء: {result.members} · فرق: {result.teams} ·
            مشاركات: {result.contributions} · طلبات: {result.requests} ·
            موافقات: {result.approvals} · تحذيرات: {result.warnings} ·
            إنجازات: {result.achievements} · إشعارات: {result.notifications} ·
            محادثات: {result.conversations} · رسائل: {result.messages}
          </div>
        ) : null}
      </section>

      {/* ═══ Quick Links ═══ */}
      <section style={{ marginTop: 32 }}>
        <SectionHeader eyebrow="الأقسام" title="روابط سريعة" />
        <div className="admin-cards">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="admin-card">
              <div className="admin-card__head">
                <div className="admin-card__title">{c.title}</div>
                {c.count !== undefined && c.count > 0 ? (
                  <span className="admin-card__count">{c.count > 99 ? '99+' : c.count}</span>
                ) : null}
              </div>
              <div className="admin-card__desc">{c.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   5) AdminRequestsPage — إصلاح كامل + موافقة شاملة
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/admin/AdminRequestsPage.tsx",
  `
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { approveStep, rejectStep, adminApproveAll } from '@/lib/approvals';
import { listWhere } from '@/lib/db';
import { canApproveStep, isAdmin } from '@/lib/permissions';
import { teams } from '@/data/teams';
import {
  REQUEST_TYPE_LABEL,
  REQUEST_STATUS_LABEL,
  PRIORITY_LABEL,
  formatDate,
} from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, TextArea } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { cx } from '@/lib/format';
import type { RequestRecord, ApprovalStep, RequestStatus } from '@/types';

const STATUSES: Array<RequestStatus | 'all'> = ['all', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'];

const STATUS_TAB: Record<string, string> = {
  all: 'الكل',
  PENDING: 'قيد الانتظار',
  IN_REVIEW: 'قيد المراجعة',
  APPROVED: 'معتمد',
  REJECTED: 'مرفوض',
};

export function AdminRequestsPage() {
  const { user } = useAuth();
  const { data: requests, loading } = useCollection<RequestRecord>('requests');
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [actionReq, setActionReq] = useState<RequestRecord | null>(null);
  const [actionStep, setActionStep] = useState<ApprovalStep | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'approveAll' | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [toApproveAll, setToApproveAll] = useState<RequestRecord | null>(null);

  const filtered = useMemo(() => {
    return requests
      .filter((r) => status === 'all' || r.status === status)
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  }, [requests, status]);

  const openAction = async (req: RequestRecord, type: 'approve' | 'reject') => {
    if (!user) return;
    const steps = await listWhere<ApprovalStep>('approvals', 'requestId', req.id);
    const step = steps.find((s) => s.status === 'PENDING' && s.order === req.currentStepOrder);
    if (!step) { toast.error('لا توجد مرحلة معلّقة'); return; }
    if (!canApproveStep(user, step)) { toast.error('لا تملك صلاحية هذه المرحلة'); return; }
    setActionReq(req);
    setActionStep(step);
    setActionType(type);
    setComment('');
  };

  const doAction = async () => {
    if (!user || !actionReq || !actionStep || !actionType) return;
    if (actionType === 'approveAll') return;
    setBusy(true);
    try {
      if (actionType === 'approve') {
        await approveStep(actionReq, actionStep, user);
        toast.success('تمت الموافقة');
      } else {
        if (!comment.trim()) { toast.error('سبب الرفض مطلوب'); setBusy(false); return; }
        await rejectStep(actionReq, actionStep, user, comment);
        toast.success('تم رفض الطلب');
      }
      setActionReq(null); setActionStep(null); setActionType(null); setComment('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الإجراء';
      toast.error('فشل الإجراء', msg);
    } finally { setBusy(false); }
  };

  const doApproveAll = async () => {
    if (!user || !toApproveAll) return;
    setBusy(true);
    try {
      await adminApproveAll(toApproveAll, user);
      toast.success('تمت الموافقة الشاملة');
      setToApproveAll(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل';
      toast.error('فشل', msg);
    } finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="إدارة"
        title="الطلبات"
        description="كل الطلبات مع إجراءات فورية."
      />

      <div className="chips mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={cx('chip', status === s && 'is-active')}
            onClick={() => setStatus(s)}
          >
            {STATUS_TAB[s]}
          </button>
        ))}
      </div>

      <SectionHeader eyebrow="القائمة" title={'الطلبات (' + filtered.length + ')'} />

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title="لا طلبات" message="لا توجد طلبات مطابقة." />
      ) : (
        <div className="stack">
          {filtered.map((r) => {
            const fromTeam = r.fromTeamId ? teams.find((t) => t.id === r.fromTeamId) : null;
            const toTeam = r.toTeamId ? teams.find((t) => t.id === r.toTeamId) : null;
            const canBulk = user && isAdmin(user) && (r.status === 'PENDING' || r.status === 'IN_REVIEW');

            return (
              <div key={r.id} className="admin-request-card">
                <div className="admin-request-card__head">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="admin-request-card__title">{r.title}</div>
                    <div className="admin-request-card__meta">
                      {r.requesterName} · {formatDate(r.submittedAt)}
                      {fromTeam ? ' · من ' + fromTeam.name : ''}
                      {toTeam ? ' · إلى ' + toTeam.name : ''}
                    </div>
                  </div>
                  <div className="admin-request-card__badges">
                    <Badge variant="neutral">{REQUEST_TYPE_LABEL[r.type]}</Badge>
                    <Badge
                      variant={
                        r.status === 'APPROVED' ? 'success'
                          : r.status === 'REJECTED' ? 'danger'
                          : r.status === 'IN_REVIEW' ? 'warning'
                          : 'info'
                      }
                    >
                      {REQUEST_STATUS_LABEL[r.status]}
                    </Badge>
                    <Badge variant="neutral">{PRIORITY_LABEL[r.priority]}</Badge>
                  </div>
                </div>

                <div className="admin-request-card__actions">
                  <Link to={'/requests/' + r.id} className="btn btn--ghost btn--sm">
                    تفاصيل
                  </Link>
                  {canBulk ? (
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => setToApproveAll(r)}
                    >
                      موافقة شاملة
                    </button>
                  ) : null}
                  {r.status === 'PENDING' || r.status === 'IN_REVIEW' ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--success btn--sm"
                        onClick={() => openAction(r, 'approve')}
                      >
                        موافقة المرحلة
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => openAction(r, 'reject')}
                      >
                        رفض
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal — موافقة/رفض مرحلة */}
      <Modal
        open={actionType !== null && actionType !== 'approveAll'}
        title={actionType === 'approve' ? 'موافقة على المرحلة' : 'رفض الطلب'}
        onClose={() => { setActionType(null); setActionReq(null); setActionStep(null); }}
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => { setActionType(null); setActionReq(null); setActionStep(null); }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className={'btn ' + (actionType === 'approve' ? 'btn--success' : 'btn--danger')}
              onClick={doAction}
              disabled={busy}
            >
              {busy ? '...' : actionType === 'approve' ? 'تأكيد' : 'تأكيد الرفض'}
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
            placeholder={actionType === 'approve' ? 'ملاحظات...' : 'اشرح السبب'}
            rows={3}
          />
        </FormField>
      </Modal>

      {/* Confirm — موافقة شاملة */}
      <ConfirmDialog
        open={toApproveAll !== null}
        title="موافقة شاملة"
        message={
          'سيتم اعتماد كل المراحل المعلّقة على "' +
          (toApproveAll?.title || '') +
          '" مرة واحدة. متابعة؟'
        }
        confirmLabel="موافقة شاملة"
        busy={busy}
        onConfirm={doApproveAll}
        onCancel={() => setToApproveAll(null)}
      />
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   6) ConversationsPage — إعادة بناء كاملة
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/ConversationsPage.tsx",
  `
import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { createOne, newId, now } from '@/lib/db';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Composer } from '@/components/chat/Composer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, Select } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { Conversation, Message, AppUser, TeamId } from '@/types';

export function ConversationsPage() {
  const { user } = useAuth();
  const { data: conversations, loading: loadingConvs } = useRealtimeCollection<Conversation>('conversations');
  const { data: messages, loading: loadingMsgs } = useRealtimeCollection<Message>('messages');
  const { data: users, loading: loadingUsers } = useRealtimeCollection<AppUser>('users');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [createType, setCreateType] = useState<'private' | 'team'>('private');
  const [createTarget, setCreateTarget] = useState<string>('');
  const [createTeamId, setCreateTeamId] = useState<TeamId>('helpers');
  const [busy, setBusy] = useState(false);

  const otherUsers = useMemo(() => {
    if (!user) return [];
    return users.filter((u) => u.uid !== user.uid);
  }, [users, user]);

  const myConversations = useMemo(() => {
    if (!user) return [];
    return conversations.filter((c) => {
      if (c.type === 'general') return true;
      if (c.type === 'team') return c.teamId === user.teamId;
      return c.participantUids.includes(user.uid);
    });
  }, [conversations, user]);

  const defaultId = useMemo(
    () => myConversations.find((c) => c.type === 'general')?.id ?? null,
    [myConversations],
  );
  const currentId = activeId ?? defaultId;
  const active = currentId ? myConversations.find((c) => c.id === currentId) : null;

  const activeMessages = useMemo(() => {
    if (!currentId) return [];
    return messages
      .filter((m) => m.conversationId === currentId)
      .sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1));
  }, [messages, currentId]);

  if (!user) return null;
  if (loadingConvs || loadingMsgs || loadingUsers) {
    return <Loading fullHeight message="جارٍ تحميل المحادثات..." />;
  }

  const getConvName = (): string => {
    if (!active) return '';
    if (active.type === 'general') return 'المحادثة العامة';
    if (active.type === 'team') {
      const team = teams.find((t) => t.id === active.teamId);
      return 'فريق ' + (team?.name ?? '');
    }
    const otherUid = active.participantUids.find((uid) => uid !== user.uid);
    const other = users.find((u) => u.uid === otherUid);
    return other?.displayName ?? 'محادثة خاصة';
  };

  const sendMessage = async (text: string) => {
    if (!currentId || !user) return;
    const myMember = members.find((m) => m.id === user.memberId);
    const msg: Message = {
      id: newId('MSG'),
      conversationId: currentId,
      senderUid: user.uid,
      senderName: myMember?.name ?? user.displayName,
      text,
      sentAt: now(),
    };
    try {
      await createOne('messages', msg);
      await createOne('conversations', {
        id: currentId,
        lastMessageAt: now(),
        lastMessageText: text,
        lastMessageSender: myMember?.name ?? user.displayName,
      });
    } catch (err) {
      const m = err instanceof Error ? err.message : 'فشل الإرسال';
      toast.error('فشل الإرسال', m);
    }
  };

  const createConversation = async () => {
    if (!user) return;

    if (createType === 'private') {
      if (!createTarget) { toast.error('اختر عضوًا'); return; }
      const existing = conversations.find(
        (c) =>
          c.type === 'private' &&
          c.participantUids.length === 2 &&
          c.participantUids.includes(user.uid) &&
          c.participantUids.includes(createTarget),
      );
      if (existing) {
        setActiveId(existing.id);
        setMobileShowChat(true);
        setOpenCreate(false);
        toast.info('المحادثة موجودة — تم فتحها');
        return;
      }

      setBusy(true);
      try {
        const id = newId('CONV-PRIVATE');
        await createOne('conversations', {
          id,
          type: 'private',
          title: '',
          participantUids: [user.uid, createTarget],
          lastMessageAt: now(),
          createdBy: user.uid,
        });
        setActiveId(id);
        setMobileShowChat(true);
        setOpenCreate(false);
        setCreateTarget('');
        toast.success('تم إنشاء المحادثة');
      } catch {
        toast.error('فشل الإنشاء');
      } finally { setBusy(false); }
    } else {
      const id = 'CONV-TEAM-' + createTeamId;
      const existing = conversations.find((c) => c.id === id);
      if (existing) {
        setActiveId(id);
        setMobileShowChat(true);
        setOpenCreate(false);
        toast.info('المحادثة موجودة');
        return;
      }
      setBusy(true);
      try {
        await createOne('conversations', {
          id,
          type: 'team',
          title: 'فريق ' + (teams.find((t) => t.id === createTeamId)?.name ?? ''),
          teamId: createTeamId,
          participantUids: [],
          lastMessageAt: now(),
          createdBy: user.uid,
        });
        setActiveId(id);
        setMobileShowChat(true);
        setOpenCreate(false);
        toast.success('تم إنشاء محادثة الفريق');
      } catch {
        toast.error('فشل الإنشاء');
      } finally { setBusy(false); }
    }
  };

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <div className="chat-layout">
        <div className={'chat-sidebar' + (mobileShowChat ? ' is-hidden show-desktop' : '')}>
          <div className="chat-sidebar__head">
            <div className="row row--between" style={{ gap: 8 }}>
              <div className="chat-sidebar__title">المحادثات</div>
              <button
                type="button"
                className="chat-sidebar__new"
                onClick={() => setOpenCreate(true)}
              >
                + جديدة
              </button>
            </div>
          </div>
          <ConversationList
            conversations={myConversations}
            activeId={currentId ?? undefined}
            currentUser={user}
            users={users}
            onSelect={(id) => { setActiveId(id); setMobileShowChat(true); }}
          />
        </div>

        <div className={'chat-panel' + (!mobileShowChat ? ' is-hidden show-desktop' : '')}>
          {!active ? (
            <div className="chat-panel__empty">
              <div className="chat-panel__empty-icon">💬</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>اختر محادثة</div>
              <div className="small muted">أو أنشئ واحدة جديدة من زر "+ جديدة"</div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button
                  type="button"
                  className="chat-header__back"
                  onClick={() => setMobileShowChat(false)}
                  aria-label="رجوع"
                >
                  ‹
                </button>
                <div className="chat-header__info">
                  <div className="chat-header__title">{getConvName()}</div>
                  <div className="chat-header__sub">
                    {active.type === 'general'
                      ? 'الجميع'
                      : active.type === 'team'
                        ? 'فريق'
                        : 'محادثة خاصة'}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {activeMessages.length === 0 ? (
                  <EmptyState title="ابدأ المحادثة" message="لا رسائل بعد. كن أول من يكتب." />
                ) : (
                  activeMessages.map((m) => (
                    <MessageBubble key={m.id} message={m} currentUser={user} />
                  ))
                )}
              </div>

              <Composer onSend={sendMessage} />
            </>
          )}
        </div>
      </div>

      <Modal
        open={openCreate}
        title="محادثة جديدة"
        onClose={() => setOpenCreate(false)}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setOpenCreate(false)}>
              إلغاء
            </button>
            <button type="button" className="btn btn--primary" onClick={createConversation} disabled={busy}>
              {busy ? '...' : 'إنشاء'}
            </button>
          </>
        }
      >
        <FormField label="النوع" required>
          <Select
            value={createType}
            onChange={(v) => setCreateType(v as 'private' | 'team')}
            options={[
              { value: 'private', label: 'محادثة خاصة (مع عضو)' },
              { value: 'team', label: 'محادثة فريق' },
            ]}
          />
        </FormField>

        {createType === 'private' ? (
          <FormField label="العضو" required hint={otherUsers.length === 0 ? 'لا يوجد أعضاء آخرون' : undefined}>
            <Select
              value={createTarget}
              onChange={setCreateTarget}
              options={[
                { value: '', label: otherUsers.length === 0 ? '— لا يوجد أعضاء —' : '— اختر عضوًا —' },
                ...otherUsers.map((u) => ({
                  value: u.uid,
                  label: u.displayName + (u.email ? ' (' + u.email + ')' : ''),
                })),
              ]}
            />
          </FormField>
        ) : (
          <FormField label="الفريق" required>
            <Select
              value={createTeamId}
              onChange={(v) => setCreateTeamId(v as TeamId)}
              options={teams.map((t) => ({ value: t.id, label: t.name }))}
            />
          </FormField>
        )}

        <p className="small muted mt-3" style={{ lineHeight: 1.7 }}>
          ملاحظة: لو المحادثة موجودة بالفعل، سيتم فتحها مباشرة.
        </p>
      </Modal>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   7) AdminUsersPage — إصلاح add user
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/admin/AdminUsersPage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { adminCreateMember, type CreateMemberInput } from '@/lib/auth';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { ROLE_LABEL } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, Select, MultiSelect } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import type { AppUser, RoleId, TeamId } from '@/types';

const ROLE_OPTIONS: Array<{ value: RoleId; label: string }> = (
  Object.entries(ROLE_LABEL) as Array<[RoleId, string]>
).map(([value, label]) => ({ value, label }));

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 10; i += 1) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass + '@1';
}

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const { data: users, loading } = useCollection<AppUser>('users');

  const [openCreate, setOpenCreate] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(generatePassword());
  const [name, setName] = useState('');
  const [role, setRole] = useState<RoleId>('MEMBER');
  const [teamId, setTeamId] = useState<TeamId>('helpers');
  const [committeeIds, setCommitteeIds] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [createdAccount, setCreatedAccount] = useState<{ email: string; password: string; name: string } | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword(generatePassword());
    setName('');
    setRole('MEMBER');
    setTeamId('helpers');
    setCommitteeIds([]);
    setBio('');
  };

  const handleCreate = async () => {
    if (!email.trim() || !password || !name.trim()) {
      toast.error('البيانات ناقصة', 'البريد، كلمة المرور، والاسم مطلوبة');
      return;
    }
    if (password.length < 6) {
      toast.error('كلمة المرور ضعيفة');
      return;
    }
    setBusy(true);
    try {
      const input: CreateMemberInput = {
        email: email.trim(),
        temporaryPassword: password,
        name: name.trim(),
        role,
        teamIds: [teamId],
        committeeIds,
        bio: bio.trim() || undefined,
      };
      await adminCreateMember(input, me?.uid ?? 'system');
      await logAudit(me, 'CREATE_USER', 'User', email, 'إنشاء حساب: ' + name);
      setCreatedAccount({ email: input.email, password: input.temporaryPassword, name: input.name });
      toast.success('تم إنشاء الحساب');
      resetForm();
      setOpenCreate(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الإنشاء';
      toast.error('فشل الإنشاء', msg);
    } finally { setBusy(false); }
  };

  const changeRole = async (uid: string, newRole: RoleId) => {
    try {
      await updateOne('users', uid, { role: newRole });
      await logAudit(me, 'CHANGE_ROLE', 'User', uid, 'تغيير الدور');
      toast.success('تم تغيير الدور');
    } catch { toast.error('فشل'); }
  };

  const changeTeam = async (uid: string, newTeam: TeamId) => {
    try {
      await updateOne('users', uid, { teamId: newTeam });
      toast.success('تم تغيير الفريق');
    } catch { toast.error('فشل'); }
  };

  const linkMember = async (uid: string, memberId: string) => {
    try {
      await updateOne('users', uid, { memberId: memberId || null });
      if (memberId) await updateOne('members', memberId, { linkedUserId: uid });
      toast.success('تم الربط');
    } catch { toast.error('فشل'); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('users', toDelete);
      await logAudit(me, 'DELETE_USER', 'User', toDelete, 'حذف');
      toast.success('تم الحذف');
      setToDelete(null);
    } catch { toast.error('فشل'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="إدارة"
        title="المستخدمون"
        description="إنشاء الحسابات، الأدوار، والربط بالأعضاء."
      />

      <SectionHeader
        eyebrow="القائمة"
        title={'المستخدمون (' + users.length + ')'}
        action={
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => { resetForm(); setOpenCreate(true); }}
          >
            + مستخدم جديد
          </button>
        }
      />

      {loading ? (
        <SkeletonList count={6} />
      ) : users.length === 0 ? (
        <EmptyState title="لا مستخدمين" message="ابدأ بإنشاء أول مستخدم."
          action={<button type="button" className="btn btn--primary" onClick={() => { resetForm(); setOpenCreate(true); }}>+ إنشاء</button>} />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد</th>
                <th>الدور</th>
                <th>الفريق</th>
                <th>العضو</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td data-label="الاسم" style={{ fontWeight: 700 }}>
                    {u.displayName}
                    {u.mustChangePassword ? <Badge variant="warning" className="mt-2">جديد</Badge> : null}
                  </td>
                  <td className="muted small" data-label="البريد" dir="ltr">{u.email}</td>
                  <td data-label="الدور">
                    <select
                      className="input"
                      value={u.role}
                      onChange={(e) => changeRole(u.uid, e.target.value as RoleId)}
                      style={{ minWidth: 140 }}
                    >
                      {ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td data-label="الفريق">
                    <select
                      className="input"
                      value={u.teamId ?? ''}
                      onChange={(e) => changeTeam(u.uid, e.target.value as TeamId)}
                      style={{ minWidth: 120 }}
                    >
                      <option value="">— بدون —</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td data-label="العضو">
                    <select
                      className="input"
                      value={u.memberId ?? ''}
                      onChange={(e) => linkMember(u.uid, e.target.value)}
                      style={{ minWidth: 140 }}
                    >
                      <option value="">— غير مرتبط —</option>
                      {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </td>
                  <td data-label="إجراءات">
                    <button
                      type="button"
                      className="btn btn--danger btn--xs"
                      onClick={() => setToDelete(u.uid)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={openCreate}
        title="إنشاء مستخدم جديد"
        onClose={() => setOpenCreate(false)}
        wide
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setOpenCreate(false)}>إلغاء</button>
            <button type="button" className="btn btn--primary" onClick={handleCreate} disabled={busy}>
              {busy ? '...' : 'إنشاء'}
            </button>
          </>
        }
      >
        <FormField label="الاسم الكامل" required>
          <TextInput value={name} onChange={setName} placeholder="مثال: أحمد محمد" />
        </FormField>
        <FormField label="البريد الإلكتروني" required>
          <TextInput value={email} onChange={setEmail} type="email" placeholder="name@resala-stem.org" />
        </FormField>
        <FormField label="كلمة المرور المؤقتة" required hint="سيُطلب تغييرها عند أول دخول">
          <div style={{ display: 'flex', gap: 8 }}>
            <TextInput value={password} onChange={setPassword} type="text" />
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPassword(generatePassword())}>
              توليد
            </button>
          </div>
        </FormField>
        <FormField label="الدور" required>
          <Select value={role} onChange={(v) => setRole(v as RoleId)} options={ROLE_OPTIONS} />
        </FormField>
        <FormField label="الفريق" required>
          <Select value={teamId} onChange={(v) => setTeamId(v as TeamId)}
            options={teams.map((t) => ({ value: t.id, label: t.name }))} />
        </FormField>
        <FormField label="اللجان">
          <MultiSelect
            values={committeeIds}
            onChange={setCommitteeIds}
            options={committees.map((c) => ({ value: c.id, label: c.nameAr }))}
          />
        </FormField>
        <FormField label="نبذة قصيرة">
          <TextInput value={bio} onChange={setBio} placeholder="مثال: مطور واجهات" />
        </FormField>
      </Modal>

      {/* Created Account Info */}
      <Modal
        open={createdAccount !== null}
        title="✓ تم إنشاء الحساب"
        onClose={() => setCreatedAccount(null)}
        footer={
          <button type="button" className="btn btn--primary" onClick={() => setCreatedAccount(null)}>
            فهمت
          </button>
        }
      >
        <p style={{ lineHeight: 1.8, marginBottom: 16 }}>أرسل بيانات الدخول التالية إلى العضو:</p>
        <div style={{
          background: 'var(--c-off-white)', border: '1px solid var(--c-line)',
          borderRadius: 'var(--radius-sm)', padding: 16, fontSize: '0.9rem', lineHeight: 2,
        }}>
          <div><strong>الاسم:</strong> {createdAccount?.name}</div>
          <div style={{ wordBreak: 'break-all' }}><strong>البريد:</strong>{' '}<span dir="ltr">{createdAccount?.email}</span></div>
          <div style={{ wordBreak: 'break-all' }}><strong>كلمة المرور:</strong>{' '}<span dir="ltr" style={{ fontFamily: 'var(--font-en)' }}>{createdAccount?.password}</span></div>
        </div>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="حذف المستخدم"
        message="هل أنت متأكد؟ لا يمكن التراجع."
        confirmLabel="حذف"
        danger
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   8) AdminMembersPage — teams + committees تلقائية
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/admin/AdminMembersPage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { ROLE_LABEL } from '@/lib/permissions';
import { hoursToPoints } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  FormField, TextInput, NumberInput, TextArea, Select, MultiSelect,
} from '@/components/ui/FormField';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from '@/components/ui/Toast';
import type { Member, RoleId, TeamId } from '@/types';

const ROLE_OPTIONS = Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }));

const EMPTY_MEMBER: Omit<Member, 'id'> = {
  name: '',
  role: 'MEMBER',
  teamIds: [],
  committeeIds: [],
  joinedSeason: 7,
  hours: 0,
  status: 'active',
  bio: '',
  email: '',
};

export function AdminMembersPage() {
  const { user: me } = useAuth();
  const { data: members, loading } = useCollection<Member>('members');
  const { data: committeesLive } = useCollection<{ id: string; nameAr: string }>('committees');

  const [editing, setEditing] = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Member, 'id'>>(EMPTY_MEMBER);
  const [toDelete, setToDelete] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  // اللجان الحية — fallback للثابتة
  const liveCommittees = committeesLive.length > 0
    ? committeesLive.map((c) => ({ id: c.id, nameAr: c.nameAr }))
    : committees.map((c) => ({ id: c.id, nameAr: c.nameAr }));

  const filtered = members.filter((m) => !search.trim() || m.name.includes(search.trim()));

  const openCreate = () => {
    setForm(EMPTY_MEMBER);
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (m: Member) => {
    setForm({
      name: m.name, role: m.role, teamIds: m.teamIds, committeeIds: m.committeeIds,
      joinedSeason: m.joinedSeason, hours: m.hours, status: m.status,
      bio: m.bio || '', email: m.email || '',
    });
    setEditing(m);
    setCreating(false);
  };

  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.name.trim()) { toast.error('الاسم مطلوب'); return; }
    if (form.teamIds.length === 0) { toast.error('اختر فريقًا واحدًا على الأقل'); return; }
    setBusy(true);
    try {
      if (editing) {
        await updateOne('members', editing.id, form);
        await logAudit(me, 'UPDATE_MEMBER', 'Member', editing.id, form.name);
        toast.success('تم التحديث');
      } else {
        const id = 'M-' + Date.now().toString(36).toUpperCase();
        await createOne('members', { id, ...form });
        await logAudit(me, 'CREATE_MEMBER', 'Member', id, form.name);
        toast.success('تمت الإضافة');
      }
      close();
    } catch { toast.error('فشل الحفظ'); }
    finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('members', toDelete.id);
      await logAudit(me, 'DELETE_MEMBER', 'Member', toDelete.id, toDelete.name);
      toast.success('تم الحذف');
      setToDelete(null);
    } catch { toast.error('فشل'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="إدارة"
        title="الأعضاء"
        description="إضافة وتعديل وحذف بيانات الأعضاء."
      />

      <div className="toolbar">
        <input
          className="input"
          type="search"
          placeholder="ابحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <SectionHeader
        eyebrow="القائمة"
        title={'الأعضاء (' + filtered.length + ')'}
        action={
          <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
            + عضو جديد
          </button>
        }
      />

      {loading ? (
        <SkeletonList count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState title="لا أعضاء" message="لم يُعثر على أعضاء." />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الدور</th>
                <th>الفرق</th>
                <th>اللجان</th>
                <th>الساعات</th>
                <th>النقاط</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const memberTeams = teams.filter((t) => m.teamIds.includes(t.id));
                const memberCommittees = liveCommittees.filter((c) => m.committeeIds.includes(c.id));
                return (
                  <tr key={m.id}>
                    <td data-label="الاسم">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={m.name} size={30} variant="navy" />
                        <span style={{ fontWeight: 700 }}>{m.name}</span>
                      </div>
                    </td>
                    <td className="muted small" data-label="الدور">{ROLE_LABEL[m.role]}</td>
                    <td data-label="الفرق">
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {memberTeams.map((t) => <span key={t.id} className="badge">{t.name}</span>)}
                      </div>
                    </td>
                    <td data-label="اللجان">
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {memberCommittees.length === 0 ? (
                          <span className="muted small">—</span>
                        ) : (
                          memberCommittees.map((c) => <span key={c.id} className="badge">{c.nameAr}</span>)
                        )}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-en)' }} data-label="الساعات">{m.hours}</td>
                    <td className="points" data-label="النقاط">{hoursToPoints(m.hours)}</td>
                    <td data-label="إجراءات">
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(m)}>تعديل</button>
                        <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(m)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        title={editing ? 'تعديل عضو' : 'إضافة عضو'}
        onClose={close}
        wide
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={close}>إلغاء</button>
            <button type="button" className="btn btn--primary" onClick={save} disabled={busy}>
              {busy ? '...' : 'حفظ'}
            </button>
          </>
        }
      >
        <FormField label="الاسم الكامل" required>
          <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="الاسم الحقيقي" />
        </FormField>
        <FormField label="البريد الإلكتروني">
          <TextInput value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} type="email" />
        </FormField>
        <FormField label="الدور" required>
          <Select value={form.role} onChange={(v) => setForm({ ...form, role: v as RoleId })} options={ROLE_OPTIONS} />
        </FormField>
        <FormField label="الفرق" required>
          <MultiSelect
            values={form.teamIds}
            onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })}
            options={teams.map((t) => ({ value: t.id, label: t.name }))}
          />
        </FormField>
        <FormField label="اللجان" hint={liveCommittees.length === 0 ? 'لا توجد لجان — أضفها من صفحة اللجان' : undefined}>
          <MultiSelect
            values={form.committeeIds}
            onChange={(v) => setForm({ ...form, committeeIds: v })}
            options={liveCommittees.map((c) => ({ value: c.id, label: c.nameAr }))}
          />
        </FormField>
        <FormField label="الساعات">
          <NumberInput value={form.hours} onChange={(v) => setForm({ ...form, hours: v })} min={0} />
        </FormField>
        <FormField label="الحالة">
          <Select
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' | 'suspended' })}
            options={[
              { value: 'active', label: 'نشط' },
              { value: 'inactive', label: 'غير نشط' },
              { value: 'suspended', label: 'موقوف' },
            ]}
          />
        </FormField>
        <FormField label="نبذة">
          <TextArea value={form.bio || ''} onChange={(v) => setForm({ ...form, bio: v })} rows={2} />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="حذف العضو"
        message={'سيتم حذف "' + (toDelete?.name || '') + '". متابعة؟'}
        confirmLabel="حذف"
        danger
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   9) AdminAchievementsPage — بدون تصنيف
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/admin/AdminAchievementsPage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { teams } from '@/data/teams';
import { members } from '@/data/members';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, TextArea, DateInput, MultiSelect } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import type { Achievement, TeamId } from '@/types';

const EMPTY: Omit<Achievement, 'id'> = {
  title: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  level: 'branch',
  teamIds: [],
  memberIds: [],
  memberNames: [],
  seasonId: 'S7',
};

export function AdminAchievementsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<Achievement>('achievements');
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Achievement, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<Achievement | null>(null);
  const [busy, setBusy] = useState(false);

  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
  const openEdit = (a: Achievement) => {
    setForm({
      title: a.title, description: a.description, date: a.date,
      level: a.level, teamIds: a.teamIds, memberIds: a.memberIds,
      memberNames: a.memberNames, seasonId: a.seasonId,
    });
    setEditing(a); setCreating(false);
  };
  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('العنوان والوصف مطلوبان');
      return;
    }
    setBusy(true);
    try {
      const memberNames = form.memberIds
        .map((id) => members.find((m) => m.id === id)?.name)
        .filter((n): n is string => Boolean(n));
      const payload = { ...form, memberNames };

      if (editing) {
        await updateOne('achievements', editing.id, payload);
        await logAudit(me, 'UPDATE_ACHIEVEMENT', 'Achievement', editing.id, form.title);
        toast.success('تم التحديث');
      } else {
        const id = 'A-' + Date.now().toString(36).toUpperCase();
        await createOne('achievements', { id, ...payload });
        await logAudit(me, 'CREATE_ACHIEVEMENT', 'Achievement', id, form.title);
        toast.success('تمت الإضافة');
      }
      close();
    } catch { toast.error('فشل الحفظ'); }
    finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('achievements', toDelete.id);
      await logAudit(me, 'DELETE_ACHIEVEMENT', 'Achievement', toDelete.id, toDelete.title);
      toast.success('تم الحذف');
      setToDelete(null);
    } catch { toast.error('فشل'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="إدارة"
        title="الإنجازات"
        description="إدارة الإنجازات والتكريمات."
      />

      <SectionHeader
        eyebrow="القائمة"
        title={'الإنجازات (' + data.length + ')'}
        action={
          <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
            + إنجاز جديد
          </button>
        }
      />

      {loading ? (
        <SkeletonList count={5} />
      ) : data.length === 0 ? (
        <EmptyState title="لا إنجازات" message="أضف أول إنجاز."
          action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ إضافة</button>} />
      ) : (
        <div className="stack">
          {data.map((a) => (
            <div key={a.id} className="achievement-card">
              <div className="achievement-card__head">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="achievement-card__title">{a.title}</div>
                  <div className="achievement-card__date">{formatDate(a.date)}</div>
                </div>
              </div>
              <p className="achievement-card__desc">{a.description}</p>
              {a.teamIds.length > 0 || a.memberNames.length > 0 ? (
                <div className="achievement-card__tags">
                  {a.teamIds.map((id) => {
                    const t = teams.find((x) => x.id === id);
                    return t ? <Badge key={id} variant="navy">{t.name}</Badge> : null;
                  })}
                  {a.memberNames.map((n, i) => <Badge key={i} variant="info">{n}</Badge>)}
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(a)}>تعديل</button>
                <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(a)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        title={editing ? 'تعديل إنجاز' : 'إنجاز جديد'}
        onClose={close}
        wide
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={close}>إلغاء</button>
            <button type="button" className="btn btn--primary" onClick={save} disabled={busy}>
              {busy ? '...' : 'حفظ'}
            </button>
          </>
        }
      >
        <FormField label="العنوان" required>
          <TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        </FormField>
        <FormField label="الوصف" required>
          <TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={3} />
        </FormField>
        <FormField label="التاريخ" required>
          <DateInput value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
        </FormField>
        <FormField label="الفرق">
          <MultiSelect
            values={form.teamIds}
            onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })}
            options={teams.map((t) => ({ value: t.id, label: t.name }))}
          />
        </FormField>
        <FormField label="الأعضاء">
          <MultiSelect
            values={form.memberIds}
            onChange={(v) => setForm({ ...form, memberIds: v })}
            options={members.map((m) => ({ value: m.id, label: m.name }))}
          />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="حذف الإنجاز"
        message={'سيتم حذف "' + (toDelete?.title || '') + '".'}
        confirmLabel="حذف"
        danger
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   10) AdminAnalyticsPage — ترجمة كل النصوص للعربي
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/admin/AdminAnalyticsPage.tsx",
  `
import { useCollection } from '@/lib/useRealtimeCollection';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL } from '@/lib/format';
import type { Member, Contribution, RequestRecord } from '@/types';

const CONTRIB_STATUS_LABEL: Record<string, string> = {
  pending: 'معلّقة',
  approved: 'معتمدة',
  rejected: 'مرفوضة',
};

export function AdminAnalyticsPage() {
  const { data: liveMembers, loading: loadingM } = useCollection<Member>('members');
  const { data: contributions, loading: loadingC } = useCollection<Contribution>('contributions');
  const { data: requests, loading: loadingR } = useCollection<RequestRecord>('requests');

  if (loadingM || loadingC || loadingR) {
    return <Loading fullHeight message="جارٍ تحميل التحليلات..." />;
  }

  const allMembers = liveMembers.length > 0 ? liveMembers : members;

  const teamStats = teams.map((t) => {
    const teamMembers = allMembers.filter((m) => m.teamIds.includes(t.id));
    const points = teamMembers.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);
    return { team: t, points, count: teamMembers.length };
  }).sort((a, b) => b.points - a.points);

  const committeeStats = committees.map((c) => {
    const committeeMembers = allMembers.filter((m) => m.committeeIds.includes(c.id));
    const points = committeeMembers.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);
    return { committee: c, points, count: committeeMembers.length };
  }).sort((a, b) => b.points - a.points);

  const maxTeamPoints = Math.max(1, ...teamStats.map((s) => s.points));
  const maxCommitteePoints = Math.max(1, ...committeeStats.map((s) => s.points));

  const statusCounts: Record<string, number> = {};
  requests.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });

  const typeCounts: Record<string, number> = {};
  requests.forEach((r) => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1; });

  const contributionsStatusCounts: Record<string, number> = {};
  contributions.forEach((c) => {
    contributionsStatusCounts[c.status] = (contributionsStatusCounts[c.status] || 0) + 1;
  });

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="التحليلات" description="نظرة شاملة على بيانات المنظمة." />

      <section className="section">
        <SectionHeader eyebrow="الفرق" title="نقاط الفرق" />
        <div className="card no-click">
          {teamStats.map((s) => (
            <div key={s.team.id} className="chart-row">
              <span style={{ fontWeight: 700 }}>{s.team.name}</span>
              <div className="chart-bar" style={{ width: Math.round((s.points / maxTeamPoints) * 100) + '%' }} />
              <span style={{ fontFamily: 'var(--font-en)', fontWeight: 800, color: 'var(--c-navy)' }}>
                {s.points}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="اللجان" title="نقاط اللجان" />
        <div className="card no-click">
          {committeeStats.map((s) => (
            <div key={s.committee.id} className="chart-row">
              <span style={{ fontWeight: 700 }}>{s.committee.nameAr}</span>
              <div className="chart-bar chart-bar--red" style={{ width: Math.round((s.points / maxCommitteePoints) * 100) + '%' }} />
              <span style={{ fontFamily: 'var(--font-en)', fontWeight: 800, color: 'var(--c-red)' }}>
                {s.points}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="الطلبات" title="حسب الحالة" />
        <div className="grid grid--narrow">
          {Object.entries(statusCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{REQUEST_STATUS_LABEL[k] ?? k}</div>
              <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-navy)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="الطلبات" title="حسب النوع" />
        <div className="grid grid--narrow">
          {Object.entries(typeCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{REQUEST_TYPE_LABEL[k] ?? k}</div>
              <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-red)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="المشاركات" title="حسب الحالة" />
        <div className="grid grid--narrow">
          {Object.entries(contributionsStatusCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{CONTRIB_STATUS_LABEL[k] ?? k}</div>
              <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-navy)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   11) lib/format.ts — إضافة تسميات عربية
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/lib/format-extra.ts",
  `
/* تسميات عربية إضافية */

export const REQUEST_TYPE_LABEL_FULL: Record<string, string> = {
  TRANSFER: 'نقل بين الفرق',
  PROMOTION: 'ترقية',
  RESIGNATION: 'استقالة',
  COMPLAINT: 'شكوى',
  SUGGESTION: 'اقتراح',
  LEAVE: 'إجازة',
};

export const REQUEST_STATUS_LABEL_FULL: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  IN_REVIEW: 'قيد المراجعة',
  APPROVED: 'معتمد',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغى',
  COMPLETED: 'مكتمل',
};

export const PRIORITY_LABEL_FULL: Record<string, string> = {
  LOW: 'منخفضة',
  NORMAL: 'عادية',
  HIGH: 'مرتفعة',
  URGENT: 'عاجلة',
};

export const WARNING_TYPE_LABEL: Record<string, string> = {
  VERBAL: 'تحذير شفهي',
  WRITTEN: 'تحذير كتابي',
  FINAL: 'تحذير نهائي',
};

export const WARNING_SEVERITY_LABEL: Record<string, string> = {
  LOW: 'منخفضة',
  MEDIUM: 'متوسطة',
  HIGH: 'مرتفعة',
};

export const CONTRIB_STATUS_LABEL: Record<string, string> = {
  pending: 'معلّقة',
  approved: 'معتمدة',
  rejected: 'مرفوضة',
};
`
);

/* ═══════════════════════════════════════════════════════════════
   12) AchievementsPage (public) — بدون تصنيف
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/AchievementsPage.tsx",
  `
import { useCollection } from '@/lib/useRealtimeCollection';
import { AchievementCard } from '@/components/achievement/AchievementCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Loading';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat, StatRow } from '@/components/ui/Stat';
import type { Achievement } from '@/types';

export function AchievementsPage() {
  const { data, loading } = useCollection<Achievement>('achievements');
  const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="container">
      <PageHeader
        eyebrow="الإنجازات"
        title="تكريمات المنظمة"
        description="كل ما حققته المنظمة من إنجازات وتكريمات."
      />

      <section className="section--tight">
        <StatRow>
          <Stat value={data.length} label="إجمالي الإنجازات" />
          <Stat value={data.filter((a) => a.date >= '2026-01-01').length} label="هذا الموسم" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader eyebrow="القائمة" title="كل الإنجازات" />
        {loading ? (
          <div className="stack"><SkeletonCard count={4} /></div>
        ) : sorted.length === 0 ? (
          <EmptyState title="لا إنجازات بعد" message="لم يتم تسجيل أي إنجازات." />
        ) : (
          <div className="stack">
            {sorted.map((a) => <AchievementCard key={a.id} achievement={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   13) AchievementCard — بدون تصنيف
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/components/achievement/AchievementCard.tsx",
  `
import type { Achievement } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { teams } from '@/data/teams';
import { formatDate } from '@/lib/format';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div className="achievement-card">
      <div className="achievement-card__head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="achievement-card__title">{achievement.title}</div>
          <div className="achievement-card__date">{formatDate(achievement.date)}</div>
        </div>
      </div>

      <p className="achievement-card__desc">{achievement.description}</p>

      {achievement.teamIds.length > 0 || achievement.memberNames.length > 0 ? (
        <div className="achievement-card__tags">
          {achievement.teamIds.map((id) => {
            const t = teams.find((x) => x.id === id);
            return t ? <Badge key={id} variant="navy">{t.name}</Badge> : null;
          })}
          {achievement.memberNames.map((n, i) => (
            <Badge key={'m-' + i} variant="info">{n}</Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   14) NotificationsPage — تصميم موحد
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/NotificationsPage.tsx",
  `
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { updateOne } from '@/lib/db';
import { PageHeader } from '@/components/ui/PageHeader';
import { NotificationItem } from '@/components/notification/NotificationItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { toast } from '@/components/ui/Toast';
import type { Notification } from '@/types';

export function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifs, loading } = useRealtimeCollection<Notification>('notifications');

  if (!user) return null;

  const mine = notifs
    .filter((n) => n.userId === user.uid)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const unreadCount = mine.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    try { await updateOne('notifications', id, { read: true }); } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      for (const n of mine) {
        if (!n.read) await updateOne('notifications', n.id, { read: true });
      }
      toast.success('تم تعليم الكل كمقروء');
    } catch { toast.error('فشل التحديث'); }
  };

  return (
    <div className="container">
      <PageHeader
        eyebrow="الإشعارات"
        title="الإشعارات"
        description={
          unreadCount > 0
            ? 'لديك ' + unreadCount + ' إشعار غير مقروء'
            : 'كل الإشعارات مقروءة'
        }
      >
        {unreadCount > 0 ? (
          <button type="button" className="btn btn--ghost btn--sm mt-4" onClick={markAllRead}>
            تعليم الكل كمقروء
          </button>
        ) : null}
      </PageHeader>

      <section className="section">
        {loading ? (
          <SkeletonList count={5} />
        ) : mine.length === 0 ? (
          <EmptyState
            title="لا إشعارات"
            message="لم تتلقَ أي إشعارات حتى الآن. عند حدوث أي نشاط يخصك، ستظهر هنا."
          />
        ) : (
          <div className="stack">
            {mine.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   15) AdminNotificationsPage — إرسال يعمل
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/admin/AdminNotificationsPage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { notifyUser, notifyUsers } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { relativeTime } from '@/lib/format';
import type { AppUser, Notification } from '@/types';

export function AdminNotificationsPage() {
  const { user: me } = useAuth();
  const { data: users } = useCollection<AppUser>('users');
  const { data: notifs, loading } = useCollection<Notification>('notifications');

  const [target, setTarget] = useState<string>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('العنوان والرسالة مطلوبان');
      return;
    }
    setBusy(true);
    try {
      if (target === 'all') {
        await notifyUsers(users, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
      } else if (target === 'managers') {
        const managers = users.filter((u) =>
          ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(u.role),
        );
        await notifyUsers(managers, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
      } else {
        const u = users.find((x) => x.uid === target);
        if (!u) { toast.error('المستخدم غير موجود'); setBusy(false); return; }
        await notifyUser(target, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
      }
      await logAudit(me, 'SEND_NOTIFICATION', 'Notification', target, title);
      setTitle('');
      setMessage('');
      toast.success('تم الإرسال');
    } catch { toast.error('فشل الإرسال'); }
    finally { setBusy(false); }
  };

  const sorted = [...notifs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30);

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="إرسال إشعار" description="إشعارات فورية للأعضاء والمدراء." />

      <SectionHeader eyebrow="إرسال" title="إشعار جديد" />
      <div className="card no-click" style={{ maxWidth: 720 }}>
        <FormField label="المستقبل" required>
          <Select
            value={target}
            onChange={setTarget}
            options={[
              { value: 'all', label: 'الجميع (' + users.length + ')' },
              { value: 'managers', label: 'المدراء فقط' },
              ...users.map((u) => ({ value: u.uid, label: u.displayName + ' (' + u.email + ')' })),
            ]}
          />
        </FormField>
        <FormField label="العنوان" required>
          <TextInput value={title} onChange={setTitle} />
        </FormField>
        <FormField label="الرسالة" required>
          <TextArea value={message} onChange={setMessage} rows={4} />
        </FormField>
        <FormField label="الأولوية">
          <Select
            value={priority}
            onChange={(v) => setPriority(v as 'low' | 'normal' | 'high')}
            options={[
              { value: 'low', label: 'منخفضة' },
              { value: 'normal', label: 'عادية' },
              { value: 'high', label: 'مرتفعة' },
            ]}
          />
        </FormField>
        <button type="button" className="btn btn--primary btn--block" onClick={send} disabled={busy}>
          {busy ? '...' : 'إرسال الإشعار'}
        </button>
      </div>

      <SectionHeader eyebrow="السجل" title={'آخر الإشعارات (' + notifs.length + ')'} />

      {loading ? (
        <SkeletonList count={6} />
      ) : sorted.length === 0 ? (
        <EmptyState title="لا إشعارات" message="لم يتم إرسال أي إشعارات." />
      ) : (
        <div className="stack">
          {sorted.map((n) => (
            <div key={n.id} className="card no-click">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{n.title}</div>
                  <div className="card__meta">{n.message}</div>
                </div>
                {!n.read ? <Badge variant="red">جديد</Badge> : <Badge variant="success">مقروء</Badge>}
              </div>
              <div className="tiny muted mt-2">{relativeTime(n.date)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   RUN
   ═══════════════════════════════════════════════════════════════ */
console.log("");
console.log(
  `${C.bold}${C.magenta}╔══════════════════════════════════════════════════════╗${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}║  fix.cjs — v5.4 التجربة الشاملة للأدمن               ║${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}║  Rebuild: Home + Requests + Conversations + Users   ║${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}╚══════════════════════════════════════════════════════╝${C.reset}`
);
console.log("");

ensureDir(BACKUP_DIR);
console.log(`${C.dim}Backup: .fix-backups/${STAMP}/${C.reset}\n`);

const count = writeAll();

console.log("");
console.log(`${C.bold}═══ الخلاصة ═══${C.reset}`);
console.log(`  ${C.green}✓ عدد الملفات: ${count}${C.reset}`);
console.log("");

console.log(`${C.bold}▶ التحقق من TypeScript${C.reset}\n`);
let ok = false;
try {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  ok = true;
  console.log(`\n${C.green}${C.bold}✓ لا أخطاء TypeScript!${C.reset}`);
} catch {
  console.log(`\n${C.yellow}⚠ ما زالت هناك أخطاء${C.reset}`);
}

console.log("");
if (ok) {
  console.log(`${C.bold}الخطوة التالية:${C.reset}`);
  console.log(`  ${C.cyan}git add -A`);
  console.log(
    `  git commit -m "feat(v5.4): comprehensive admin experience rebuild"`
  );
  console.log(`  git push origin main --force${C.reset}`);
}
console.log("");
