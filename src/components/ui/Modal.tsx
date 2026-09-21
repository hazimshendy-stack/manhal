import { useEffect, type ReactNode } from 'react';

   interface ModalProps {
     open: boolean;
     title: string;
     onClose: () => void;
     children: ReactNode;
     footer?: ReactNode;
     wide?: boolean;
   }

   export function Modal({ open, title, onClose, children, footer, wide }: ModalProps) {
     // قفل التمرير في الخلفية عند فتح المودال
     useEffect(() => {
       if (open) {
         const original = document.body.style.overflow;
         document.body.style.overflow = 'hidden';
         return () => {
           document.body.style.overflow = original;
         };
       }
       return undefined;
     }, [open]);

     // إغلاق عند الضغط على Escape
     useEffect(() => {
       if (!open) return undefined;
       const handler = (e: KeyboardEvent) => {
         if (e.key === 'Escape') onClose();
       };
       window.addEventListener('keydown', handler);
       return () => window.removeEventListener('keydown', handler);
     }, [open, onClose]);

     if (!open) return null;

     return (
       <div className="modal-backdrop" onClick={onClose}>
         <div
           className={'modal' + (wide ? ' modal--wide' : '')}
           onClick={(e) => e.stopPropagation()}
           role="dialog"
           aria-modal="true"
         >
           <div className="modal__handle" aria-hidden="true" />
           <div className="modal__head">
             <h3>{title}</h3>
             <button
               type="button"
               className="modal__close"
               onClick={onClose}
               aria-label="إغلاق"
             >
               ×
             </button>
           </div>
           <div className="modal__body">{children}</div>
           {footer ? <div className="modal__foot">{footer}</div> : null}
         </div>
       </div>
     );
   }
   