import { useCollection } from '@/lib/useRealtimeCollection';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Badge } from '@/components/ui/Badge';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { formatDate } from '@/lib/format';
   import type { GovernanceDocument } from '@/types';
import { Loading } from '@/components/ui/Loading';

   export function GovernancePage() {
     const { data, loading } = useCollection<GovernanceDocument>('governance');
     const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title));
     return (
       <div className="container">
         <PageHeader eyebrow="Governance" title="Official Documents" description="Policies and bylaws." />
         {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? <EmptyState title="No documents" message="No documents yet." /> : (
           <section className="section">
             <SectionHeader eyebrow="Documents" title="All Documents" />
             <div className="stack">{sorted.map((d) => (
               <div key={d.id} className="card no-click">
                 <div className="row row--between"><div className="card__title">{d.title}</div><Badge variant="neutral">v{d.version}</Badge></div>
                 {d.description ? <div className="card__meta">{d.description}</div> : null}
                 <div className="small muted mt-3">Last updated {formatDate(d.updatedAt)}</div>
                 <p className="mt-3 small soft" style={{ lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{d.content}</p>
               </div>
             ))}</div>
           </section>
         )}
       </div>
     );
   }
   