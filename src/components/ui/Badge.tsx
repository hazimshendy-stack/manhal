import type { ReactNode } from 'react';
   import { cx } from '@/lib/format';

   type Variant =
     | 'success'
     | 'warning'
     | 'danger'
     | 'info'
     | 'purple'
     | 'neutral'
     | 'navy'
     | 'red';

   interface BadgeProps {
     children: ReactNode;
     variant?: Variant;
     dot?: boolean;
     className?: string;
   }

   export function Badge({ children, variant, dot, className }: BadgeProps) {
     const cls = variant ? 'badge--' + variant : '';
     return (
       <span className={cx('badge', cls, className)}>
         {dot ? <span className="badge__dot" /> : null}
         {children}
       </span>
     );
   }
   