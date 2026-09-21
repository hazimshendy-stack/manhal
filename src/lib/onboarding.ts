const ONBOARDING_KEY = 'sbapiaryy-onboarding-v5.1';
   const FIRST_CONTRIBUTION_KEY = 'sbapiaryy-first-contribution-shown';

   export function hasCompletedOnboarding(): boolean {
     if (typeof window === 'undefined') return true;
     return localStorage.getItem(ONBOARDING_KEY) === 'done';
   }

   export function markOnboardingComplete(): void {
     if (typeof window === 'undefined') return;
     localStorage.setItem(ONBOARDING_KEY, 'done');
   }

   export function resetOnboarding(): void {
     if (typeof window === 'undefined') return;
     localStorage.removeItem(ONBOARDING_KEY);
   }

   /* ═══════════════════════════════════════════════════════════════
      رحلة البداية — تختفي بعد أول مشاركة
      ═══════════════════════════════════════════════════════════════ */

   export function hasSeenFirstContribution(): boolean {
     if (typeof window === 'undefined') return true;
     return localStorage.getItem(FIRST_CONTRIBUTION_KEY) === 'yes';
   }

   export function markFirstContributionSeen(): void {
     if (typeof window === 'undefined') return;
     localStorage.setItem(FIRST_CONTRIBUTION_KEY, 'yes');
   }
   