import type { OnboardingCard } from '@/types';

 export const onboardingCards: OnboardingCard[] = [
   {
     id: 'welcome',
     icon: '👋',
     title: 'أهلاً بك في sbapiaryy',
     description: 'منصة فروع Resala STEM لمتابعة كل شيء في مكان واحد — الأعضاء، الفرق، المشاركات، الطلبات، والإنجازات.',
     accentColor: '#C1272D',
     order: 1,
   },
   {
     id: 'teams',
     icon: '🏆',
     title: 'سبع فرق متخصصة',
     description: 'كل فريق له مجال واحد واضح: المساعدون، الأبطال، المبرمجون، البيئة، الرسائل، مسار، ومركز التدريب.',
     accentColor: '#60A5FA',
     order: 2,
   },
   {
     id: 'contributions',
     icon: '📊',
     title: 'شارك وسجّل ساعاتك',
     description: 'كل ساعة عمل موثقة = 5 نقاط. سجّل مشاركاتك واحصل على موافقة رئيس فريقك وموارد البشرية.',
     accentColor: '#16A34A',
     order: 3,
   },
   {
     id: 'league',
     icon: '🥇',
     title: 'الليج والتنافس',
     description: 'ترتيبك على مستوى الفريق، اللجنة، والمنظمة كلها. تابع تقدمك وتنافس مع الأعضاء.',
     accentColor: '#F59E0B',
     order: 4,
   },
   {
     id: 'requests',
     icon: '📋',
     title: 'الطلبات والموافقات',
     description: 'اطلب نقلًا، ترقية، إجازة، أو ارفع شكوى. يمر الطلب بسلسلة موافقات واضحة وتتابعه لحظيًا.',
     accentColor: '#A78BFA',
     order: 5,
   },
   {
     id: 'messages',
     icon: '💬',
     title: 'محادثات لحظية',
     description: 'تواصل مع فريقك، مع الإدارة، أو في المحادثة العامة — كل شيء داخل المنصة.',
     accentColor: '#EC4899',
     order: 6,
   },
   {
     id: 'calendar',
     icon: '📅',
     title: 'تقويم مشترك',
     description: 'كل الأحداث والاجتماعات والمواعيد النهائية في مكان واحد. زامنها مع Google Calendar.',
     accentColor: '#22D3EE',
     order: 7,
   },
   {
     id: 'pwa',
     icon: '📱',
     title: 'ثبّت التطبيق',
     description: 'أضف sbapiaryy إلى شاشة هاتفك الرئيسية واستخدمه كتطبيق أصلي — بدون شريط المتصفح.',
     accentColor: '#C1272D',
     order: 8,
   },
 ];
 