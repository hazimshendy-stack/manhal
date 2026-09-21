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
