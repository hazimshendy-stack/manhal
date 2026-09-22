import { Link } from 'react-router-dom';
   import type { Member } from '@/types';
   import { Avatar } from '@/components/ui/Avatar';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { teams } from '@/data/teams';
   import { safeArray } from '@/lib/safe';
   import { hoursToPoints } from '@/lib/format';
import { Avatar } from '@/components/ui/Avatar';
import { MemberRow } from '@/components/member/MemberRow';
import { hoursToPoints } from '@/lib/format';
import { safeArray } from '@/lib/safe';
import { ROLE_LABEL } from '@/lib/permissions';
import { teams } from '@/data/teams';
import { members } from '@/data/members';

   interface MemberRowProps {
     member: Member;
     rank?: number;
     showRole?: boolean;
     showTeam?: boolean;
     showCommittee?: boolean;
   }

   export function MemberRow({
     member,
     rank,
     showRole = true,
     showTeam = true,
     showCommittee = false,
   }: MemberRowProps) {
     const memberTeams = teams.filter((t) => safeArray(member.teamIds).includes(t.id));
     const points = hoursToPoints(member.hours || 0);

     return (
       <tr>
         {rank !== undefined ? (
           <td className={'rank rank--' + (rank <= 3 ? rank : '')} data-label="Rank">
             {rank}
           </td>
         ) : null}

         <td data-label="Member">
           <Link to={'/members/' + member.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
             <Avatar name={member.name} size={34} variant="navy" />
             <span style={{ fontWeight: 700 }}>{member.name}</span>
           </Link>
         </td>

         {showRole ? (
           <td className="muted small" data-label="Role">
             {ROLE_LABEL[member.role]}
           </td>
         ) : null}

         {showTeam ? (
           <td data-label="Team">
             <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
               {memberTeams.map((t) => (
                 <span key={t.id} className="badge">{t.name}</span>
               ))}
             </div>
           </td>
         ) : null}

         {showCommittee ? (
           <td data-label="Committee">
             <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
               {safeArray(member.committeeIds).length === 0 ? (
                 <span className="muted small">—</span>
               ) : null}
             </div>
           </td>
         ) : null}

         <td style={{ fontFamily: 'var(--font-en)' }} data-label="Hours">
           {member.hours || 0}
         </td>

         <td className="points" data-label="Points">
           {points}
         </td>
       </tr>
     );
   }
   