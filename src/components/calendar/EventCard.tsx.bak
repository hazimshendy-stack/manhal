import type { CalendarEvent } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { EventCard } from '@/components/calendar/EventCard';
import { formatDate } from '@/lib/format';
import { teams } from '@/data/teams';

   interface EventCardProps { event: CalendarEvent; }
   export function EventCard({ event }: EventCardProps) {
     const team = event.teamId ? teams.find((t) => t.id === event.teamId) : null;
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
         </div>
         {event.description ? <p className="mt-2 small soft">{event.description}</p> : null}
         <div className="row mt-3" style={{ gap: 6 }}>
           {event.isPublic ? <Badge variant="info">Public</Badge> : null}
           {team ? <Badge>{team.name}</Badge> : null}
           {event.location ? <span className="small muted">{event.location}</span> : null}
         </div>
       </div>
     );
   }
   