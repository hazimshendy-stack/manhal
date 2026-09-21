import type { Achievement } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { teams } from '@/data/teams';
import { formatDate } from '@/lib/format';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div className="achievement-card">
      <div className="achievement-card__head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="achievement-card__title">{achievement.title}</div>
          <div className="achievement-card__date">{formatDate(achievement.date)}</div>
        </div>
      </div>

      <p className="achievement-card__desc">{achievement.description}</p>

      {achievement.teamIds.length > 0 || achievement.memberNames.length > 0 ? (
        <div className="achievement-card__tags">
          {achievement.teamIds.map((id) => {
            const t = teams.find((x) => x.id === id);
            return t ? <Badge key={id} variant="navy">{t.name}</Badge> : null;
          })}
          {achievement.memberNames.map((n, i) => (
            <Badge key={'m-' + i} variant="info">{n}</Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
