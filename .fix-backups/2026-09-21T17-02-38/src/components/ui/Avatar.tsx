import { initials } from '@/lib/format';

   interface AvatarProps {
     name: string;
     size?: number;
     variant?: 'navy' | 'red' | 'gradient';
   }

   const BG_COLORS: Record<string, string> = {
     navy: 'var(--c-navy)',
     red: 'var(--c-red)',
     gradient: 'linear-gradient(150deg, var(--c-red), var(--c-red-soft))',
   };

   export function Avatar({ name, size = 44, variant = 'navy' }: AvatarProps) {
     return (
       <div
         style={{
           width: size,
           height: size,
           borderRadius: '50%',
           display: 'grid',
           placeItems: 'center',
           fontFamily: 'var(--font-en)',
           fontWeight: 800,
           fontSize: Math.max(10, Math.round(size * 0.36)),
           color: '#fff',
           background: BG_COLORS[variant],
           flexShrink: 0,
           border: '1px solid rgba(255,255,255,0.1)',
           userSelect: 'none',
         }}
         aria-hidden="true"
       >
         {initials(name)}
       </div>
     );
   }
   