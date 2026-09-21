import type { ReactNode } from 'react';

   interface FormFieldProps {
     label: string;
     required?: boolean;
     hint?: string;
     error?: string;
     children: ReactNode;
   }

   export function FormField({ label, required, hint, error, children }: FormFieldProps) {
     return (
       <div className="form-field">
         <label className="form-field__label">
           {label}
           {required ? <span className="form-field__req">*</span> : null}
         </label>
         {hint ? <div className="form-field__hint">{hint}</div> : null}
         {children}
         {error ? <div className="form-field__error">{error}</div> : null}
       </div>
     );
   }

   /* ═══════════ TextInput ═══════════ */

   interface TextInputProps {
     value: string;
     onChange: (v: string) => void;
     placeholder?: string;
     type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
     required?: boolean;
     disabled?: boolean;
     autoComplete?: string;
     autoFocus?: boolean;
   }

   export function TextInput({
     value,
     onChange,
     placeholder,
     type = 'text',
     required,
     disabled,
     autoComplete,
     autoFocus,
   }: TextInputProps) {
     return (
       <input
         className="input"
         type={type}
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         required={required}
         disabled={disabled}
         autoComplete={autoComplete}
         autoFocus={autoFocus}
       />
     );
   }

   /* ═══════════ NumberInput ═══════════ */

   interface NumberInputProps {
     value: number;
     onChange: (v: number) => void;
     placeholder?: string;
     min?: number;
     max?: number;
     step?: number;
     disabled?: boolean;
   }

   export function NumberInput({
     value,
     onChange,
     placeholder,
     min,
     max,
     step,
     disabled,
   }: NumberInputProps) {
     return (
       <input
         className="input"
         type="number"
         value={value}
         onChange={(e) => onChange(Number(e.target.value))}
         placeholder={placeholder}
         min={min}
         max={max}
         step={step}
         disabled={disabled}
       />
     );
   }

   /* ═══════════ DateInput ═══════════ */

   interface DateInputProps {
     value: string;
     onChange: (v: string) => void;
     disabled?: boolean;
   }

   export function DateInput({ value, onChange, disabled }: DateInputProps) {
     return (
       <input
         className="input"
         type="date"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         disabled={disabled}
       />
     );
   }

   /* ═══════════ TimeInput ═══════════ */

   interface TimeInputProps {
     value: string;
     onChange: (v: string) => void;
     disabled?: boolean;
   }

   export function TimeInput({ value, onChange, disabled }: TimeInputProps) {
     return (
       <input
         className="input"
         type="time"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         disabled={disabled}
       />
     );
   }

   /* ═══════════ TextArea ═══════════ */

   interface TextAreaProps {
     value: string;
     onChange: (v: string) => void;
     placeholder?: string;
     rows?: number;
     disabled?: boolean;
   }

   export function TextArea({ value, onChange, placeholder, rows = 4, disabled }: TextAreaProps) {
     return (
       <textarea
         className="input"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         rows={rows}
         disabled={disabled}
       />
     );
   }

   /* ═══════════ Select ═══════════ */

   interface SelectOption {
     value: string;
     label: string;
   }

   interface SelectProps {
     value: string;
     onChange: (v: string) => void;
     options: SelectOption[];
     disabled?: boolean;
   }

   export function Select({ value, onChange, options, disabled }: SelectProps) {
     return (
       <select
         className="input"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         disabled={disabled}
       >
         {options.map((o) => (
           <option key={o.value} value={o.value}>
             {o.label}
           </option>
         ))}
       </select>
     );
   }

   /* ═══════════ MultiSelect (chips-style) ═══════════ */

   interface MultiSelectProps {
     values: string[];
     onChange: (v: string[]) => void;
     options: SelectOption[];
     disabled?: boolean;
   }

   export function MultiSelect({ values, onChange, options, disabled }: MultiSelectProps) {
     const toggle = (v: string) => {
       if (disabled) return;
       if (values.includes(v)) {
         onChange(values.filter((x) => x !== v));
       } else {
         onChange([...values, v]);
       }
     };

     return (
       <div className="chips">
         {options.map((o) => (
           <button
             key={o.value}
             type="button"
             disabled={disabled}
             className={'chip' + (values.includes(o.value) ? ' is-active' : '')}
             onClick={() => toggle(o.value)}
           >
             {o.label}
           </button>
         ))}
       </div>
     );
   }
   