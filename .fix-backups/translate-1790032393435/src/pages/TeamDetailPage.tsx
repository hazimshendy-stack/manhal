import { useParams } from 'react-router-dom';
   import { teams } from '@/data/teams';
   import { members } from '@/data/members';
   import { hoursToPoints } from '@/lib/format';
   import { MemberCard } from '@/components/member/MemberCard';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { NotFoundPage } from './NotFoundPage';
   import type { TeamId } from '@/types';

   export function TeamDetailPage() {
     const { teamId } = useParams<{ teamId: string }>();
     const team = teams.find((t) => t.id === (teamId as TeamId));
     if (!team) return <NotFoundPage />;

     const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
     const totalHours = teamMembers.reduce((s, m) => s + (m.hours || 0), 0);
     const totalPoints = hoursToPoints(totalHours);
     const avgPoints =
       teamMembers.length === 0
         ? 0
         : Math.round(totalPoints / teamMembers.length);

     const board = [...teamMembers]
       .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
       .map((m, i) => ({
         member: m,
         rank: i + 1,
         points: hoursToPoints(m.hours),
       }));

     return (
       <div className="container section--tight">
         <div className="profile">
           <div className="profile__main">
             <h1 className="profile__name">{team.name}</h1>
             <div className="profile__role">{team.nameAr}</div>
             <p className="profile__bio">{team.description}</p>
           </div>
         </div>

         <section className="section">
           <StatRow>
             <Stat value={teamMembers.length} label="الأعضاء" />
             <Stat value={totalPoints} label="مجموع النقاط" />
             <Stat value={avgPoints} label="متوسط النقاط" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الأعضاء" title="أعضاء الفريق" />
           {teamMembers.length === 0 ? (
             <EmptyState
               icon="👥"
               title="لا أعضاء"
               message="لا يوجد أعضاء في هذا الفريق حاليًا."
             />
           ) : (
             <div className="grid grid--wide">
               {teamMembers.map((m) => (
                 <MemberCard key={m.id} member={m} showTeam={false} />
               ))}
             </div>
           )}
         </section>

         <section className="section">
           <SectionHeader eyebrow="الترتيب" title="ترتيب الفريق" />
           {board.length === 0 ? (
             <EmptyState
               icon="📊"
               title="لا بيانات"
               message="لا توجد بيانات لعرض الترتيب."
             />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>#</th>
                     <th>العضو</th>
                     <th>الساعات</th>
                     <th>النقاط</th>
                   </tr>
                 </thead>
                 <tbody>
                   {board.map((e) => (
                     <tr key={e.member.id}>
                       <td
                         className={'rank rank--' + (e.rank <= 3 ? e.rank : '')}
                         data-label="الترتيب"
                       >
                         {e.rank}
                       </td>
                       <td data-label="العضو" style={{ fontWeight: 700 }}>
                         {e.member.name}
                       </td>
                       <td
                         style={{ fontFamily: 'var(--font-en)' }}
                         data-label="الساعات"
                       >
                         {e.member.hours}
                       </td>
                       <td className="points" data-label="النقاط">
                         {e.points}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   