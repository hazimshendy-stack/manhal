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
  const { data: conversations, loading: loadingConvs } = useRealtimeCollection<Conversation>('conversations');
  const { data: messages, loading: loadingMsgs } = useRealtimeCollection<Message>('messages');
  const { data: users } = useRealtimeCollection<AppUser>('users');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [createType, setCreateType] = useState<'private' | 'team'>('private');
  const [createTarget, setCreateTarget] = useState<string>('');
  const [createTeamId, setCreateTeamId] = useState<TeamId>('helpers');
  const [busy, setBusy] = useState(false);

  const myConversations = useMemo(() => {
    if (!user) return [];
    return conversations.filter((c) => {
      if (c.type === 'general') return true;
      if (c.type === 'team') return c.teamId === user.teamId;
      return c.participantUids.includes(user.uid);
    });
  }, [conversations, user]);

  const defaultId = useMemo(() => myConversations.find((c) => c.type === 'general')?.id ?? null, [myConversations]);
  const currentId = activeId ?? defaultId;
  const active = currentId ? myConversations.find((c) => c.id === currentId) : null;

  const activeMessages = useMemo(() => {
    if (!currentId) return [];
    return messages.filter((m) => m.conversationId === currentId).sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1));
  }, [messages, currentId]);

  if (!user) return null;
  if (loadingConvs || loadingMsgs) return <Loading fullHeight message="جارٍ تحميل المحادثات..." />;

  const getConvName = (): string => {
    if (!active) return '';
    if (active.type === 'general') return 'المحادثة العامة';
    if (active.type === 'team') {
      const team = teams.find((t) => t.id === active.teamId);
      return 'فريق ' + (team?.name ?? '');
    }
    const otherUid = active.participantUids.find((uid) => uid !== user.uid);
    const other = users.find((u) => u.uid === otherUid);
    return other?.displayName ?? 'محادثة خاصة';
  };

  const sendMessage = async (text: string) => {
    if (!currentId || !user) return;
    const myMember = members.find((m) => m.id === user.memberId);
    const msg: Message = {
      id: newId('MSG'),
      conversationId: currentId,
      senderUid: user.uid,
      senderName: myMember?.name ?? user.displayName,
      text,
      sentAt: now(),
    };
    try {
      await createOne('messages', msg);
      await createOne('conversations', {
        id: currentId,
        lastMessageAt: now(),
        lastMessageText: text,
        lastMessageSender: myMember?.name ?? user.displayName,
      });
    } catch (err) {
      const m = err instanceof Error ? err.message : 'فشل الإرسال';
      toast.error('فشل الإرسال', m);
    }
  };

  const createConversation = async () => {
    if (!user) return;
    setBusy(true);
    try {
      if (createType === 'private') {
        if (!createTarget) { toast.error('اختر عضوًا'); setBusy(false); return; }
        const existing = conversations.find(
          (c) => c.type === 'private'
            && c.participantUids.length === 2
            && c.participantUids.includes(user.uid)
            && c.participantUids.includes(createTarget)
        );
        if (existing) {
          setActiveId(existing.id);
          setMobileShowChat(true);
          setOpenCreate(false);
          return;
        }
        const id = newId('CONV-PRIVATE');
        await createOne('conversations', {
          id,
          type: 'private',
          title: '',
          participantUids: [user.uid, createTarget],
          lastMessageAt: now(),
        });
        setActiveId(id);
        setMobileShowChat(true);
      } else {
        const id = 'CONV-TEAM-' + createTeamId;
        const existing = conversations.find((c) => c.id === id);
        if (existing) {
          toast.info('محادثة الفريق موجودة بالفعل');
          setActiveId(id);
          setMobileShowChat(true);
          setOpenCreate(false);
          return;
        }
        await createOne('conversations', {
          id,
          type: 'team',
          title: 'فريق ' + (teams.find((t) => t.id === createTeamId)?.name ?? ''),
          teamId: createTeamId,
          participantUids: [],
          lastMessageAt: now(),
          createdBy: user.uid,
        });
        setActiveId(id);
        setMobileShowChat(true);
      }
      toast.success('تم إنشاء المحادثة');
      setOpenCreate(false);
      setCreateTarget('');
    } catch (err) {
      const m = err instanceof Error ? err.message : 'فشل الإنشاء';
      toast.error('فشل الإنشاء', m);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <div className="chat-layout">
        <div className={'chat-sidebar' + (mobileShowChat ? ' is-hidden show-desktop' : '')}>
          <div className="chat-sidebar__head">
            <div className="row row--between" style={{ gap: 8 }}>
              <div className="chat-sidebar__title">المحادثات</div>
              <button type="button" className="chat-sidebar__new" onClick={() => setOpenCreate(true)}>
                + جديدة
              </button>
            </div>
          </div>
          <ConversationList
            conversations={myConversations}
            activeId={currentId ?? undefined}
            currentUser={user}
            users={users}
            onSelect={(id) => { setActiveId(id); setMobileShowChat(true); }}
          />
        </div>

        <div className={'chat-panel' + (!mobileShowChat ? ' is-hidden show-desktop' : '')}>
          {!active ? (
            <div className="chat-panel__empty">
              <div className="chat-panel__empty-icon">💬</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>اختر محادثة</div>
              <div className="small muted">أو أنشئ واحدة جديدة من زر "+ جديدة"</div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button type="button" className="chat-header__back" onClick={() => setMobileShowChat(false)} aria-label="رجوع">‹</button>
                <div className="chat-header__info">
                  <div className="chat-header__title">{getConvName()}</div>
                  <div className="chat-header__sub">
                    {active.type === 'general' ? 'الجميع' : active.type === 'team' ? 'فريق' : 'محادثة خاصة'}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {activeMessages.length === 0 ? (
                  <EmptyState title="ابدأ المحادثة" message="لا رسائل بعد. كن أول من يكتب." />
                ) : (
                  activeMessages.map((m) => <MessageBubble key={m.id} message={m} currentUser={user} />)
                )}
              </div>

              <Composer onSend={sendMessage} />
            </>
          )}
        </div>
      </div>

      <Modal
        open={openCreate}
        title="محادثة جديدة"
        onClose={() => setOpenCreate(false)}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setOpenCreate(false)}>إلغاء</button>
            <button type="button" className="btn btn--primary" onClick={createConversation} disabled={busy}>
              {busy ? '...' : 'إنشاء'}
            </button>
          </>
        }
      >
        <FormField label="النوع" required>
          <Select
            value={createType}
            onChange={(v) => setCreateType(v as 'private' | 'team')}
            options={[
              { value: 'private', label: 'محادثة خاصة (مع عضو)' },
              { value: 'team', label: 'محادثة فريق' },
            ]}
          />
        </FormField>

        {createType === 'private' ? (
          <FormField label="العضو" required>
            <Select
              value={createTarget}
              onChange={setCreateTarget}
              options={[
                { value: '', label: '— اختر —' },
                ...users.filter((u) => u.uid !== user.uid).map((u) => ({ value: u.uid, label: u.displayName })),
              ]}
            />
          </FormField>
        ) : (
          <FormField label="الفريق" required>
            <Select
              value={createTeamId}
              onChange={(v) => setCreateTeamId(v as TeamId)}
              options={teams.map((t) => ({ value: t.id, label: t.name }))}
            />
          </FormField>
        )}

        <p className="small muted mt-3" style={{ lineHeight: 1.7 }}>
          ملاحظة: لو المحادثة موجودة بالفعل، سيتم فتحها مباشرة.
        </p>
      </Modal>
    </div>
  );
}
