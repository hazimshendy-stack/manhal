import { useMemo, useState } from 'react';
   import { Link } from 'react-router-dom';
   import { useRealtimeCollection, useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Badge } from '@/components/ui/Badge';
   import type { Member, Contribution, Achievement, Committee } from '@/types';

   export function SearchPage() {
     const [query, setQuery] = useState('');
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const { data: achievements } = useRealtimeCollection<Achievement>('achievements');
     const { data: committees } = useCollection<Committee>('committees');
     const results = useMemo(() => {
       const q = query.trim().toLowerCase();
       if (!q || q.length < 2) return [];
       const out: Array<{ id: string; type: string; title: string; subtitle?: string; route: string }> = [];
       members.forEach((m) => { if (m.name.toLowerCase().includes(q)) out.push({ id: m.id, type: 'Member', title: m.name, subtitle: m.bio?.slice(0, 80), route: '/members/' + m.id }); });
       contributions.forEach((c) => { if (c.title.toLowerCase().includes(q)) out.push({ id: c.id, type: 'Contribution', title: c.title, route: '/my-contributions' }); });
       achievements.forEach((a) => { if (a.title.toLowerCase().includes(q)) out.push({ id: a.id, type: 'Achievement', title: a.title, route: '/achievements' }); });
       teams.forEach((t) => { if (t.name.toLowerCase().includes(q)) out.push({ id: t.id, type: 'Team', title: t.name, route: '/teams/' + t.id }); });
       committees.forEach((c) => { if (c.nameAr.toLowerCase().includes(q)) out.push({ id: c.id, type: 'Committee', title: c.nameAr, route: '/committees/' + c.id }); });
       return out.slice(0, 50);
     }, [query, members, contributions, achievements, committees]);
     return (
       <div className="container">
         <PageHeader eyebrow="Search" title="Global Search" description="Search across the platform." />
         <input className="input" type="search" placeholder="Type at least 2 characters..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus style={{ marginBottom: 20 }} />
         {query.length < 2 ? <EmptyState title="Start typing" message="Type at least 2 characters." /> : results.length === 0 ? <EmptyState title="No results" message={'No results for "' + query + '".'} /> : (
           <div className="stack">{results.map((r) => (
             <Link key={r.type + '-' + r.id} to={r.route} className="card"><div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{r.title}</div>{r.subtitle ? <div className="card__meta">{r.subtitle}</div> : null}</div><Badge variant="neutral">{r.type}</Badge></div></Link>
           ))}</div>
         )}
       </div>
     );
   }
   