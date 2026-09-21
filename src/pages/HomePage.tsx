import { Link } from 'react-router-dom';
import { site, activeSeason } from '@/data';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { teams } from '@/data/teams';
import { hoursToPoints } from '@/lib/format';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TeamCard } from '@/components/team/TeamCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Member, Contribution } from '@/types';

export function HomePage() {
  const { user } = useAuth();
  const { data: members, loading: lM } = useRealtimeCollection<Member>('members');
  const { data: contributions, loading: lC } = useRealtimeCollection<Contribution>('contributions');
  const isLoading = lM || lC;
  const activeMembers = members.filter((m) => m.status === 'active');
  const totalHours = contributions.filter((c) => c.status === 'approved').reduce((s, c) => s + c.hours, 0);
  const totalPoints = hoursToPoints(totalHours);
  const teamRanking = teams.map((team) => {
    const tm = activeMembers.filter((m) => m.teamIds.includes(team.id));
    const pts = tm.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);
    return { team, points: pts };
  }).sort((a, b) => b.points - a.points).map((r, i) => ({ ...r, rank: i + 1 }));
  const topMembers = [...activeMembers]
    .filter((m) => m.role !== 'HEAD' && m.role !== 'VICE')
    .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
    .slice(0, 5)
    .map((m, i) => ({ member: m, rank: i + 1 }));
  return (
    <>
      <section className="home-hero">
        <div className="container">
          <div className="section-head__eyebrow">{activeSeason.label}</div>
          <h1 className="home-hero__title">The <span className="home-hero__brand">{site.organization}</span> Sub Branches Hub</h1>
          <p className="home-hero__desc">{site.description}</p>
          <div className="home-hero__actions">
            <Link to="/members" className="btn btn--primary">Browse Members</Link>
            <Link to="/league" className="btn btn--ghost">View League</Link>
            {!user ? <Link to="/login" className="btn btn--ghost">Sign In</Link> : null}
          </div>
        </div>
      </section>
      <section className="home-section">
        <div className="container">
          {isLoading ? <Loading /> : (
            <div className="home-stats">
              <div className="stat"><div className="stat__value">{activeMembers.length}</div><div className="stat__label">Members</div></div>
              <div className="stat"><div className="stat__value">{teams.length}</div><div className="stat__label">Teams</div></div>
              <div className="stat"><div className="stat__value">{totalPoints}</div><div className="stat__label">Total Points</div></div>
              <div className="stat"><div className="stat__value">{totalHours}</div><div className="stat__label">Total Hours</div></div>
            </div>
          )}
        </div>
      </section>
      <section className="home-section">
        <div className="container">
          <SectionHeader eyebrow="Team Standings" title="Teams by Points" action={<Link to="/teams" className="btn btn--ghost btn--sm">All Teams</Link>} />
          {isLoading ? <Loading /> : teamRanking.length === 0 ? <EmptyState title="No data" message="No teams yet." /> : (
            <div className="home-teams-grid">
              {teamRanking.map((r) => <TeamCard key={r.team.id} team={r.team} rank={r.rank} />)}
            </div>
          )}
        </div>
      </section>
      <section className="home-section">
        <div className="container">
          <SectionHeader eyebrow="General Ranking" title="Top Members" action={<Link to="/league" className="btn btn--ghost btn--sm">Full Leaderboard</Link>} />
          {isLoading ? <Loading /> : topMembers.length === 0 ? <EmptyState title="No members" message="No members yet." /> : (
            <div className="league-table">
              <div className="league-table__head"><span>#</span><span>Member</span><span>Team</span><span>Hours</span><span>Points</span></div>
              {topMembers.map((e) => {
                const tm = teams.filter((t) => e.member.teamIds.includes(t.id));
                return (
                  <Link key={e.member.id} to={'/members/' + e.member.id} className="league-table__row">
                    <span className={'col-rank' + (e.rank <= 3 ? ' rank-' + e.rank : '')}>{e.rank}</span>
                    <span className="col-name"><Avatar name={e.member.name} size={32} variant="navy" /><span className="league-table__name">{e.member.name}</span></span>
                    <span className="col-team">{tm.map((t) => <span key={t.id} className="badge">{t.name}</span>)}</span>
                    <span className="col-hours">{e.member.hours}</span>
                    <span className="col-points">{hoursToPoints(e.member.hours)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      {!user ? (
        <section className="home-section">
          <div className="container">
            <div className="home-join-cta">
              <Badge variant="red" dot>{activeSeason.theme}</Badge>
              <h2 className="home-join-cta__title">Join the Hub</h2>
              <p className="home-join-cta__desc">Sign in to track your contributions, league progress, and pending approvals.</p>
              <div className="home-join-cta__actions"><Link to="/login" className="btn btn--primary">Sign In</Link></div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}