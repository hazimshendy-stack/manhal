import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { createOne, updateOne, newId, now } from '@/lib/db';
import { teams } from '@/data/teams';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Composer } from '@/components/chat/Composer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { relativeTime } from '@/lib/format';
import type { Conversation, Message, AppUser, TeamId } from '@/types';

export function ConversationsPage() {
  const { user } = useAuth();
  const { data: conversations, loading: l1 } = useRealtimeCollection<Conversation>('conversations');
  const { data: messages, loading: l2 } = useRealtimeCollection<Message>('messages');
  const { data: users, loading: l3 } = useRealtimeCollection<AppUser>('users');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerType, setPickerType] = useState<'private' | 'team'>('private');
  const [selectedTeam, setSelectedTeam] = useState<TeamId>('helpers');
  const [busy, setBusy] = useState(false);

  const others = useMemo(() => {
    if (!user) return [];
    return users
      .filter((u) => u.uid !== user.uid)
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'ar'));
  }, [users, user]);

  const filteredOthers = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return others;
    return others.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q),
    );
  }, [others, pickerQuery]);

  const myConvs = useMemo(() => {
    if (!user) return [];
    return conversations.filter((c) => {
      if (c.type === 'general') return true;
      if (c.type === 'team') return c.teamId === user.teamId;
      return c.participantUids.includes(user.uid);
    });
  }, [conversations, user]);

  const defaultId = useMemo(
    () => myConvs.find((c) => c.type === 'general')?.id ?? null,
    [myConvs],
  );

  const currentId = activeId ?? defaultId;
  const active = currentId ? myConvs.find((c) => c.id === currentId) : null;

  const activeMsgs = useMemo(() => {
    if (!currentId) return [];
    return messages
      .filter((m) => m.conversationId === currentId)
      .sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1));
  }, [messages, currentId]);

  if (!user) return null;
  if (l1 || l2 || l3) return <Loading fullHeight message="جارٍ تحميل المحادثات..." />;

  const getConvName = (): string => {
    if (!active) return '';
    if (active.type === 'general') return 'المحادثة العامة';
    if (active.type === 'team') {
      return 'فريق ' + (teams.find((t) => t.id === active.teamId)?.name ?? '');
    }
    const otherUid = active.participantUids.find((u) => u !== user.uid);
    return users.find((u) => u.uid === otherUid)?.displayName ?? 'محادثة خاصة';
  };

  const getConvAvatar = (): { text: string; variant: 'general' | 'team' | 'private' } => {
    if (!active) return { text: '?', variant: 'private' };
    if (active.type === 'general') return { text: '🌐', variant: 'general' };
    if (active.type === 'team') {
      return { text: (teams.find((t) => t.id === active.teamId)?.name ?? 'FT').slice(0, 2), variant: 'team' };
    }
    const otherUid = active.participantUids.find((u) => u !== user.uid);
    const other = users.find((u) => u.uid === otherUid);
    return { text: other ? other.displayName.slice(0, 1) : '؟', variant: 'private' };
  };

  const sendMessage = async (text: string) => {
    if (!currentId) return;
    const msg: Message = {
      id: newId('MSG'),
      conversationId: currentId,
      senderUid: user.uid,
      senderName: user.displayName,
      text,
      sentAt: now(),
    };
    try {
      await createOne('messages', msg);
      await updateOne('conversations', currentId, {
        lastMessageAt: now(),
        lastMessageText: text,
        lastMessageSender: user.displayName,
      });
    } catch (e) {
      toast.error('فشل الإرسال', e instanceof Error ? e.message : '');
    }
  };

  const startPrivateChat = async (targetUid: string) => {
    // هل موجودة؟
    const existing = conversations.find(
      (c) =>
        c.type === 'private' &&
        c.participantUids.length === 2 &&
        c.participantUids.includes(user.uid) &&
        c.participantUids.includes(targetUid),
    );
    if (existing) {
      setActiveId(existing.id);
      setMobileShowChat(true);
      setOpenPicker(false);
      setPickerQuery('');
      toast.info('المحادثة موجودة — فتحناها');
      return;
    }
    setBusy(true);
    try {
      const id = newId('CONV');
      await createOne('conversations', {
        id,
        type: 'private',
        title: '',
        participantUids: [user.uid, targetUid],
        lastMessageAt: now(),
        createdBy: user.uid,
      });
      setActiveId(id);
      setMobileShowChat(true);
      setOpenPicker(false);
      setPickerQuery('');
      toast.success('تم إنشاء المحادثة');
    } catch (e) {
      toast.error('فشل الإنشاء', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  const startTeamChat = async () => {
    const id = 'CONV-TEAM-' + selectedTeam;
    const existing = conversations.find((c) => c.id === id);
    if (existing) {
      setActiveId(id);
      setMobileShowChat(true);
      setOpenPicker(false);
      return;
    }
    setBusy(true);
    try {
      await createOne('conversations', {
        id,
        type: 'team',
        title: 'فريق ' + (teams.find((t) => t.id === selectedTeam)?.name ?? ''),
        teamId: selectedTeam,
        participantUids: [],
        lastMessageAt: now(),
        createdBy: user.uid,
      });
      setActiveId(id);
      setMobileShowChat(true);
      setOpenPicker(false);
      toast.success('تم إنشاء محادثة الفريق');
    } catch {
      toast.error('فشل الإنشاء');
    } finally {
      setBusy(false);
    }
  };

  const avatarInfo = getConvAvatar();

  return (
    <div style={{ paddingTop: 16, paddingBottom: 24 }}>
      <div className="chat-layout">
        {/* ═══ Sidebar ═══ */}
        <div className={'chat-sidebar' + (mobileShowChat ? ' is-hidden' : '')}>
          <div className="chat-sidebar__head">
            <div className="row row--between" style={{ gap: 10 }}>
              <div className="chat-sidebar__title">المحادثات</div>
              <button
                type="button"
                className="chat-sidebar__new"
                onClick={() => { setOpenPicker(true); setPickerQuery(''); }}
              >
                + جديدة
              </button>
            </div>
          </div>

          <div className="chat-conversations">
            {myConvs.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: 'var(--c-ink-muted)', fontSize: '0.88rem' }}>
                لا محادثات بعد
                <br />
                <button
                  type="button"
                  className="chat-sidebar__new"
                  style={{ marginTop: 16 }}
                  onClick={() => setOpenPicker(true)}
                >
                  + ابدأ محادثة
                </button>
              </div>
            ) : (
              [...myConvs]
                .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1))
                .map((c) => {
                  const name = c.type === 'general'
                    ? 'المحادثة العامة'
                    : c.type === 'team'
                      ? 'فريق ' + (teams.find((t) => t.id === c.teamId)?.name ?? '')
                      : users.find((u) => u.uid === c.participantUids.find((p) => p !== user.uid))?.displayName ?? 'محادثة';
                  const avt = c.type === 'general' ? '🌐' : c.type === 'team' ? '👥' : '👤';
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={'chat-conv' + (currentId === c.id ? ' is-active' : '')}
                      onClick={() => { setActiveId(c.id); setMobileShowChat(true); }}
                    >
                      <div className={'chat-conv__avatar chat-conv__avatar--' + c.type}>{avt}</div>
                      <div className="chat-conv__body">
                        <div className="chat-conv__top">
                          <div className="chat-conv__name">{name}</div>
                          {c.lastMessageAt ? (
                            <div className="chat-conv__time">{relativeTime(c.lastMessageAt)}</div>
                          ) : null}
                        </div>
                        <div className="chat-conv__preview">
                          {c.lastMessageSender ? (
                            <strong style={{ color: 'var(--c-red)', fontWeight: 700 }}>
                              {c.lastMessageSender}:{' '}
                            </strong>
                          ) : null}
                          {c.lastMessageText || 'لا رسائل بعد'}
                        </div>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* ═══ Chat Panel ═══ */}
        <div className={'chat-panel' + (!mobileShowChat ? ' is-hidden' : '')}>
          {!active ? (
            <div className="chat-panel__empty">
              <div className="chat-panel__empty-icon">💬</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>اختر محادثة</div>
              <div className="small muted">أو اضغط "+ جديدة" لبدء محادثة جديدة</div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button
                  type="button"
                  className="chat-header__back"
                  onClick={() => setMobileShowChat(false)}
                  aria-label="رجوع"
                >
                  ›
                </button>
                <div className={'chat-header__avatar chat-header__avatar--' + avatarInfo.variant}>
                  {avatarInfo.text}
                </div>
                <div className="chat-header__info">
                  <div className="chat-header__title">{getConvName()}</div>
                  <div className="chat-header__sub">
                    {active.type === 'general' ? 'الجميع' : active.type === 'team' ? 'فريق' : 'محادثة خاصة'}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {activeMsgs.length === 0 ? (
                  <EmptyState title="ابدأ المحادثة" message="لا رسائل بعد. كن أول من يكتب." />
                ) : (
                  activeMsgs.map((m) => (
                    <MessageBubble key={m.id} message={m} currentUser={user} />
                  ))
                )}
              </div>

              <Composer onSend={sendMessage} />
            </>
          )}
        </div>
      </div>

      {/* ═══ User Picker Modal ═══ */}
      <Modal
        open={openPicker}
        title="محادثة جديدة"
        onClose={() => { setOpenPicker(false); setPickerQuery(''); }}
        wide
      >
        <div className="chips" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={'chip' + (pickerType === 'private' ? ' is-active' : '')}
            onClick={() => setPickerType('private')}
          >
            محادثة خاصة
          </button>
          <button
            type="button"
            className={'chip' + (pickerType === 'team' ? ' is-active' : '')}
            onClick={() => setPickerType('team')}
          >
            محادثة فريق
          </button>
        </div>

        {pickerType === 'private' ? (
          <>
            <input
              className="user-picker__search"
              type="search"
              placeholder="ابحث بالاسم أو البريد..."
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              autoFocus
            />

            {filteredOthers.length === 0 ? (
              <div className="user-picker__empty">
                {others.length === 0
                  ? 'لا يوجد مستخدمون آخرون في المنصة بعد.'
                  : 'لا نتائج مطابقة للبحث.'}
              </div>
            ) : (
              <div className="user-picker">
                {filteredOthers.map((u) => (
                  <button
                    key={u.uid}
                    type="button"
                    className="user-picker__item"
                    onClick={() => startPrivateChat(u.uid)}
                    disabled={busy}
                  >
                    <div className="user-picker__avatar">
                      {u.displayName.charAt(0)}
                    </div>
                    <div className="user-picker__info">
                      <div className="user-picker__name">{u.displayName}</div>
                      {u.email ? <div className="user-picker__email">{u.email}</div> : null}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="small muted mb-3">اختر الفريق لبدء محادثة جماعية:</p>
            <div className="chips" style={{ marginBottom: 20 }}>
              {teams.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={'chip' + (selectedTeam === t.id ? ' is-active' : '')}
                  onClick={() => setSelectedTeam(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={startTeamChat}
              disabled={busy}
            >
              {busy ? '...' : 'إنشاء محادثة ' + (teams.find((t) => t.id === selectedTeam)?.name ?? '')}
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}
