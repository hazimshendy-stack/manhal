import { useMemo, useState } from 'react';
   import { Link } from 'react-router-dom';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { teams } from '@/data/teams';
   import { REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL, PRIORITY_LABEL, formatDate, cx } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import type { RequestRecord, RequestStatus } from '@/types';

   const STATUSES: Array<RequestStatus | 'all'> = ['all', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
   const STATUS_TAB: Record<string, string> = { all: 'All', PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected' };

   export function AdminRequestsPage() {
     const { user } = useAuth();
     const { data: requests, loading } = useCollection<RequestRecord>('requests');
     const [status, setStatus] = useState<RequestStatus | 'all'>('all');
     const filtered = useMemo(() => requests.filter((r) => status === 'all' || r.status === status).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)), [requests, status]);
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Requests" description="Manage all requests." />
         <div className="chips mb-4">{STATUSES.map((s) => <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_TAB[s]}</button>)}</div>
         <SectionHeader eyebrow="List" title={'Requests (' + filtered.length + ')'} />
         {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? <EmptyState title="No requests" message="No matching." /> : (
           <div className="stack">{filtered.map((r) => {
             const fromTeam = r.fromTeamId ? teams.find((t) => t.id === r.fromTeamId) : null;
             const toTeam = r.toTeamId ? teams.find((t) => t.id === r.toTeamId) : null;
             return (
               <div key={r.id} className="admin-request-card">
                 <div className="admin-request-card__head">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{r.title}</div>
                     <div className="card__meta">{r.requesterName} · {formatDate(r.submittedAt)}{fromTeam ? ' · from ' + fromTeam.name : ''}{toTeam ? ' · to ' + toTeam.name : ''}</div>
                   </div>
                   <div className="row" style={{ gap: 6 }}>
                     <Badge variant="neutral">{REQUEST_TYPE_LABEL[r.type]}</Badge>
                     <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : r.status === 'IN_REVIEW' ? 'warning' : 'info'}>{REQUEST_STATUS_LABEL[r.status]}</Badge>
                     <Badge variant="neutral">{PRIORITY_LABEL[r.priority]}</Badge>
                   </div>
                 </div>
                 <div className="admin-request-card__actions">
                   <Link to={'/requests/' + r.id} className="btn btn--ghost btn--sm">Details</Link>
                 </div>
               </div>
             );
           })}</div>
         )}
       </div>
     );
   }
   