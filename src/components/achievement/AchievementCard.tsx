import type { Achievement } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';

   const LEVEL_LABEL: Record<string, string> = {
     branch: 'على مستوى الفرع',
     national: 'على المستوى الوطني',
     international: 'على المستوى الدولي',
   };

   const LEVEL_VARIANT: Record<string, 'info' | 'warning' | 'red'> = {
     branch: 'info',
     national: 'warning',
     international: 'red',
   };

   interface AchievementCardProps {
     achievement: Achievement;
   }

   export function AchievementCard({ achievement }: AchievementCardProps) {
     return (
       <div className="card no-click">
         <div className="row row--between">
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{achievement.title}</div>
             <div className="card__meta">{formatDate(achievement.date)}</div>
           </div>
           <Badge variant={LEVEL_VARIANT[achievement.level] || 'info'}>
             {LEVEL_LABEL[achievement.level] || achievement.level}
           </Badge>
         </div>

         <p className="mt-3 small soft">{achievement.description}</p>

         <div className="row mt-3" style={{ gap: 6 }}>
           {achievement.teamIds.map((id) => {
             const t = teams.find((x) => x.id === id);
             return t ? <Badge key={id}>{t.name}</Badge> : null;
           })}
         </div>

         {achievement.memberNames.length > 0 ? (
           <div
             className="small muted"
             style={{ marginTop: 10 }}
           >
             الأعضاء: {achievement.memberNames.join(' · ')}
           </div>
         ) : null}
       </div>
     );
   }
   