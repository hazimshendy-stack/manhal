import { useNavigate } from 'react-router-dom';
   import type { Notification } from '@/types';
   import { relativeTime } from '@/lib/format';

   const ICONS: Record<string, string> = {
     approval: '✅',
     request: '📋',
     participation: '📝',
     achievement: '🏆',
     system: '🔔',
     warning: '⚠️',
     message: '💬',
   };

   interface NotificationItemProps {
     notification: Notification;
     onMarkRead?: (id: string) => void;
   }

   export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
     const nav = useNavigate();

     const handleClick = () => {
       if (!notification.read && onMarkRead) {
         onMarkRead(notification.id);
       }
       if (notification.route) {
         nav(notification.route);
       }
     };

     const icon = ICONS[notification.type] || '🔔';

     return (
       <div
         className={'notif-item' + (!notification.read ? ' notif-item--unread' : '')}
         onClick={handleClick}
         role="button"
         tabIndex={0}
         onKeyDown={(e) => {
           if (e.key === 'Enter') handleClick();
         }}
       >
         <div className={'notif-item__icon notif-item__icon--' + notification.type}>
           <span aria-hidden="true">{icon}</span>
         </div>

         <div className="notif-item__body">
           <div className="notif-item__title">{notification.title}</div>
           <div className="notif-item__message">{notification.message}</div>

           <div className="notif-item__meta">
             {notification.fromName ? (
               <>
                 <span className="notif-item__from">{notification.fromName}</span>
                 <span className="notif-item__dot">·</span>
               </>
             ) : null}
             <span>{relativeTime(notification.date)}</span>
             {notification.priority === 'high' ? (
               <span className="notif-item__priority notif-item__priority--high">
                 مهم
               </span>
             ) : null}
           </div>
         </div>
       </div>
     );
   }
   