import { Modal } from './Modal';

   interface ConfirmDialogProps {
     open: boolean;
     title: string;
     message: string;
     confirmLabel?: string;
     cancelLabel?: string;
     danger?: boolean;
     busy?: boolean;
     onConfirm: () => void;
     onCancel: () => void;
   }

   export function ConfirmDialog({
     open,
     title,
     message,
     confirmLabel = 'تأكيد',
     cancelLabel = 'إلغاء',
     danger,
     busy,
     onConfirm,
     onCancel,
   }: ConfirmDialogProps) {
     return (
       <Modal
         open={open}
         title={title}
         onClose={onCancel}
         footer={
           <>
             <button
               type="button"
               className="btn btn--ghost"
               onClick={onCancel}
               disabled={busy}
             >
               {cancelLabel}
             </button>
             <button
               type="button"
               className={'btn ' + (danger ? 'btn--danger' : 'btn--primary')}
               onClick={onConfirm}
               disabled={busy}
             >
               {busy ? '...' : confirmLabel}
             </button>
           </>
         }
       >
         <p style={{ lineHeight: 1.8, color: 'var(--c-ink-soft)' }}>{message}</p>
       </Modal>
     );
   }
   