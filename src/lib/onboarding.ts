const ONBOARDING_KEY = 'sbapiaryy-onboarding-v6';

   export function hasCompletedOnboarding(): boolean {
     if (typeof window === 'undefined') return true;
     return localStorage.getItem(ONBOARDING_KEY) === 'done';
   }
   export function markOnboardingComplete(): void {
     if (typeof window === 'undefined') return;
     localStorage.setItem(ONBOARDING_KEY, 'done');
   }
   