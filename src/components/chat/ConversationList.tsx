import type { Conversation, AppUser } from '@/types';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { initials, relativeTime } from '@/lib/format';

   interface ConversationListProps {
     conversations: Conversation[];
     activeId?: string;
     currentUser: AppUser;
     users: AppUser[];
     onSelect: (id: string) => void;
   }

   function getConversationName(
     conv: Conversation,
     currentUser: AppUser,
     users: AppUser[],
   ): string {
     if (conv.type === 'general') return 'المحادثة العامة';
     if (conv.type === 'team') {
       const team = teams.find((t) => t.id === conv.teamId);
       return team ? 'فريق ' + team.nameAr : 'محادثة فريق';
     }
     // private
     const otherUid = conv.participantUids.find((uid) => uid !== currentUser.uid);
     if (!otherUid) return 'محادثة خاصة';
     const other = users.find((u) => u.uid === otherUid);
     return other ? other.displayName : 'محادثة خاصة';
   }

   function getConversationAvatar(
     conv: Conversation,
     currentUser: AppUser,
     users: AppUser[],
   ): { text: string; variant: 'general' | 'team' | 'private' } {
     if (conv.type === 'general') return { text: '🌐', variant: 'general' };
     if (conv.type === 'team') {
       const team = teams.find((t) => t.id === conv.teamId);
       return { text: team ? team.name.slice(0, 2) : 'FT', variant: 'team' };
     }
     const otherUid = conv.participantUids.find((uid) => uid !== currentUser.uid);
     const other = users.find((u) => u.uid === otherUid);
     return { text: other ? initials(other.displayName) : '؟', variant: 'private' };
   }

   export function ConversationList({
     conversations,
     activeId,
     currentUser,
     users,
     onSelect,
   }: ConversationListProps) {
     if (conversations.length === 0) {
       return (
         <div className="empty" style={{ padding: 24 }}>
           <div className="empty__message">لا محادثات بعد</div>
         </div>
       );
     }

     const sorted = [...conversations].sort((a, b) => {
       if (a.type === 'general') return -1;
       if (b.type === 'general') return 1;
       return a.lastMessageAt < b.lastMessageAt ? 1 : -1;
     });

     return (
       <div className="chat-conversations">
         {sorted.map((conv) => {
           const name = getConversationName(conv, currentUser, users);
           const avatar = getConversationAvatar(conv, currentUser, users);
           const unread = conv.unreadCounts?.[currentUser.uid] ?? 0;

           return (
             <button
               key={conv.id}
               type="button"
               className={'chat-conv' + (activeId === conv.id ? ' is-active' : '')}
               onClick={() => onSelect(conv.id)}
             >
               <div
                 className={'chat-conv__avatar chat-conv__avatar--' + avatar.variant}
                 aria-hidden="true"
               >
                 {avatar.text}
               </div>

               <div className="chat-conv__body">
                 <div className="chat-conv__top">
                   <div className="chat-conv__name">{name}</div>
                   <div className="chat-conv__time">
                     {relativeTime(conv.lastMessageAt)}
                   </div>
                 </div>
                 <div className="chat-conv__preview">
                   {conv.lastMessageSender ? (
                     <strong style={{ color: 'var(--c-red)', fontWeight: 700 }}>
                       {conv.lastMessageSender}:{' '}
                     </strong>
                   ) : null}
                   {conv.lastMessageText || 'لا رسائل بعد'}
                 </div>
               </div>

               {unread > 0 ? (
                 <div className="chat-conv__badge">{unread > 99 ? '99+' : unread}</div>
               ) : null}
             </button>
           );
         })}
       </div>
     );
   }
   