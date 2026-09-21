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
   import { toast } from '@/components/ui/Toast';
   import { initials } from '@/lib/format';
   import type { Conversation, Message, AppUser } from '@/types';

   export function ConversationsPage() {
     const { user } = useAuth();
     const { data: conversations, loading: loadingConvs } = useRealtimeCollection<Conversation>('conversations');
     const { data: messages, loading: loadingMsgs } = useRealtimeCollection<Message>('messages');
     const { data: users } = useRealtimeCollection<AppUser>('users');

     const [activeId, setActiveId] = useState<string | null>(null);
     const [mobileShowChat, setMobileShowChat] = useState(false);

     const myConversations = useMemo(() => {
       if (!user) return [];
       return conversations.filter((c) => {
         if (c.type === 'general') return true;
         if (c.type === 'team') return c.teamId === user.teamId;
         return c.participantUids.includes(user.uid);
       });
     }, [conversations, user]);

     // فتح المحادثة العامة افتراضيًا
     const defaultId = useMemo(() => {
       return myConversations.find((c) => c.type === 'general')?.id ?? null;
     }, [myConversations]);

     const currentId = activeId ?? defaultId;
     const active = currentId
       ? myConversations.find((c) => c.id === currentId)
       : null;

     const activeMessages = useMemo(() => {
       if (!currentId) return [];
       return messages
         .filter((m) => m.conversationId === currentId)
         .sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1));
     }, [messages, currentId]);

     if (!user) return null;

     if (loadingConvs || loadingMsgs) {
       return <Loading fullHeight message="جارٍ تحميل المحادثات..." />;
     }

     const getConvName = (): string => {
       if (!active) return '';
       if (active.type === 'general') return 'المحادثة العامة';
       if (active.type === 'team') {
         const team = teams.find((t) => t.id === active.teamId);
         return team ? 'فريق ' + team.nameAr : 'محادثة الفريق';
       }
       const otherUid = active.participantUids.find((uid) => uid !== user.uid);
       const other = users.find((u) => u.uid === otherUid);
       return other ? other.displayName : 'محادثة خاصة';
     };

     const getConvAvatar = (): { text: string; variant: 'general' | 'team' | 'private' } => {
       if (!active) return { text: '?', variant: 'private' };
       if (active.type === 'general') return { text: '🌐', variant: 'general' };
       if (active.type === 'team') {
         const team = teams.find((t) => t.id === active.teamId);
         return { text: team ? team.name.slice(0, 2) : 'FT', variant: 'team' };
       }
       const otherUid = active.participantUids.find((uid) => uid !== user.uid);
       const other = users.find((u) => u.uid === otherUid);
       return { text: other ? initials(other.displayName) : '؟', variant: 'private' };
     };

     const handleSelect = (id: string) => {
       setActiveId(id);
       setMobileShowChat(true);
     };

     const handleBack = () => {
       setMobileShowChat(false);
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

     const avatarInfo = getConvAvatar();

     return (
       <div className="container" style={{ paddingTop: 12 }}>
         <div className="chat-layout">
           {/* ═══════ Conversations List ═══════ */}
           <div
             className={
               'chat-sidebar' + (mobileShowChat ? ' is-hidden show-desktop' : '')
             }
           >
             <div className="chat-sidebar__head">
               <div className="chat-sidebar__title">المحادثات</div>
             </div>
             <ConversationList
               conversations={myConversations}
               activeId={currentId ?? undefined}
               currentUser={user}
               users={users}
               onSelect={handleSelect}
             />
           </div>

           {/* ═══════ Chat Panel ═══════ */}
           <div
             className={
               'chat-panel' + (!mobileShowChat ? ' is-hidden show-desktop' : '')
             }
           >
             {!active ? (
               <div className="chat-panel__empty">
                 <div className="chat-panel__empty-icon">💬</div>
                 <div style={{ fontWeight: 700, marginBottom: 6 }}>
                   اختر محادثة
                 </div>
                 <div className="small muted">
                   اختر محادثة من القائمة لبدء التواصل
                 </div>
               </div>
             ) : (
               <>
                 <div className="chat-header">
                   <button
                     type="button"
                     className="chat-header__back"
                     onClick={handleBack}
                     aria-label="رجوع"
                   >
                     ‹
                   </button>
                   <div
                     className={
                       'chat-conv__avatar chat-conv__avatar--' + avatarInfo.variant
                     }
                     style={{ width: 40, height: 40, fontSize: '0.85rem' }}
                     aria-hidden="true"
                   >
                     {avatarInfo.text}
                   </div>
                   <div className="chat-header__info">
                     <div className="chat-header__title">{getConvName()}</div>
                     <div className="chat-header__sub">
                       {active.type === 'general'
                         ? 'الجميع'
                         : active.type === 'team'
                           ? 'فريق'
                           : 'محادثة خاصة'}
                     </div>
                   </div>
                 </div>

                 <div className="chat-messages">
                   {activeMessages.length === 0 ? (
                     <EmptyState
                       icon="💬"
                       title="ابدأ المحادثة"
                       message="لا رسائل بعد. كن أول من يكتب."
                     />
                   ) : (
                     activeMessages.map((m) => (
                       <MessageBubble
                         key={m.id}
                         message={m}
                         currentUser={user}
                       />
                     ))
                   )}
                 </div>

                 <Composer onSend={sendMessage} />
               </>
             )}
           </div>
         </div>
       </div>
     );
   }
   