import { Badge } from '@/components/ui/Badge';
   import type { Member } from '@/types';

   export function MemberStatusBadge({ status }: { status: Member['status'] }) {
     if (status === 'active') return <Badge variant="success" dot>نشط</Badge>;
     if (status === 'inactive') return <Badge variant="neutral">غير نشط</Badge>;
     return <Badge variant="danger" dot>موقوف</Badge>;
   }
   