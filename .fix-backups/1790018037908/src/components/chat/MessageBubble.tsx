import type { Message, AppUser } from '@/types';
   import { initials, formatTime } from '@/lib/format';

   interface MessageBubbleProps {
     message: Message;
     currentUser: AppUser;
   }

   export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
     const isMine = message.senderUid === currentUser.uid;

     return (
       <div className={'chat-message' + (isMine ? ' chat-message--mine' : '')}>
         {!isMine ? (
           <div className="chat-message__avatar" aria-hidden="true">
             {initials(message.senderName)}
           </div>
         ) : null}

         <div className="chat-message__bubble">
           {!isMine ? (
             <div className="chat-message__sender">{message.senderName}</div>
           ) : null}
           <div>{message.text}</div>
           <div className="chat-message__time">{formatTime(message.sentAt)}</div>
         </div>
       </div>
     );
   }
   