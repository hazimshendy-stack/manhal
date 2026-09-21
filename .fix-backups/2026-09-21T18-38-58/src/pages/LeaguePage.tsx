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
