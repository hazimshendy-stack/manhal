import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getTeamTotalPoints } from '@/lib/rankings';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Loading } from '@/components/ui/Loading';
   import type { Member, Contribution, RequestRecord, Committee } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getTeamTotalPoints } from '@/lib/rankings';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { members } from '@/data/members';
import { contributions } from '@/data/contributions';
import { requests } from '@/data/requests';

   export function AdminAnalyticsPage() {
     const { data: members, loading: lM } = useCollection<Member>('members');
     const { data: contributions, loading: lC } = useCollection<Contribution>('contributions');
     const { data: requests, loading: lR } = useCollection<RequestRecord>('requests');
     const { data: committees, loading: lCo } = useCollection<Committee>('committees');
     if (lM || lC || lR || lCo) return <Loading fullHeight message="Loading analytics..." />;
     const teamStats = teams.map((t) => ({ team: t, points: getTeamTotalPoints(members, contributions, t.id) })).sort((a, b) => b.points - a.points);
     const maxT = Math.max(1, ...teamStats.map((s) => s.points));
     const statusCounts: Record<string, number> = {};
     requests.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
     const typeCounts: Record<string, number> = {};
     requests.forEach((r) => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1; });
     const contribCounts: Record<string, number> = {};
     contributions.forEach((c) => { if (c.status) contribCounts[c.status] = (contribCounts[c.status] || 0) + 1; });
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Analytics" description="Overview." />
         <section className="section"><SectionHeader eyebrow="Teams" title="Team Points" />
           <div className="card no-click">{teamStats.map((s) => (
             <div key={s.team.id} className="chart-row"><span>{s.team.name}</span><div className="chart-bar" style={{ width: Math.round((s.points / maxT) * 100) + '%' }} /><span style={{ color: 'var(--c-navy)' }}>{s.points}</span></div>
           ))}</div>
         </section>
         <section className="section"><SectionHeader eyebrow="Requests" title="By Status" />
           <div className="grid grid--narrow">{Object.entries(statusCounts).map(([k, v]) => (<div key={k} className="card no-click"><div className="card__meta">{k}</div><div style={{ fontSize: '1.8rem', color: 'var(--c-navy)', marginTop: 6 }}>{v}</div></div>))}</div>
         </section>
         <section className="section"><SectionHeader eyebrow="Requests" title="By Type" />
           <div className="grid grid--narrow">{Object.entries(typeCounts).map(([k, v]) => (<div key={k} className="card no-click"><div className="card__meta">{k}</div><div style={{ fontSize: '1.8rem', color: 'var(--c-red)', marginTop: 6 }}>{v}</div></div>))}</div>
         </section>
         <section className="section"><SectionHeader eyebrow="Contributions" title="By Status" />
           <div className="grid grid--narrow">{Object.entries(contribCounts).map(([k, v]) => (<div key={k} className="card no-click"><div className="card__meta">{k}</div><div style={{ fontSize: '1.8rem', color: 'var(--c-navy)', marginTop: 6 }}>{v}</div></div>))}</div>
         </section>
       </div>
     );
   }
   