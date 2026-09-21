import { Link } from 'react-router-dom';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { seedAll, type SeedResult } from '@/lib/seed';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints } from '@/lib/format';
   import { useState } from 'react';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { toast } from '@/components/ui/Toast';
   import type {
     AppUser,
     RequestRecord,
     Contribution,
     Notification,
     Member,
   } from '@/types';

   interface AdminCard {
     to: string;
     title: string;
     icon: string;
     count?: number;
     description: string;
   }

   export function AdminHomePage() {
     const { data: users } = useRealtimeCollection<AppUser>('users');
     const { data: liveMembers } = useRealtimeCollection<Member>('members');
     const { data: requests } = useRealtimeCollection<RequestRecord>('requests');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');

     const [seeding, setSeeding] = useState(false);
     const [result, setResult] = useState<SeedResult | null>(null);

     const allMembers = liveMembers.length > 0 ? liveMembers : members;

     const pendingReq = requests.filter(
       (r) => r.status === 'PENDING' || r.status === 'IN_REVIEW',
     ).length;

     const pendingContribs = contributions.filter(
       (c) => c.status === 'pending',
     ).length;

     const totalPoints = allMembers.reduce(
       (s, m) => s + hoursToPoints(m.hours || 0),
       0,
     );

     const onSeed = async () => {
       if (!window.confirm('سيتم رفع البيانات الأساسية إلى Firestore. متابعة؟')) {
         return;
       }
       setSeeding(true);
       try {
         const r = await seedAll();
         setResult(r);
         toast.success('تم رفع البيانات بنجاح');
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل الرفع';
         toast.error('فشل الرفع', msg);
       } finally {
         setSeeding(false);
       }
     };

     const cards: AdminCard[] = [
       {
         to: '/admin/analytics',
         title: 'التحليلات',
         icon: '📊',
         description: 'نظرة شاملة على الإحصائيات',
       },
       {
         to: '/admin/requests',
         title: 'الطلبات',
         icon: '📋',
         count: pendingReq,
         description: 'إدارة كل الطلبات',
       },
       {
         to: '/admin/users',
         title: 'المستخدمون',
         icon: '👤',
         count: users.length,
         description: 'الحسابات والأدوار',
       },
       {
         to: '/admin/members',
         title: 'الأعضاء',
         icon: '👥',
         count: allMembers.length,
         description: 'إدارة بيانات الأعضاء',
       },
       {
         to: '/admin/contributions',
         title: 'المشاركات',
         icon: '📝',
         count: pendingContribs,
         description: 'اعتماد مشاركات الأعضاء',
       },
       {
         to: '/admin/committees',
         title: 'اللجان',
         icon: '🏛️',
         count: committees.length,
         description: 'إدارة اللجان وتوزيع الأعضاء',
       },
       {
         to: '/admin/achievements',
         title: 'الإنجازات',
         icon: '🏆',
         description: 'إدارة الإنجازات',
       },
       {
         to: '/admin/warnings',
         title: 'التحذيرات',
         icon: '⚠️',
         description: 'إصدار ومتابعة التحذيرات',
       },
       {
         to: '/admin/calendar',
         title: 'التقويم',
         icon: '📅',
         description: 'إدارة الأحداث',
       },
       {
         to: '/admin/conversations',
         title: 'المحادثات',
         icon: '💬',
         description: 'إدارة المحادثات الجماعية',
       },
       {
         to: '/admin/notifications',
         title: 'إرسال إشعار',
         icon: '🔔',
         count: notifs.length,
         description: 'إرسال إشعارات جماعية',
       },
       {
         to: '/admin/audit',
         title: 'سجل التغييرات',
         icon: '📜',
         description: 'تتبع كل الإجراءات',
       },
     ];

     return (
       <div>
         <PageHeader
           eyebrow="لوحة الإدارة"
           title="مرحبًا"
           description="تحكم كامل بالمحتوى والأعضاء والطلبات."
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={users.length} label="المستخدمون" />
             <Stat value={allMembers.length} label="الأعضاء" />
             <Stat value={pendingReq} label="طلبات معلّقة" variant="red" />
             <Stat value={pendingContribs} label="مشاركات معلّقة" variant="amber" />
             <Stat value={totalPoints} label="مجموع النقاط" />
             <Stat value={notifs.length} label="الإشعارات" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader
             eyebrow="التهيئة"
             title="رفع البيانات الأساسية"
             description="لمرة واحدة فقط — إن كانت Firestore فارغة."
             action={
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={onSeed}
                 disabled={seeding}
               >
                 {seeding ? 'جارٍ الرفع...' : 'رفع البيانات'}
               </button>
             }
           />
           {result ? (
             <div className="card no-click mt-4">
               <div className="card__title">✓ تم الرفع بنجاح</div>
               <div
                 className="small muted mt-2"
                 style={{ lineHeight: 1.9 }}
               >
                 أعضاء: {result.members} · فرق: {result.teams} · مشاركات: {result.contributions} ·
                 طلبات: {result.requests} · موافقات: {result.approvals} · تحذيرات: {result.warnings} ·
                 إنجازات: {result.achievements} · إشعارات: {result.notifications} ·
                 محادثات: {result.conversations} · رسائل: {result.messages}
               </div>
             </div>
           ) : null}
         </section>

         <section className="section">
           <SectionHeader eyebrow="الأقسام" title="روابط سريعة" />
           <div className="grid grid--wide">
             {cards.map((c) => (
               <Link key={c.to} to={c.to} className="card">
                 <div className="row row--between">
                   <div className="row" style={{ gap: 10 }}>
                     <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                     <div className="card__title">{c.title}</div>
                   </div>
                   {c.count !== undefined && c.count > 0 ? (
                     <span className="badge badge--red">{c.count}</span>
                   ) : null}
                 </div>
                 <div className="card__meta mt-2">{c.description}</div>
               </Link>
             ))}
           </div>
         </section>
       </div>
     );
   }
   