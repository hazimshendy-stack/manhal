import { site, activeSeason } from '@/data';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import type { Member } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat } from '@/components/ui/Stat';
import { StatRow } from '@/components/ui/Stat';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { members } from '@/data/members';

   export function AboutPage() {
     const { data: members } = useRealtimeCollection<Member>('members');
     const active = members.filter((m) => m.status === 'active');
     return (
       <div className="container">
         <PageHeader eyebrow="About" title={site.name} description={site.description} />
         <section className="section--tight"><StatRow><Stat value={active.length} label="Members" /><Stat value={teams.length} label="Teams" /></StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="Season" title={activeSeason.label} description={activeSeason.theme} />
         </section>
         <section className="section">
           <SectionHeader eyebrow="Teams" title="Seven Teams" />
           <div className="stack">{teams.map((t) => (<div key={t.id} className="card no-click"><div className="card__title">{t.name}</div><p className="small soft mt-3">{t.description}</p></div>))}</div>
         </section>
       </div>
     );
   }
   