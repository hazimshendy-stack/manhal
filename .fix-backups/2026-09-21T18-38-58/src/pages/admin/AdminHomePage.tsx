import { Link } from 'react-router-dom';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { seedAll, type SeedResult } from '@/lib/seed';
import { members } from '@/data/members';
import { committees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat } from '@/components/ui/Stat';
import { toast } from '@/components/ui/Toast';
import type {
  AppUser, RequestRecord, Contribution, Notification, Member,
} from '@/types';

interface AdminCard {
  to: string;
  title: string;
  count?: number;
  description: string;
}

export function AdminHomePage() {
  const { user } = useAuth();
  const { data: users } = useRealtimeCollection<AppUser>('users');
  const { data: liveMembers } = useRealtimeCollection<Member>('members');
  const { data: requests } = useRealtimeCollection<RequestRecord>('requests');
  const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');

  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const allMembers = liveMembers.length > 0 ? liveMembers : members;
  const pendingReq = requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
  const pendingContribs = contributions.filter((c) => c.status === 'pending').length;
  const totalPoints = allMembers.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);

  const onSeed = async () => {
    if (!window.confirm('سيتم رفع البيانات الأساسية. متابعة؟')) return;
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
    { to: '/admin/analytics', title: 'التحليلات', description: 'نظرة شاملة على الإحصائيات' },
    { to: '/admin/requests', title: 'الطلبات', count: pendingReq, description: 'إدارة كل الطلبات' },
    { to: '/admin/users', title: 'المستخدمون', count: users.length, description: 'الحسابات والأدوار' },
    { to: '/admin/members', title: 'الأعضاء', count: allMembers.length, description: 'إدارة بيانات الأعضاء' },
    { to: '/admin/contributions', title: 'المشاركات', count: pendingContribs, description: 'اعتماد مشاركات الأعضاء' },
    { to: '/admin/committees', title: 'اللجان', count: committees.length, description: 'إدارة اللجان' },
    { to: '/admin/achievements', title: 'الإنجازات', description: 'إدارة الإنجازات' },
    { to: '/admin/warnings', title: 'التحذيرات', description: 'إصدار ومتابعة التحذيرات' },
    { to: '/admin/calendar', title: 'التقويم', description: 'إدارة الأحداث' },
    { to: '/admin/conversations', title: 'المحادثات', description: 'إدارة المحادثات' },
    { to: '/admin/notifications', title: 'إرسال إشعار', count: notifs.length, description: 'إشعارات جماعية' },
    { to: '/admin/governance', title: 'الحوكمة', description: 'السياسات واللوائح' },
    { to: '/admin/audit', title: 'سجل التغييرات', description: 'تتبع كل الإجراءات' },
  ];

  return (
    <div className="admin-page">
      {/* ═══ Welcome ═══ */}
      <section className="admin-welcome">
        <div className="admin-welcome__eyebrow">لوحة الإدارة</div>
        <h1 className="admin-welcome__name">
          مرحبًا، {user?.displayName || 'أيها المدير'}
        </h1>
        <p className="admin-welcome__subtitle">
          تحكم كامل بالمحتوى والأعضاء والطلبات. كل شيء من مكان واحد.
        </p>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="admin-stats">
        <Stat value={users.length} label="المستخدمون" />
        <Stat value={allMembers.length} label="الأعضاء" />
        <Stat value={pendingReq} label="طلبات معلّقة" variant="red" />
        <Stat value={pendingContribs} label="مشاركات معلّقة" variant="amber" />
        <Stat value={totalPoints} label="مجموع النقاط" />
        <Stat value={notifs.length} label="الإشعارات" />
      </section>

      {/* ═══ Seed ═══ */}
      <section className="admin-seed">
        <div className="admin-seed__head">
          <div>
            <div className="admin-card__title">رفع البيانات الأساسية</div>
            <div className="admin-card__desc">
              لمرة واحدة فقط — إن كانت Firestore فارغة.
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onSeed}
            disabled={seeding}
          >
            {seeding ? 'جارٍ الرفع...' : 'رفع البيانات'}
          </button>
        </div>
        {result ? (
          <div className="admin-seed__result">
            ✓ تم الرفع — أعضاء: {result.members} · فرق: {result.teams} ·
            مشاركات: {result.contributions} · طلبات: {result.requests} ·
            موافقات: {result.approvals} · تحذيرات: {result.warnings} ·
            إنجازات: {result.achievements} · إشعارات: {result.notifications} ·
            محادثات: {result.conversations} · رسائل: {result.messages}
          </div>
        ) : null}
      </section>

      {/* ═══ Quick Links ═══ */}
      <section style={{ marginTop: 32 }}>
        <SectionHeader eyebrow="الأقسام" title="روابط سريعة" />
        <div className="admin-cards">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="admin-card">
              <div className="admin-card__head">
                <div className="admin-card__title">{c.title}</div>
                {c.count !== undefined && c.count > 0 ? (
                  <span className="admin-card__count">{c.count > 99 ? '99+' : c.count}</span>
                ) : null}
              </div>
              <div className="admin-card__desc">{c.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
