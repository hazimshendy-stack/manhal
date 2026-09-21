import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { createOne, newId, now } from '@/lib/db';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Composer } from '@/components/chat/Composer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, Select } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { Conversation, Message, AppUser, TeamId } from '@/types';

export function ConversationsPage() {
  const { user } = useAuth();
  const { data: conversations, loading: l1 } = useRealtimeCollection<Conversation>('conversations');
  const { data: messages, loading: l2 } = useRealtimeCollection<Message>('messages');
  const { data: users, loading: l3 } = useRealtimeCollection<AppUser>('users');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'private' | 'team'>('private');
  const [target, setTarget] = useState('');
  const [teamId, setTeamId] = useState<TeamId>('helpers');
  const [busy, setBusy] = useState(false);

  const others = useMemo(() => user ? users.filter((u) => u.uid !== user.uid) : [], [users, user]);

  const myConvs = useMemo(() => {
    if (!user) return [];
    return conversations.filter((c) => {
      if (c.type === 'general') return true;
      if (c.type === 'team') return c.teamId === user.teamId;
      return c.participantUids.includes(user.uid);
    });
  }, [conversations, user]);

  const defaultId = useMemo(() => myConvs.find((c) => c.type === 'general')?.id ?? null, [myConvs]);
  const currentId = activeId ?? defaultId;
  const active = currentId ? myConvs.find((c) => c.id === currentId) : null;
  const activeMsgs = useMemo(() => !currentId ? [] : messages
    .filter((m) => m.conversationId === currentId)
    .sort((a, b) => a.sentAt > b.sentAt ? 1 : -1), [messages, currentId]);

  if (!user) return null;
  if (l1 || l2 || l3) return <Loading fullHeight message="جارٍ تحميل المحادثات..." />;

  const getName = () => {
    if (!active) return '';
    if (active.type === 'general') return 'المحادثة العامة';
    if (active.type === 'team') return 'فريق ' + (teams.find((t) => t.id === active.teamId)?.name ?? '');
    const ou = active.participantUids.find((u) => u !== user.uid);
    return users.find((u) => u.uid === ou)?.displayName ?? 'محادثة خاصة';
  };

  const send = async (text: string) => {
    if (!currentId) return;
    const myM = members.find((m) => m.id === user.memberId);
    const msg: Message = {
      id: newId('MSG'), conversationId: currentId, senderUid: user.uid,
      senderName: myM?.name ?? user.displayName, text, sentAt: now(),
    };
    try {
      await createOne('messages', msg);
      await createOne('conversations', {
        id: currentId, lastMessageAt: now(),
        lastMessageText: text, lastMessageSender: myM?.name ?? user.displayName,
      });
    } catch (e) { toast.error('فشل الإرسال', e instanceof Error ? e.message : ''); }
  };

  const createConv = async () => {
    if (type === 'private') {
      if (!target) { toast.error('اختر عضوًا'); return; }
      const ex = conversations.find((c) => c.type === 'private' && c.participantUids.includes(user.uid) && c.participantUids.includes(target));
      if (ex) { setActiveId(ex.id); setMobile(true); setOpen(false); toast.info('المحادثة موجودة'); return; }
      setBusy(true);
      try {
        const id = newId('CONV-PRIVATE');
        await createOne('conversations', {
          id, type: 'private', title: '', participantUids: [user.uid, target],
          lastMessageAt: now(), createdBy: user.uid,
        });
        setActiveId(id); setMobile(true); setOpen(false); setTarget(''); toast.success('تم');
      } catch { toast.error('فشل'); } finally { setBusy(false); }
    } else {
      const id = 'CONV-TEAM-' + teamId;
      const ex = conversations.find((c) => c.id === id);
      if (ex) { setActiveId(id); setMobile(true); setOpen(false); toast.info('موجودة'); return; }
      setBusy(true);
      try {
        await createOne('conversations', {
          id, type: 'team', title: 'فريق ' + (teams.find((t) => t.id === teamId)?.name ?? ''),
          teamId, participantUids: [], lastMessageAt: now(), createdBy: user.uid,
        });
        setActiveId(id); setMobile(true); setOpen(false); toast.success('تم');
      } catch { toast.error('فشل'); } finally { setBusy(false); }
    }
  };

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <div className="chat-layout">
        <div className={'chat-sidebar' + (mobile ? ' is-hidden show-desktop' : '')}>
          <div className="chat-sidebar__head">
            <div className="row row--between" style={{ gap: 8 }}>
              <div className="chat-sidebar__title">المحادثات</div>
              <button type="button" className="chat-sidebar__new" onClick={() => setOpen(true)}>+ جديدة</button>
            </div>
          </div>
          <ConversationList conversations={myConvs} activeId={currentId ?? undefined} currentUser={user} users={users} onSelect={(id) => { setActiveId(id); setMobile(true); }} />
        </div>

        <div className={'chat-panel' + (!mobile ? ' is-hidden show-desktop' : '')}>
          {!active ? (
            <div className="chat-panel__empty">
              <div className="chat-panel__empty-icon">💬</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>اختر محادثة</div>
              <div className="small muted">أو اضغط "+ جديدة"</div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button type="button" className="chat-header__back" onClick={() => setMobile(false)} aria-label="رجوع">‹</button>
                <div className="chat-header__info">
                  <div className="chat-header__title">{getName()}</div>
                  <div className="chat-header__sub">{active.type === 'general' ? 'الجميع' : active.type === 'team' ? 'فريق' : 'خاصة'}</div>
                </div>
              </div>
              <div className="chat-messages">
                {activeMsgs.length === 0 ? <EmptyState title="ابدأ المحادثة" message="لا رسائل بعد." /> :
                  activeMsgs.map((m) => <MessageBubble key={m.id} message={m} currentUser={user} />)}
              </div>
              <Composer onSend={send} />
            </>
          )}
        </div>
      </div>

      <Modal open={open} title="محادثة جديدة" onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>إلغاء</button>
            <button type="button" className="btn btn--primary" onClick={createConv} disabled={busy}>{busy ? '...' : 'إنشاء'}</button>
          </>
        }
      >
        <FormField label="النوع" required>
          <Select value={type} onChange={(v) => setType(v as 'private' | 'team')}
            options={[{ value: 'private', label: 'خاصة' }, { value: 'team', label: 'فريق' }]} />
        </FormField>
        {type === 'private' ? (
          <FormField label="العضو" required hint={others.length === 0 ? 'لا يوجد أعضاء' : undefined}>
            <Select value={target} onChange={setTarget}
              options={[{ value: '', label: others.length === 0 ? '— لا يوجد —' : '— اختر —' },
                ...others.map((u) => ({ value: u.uid, label: u.displayName + (u.email ? ' (' + u.email + ')' : '') }))]} />
          </FormField>
        ) : (
          <FormField label="الفريق" required>
            <Select value={teamId} onChange={(v) => setTeamId(v as TeamId)}
              options={teams.map((t) => ({ value: t.id, label: t.name }))} />
          </FormField>
        )}
      </Modal>
    </div>
  );
}
