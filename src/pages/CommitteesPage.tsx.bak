import { useRealtimeCollection, useCollection } from '@/lib/useRealtimeCollection';
   import { getCommitteeTotalPoints } from '@/lib/rankings';
   import { CommitteeCard } from '@/components/committee/CommitteeCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import type { Committee, Member, Contribution } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { SkeletonList } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat } from '@/components/ui/Stat';
import { StatRow } from '@/components/ui/Stat';
import { CommitteeCard } from '@/components/committee/CommitteeCard';
import { getCommitteeTotalPoints } from '@/lib/rankings';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';

   export function CommitteesPage() {
     const { data: committees, loading } = useCollection<Committee>('committees');
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const ranking = committees.map((c) => ({ committee: c, points: getCommitteeTotalPoints(members, contributions, c.id) }))
       .sort((a, b) => b.points - a.points).map((r, i) => ({ committee: r.committee, rank: i + 1 }));
     return (
       <div className="container">
         <PageHeader eyebrow="Governance" title="Committees" description="Committees are like teams — each member belongs to at least one." />
         <section className="section--tight"><StatRow><Stat value={committees.length} label="Committees" /><Stat value={members.length} label="Members" /><Stat value={ranking.reduce((s, r) => s + r.points, 0)} label="Total Points" /></StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="Ranking" title="All Committees" />
           {loading ? <SkeletonList count={4} /> : ranking.length === 0 ? <EmptyState title="No committees" message="No committees yet." /> : (
             <div className="grid grid--wide">{ranking.map((r) => <CommitteeCard key={r.committee.id} committee={r.committee} rank={r.rank} />)}</div>
           )}
         </section>
       </div>
     );
   }
   