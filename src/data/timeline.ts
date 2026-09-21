import type { TimelineEvent } from '@/types';

 export const timeline: TimelineEvent[] = [
   { id: 'T001', memberId: 'M001', memberName: 'ياسين عبد الرحمن', type: 'join', title: 'انضم إلى المنظمة', date: '2021-09-01' },
   { id: 'T002', memberId: 'M001', memberName: 'ياسين عبد الرحمن', type: 'promotion', title: 'ترقية إلى رئيس الفروع', date: '2025-09-01' },
   { id: 'T003', memberId: 'M002', memberName: 'ملك هشام', type: 'join', title: 'انضم إلى فريق المبرمجين', date: '2021-09-01' },
   { id: 'T004', memberId: 'M009', memberName: 'فريدة نبيل', type: 'join', title: 'انضم إلى فريق المبرمجين', date: '2025-09-01' },
   { id: 'T005', memberId: 'M009', memberName: 'فريدة نبيل', type: 'contribution', title: 'مكتبة المكونات', date: '2026-01-22', relatedId: 'C009' },
   { id: 'T006', memberId: 'M010', memberName: 'يوسف أشرف', type: 'warning', title: 'تحذير كتابي', date: '2026-03-20', relatedId: 'WARN002' },
 ];
 