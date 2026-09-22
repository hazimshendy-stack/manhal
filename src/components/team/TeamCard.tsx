import { Link } from 'react-router-dom';
   import type { Team, Member } from '@/types';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { getTeamTotalPoints } from '@/lib/rankings';
   import type { Contribution } from '@/types';
import { teams } from '@/data/teams';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';

   interface TeamCardProps { team: Team; rank?: number; }
   export function TeamCard({ team, rank }: TeamCardProps) {
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const tm = members.filter((m) => Array.isArray(m.teamIds) && m.teamIds.includes(team.id));
     const totalPoints = getTeamTotalPoints(members, contributions, team.id);
     const avgPoints = tm.length === 0 ? 0 : Math.round(totalPoints / tm.length);
     return (
       <Link to={'/teams/' + team.id} className="team-card">
         <div className="team-card__head">
           <div className="team-card__name">{team.name}</div>
           {rank !== undefined ? <span className={'team-card__rank' + (rank === 1 ? ' team-card__rank--first' : '')}>#{rank}</span> : null}
         </div>
         <div className="team-card__stats">
           <div className="team-card__stat"><span className="team-card__stat-value">{totalPoints}</span><span className="team-card__stat-label">Points</span></div>
           <div className="team-card__stat"><span className="team-card__stat-value">{tm.length}</span><span className="team-card__stat-label">Members</span></div>
           <div className="team-card__stat"><span className="team-card__stat-value">{avgPoints}</span><span className="team-card__stat-label">Average</span></div>
         </div>
       </Link>
     );
   }
   