import { governanceDocuments } from '@/data/governance';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Badge } from '@/components/ui/Badge';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { formatDate } from '@/lib/format';

   export function GovernancePage() {
     const grouped = governanceDocuments.reduce<Record<string, typeof governanceDocuments>>(
       (acc, doc) => {
         if (!acc[doc.category]) acc[doc.category] = [];
         acc[doc.category].push(doc);
         return acc;
       },
       {},
     );

     return (
       <div className="container">
         <PageHeader
           eyebrow="الحوكمة"
           title="الوثائق الرسمية"
           description="السياسات والإجراءات واللوائح الرسمية للمنظمة."
         />

         {Object.entries(grouped).map(([category, docs]) => (
           <section key={category} className="section">
             <SectionHeader eyebrow={category} title={category} />
             <div className="stack">
               {docs.map((d) => (
                 <div key={d.id} className="card no-click">
                   <div className="row row--between">
                     <div className="card__title">{d.title}</div>
                     <Badge variant="neutral">v{d.version}</Badge>
                   </div>
                   <div className="card__meta">{d.description}</div>
                   <div className="small muted mt-3">
                     آخر تحديث {formatDate(d.updatedAt)}
                   </div>
                   <p className="mt-3 small soft" style={{ lineHeight: 1.8 }}>
                     {d.content}
                   </p>
                 </div>
               ))}
             </div>
           </section>
         ))}
       </div>
     );
   }
   