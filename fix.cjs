#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — v5.3
 * تحديثات: الصفحة الرئيسية + الليج + الفوتر
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
   1) Site Data — تغيير الشعار
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/data/site.ts",
  `
import type { SiteConfig, Season } from '@/types';

export const site: SiteConfig = {
  name: 'sbapiaryy',
  tagline: 'Resala STEM Sub Branches — الموسم السابع',
  description: 'المنصة الرسمية لمتابعة Resala STEM Sub Branches',
  organization: 'Resala STEM',
  email: 'hello@resala-stem.org',
};

export const seasons: Season[] = [
  {
    id: 'S7',
    label: 'الموسم السابع',
    labelEn: 'Season 7',
    start: '2025-09-01',
    end: '2026-06-30',
    isActive: true,
    theme: 'شبابك قبل هرمك',
  },
  {
    id: 'S6',
    label: 'الموسم السادس',
    labelEn: 'Season 6',
    start: '2024-09-01',
    end: '2025-06-30',
    isActive: false,
    theme: 'نصل أبعد.',
  },
];

export const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];
`
);

/* ═══════════════════════════════════════════════════════════════
   2) HomePage — منحل + تصميم جديد + إخفاء قسم الانضمام
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/HomePage.tsx",
  `
import { Link } from 'react-router-dom';
import { site, activeSeason } from '@/data';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
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
  const { user } = useAuth();
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
      {/* ═══════════ HERO ═══════════ */}
      <section className="home-hero">
        <div className="container">
          <div className="section-head__eyebrow">{activeSeason.label}</div>
          <h1 className="home-hero__title">
            منحل <span className="home-hero__brand">{site.organization}</span> Sub Branches
          </h1>
          <p className="home-hero__desc">{site.description}</p>
          <div className="home-hero__actions">
            <Link to="/members" className="btn btn--primary">تصفح الأعضاء</Link>
            <Link to="/league" className="btn btn--ghost">الترتيب العام</Link>
            {!user ? <Link to="/login" className="btn btn--ghost">تسجيل الدخول</Link> : null}
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="home-section">
        <div className="container">
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
        </div>
      </section>

      {/* ═══════════ TEAM RANKING ═══════════ */}
      <section className="home-section">
        <div className="container">
          <SectionHeader
            eyebrow="ترتيب الفرق"
            title="الفرق حسب النقاط"
            action={<Link to="/teams" className="btn btn--ghost btn--sm">كل الفرق</Link>}
          />
          {isLoading ? (
            <Loading />
          ) : teamRanking.length === 0 ? (
            <EmptyState title="لا بيانات" message="لم تُضف فرق بعد." />
          ) : (
            <div className="home-teams-grid">
              {teamRanking.map((r) => (
                <TeamCard key={r.team.id} team={r.team} rank={r.rank} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ TOP MEMBERS ═══════════ */}
      <section className="home-section">
        <div className="container">
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
            <div className="home-league-table">
              <div className="home-league-table__head">
                <span className="col-rank">#</span>
                <span className="col-name">العضو</span>
                <span className="col-team">الفرق</span>
                <span className="col-hours">الساعات</span>
                <span className="col-points">النقاط</span>
              </div>
              {topMembers.map((e) => {
                const memberTeams = teams.filter((t) => e.member.teamIds.includes(t.id));
                return (
                  <Link
                    key={e.member.id}
                    to={'/members/' + e.member.id}
                    className="home-league-table__row"
                  >
                    <span className={'col-rank rank-badge rank-' + (e.rank <= 3 ? e.rank : 'n')}>
                      {e.rank}
                    </span>
                    <span className="col-name">
                      <Avatar name={e.member.name} size={32} variant="navy" />
                      <span className="home-league-table__name">{e.member.name}</span>
                    </span>
                    <span className="col-team">
                      {memberTeams.map((t) => (
                        <span key={t.id} className="badge">{t.name}</span>
                      ))}
                    </span>
                    <span className="col-hours">{e.member.hours}</span>
                    <span className="col-points">{hoursToPoints(e.member.hours)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ JOIN CTA — يظهر فقط للزوار ═══════════ */}
      {!user ? (
        <section className="home-section">
          <div className="container">
            <div className="home-join-cta">
              <Badge variant="red" dot>{activeSeason.theme}</Badge>
              <h2 className="home-join-cta__title">انضم إلى المنحل</h2>
              <p className="home-join-cta__desc">
                سجّل دخولك لمتابعة مشاركاتك، التقدم في الليج، والموافقات على طلباتك.
              </p>
              <div className="home-join-cta__actions">
                <Link to="/login" className="btn btn--primary">تسجيل الدخول</Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   3) TeamCard — الاسم فقط بدون وصف + شارة #1 حمراء
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

  const isFirst = rank === 1;

  return (
    <Link to={'/teams/' + team.id} className="team-card">
      <div className="team-card__head">
        <div className="team-card__name">{team.name}</div>
        {rank !== undefined ? (
          <span className={'team-card__rank ' + (isFirst ? 'team-card__rank--first' : '')}>
            #{rank}
          </span>
        ) : null}
      </div>

      <div className="team-card__stats">
        <div className="team-card__stat">
          <span className="team-card__stat-value">{totalPoints}</span>
          <span className="team-card__stat-label">نقاط</span>
        </div>
        <div className="team-card__stat">
          <span className="team-card__stat-value">{teamMembers.length}</span>
          <span className="team-card__stat-label">أعضاء</span>
        </div>
        <div className="team-card__stat">
          <span className="team-card__stat-value">{avgPoints}</span>
          <span className="team-card__stat-label">متوسط</span>
        </div>
      </div>
    </Link>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   4) LeaguePage — تصميم كامل جديد
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/pages/LeaguePage.tsx",
  `
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
      .map((m, i) => ({ member: m, rank: i + 1, points: hoursToPoints(m.hours) }));
  }, [filtered]);

  const totalPoints = board.reduce((s, e) => s + e.points, 0);
  const totalHours = filtered.reduce((s, m) => s + (m.hours || 0), 0);

  const title =
    filterType === 'all'
      ? 'الترتيب العام'
      : filterType === 'team'
        ? 'ترتيب فريق ' + (teams.find((t) => t.id === filterId)?.name || '')
        : 'ترتيب لجنة ' + (committees.find((c) => c.id === filterId)?.nameAr || '');

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

      <div className="league-filters">
        <div className="chips">
          <button
            type="button"
            className={cx('chip', filterType === 'all' && 'is-active')}
            onClick={() => { setFilterType('all'); setFilterId('all'); }}
          >
            عام
          </button>
          <button
            type="button"
            className={cx('chip', filterType === 'team' && 'is-active')}
            onClick={() => { setFilterType('team'); setFilterId('all'); }}
          >
            حسب الفريق
          </button>
          <button
            type="button"
            className={cx('chip', filterType === 'committee' && 'is-active')}
            onClick={() => { setFilterType('committee'); setFilterId('all'); }}
          >
            حسب اللجنة
          </button>
        </div>

        {filterType === 'team' ? (
          <div className="chips league-filters__sub">
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
          <div className="chips league-filters__sub">
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
                {c.nameAr}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <section className="section">
        <SectionHeader eyebrow="الترتيب" title={title} />

        {loading ? (
          <SkeletonList count={8} />
        ) : board.length === 0 ? (
          <EmptyState title="لا بيانات" message="لا توجد مشاركات مسجلة لهذا التصنيف." />
        ) : (
          <div className="league-board">
            {/* ═══ Top 3 podium ═══ */}
            {board.length >= 3 ? (
              <div className="league-podium">
                {board.slice(0, 3).map((e) => (
                  <Link
                    key={e.member.id}
                    to={'/members/' + e.member.id}
                    className={'league-podium__card league-podium__card--' + e.rank}
                  >
                    <span className={'league-podium__rank league-podium__rank--' + e.rank}>
                      #{e.rank}
                    </span>
                    <Avatar name={e.member.name} size={64} variant={e.rank === 1 ? 'red' : 'navy'} />
                    <div className="league-podium__name">{e.member.name}</div>
                    <div className="league-podium__points">{e.points} نقطة</div>
                    <div className="league-podium__hours">{e.member.hours} ساعة</div>
                  </Link>
                ))}
              </div>
            ) : null}

            {/* ═══ Full list ═══ */}
            <div className="league-list">
              <div className="league-list__head">
                <span className="col-rank">#</span>
                <span className="col-name">العضو</span>
                <span className="col-team">الفريق</span>
                <span className="col-hours">الساعات</span>
                <span className="col-points">النقاط</span>
              </div>
              {board.map((e) => {
                const memberTeams = teams.filter((t) => e.member.teamIds.includes(t.id));
                return (
                  <Link
                    key={e.member.id}
                    to={'/members/' + e.member.id}
                    className="league-list__row"
                  >
                    <span className={'col-rank rank-badge rank-' + (e.rank <= 3 ? e.rank : 'n')}>
                      {e.rank}
                    </span>
                    <span className="col-name">
                      <Avatar name={e.member.name} size={32} variant="navy" />
                      <span className="league-list__name">{e.member.name}</span>
                    </span>
                    <span className="col-team">
                      {memberTeams.length === 0 ? (
                        <span className="muted small">—</span>
                      ) : (
                        memberTeams.map((t) => (
                          <span key={t.id} className="badge">{t.name}</span>
                        ))
                      )}
                    </span>
                    <span className="col-hours">{e.member.hours}</span>
                    <span className="col-points">{e.points}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   5) Footer — إضافة مسافة سفلية
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/components/layout/Footer.tsx",
  `
import { Link } from 'react-router-dom';
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
`
);

/* ═══════════════════════════════════════════════════════════════
   6) Footer CSS — مساحة سفلية
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/styles/footer.css",
  `
/* ═══════════════════════════════════════════════════════════════
   Footer — مع مساحة سفلية كافية
   ═══════════════════════════════════════════════════════════════ */

.footer {
  margin-top: 64px;
  background: var(--c-navy);
  color: var(--c-paper);
  border-top: 4px solid var(--c-red);
  padding-block: 40px 32px;
  padding-bottom: calc(32px + var(--safe-bottom));
}

@media (min-width: 900px) {
  .footer {
    padding-block: 48px 32px;
    padding-bottom: 32px;
  }
}

/* على الجوال: مساحة إضافية بسبب الـ bottom-nav */
@media (max-width: 900px) {
  .footer {
    padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 32px);
    margin-bottom: 8px;
  }
}

.footer__inner {
  display: grid;
  gap: 32px;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .footer__inner { grid-template-columns: 1fr 1fr; gap: 32px; }
}

@media (min-width: 900px) {
  .footer__inner { grid-template-columns: 2fr 3fr; gap: 48px; }
}

.footer__brand-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.footer__brand {
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 1.35rem;
  color: var(--c-paper);
}

.footer__tagline {
  font-size: 0.9rem;
  color: var(--c-paper-soft);
  line-height: 1.75;
  max-width: 42ch;
}

.footer__copyright {
  font-size: 0.8rem;
  color: var(--c-paper-muted);
  padding-top: 14px;
  border-top: 1px solid var(--c-navy-2);
  margin-top: 8px;
}

.footer__links-col {
  display: grid;
  gap: 28px;
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
  margin-bottom: 14px;
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer__link {
  font-size: 0.88rem;
  color: var(--c-paper-soft);
  transition: color 0.15s var(--ease);
  line-height: 1.5;
}

.footer__link:hover { color: var(--c-red); }

@media print { .footer { display: none; } }
`
);

/* ═══════════════════════════════════════════════════════════════
   7) v53-fix CSS — التصميم الجديد للصفحة الرئيسية + الليج
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/styles/v53-fix.css",
  `
/* ═══════════════════════════════════════════════════════════════
   v5.3 — الصفحة الرئيسية + الليج + Team Card
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════ HOME HERO ═══════════ */

.home-hero {
  padding-block: 64px 48px;
}

.home-hero__title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  line-height: 1.15;
  margin-top: 14px;
  max-width: 22ch;
  color: var(--c-navy);
  letter-spacing: -0.02em;
}

.home-hero__brand {
  color: var(--c-red);
}

.home-hero__desc {
  margin-top: 20px;
  max-width: 62ch;
  color: var(--c-ink-soft);
  font-size: 1.05rem;
  line-height: 1.85;
}

.home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

@media (max-width: 640px) {
  .home-hero { padding-block: 40px 32px; }
  .home-hero__title { font-size: 1.75rem; max-width: none; }
  .home-hero__desc { font-size: 0.95rem; margin-top: 16px; }
  .home-hero__actions { margin-top: 24px; }
}

/* ═══════════ HOME SECTIONS ═══════════ */

.home-section {
  padding-block: 32px;
}

@media (min-width: 640px) {
  .home-section { padding-block: 44px; }
}

/* ═══════════ STATS ROW — هامش جانبي ═══════════ */

.stat-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 640px) {
  .stat-row {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

.stat {
  background: var(--c-navy);
  border: 1px solid var(--c-navy-2);
  border-radius: var(--radius);
  padding: 22px 16px;
  text-align: center;
}

@media (min-width: 640px) {
  .stat { padding: 26px 20px; }
}

.stat__value {
  font-family: var(--font-en);
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--c-paper);
  line-height: 1;
  letter-spacing: -0.03em;
}

@media (min-width: 640px) {
  .stat__value { font-size: 2rem; }
}

.stat__label {
  margin-top: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--c-paper-soft);
  letter-spacing: 0.02em;
}

/* ═══════════ TEAM CARD (نفس النسخة الجديدة) ═══════════ */

.home-teams-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 480px) {
  .home-teams-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
}

@media (min-width: 900px) {
  .home-teams-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
}

.team-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--c-ink);
  transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease), border-color 0.18s var(--ease);
  box-shadow: var(--shadow-xs);
}

.team-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-sm);
  border-color: var(--c-line-mid);
}

.team-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.team-card__name {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--c-navy);
  font-family: var(--font-en);
  letter-spacing: -0.01em;
  line-height: 1.25;
}

