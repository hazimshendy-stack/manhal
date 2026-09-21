import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { committees as defaultCommittees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { CommitteeCard } from '@/components/committee/CommitteeCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat, StatRow } from '@/components/ui/Stat';
import { Loading } from '@/components/ui/Loading';
import type { Committee, Member } from '@/types';

export function CommitteesPage() {
  const { data: committees, loading: lc } = useRealtimeCollection<Committee>('committees');
  const { data: members, loading: lm } = useRealtimeCollection<Member>('members');

  const list = committees.length > 0 ? committees : defaultCommittees;
  const totalMembersInCommittees = new Set(members.flatMap((m) => m.committeeIds)).size;
  const totalCommitteePoints = members.filter((m) => m.committeeIds.length > 0).reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);

  return (
    <div className="container">
      <PageHeader eyebrow="Governance" title="Committees" description="Organization committees and their members." />
      <section className="section--tight">
        {lc || lm ? <Loading /> : (
          <StatRow>
            <Stat value={list.length} label="Committees" />
            <Stat value={totalMembersInCommittees} label="Members" />
            <Stat value={totalCommitteePoints} label="Total Points" />
          </StatRow>
        )}
      </section>
      <section className="section">
        <SectionHeader eyebrow="List" title="All Committees" />
        <div className="grid grid--wide">
          {list.map((c) => <CommitteeCard key={c.id} committee={c} />)}
        </div>
      </section>
    </div>
  );
}