interface ProgressBarProps {
     percent: number;
     label?: string;
     sublabel?: string;
     color?: string;
   }

   export function ProgressBar({
     percent,
     label,
     sublabel,
     color = 'var(--c-red)',
   }: ProgressBarProps) {
     const safe = Math.max(0, Math.min(100, percent));
     return (
       <div>
         {label ? (
           <div
             style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: 8,
               fontSize: '0.88rem',
               fontWeight: 700,
               color: 'var(--c-ink)',
             }}
           >
             <span>{label}</span>
             <span
               style={{
                 fontFamily: 'var(--font-en)',
                 color: 'var(--c-red)',
                 fontWeight: 800,
               }}
             >
               {safe}%
             </span>
           </div>
         ) : null}
         <div
           style={{
             height: 10,
             background: 'var(--c-line)',
             borderRadius: 999,
             overflow: 'hidden',
           }}
         >
           <div
             style={{
               width: safe + '%',
               height: '100%',
               background: color,
               transition: 'width 0.4s ease',
               borderRadius: 999,
             }}
           />
         </div>
         {sublabel ? (
           <div
             style={{
               marginTop: 8,
               fontSize: '0.78rem',
               color: 'var(--c-ink-muted)',
             }}
           >
             {sublabel}
           </div>
         ) : null}
       </div>
     );
   }
   