.team-card__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: var(--c-navy);
  color: #fff;
  font-family: var(--font-en);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.team-card__rank--first {
  background: var(--c-red);
  color: #fff;
  box-shadow: 0 4px 12px rgba(193, 39, 45, 0.35);
}

.team-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--c-line);
}

.team-card__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.team-card__stat-value {
  font-family: var(--font-en);
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--c-navy);
  line-height: 1;
}

.team-card__stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c-ink-muted);
}

/* ═══════════ HOME LEAGUE TABLE ═══════════ */

.home-league-table,
.league-list {
  background: var(--c-white);
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}

.home-league-table__head,
.league-list__head {
  display: grid;
  grid-template-columns: 60px 2fr 1.5fr 90px 90px;
  gap: 12px;
  padding: 14px 20px;
  background: var(--c-navy);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--c-navy-2);
}

.home-league-table__row,
.league-list__row {
  display: grid;
  grid-template-columns: 60px 2fr 1.5fr 90px 90px;
  gap: 12px;
  padding: 14px 20px;
  align-items: center;
  color: var(--c-ink);
  text-decoration: none;
  border-bottom: 1px solid var(--c-line);
  transition: background 0.15s var(--ease);
}

.home-league-table__row:last-child,
.league-list__row:last-child { border-bottom: none; }

