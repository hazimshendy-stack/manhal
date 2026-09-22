// src/pages/admin/AdminAnalyticsPage.tsx
// Fix #7 — Expanded Admin Analytics. Realtime via useCollection.
import { useMemo } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { getTeamTotalPoints } from '@/lib/rankings';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Loading } from '@/components/ui/Loading';
import { Stat, StatRow } from '@/components/ui/Stat';
import { Badge } from '@/components/ui/Badge';
import {
  countByStatus,
  activeInactive,
  approvalRates,
  topContributors,
  activityLast30Days,
  monthlyTotals,
} from '@/lib/analytics';
import type { Member, Contribution, RequestRecord, Committee, Team } from '@/types';

/* ------------------------------- Tiny SVG charts ------------------------ */

function BarChart({ data, color = '#C1272D', max }: { data: Array<{ label: string; value: number }>; color?: string; max?: number }) {
  const peak = max ?? Math.max(1, ...data.map((d) => d.value));
  const W = 720, H = Math.max(80, data.length * 30);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img">
      {data.map((d, i) => {
        const y = i * 30 + 6;
        const w = Math.round((d.value / peak) * (W - 200));
        return (
          <g key={d.label + i}>
            <text x={0} y={y + 16} fontSize={12} fill="#334155">{d.label}</text>
            <rect x={140} y={y} width={Math.max(2, w)} height={20} rx={4} fill={color} opacity={0.85} />
            <text x={140 + Math.max(2, w) + 6} y={y + 15} fontSize={12} fill="#0F172A">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChart({ data, size = 220 }: { data: Array<{ label: string; value: number; color: string }>; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2;
  let acc = 0;
  const arcs = data.map((d) => {
    const start = (acc / total) * Math.PI * 2;
    acc += d.value;
    const end = (acc / total) * Math.PI * 2;
    const x1 = r + r * 0.9 * Math.cos(start - Math.PI / 2);
    const y1 = r + r * 0.9 * Math.sin(start - Math.PI / 2);
    const x2 = r + r * 0.9 * Math.cos(end - Math.PI / 2);
    const y2 = r + r * 0.9 * Math.sin(end - Math.PI / 2);
    const large = end - start > Math.PI ? 1 : 0;
    return { d: `M ${r} ${r} L ${x1} ${y1} A ${r * 0.9} ${r * 0.9} 0 ${large} 1 ${x2} ${y2} Z`, color: d.color, label: d.label, value: d.value };
  });
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img">
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} stroke="#fff" strokeWidth={1} />)}
      </svg>
      <ul className="small">
        {arcs.map((a, i) => (
          <li key={i}><span style={{ display: 'inline-block', width: 10, height: 10, background: a.color, marginRight: 6, borderRadius: 2 }} />{a.label}: {a.value}</li>
        ))}
      </ul>
    </div>
  );
}

function LineChart({ points, color = '#0F172A' }: { points: Array<{ x: string; y: number }>; color?: string }) {
  const W = 720, H = 220, pad = 30;
  const maxY = Math.max(1, ...points.map((p) => p.y));
  const step = points.length > 1 ? (W - pad * 2) / (points.length - 1) : 0;
  const path = points.map((p, i) => {
    const x = pad + i * step;
    const y = H - pad - (p.y / maxY) * (H - pad * 2);
    return (i === 0 ? 'M' : 'L') + ' ' + x + ' ' + y;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img">
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#E2E8F0" />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#E2E8F0" />
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
      {points.map((p, i) => {
        const x = pad + i * step;
        const y = H - pad - (p.y / maxY) * (H - pad * 2);
        return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
      })}
      {points.map((p, i) => i % 5 === 0 ? (
        <text key={'l' + i} x={pad + i * step} y={H - 10} fontSize={9} fill="#64748B" textAnchor="middle">{p.x.slice(5)}</text>
      ) : null)}
    </svg>
  );
}

/* --------------------------------- Page -------------------------------- */

const PALETTE = ['#C1272D', '#0F172A', '#60A5FA', '#16A34A', '#A78BFA', '#FB923C', '#22D3EE', '#0EA5E9', '#F472B6', '#64748B'];

export function AdminAnalyticsPage() {
  const { data: members, loading: lM } = useCollection<Member>('members');
  const { data: contributions, loading: lC } = useCollection<Contribution>('contributions');
  const { data: requests, loading: lR } = useCollection<RequestRecord>('requests');
  const { data: committees, loading: lCo } = useCollection<Committee>('committees');

  const view = useMemo(() => {
    const teamStats = teams
      .map((t: Team) => ({ team: t, points: getTeamTotalPoints(members, contributions, t.id) }))
      .sort((a, b) => b.points - a.points);

    const committeeStats = committees
      .map((c) => {
        const ids = new Set(members.filter((m) => Array.isArray(m.committeeIds) && m.committeeIds.includes(c.id)).map((m) => m.id));
        const pts = contributions
          .filter((x) => x.status === 'approved' && ids.has(x.memberId) && (x.committeeId === c.id || !x.committeeId))
          .reduce((s, x) => s + (Number(x.points) || 0), 0);
        return { committee: c, points: pts };
      })
      .sort((a, b) => b.points - a.points);

    const memberPoints = members
      .map((m) => ({
        member: m,
        points: contributions.filter((c) => c.status === 'approved' && c.memberId === m.id).reduce((s, c) => s + (Number(c.points) || 0), 0),
      }))
      .sort((a, b) => b.points - a.points);

    const status = activeInactive(members);
    const rates = approvalRates(requests);
    const reqStatus = countByStatus(requests);
    const reqType = countByStatus(requests.map((r) => ({ status: r.type })));
    const contribStatus = countByStatus(contributions);
    const top = topContributors(members, contributions, 10);
    const daily = activityLast30Days(contributions);
    const monthly = monthlyTotals(contributions, 6);

    const totalPoints = contributions.filter((c) => c.status === 'approved').reduce((s, c) => s + (Number(c.points) || 0), 0);
    const totalHours = contributions.filter((c) => c.status === 'approved').reduce((s, c) => s + (Number(c.hours) || 0), 0);

    return { teamStats, committeeStats, memberPoints, status, rates, reqStatus, reqType, contribStatus, top, daily, monthly, totalPoints, totalHours };
  }, [members, contributions, requests, committees]);

  if (lM || lC || lR || lCo) return <Loading fullHeight message="Loading analytics..." />;

  const maxTeam = Math.max(1, ...view.teamStats.map((s) => s.points));
  const maxCommittee = Math.max(1, ...view.committeeStats.map((s) => s.points));
  const maxMember = Math.max(1, ...view.memberPoints.slice(0, 10).map((s) => s.points));

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Analytics" description="Live metrics, distributions, and trends." />

      <section className="section">
        <SectionHeader eyebrow="Overview" title="Key Metrics" />
        <StatRow>
          <Stat value={members.length} label="Members" />
          <Stat value={view.status.active} label="Active" />
          <Stat value={view.status.inactive + view.status.suspended} label="Inactive / Suspended" variant="red" />
          <Stat value={teams.length} label="Teams" />
          <Stat value={committees.length} label="Committees" />
          <Stat value={view.totalPoints} label="Total Points" />
          <Stat value={view.totalHours} label="Total Hours" />
          <Stat value={requests.length} label="Requests" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Points" title="Points per Team" />
        <div className="card no-click">
          <BarChart data={view.teamStats.map((s) => ({ label: s.team.name, value: s.points }))} max={maxTeam} color="#C1272D" />
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Points" title="Points per Committee" />
        <div className="card no-click">
          {view.committeeStats.length === 0
            ? <div className="muted small">No committees yet.</div>
            : <BarChart data={view.committeeStats.map((s) => ({ label: s.committee.nameAr || s.committee.name || s.committee.id, value: s.points }))} max={maxCommittee} color="#0F172A" />}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Points" title="Top 10 Members by Points" />
        <div className="card no-click">
          <BarChart data={view.memberPoints.slice(0, 10).map((s) => ({ label: s.member.name, value: s.points }))} max={maxMember} color="#16A34A" />
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Requests" title="By Status" />
        <div className="grid grid--2">
          <div className="card no-click">
            <PieChart data={view.reqStatus.map((b, i) => ({ label: b.key, value: b.value, color: PALETTE[i % PALETTE.length] }))} />
          </div>
          <div className="card no-click">
            <div className="card__title">Approval Rates</div>
            <div className="card__meta">Approved: {view.rates.approved} · Rejected: {view.rates.rejected} · Pending: {view.rates.pending}</div>
            <div className="mt-3">
              <div className="chart-row"><span>Approval</span><div className="chart-bar" style={{ width: view.rates.approvalRate + '%' }} /><span>{view.rates.approvalRate}%</span></div>
              <div className="chart-row"><span>Rejection</span><div className="chart-bar" style={{ width: view.rates.rejectionRate + '%', background: 'var(--c-red)' }} /><span>{view.rates.rejectionRate}%</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Requests" title="By Type" />
        <div className="grid grid--narrow">
          {view.reqType.map((b) => (
            <div key={b.key} className="card no-click">
              <div className="card__meta">{b.key}</div>
              <div style={{ fontSize: '1.8rem', color: 'var(--c-red)', marginTop: 6 }}>{b.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Contributions" title="By Status" />
        <div className="grid grid--narrow">
          {view.contribStatus.map((b) => (
            <div key={b.key} className="card no-click">
              <div className="card__meta">{b.key}</div>
              <div style={{ fontSize: '1.8rem', color: 'var(--c-navy)', marginTop: 6 }}>{b.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Timeline" title="Last 30 Days (Points)" />
        <div className="card no-click">
          <LineChart points={view.daily.map((d) => ({ x: d.day, y: d.points }))} color="#0F172A" />
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Timeline" title="Monthly Comparison (6 months)" />
        <div className="card no-click">
          <BarChart data={view.monthly.map((m) => ({ label: m.month, value: m.points }))} color="#A78BFA" />
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="People" title="Top Contributors" />
        <div className="card no-click">
          <table className="data">
            <thead><tr><th>#</th><th>Name</th><th>Points</th><th>Hours</th></tr></thead>
            <tbody>
              {view.top.map((t, i) => (
                <tr key={t.member.id}>
                  <td data-label="#">{i + 1}</td>
                  <td data-label="Name">{t.member.name} {i === 0 ? <Badge variant="red">Top</Badge> : null}</td>
                  <td className="points" data-label="Points">{t.points}</td>
                  <td data-label="Hours">{t.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
