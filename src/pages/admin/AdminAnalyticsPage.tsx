

import type { Member, Contribution, RequestRecord } from '@/types';

const REQ_TYPE: Record<string, string> = { TRANSFER: 'Transfer', PROMOTION: 'Promotion', RESIGNATION: 'Resignation', COMPLAINT: 'Complaint', SUGGESTION: 'Suggestion', LEAVE: 'Leave' };
const REQ_STATUS: Record<string, string> = { PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled', COMPLETED: 'Completed' };
const CONTRIB_STATUS: Record<string, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

export function AdminAnalyticsPage() {
  const { data: liveMembers, loading: lM } = useCollection<Member>('members');
  const { data: contributions, loading: lC } = useCollection<Contribution>('contributions');
  const { data: requests, loading: lR } = useCollection<RequestRecord>('requests');
  if (lM || lC || lR) return <Loading fullHeight message="Loading analytics..." />;
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
      <PageHeader eyebrow="Admin" title="Analytics" description="Overview of all organization data." />
      <section className="section">
        <SectionHeader eyebrow="Teams" title="Team Points" />
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
        <SectionHeader eyebrow="Committees" title="Committee Points" />
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
        <SectionHeader eyebrow="Requests" title="By Status" />
        <div className="grid grid--narrow">
          {Object.entries(statusCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{REQ_STATUS[k] ?? k}</div>
              <div style={{ fontSize: '1.8rem', color: 'var(--c-navy)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Requests" title="By Type" />
        <div className="grid grid--narrow">
          {Object.entries(typeCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{REQ_TYPE[k] ?? k}</div>
              <div style={{ fontSize: '1.8rem', color: 'var(--c-red)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Contributions" title="By Status" />
        <div className="grid grid--narrow">
          {Object.entries(contribCounts).map(([k, v]) => (
            <div key={k} className="card no-click">
              <div className="card__meta">{CONTRIB_STATUS[k] ?? k}</div>
              <div style={{ fontSize: '1.8rem', color: 'var(--c-navy)', marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}