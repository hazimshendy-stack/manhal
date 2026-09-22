import type { SiteConfig, Season } from '@/types';

   export const site: SiteConfig = {
     name: 'Manhal',
     tagline: 'Resala STEM Sub Branches — Season 7',
     description: 'Manhal — the official platform for Resala STEM Sub Branches',
     organization: 'Resala STEM',
     email: 'hello@resala-stem.org',
   };

   export const seasons: Season[] = [
     { id: 'S7', label: 'Season 7', labelEn: 'Season 7', start: '2025-09-01', end: '2026-06-30', isActive: true,  theme: 'Build. Teach. Give.' },
     { id: 'S6', label: 'Season 6', labelEn: 'Season 6', start: '2024-09-01', end: '2025-06-30', isActive: false, theme: 'Reach further.' },
   ];

   export const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];
   