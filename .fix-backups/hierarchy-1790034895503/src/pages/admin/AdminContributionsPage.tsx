import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { notifyUser } from '@/lib/notifications';
import { teams } from '@/data/teams';
import { hoursToPoints, formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { cx } from '@/lib/format';
import type { Contribution, ContributionStatus } from '@/types';

const STATUS_LABEL: Record<string, string> = { all: 'All', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

export function AdminContributionsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<Contribution>('contributions');
  const [status, setStatus] = useState<ContributionStatus | 'all'>('pending');
  const [toDelete, setToDelete] = useState<Contribution | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = data.filter((c) => status === 'all' || c.status === status).sort((a, b) => (a.date < b.date ? 1 : -1));

  const approve = async (c: Contribution) => {
    try {
      await updateOne('contributions', c.id, { status: 'approved' });
      await logAudit(me, 'APPROVE_CONTRIBUTION', 'Contribution', c.id, c.title);
      await notifyUser(c.createdBy, 'Contribution approved', '"' + c.title + '" — +' + hoursToPoints(c.hours) + ' points', 'participation', '/my-contributions', 'normal', me?.displayName);
      toast.success('Approved');
    } catch { toast.error('Failed'); }
  };
  const reject = async (c: Contribution) => {
    try {
      await updateOne('contributions', c.id, { status: 'rejected' });
      await logAudit(me, 'REJECT_CONTRIBUTION', 'Contribution', c.id, c.title);
      await notifyUser(c.createdBy, 'Contribution rejected', '"' + c.title + '"', 'participation', '/my-contributions', 'high', me?.displayName);
      toast.success('Rejected');
    } catch { toast.error('Failed'); }
  };
  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('contributions', toDelete.id);
      await logAudit(me, 'DELETE_CONTRIBUTION', 'Contribution', toDelete.id, toDelete.title);
      toast.success('Deleted');
      setToDelete(null);
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Contributions" description="Approve or reject member contributions." />
      <div className="chips mb-4">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>
        ))}
      </div>
      <SectionHeader eyebrow="List" title={'Contributions (' + filtered.length + ')'} />
      {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? (
        <EmptyState title="No contributions" message="No contributions match the filter." />
      ) : (
        <div className="stack">
          {filtered.map((c) => {
            const team = teams.find((t) => t.id === c.teamId);
            return (
              <div key={c.id} className="card no-click">
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{c.title}</div>
                    <div className="card__meta">{c.memberName} · {team?.name} · {formatDate(c.date)}</div>
                  </div>
                  <Badge variant={c.status === 'approved' ? 'success' : c.status === 'pending' ? 'warning' : 'danger'}>
                    {c.status === 'approved' ? 'Approved' : c.status === 'pending' ? 'Pending' : 'Rejected'}
                  </Badge>
                </div>
                <p className="small soft mt-2">{c.description}</p>
                <div className="row mt-3" style={{ gap: 10, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.9rem' }}>
                    <span>{c.hours} <span className="muted">hours</span></span>
                    <span className="points">{hoursToPoints(c.hours)} points</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.status === 'pending' ? (
                      <>
                        <button type="button" className="btn btn--success btn--sm" onClick={() => approve(c)}>✓ Approve</button>
                        <button type="button" className="btn btn--outline-danger btn--sm" onClick={() => reject(c)}>✕ Reject</button>
                      </>
                    ) : null}
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setToDelete(c)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog open={toDelete !== null} title="Delete Contribution" message={'Delete "' + (toDelete?.title || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}