import type { Committee } from '@/types';
   import { members } from '@/data/members';
   import { Badge } from '@/components/ui/Badge';

   interface CommitteeCardProps {
     committee: Committee;
   }

   export function CommitteeCard({ committee }: CommitteeCardProps) {
     const committeeMembers = members.filter((m) =>
       m.committeeIds.includes(committee.id),
     );

     return (
       <div className="card no-click">
         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <div
             style={{
               width: 48,
               height: 48,
               borderRadius: 14,
               background: committee.color + '15',
               border: '1px solid ' + committee.color + '30',
               display: 'grid',
               placeItems: 'center',
               fontSize: '1.5rem',
               flexShrink: 0,
             }}
             aria-hidden="true"
           >
             {committee.icon}
           </div>
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{committee.nameAr}</div>
             <div className="card__meta">{committee.description}</div>
           </div>
         </div>

         <div className="row mt-4" style={{ gap: 6 }}>
           <Badge variant="neutral">
             {committeeMembers.length} عضو
           </Badge>
         </div>
       </div>
     );
   }
   