interface LoadingProps {
     message?: string;
     fullHeight?: boolean;
   }

   export function Loading({ message = 'جارٍ التحميل...', fullHeight = false }: LoadingProps) {
     return (
       <div className="loading-screen" style={fullHeight ? { minHeight: '60vh' } : undefined}>
         <div className="loading-spinner" />
         <div>{message}</div>
       </div>
     );
   }

   /* Skeleton Components */

   interface SkeletonCardProps {
     count?: number;
   }

   export function SkeletonCard({ count = 3 }: SkeletonCardProps) {
     return (
       <>
         {Array.from({ length: count }).map((_, i) => (
           <div key={i} className="card no-click" style={{ pointerEvents: 'none' }}>
             <div className="skeleton skeleton--title" />
             <div className="skeleton skeleton--text" />
             <div className="skeleton skeleton--text" style={{ width: '70%' }} />
           </div>
         ))}
       </>
     );
   }

   export function SkeletonList({ count = 5 }: SkeletonCardProps) {
     return (
       <div className="stack">
         {Array.from({ length: count }).map((_, i) => (
           <div
             key={i}
             className="card no-click"
             style={{ pointerEvents: 'none', display: 'flex', gap: 12, alignItems: 'center' }}
           >
             <div className="skeleton skeleton--avatar" />
             <div style={{ flex: 1 }}>
               <div className="skeleton skeleton--text" style={{ width: '60%' }} />
               <div className="skeleton skeleton--text" style={{ width: '40%' }} />
             </div>
           </div>
         ))}
       </div>
     );
   }
   