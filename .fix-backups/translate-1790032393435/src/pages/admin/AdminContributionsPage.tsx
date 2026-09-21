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

const STATUS_LABEL: Record<string, string> = {
  all: 'الكل',
  pending: 'معلّقة',
  approved: 'معتمدة',
  rejected: 'مرفوضة',
};

export function AdminContributionsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<Contribution>('contributions');
  const [status, setStatus] = useState<ContributionStatus | 'all'>('pending');
  const [toDelete, setToDelete] = useState<Contribution | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = data
    .filter((c) => status === 'all' || c.status === status)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const approve = async (c: Contribution) => {
    try {
      await updateOne('contributions', c.id, { status: 'approved' });
      await logAudit(me, 'APPROVE_CONTRIBUTION', 'Contribution', c.id, c.title);
      await notifyUser(
        c.createdBy,
        'تم اعتماد مشاركتك',
        '"' + c.title + '" — +' + hoursToPoints(c.hours) + ' نقطة',
        'participation',
        '/my-contributions',
        'normal',
        me?.displayName,
      );
      toast.success('تم الاعتماد');
    } catch { toast.error('فشل الاعتماد'); }
  };

  const reject = async (c: Contribution) => {
    try {
      await updateOne('contributions', c.id, { status: 'rejected' });
      await logAudit(me, 'REJECT_CONTRIBUTION', 'Contribution', c.id, c.title);
      await notifyUser(
        c.createdBy,
        'تم رفض مشاركتك',
        '"' + c.title + '"',
        'participation',
        '/my-contributions',
        'high',
        me?.displayName,
      );
      toast.success('تم الرفض');
    } catch { toast.error('فشل الرفض'); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('contributions', toDelete.id);
      await logAudit(me, 'DELETE_CONTRIBUTION', 'Contribution', toDelete.id, toDelete.title);
      toast.success('تم الحذف');
      setToDelete(null);
    } catch { toast.error('فشل الحذف'); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader eyebrow="إدارة" title="المشاركات" description="اعتماد أو رفض مشاركات الأعضاء." />

      <div className="chips mb-4">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={cx('chip', status === s && 'is-active')}
            onClick={() => setStatus(s)}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <SectionHeader eyebrow="القائمة" title={'المشاركات (' + filtered.length + ')'} />

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title="لا مشاركات" message="لا توجد مشاركات بهذه الحالة." />
      ) : (
        <div className="stack">
          {filtered.map((c) => {
            const team = teams.find((t) => t.id === c.teamId);
            return (
              <div key={c.id} className="card no-click contribution-card">
                <div className="contribution-card__head">
                  <div className="contribution-card__info">
                    <div className="contribution-card__title">{c.title}</div>
                    <div className="contribution-card__meta">
                      {c.memberName} · {team?.name ?? c.teamId} · {formatDate(c.date)}
                    </div>
                  </div>
                  <Badge
                    variant={
                      c.status === 'approved' ? 'success'
                        : c.status === 'pending' ? 'warning'
                        : 'danger'
                    }
                  >
                    {c.status === 'approved' ? 'معتمد' : c.status === 'pending' ? 'معلّق' : 'مرفوض'}
                  </Badge>
                </div>

                {c.description ? <p className="contribution-card__desc">{c.description}</p> : null}

                <div className="contribution-card__foot">
                  <div className="contribution-card__numbers">
                    <span>{c.hours} <span className="muted">ساعة</span></span>
                    <span className="points">{hoursToPoints(c.hours)} نقطة</span>
                  </div>
                  <div className="contribution-card__actions">
                    {c.status === 'pending' ? (
                      <>
                        <button type="button" className="btn btn--success btn--sm" onClick={() => approve(c)}>اعتماد</button>
                        <button type="button" className="btn btn--outline-danger btn--sm" onClick={() => reject(c)}>رفض</button>
                      </>
                    ) : null}
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setToDelete(c)}>حذف</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="حذف المشاركة"
        message={'سيتم حذف "' + (toDelete?.title || '') + '". متابعة؟'}
        confirmLabel="حذف"
        danger
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
