import type { ReactNode } from 'react';

   interface SectionHeaderProps {
     eyebrow?: string;
     title: string;
     description?: string;
     action?: ReactNode;
   }

   export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
     return (
       <div className="section-head">
         <div>
           {eyebrow ? <div className="section-head__eyebrow">{eyebrow}</div> : null}
           <h2>{title}</h2>
           {description ? <p className="section-head__desc">{description}</p> : null}
         </div>
         {action}
       </div>
     );
   }
   