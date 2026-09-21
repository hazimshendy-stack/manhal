import { useMemo, useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { seesAllTeams } from '@/lib/permissions';
import { teams } from '@/data/teams';
import { ContributionRow } from '@/components/contribution/ContributionRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { cx } from '@/lib/format';
import type { Contribution, ContributionStatus, TeamId } from '@/types';

const STATUSES: Array<ContributionStatus | 'all'> = ['all', 'pending', 'approved', 'rejected'];
const STATUS_LABEL: Record<string, string> = { all: 'All', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

export function ContributionsPage() {
  const { user } = useAuth();
  const { data, loading } = useCollection<Contribution>('contributions');
  const [status, setStatus] = useState<ContributionStatus | 'all'>('all');
  const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');

  const filtered = useMemo(() => {
    let list = data;
    if (user && !seesAllTeams(user) && user.teamId) list = list.filter((c) => c.teamId === user.teamId);
    return list
      .filter((c) => status === 'all' || c.status === status)
      .filter((c) => teamFilter === 'all' || c.teamId === teamFilter)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data, status, teamFilter, user]);

  return (
    <div className="container">
      <PageHeader eyebrow="Contributions" title="All Contributions" description="Review and approve member contributions. Each hour = 5 points." />
      <div className="chips mb-3">
        {STATUSES.map((s) => (
          <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>
        ))}
      </div>
      <div className="chips mb-4">
        <button type="button" className={cx('chip', teamFilter === 'all' && 'is-active')} onClick={() => setTeamFilter('all')}>All Teams</button>
        {teams.map((t) => (
          <button key={t.id} type="button" className={cx('chip', teamFilter === t.id && 'is-active')} onClick={() => setTeamFilter(t.id)}>{t.name}</button>
        ))}
      </div>
      <section className="section">
        <SectionHeader eyebrow="List" title={'Contributions (' + filtered.length + ')'} />
        {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? (
          <EmptyState title="No contributions" message="No contributions match the filters." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Member</th><th>Team</th><th>Title</th><th>Date</th><th>Hours</th><th>Points</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((c) => <ContributionRow key={c.id} contribution={c} showMember showTeam />)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}