.home-league-table__row:hover,
.league-list__row:hover { background: var(--c-off-white); }

.home-league-table__row .col-name,
.league-list__row .col-name {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.home-league-table__name,
.league-list__name {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--c-ink);
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.col-hours,
.col-points {
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 0.95rem;
}

.col-points { color: var(--c-red); }
.col-hours { color: var(--c-navy); }

.col-team {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--c-line);
  color: var(--c-ink-soft);
  font-family: var(--font-en);
  font-weight: 800;
  font-size: 0.82rem;
  flex-shrink: 0;
}

.rank-badge.rank-1 {
  background: var(--c-red);
  color: #fff;
  box-shadow: 0 3px 10px rgba(193, 39, 45, 0.3);
}

.rank-badge.rank-2 {
  background: var(--c-navy-2);
  color: #fff;
}

.rank-badge.rank-3 {
  background: var(--c-navy);
  color: #fff;
}

/* ═══════════ Mobile: تحويل الجداول لبطاقات ═══════════ */

@media (max-width: 700px) {
  .home-league-table__head,
  .league-list__head { display: none; }

  .home-league-table,
  .league-list {
    background: transparent;
    border: none;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .home-league-table__row,
  .league-list__row {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    grid-template-areas:
      'rank name points'
      'rank team hours';
    gap: 6px 12px;
    padding: 14px 16px;
    background: var(--c-white);
    border: 1px solid var(--c-line);
    border-radius: var(--radius);
    box-shadow: var(--shadow-xs);
  }

  .home-league-table__row .col-rank,
  .league-list__row .col-rank { grid-area: rank; align-self: center; }

  .home-league-table__row .col-name,
  .league-list__row .col-name { grid-area: name; }

  .home-league-table__row .col-team,
  .league-list__row .col-team { grid-area: team; }

  .home-league-table__row .col-points,
  .league-list__row .col-points {
    grid-area: points;
    text-align: end;
    align-self: center;
    font-size: 1rem;
  }

  .home-league-table__row .col-hours,
  .league-list__row .col-hours {
    grid-area: hours;
    text-align: end;
    font-size: 0.78rem;
    color: var(--c-ink-muted);
  }

  .home-league-table__row .col-hours::after,
  .league-list__row .col-hours::after {
    content: ' ساعة';
    font-family: var(--font);
    font-weight: 600;
  }

  .col-points::after {
    content: ' نقطة';
    font-family: var(--font);
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--c-ink-muted);
    margin-inline-start: 4px;
  }
}

