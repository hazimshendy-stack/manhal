import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { approveStep, rejectStep, adminApproveAll } from '@/lib/approvals';
import { listWhere } from '@/lib/db';
import { canApproveStep, isAdmin } from '@/lib/permissions';
import { teams } from '@/data/teams';
import {
  REQUEST_TYPE_LABEL,
  REQUEST_STATUS_LABEL,
  PRIORITY_LABEL,
  formatDate,
} from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, TextArea } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { cx } from '@/lib/format';
import type { RequestRecord, ApprovalStep, RequestStatus } from '@/types';

const STATUSES: Array<RequestStatus | 'all'> = ['all', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'];

const STATUS_TAB: Record<string, string> = {
  all: 'الكل',
  PENDING: 'قيد الانتظار',
  IN_REVIEW: 'قيد المراجعة',
  APPROVED: 'معتمد',
  REJECTED: 'مرفوض',
};

export function AdminRequestsPage() {
  const { user } = useAuth();
  const { data: requests, loading } = useCollection<RequestRecord>('requests');
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [actionReq, setActionReq] = useState<RequestRecord | null>(null);
  const [actionStep, setActionStep] = useState<ApprovalStep | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'approveAll' | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [toApproveAll, setToApproveAll] = useState<RequestRecord | null>(null);

  const filtered = useMemo(() => {
    return requests
      .filter((r) => status === 'all' || r.status === status)
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  }, [requests, status]);

  const openAction = async (req: RequestRecord, type: 'approve' | 'reject') => {
    if (!user) return;
    const steps = await listWhere<ApprovalStep>('approvals', 'requestId', req.id);
    const step = steps.find((s) => s.status === 'PENDING' && s.order === req.currentStepOrder);
    if (!step) { toast.error('لا توجد مرحلة معلّقة'); return; }
    if (!canApproveStep(user, step)) { toast.error('لا تملك صلاحية هذه المرحلة'); return; }
    setActionReq(req);
    setActionStep(step);
    setActionType(type);
    setComment('');
  };

  const doAction = async () => {
    if (!user || !actionReq || !actionStep || !actionType) return;
    if (actionType === 'approveAll') return;
    setBusy(true);
    try {
      if (actionType === 'approve') {
        await approveStep(actionReq, actionStep, user);
        toast.success('تمت الموافقة');
      } else {
        if (!comment.trim()) { toast.error('سبب الرفض مطلوب'); setBusy(false); return; }
        await rejectStep(actionReq, actionStep, user, comment);
        toast.success('تم رفض الطلب');
      }
      setActionReq(null); setActionStep(null); setActionType(null); setComment('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الإجراء';
      toast.error('فشل الإجراء', msg);
    } finally { setBusy(false); }
  };

  const doApproveAll = async () => {
    if (!user || !toApproveAll) return;
    setBusy(true);
    try {
      await adminApproveAll(toApproveAll, user);
      toast.success('تمت الموافقة الشاملة');
      setToApproveAll(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل';
      toast.error('فشل', msg);
    } finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="إدارة"
        title="الطلبات"
        description="كل الطلبات مع إجراءات فورية."
      />

      <div className="chips mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={cx('chip', status === s && 'is-active')}
            onClick={() => setStatus(s)}
          >
            {STATUS_TAB[s]}
          </button>
        ))}
      </div>

      <SectionHeader eyebrow="القائمة" title={'الطلبات (' + filtered.length + ')'} />

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title="لا طلبات" message="لا توجد طلبات مطابقة." />
      ) : (
        <div className="stack">
          {filtered.map((r) => {
            const fromTeam = r.fromTeamId ? teams.find((t) => t.id === r.fromTeamId) : null;
            const toTeam = r.toTeamId ? teams.find((t) => t.id === r.toTeamId) : null;
            const canBulk = user && isAdmin(user) && (r.status === 'PENDING' || r.status === 'IN_REVIEW');

            return (
              <div key={r.id} className="admin-request-card">
                <div className="admin-request-card__head">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="admin-request-card__title">{r.title}</div>
                    <div className="admin-request-card__meta">
                      {r.requesterName} · {formatDate(r.submittedAt)}
                      {fromTeam ? ' · من ' + fromTeam.name : ''}
                      {toTeam ? ' · إلى ' + toTeam.name : ''}
                    </div>
                  </div>
                  <div className="admin-request-card__badges">
                    <Badge variant="neutral">{REQUEST_TYPE_LABEL[r.type]}</Badge>
                    <Badge
                      variant={
                        r.status === 'APPROVED' ? 'success'
                          : r.status === 'REJECTED' ? 'danger'
                          : r.status === 'IN_REVIEW' ? 'warning'
                          : 'info'
                      }
                    >
                      {REQUEST_STATUS_LABEL[r.status]}
                    </Badge>
                    <Badge variant="neutral">{PRIORITY_LABEL[r.priority]}</Badge>
                  </div>
                </div>

                <div className="admin-request-card__actions">
                  <Link to={'/requests/' + r.id} className="btn btn--ghost btn--sm">
                    تفاصيل
                  </Link>
                  {canBulk ? (
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => setToApproveAll(r)}
                    >
                      موافقة شاملة
                    </button>
                  ) : null}
                  {r.status === 'PENDING' || r.status === 'IN_REVIEW' ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--success btn--sm"
                        onClick={() => openAction(r, 'approve')}
                      >
                        موافقة المرحلة
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => openAction(r, 'reject')}
                      >
                        رفض
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal — موافقة/رفض مرحلة */}
      <Modal
        open={actionType !== null && actionType !== 'approveAll'}
        title={actionType === 'approve' ? 'موافقة على المرحلة' : 'رفض الطلب'}
        onClose={() => { setActionType(null); setActionReq(null); setActionStep(null); }}
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => { setActionType(null); setActionReq(null); setActionStep(null); }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className={'btn ' + (actionType === 'approve' ? 'btn--success' : 'btn--danger')}
              onClick={doAction}
              disabled={busy}
            >
              {busy ? '...' : actionType === 'approve' ? 'تأكيد' : 'تأكيد الرفض'}
            </button>
          </>
        }
      >
        <FormField
          label={actionType === 'approve' ? 'تعليق (اختياري)' : 'سبب الرفض'}
          required={actionType === 'reject'}
        >
          <TextArea
            value={comment}
            onChange={setComment}
            placeholder={actionType === 'approve' ? 'ملاحظات...' : 'اشرح السبب'}
            rows={3}
          />
        </FormField>
      </Modal>

      {/* Confirm — موافقة شاملة */}
      <ConfirmDialog
        open={toApproveAll !== null}
        title="موافقة شاملة"
        message={
          'سيتم اعتماد كل المراحل المعلّقة على "' +
          (toApproveAll?.title || '') +
          '" مرة واحدة. متابعة؟'
        }
        confirmLabel="موافقة شاملة"
        busy={busy}
        onConfirm={doApproveAll}
        onCancel={() => setToApproveAll(null)}
      />
    </div>
  );
}
