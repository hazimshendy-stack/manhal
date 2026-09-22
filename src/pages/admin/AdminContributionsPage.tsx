import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { teams } from '@/data/teams';
   import { formatDate, cx } from '@/lib/format';
   import { safeArray, safeNumber } from '@/lib/safe';
   import { approveContributionStage, rejectContributionStage } from '@/lib/contributionApprovals';
   import { getContributionStage, canReviewContribution } from '@/lib/committeePermissions';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { FormField, TextArea, NumberInput } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Contribution, ContributionStatus, Committee } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { FormField } from '@/components/ui/FormField';
import { NumberInput } from '@/components/ui/FormField';
import { TextArea } from '@/components/ui/FormField';
import { cx } from '@/lib/format';
import { formatDate } from '@/lib/format';
import { safeArray } from '@/lib/safe';
import { safeNumber } from '@/lib/safe';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { approveContributionStage } from '@/lib/contributionApprovals';
import { rejectContributionStage } from '@/lib/contributionApprovals';
import { getContributionStage } from '@/lib/committeePermissions';
import { canReviewContribution } from '@/lib/committeePermissions';
import { committees } from '@/data/committees';
import { contributions } from '@/data/contributions';

   const STATUS_LABEL: Record<string, string> = { all: 'All', pending: 'Pending', in_review: 'In Review', approved: 'Approved', rejected: 'Rejected' };

   export function AdminContributionsPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<Contribution>('contributions');
     const { data: liveCommittees } = useCollection<Committee>('committees');
     const [status, setStatus] = useState<ContributionStatus | 'all'>('all');
     const [actionContrib, setActionContrib] = useState<Contribution | null>(null);
     const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
     const [pointsInput, setPointsInput] = useState<number>(0);
     const [comment, setComment] = useState('');
     const [busy, setBusy] = useState(false);
     const filtered = safeArray(data)
       .filter((c) => status === 'all' || c.status === status)
       .filter((c) => canReviewContribution(me, c) || c.createdBy === me?.uid)
       .sort((a, b) => (a.date < b.date ? 1 : -1));
     const openAction = (c: Contribution, type: 'approve' | 'reject') => { setActionContrib(c); setActionType(type); setComment(''); setPointsInput(safeNumber(c.points)); };
     const closeAction = () => { setActionContrib(null); setActionType(null); setComment(''); setPointsInput(0); };
     const doApprove = async () => {
       if (!me || !actionContrib) return;
       const stageInfo = getContributionStage(me, actionContrib);
       setBusy(true);
       try { await approveContributionStage(actionContrib, me, stageInfo.assignPoints ? pointsInput : undefined, comment); toast.success('Approved'); closeAction(); }
       catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
       finally { setBusy(false); }
     };
     const doReject = async () => {
       if (!me || !actionContrib) return;
       if (!comment.trim()) { toast.error('Reason required'); return; }
       setBusy(true);
       try { await rejectContributionStage(actionContrib, me, comment); toast.success('Rejected'); closeAction(); }
       catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
       finally { setBusy(false); }
     };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Contributions" description="Points assigned by committee HR." />
         <div className="chips mb-4">
           {(['all', 'pending', 'in_review', 'approved', 'rejected'] as const).map((s) => (
             <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>
           ))}
         </div>
         <SectionHeader eyebrow="List" title={'Contributions (' + filtered.length + ')'} />
         {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? <EmptyState title="No contributions" message="No matching." /> : (
           <div className="stack">{filtered.map((c) => {
             const team = teams.find((t) => t.id === c.teamId);
             const committee = liveCommittees.find((x) => x.id === c.committeeId);
             const stageInfo = getContributionStage(me, c);
             const canAct = stageInfo.canApprove && (c.status === 'pending' || c.status === 'in_review');
             return (
               <div key={c.id} className="card no-click">
                 <div className="row row--between">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{c.title}</div>
                     <div className="card__meta">{c.memberName} · {team?.name} · {committee?.nameAr || c.committeeId} · {formatDate(c.date)}</div>
                   </div>
                   <Badge variant={c.status === 'approved' ? 'success' : c.status === 'pending' ? 'info' : c.status === 'in_review' ? 'warning' : 'danger'}>
                     {c.status === 'approved' ? 'Approved' : c.status === 'pending' ? 'Stage 1' : c.status === 'in_review' ? 'Stage ' + stageInfo.stage + '/3' : 'Rejected'}
                   </Badge>
                 </div>
                 <p className="small soft mt-2">{c.description}</p>
                 <div className="row mt-3" style={{ gap: 12 }}>
                   <span className="small">{safeNumber(c.hours)} hours</span>
                   {safeNumber(c.points) > 0 ? <span className="points">{safeNumber(c.points)} points</span> : <span className="muted small">Points pending</span>}
                 </div>
                 {canAct ? (
                   <div className="row mt-3" style={{ gap: 8, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--c-line)' }}>
                     <button type="button" className="btn btn--success btn--sm" onClick={() => openAction(c, 'approve')}>
                       {stageInfo.assignPoints ? 'Approve & Assign Points' : 'Approve'}
                     </button>
                     <button type="button" className="btn btn--outline-danger btn--sm" onClick={() => openAction(c, 'reject')}>Reject</button>
                   </div>
                 ) : null}
               </div>
             );
           })}</div>
         )}
         <Modal open={actionType === 'approve' && actionContrib !== null}
           title={actionContrib && getContributionStage(me, actionContrib).assignPoints ? 'Approve & Assign Points' : 'Approve Contribution'}
           onClose={closeAction}
           footer={<><button type="button" className="btn btn--ghost" onClick={closeAction}>Cancel</button><button type="button" className="btn btn--success" onClick={doApprove} disabled={busy}>{busy ? '...' : 'Approve'}</button></>}>
           {actionContrib && getContributionStage(me, actionContrib).assignPoints ? (
             <>
               <p className="small muted mb-3">Assign points fairly — quality matters, not only hours.</p>
               <FormField label="Points" required><NumberInput value={pointsInput} onChange={setPointsInput} min={0} max={1000} /></FormField>
             </>
           ) : <p className="small muted mb-3">Confirm your approval.</p>}
           <FormField label="Comment (optional)"><TextArea value={comment} onChange={setComment} rows={2} /></FormField>
         </Modal>
         <Modal open={actionType === 'reject' && actionContrib !== null} title="Reject Contribution" onClose={closeAction}
           footer={<><button type="button" className="btn btn--ghost" onClick={closeAction}>Cancel</button><button type="button" className="btn btn--danger" onClick={doReject} disabled={busy}>{busy ? '...' : 'Confirm Reject'}</button></>}>
           <FormField label="Reason" required><TextArea value={comment} onChange={setComment} rows={3} /></FormField>
         </Modal>
       </div>
     );
   }
   