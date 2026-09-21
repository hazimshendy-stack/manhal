#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * ═══════════════════════════════════════════════════════════════
 *  sbapiaryy — fix.cjs  (v5.1 → v5.2)
 *  Comprehensive fix script — applies all client requirements
 * ═══════════════════════════════════════════════════════════════
 *  Usage:
 *    node fix.cjs              → apply fixes
 *    node fix.cjs --dry        → preview only
 *    node fix.cjs --no-backup  → skip backup
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry");
const NO_BACKUP = process.argv.includes("--no-backup");
const STAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const BACKUP_DIR = path.join(ROOT, ".fix-backups", STAMP);

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const stats = { written: 0, backed: 0, skipped: 0, failed: 0 };
const files = {}; // path → content

/* ─────────── helpers ─────────── */
const file = (p, c) => {
  files[p.replace(/\\/g, "/")] = c.trimStart();
};

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function backup(rel) {
  if (NO_BACKUP) return;
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  const dst = path.join(BACKUP_DIR, rel);
  ensureDir(path.dirname(dst));
  fs.copyFileSync(abs, dst);
  stats.backed += 1;
}

function writeAll() {
  const list = Object.entries(files);
  for (const [rel, content] of list) {
    try {
      backup(rel);
      if (DRY) {
        console.log(`${C.yellow}[dry]${C.reset} ${rel}`);
        stats.skipped += 1;
        continue;
      }
      const abs = path.join(ROOT, rel);
      ensureDir(path.dirname(abs));
      fs.writeFileSync(abs, content, "utf8");
      console.log(`${C.green}✓${C.reset} ${rel}`);
      stats.written += 1;
    } catch (err) {
      console.error(`${C.red}✗ ${rel}${C.reset} — ${err.message}`);
      stats.failed += 1;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   1) LAYOUT — الصفحات مش لازقة في الأطراف
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/layout.css",
  `
/* ═══════════════════════════════════════════════════════════════
   App Shell — padding محسّن حول كل الصفحات
   ═══════════════════════════════════════════════════════════════ */

.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: var(--safe-top);
  overflow-x: hidden;
}

.app-main {
  flex: 1;
  padding-bottom: var(--safe-bottom);
  padding-inline: 0;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: 24px;
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .container { padding-inline: 32px; }
}

@media (min-width: 1024px) {
  .container { padding-inline: 40px; }
}

@media (max-width: 480px) {
  .container { padding-inline: 20px; }
}

/* ═══════════════════════════════════════════════════════════════
   Sections
   ═══════════════════════════════════════════════════════════════ */

.section { padding-block: 28px; }
.section--tight { padding-block: 18px; }

@media (min-width: 640px) {
  .section { padding-block: 36px; }
  .section--tight { padding-block: 22px; }
}

/* ═══════════════════════════════════════════════════════════════
   Section Header
   ═══════════════════════════════════════════════════════════════ */

.section-head {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

@media (min-width: 640px) {
  .section-head {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
  }
}

.section-head__eyebrow {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--c-red);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.section-head h2 { font-size: 1.4rem; font-weight: 800; }

.section-head__desc {
  color: var(--c-ink-muted);
  font-size: 0.9rem;
  margin-top: 8px;
  max-width: 62ch;
  line-height: 1.65;
}

/* ═══════════════════════════════════════════════════════════════
   Grid
   ═══════════════════════════════════════════════════════════════ */

.grid { display: grid; gap: 16px; grid-template-columns: 1fr; }

@media (min-width: 480px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 18px; } }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; } }

.grid--wide { grid-template-columns: 1fr; }
@media (min-width: 640px) { .grid--wide { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid--wide { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); } }

.grid--narrow { grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (min-width: 640px) { .grid--narrow { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; } }

.grid--2 { grid-template-columns: 1fr; }
@media (min-width: 768px) { .grid--2 { grid-template-columns: repeat(2, 1fr); } }

/* ═══════════════════════════════════════════════════════════════
   Stack / Row
   ═══════════════════════════════════════════════════════════════ */

.stack { display: flex; flex-direction: column; gap: 16px; }
.stack--sm { gap: 10px; }
.stack--lg { gap: 24px; }

.row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.row--between { justify-content: space-between; }
.row--gap-6 { gap: 6px; }
.row--gap-16 { gap: 16px; }

/* ═══════════════════════════════════════════════════════════════
   Utilities
   ═══════════════════════════════════════════════════════════════ */

.muted { color: var(--c-ink-muted); }
.soft { color: var(--c-ink-soft); }
.small { font-size: 0.82rem; }
.tiny { font-size: 0.72rem; }
.center { text-align: center; }
.grow { flex: 1; min-width: 0; }
.nowrap { white-space: nowrap; }

.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-5 { margin-top: 20px; }
.mt-6 { margin-top: 24px; }

.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }

.hide-mobile { display: none; }

@media (min-width: 768px) {
  .hide-mobile { display: block; }
  .show-mobile { display: none !important; }
}
`
);

/* ═══════════════════════════════════════════════════════════════
   2) AVATAR — بدون أول حرفين
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/Avatar.tsx",
  `
/**
 * Avatar — بدون أول حرفين
 * - لو مفيش صورة → Placeholder احترافي (رمز عام موحّد)
 * - ممنوع استخدام initials
 */

interface AvatarProps {
  name?: string;
  size?: number;
  variant?: 'navy' | 'red' | 'gradient' | 'light';
  src?: string;
}

const BG: Record<string, string> = {
  navy: 'var(--c-navy)',
  red: 'var(--c-red)',
  gradient: 'linear-gradient(150deg, var(--c-red), var(--c-red-soft))',
  light: 'var(--c-off-white)',
};

export function Avatar({
  name,
  size = 44,
  variant = 'navy',
  src,
}: AvatarProps) {
  const isLight = variant === 'light';

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.9)',
          boxShadow: '0 2px 8px rgba(21, 26, 69, 0.12)',
        }}
      />
    );
  }

  return (
    <div
      aria-label={name ?? 'صورة العضو'}
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: BG[variant],
        color: isLight ? 'var(--c-navy)' : '#fff',
        flexShrink: 0,
        border: isLight ? '1.5px solid var(--c-line-mid)' : '2px solid rgba(255,255,255,0.15)',
        userSelect: 'none',
        boxShadow: '0 2px 8px rgba(21, 26, 69, 0.10)',
      }}
    >
      <svg
        width={Math.round(size * 0.5)}
        height={Math.round(size * 0.5)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   3) MEMBER CARD — الاسم يظهر بالكامل + شكل منظم
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/member/MemberCard.tsx",
  `
import { Link } from 'react-router-dom';
import type { Member } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { ROLE_LABEL } from '@/lib/permissions';
import { teams } from '@/data/teams';
import { hoursToPoints } from '@/lib/format';

interface MemberCardProps {
  member: Member;
  showTeam?: boolean;
  showCommittee?: boolean;
}

export function MemberCard({ member, showTeam = true }: MemberCardProps) {
  const totalPoints = hoursToPoints(member.hours || 0);
  const memberTeams = teams.filter((t) => member.teamIds.includes(t.id));

  return (
    <Link to={'/members/' + member.id} className="member-card">
      <div className="member-card__head">
        <Avatar name={member.name} size={56} variant="navy" />
        <div className="member-card__info">
          <div className="member-card__name">{member.name}</div>
          <div className="member-card__role">{ROLE_LABEL[member.role]}</div>
        </div>
      </div>

      {showTeam && memberTeams.length > 0 ? (
        <div className="member-card__teams">
          {memberTeams.map((t) => (
            <span key={t.id} className="member-card__team-tag">
              {t.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="member-card__stats">
        <div className="member-card__stat">
          <span className="member-card__stat-value">{member.hours || 0}</span>
          <span className="member-card__stat-label">ساعة</span>
        </div>
        <div className="member-card__stat member-card__stat--red">
          <span className="member-card__stat-value">{totalPoints}</span>
          <span className="member-card__stat-label">نقطة</span>
        </div>
      </div>
    </Link>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   4) CARDS CSS — عضو منظم + حجم مناسب
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/member-card.css",
  `
