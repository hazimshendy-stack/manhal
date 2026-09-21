import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { createOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { teams } from '@/data/teams';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { relativeTime } from '@/lib/format';
import type { Conversation } from '@/types';

export function AdminConversationsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<Conversation>('conversations');
  const [toDelete, setToDelete] = useState<Conversation | null>(null);
  const [busy, setBusy] = useState(false);

  const createTeamConv = async (team: (typeof teams)[number]) => {
    const exists = data.some((c) => c.type === 'team' && c.teamId === team.id);
    if (exists) { toast.info('Chat already exists'); return; }
    setBusy(true);
    try {
      const id = 'CONV-TEAM-' + team.id;
      await createOne('conversations', { id, type: 'team', title: 'Team ' + team.name, teamId: team.id, participantUids: [], lastMessageAt: new Date().toISOString() });
      await logAudit(me, 'CREATE_CONVERSATION', 'Conversation', id, team.name);
      toast.success('Team chat created');
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('conversations', toDelete.id);
      toast.success('Deleted');
      setToDelete(null);
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Conversations" description="Manage team chats and general chat." />
      <section className="section">
        <SectionHeader eyebrow="Quick Create" title="Team Chats" description="One chat per team — created automatically." />
        <div className="chips">
          {teams.map((t) => {
            const exists = data.some((c) => c.type === 'team' && c.teamId === t.id);
            return (
              <button key={t.id} type="button" disabled={busy || exists} className={'chip' + (exists ? ' is-active' : '')} onClick={() => createTeamConv(t)}>
                {t.name} {exists ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="List" title={'Conversations (' + data.length + ')'} />
        {loading ? <SkeletonList count={5} /> : data.length === 0 ? (
          <EmptyState title="No conversations" message="Create team chats above." />
        ) : (
          <div className="stack">
            {data.map((c) => {
              const team = c.teamId ? teams.find((t) => t.id === c.teamId) : null;
              return (
                <div key={c.id} className="card no-click">
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">{c.title || (c.type === 'general' ? 'General Chat' : team?.name)}</div>
                      <div className="card__meta">
                        {c.type === 'general' ? 'General' : c.type === 'team' ? 'Team' : 'Private'}
                        {c.lastMessageAt ? ' · ' + relativeTime(c.lastMessageAt) : ''}
                      </div>
                    </div>
                    <Badge variant={c.type === 'general' ? 'red' : c.type === 'team' ? 'info' : 'neutral'}>{c.type}</Badge>
                  </div>
                  {c.type !== 'general' ? (
                    <div className="row mt-3" style={{ justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(c)}>Delete</button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
      <ConfirmDialog open={toDelete !== null} title="Delete Conversation" message="This will delete the chat and all messages." confirmLabel="Delete" danger busy={busy} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}