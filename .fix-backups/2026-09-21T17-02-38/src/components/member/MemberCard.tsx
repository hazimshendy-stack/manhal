import { Link } from 'react-router-dom';
   import type { Member } from '@/types';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints } from '@/lib/format';

   interface MemberCardProps {
     member: Member;
     showTeam?: boolean;
     showCommittee?: boolean;
   }

   export function MemberCard({ member, showTeam = true, showCommittee = true }: MemberCardProps) {
     const totalHours = member.hours || 0;
     const totalPoints = hoursToPoints(totalHours);

     const memberTeams = teams.filter((t) => member.teamIds.includes(t.id));
     const memberCommittees = committees.filter((c) => member.committeeIds.includes(c.id));

     return (
       <Link to={'/members/' + member.id} className="card">
         <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
           <Avatar name={member.name} size={52} variant="navy" />
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title" style={{ fontSize: '1rem' }}>
               {member.name}
             </div>
             <div className="card__meta">{ROLE_LABEL[member.role]}</div>
           </div>
         </div>

         {showTeam && memberTeams.length > 0 ? (
           <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
             {memberTeams.map((t) => (
               <Badge key={t.id}>{t.name}</Badge>
             ))}
           </div>
         ) : null}

         {showCommittee && memberCommittees.length > 0 ? (
           <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
             {memberCommittees.map((c) => (
               <Badge key={c.id} variant="info">
                 {c.icon} {c.nameAr}
               </Badge>
             ))}
           </div>
         ) : null}

         <div
           className="row row--between"
           style={{
             marginTop: 14,
             paddingTop: 12,
             borderTop: '1px solid var(--c-line)',
           }}
         >
           <div>
             <div className="tiny muted">المشاركات</div>
             <div
               style={{
                 fontFamily: 'var(--font-en)',
                 fontSize: '1.05rem',
                 fontWeight: 800,
                 color: 'var(--c-navy)',
               }}
             >
               {totalHours}
             </div>
           </div>
           <div>
             <div className="tiny muted">النقاط</div>
             <div
               style={{
                 fontFamily: 'var(--font-en)',
                 fontSize: '1.05rem',
                 fontWeight: 800,
                 color: 'var(--c-red)',
               }}
             >
               {totalPoints}
             </div>
           </div>
         </div>
       </Link>
     );
   }
   