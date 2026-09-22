import { useEffect, useState } from 'react';
   import { onboardingCards, site } from '@/data';
   import { hasCompletedOnboarding, markOnboardingComplete } from '@/lib/onboarding';

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
           <img
             src="./logo.png"
             alt={site.name}
             className="onboarding-header__logo-img"
             onError={(e) => {
               (e.currentTarget as HTMLImageElement).style.display = 'none';
             }}
           />
           <div className="onboarding-header__title">Welcome to {site.name}</div>
           <div className="onboarding-header__subtitle">
             Learn about the platform in one minute
           </div>
         </div>

         <div className="onboarding-body">
           <div className="onboarding-grid">
             {sorted.map((card) => (
               <div key={card.id} className="onboarding-card">
                 <div className="onboarding-card__title">{card.title}</div>
                 <div className="onboarding-card__desc">{card.description}</div>
               </div>
             ))}
           </div>
         </div>

         <div className="onboarding-footer">
           <button type="button" className="onboarding-cta" onClick={finish}>
             Got it, let's start
           </button>
         </div>
       </div>
     );
   }
   