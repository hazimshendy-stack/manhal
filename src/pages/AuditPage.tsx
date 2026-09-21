import { useCollection } from '@/lib/useRealtimeCollection';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { formatDateTime } from '@/lib/format';
   import type { AuditRecord } from '@/types';

   export function AuditPage() {
     const { data, loading } = useCollection<AuditRecord>('audit');
     const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 50);

     return (
       <div className="container">
         <PageHeader
           eyebrow="السجل"
           title="سجل التغييرات"
           description="كل الإجراءات الإدارية موثّقة هنا."
         />

         <section className="section">
           {loading ? (
             <SkeletonList count={6} />
           ) : sorted.length === 0 ? (
             <EmptyState
               icon="📜"
               title="لا أحداث"
               message="لم يتم تسجيل أي إجراءات إدارية بعد."
             />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>التاريخ</th>
                     <th>المستخدم</th>
                     <th>الإجراء</th>
                     <th>الوصف</th>
                   </tr>
                 </thead>
                 <tbody>
                   {sorted.map((a) => (
                     <tr key={a.id}>
                       <td className="muted small nowrap" data-label="التاريخ">
                         {formatDateTime(a.date)}
                       </td>
                       <td data-label="المستخدم" style={{ fontWeight: 700 }}>
                         {a.actorName}
                       </td>
                       <td data-label="الإجراء">
                         <span className="badge badge--neutral">{a.action}</span>
                       </td>
                       <td data-label="الوصف">{a.description}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   