import type { OnboardingCard } from '@/types';

/**
 * Flash Cards — بدون أيقونات
 */
export const onboardingCards: OnboardingCard[] = [
  {
    id: 'welcome',
    icon: '',
    title: 'أهلاً بك في sbapiaryy',
    description: 'منصة فروع Resala STEM — كل ما تحتاجه في مكان واحد: الأعضاء، الفرق، المشاركات، الطلبات، والإنجازات.',
    accentColor: '#C1272D',
    order: 1,
  },
  {
    id: 'teams',
    icon: '',
    title: 'سبع فرق متخصصة',
    description: 'Helpers · Heroes · Coders · Enviros · Messages · Masar · RSTC',
    accentColor: '#60A5FA',
    order: 2,
  },
  {
    id: 'contributions',
    icon: '',
    title: 'سجّل ساعاتك',
    description: 'كل ساعة عمل موثقة ومعتمدة = 5 نقاط. سجّل مشاركاتك واحصل على اعتماد رئيس فريقك.',
    accentColor: '#16A34A',
    order: 3,
  },
  {
    id: 'league',
    icon: '',
    title: 'الليج والتنافس',
    description: 'ترتيبك على مستوى الفريق، اللجنة، والمنظمة. تابع تقدمك ونافس بقية الأعضاء.',
    accentColor: '#F59E0B',
    order: 4,
  },
  {
    id: 'requests',
    icon: '',
    title: 'الطلبات والموافقات',
    description: 'اطلب نقلًا، ترقية، إجازة، أو ارفع شكوى. سلسلة موافقات واضحة وتتابعها لحظيًا.',
    accentColor: '#A78BFA',
    order: 5,
  },
  {
    id: 'messages',
    icon: '',
    title: 'محادثات لحظية',
    description: 'تواصل مع فريقك، الإدارة، أو في المحادثة العامة — كل ذلك داخل المنصة.',
    accentColor: '#EC4899',
    order: 6,
  },
  {
    id: 'calendar',
    icon: '',
    title: 'تقويم مشترك',
    description: 'كل الأحداث والاجتماعات والمواعيد النهائية في مكان واحد.',
    accentColor: '#22D3EE',
    order: 7,
  },
  {
    id: 'pwa',
    icon: '',
    title: 'ثبّت التطبيق',
    description: 'أضف sbapiaryy إلى شاشة هاتفك واستخدمه كتطبيق أصلي بدون شريط المتصفح.',
    accentColor: '#C1272D',
    order: 8,
  },
];
