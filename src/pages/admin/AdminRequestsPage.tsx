import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { adminApproveAll, rejectStep } from '@/lib/approvals';
import { listWhere } from '@/lib/db';
import { teams } from '@/data/teams';
import { REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL, PRIORITY_LABEL, formatDate, cx } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, TextArea } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import type { RequestRecord, ApprovalStep, RequestStatus } from '@/types';

const STATUSES: Array<RequestStatus | 'all'> = ['all', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
const STATUS_TAB: Record<string, string> = { all: 'All', PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected' };

export function AdminRequestsPage() {
  const { user } = useAuth();
  const { data: requests, loading } = useCollection<RequestRecord>('requests');
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [rejecting, setRejecting] = useState<RequestRecord | null>(null);
  const [rejectStepData, setRejectStepData] = useState<ApprovalStep | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [toApproveAll, setToApproveAll] = useState<RequestRecord | null>(null);
  const filtered = useMemo(() => requests.filter((r) => status === 'all' || r.status === status).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)), [requests, status]);
  const openReject = async (req: RequestRecord) => {
    if (!user) return;
    const steps = await listWhere<ApprovalStep>('approvals', 'requestId', req.id);
    const step = steps.find((s) => s.status === 'PENDING' && s.order === req.currentStepOrder);
    if (!step) { toast.error('No pending step'); return; }
    setRejecting(req);
    setRejectStepData(step);
    setComment('');
  };
  const doReject = async () => {
    if (!user || !rejecting || !rejectStepData) return;
    if (!comment.trim()) { toast.error('Rejection reason is required'); return; }
    setBusy(true);
    try {
      await rejectStep(rejecting, rejectStepData, user, comment);
      toast.success('Request rejected');
      setRejecting(null);
      setRejectStepData(null);
      setComment('');
    } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
    finally { setBusy(false); }
  };
  const doApproveAll = async () => {
    if (!user || !toApproveAll) return;
    setBusy(true);
    try {
      await adminApproveAll(toApproveAll, user);
      toast.success('Final approval — all stages skipped');
      setToApproveAll(null);
    } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
    finally { setBusy(false); }
  };
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Requests" description="Your approval as admin = final. Skips all stages with one click." />
      <div className="chips mb-4">
        {STATUSES.map((s) => (
          <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_TAB[s]}</button>
        ))}
      </div>
      <SectionHeader eyebrow="List" title={'Requests (' + filtered.length + ')'} />
      {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? <EmptyState title="No requests" message="No matching requests." /> : (
        <div className="stack">
          {filtered.map((r) => {
            const fromTeam = r.fromTeamId ? teams.find((t) => t.id === r.fromTeamId) : null;
            const toTeam = r.toTeamId ? teams.find((t) => t.id === r.toTeamId) : null;
            const isActive = r.status === 'PENDING' || r.status === 'IN_REVIEW';
            return (
              <div key={r.id} className="admin-request-card">
                <div className="admin-request-card__head">
                  <div className="admin-request-card__info">
                    <div className="admin-request-card__title">{r.title}</div>
                    <div className="admin-request-card__meta">
                      {r.requesterName} · {formatDate(r.submittedAt)}
                      {fromTeam ? ' · from ' + fromTeam.name : ''}
                      {toTeam ? ' · to ' + toTeam.name : ''}
                    </div>
                  </div>
                  <div className="admin-request-card__badges">
                    <Badge variant="neutral">{REQUEST_TYPE_LABEL[r.type]}</Badge>
                    <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : r.status === 'IN_REVIEW' ? 'warning' : 'info'}>{REQUEST_STATUS_LABEL[r.status]}</Badge>
                    <Badge variant="neutral">{PRIORITY_LABEL[r.priority]}</Badge>
                  </div>
                </div>
                <div className="admin-request-card__actions">
                  <Link to={'/requests/' + r.id} className="btn btn--ghost btn--sm">Details</Link>
                  {isActive ? (
                    <>
                      <button type="button" className="btn btn--success btn--sm" onClick={() => setToApproveAll(r)}>✓ Final Approve</button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => openReject(r)}>✕ Reject</button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={rejecting !== null} title="Reject Request" onClose={() => { setRejecting(null); setRejectStepData(null); }}
        footer={<><button type="button" className="btn btn--ghost" onClick={() => { setRejecting(null); setRejectStepData(null); }}>Cancel</button><button type="button" className="btn btn--danger" onClick={doReject} disabled={busy}>{busy ? '...' : 'Confirm Reject'}</button></>}>
        <FormField label="Rejection reason" required><TextArea value={comment} onChange={setComment} rows={3} placeholder="Explain the reason..." /></FormField>
      </Modal>
      <ConfirmDialog open={toApproveAll !== null} title="Final Approval" message={'The request "' + (toApproveAll?.title || '') + '" will be finally approved and all stages skipped. Continue?'} confirmLabel="Final Approve" busy={busy} onConfirm={doApproveAll} onCancel={() => setToApproveAll(null)} />
    </div>
  );
}