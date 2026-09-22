import { Link } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { RequestCard } from '@/components/request/RequestCard';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import type { RequestRecord } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { SkeletonList } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { RequestCard } from '@/components/request/RequestCard';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { requests } from '@/data/requests';

   export function MyRequestsPage() {
     const { user } = useAuth();
     const { data: requests, loading } = useRealtimeCollection<RequestRecord>('requests');
     if (!user) return null;
     const mine = requests.filter((r) => r.requesterUid === user.uid).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
     return (
       <div className="container">
         <PageHeader eyebrow="My Requests" title="My Requests" description="Track your requests.">
           <Link className="btn btn--primary mt-4" to="/requests/new">+ New Request</Link>
         </PageHeader>
         <section className="section">
           <SectionHeader eyebrow="History" title={'My Requests (' + mine.length + ')'} />
           {loading ? <SkeletonList count={4} /> : mine.length === 0 ? (
             <EmptyState title="No requests yet" message="No requests submitted." action={<Link className="btn btn--primary" to="/requests/new">+ Submit First Request</Link>} />
           ) : (
             <div className="stack">{mine.map((r) => <RequestCard key={r.id} request={r} />)}</div>
           )}
         </section>
       </div>
     );
   }
   