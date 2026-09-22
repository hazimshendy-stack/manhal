import { Badge } from '@/components/ui/Badge';
   import type { Member } from '@/types';

   export function MemberStatusBadge({ status }: { status: Member['status'] }) {
     if (status === 'active') return <Badge variant="success" dot>Active</Badge>;
     if (status === 'inactive') return <Badge variant="neutral">Inactive</Badge>;
     return <Badge variant="danger" dot>Suspended</Badge>;
   }
   