/* ═══════════ JOIN CTA ═══════════ */

.home-join-cta {
  padding: 44px 32px;
  background: var(--c-navy);
  border-radius: var(--radius-lg);
  text-align: center;
  color: #fff;
  position: relative;
  overflow: hidden;
}

@media (max-width: 640px) {
  .home-join-cta { padding: 32px 20px; }
}

.home-join-cta__title {
  margin-top: 18px;
  font-size: 1.6rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
}

@media (min-width: 640px) {
  .home-join-cta__title { font-size: 1.85rem; }
}

.home-join-cta__desc {
  margin-top: 14px;
  max-width: 46ch;
  margin-inline: auto;
  color: var(--c-paper-soft);
  font-size: 0.98rem;
  line-height: 1.85;
}

.home-join-cta__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 26px;
  flex-wrap: wrap;
}

/* ═══════════ LEAGUE PAGE ═══════════ */

.league-filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-block: 16px;
}

.league-filters__sub {
  margin-top: 4px;
}

.league-board {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Podium */

.league-podium {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 640px) {
  .league-podium {
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
}

.league-podium__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 26px 20px;
  border-radius: var(--radius);
  border: 1.5px solid var(--c-line);
  background: var(--c-white);
  text-decoration: none;
  color: var(--c-ink);
  box-shadow: var(--shadow-xs);
  transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease);
  position: relative;
  text-align: center;
}

