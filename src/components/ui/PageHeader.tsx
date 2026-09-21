import type { ReactNode } from 'react';

   interface PageHeaderProps {
     eyebrow?: string;
     title: string;
     description?: string;
     children?: ReactNode;
   }

   export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
     return (
       <header className="section section--tight">
         {eyebrow ? <div className="section-head__eyebrow">{eyebrow}</div> : null}
         <h1>{title}</h1>
         {description ? (
           <p className="hero__desc" style={{ marginTop: 12 }}>
             {description}
           </p>
         ) : null}
         {children}
       </header>
     );
   }
   