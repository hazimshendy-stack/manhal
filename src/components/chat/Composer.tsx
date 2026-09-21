import { useState, type KeyboardEvent } from 'react';

   interface ComposerProps {
     onSend: (text: string) => Promise<void> | void;
     disabled?: boolean;
     placeholder?: string;
   }

   export function Composer({ onSend, disabled, placeholder = 'اكتب رسالة...' }: ComposerProps) {
     const [text, setText] = useState('');
     const [busy, setBusy] = useState(false);

     const send = async () => {
       const trimmed = text.trim();
       if (!trimmed || busy || disabled) return;
       setBusy(true);
       try {
         await onSend(trimmed);
         setText('');
       } finally {
         setBusy(false);
       }
     };

     const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
       if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         void send();
       }
     };

     return (
       <div className="chat-composer">
         <textarea
           className="chat-composer__input"
           value={text}
           onChange={(e) => setText(e.target.value)}
           onKeyDown={onKeyDown}
           placeholder={placeholder}
           rows={1}
           disabled={busy || disabled}
         />
         <button
           type="button"
           className="chat-composer__send"
           onClick={send}
           disabled={!text.trim() || busy || disabled}
           aria-label="إرسال"
         >
           ↑
         </button>
       </div>
     );
   }
   