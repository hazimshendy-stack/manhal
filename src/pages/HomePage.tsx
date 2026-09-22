import { Link } from 'react-router-dom';
   import { site, activeSeason } from '@/data';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { teams } from '@/data/teams';
   import { getTeamTotalPoints } from '@/lib/rankings';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { TeamCard } from '@/components/team/TeamCard';
   import { Badge } from '@/components/ui/Badge';
   import { Loading } from '@/components/ui/Loading';
   import { EmptyState } from '@/components/ui/EmptyState';
   import type { Member, Contribution } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TeamCard } from '@/components/team/TeamCard';
import { login } from '@/lib/auth';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { getTeamTotalPoints } from '@/lib/rankings';
import { site } from '@/data/site';
import { activeSeason } from '@/data/site';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';
import { approvals } from '@/data/approvals';

   export function HomePage() {
     const { user } = useAuth();
     const { data: members, loading: lM } = useRealtimeCollection<Member>('members');
     const { data: contributions, loading: lC } = useRealtimeCollection<Contribution>('contributions');
     const isLoading = lM || lC;
     const activeMembers = members.filter((m) => m.status === 'active');
     const teamRanking = teams.map((team) => ({ team, points: getTeamTotalPoints(members, contributions, team.id) }))
       .sort((a, b) => b.points - a.points).map((r, i) => ({ ...r, rank: i + 1 }));
     return (
       <>
         <section className="home-hero">
           <div className="container">
             <div className="section-head__eyebrow">{activeSeason.label}</div>
             <h1 className="home-hero__title">The <span className="home-hero__brand">{site.organization}</span> Sub Branches Hub</h1>
             <p className="home-hero__desc">{site.description}</p>
             <div className="home-hero__actions">
               <Link to="/members" className="btn btn--primary">Browse Members</Link>
               <Link to="/committees" className="btn btn--ghost">Committees</Link>
               <Link to="/league" className="btn btn--ghost">League</Link>
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
                 <div className="stat"><div className="stat__value">{teamRanking.reduce((s, r) => s + r.points, 0)}</div><div className="stat__label">Total Points</div></div>
               </div>
             )}
           </div>
         </section>
         <section className="home-section">
           <div className="container">
             <SectionHeader eyebrow="Team Standings" title="Teams by Points" action={<Link to="/teams" className="btn btn--ghost btn--sm">All Teams</Link>} />
             {isLoading ? <Loading /> : teamRanking.length === 0 ? <EmptyState title="No data" message="No teams yet." /> : (
               <div className="home-teams-grid">{teamRanking.map((r) => <TeamCard key={r.team.id} team={r.team} rank={r.rank} />)}</div>
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
   