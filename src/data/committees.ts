import type { Committee } from '@/types';

 export const committees: Committee[] = [
   {
     id: 'governance',
     name: 'Governance',
     nameAr: 'لجنة الحوكمة',
     description: 'السياسات واللوائح الرسمية',
     color: '#151A45',
     icon: '⚖️',
   },
   {
     id: 'events',
     name: 'Events',
     nameAr: 'لجنة الفعاليات',
     description: 'تنظيم الفعاليات الكبرى',
     color: '#C1272D',
     icon: '🎯',
   },
   {
     id: 'media',
     name: 'Media',
     nameAr: 'لجنة الإعلام',
     description: 'المحتوى البصري والمحتوى الرقمي',
     color: '#A78BFA',
     icon: '📸',
   },
   {
     id: 'quality',
     name: 'Quality',
     nameAr: 'لجنة الجودة',
     description: 'ضمان جودة البرامج والأنشطة',
     color: '#16A34A',
     icon: '✅',
   },
   {
     id: 'planning',
     name: 'Planning',
     nameAr: 'لجنة التخطيط',
     description: 'التخطيط الاستراتيجي والموازنات',
     color: '#60A5FA',
     icon: '📊',
   },
 ];
 