import type { ReactNode } from 'react';

   interface StatProps {
     value: number | string;
     label: string;
     variant?: 'red' | 'success' | 'amber';
   }

   export function Stat({ value, label, variant }: StatProps) {
     const className = 'stat' + (variant ? ' stat--' + variant : '');
     return (
       <div className={className}>
         <div className="stat__value">{value}</div>
         <div className="stat__label">{label}</div>
       </div>
     );
   }

   export function StatRow({ children }: { children: ReactNode }) {
     return <div className="stat-row">{children}</div>;
   }
   