
import { Avatar } from '@/components/ui/Avatar';
import { cx } from '@/lib/format';
interface AvatarProps { name?: string; size?: number; variant?: 'navy' | 'red' | 'gradient' | 'light'; src?: string; }
   const BG: Record<string, string> = { navy: 'var(--c-navy)', red: 'var(--c-red)', gradient: 'linear-gradient(150deg, var(--c-red), var(--c-red-soft))', light: 'var(--c-off-white)' };
   export function Avatar({ name, size = 44, variant = 'navy', src }: AvatarProps) {
     if (src) return <img src={src} alt={name ?? ''} width={size} height={size} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
     return (
       <div aria-label={name ?? 'Member'} title={name} style={{
         width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center',
         background: BG[variant], color: variant === 'light' ? 'var(--c-navy)' : '#fff', flexShrink: 0,
       }}>
         <svg width={Math.round(size * 0.5)} height={Math.round(size * 0.5)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
           <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
         </svg>
       </div>
     );
   }
   