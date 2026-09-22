import { useMemo, useState } from 'react';
   import { Link } from 'react-router-dom';
   import { useRealtimeCollection, useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getGlobalRanking, getTeamRanking, getCommitteeRanking } from '@/lib/rankings';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Avatar } from '@/components/ui/Avatar';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { cx } from '@/lib/format';
   import type { Member, Contribution, TeamId, Committee } from '@/types';

   type FilterType = 'all' | 'team' | 'committee';

   export function LeaguePage() {
     const { data: members, loading } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const { data: liveCommittees } = useCollection<Committee>('committees');

     const [filterType, setFilterType] = useState<FilterType>('all');
     const [filterId, setFilterId] = useState<string>('all');

     const board = useMemo(() => {
       if (filterType === 'all' || filterId === 'all') {
         return getGlobalRanking(members, contributions);
       }
       if (filterType === 'team') {
         return getTeamRanking(members, contributions, filterId as TeamId);
       }
       return getCommitteeRanking(members, contributions, filterId);
     }, [members, contributions, filterType, filterId]);

     const title = useMemo(() => {
       if (filterType === 'all') return 'Global Ranking';
       if (filterType === 'team') {
         const t = teams.find((x) => x.id === filterId);
         return t ? t.name + ' Team' : 'Team Ranking';
       }
       const c = liveCommittees.find((x) => x.id === filterId);
       return c ? c.nameAr : 'Committee Ranking';
     }, [filterType, filterId, liveCommittees]);

     const totalPoints = board.reduce((s, e) => s + e.points, 0);
     const totalHours = board.reduce((s, e) => s + e.hours, 0);

     const top3 = board.slice(0, 3);
     const rest = board.slice(3);

     return (
       <div className="container">
         <PageHeader
           eyebrow="League"
           title="Leaderboard"
           description="Ranked by contribution points. Team, committee, and global standings."
         />

         {/* ═══ Filters ═══ */}
         <div className="chips mb-3">
           <button
             type="button"
             className={cx('chip', filterType === 'all' && 'is-active')}
             onClick={() => { setFilterType('all'); setFilterId('all'); }}
           >
             Global
           </button>
           <button
             type="button"
             className={cx('chip', filterType === 'team' && 'is-active')}
             onClick={() => { setFilterType('team'); setFilterId('all'); }}
           >
             By Team
           </button>
           <button
             type="button"
             className={cx('chip', filterType === 'committee' && 'is-active')}
             onClick={() => { setFilterType('committee'); setFilterId('all'); }}
           >
             By Committee
           </button>
         </div>

         {filterType === 'team' ? (
           <div className="chips mb-4">
             <button
               type="button"
               className={cx('chip', filterId === 'all' && 'is-active')}
               onClick={() => setFilterId('all')}
             >
               All Teams
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
               All Committees
             </button>
             {liveCommittees.map((c) => (
               <button
                 key={c.id}
                 type="button"
                 className={cx('chip', filterId === c.id && 'is-active')}
                 onClick={() => setFilterId(c.id)}
               >
                 {c.nameAr}
               </button>
             ))}
           </div>
         ) : null}

         {/* ═══ Summary ═══ */}
         {!loading && board.length > 0 ? (
           <section className="section--tight">
             <StatRow>
               <Stat value={board.length} label="Ranked" />
               <Stat value={totalPoints} label="Points" variant="red" />
               <Stat value={totalHours} label="Hours" />
             </StatRow>
           </section>
         ) : null}

         {/* ═══ Loading ═══ */}
         {loading ? (
           <section className="section">
             <SkeletonList count={8} />
           </section>
         ) : board.length === 0 ? (
           <section className="section">
             <EmptyState
               icon="🏆"
               title="No ranking yet"
               message="No approved contributions in this category."
             />
           </section>
         ) : (
           <>
             {/* ═══ Podium — Top 3 ═══ */}
             {top3.length > 0 ? (
               <section className="section--tight">
                 <div className="league-podium">
                   {top3.map((e, idx) => (
                     <Link
                       key={e.member.id}
                       to={'/members/' + e.member.id}
                       className={'league-podium__card league-podium__card--' + (idx + 1)}
                     >
                       <span className={'league-podium__rank league-podium__rank--' + (idx + 1)}>
                         #{e.rank}
                       </span>
                       <Avatar name={e.member.name} size={64} variant="gradient" />
                       <div className="league-podium__name">{e.member.name}</div>
                       <div className="league-podium__points">{e.points} pts</div>
                       <div className="league-podium__hours">{e.hours} hrs</div>
                     </Link>
                   ))}
                 </div>
               </section>
             ) : null}

             {/* ═══ Rest of the table ═══ */}
             {rest.length > 0 ? (
               <section className="section">
                 <div className="league-table">
                   <div className="league-table__head">
                     <span>#</span>
                     <span>Member</span>
                     <span>Team</span>
                     <span>Hours</span>
                     <span>Points</span>
                   </div>
                   {rest.map((e) => {
                     const memberTeams = teams.filter((t) =>
                       Array.isArray(e.member.teamIds) && e.member.teamIds.includes(t.id),
                     );
                     return (
                       <Link
                         key={e.member.id}
                         to={'/members/' + e.member.id}
                         className="league-table__row"
                       >
                         <span className="col-rank">
                           <span className={'rank-badge rank-' + (e.rank <= 3 ? e.rank : '')}>
                             {e.rank}
                           </span>
                         </span>
                         <span className="col-name">
                           <Avatar name={e.member.name} size={32} variant="navy" />
                           <span className="league-table__name">{e.member.name}</span>
                         </span>
                         <span className="col-team">
                           {memberTeams.length === 0
                             ? '—'
                             : memberTeams.map((t) => (
                                 <span key={t.id} className="badge">{t.name}</span>
                               ))}
                         </span>
                         <span className="col-hours">{e.hours}</span>
                         <span className="col-points">{e.points}</span>
                       </Link>
                     );
                   })}
                 </div>
               </section>
             ) : null}
           </>
         )}
       </div>
     );
   }
   