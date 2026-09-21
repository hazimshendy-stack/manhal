import { useMemo, useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { Loading, SkeletonList } from '@/components/ui/Loading';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Avatar } from '@/components/ui/Avatar';
   import { cx } from '@/lib/format';
   import type { Member, TeamId, RoleId } from '@/types';

   const LEAGUE_EXCLUDED: RoleId[] = ['HEAD', 'VICE'];

   type FilterType = 'all' | 'team' | 'committee';

   export function LeaguePage() {
     const { data: members, loading } = useCollection<Member>('members');
     const [filterType, setFilterType] = useState<FilterType>('all');
     const [filterId, setFilterId] = useState<string>('all');

     const eligible = useMemo(
       () => members.filter((m) => !LEAGUE_EXCLUDED.includes(m.role)),
       [members],
     );

     const filtered = useMemo(() => {
       if (filterType === 'all' || filterId === 'all') return eligible;
       if (filterType === 'team') {
         return eligible.filter((m) => m.teamIds.includes(filterId as TeamId));
       }
       return eligible.filter((m) => m.committeeIds.includes(filterId));
     }, [eligible, filterType, filterId]);

     const board = useMemo(() => {
       return [...filtered]
         .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
         .map((m, i) => ({ member: m, rank: i + 1, points: hoursToPoints(m.hours) }));
     }, [filtered]);

     const totalPoints = board.reduce((s, e) => s + e.points, 0);
     const totalHours = filtered.reduce((s, m) => s + (m.hours || 0), 0);

     const title =
       filterType === 'all'
         ? 'الترتيب العام'
         : filterType === 'team'
           ? 'ترتيب فريق ' + (teams.find((t) => t.id === filterId)?.nameAr || '')
           : 'ترتيب لجنة ' +
             (committees.find((c) => c.id === filterId)?.nameAr || '');

     return (
       <div className="container">
         <PageHeader
           eyebrow="الترتيب"
           title="الليج"
           description="ترتيب الأعضاء على مستوى المنظمة، الفريق، واللجنة."
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={board.length} label="الأعضاء" />
             <Stat value={totalPoints} label="مجموع النقاط" />
             <Stat value={totalHours} label="مجموع الساعات" />
           </StatRow>
         </section>

         <div className="chips mb-3">
           <button
             type="button"
             className={cx('chip', filterType === 'all' && 'is-active')}
             onClick={() => {
               setFilterType('all');
               setFilterId('all');
             }}
           >
             عام
           </button>
           <button
             type="button"
             className={cx('chip', filterType === 'team' && 'is-active')}
             onClick={() => {
               setFilterType('team');
               setFilterId('all');
             }}
           >
             حسب الفريق
           </button>
           <button
             type="button"
             className={cx('chip', filterType === 'committee' && 'is-active')}
             onClick={() => {
               setFilterType('committee');
               setFilterId('all');
             }}
           >
             حسب اللجنة
           </button>
         </div>

         {filterType === 'team' ? (
           <div className="chips mb-4">
             <button
               type="button"
               className={cx('chip', filterId === 'all' && 'is-active')}
               onClick={() => setFilterId('all')}
             >
               كل الفرق
             </button>
             {teams.map((t) => (
               <button
                 key={t.id}
                 type="button"
                 className={cx('chip', filterId === t.id && 'is-active')}
                 onClick={() => setFilterId(t.id)}
               >
                 {t.name}
               </button>
             ))}
           </div>
         ) : null}

         {filterType === 'committee' ? (
           <div className="chips mb-4">
             <button
               type="button"
               className={cx('chip', filterId === 'all' && 'is-active')}
               onClick={() => setFilterId('all')}
             >
               كل اللجان
             </button>
             {committees.map((c) => (
               <button
                 key={c.id}
                 type="button"
                 className={cx('chip', filterId === c.id && 'is-active')}
                 onClick={() => setFilterId(c.id)}
               >
                 {c.icon} {c.nameAr}
               </button>
             ))}
           </div>
         ) : null}

         <section className="section">
           <SectionHeader eyebrow="الترتيب" title={title} />

           {loading ? (
             <SkeletonList count={8} />
           ) : board.length === 0 ? (
             <EmptyState
               icon="🥇"
               title="لا بيانات"
               message="لا توجد مشاركات مسجلة لهذا التصنيف."
             />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>#</th>
                     <th>العضو</th>
                     <th>الفريق</th>
                     <th>الساعات</th>
                     <th>النقاط</th>
                   </tr>
                 </thead>
                 <tbody>
                   {board.map((e) => {
                     const memberTeams = teams.filter((t) =>
                       e.member.teamIds.includes(t.id),
                     );
                     return (
                       <tr key={e.member.id}>
                         <td
                           className={
                             'rank rank--' + (e.rank <= 3 ? e.rank : '')
                           }
                           data-label="الترتيب"
                         >
                           {e.rank}
                         </td>
                         <td data-label="العضو">
                           <div
                             style={{
                               display: 'flex',
                               alignItems: 'center',
                               gap: 10,
                             }}
                           >
                             <Avatar name={e.member.name} size={32} variant="navy" />
                             <span style={{ fontWeight: 700 }}>
                               {e.member.name}
                             </span>
                           </div>
                         </td>
                         <td data-label="الفريق">
                           <div
                             style={{
                               display: 'flex',
                               gap: 4,
                               flexWrap: 'wrap',
                             }}
                           >
                             {memberTeams.map((t) => (
                               <span key={t.id} className="badge">
                                 {t.name}
                               </span>
                             ))}
                           </div>
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
                     );
                   })}
                 </tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   