/* ═══════════════════════════════════════════════════════════════
   Member Card — اسم ظاهر بالكامل + تنسيق منظم
   ═══════════════════════════════════════════════════════════════ */

.member-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--c-ink);
  transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease), border-color 0.18s var(--ease);
  box-shadow: var(--shadow-xs);
  min-height: 190px;
}

.member-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-sm);
  border-color: var(--c-line-mid);
}

.member-card__head {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.member-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-card__name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--c-ink);
  line-height: 1.35;
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: normal;
}

.member-card__role {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--c-ink-muted);
  line-height: 1.4;
}

.member-card__teams {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.member-card__team-tag {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: var(--c-navy);
  color: #fff;
  font-family: var(--font-en);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.member-card__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--c-line);
  margin-top: auto;
}

.member-card__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-card__stat--red { align-items: flex-end; }

.member-card__stat-value {
  font-family: var(--font-en);
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--c-navy);
  line-height: 1;
}

.member-card__stat--red .member-card__stat-value {
  color: var(--c-red);
}

.member-card__stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--c-ink-muted);
}
`
);

/* ═══════════════════════════════════════════════════════════════
   5) DATA — أسماء الفرق إنجليزي فقط + لا لجان افتراضية
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/teams.ts",
  `
import type { Team } from '@/types';

export const teams: Team[] = [
  { id: 'helpers', name: 'Helpers', nameAr: 'Helpers', description: 'Logistics, guidance, onboarding, and daily operations.', color: '#C1272D' },
  { id: 'heroes', name: 'Heroes', nameAr: 'Heroes', description: 'Field activities, community outreach, and large volunteering campaigns.', color: '#FB923C' },
  { id: 'coders', name: 'Coders', nameAr: 'Coders', description: 'Designs and builds tools, platforms, and automation used across the org.', color: '#60A5FA' },
  { id: 'enviros', name: 'Enviros', nameAr: 'Enviros', description: 'Sustainability programs: recycling, tree planting, and environmental awareness.', color: '#16A34A' },
  { id: 'messages', name: 'Messages', nameAr: 'Messages', description: 'Narrative, content, media, documentation, and communication.', color: '#A78BFA' },
  { id: 'masar', name: 'Masar', nameAr: 'Masar', description: 'Supports students through guidance, career paths, and mentoring programs.', color: '#F472B6' },
  { id: 'rstc', name: 'RSTC', nameAr: 'RSTC', description: 'Resala STEM Training Center — curriculum, trainer training, and quality.', color: '#22D3EE' },
];
`
);

file(
  "src/data/governance.ts",
  `
import type { GovernanceDocument } from '@/types';

/**
 * لا توجد وثائق افتراضية.
 * الأدمن يضيف السياسات من /admin/governance.
 * المستخدم العادي يرى فقط ما أضافه الأدمن.
 */
export const governanceDocuments: GovernanceDocument[] = [];
`
);

file(
  "src/data/onboarding.ts",
  `
import type { OnboardingCard } from '@/types';

/**
 * Flash Cards — بدون أيقونات
 */
export const onboardingCards: OnboardingCard[] = [
  {
    id: 'welcome',
    icon: '',
    title: 'أهلاً بك في sbapiaryy',
    description: 'منصة فروع Resala STEM — كل ما تحتاجه في مكان واحد: الأعضاء، الفرق، المشاركات، الطلبات، والإنجازات.',
    accentColor: '#C1272D',
    order: 1,
  },
  {
    id: 'teams',
    icon: '',
    title: 'سبع فرق متخصصة',
    description: 'Helpers · Heroes · Coders · Enviros · Messages · Masar · RSTC',
    accentColor: '#60A5FA',
    order: 2,
  },
  {
    id: 'contributions',
    icon: '',
    title: 'سجّل ساعاتك',
    description: 'كل ساعة عمل موثقة ومعتمدة = 5 نقاط. سجّل مشاركاتك واحصل على اعتماد رئيس فريقك.',
    accentColor: '#16A34A',
    order: 3,
  },
  {
    id: 'league',
    icon: '',
    title: 'الليج والتنافس',
    description: 'ترتيبك على مستوى الفريق، اللجنة، والمنظمة. تابع تقدمك ونافس بقية الأعضاء.',
    accentColor: '#F59E0B',
    order: 4,
  },
  {
    id: 'requests',
    icon: '',
    title: 'الطلبات والموافقات',
    description: 'اطلب نقلًا، ترقية، إجازة، أو ارفع شكوى. سلسلة موافقات واضحة وتتابعها لحظيًا.',
    accentColor: '#A78BFA',
    order: 5,
  },
  {
    id: 'messages',
    icon: '',
    title: 'محادثات لحظية',
    description: 'تواصل مع فريقك، الإدارة، أو في المحادثة العامة — كل ذلك داخل المنصة.',
    accentColor: '#EC4899',
    order: 6,
  },
  {
    id: 'calendar',
    icon: '',
    title: 'تقويم مشترك',
    description: 'كل الأحداث والاجتماعات والمواعيد النهائية في مكان واحد.',
    accentColor: '#22D3EE',
    order: 7,
  },
  {
    id: 'pwa',
    icon: '',
    title: 'ثبّت التطبيق',
    description: 'أضف sbapiaryy إلى شاشة هاتفك واستخدمه كتطبيق أصلي بدون شريط المتصفح.',
    accentColor: '#C1272D',
    order: 8,
  },
];
`
);

/* ═══════════════════════════════════════════════════════════════
   6) ONBOARDING — خلفية بيضا + Flash Cards + بدون أيقونات
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/onboarding/Onboarding.tsx",
  `
import { useEffect, useState } from 'react';
import { onboardingCards, site } from '@/data';
import { hasCompletedOnboarding, markOnboardingComplete } from '@/lib/onboarding';

export function Onboarding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
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
`
);

file(
  "src/styles/onboarding.css",
  `
/* ═══════════════════════════════════════════════════════════════
   Onboarding — خلفية بيضا + Flash Cards + بدون أيقونات
   ═══════════════════════════════════════════════════════════════ */

.onboarding-backdrop {
  position: fixed;
  inset: 0;
  background: #FFFFFF;
  z-index: 500;
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  padding-top: calc(32px + var(--safe-top));
  padding-bottom: calc(32px + var(--safe-bottom));
  overflow-y: auto;
  animation: onboarding-in 0.35s var(--ease);
}

@keyframes onboarding-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.onboarding-header {
  text-align: center;
  padding: 24px 16px 8px;
  color: var(--c-ink);
  flex-shrink: 0;
}

.onboarding-header__title {
  font-size: 1.75rem;
  font-weight: 900;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
  color: var(--c-navy);
}

.onboarding-header__subtitle {
  font-size: 0.95rem;
  color: var(--c-ink-muted);
  max-width: 40ch;
  margin: 0 auto;
  line-height: 1.7;
}

.onboarding-body {
  flex: 1;
  max-width: 960px;
  width: 100%;
  margin-inline: auto;
}

.onboarding-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding-block: 24px;
}

@media (min-width: 640px) {
  .onboarding-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
}

.onboarding-card {
  background: var(--c-white);
  border: 1.5px solid var(--c-line);
  border-radius: var(--radius-lg);
  padding: 24px 22px;
  color: var(--c-ink);
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease), border-color 0.18s var(--ease);
  position: relative;
  overflow: hidden;
}

.onboarding-card::before {
  content: '';
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  width: 4px;
  height: 100%;
  background: var(--c-red);
  opacity: 0.9;
}

.onboarding-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
  border-color: var(--c-line-mid);
}

.onboarding-card__title {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.3;
  color: var(--c-navy);
  padding-inline-start: 8px;
}

