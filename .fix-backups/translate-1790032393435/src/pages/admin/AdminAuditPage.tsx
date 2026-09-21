import { useCollection } from '@/lib/useRealtimeCollection';
   import type { AuditRecord } from '@/types';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { formatDateTime } from '@/lib/format';

   export function AdminAuditPage() {
     const { data, loading } = useCollection<AuditRecord>('audit');
     const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="سجل التغييرات"
           description="كل الإجراءات الإدارية موثّقة هنا."
         />

         <SectionHeader eyebrow="السجل" title={'الأحداث (' + data.length + ')'} />

         {loading ? (
           <SkeletonList count={8} />
         ) : sorted.length === 0 ? (
           <EmptyState
             icon="📜"
             title="لا أحداث"
             message="لم يتم تسجيل أي إجراءات بعد."
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
       </div>
     );
   }
   