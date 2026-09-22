import { useMemo, useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { createOne, newId, now } from '@/lib/db';
   import { safeArray } from '@/lib/safe';
   import { teams } from '@/data/teams';
   import { MessageBubble } from '@/components/chat/MessageBubble';
   import { Composer } from '@/components/chat/Composer';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading } from '@/components/ui/Loading';
   import { toast } from '@/components/ui/Toast';
   import { relativeTime } from '@/lib/format';
   import type { Conversation, Message, AppUser } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { toast } from '@/components/ui/Toast';
import { Select } from '@/components/ui/FormField';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Composer } from '@/components/chat/Composer';
import { relativeTime } from '@/lib/format';
import { safeArray } from '@/lib/safe';
import { createOne } from '@/lib/db';
import { newId } from '@/lib/db';
import { now } from '@/lib/db';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { conversations } from '@/data/conversations';
import { messages } from '@/data/conversations';

   export function ConversationsPage() {
     const { user } = useAuth();
     const { data: conversations, loading: l1 } = useRealtimeCollection<Conversation>('conversations');
     const { data: messages, loading: l2 } = useRealtimeCollection<Message>('messages');
     const { data: users, loading: l3 } = useRealtimeCollection<AppUser>('users');
     const [activeId, setActiveId] = useState<string | null>(null);
     const [mobileShowChat, setMobileShowChat] = useState(false);
     const myConvs = useMemo(() => {
       if (!user) return [];
       return safeArray(conversations).filter((c) => {
         if (c.type === 'general') return true;
         if (c.type === 'team') return c.teamId === user.teamId;
         return safeArray(c.participantUids).includes(user.uid);
       });
     }, [conversations, user]);
     const defaultId = useMemo(() => myConvs.find((c) => c.type === 'general')?.id ?? null, [myConvs]);
     const currentId = activeId ?? defaultId;
     const active = currentId ? myConvs.find((c) => c.id === currentId) : null;
     const activeMsgs = useMemo(() => (!currentId ? [] : safeArray(messages).filter((m) => m.conversationId === currentId).sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1))), [messages, currentId]);
     if (!user) return null;
     if (l1 || l2 || l3) return <Loading fullHeight message="Loading conversations..." />;
     const getConvName = (): string => {
       if (!active) return '';
       if (active.type === 'general') return 'General Chat';
       if (active.type === 'team') return 'Team ' + (teams.find((t) => t.id === active.teamId)?.name ?? '');
       const otherUid = safeArray(active.participantUids).find((u) => u !== user.uid);
       return users.find((u) => u.uid === otherUid)?.displayName ?? 'Private chat';
     };
     const sendMessage = async (text: string) => {
       if (!currentId) return;
       const msg: Message = { id: newId('MSG'), conversationId: currentId, senderUid: user.uid, senderName: user.displayName, text, sentAt: now() };
       try { await createOne('messages', msg); } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
     };
     return (
       <div style={{ paddingTop: 16, paddingBottom: 24 }}>
         <div className="chat-layout">
           <div className={'chat-sidebar' + (mobileShowChat ? ' is-hidden' : '')}>
             <div className="chat-sidebar__head"><div className="chat-sidebar__title">Conversations</div></div>
             <div className="chat-conversations">
               {myConvs.length === 0 ? <div style={{ padding: 28, textAlign: 'center', color: 'var(--c-ink-muted)' }}>No conversations yet</div> : (
                 [...myConvs].sort((a, b) => ((a.lastMessageAt ?? '') < (b.lastMessageAt ?? '') ? 1 : -1)).map((c) => {
                   const name = c.type === 'general' ? 'General Chat' : c.type === 'team' ? 'Team ' + (teams.find((t) => t.id === c.teamId)?.name ?? '') : users.find((u) => u.uid === safeArray(c.participantUids).find((p) => p !== user.uid))?.displayName ?? 'Chat';
                   const avt = c.type === 'general' ? '#' : c.type === 'team' ? 'T' : 'U';
                   return (
                     <button key={c.id} type="button" className={'chat-conv' + (currentId === c.id ? ' is-active' : '')} onClick={() => { setActiveId(c.id); setMobileShowChat(true); }}>
                       <div className={'chat-conv__avatar chat-conv__avatar--' + c.type}>{avt}</div>
                       <div className="chat-conv__body">
                         <div className="chat-conv__name">{name}</div>
                         <div className="chat-conv__preview">{c.lastMessageSender ? <strong style={{ color: 'var(--c-red)' }}>{c.lastMessageSender}: </strong> : null}{c.lastMessageText || 'No messages'}</div>
                         <div className="tiny muted">{relativeTime(c.lastMessageAt ?? '')}</div>
                       </div>
                     </button>
                   );
                 })
               )}
             </div>
           </div>
           <div className={'chat-panel' + (!mobileShowChat ? ' is-hidden' : '')}>
             {!active ? <div className="chat-panel__empty"><div style={{ marginBottom: 8 }}>Select a conversation</div></div> : (
               <>
                 <div className="chat-header">
                   <button type="button" className="chat-header__back" onClick={() => setMobileShowChat(false)}>‹</button>
                   <div className="chat-header__info"><div className="chat-header__title">{getConvName()}</div></div>
                 </div>
                 <div className="chat-messages">
                   {activeMsgs.length === 0 ? <EmptyState title="Start" message="No messages yet." /> : activeMsgs.map((m) => <MessageBubble key={m.id} message={m} currentUser={user} />)}
                 </div>
                 <Composer onSend={sendMessage} />
               </>
             )}
           </div>
         </div>
       </div>
     );
   }
   