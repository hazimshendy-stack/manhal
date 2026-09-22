import { useMemo, useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { seesAllTeams } from '@/lib/permissions';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { RequestCard } from '@/components/request/RequestCard';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { cx } from '@/lib/format';
   import type { RequestType, RequestStatus, RequestRecord } from '@/types';

   const TYPES: Array<RequestType | 'all'> = ['all', 'TRANSFER', 'PROMOTION', 'RESIGNATION', 'COMPLAINT', 'SUGGESTION', 'LEAVE'];
   const STATUSES: Array<RequestStatus | 'all'> = ['all', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
   const TYPE_LABEL: Record<string, string> = { all: 'All', TRANSFER: 'Transfer', PROMOTION: 'Promotion', RESIGNATION: 'Resignation', COMPLAINT: 'Complaint', SUGGESTION: 'Suggestion', LEAVE: 'Leave' };
   const STATUS_LABEL: Record<string, string> = { all: 'All', PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected' };

   export function RequestsPage() {
     const { user } = useAuth();
     const [type, setType] = useState<RequestType | 'all'>('all');
     const [status, setStatus] = useState<RequestStatus | 'all'>('all');
     const { data: all, loading } = useCollection<RequestRecord>('requests');
     const filtered = useMemo(() => {
       let list = all;
       if (user && !seesAllTeams(user)) list = list.filter((r) => r.fromTeamId === user.teamId || r.toTeamId === user.teamId || r.requesterUid === user.uid);
       return list.filter((r) => type === 'all' || r.type === type).filter((r) => status === 'all' || r.status === status).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
     }, [all, type, status, user]);
     return (
       <div className="container">
         <PageHeader eyebrow="Workflow" title="Requests" description={user && !seesAllTeams(user) ? 'Your team requests.' : 'All requests.'} />
         <div className="chips mb-3">{TYPES.map((t) => <button key={t} type="button" className={cx('chip', type === t && 'is-active')} onClick={() => setType(t)}>{TYPE_LABEL[t]}</button>)}</div>
         <div className="chips mb-4">{STATUSES.map((s) => <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>)}</div>
         <section className="section">
           <SectionHeader eyebrow="List" title={'Requests (' + filtered.length + ')'} />
           {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? <EmptyState title="No requests" message="No matching requests." /> : (
             <div className="stack">{filtered.map((r) => <RequestCard key={r.id} request={r} />)}</div>
           )}
         </section>
       </div>
     );
   }
   