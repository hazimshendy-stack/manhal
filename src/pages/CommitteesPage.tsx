import { committees } from '@/data/committees';
   import { members } from '@/data/members';
   import { hoursToPoints } from '@/lib/format';
   import { CommitteeCard } from '@/components/committee/CommitteeCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';

   export function CommitteesPage() {
     const totalCommittees = committees.length;
     const totalMembersInCommittees = new Set(
       members.flatMap((m) => m.committeeIds),
     ).size;
     const totalCommitteePoints = members
       .filter((m) => m.committeeIds.length > 0)
       .reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);

     return (
       <div className="container">
         <PageHeader
           eyebrow="الحوكمة"
           title="اللجان"
           description="لجان المنظمة ومهامها وترتيب الأعضاء داخلها."
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={totalCommittees} label="اللجان" />
             <Stat value={totalMembersInCommittees} label="الأعضاء" />
             <Stat value={totalCommitteePoints} label="مجموع النقاط" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader
             eyebrow="القائمة"
             title="كل اللجان"
             description="اضغط على أي لجنة لعرض تفاصيلها وترتيب أعضائها."
           />
           <div className="grid grid--wide">
             {committees.map((c) => (
               <CommitteeCard key={c.id} committee={c} />
             ))}
           </div>
         </section>
       </div>
     );
   }
   