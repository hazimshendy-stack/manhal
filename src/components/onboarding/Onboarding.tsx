import { useEffect, useState } from 'react';
   import { onboardingCards } from '@/data';
   import {
     hasCompletedOnboarding,
     markOnboardingComplete,
   } from '@/lib/onboarding';
   import { site } from '@/data';

   export function Onboarding() {
     const [visible, setVisible] = useState(false);

     useEffect(() => {
       if (!hasCompletedOnboarding()) {
         setVisible(true);
         document.body.style.overflow = 'hidden';
       }
       return () => {
         document.body.style.overflow = '';
       };
     }, []);

     const finish = () => {
       markOnboardingComplete();
       setVisible(false);
       document.body.style.overflow = '';
     };

     if (!visible) return null;

     const sorted = [...onboardingCards].sort((a, b) => a.order - b.order);

     return (
       <div className="onboarding-backdrop" role="dialog" aria-modal="true">
         <div className="onboarding-header">
           <div className="onboarding-header__logo">S</div>
           <div className="onboarding-header__title">أهلاً في {site.name}</div>
           <div className="onboarding-header__subtitle">
             تعرّف على المنصة في دقيقة واحدة
           </div>
         </div>

         <div className="onboarding-body">
           <div className="onboarding-grid">
             {sorted.map((card) => (
               <div key={card.id} className="onboarding-card">
                 <div
                   className="onboarding-card__icon"
                   style={{ background: card.accentColor + '22', borderColor: card.accentColor + '55' }}
                 >
                   {card.icon}
                 </div>
                 <div className="onboarding-card__title">{card.title}</div>
                 <div className="onboarding-card__desc">{card.description}</div>
               </div>
             ))}
           </div>
         </div>

         <div className="onboarding-footer">
           <button type="button" className="onboarding-cta" onClick={finish}>
             فهمت، لنبدأ
           </button>
         </div>
       </div>
     );
   }
   