.onboarding-card__desc {
  font-size: 0.88rem;
  color: var(--c-ink-soft);
  line-height: 1.75;
  padding-inline-start: 8px;
}

.onboarding-footer {
  padding: 24px 20px 8px;
  text-align: center;
  flex-shrink: 0;
}

.onboarding-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 15px 40px;
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
`
);

/* ═══════════════════════════════════════════════════════════════
   7) ADMIN — بدون أيقونات
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminHomePage.tsx",
  `
import { Link } from 'react-router-dom';
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
import type { AppUser, RequestRecord, Contribution, Notification, Member } from '@/types';

interface AdminCard {
  to: string;
  title: string;
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

  const pendingReq = requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
  const pendingContribs = contributions.filter((c) => c.status === 'pending').length;
  const totalPoints = allMembers.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);

  const onSeed = async () => {
    if (!window.confirm('سيتم رفع البيانات الأساسية إلى Firestore. متابعة؟')) return;
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
    { to: '/admin/committees', title: 'اللجان', count: committees.length, description: 'إدارة اللجان وتوزيع الأعضاء' },
    { to: '/admin/achievements', title: 'الإنجازات', description: 'إدارة الإنجازات' },
    { to: '/admin/warnings', title: 'التحذيرات', description: 'إصدار ومتابعة التحذيرات' },
    { to: '/admin/calendar', title: 'التقويم', description: 'إدارة الأحداث' },
    { to: '/admin/conversations', title: 'المحادثات', description: 'إدارة المحادثات الجماعية' },
    { to: '/admin/notifications', title: 'إرسال إشعار', count: notifs.length, description: 'إرسال إشعارات جماعية' },
    { to: '/admin/governance', title: 'الحوكمة', description: 'إدارة السياسات واللوائح' },
    { to: '/admin/audit', title: 'سجل التغييرات', description: 'تتبع كل الإجراءات' },
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
            <button type="button" className="btn btn--primary" onClick={onSeed} disabled={seeding}>
              {seeding ? 'جارٍ الرفع...' : 'رفع البيانات'}
            </button>
          }
        />
        {result ? (
          <div className="card no-click mt-4">
            <div className="card__title">✓ تم الرفع بنجاح</div>
            <div className="small muted mt-2" style={{ lineHeight: 1.9 }}>
              أعضاء: {result.members} · فرق: {result.teams} · مشاركات: {result.contributions} ·
              طلبات: {result.requests} · موافقات: {result.approvals} · تحذيرات: {result.warnings} ·
              إنجازات: {result.achievements} · إشعارات: {result.notifications} ·
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
                <div className="card__title">{c.title}</div>
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
`
);

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
import type { Member, Contribution, RequestRecord } from '@/types';

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
    <div>
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
              <div className="card__meta">{k}</div>
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
              <div className="card__meta">{k}</div>
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
              <div className="card__meta">{k}</div>
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
   8) ADMIN GOVERNANCE — الأدمن يضيف السياسات بنفسه
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminGovernancePage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, TextArea } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { GovernanceDocument } from '@/types';

const EMPTY: Omit<GovernanceDocument, 'id'> = {
  title: '',
  category: 'السياسات',
  description: '',
  content: '',
  version: '1.0',
  updatedAt: new Date().toISOString().slice(0, 10),
};

export function AdminGovernancePage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<GovernanceDocument>('governance');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GovernanceDocument | null>(null);
  const [form, setForm] = useState<Omit<GovernanceDocument, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<GovernanceDocument | null>(null);
  const [busy, setBusy] = useState(false);

  const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title, 'ar'));

  const openCreate = () => {
    setForm({ ...EMPTY, updatedAt: new Date().toISOString().slice(0, 10) });
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (d: GovernanceDocument) => {
    setForm({
      title: d.title,
      category: d.category,
      description: d.description,
      content: d.content,
      version: d.version,
      updatedAt: d.updatedAt,
    });
    setEditing(d);
    setCreating(false);
  };

  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.title.trim()) { toast.error('العنوان مطلوب'); return; }
    if (!form.content.trim()) { toast.error('الوصف مطلوب'); return; }

    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim() || 'عام',
        description: form.description.trim(),
        content: form.content.trim(),
        version: form.version.trim() || '1.0',
        updatedAt: new Date().toISOString().slice(0, 10),
      };

      if (editing) {
        await updateOne('governance', editing.id, payload);
        await logAudit(me, 'UPDATE_GOVERNANCE', 'Governance', editing.id, payload.title);
        toast.success('تم التحديث');
      } else {
        const id = 'GOV-' + Date.now().toString(36).toUpperCase();
        await createOne('governance', { id, ...payload });
        await logAudit(me, 'CREATE_GOVERNANCE', 'Governance', id, payload.title);
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
      await removeOne('governance', toDelete.id);
      await logAudit(me, 'DELETE_GOVERNANCE', 'Governance', toDelete.id, toDelete.title);
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
        title="الحوكمة"
        description="أضف السياسات والإجراءات واللوائح بنفسك. لا يُضاف أي شيء تلقائيًا."
      />

      <SectionHeader
        eyebrow="القائمة"
        title={'الوثائق (' + data.length + ')'}
        action={
          <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
            + وثيقة جديدة
          </button>
        }
      />

      {loading ? (
        <SkeletonList count={4} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="لا وثائق"
          message="أضف أول وثيقة لتظهر في صفحة الحوكمة."
          action={
            <button type="button" className="btn btn--primary" onClick={openCreate}>
              + إضافة وثيقة
            </button>
          }
        />
      ) : (
        <div className="stack">
          {sorted.map((d) => (
            <div key={d.id} className="card no-click">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{d.title}</div>
                  <div className="card__meta">
                    {d.category} · v{d.version} · آخر تحديث {formatDate(d.updatedAt)}
                  </div>
                </div>
                <Badge variant="info">{d.category}</Badge>
              </div>
              {d.description ? <p className="small soft mt-2">{d.description}</p> : null}
              <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(d)}>تعديل</button>
                <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(d)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        title={editing ? 'تعديل وثيقة' : 'وثيقة جديدة'}
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
          <TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="مثال: لائحة العضوية" />
        </FormField>

        <FormField label="التصنيف" required>
          <TextInput value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="السياسات / الإجراءات / الحوكمة" />
        </FormField>

        <FormField label="الوصف المختصر" hint="يظهر في القائمة كسطر تعريفي">
          <TextInput value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </FormField>

        <FormField label="النص الكامل" required>
          <TextArea value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={8} placeholder="اكتب نص الوثيقة كاملًا هنا..." />
        </FormField>

        <FormField label="الإصدار" required>
          <TextInput value={form.version} onChange={(v) => setForm({ ...form, version: v })} placeholder="1.0" />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="حذف الوثيقة"
        message={'سيتم حذف "' + (toDelete?.title || '') + '". متابعة؟'}
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
   9) GOVERNANCE PAGE (public) — يعرض من الداتا فقط
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/GovernancePage.tsx",
  `
import { useCollection } from '@/lib/useRealtimeCollection';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { formatDate } from '@/lib/format';
import type { GovernanceDocument } from '@/types';

export function GovernancePage() {
  const { data, loading } = useCollection<GovernanceDocument>('governance');
  const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title, 'ar'));

  const grouped = sorted.reduce<Record<string, GovernanceDocument[]>>((acc, doc) => {
    const key = doc.category || 'عام';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  return (
    <div className="container">
      <PageHeader
        eyebrow="الحوكمة"
        title="الوثائق الرسمية"
        description="السياسات والإجراءات واللوائح الرسمية للمنظمة."
      />

      {loading ? (
        <SkeletonList count={4} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="لا وثائق بعد"
          message="لم تُضف أي وثائق حوكمة حتى الآن. تُضاف من قِبل الإدارة."
        />
      ) : (
        Object.entries(grouped).map(([category, docs]) => (
          <section key={category} className="section">
            <SectionHeader eyebrow={category} title={category} />
            <div className="stack">
              {docs.map((d) => (
                <div key={d.id} className="card no-click">
                  <div className="row row--between">
                    <div className="card__title">{d.title}</div>
                    <Badge variant="neutral">v{d.version}</Badge>
                  </div>
                  {d.description ? <div className="card__meta">{d.description}</div> : null}
                  <div className="small muted mt-3">آخر تحديث {formatDate(d.updatedAt)}</div>
                  <p className="mt-3 small soft" style={{ lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                    {d.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   10) SEARCH PAGE — بدون أيقونات
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/SearchPage.tsx",
  `
import { useMemo, useState } from 'react';
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
}

const TYPE_LABEL: Record<string, string> = {
  member: 'عضو',
  contribution: 'مشاركة',
  achievement: 'إنجاز',
  event: 'حدث',
  team: 'فريق',
  committee: 'لجنة',
};

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
        out.push({ id: m.id, type: 'member', title: m.name, subtitle: m.bio?.slice(0, 80), route: '/members/' + m.id });
      }
    });

    contributions.forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        out.push({ id: c.id, type: 'contribution', title: c.title, subtitle: c.memberName + ' · ' + c.hours + ' ساعة', route: '/contributions' });
      }
    });

    achievements.forEach((a) => {
      if (a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)) {
        out.push({ id: a.id, type: 'achievement', title: a.title, subtitle: a.description.slice(0, 80), route: '/achievements' });
      }
    });

    events.forEach((e) => {
      if (e.title.toLowerCase().includes(q)) {
        out.push({ id: e.id, type: 'event', title: e.title, subtitle: e.date, route: '/calendar' });
      }
    });

    teams.forEach((t) => {
      if (t.name.toLowerCase().includes(q)) {
        out.push({ id: t.id, type: 'team', title: t.name, subtitle: t.description, route: '/teams/' + t.id });
      }
    });

    committees.forEach((c) => {
      if (c.nameAr.includes(query) || c.name.toLowerCase().includes(q)) {
        out.push({ id: c.id, type: 'committee', title: c.nameAr, subtitle: c.description, route: '/committees' });
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
        <EmptyState title="ابدأ الكتابة" message="اكتب حرفين على الأقل للبحث." />
      ) : results.length === 0 ? (
        <EmptyState title="لا نتائج" message={'لم يتم العثور على نتائج لـ "' + query + '".'} />
      ) : (
        <div className="stack">
          {results.map((r) => (
            <Link key={r.type + '-' + r.id} to={r.route} className="card">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{r.title}</div>
                  {r.subtitle ? <div className="card__meta">{r.subtitle}</div> : null}
                </div>
                <Badge variant="neutral">{TYPE_LABEL[r.type]}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   11) NOTIFICATIONS ITEM — بدون أيقونات
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/notification/NotificationItem.tsx",
  `
import { useNavigate } from 'react-router-dom';
import type { Notification } from '@/types';
import { relativeTime } from '@/lib/format';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const nav = useNavigate();

  const handleClick = () => {
    if (!notification.read && onMarkRead) onMarkRead(notification.id);
    if (notification.route) nav(notification.route);
  };

  return (
    <div
      className={'notif-item' + (!notification.read ? ' notif-item--unread' : '')}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
    >
      <div className="notif-item__body">
        <div className="notif-item__title">{notification.title}</div>
        <div className="notif-item__message">{notification.message}</div>
        <div className="notif-item__meta">
          {notification.fromName ? (
            <>
              <span className="notif-item__from">{notification.fromName}</span>
              <span className="notif-item__dot">·</span>
            </>
          ) : null}
          <span>{relativeTime(notification.date)}</span>
          {notification.priority === 'high' ? (
            <span className="notif-item__priority notif-item__priority--high">مهم</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   12) ADMIN REQUESTS PAGE — إصلاح (كانت مفقودة/لا تعمل)
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminRequestsPage.tsx",
  `
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { approveStep, rejectStep } from '@/lib/approvals';
import { listWhere } from '@/lib/db';
import { canApproveStep } from '@/lib/permissions';
import { teams } from '@/data/teams';
import { REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL, PRIORITY_LABEL, formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, TextArea } from '@/components/ui/FormField';
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
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return requests
      .filter((r) => status === 'all' || r.status === status)
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  }, [requests, status]);

  const openAction = async (req: RequestRecord, type: 'approve' | 'reject') => {
    if (!user) return;
    const steps = await listWhere<ApprovalStep>('approvals', 'requestId', req.id);
    const step = steps.find((s) => s.status === 'PENDING' && s.order === req.currentStepOrder);
    if (!step) { toast.error('لا توجد مرحلة معلّقة على هذا الطلب'); return; }
    if (!canApproveStep(user, step)) {
      toast.error('لا تملك صلاحية هذه المرحلة');
      return;
    }
    setActionReq(req);
    setActionStep(step);
    setActionType(type);
    setComment('');
  };

  const doAction = async () => {
    if (!user || !actionReq || !actionStep || !actionType) return;
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
      setActionReq(null);
      setActionStep(null);
      setActionType(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الإجراء';
      toast.error('فشل الإجراء', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="إدارة" title="الطلبات" description="كل الطلبات في المنظمة مع إجراءات فورية." />

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
            return (
              <div key={r.id} className="card no-click">
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{r.title}</div>
                    <div className="card__meta">
                      {r.requesterName} · {formatDate(r.submittedAt)}
                      {fromTeam ? ' · من ' + fromTeam.name : ''}
                      {toTeam ? ' · إلى ' + toTeam.name : ''}
                    </div>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
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

                <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                  <Link to={'/requests/' + r.id} className="btn btn--ghost btn--xs">تفاصيل</Link>
                  {r.status === 'PENDING' || r.status === 'IN_REVIEW' ? (
                    <>
                      <button type="button" className="btn btn--success btn--xs" onClick={() => openAction(r, 'approve')}>
                        موافقة
                      </button>
                      <button type="button" className="btn btn--danger btn--xs" onClick={() => openAction(r, 'reject')}>
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

      <Modal
        open={actionType !== null}
        title={actionType === 'approve' ? 'موافقة على الطلب' : 'رفض الطلب'}
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
              {busy ? '...' : actionType === 'approve' ? 'تأكيد الموافقة' : 'تأكيد الرفض'}
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
            placeholder={actionType === 'approve' ? 'ملاحظات...' : 'اشرح سبب الرفض'}
            rows={3}
          />
        </FormField>
      </Modal>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   13) CONVERSATIONS — إضافة محادثة جديدة + موبايل
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
import { FormField, Select, TextInput } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { Conversation, Message, AppUser, TeamId } from '@/types';

export function ConversationsPage() {
  const { user } = useAuth();
  const { data: conversations, loading: loadingConvs } = useRealtimeCollection<Conversation>('conversations');
  const { data: messages, loading: loadingMsgs } = useRealtimeCollection<Message>('messages');
  const { data: users } = useRealtimeCollection<AppUser>('users');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [createType, setCreateType] = useState<'private' | 'team'>('private');
  const [createTarget, setCreateTarget] = useState<string>('');
  const [createTeamId, setCreateTeamId] = useState<TeamId>('helpers');
  const [busy, setBusy] = useState(false);

  const myConversations = useMemo(() => {
    if (!user) return [];
    return conversations.filter((c) => {
      if (c.type === 'general') return true;
      if (c.type === 'team') return c.teamId === user.teamId;
      return c.participantUids.includes(user.uid);
    });
  }, [conversations, user]);

  const defaultId = useMemo(() => myConversations.find((c) => c.type === 'general')?.id ?? null, [myConversations]);
  const currentId = activeId ?? defaultId;
  const active = currentId ? myConversations.find((c) => c.id === currentId) : null;

  const activeMessages = useMemo(() => {
    if (!currentId) return [];
    return messages.filter((m) => m.conversationId === currentId).sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1));
  }, [messages, currentId]);

  if (!user) return null;
  if (loadingConvs || loadingMsgs) return <Loading fullHeight message="جارٍ تحميل المحادثات..." />;

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
    setBusy(true);
    try {
      if (createType === 'private') {
        if (!createTarget) { toast.error('اختر عضوًا'); setBusy(false); return; }
        const existing = conversations.find(
          (c) => c.type === 'private'
            && c.participantUids.length === 2
            && c.participantUids.includes(user.uid)
            && c.participantUids.includes(createTarget)
        );
        if (existing) {
          setActiveId(existing.id);
          setMobileShowChat(true);
          setOpenCreate(false);
          return;
        }
        const id = newId('CONV-PRIVATE');
        await createOne('conversations', {
          id,
          type: 'private',
          title: '',
          participantUids: [user.uid, createTarget],
          lastMessageAt: now(),
        });
        setActiveId(id);
        setMobileShowChat(true);
      } else {
        const id = 'CONV-TEAM-' + createTeamId;
        const existing = conversations.find((c) => c.id === id);
        if (existing) {
          toast.info('محادثة الفريق موجودة بالفعل');
          setActiveId(id);
          setMobileShowChat(true);
          setOpenCreate(false);
          return;
        }
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
      }
      toast.success('تم إنشاء المحادثة');
      setOpenCreate(false);
      setCreateTarget('');
    } catch (err) {
      const m = err instanceof Error ? err.message : 'فشل الإنشاء';
      toast.error('فشل الإنشاء', m);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <div className="chat-layout">
        <div className={'chat-sidebar' + (mobileShowChat ? ' is-hidden show-desktop' : '')}>
          <div className="chat-sidebar__head">
            <div className="row row--between" style={{ gap: 8 }}>
              <div className="chat-sidebar__title">المحادثات</div>
              <button type="button" className="chat-sidebar__new" onClick={() => setOpenCreate(true)}>
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
                <button type="button" className="chat-header__back" onClick={() => setMobileShowChat(false)} aria-label="رجوع">‹</button>
                <div className="chat-header__info">
                  <div className="chat-header__title">{getConvName()}</div>
                  <div className="chat-header__sub">
                    {active.type === 'general' ? 'الجميع' : active.type === 'team' ? 'فريق' : 'محادثة خاصة'}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {activeMessages.length === 0 ? (
                  <EmptyState title="ابدأ المحادثة" message="لا رسائل بعد. كن أول من يكتب." />
                ) : (
                  activeMessages.map((m) => <MessageBubble key={m.id} message={m} currentUser={user} />)
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
            <button type="button" className="btn btn--ghost" onClick={() => setOpenCreate(false)}>إلغاء</button>
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
          <FormField label="العضو" required>
            <Select
              value={createTarget}
              onChange={setCreateTarget}
              options={[
                { value: '', label: '— اختر —' },
                ...users.filter((u) => u.uid !== user.uid).map((u) => ({ value: u.uid, label: u.displayName })),
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
   14) SIDEBAR — بدون أيقونات
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/layout/Sidebar.tsx",
  `
import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { logout } from '@/lib/auth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { ROLE_LABEL, isAdmin, seesAllTeams } from '@/lib/permissions';
import { cx } from '@/lib/format';
import type { ApprovalStep } from '@/types';

interface NavItem { to: string; label: string; count?: number; }
interface SidebarProps { open: boolean; onClose: () => void; }

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
    { to: '/admin/governance', label: 'الحوكمة' },
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
    { to: '/governance', label: 'الحوكمة' },
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
  if (isAdmin(user)) items = buildAdminNav(pending);
  else if (user.role === 'MEMBER' || user.role === 'VIEWER') items = buildMemberNav();
  else items = buildManagerNav(pending);

  const handleLogout = async () => { onClose(); await logout(); nav('/'); };
  const handleNavClick = () => { if (isMobile) onClose(); };

  return (
    <>
      <div className={'sidebar-overlay' + (open ? ' is-open' : '')} onClick={onClose} aria-hidden="true" />

      <aside className={'sidebar no-print' + (open ? ' is-open' : '')}>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="إغلاق القائمة">×</button>

        <div className="sidebar__user">
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user.displayName}</div>
            <div className="sidebar__user-role">{ROLE_LABEL[user.role]}</div>
          </div>
        </div>

        <div className="sidebar__group">
          <div className="sidebar__title">{seesAllTeams(user) ? 'الإدارة' : 'القائمة'}</div>
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
                <span className="sidebar__count">{it.count > 99 ? '99+' : it.count}</span>
              ) : null}
            </NavLink>
          ))}
        </div>

        <div className="sidebar__group">
          <div className="sidebar__title">الحساب</div>
          <button type="button" className="sidebar__link sidebar__link--danger" onClick={handleLogout}>
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   15) ADMIN CONTRIBUTIONS — تنسيق أفضل
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminContributionsPage.tsx",
  `
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { notifyUser } from '@/lib/notifications';
import { teams } from '@/data/teams';
import { hoursToPoints, formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { cx } from '@/lib/format';
import type { Contribution, ContributionStatus } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  all: 'الكل',
  pending: 'معلّقة',
  approved: 'معتمدة',
  rejected: 'مرفوضة',
};

export function AdminContributionsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<Contribution>('contributions');
  const [status, setStatus] = useState<ContributionStatus | 'all'>('pending');
  const [toDelete, setToDelete] = useState<Contribution | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = data
    .filter((c) => status === 'all' || c.status === status)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const approve = async (c: Contribution) => {
    try {
      await updateOne('contributions', c.id, { status: 'approved' });
      await logAudit(me, 'APPROVE_CONTRIBUTION', 'Contribution', c.id, c.title);
      await notifyUser(
        c.createdBy,
        'تم اعتماد مشاركتك',
        '"' + c.title + '" — +' + hoursToPoints(c.hours) + ' نقطة',
        'participation',
        '/my-contributions',
        'normal',
        me?.displayName,
      );
      toast.success('تم الاعتماد');
    } catch { toast.error('فشل الاعتماد'); }
  };

  const reject = async (c: Contribution) => {
    try {
      await updateOne('contributions', c.id, { status: 'rejected' });
      await logAudit(me, 'REJECT_CONTRIBUTION', 'Contribution', c.id, c.title);
      await notifyUser(
        c.createdBy,
        'تم رفض مشاركتك',
        '"' + c.title + '"',
        'participation',
        '/my-contributions',
        'high',
        me?.displayName,
      );
      toast.success('تم الرفض');
    } catch { toast.error('فشل الرفض'); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('contributions', toDelete.id);
      await logAudit(me, 'DELETE_CONTRIBUTION', 'Contribution', toDelete.id, toDelete.title);
      toast.success('تم الحذف');
      setToDelete(null);
    } catch { toast.error('فشل الحذف'); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader eyebrow="إدارة" title="المشاركات" description="اعتماد أو رفض مشاركات الأعضاء." />

      <div className="chips mb-4">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={cx('chip', status === s && 'is-active')}
            onClick={() => setStatus(s)}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <SectionHeader eyebrow="القائمة" title={'المشاركات (' + filtered.length + ')'} />

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title="لا مشاركات" message="لا توجد مشاركات بهذه الحالة." />
      ) : (
        <div className="stack">
          {filtered.map((c) => {
            const team = teams.find((t) => t.id === c.teamId);
            return (
              <div key={c.id} className="card no-click contribution-card">
                <div className="contribution-card__head">
                  <div className="contribution-card__info">
                    <div className="contribution-card__title">{c.title}</div>
                    <div className="contribution-card__meta">
                      {c.memberName} · {team?.name ?? c.teamId} · {formatDate(c.date)}
                    </div>
                  </div>
                  <Badge
                    variant={
                      c.status === 'approved' ? 'success'
                        : c.status === 'pending' ? 'warning'
                        : 'danger'
                    }
                  >
                    {c.status === 'approved' ? 'معتمد' : c.status === 'pending' ? 'معلّق' : 'مرفوض'}
                  </Badge>
                </div>

                {c.description ? <p className="contribution-card__desc">{c.description}</p> : null}

                <div className="contribution-card__foot">
                  <div className="contribution-card__numbers">
                    <span>{c.hours} <span className="muted">ساعة</span></span>
                    <span className="points">{hoursToPoints(c.hours)} نقطة</span>
                  </div>
                  <div className="contribution-card__actions">
                    {c.status === 'pending' ? (
                      <>
                        <button type="button" className="btn btn--success btn--sm" onClick={() => approve(c)}>اعتماد</button>
                        <button type="button" className="btn btn--outline-danger btn--sm" onClick={() => reject(c)}>رفض</button>
                      </>
                    ) : null}
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setToDelete(c)}>حذف</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="حذف المشاركة"
        message={'سيتم حذف "' + (toDelete?.title || '') + '". متابعة؟'}
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
   16) PWA INSTALL — محسّن ويظهر مبكرًا
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/pwa/PwaInstallBanner.tsx",
  `
import { useEffect, useState } from 'react';
import { canInstallPwa, promptInstall, isStandalone, isIos } from '@/lib/pwa';
import { toast } from '@/components/ui/Toast';

const DISMISSED_KEY = 'sbapiaryy-pwa-dismissed-v2';
const SHOW_AFTER_MS = 8000;

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISSED_KEY) === 'yes') return;

    const check = () => {
      if (canInstallPwa()) { setVisible(true); setIosMode(false); }
      else if (isIos()) { setVisible(true); setIosMode(true); }
    };

    const t = setTimeout(check, SHOW_AFTER_MS);
    const handler = () => { setVisible(true); setIosMode(false); };
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
      toast.info('للتثبيت على iPhone', 'اضغط زر المشاركة ← Add to Home Screen');
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
    <div className="pwa-install-banner no-print" role="dialog" aria-label="تثبيت التطبيق">
      <div className="pwa-install-banner__body">
        <div className="pwa-install-banner__title">ثبّت sbapiaryy على هاتفك</div>
        <div className="pwa-install-banner__desc">
          {iosMode
            ? 'من Safari: اضغط Share ← Add to Home Screen'
            : 'تجربة أسرع، إشعارات، وبدون شريط المتصفح'}
        </div>
      </div>
      <div className="pwa-install-banner__actions">
        <button type="button" className="btn btn--ghost btn--xs" onClick={dismiss}>لاحقًا</button>
        <button type="button" className="btn btn--primary btn--xs" onClick={install}>تثبيت</button>
      </div>
    </div>
  );
}
`
);

file(
  "src/styles/pwa.css",
  `
/* ═══════════════════════════════════════════════════════════════
   PWA Install Banner — احترافي وظاهر
   ═══════════════════════════════════════════════════════════════ */

.pwa-install-banner {
  position: fixed;
  bottom: calc(24px + var(--safe-bottom));
  inset-inline: 20px;
  z-index: 350;
  background: var(--c-navy);
  color: #fff;
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  box-shadow: 0 20px 60px -15px rgba(21, 26, 69, 0.55);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  border: 1px solid var(--c-navy-2);
  animation: pwa-slide-in 0.4s var(--ease-bounce);
}

@media (min-width: 640px) {
  .pwa-install-banner {
    inset-inline: auto;
    inset-inline-end: 24px;
    max-width: 460px;
    padding: 20px 22px;
  }
}

@keyframes pwa-slide-in {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.pwa-install-banner__body { flex: 1; min-width: 200px; }

.pwa-install-banner__title {
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: 4px;
}

.pwa-install-banner__desc {
  font-size: 0.82rem;
  color: var(--c-paper-soft);
  line-height: 1.6;
}

.pwa-install-banner__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
`
);

/* ═══════════════════════════════════════════════════════════════
   17) HOME PAGE — داتا حقيقية فقط
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/HomePage.tsx",
  `
import { Link } from 'react-router-dom';
import { site, activeSeason } from '@/data';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { hoursToPoints } from '@/lib/format';
import { Stat, StatRow } from '@/components/ui/Stat';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TeamCard } from '@/components/team/TeamCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Member, Contribution } from '@/types';

export function HomePage() {
  const { data: members, loading: loadingM } = useRealtimeCollection<Member>('members');
  const { data: contributions, loading: loadingC } = useRealtimeCollection<Contribution>('contributions');

  const isLoading = loadingM || loadingC;
  const activeMembers = members.filter((m) => m.status === 'active');

  const totalHours = contributions
    .filter((c) => c.status === 'approved')
    .reduce((s, c) => s + c.hours, 0);
  const totalPoints = hoursToPoints(totalHours);

  const teamRanking = teams
    .map((team) => {
      const teamMembers = activeMembers.filter((m) => m.teamIds.includes(team.id));
      const teamPoints = teamMembers.reduce((sum, m) => sum + hoursToPoints(m.hours || 0), 0);
      return { team, points: teamPoints, count: teamMembers.length };
    })
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const topMembers = [...activeMembers]
    .filter((m) => m.role !== 'HEAD' && m.role !== 'VICE')
    .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
    .slice(0, 5)
    .map((m, i) => ({ member: m, rank: i + 1 }));

  return (
    <>
      <section className="hero" style={{ padding: '56px 0 40px' }}>
        <div className="container">
          <div className="section-head__eyebrow">{activeSeason.label}</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginTop: 14, maxWidth: '20ch' }}>
            منصة <span style={{ color: 'var(--c-navy-3)' }}>{site.organization}</span> Sub Branches
          </h1>
          <p style={{ marginTop: 18, maxWidth: '60ch', color: 'var(--c-ink-soft)', fontSize: '1.02rem', lineHeight: 1.85 }}>
            {site.description}
          </p>
          <div className="row" style={{ marginTop: 28, gap: 12 }}>
            <Link to="/members" className="btn btn--primary">تصفح الأعضاء</Link>
            <Link to="/league" className="btn btn--ghost">الترتيب العام</Link>
            <Link to="/login" className="btn btn--ghost">تسجيل الدخول</Link>
          </div>
        </div>
      </section>

      <section className="container section--tight">
        {isLoading ? (
          <Loading />
        ) : (
          <StatRow>
            <Stat value={activeMembers.length} label="الأعضاء" />
            <Stat value={teams.length} label="الفرق" />
            <Stat value={totalPoints} label="مجموع النقاط" />
            <Stat value={totalHours} label="مجموع الساعات" />
          </StatRow>
        )}
      </section>

      <section className="container section">
        <SectionHeader
          eyebrow="ترتيب الفرق"
          title="الفرق حسب النقاط"
          description="الترتيب تلقائي من بيانات الأعضاء الحقيقية."
          action={<Link to="/teams" className="btn btn--ghost btn--sm">كل الفرق</Link>}
        />
        {isLoading ? (
          <Loading />
        ) : teamRanking.length === 0 ? (
          <EmptyState title="لا بيانات" message="لم تُضف فرق بعد." />
        ) : (
          <div className="grid">
            {teamRanking.map((r) => <TeamCard key={r.team.id} team={r.team} rank={r.rank} />)}
          </div>
        )}
      </section>

      <section className="container section">
        <SectionHeader
          eyebrow="الترتيب العام"
          title="أعلى الأعضاء"
          action={<Link to="/league" className="btn btn--ghost btn--sm">الترتيب الكامل</Link>}
        />
        {isLoading ? (
          <Loading />
        ) : topMembers.length === 0 ? (
          <EmptyState title="لا أعضاء" message="لم يُضف أعضاء بعد." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>#</th>
                  <th>العضو</th>
                  <th>الفرق</th>
                  <th>الساعات</th>
                  <th>النقاط</th>
                </tr>
              </thead>
              <tbody>
                {topMembers.map((e) => {
                  const memberTeams = teams.filter((t) => e.member.teamIds.includes(t.id));
                  return (
                    <tr key={e.member.id}>
                      <td className={'rank rank--' + (e.rank <= 3 ? e.rank : '')} data-label="الترتيب">{e.rank}</td>
                      <td data-label="العضو">
                        <Link to={'/members/' + e.member.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={e.member.name} size={32} variant="navy" />
                          <span style={{ fontWeight: 700 }}>{e.member.name}</span>
                        </Link>
                      </td>
                      <td data-label="الفرق">
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {memberTeams.map((t) => <span key={t.id} className="badge">{t.name}</span>)}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-en)' }} data-label="الساعات">{e.member.hours}</td>
                      <td className="points" data-label="النقاط">{hoursToPoints(e.member.hours)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="container section">
        <div className="card card--navy no-click" style={{ padding: '32px 28px', textAlign: 'center' }}>
          <Badge variant="red" dot>{activeSeason.theme}</Badge>
          <h2 style={{ marginTop: 16, fontSize: '1.5rem', color: '#fff' }}>انضم إلى المنصة</h2>
          <p style={{ marginTop: 12, maxWidth: '46ch', marginInline: 'auto', color: 'var(--c-paper-soft)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            سجّل دخولك لمتابعة مشاركاتك، التقدم في الليج، والموافقات على طلباتك.
          </p>
          <div className="row" style={{ marginTop: 22, justifyContent: 'center' }}>
            <Link to="/login" className="btn btn--primary">تسجيل الدخول</Link>
          </div>
        </div>
      </section>
    </>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   18) TEAM CARD — إنجليزي فقط
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/team/TeamCard.tsx",
  `
import { Link } from 'react-router-dom';
import type { Team } from '@/types';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { hoursToPoints } from '@/lib/format';
import type { Member } from '@/types';

interface TeamCardProps {
  team: Team;
  rank?: number;
}

export function TeamCard({ team, rank }: TeamCardProps) {
  const { data: members } = useRealtimeCollection<Member>('members');
  const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
  const totalHours = teamMembers.reduce((sum, m) => sum + (m.hours || 0), 0);
  const totalPoints = hoursToPoints(totalHours);
  const avgPoints = teamMembers.length === 0 ? 0 : Math.round(totalPoints / teamMembers.length);

  return (
    <Link to={'/teams/' + team.id} className="card">
      <div className="row row--between">
        <div className="card__title">{team.name}</div>
        {rank !== undefined ? <span className="badge badge--red">#{rank}</span> : null}
      </div>

      <div className="card__meta">{team.description}</div>

      <div className="row" style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--c-line)', gap: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--c-navy)' }}>{totalPoints}</div>
          <div className="tiny muted">نقاط</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--c-navy)' }}>{teamMembers.length}</div>
          <div className="tiny muted">أعضاء</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--c-navy)' }}>{avgPoints}</div>
          <div className="tiny muted">متوسط</div>
        </div>
      </div>
    </Link>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   19) CHAT SIDEBAR NEW BUTTON CSS
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/chat-additions.css",
  `
/* ═══════════════════════════════════════════════════════════════
   Chat — Additions (زر محادثة جديدة + موبايل)
   ═══════════════════════════════════════════════════════════════ */

.chat-sidebar__new {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: var(--radius-full);
  background: var(--c-red);
  color: #fff;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.chat-sidebar__new:hover { background: var(--c-red-soft); }
.chat-sidebar__new:active { transform: scale(0.97); }

/* ═══════════ Contribution Card ═══════════ */

.contribution-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contribution-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.contribution-card__info { flex: 1; min-width: 0; }

.contribution-card__title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--c-ink);
  line-height: 1.4;
  word-break: break-word;
}

.contribution-card__meta {
  font-size: 0.8rem;
  color: var(--c-ink-muted);
  margin-top: 4px;
  line-height: 1.5;
}

.contribution-card__desc {
  font-size: 0.88rem;
  color: var(--c-ink-soft);
  line-height: 1.7;
}

.contribution-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--c-line);
  flex-wrap: wrap;
}

.contribution-card__numbers {
  display: flex;
  gap: 16px;
  font-family: var(--font-en);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--c-ink-soft);
}

.contribution-card__actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* ═══════════ Chart bars ═══════════ */

.chart-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 0.88rem;
}

.chart-row > span:first-child {
  min-width: 100px;
  flex-shrink: 0;
}

.chart-row > span:last-child {
  min-width: 50px;
  text-align: end;
  flex-shrink: 0;
}

.chart-bar {
  flex: 1;
  height: 12px;
  background: var(--c-navy);
  border-radius: 999px;
  min-width: 6px;
  transition: width 0.4s ease;
}

.chart-bar--red { background: var(--c-red); }

/* ═══════════ Mobile adjustments ═══════════ */

@media (max-width: 640px) {
  .chat-layout {
    height: calc(100dvh - var(--navbar-h) - var(--bottom-nav-h) - 16px);
    border-radius: 0;
    border-left: none;
    border-right: none;
    margin-inline: -20px;
  }

  .chat-header { padding: 12px 14px; }

  .chat-message { max-width: 88%; }

  .contribution-card__foot {
    flex-direction: column;
    align-items: stretch;
  }

  .contribution-card__actions {
    justify-content: flex-end;
  }
}
`
);

/* ═══════════════════════════════════════════════════════════════
   20) GLOBAL.CSS — إضافة الملفات الجديدة
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/global.css",
  `
/* sbapiaryy v5.2 — Global CSS */

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
`
);

/* ═══════════════════════════════════════════════════════════════
   21) v52-fix.css — تصحيحات نهائية
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/v52-fix.css",
  `
/* ═══════════════════════════════════════════════════════════════
   v5.2 Fix — تصحيحات نهائية شاملة
   ═══════════════════════════════════════════════════════════════ */

/* ─── إزالة أي أيقونات من لوحة الإدارة ─── */
.admin-only svg,
.admin-page svg:not(.keep-icon) { display: none; }

/* ─── إزالة أيقونة brand القديمة ─── */
.brand::before,
.footer__brand::before { content: none !important; display: none !important; }

/* ─── إزالة أيقونة الـ sidebar avatar ─── */
.sidebar__avatar { display: none !important; }

/* ─── إزالة أيقونة nav-action القديمة ─── */
.nav-action__icon { display: none !important; }
.nav-action__menu { display: flex !important; }

/* ─── Padding موحد ─── */
.section,
.section--tight {
  padding-inline: 0;
}

/* ─── منع الصفحات من الالتصاق ─── */
.page-content,
.dashboard-layout > div > * {
  padding-inline: 0;
}

/* ─── النصوص في البطاقات ─── */
.card__title,
.card__meta,
.card__body {
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* ─── منع الفائض الأفقي ─── */
body,
.app-shell,
.app-main {
  overflow-x: hidden;
}

/* ─── الإشعارات — بدون أيقونات ─── */
.notif-item__icon { display: none !important; }

/* ─── الجداول — مساحة كافية ─── */
@media (max-width: 900px) {
  table.data td {
    padding: 12px 16px;
  }
}

/* ─── الفوتر — بدون أيقونات ─── */
.footer__brand { padding-inline-start: 0; }

/* ─── العضو في الرئيسية — أفضل ─── */
.grid.grid--wide > .member-card {
  min-height: 200px;
}

/* ─── الليج — عرض الاسم بالكامل ─── */
table.data td[data-label="العضو"] span {
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* ─── فريق — بدون ترجمة ─── */
.card__meta[data-team-name] { text-transform: none !important; }

/* ─── Onboarding — خلفية بيضا ─── */
.onboarding-backdrop {
  background: #FFFFFF !important;
}

.onboarding-card {
  background: #FFFFFF !important;
  color: var(--c-ink) !important;
  border: 1.5px solid var(--c-line) !important;
}

.onboarding-card__title { color: var(--c-navy) !important; }
.onboarding-card__desc { color: var(--c-ink-soft) !important; }

/* ─── إزالة أيقونة البحث القديمة ─── */
.search-icon { display: none !important; }

/* ─── صفحات الأدمن ─── */
.admin-page .card__icon,
.admin-page [class*="__icon"] {
  display: none !important;
}

/* ─── Member Profile — إزالة حرفين ─── */
.profile svg.avatar-initials { display: none !important; }

/* ─── شكل عام للصور ─── */
img, svg, video {
  max-width: 100%;
  height: auto;
}

/* ─── Accessibility — إخفاء مرئي ─── */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`
);

/* ═══════════════════════════════════════════════════════════════
   22) APP.TSX — إضافة مسار الأدمن للحوكمة
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/App.tsx.patch.md",
  `
# Patch يدوي صغير لـ App.tsx

أضف السطر التالي مع باقي import/Admin Pages:

\`\`\`tsx
import { AdminGovernancePage } from '@/pages/admin/AdminGovernancePage';
import { AdminRequestsPage } from '@/pages/admin/AdminRequestsPage';
\`\`\`

وأضف داخل <Route path="/admin/*"> ... :

\`\`\`tsx
<Route
  path="/admin/requests"
  element={
    <RequireAuth roles={['HEAD', 'VICE']}>
      <AdminRequestsPage />
    </RequireAuth>
  }
/>
<Route
  path="/admin/governance"
  element={
    <RequireAuth roles={['HEAD', 'VICE']}>
      <AdminGovernancePage />
    </RequireAuth>
  }
/>
\`\`\`
`
);

/* ═══════════════════════════════════════════════════════════════
   23) GITHUB ACTION — تحديث تلقائي
   ═══════════════════════════════════════════════════════════════ */

file(
  ".github/workflows/auto-fix.yml",
  `
name: Auto-Fix (client requirements)

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - 'fix.cjs'
      - 'requirements.txt'

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: auto-fix
  cancel-in-progress: false

jobs:
  apply-fix:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Apply fix.cjs
        run: node fix.cjs --no-backup

      - name: Commit & push changes
        run: |
          git config user.name "sbapiaryy-bot"
          git config user.email "bot@sbapiaryy.local"
          git add -A
          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "chore: apply fix.cjs — client requirements v5.2 [skip ci]"
            git push
          fi

  build-and-deploy:
    needs: apply-fix
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: main

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Create .env
        run: |
          echo "VITE_FIREBASE_API_KEY=\${{ secrets.VITE_FIREBASE_API_KEY }}" >> .env
          echo "VITE_FIREBASE_AUTH_DOMAIN=\${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}" >> .env
          echo "VITE_FIREBASE_PROJECT_ID=\${{ secrets.VITE_FIREBASE_PROJECT_ID }}" >> .env
          echo "VITE_FIREBASE_STORAGE_BUCKET=\${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}" >> .env
          echo "VITE_FIREBASE_MESSAGING_SENDER_ID=\${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}" >> .env
          echo "VITE_FIREBASE_APP_ID=\${{ secrets.VITE_FIREBASE_APP_ID }}" >> .env

      - run: npm install --no-audit --no-fund
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build-and-deploy
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
`
);

/* ═══════════════════════════════════════════════════════════════
   24) README — توثيق التشغيل
   ═══════════════════════════════════════════════════════════════ */

file(
  "FIX-README.md",
  `
# sbapiaryy — fix.cjs (v5.2)

## طريقة التشغيل

\`\`\`bash
node fix.cjs              # تطبيق التعديلات + نسخة احتياطية
node fix.cjs --dry        # معاينة فقط بدون تطبيق
node fix.cjs --no-backup  # بدون نسخة احتياطية
\`\`\`

## الملفات المعدّلة

### Layout & Spacing
- \`src/styles/layout.css\` — padding أفضل لكل الصفحات
- \`src/styles/v52-fix.css\` — تصحيحات نهائية شاملة

### Avatar & Members
- \`src/components/ui/Avatar.tsx\` — بدون initials، Placeholder احترافي
- \`src/components/member/MemberCard.tsx\` — الاسم كامل + تنسيق منظم
- \`src/styles/member-card.css\` — أنماط العضو الجديدة

### Admin (بدون أيقونات)
- \`src/pages/admin/AdminHomePage.tsx\`
- \`src/pages/admin/AdminAnalyticsPage.tsx\`
- \`src/pages/admin/AdminContributionsPage.tsx\`
- \`src/pages/admin/AdminRequestsPage.tsx\` (جديد)
- \`src/pages/admin/AdminGovernancePage.tsx\` (جديد)
- \`src/components/layout/Sidebar.tsx\` — بدون أيقونات

### Governance
- \`src/pages/GovernancePage.tsx\` — يعرض من الداتا فقط
- \`src/data/governance.ts\` — فاضي (الأدمن يضيف)

### Onboarding
- \`src/components/onboarding/Onboarding.tsx\` — خلفية بيضا
- \`src/styles/onboarding.css\` — Flash Cards
- \`src/data/onboarding.ts\` — بدون أيقونات

### PWA
- \`src/components/pwa/PwaInstallBanner.tsx\` — احترافي
- \`src/styles/pwa.css\` — تصميم محسّن

### Chat
- \`src/pages/ConversationsPage.tsx\` — إضافة محادثة جديدة
- \`src/styles/chat-additions.css\` — زر جديد + موبايل

### Search & Notifications
- \`src/pages/SearchPage.tsx\` — بدون أيقونات
- \`src/components/notification/NotificationItem.tsx\` — بدون أيقونات

### Data
- \`src/data/teams.ts\` — إنجليزي فقط
- \`src/pages/HomePage.tsx\` — داتا حقيقية
- \`src/components/team/TeamCard.tsx\` — داتا حقيقية

### GitHub
- \`.github/workflows/auto-fix.yml\` — يشتغل تلقائيًا

## ⚠️ Patch يدوي صغير
راجع \`src/App.tsx.patch.md\` — إضافة مساري:
- \`/admin/requests\`
- \`/admin/governance\`

## النسخ الاحتياطية
كل تعديل بينسخ الملف الأصلي في \`.fix-backups/<timestamp>/\`
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
  `${C.bold}${C.magenta}║  sbapiaryy — fix.cjs  (v5.1 → v5.2)                  ║${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}║  Comprehensive client requirements fix               ║${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}╚══════════════════════════════════════════════════════╝${C.reset}`
);
console.log("");

if (DRY)
  console.log(`${C.yellow}⚠ DRY RUN — no files will be written${C.reset}\n`);
if (NO_BACKUP)
  console.log(
    `${C.yellow}⚠ NO BACKUP — originals will not be saved${C.reset}\n`
  );

if (!NO_BACKUP && !DRY) {
  ensureDir(BACKUP_DIR);
  console.log(
    `${C.dim}Backup dir: ${path.relative(ROOT, BACKUP_DIR)}${C.reset}\n`
  );
}

writeAll();

console.log("");
console.log(`${C.bold}Summary:${C.reset}`);
console.log(`  ${C.green}✓ Written : ${stats.written}${C.reset}`);
console.log(`  ${C.cyan}↩ Backed  : ${stats.backed}${C.reset}`);
console.log(`  ${C.yellow}→ Skipped : ${stats.skipped}${C.reset}`);
if (stats.failed)
  console.log(`  ${C.red}✗ Failed  : ${stats.failed}${C.reset}`);

console.log("");
console.log(`${C.bold}Next steps:${C.reset}`);
console.log("  1. راجع src/App.tsx.patch.md وأضف المسارين يدويًا");
console.log("  2. شغّل: npm run build");
console.log("  3. اعمل commit + push — GitHub Actions هيكمل الباقي");
console.log("");

if (stats.failed > 0) process.exit(1);
