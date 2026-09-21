import type { Committee } from '@/types';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { Badge } from '@/components/ui/Badge';
import type { Member } from '@/types';

interface CommitteeCardProps { committee: Committee; }

export function CommitteeCard({ committee }: CommitteeCardProps) {
  const { data: members } = useRealtimeCollection<Member>('members');
  const count = members.filter((m) => m.committeeIds.includes(committee.id)).length;

  return (
    <div className="card no-click">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: committee.color + '15', border: '1px solid ' + committee.color + '30', display: 'grid', placeItems: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
          {committee.icon || committee.nameAr.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card__title">{committee.nameAr}</div>
          <div className="card__meta">{committee.description}</div>
        </div>
      </div>
      <div className="row mt-4" style={{ gap: 6 }}>
        <Badge variant="neutral">{count} members</Badge>
      </div>
    </div>
  );
}