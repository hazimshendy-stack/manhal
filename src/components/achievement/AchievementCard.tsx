import type { Achievement } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';

   interface AchievementCardProps { achievement: Achievement; }
   export function AchievementCard({ achievement }: AchievementCardProps) {
     return (
       <div className="card no-click">
         <div className="row row--between">
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{achievement.title}</div>
             <div className="card__meta">{formatDate(achievement.date)}</div>
           </div>
           {achievement.level ? <Badge variant="warning">{achievement.level}</Badge> : null}
         </div>
         <p className="mt-3 small soft">{achievement.description}</p>
         {achievement.teamIds && achievement.teamIds.length > 0 ? (
           <div className="row mt-3" style={{ gap: 6 }}>
             {achievement.teamIds.map((id) => { const t = teams.find((x) => x.id === id); return t ? <Badge key={id}>{t.name}</Badge> : null; })}
           </div>
         ) : null}
       </div>
     );
   }
   