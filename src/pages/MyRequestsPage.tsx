
   
   
   
   
   
   
   
   import type { RequestRecord } from '@/types';

   export function MyRequestsPage() {
     const { user } = useAuth();
     const { data: requests, loading } = useRealtimeCollection<RequestRecord>('requests');

     if (!user) return null;

     const mine = requests
       .filter((r) => r.requesterUid === user.uid)
       .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

     return (
       <div className="container">
         <PageHeader
           eyebrow="طلباتي"
           title="طلباتي"
           description="تابع كل طلباتك وحالتها اللحظية."
         >
           <Link className="btn btn--primary mt-4" to="/requests/new">
             + طلب جديد
           </Link>
         </PageHeader>

         <section className="section">
           <SectionHeader eyebrow="السجل" title={'كل طلباتي (' + mine.length + ')'} />
           {loading ? (
             <SkeletonList count={4} />
           ) : mine.length === 0 ? (
             <EmptyState
               icon="📋"
               title="لا طلبات بعد"
               message="لم تقم بتقديم أي طلبات حتى الآن."
               action={
                 <Link className="btn btn--primary" to="/requests/new">
                   + قدّم طلبك الأول
                 </Link>
               }
             />
           ) : (
             <div className="stack">
               {mine.map((r) => (
                 <RequestCard key={r.id} request={r} />
               ))}
             </div>
           )}
         </section>
       </div>
     );
   }
   