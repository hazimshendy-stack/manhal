import { useMemo, useState } from 'react';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import type { Member, TeamId } from '@/types';
import { MemberCard } from '@/components/member/MemberCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { cx } from '@/lib/format';

export function MembersPage() {
  const { data: members, loading } = useRealtimeCollection<Member>('members');
  const [query, setQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');
  const [committeeFilter, setCommitteeFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesQuery = !q || m.name.toLowerCase().includes(q);
      const matchesTeam = teamFilter === 'all' || m.teamIds.includes(teamFilter);
      const matchesCommittee = committeeFilter === 'all' || m.committeeIds.includes(committeeFilter);
      return matchesQuery && matchesTeam && matchesCommittee;
    });
  }, [members, query, teamFilter, committeeFilter]);

  return (
    <div className="container">
      <PageHeader eyebrow="Members" title="All Members" description="Browse, search, and filter by team or committee." />
      <div className="toolbar">
        <input className="input" type="search" placeholder="Search by name..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="chips mb-4">
        <button type="button" className={cx('chip', teamFilter === 'all' && 'is-active')} onClick={() => setTeamFilter('all')}>All Teams</button>
        {teams.map((t) => (
          <button key={t.id} type="button" className={cx('chip', teamFilter === t.id && 'is-active')} onClick={() => setTeamFilter(t.id)}>{t.name}</button>
        ))}
      </div>
      <div className="chips mb-4">
        <button type="button" className={cx('chip', committeeFilter === 'all' && 'is-active')} onClick={() => setCommitteeFilter('all')}>All Committees</button>
        {committees.map((c) => (
          <button key={c.id} type="button" className={cx('chip', committeeFilter === c.id && 'is-active')} onClick={() => setCommitteeFilter(c.id)}>{c.nameAr}</button>
        ))}
      </div>
      {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? (
        <EmptyState title="No results" message="No members match your search." />
      ) : (
        <div className="grid grid--wide">
          {filtered.map((m) => <MemberCard key={m.id} member={m} />)}
        </div>
      )}
    </div>
  );
}