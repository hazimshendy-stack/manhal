import type { ReactNode } from 'react';

   interface EmptyStateProps {
     icon?: string;
     title?: string;
     message: string;
     action?: ReactNode;
   }

   export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
     return (
       <div className="empty">
         {icon ? <div className="empty__icon">{icon}</div> : null}
         {title ? <div className="empty__title">{title}</div> : null}
         <div className="empty__message">{message}</div>
         {action}
       </div>
     );
   }
   