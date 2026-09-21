import type { Message, AppUser } from '@/types';

interface MessageBubbleProps {
  message: Message;
  currentUser: AppUser;
}

export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
  if (!message || !currentUser) return null;

  const isMine = message.senderUid === currentUser.uid;
  const senderName = message.senderName || 'Unknown';

  return (
    <div className={'chat-message' + (isMine ? ' chat-message--mine' : '')}>
      {!isMine ? (
        <div className="chat-message__avatar">{senderName.charAt(0)}</div>
      ) : null}
      <div className="chat-message__bubble">
        {!isMine ? <div className="chat-message__sender">{senderName}</div> : null}
        <div>{message.text || ''}</div>
        <div className="chat-message__time">{formatTime(message.sentAt)}</div>
      </div>
    </div>
  );
}
