import { useMemo, useState } from 'react';
   import { Link } from 'react-router-dom';
   import { useRealtimeCollection, useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getGlobalRanking, getTeamRanking, getCommitteeRanking } from '@/lib/rankings';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Avatar } from '@/components/ui/Avatar';
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
       if (filterType === 'all' || filterId === 'all') return getGlobalRanking(members, contributions);
       if (filterType === 'team') return getTeamRanking(members, contributions, filterId as TeamId);
       return getCommitteeRanking(members, contributions, filterId);
     }, [members, contributions, filterType, filterId]);

     const title = filterType === 'all' ? 'Global Ranking'
       : filterType === 'team' ? 'Team: ' + (teams.find((t) => t.id === filterId)?.name || '')
       : 'Committee: ' + (liveCommittees.find((c) => c.id === filterId)?.nameAr || '');

     return (
       <div className="container">
         <PageHeader eyebrow="League" title="Leaderboard" description="Track ranking by team, committee, or globally." />
         <div className="chips mb-3">
           <button type="button" className={cx('chip', filterType === 'all' && 'is-active')} onClick={() => { setFilterType('all'); setFilterId('all'); }}>Global</button>
           <button type="button" className={cx('chip', filterType === 'team' && 'is-active')} onClick={() => { setFilterType('team'); setFilterId('all'); }}>By Team</button>
           <button type="button" className={cx('chip', filterType === 'committee' && 'is-active')} onClick={() => { setFilterType('committee'); setFilterId('all'); }}>By Committee</button>
         </div>
         {filterType === 'team' ? (
           <div className="chips mb-4">
             <button type="button" className={cx('chip', filterId === 'all' && 'is-active')} onClick={() => setFilterId('all')}>All Teams</button>
             {teams.map((t) => <button key={t.id} type="button" className={cx('chip', filterId === t.id && 'is-active')} onClick={() => setFilterId(t.id)}>{t.name}</button>)}
           </div>
         ) : null}
         {filterType === 'committee' ? (
           <div className="chips mb-4">
             <button type="button" className={cx('chip', filterId === 'all' && 'is-active')} onClick={() => setFilterId('all')}>All Committees</button>
             {liveCommittees.map((c) => <button key={c.id} type="button" className={cx('chip', filterId === c.id && 'is-active')} onClick={() => setFilterId(c.id)}>{c.nameAr}</button>)}
           </div>
         ) : null}
         <section className="section">
           <SectionHeader eyebrow="Ranking" title={title} />
           {loading ? <SkeletonList count={8} /> : board.length === 0 ? (
             <EmptyState title="No data" message="No ranking data for this filter." />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead><tr><th>#</th><th>Member</th><th>Hours</th><th>Points</th></tr></thead>
                 <tbody>{board.map((e) => (
                   <tr key={e.member.id}>
                     <td className={'rank rank--' + (e.rank <= 3 ? e.rank : '')}>{e.rank}</td>
                     <td><Link to={'/members/' + e.member.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={e.member.name} size={32} variant="navy" /><span style={{ fontWeight: 700 }}>{e.member.name}</span></Link></td>
                     <td>{e.hours}</td>
                     <td className="points">{e.points}</td>
                   </tr>
                 ))}</tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   