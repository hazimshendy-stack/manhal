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
