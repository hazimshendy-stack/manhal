import type { WarningRecord } from '@/types';

 export const warnings: WarningRecord[] = [
   {
     id: 'WARN001',
     memberId: 'M015',
     memberName: 'منة الله سامي',
     type: 'VERBAL',
     reason: 'غياب متكرر عن الاجتماعات الأسبوعية',
     severity: 'LOW',
     issuedByMemberId: 'M006',
     issuedByName: 'هنا مصطفى',
     issuedAt: '2026-02-01',
     status: 'resolved',
     notes: 'تم التحسن بعد الملاحظة الشفهية.',
   },
   {
     id: 'WARN002',
     memberId: 'M010',
     memberName: 'يوسف أشرف',
     type: 'WRITTEN',
     reason: 'تأخر عن تسليم تقرير ميداني',
     severity: 'MEDIUM',
     issuedByMemberId: 'M004',
     issuedByName: 'عمر خالد',
     issuedAt: '2026-03-20',
     status: 'active',
     notes: 'تم التنبيه كتابيًا، بانتظار التحسن.',
   },
 ];
 