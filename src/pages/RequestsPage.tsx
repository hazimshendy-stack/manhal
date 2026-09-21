import { useMemo, useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { seesAllTeams } from '@/lib/permissions';
   import type { RequestType, RequestStatus, RequestRecord } from '@/types';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { RequestCard } from '@/components/request/RequestCard';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { cx } from '@/lib/format';

   const TYPES: Array<RequestType | 'all'> = [
     'all',
     'TRANSFER',
     'PROMOTION',
     'RESIGNATION',
     'COMPLAINT',
     'SUGGESTION',
     'LEAVE',
   ];
   const STATUSES: Array<RequestStatus | 'all'> = [
     'all',
     'PENDING',
     'IN_REVIEW',
     'APPROVED',
     'REJECTED',
   ];

   const TYPE_LABEL: Record<string, string> = {
     all: 'الكل',
     TRANSFER: 'نقل',
     PROMOTION: 'ترقية',
     RESIGNATION: 'استقالة',
     COMPLAINT: 'شكوى',
     SUGGESTION: 'اقتراح',
     LEAVE: 'إجازة',
   };

   const STATUS_LABEL: Record<string, string> = {
     all: 'كل الحالات',
     PENDING: 'قيد الانتظار',
     IN_REVIEW: 'قيد المراجعة',
     APPROVED: 'معتمد',
     REJECTED: 'مرفوض',
   };

   export function RequestsPage() {
     const { user } = useAuth();
     const [type, setType] = useState<RequestType | 'all'>('all');
     const [status, setStatus] = useState<RequestStatus | 'all'>('all');
     const { data: all, loading } = useCollection<RequestRecord>('requests');

     const filtered = useMemo(() => {
       let list = all;

       if (user && !seesAllTeams(user)) {
         // للرئيس ونوابه و HR — فقط طلبات فريقه
         list = list.filter(
           (r) =>
             r.fromTeamId === user.teamId ||
             r.toTeamId === user.teamId ||
             r.requesterUid === user.uid,
         );
       }

       return list
         .filter((r) => type === 'all' || r.type === type)
         .filter((r) => status === 'all' || r.status === status)
         .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
     }, [all, type, status, user]);

     return (
       <div className="container">
         <PageHeader
           eyebrow="سير العمل"
           title="الطلبات"
           description={
             user && !seesAllTeams(user)
               ? 'طلبات فريقك فقط.'
               : 'كل الطلبات في المنظمة.'
           }
         />

         <div className="chips mb-3">
           {TYPES.map((t) => (
             <button
               key={t}
               type="button"
               className={cx('chip', type === t && 'is-active')}
               onClick={() => setType(t)}
             >
               {TYPE_LABEL[t] ?? t}
             </button>
           ))}
         </div>

         <div className="chips mb-4">
           {STATUSES.map((s) => (
             <button
               key={s}
               type="button"
               className={cx('chip', status === s && 'is-active')}
               onClick={() => setStatus(s)}
             >
               {STATUS_LABEL[s] ?? s}
             </button>
           ))}
         </div>

         <section className="section">
           <SectionHeader
             eyebrow="القائمة"
             title={'الطلبات (' + filtered.length + ')'}
           />
           {loading ? (
             <SkeletonList count={5} />
           ) : filtered.length === 0 ? (
             <EmptyState
               icon="📋"
               title="لا طلبات"
               message="لا توجد طلبات مطابقة للفلاتر المحددة."
             />
           ) : (
             <div className="stack">
               {filtered.map((r) => (
                 <RequestCard key={r.id} request={r} />
               ))}
             </div>
           )}
         </section>
       </div>
     );
   }
   