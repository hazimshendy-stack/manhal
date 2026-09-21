import type { CalendarEvent } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';

   const TYPE_LABEL: Record<string, string> = {
     meeting: 'اجتماع',
     event: 'فعالية',
     deadline: 'موعد نهائي',
     workshop: 'ورشة',
   };

   const TYPE_VARIANT: Record<string, 'info' | 'warning' | 'danger' | 'success'> = {
     meeting: 'info',
     event: 'success',
     deadline: 'danger',
     workshop: 'warning',
   };

   interface EventCardProps {
     event: CalendarEvent;
     compact?: boolean;
   }

   export function EventCard({ event, compact = false }: EventCardProps) {
     const team = event.teamId ? teams.find((t) => t.id === event.teamId) : null;

     if (compact) {
       return (
         <div className="calendar-event-item">
           <div className="calendar-event-item__time">
             {event.time || 'طوال اليوم'}
           </div>
           <div className="calendar-event-item__body">
             <div className="calendar-event-item__title">{event.title}</div>
             <div className="calendar-event-item__meta">
               {event.isPublic ? 'عام · ' : ''}
               {team ? team.name + ' · ' : ''}
               {event.location || 'بدون موقع'}
             </div>
           </div>
         </div>
       );
     }

     return (
       <div className="card no-click">
         <div className="row row--between">
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{event.title}</div>
             <div className="card__meta">
               {formatDate(event.date)}
               {event.time ? ' · ' + event.time : ''}
               {event.endTime ? ' — ' + event.endTime : ''}
             </div>
           </div>
           <Badge variant={TYPE_VARIANT[event.type] || 'info'}>
             {TYPE_LABEL[event.type] || event.type}
           </Badge>
         </div>

         {event.description ? (
           <p className="mt-2 small soft">{event.description}</p>
         ) : null}

         <div className="row mt-3" style={{ gap: 6 }}>
           {event.isPublic ? <Badge variant="info">عام</Badge> : null}
           {team ? <Badge>{team.name}</Badge> : null}
           {event.location ? (
             <span className="small muted">📍 {event.location}</span>
           ) : null}
         </div>
       </div>
     );
   }
   