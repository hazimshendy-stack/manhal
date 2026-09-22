import { useCollection } from '@/lib/useRealtimeCollection';
   import { createOne, removeOne } from '@/lib/db';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import type { Conversation } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { SkeletonList } from '@/components/ui/Loading';
import { toast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { createOne } from '@/lib/db';
import { removeOne } from '@/lib/db';
import { teams } from '@/data/teams';
import { conversations } from '@/data/conversations';

   export function AdminConversationsPage() {
     const { data, loading } = useCollection<Conversation>('conversations');
     const createTeamConv = async (team: typeof teams[number]) => {
       const id = 'CONV-TEAM-' + team.id;
       if (data.some((c) => c.id === id)) { toast.info('Already exists'); return; }
       try { await createOne('conversations', { id, type: 'team', title: 'Team ' + team.name, teamId: team.id, participantUids: [], lastMessageAt: new Date().toISOString() }); toast.success('Created'); }
       catch { toast.error('Failed'); }
     };
     const del = async (c: Conversation) => { try { await removeOne('conversations', c.id); toast.success('Deleted'); } catch { toast.error('Failed'); } };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Conversations" description="Manage chats." />
         <section className="section"><SectionHeader eyebrow="Quick Create" title="Team Chats" />
           <div className="chips">{teams.map((t) => { const exists = data.some((c) => c.id === 'CONV-TEAM-' + t.id); return <button key={t.id} type="button" disabled={exists} className={'chip' + (exists ? ' is-active' : '')} onClick={() => createTeamConv(t)}>{t.name} {exists ? '✓' : '+'}</button>; })}</div>
         </section>
         <section className="section">
           <SectionHeader eyebrow="List" title={'Conversations (' + data.length + ')'} />
           {loading ? <SkeletonList count={5} /> : data.length === 0 ? <EmptyState title="No conversations" message="Create team chats above." /> : (
             <div className="stack">{data.map((c) => (
               <div key={c.id} className="card no-click">
                 <div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{c.title || (c.type === 'general' ? 'General' : 'Chat')}</div><div className="card__meta">{c.type}</div></div><Badge variant={c.type === 'general' ? 'red' : c.type === 'team' ? 'info' : 'neutral'}>{c.type}</Badge></div>
                 {c.type !== 'general' ? <div className="row mt-3" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn btn--danger btn--xs" onClick={() => del(c)}>Delete</button></div> : null}
               </div>
             ))}</div>
           )}
         </section>
       </div>
     );
   }
   