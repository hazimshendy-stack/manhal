import { useNavigate } from 'react-router-dom';
   import type { Notification } from '@/types';
   import { relativeTime } from '@/lib/format';

   interface NotificationItemProps { notification: Notification; onMarkRead?: (id: string) => void; }
   export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
     const nav = useNavigate();
     const handleClick = () => {
       if (!notification.read && onMarkRead) onMarkRead(notification.id);
       if (notification.route) nav(notification.route);
     };
     return (
       <div className={'notif-item' + (!notification.read ? ' notif-item--unread' : '')} onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}>
         <div className="notif-item__body">
           <div className="notif-item__title">{notification.title}</div>
           <div className="notif-item__message">{notification.message}</div>
           <div className="notif-item__meta">
             {notification.fromName ? <><span className="notif-item__from">{notification.fromName}</span><span>·</span></> : null}
             <span>{relativeTime(notification.date)}</span>
             {notification.priority === 'high' ? <span className="notif-item__priority notif-item__priority--high">Important</span> : null}
           </div>
         </div>
       </div>
     );
   }
   