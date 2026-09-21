import { useMemo, useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { ROLE_LABEL } from '@/lib/permissions';
   import type { Member, TeamId } from '@/types';
   import { MemberCard } from '@/components/member/MemberCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading, SkeletonList } from '@/components/ui/Loading';
   import { cx } from '@/lib/format';

   export function MembersPage() {
     const { data: members, loading } = useCollection<Member>('members');
     const [query, setQuery] = useState('');
     const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');
     const [committeeFilter, setCommitteeFilter] = useState<string>('all');

     const filtered = useMemo(() => {
       const q = query.trim();
       return members.filter((m) => {
         const matchesQuery = !q || m.name.includes(q);
         const matchesTeam =
           teamFilter === 'all' || m.teamIds.includes(teamFilter);
         const matchesCommittee =
           committeeFilter === 'all' ||
           m.committeeIds.includes(committeeFilter);
         return matchesQuery && matchesTeam && matchesCommittee;
       });
     }, [members, query, teamFilter, committeeFilter]);

     return (
       <div className="container">
         <PageHeader
           eyebrow="الأعضاء"
           title="جميع الأعضاء"
           description="تصفّح، ابحث، وفلتر بالفريق واللجنة."
         />

         <div className="toolbar">
           <input
             className="input"
             type="search"
             placeholder="ابحث بالاسم..."
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />
         </div>

         <div className="chips mb-4">
           <button
             type="button"
             className={cx('chip', teamFilter === 'all' && 'is-active')}
             onClick={() => setTeamFilter('all')}
           >
             كل الفرق
           </button>
           {teams.map((t) => (
             <button
               key={t.id}
               type="button"
               className={cx('chip', teamFilter === t.id && 'is-active')}
               onClick={() => setTeamFilter(t.id)}
             >
               {t.name}
             </button>
           ))}
         </div>

         <div className="chips mb-4">
           <button
             type="button"
             className={cx('chip', committeeFilter === 'all' && 'is-active')}
             onClick={() => setCommitteeFilter('all')}
           >
             كل اللجان
           </button>
           {committees.map((c) => (
             <button
               key={c.id}
               type="button"
               className={cx('chip', committeeFilter === c.id && 'is-active')}
               onClick={() => setCommitteeFilter(c.id)}
             >
               {c.icon} {c.nameAr}
             </button>
           ))}
         </div>

         {loading ? (
           <SkeletonList count={6} />
         ) : filtered.length === 0 ? (
           <EmptyState
             icon="👥"
             title="لا نتائج"
             message="لم يتم العثور على أعضاء مطابقين للبحث."
           />
         ) : (
           <div className="grid grid--wide">
             {filtered.map((m) => (
               <MemberCard key={m.id} member={m} />
             ))}
           </div>
         )}
       </div>
     );
   }
   