import { useCollection } from '@/lib/useRealtimeCollection';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { hoursToPoints } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Loading } from '@/components/ui/Loading';
import type { Member, Contribution, RequestRecord } from '@/types';

const REQ_TYPE_AR: Record<string, string> = { TRANSFER: 'نقل', PROMOTION: 'ترقية', RESIGNATION: 'استقالة', COMPLAINT: 'شكوى', SUGGESTION: 'اقتراح', LEAVE: 'إجازة' };
const REQ_STATUS_AR: Record<string, string> = { PENDING: 'قيد الانتظار', IN_REVIEW: 'قيد المراجعة', APPROVED: 'معتمد', REJECTED: 'مرفوض', CANCELLED: 'ملغى', COMPLETED: 'مكتمل' };
const CONTRIB_STATUS_AR: Record<string, string> = { pending: 'معلّقة', approved: 'معتمدة', rejected: 'مرفوضة' };

export function AdminAnalyticsPage() {
  const { data: liveMembers, loading: lM } = useCollection<Member>('members');
  const { data: contributions, loading: lC } = useCollection<Contribution>('contributions');
  const { data: requests, loading: lR } = useCollection<RequestRecord>('requests');

  if (lM || lC || lR) return <Loading fullHeight message="جارٍ التحميل..." />;

  const allMembers = liveMembers.length > 0 ? liveMembers : members;
  const teamStats = teams.map((t) => {
    const tm = allMembers.filter((m) => m.teamIds.includes(t.id));
    return { team: t, points: tm.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0) };
  }).sort((a, b) => b.points - a.points);

  const committeeStats = committees.map((c) => {
    const cm = allMembers.filter((m) => m.committeeIds.includes(c.id));
    return { committee: c, points: cm.reduce((s, m) => s + hoursToPoints(m.hours || 0), 0) };
  }).sort((a, b) => b.points - a.points);

  const maxT = Math.max(1, ...teamStats.map((s) => s.points));
  const maxC = Math.max(1, ...committeeStats.map((s) => s.points));

  const statusCounts: Record<string, number> = {};
  requests.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
  const typeCounts: Record<string, number> = {};
  requests.forEach((r) => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1; });
  const contribCounts: Record<string, number> = {};
  contributions.forEach((c) => { contribCounts[c.status] = (contribCounts[c.status] || 0) + 1; });

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="التحليلات" description="نظرة شاملة على البيانات." />

      <section className="section">
        <SectionHeader eyebrow="الفرق" title="نقاط الفرق" />
        <div className="card no-click">
          {teamStats.map((s) => (
            <div key={s.team.id} className="chart-row">
              <span>{s.team.name}</span>
              <div className="chart-bar" style={{ width: Math.round((s.points / maxT) * 100) + '%' }} />
              <span style={{ color: 'var(--c-navy)' }}>{s.points}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="اللجان" title="نقاط اللجان" />
        <div className="card no-click">
          {committeeStats.map((s) => (
            <div key={s.committee.id} className="chart-row">
              <span>{s.committee.nameAr}</span>
              <div className="chart-bar chart-bar--red" style={{ width: Math.round((s.points / maxC) * 100) + '%' }} />
              <span style={{ color: 'var(--c-red)' }}>{s.points}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="الطلبات" title="حسب الحالة" />
        <div className="grid grid--narrow">
          {Object.entries(statusCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{REQ_STATUS_AR[k] ?? k}</div>
              <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-navy)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="الطلبات" title="حسب النوع" />
        <div className="grid grid--narrow">
          {Object.entries(typeCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{REQ_TYPE_AR[k] ?? k}</div>
              <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-red)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="المشاركات" title="حسب الحالة" />
        <div className="grid grid--narrow">
          {Object.entries(contribCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{CONTRIB_STATUS_AR[k] ?? k}</div>
              <div style={{ fontFamily: 'var(--font-en)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-navy)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
