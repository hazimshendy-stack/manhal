import { useCollection } from '@/lib/useRealtimeCollection';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { formatDateTime } from '@/lib/format';
   import type { AuditRecord } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { audit } from '@/data/audit';

   export function AuditPage() {
     const { data, loading } = useCollection<AuditRecord>('audit');
     const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 50);
     return (
       <div className="container">
         <PageHeader eyebrow="Log" title="Audit Log" description="All admin actions." />
         <section className="section">
           {loading ? <SkeletonList count={6} /> : sorted.length === 0 ? <EmptyState title="No events" message="No actions recorded yet." /> : (
             <div className="table-wrap"><table className="data">
               <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Description</th></tr></thead>
               <tbody>{sorted.map((a) => <tr key={a.id}><td className="muted small nowrap">{formatDateTime(a.date)}</td><td style={{ fontWeight: 700 }}>{a.actorName}</td><td><span className="badge badge--neutral">{a.action}</span></td><td>{a.description}</td></tr>)}</tbody>
             </table></div>
           )}
         </section>
       </div>
     );
   }
   