import type { OnboardingCard } from '@/types';

   export const onboardingCards: OnboardingCard[] = [
     { id: 'welcome', icon: '', title: 'Welcome to Manhal', description: 'The platform for Resala STEM Sub Branches — members, teams, committees, contributions, requests, and achievements in one place.', accentColor: '#C1272D', order: 1 },
     { id: 'teams', icon: '', title: 'Seven Specialized Teams', description: 'Helpers · Heroes · Coders · Enviros · Messages · Masar · RSTC', accentColor: '#60A5FA', order: 2 },
     { id: 'committees', icon: '', title: 'Committees Matter', description: 'Every member belongs to at least one committee. Committees have their own HR and rankings.', accentColor: '#16A34A', order: 3 },
     { id: 'contributions', icon: '', title: 'Flexible Point Approval', description: 'Log a contribution. Committee HR reviews and assigns points fairly.', accentColor: '#F59E0B', order: 4 },
     { id: 'league', icon: '', title: 'League & Ranking', description: 'Track your rank on team, committee, and global levels.', accentColor: '#A78BFA', order: 5 },
   ];
   