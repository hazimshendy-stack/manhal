import type { Committee } from '@/types';

 /* ═══════════════════════════════════════════════════════════════
    Committees are added by Head Sub Branches via admin panel.
    Each member MUST belong to at least one committee.
    Each committee belongs to a specific team.
    ═══════════════════════════════════════════════════════════════ */

 export const committees: Committee[] = [
   { id: 'gov-helpers', name: 'Governance Helpers', nameAr: 'حوكمة المساعدين', description: 'Helpers governance committee', color: '#151A45', icon: '', teamId: 'helpers' },
   { id: 'events-heroes', name: 'Events Heroes', nameAr: 'فعاليات الأبطال', description: 'Heroes events committee', color: '#C1272D', icon: '', teamId: 'heroes' },
   { id: 'media-messages', name: 'Media Messages', nameAr: 'إعلام الرسائل', description: 'Messages media committee', color: '#A78BFA', icon: '', teamId: 'messages' },
 ];
 