import { committees } from '@/data/committees';

   interface CommitteeBadgeProps {
     committeeId: string;
   }

   export function CommitteeBadge({ committeeId }: CommitteeBadgeProps) {
     const committee = committees.find((c) => c.id === committeeId);
     if (!committee) return null;

     return (
       <span
         className="badge"
         style={{
           background: committee.color + '15',
           borderColor: committee.color + '40',
           color: committee.color,
         }}
       >
         {committee.icon} {committee.nameAr}
       </span>
     );
   }
   