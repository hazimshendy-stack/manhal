import type { TimelineEvent } from '@/types';
   import { formatDate } from '@/lib/format';

   interface TimelineListProps {
     events: TimelineEvent[];
   }

   export function TimelineList({ events }: TimelineListProps) {
     if (events.length === 0) {
       return (
         <div className="empty" style={{ padding: 24 }}>
           <div className="empty__message">لا أحداث بعد</div>
         </div>
       );
     }

     const sorted = [...events].sort((a, b) => (a.date < b.date ? 1 : -1));

     return (
       <div className="timeline">
         {sorted.map((e) => (
           <div key={e.id} className="timeline__item">
             <div className="timeline__date">{formatDate(e.date)}</div>
             <div className="timeline__title">{e.title}</div>
             {e.description ? (
               <div className="timeline__desc">{e.description}</div>
             ) : null}
           </div>
         ))}
       </div>
     );
   }
   