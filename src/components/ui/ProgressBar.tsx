interface ProgressBarProps { percent: number; label?: string; color?: string; }
   export function ProgressBar({ percent, label, color = 'var(--c-red)' }: ProgressBarProps) {
     const safe = Math.max(0, Math.min(100, percent));
     return (
       <div>
         {label ? <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}><span>{label}</span><span style={{ color: 'var(--c-red)' }}>{safe}%</span></div> : null}
         <div style={{ height: 10, background: 'var(--c-line)', borderRadius: 999, overflow: 'hidden' }}>
           <div style={{ width: safe + '%', height: '100%', background: color, transition: 'width 0.4s ease' }} />
         </div>
       </div>
     );
   }
   