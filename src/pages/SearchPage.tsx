import { useMemo, useState } from 'react';
   import { Link } from 'react-router-dom';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';
   import type { Member, Contribution, Achievement, CalendarEvent } from '@/types';

   interface SearchResult {
     id: string;
     type: 'member' | 'contribution' | 'achievement' | 'event' | 'team' | 'committee';
     title: string;
     subtitle?: string;
     route: string;
     icon: string;
   }

   export function SearchPage() {
     const [query, setQuery] = useState('');
     const { data: members } = useCollection<Member>('members');
     const { data: contributions } = useCollection<Contribution>('contributions');
     const { data: achievements } = useCollection<Achievement>('achievements');
     const { data: events } = useCollection<CalendarEvent>('calendar');

     const results = useMemo<SearchResult[]>(() => {
       const q = query.trim().toLowerCase();
       if (!q || q.length < 2) return [];

       const out: SearchResult[] = [];

       members.forEach((m) => {
         if (m.name.toLowerCase().includes(q)) {
           out.push({
             id: m.id,
             type: 'member',
             title: m.name,
             subtitle: m.bio?.slice(0, 80),
             route: '/members/' + m.id,
             icon: '👤',
           });
         }
       });

       contributions.forEach((c) => {
         if (
           c.title.toLowerCase().includes(q) ||
           c.description.toLowerCase().includes(q)
         ) {
           out.push({
             id: c.id,
             type: 'contribution',
             title: c.title,
             subtitle: c.memberName + ' · ' + c.hours + ' ساعة',
             route: '/contributions/' + c.id,
             icon: '📝',
           });
         }
       });

       achievements.forEach((a) => {
         if (
           a.title.toLowerCase().includes(q) ||
           a.description.toLowerCase().includes(q)
         ) {
           out.push({
             id: a.id,
             type: 'achievement',
             title: a.title,
             subtitle: a.description.slice(0, 80),
             route: '/achievements',
             icon: '🏆',
           });
         }
       });

       events.forEach((e) => {
         if (e.title.toLowerCase().includes(q)) {
           out.push({
             id: e.id,
             type: 'event',
             title: e.title,
             subtitle: e.date,
             route: '/calendar',
             icon: '📅',
           });
         }
       });

       teams.forEach((t) => {
         if (t.name.toLowerCase().includes(q) || t.nameAr.includes(query)) {
           out.push({
             id: t.id,
             type: 'team',
             title: t.name,
             subtitle: t.nameAr,
             route: '/teams/' + t.id,
             icon: '🏅',
           });
         }
       });

       committees.forEach((c) => {
         if (c.nameAr.includes(query) || c.name.toLowerCase().includes(q)) {
           out.push({
             id: c.id,
             type: 'committee',
             title: c.nameAr,
             subtitle: c.description,
             route: '/committees',
             icon: '🏛️',
           });
         }
       });

       return out.slice(0, 50);
     }, [query, members, contributions, achievements, events]);

     return (
       <div className="container">
         <PageHeader
           eyebrow="بحث"
           title="بحث شامل"
           description="ابحث في الأعضاء، المشاركات، الإنجازات، الأحداث، الفرق، واللجان."
         />

         <input
           className="input"
           type="search"
           placeholder="اكتب حرفين على الأقل..."
           value={query}
           onChange={(e) => setQuery(e.target.value)}
           autoFocus
           style={{ marginBottom: 20 }}
         />

         {query.length < 2 ? (
           <EmptyState
             icon="🔍"
             title="ابدأ الكتابة"
             message="اكتب حرفين على الأقل للبحث."
           />
         ) : results.length === 0 ? (
           <EmptyState
             icon="🔍"
             title="لا نتائج"
             message={'لم يتم العثور على نتائج لـ "' + query + '".'}
           />
         ) : (
           <div className="stack">
             {results.map((r) => (
               <Link
                 key={r.type + '-' + r.id}
                 to={r.route}
                 className="card"
               >
                 <div
                   style={{
                     display: 'flex',
                     gap: 12,
                     alignItems: 'center',
                   }}
                 >
                   <div
                     style={{
                       width: 40,
                       height: 40,
                       borderRadius: 10,
                       background: 'var(--c-off-white)',
                       border: '1px solid var(--c-line)',
                       display: 'grid',
                       placeItems: 'center',
                       fontSize: '1.15rem',
                       flexShrink: 0,
                     }}
                   >
                     {r.icon}
                   </div>
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{r.title}</div>
                     {r.subtitle ? (
                       <div className="card__meta">{r.subtitle}</div>
                     ) : null}
                   </div>
                   <Badge variant="neutral">{r.type}</Badge>
                 </div>
               </Link>
             ))}
           </div>
         )}
       </div>
     );
   }
   