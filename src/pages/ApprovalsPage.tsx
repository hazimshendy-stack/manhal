// [auto-fix] v7.1 — Approvals page also surfaces CONTRIBUTIONS awaiting
// the current user (Stage 1: committee HR; Stage 2: team HR).
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { canApproveStep, ROLE_LABEL } from '@/lib/permissions';
import {
  approveContributionStage,
  rejectContributionStage,
} from '@/lib/contributionApprovals';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, TextArea, NumberInput } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { ApprovalStep, RequestRecord, Contribution, AppUser } from '@/types';

function getStageOf(c: Contribution): 1 | 2 | 3 | 4 {
  const s = c.currentStage;
  if (s === 1 || s === 2) return s;
  if (s === 3 || s === 4) return 4;
  if (c.status === 'approved' || c.status === 'rejected') return 4;
  return 1;
}

function userCanReviewContribution(user: AppUser | null, c: Contribution): boolean {
  if (!user) return false;
  if (c.status !== 'pending' && c.status !== 'in_review') return false;

  const pendingId = c.pendingApproverId;
  if (pendingId && pendingId !== user.uid) return false;

  const stage = getStageOf(c);
  const teamId = c.teamId;
  const committeeId = c.committeeId || '';

  if (!teamId) return false;

  if (stage === 1) {
    return (
      user.role === 'COMMITTEE_HR' &&
      user.teamId === teamId &&
      Array.isArray(user.committeeIds) &&
      user.committeeIds.includes(committeeId)
    );
  }
  if (stage === 2) {
    return user.role === 'HR' && user.teamId === teamId;
  }
  return false;
}

export function ApprovalsPage() {
  const { user } = useAuth();
  const { data: approvals, loading: loadingA } = useCollection<ApprovalStep>('approvals');
  const { data: requests } = useCollection<RequestRecord>('requests');
  const { data: contributions, loading: loadingC } = useCollection<Contribution>('contributions');

  const [actionContrib, setActionContrib] = useState<Contribution | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [pointsInput, setPointsInput] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const myPendingRequests = approvals.filter(
    (a) => a.status === 'PENDING' && canApproveStep(user, a),
  );

  const myPendingContribs = contributions.filter((c) => userCanReviewContribution(user, c));

  const openAction = (c: Contribution, type: 'approve' | 'reject') => {
    setActionContrib(c);
    setActionType(type);
    setComment('');
    setPointsInput(c.points || 0);
  };

  const closeAction = () => {
    setActionContrib(null);
    setActionType(null);
    setComment('');
    setPointsInput(0);
  };

  const doApprove = async () => {
    if (!user || !actionContrib) return;
    const stage = getStageOf(actionContrib);
    setBusy(true);
    try {
      await approveContributionStage(
        actionContrib,
        user,
        stage === 1 ? pointsInput : undefined,
        comment,
      );
      toast.success('Approved');
      closeAction();
    } catch (e) {
      toast.error('Failed', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    if (!user || !actionContrib) return;
    if (!comment.trim()) {
      toast.error('Reason required');
      return;
    }
    setBusy(true);
    try {
      await rejectContributionStage(actionContrib, user, comment);
      toast.success('Rejected');
      closeAction();
    } catch (e) {
      toast.error('Failed', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  const stageOf = actionContrib ? getStageOf(actionContrib) : 1;

  return (
    <div className="container">
      <PageHeader
        eyebrow="Workflow"
        title="Approvals"
        description="Items awaiting your decision."
      />

      <section className="section">
        <SectionHeader
          eyebrow="Contributions"
          title={'Contributions Awaiting You (' + myPendingContribs.length + ')'}
        />
        {loadingC ? (
          <SkeletonList count={3} />
        ) : myPendingContribs.length === 0 ? (
          <EmptyState
            icon="✅"
            title="All clear"
            message="No contributions waiting for you."
          />
        ) : (
          <div className="stack">
            {myPendingContribs.map((c) => {
              const team = teams.find((t) => t.id === c.teamId);
              const committee = c.committeeId
                ? committees.find((x) => x.id === c.committeeId)
                : null;
              const stage = getStageOf(c);
              const stageLabel =
                stage === 1 ? 'HR of Committee' : stage === 2 ? 'HR of Team' : '—';
              return (
                <div key={c.id} className="card no-click">
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">{c.title}</div>
                      <div className="card__meta">
                        {c.memberName || c.memberId} · {team?.name || c.teamId} ·{' '}
                        {committee?.nameAr || c.committeeId} · {formatDate(c.date)}
                      </div>
                    </div>
                    <Badge variant="warning">
                      Stage {stage} — {stageLabel}
                    </Badge>
                  </div>

                  {c.description ? (
                    <p className="small soft mt-2">{c.description}</p>
                  ) : null}

                  <div
                    className="row mt-3"
                    style={{ gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}
                  >
                    <div className="row" style={{ gap: 12 }}>
                      <span className="small muted">
                        {c.hours} <span className="muted">hours</span>
                      </span>
                      {stage === 2 ? (
                        <span className="points">
                          {c.points || 0} <span className="muted">points assigned</span>
                        </span>
                      ) : (
                        <span className="muted small">Points pending (assign at stage 1)</span>
                      )}
                    </div>
                    <div className="row" style={{ gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn--success btn--sm"
                        onClick={() => openAction(c, 'approve')}
                      >
                        {stage === 1 ? 'Approve & Assign Points' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline-danger btn--sm"
                        onClick={() => openAction(c, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="section">
        <SectionHeader
          eyebrow="Requests"
          title={'Requests Awaiting You (' + myPendingRequests.length + ')'}
        />
        {loadingA ? (
          <SkeletonList count={3} />
        ) : myPendingRequests.length === 0 ? (
          <EmptyState
            icon="✅"
            title="All clear"
            message="No requests waiting for you."
          />
        ) : (
          <div className="stack">
            {myPendingRequests.map((a) => {
              const req = requests.find((r) => r.id === a.requestId);
              return (
                <Link key={a.id} to={'/requests/' + a.requestId} className="card">
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">{req?.title ?? a.requestId}</div>
                      <div className="card__meta">
                        {ROLE_LABEL[a.requiredRole]} · Stage {a.order}
                      </div>
                    </div>
                    <Badge variant="warning" dot>
                      Awaiting
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Modal
        open={actionType === 'approve' && actionContrib !== null}
        title={stageOf === 1 ? 'Approve & Assign Points' : 'Approve Contribution'}
        onClose={closeAction}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={closeAction}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--success"
              onClick={doApprove}
              disabled={busy}
            >
              {busy ? '...' : 'Approve'}
            </button>
          </>
        }
      >
        {stageOf === 1 ? (
          <>
            <p className="small muted mb-3">
              Assign points fairly — quality matters, not only hours.
            </p>
            <FormField label="Points" required>
              <NumberInput
                value={pointsInput}
                onChange={setPointsInput}
                min={0}
                max={1000}
              />
            </FormField>
          </>
        ) : (
          <p className="small muted mb-3">Confirm your approval.</p>
        )}
        <FormField label="Comment (optional)">
          <TextArea value={comment} onChange={setComment} rows={2} />
        </FormField>
      </Modal>

      <Modal
        open={actionType === 'reject' && actionContrib !== null}
        title="Reject Contribution"
        onClose={closeAction}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={closeAction}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={doReject}
              disabled={busy}
            >
              {busy ? '...' : 'Confirm Reject'}
            </button>
          </>
        }
      >
        <FormField label="Reason" required>
          <TextArea value={comment} onChange={setComment} rows={3} />
        </FormField>
      </Modal>
    </div>
  );
}