.league-podium__card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-sm);
}

.league-podium__card--1 {
  border-color: #FCA5A5;
  background: linear-gradient(180deg, #FFFBFC, #FFFFFF);
}

.league-podium__card--2 {
  border-color: var(--c-line-mid);
}

.league-podium__card--3 {
  border-color: var(--c-line);
}

.league-podium__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  font-family: var(--font-en);
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.league-podium__rank--1 {
  background: var(--c-red);
  color: #fff;
  box-shadow: 0 4px 12px rgba(193, 39, 45, 0.3);
}

.league-podium__rank--2 {
  background: var(--c-navy-2);
  color: #fff;
}

.league-podium__rank--3 {
  background: var(--c-navy);
  color: #fff;
}

.league-podium__name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--c-ink);
  line-height: 1.35;
  word-break: break-word;
  overflow-wrap: anywhere;
  max-width: 100%;
}

.league-podium__points {
  font-family: var(--font-en);
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--c-red);
}

.league-podium__hours {
  font-family: var(--font-en);
  font-size: 0.82rem;
  color: var(--c-ink-muted);
  font-weight: 700;
}

/* تصحيح على الجوال */
@media (max-width: 640px) {
  .league-podium__card { padding: 22px 16px; }
  .league-podium__name { font-size: 0.95rem; }
}

/* ═══════════ عام — هامش إضافي للصفحة ═══════════ */

.page-content,
.dashboard-layout {
  padding-inline: 0;
}

/* ═══════════ إزالة وصف الفرق من TeamCard القديمة ═══════════ */

.card__meta[data-team-desc] { display: none !important; }
`
);

/* ═══════════════════════════════════════════════════════════════
   8) global.css — إضافة v53-fix
   ═══════════════════════════════════════════════════════════════ */
file(
  "src/styles/global.css",
  `
/* sbapiaryy v5.3 — Global CSS */

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
  `${C.bold}${C.magenta}║  fix.cjs — v5.3 التحديثات الجديدة                    ║${C.reset}`
);
console.log(
  `${C.bold}${C.magenta}║  HomePage + League + Footer + TeamCard               ║${C.reset}`
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
  console.log(`  git commit -m "feat(v5.3): homepage + league redesign"`);
  console.log(`  git push origin main --force${C.reset}`);
}
console.log("");
