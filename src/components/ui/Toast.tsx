import { useEffect, useState, type ReactNode } from 'react';

   type ToastType = 'success' | 'error' | 'info' | 'warning';

   interface ToastItem {
     id: string;
     title: string;
     message?: string;
     type: ToastType;
   }

   interface ToastState {
     toasts: ToastItem[];
     show: (title: string, message?: string, type?: ToastType) => void;
     remove: (id: string) => void;
   }

   let toastStore: ToastState | null = null;
   const listeners = new Set<(state: ToastState) => void>();

   function emit() {
     if (!toastStore) return;
     listeners.forEach((listener) => listener(toastStore!));
   }

   export function useToast(): ToastState {
     const [state, setState] = useState<ToastState>(() => {
       if (!toastStore) {
         toastStore = {
           toasts: [],
           show: () => {},
           remove: () => {},
         };
       }
       return toastStore;
     });

     useEffect(() => {
       listeners.add(setState);
       return () => {
         listeners.delete(setState);
       };
     }, []);

     return state;
   }

   /* ═══════════════════════════════════════════════════════════════
      Toast Container — يُضاف في App
      ═══════════════════════════════════════════════════════════════ */

   const ICONS: Record<ToastType, string> = {
     success: '✓',
     error: '⚠',
     info: 'ℹ',
     warning: '⚠',
   };

   export function ToastContainer() {
     const { toasts, remove } = useToast();

     if (toasts.length === 0) return null;

     return (
       <div className="toast-container">
         {toasts.map((t) => (
           <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
         ))}
       </div>
     );
   }

   function Toast({ toast, onClose }: { toast: ToastItem; onClose: () => void }): ReactNode {
     useEffect(() => {
       const timer = setTimeout(onClose, 4000);
       return () => clearTimeout(timer);
     }, [onClose]);

     return (
       <div className={'toast toast--' + toast.type} onClick={onClose}>
         <div className="toast__icon">{ICONS[toast.type]}</div>
         <div className="toast__content">
           <div className="toast__title">{toast.title}</div>
           {toast.message ? <div className="toast__message">{toast.message}</div> : null}
         </div>
       </div>
     );
   }

   /* ═══════════════════════════════════════════════════════════════
      Global API — يمكن استخدامه من أي مكان
      ═══════════════════════════════════════════════════════════════ */

   export const toast = {
     show(title: string, message?: string, type: ToastType = 'info') {
       if (!toastStore) {
         toastStore = {
           toasts: [],
           show: () => {},
           remove: () => {},
         };
         toastStore.show = (t, m, ty = 'info') => {
           const id = Math.random().toString(36).slice(2, 10);
           toastStore!.toasts = [
             ...toastStore!.toasts,
             { id, title: t, message: m, type: ty },
           ];
           emit();
           setTimeout(() => {
             toastStore!.toasts = toastStore!.toasts.filter((x) => x.id !== id);
             emit();
           }, 4000);
         };
         toastStore.remove = (id) => {
           toastStore!.toasts = toastStore!.toasts.filter((x) => x.id !== id);
           emit();
         };
       }
       toastStore.show(title, message, type);
     },

     success(title: string, message?: string) {
       this.show(title, message, 'success');
     },

     error(title: string, message?: string) {
       this.show(title, message, 'error');
     },

     info(title: string, message?: string) {
       this.show(title, message, 'info');
     },

     warning(title: string, message?: string) {
       this.show(title, message, 'warning');
     },
   };
   