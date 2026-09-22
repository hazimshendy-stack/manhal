import { Link } from 'react-router-dom';
   import type { Committee, Member } from '@/types';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { getCommitteeTotalPoints } from '@/lib/rankings';
   import { teams } from '@/data/teams';
   import type { Contribution } from '@/types';
import { CommitteeCard } from '@/components/committee/CommitteeCard';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { getCommitteeTotalPoints } from '@/lib/rankings';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';

   interface CommitteeCardProps { committee: Committee; rank?: number; }
   export function CommitteeCard({ committee, rank }: CommitteeCardProps) {
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const cm = members.filter((m) => Array.isArray(m.committeeIds) && m.committeeIds.includes(committee.id));
     const totalPoints = getCommitteeTotalPoints(members, contributions, committee.id);
     const avgPoints = cm.length === 0 ? 0 : Math.round(totalPoints / cm.length);
     const team = committee.teamId ? teams.find((t) => t.id === committee.teamId) : null;
     return (
       <Link to={'/committees/' + committee.id} className="committee-card">
         <div className="committee-card__head">
           <div>
             <div className="committee-card__name">{committee.nameAr}</div>
             {team ? <div className="committee-card__team">Team: {team.name}</div> : null}
           </div>
           {rank !== undefined ? (
             <span className={'committee-rank-badge' + (rank === 1 ? ' committee-rank-badge--first' : '')}>#{rank}</span>
           ) : <span className="committee-card__color" style={{ background: committee.color }} />}
         </div>
         <div className="committee-card__stats">
           <div className="committee-card__stat"><span className="committee-card__stat-value">{totalPoints}</span><span className="committee-card__stat-label">Points</span></div>
           <div className="committee-card__stat"><span className="committee-card__stat-value">{cm.length}</span><span className="committee-card__stat-label">Members</span></div>
           <div className="committee-card__stat"><span className="committee-card__stat-value">{avgPoints}</span><span className="committee-card__stat-label">Average</span></div>
         </div>
       </Link>
     );
   }
   