import type { SiteConfig, Season } from '@/types';

 export const site: SiteConfig = {
   name: 'sbapiaryy',
   tagline: 'Resala STEM Sub Branches — الموسم السابع',
   description: 'المنصة الرسمية لمتابعة Resala STEM Sub Branches',
   organization: 'Resala STEM',
   email: 'hello@resala-stem.org',
 };

 export const seasons: Season[] = [
   {
     id: 'S7',
     label: 'الموسم السابع',
     labelEn: 'Season 7',
     start: '2025-09-01',
     end: '2026-06-30',
     isActive: true,
     theme: 'نبني. نُعلّم. نعطي.',
   },
   {
     id: 'S6',
     label: 'الموسم السادس',
     labelEn: 'Season 6',
     start: '2024-09-01',
     end: '2025-06-30',
     isActive: false,
     theme: 'نصل أبعد.',
   },
 ];

 export const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];
 