// src/lib/analytics.ts
// Helpers for the expanded Admin Analytics page (Fix #7).
import type { Contribution, Member, RequestRecord } from '@/types';

export interface Bucket { key: string; value: number; }

export function countByStatus<T extends { status?: string }>(rows: T[]): Bucket[] {
  const m = new Map<string, number>();
  rows.forEach((r) => {
    const k = r.status || 'unknown';
    m.set(k, (m.get(k) || 0) + 1);
  });
  return Array.from(m, ([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value);
}

export function activeInactive(members: Member[]): { active: number; inactive: number; suspended: number } {
  let active = 0, inactive = 0, suspended = 0;
  for (const m of members) {
    if (m.status === 'active') active++;
    else if (m.status === 'inactive') inactive++;
    else if (m.status === 'suspended') suspended++;
  }
  return { active, inactive, suspended };
}

export function approvalRates(requests: RequestRecord[]): {
  approved: number; rejected: number; pending: number; approvalRate: number; rejectionRate: number;
} {
  let approved = 0, rejected = 0, pending = 0;
  for (const r of requests) {
    if (r.status === 'APPROVED') approved++;
    else if (r.status === 'REJECTED') rejected++;
    else pending++;
  }
  const decided = approved + rejected;
  return {
    approved, rejected, pending,
    approvalRate: decided === 0 ? 0 : Math.round((approved / decided) * 100),
    rejectionRate: decided === 0 ? 0 : Math.round((rejected / decided) * 100),
  };
}

export function topContributors(members: Member[], contributions: Contribution[], limit = 10): Array<{ member: Member; points: number; hours: number }> {
  const byId = new Map<string, { points: number; hours: number }>();
  for (const c of contributions) {
    if (c.status !== 'approved') continue;
    const cur = byId.get(c.memberId) || { points: 0, hours: 0 };
    cur.points += Number(c.points) || 0;
    cur.hours += Number(c.hours) || 0;
    byId.set(c.memberId, cur);
  }
  return members
    .map((m) => ({ member: m, points: byId.get(m.id)?.points || 0, hours: byId.get(m.id)?.hours || 0 }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

export interface DayPoint { day: string; points: number; contributions: number; }

export function activityLast30Days(contributions: Contribution[]): DayPoint[] {
  const days: DayPoint[] = [];
  const today = new Date();
  const map = new Map<string, DayPoint>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const p: DayPoint = { day: key, points: 0, contributions: 0 };
    map.set(key, p);
    days.push(p);
  }
  for (const c of contributions) {
    if (c.status !== 'approved' || !c.date) continue;
    const key = String(c.date).slice(0, 10);
    const p = map.get(key);
    if (p) {
      p.points += Number(c.points) || 0;
      p.contributions += 1;
    }
  }
  return days;
}

export interface MonthPoint { month: string; points: number; contributions: number; }

export function monthlyTotals(contributions: Contribution[], monthsBack = 6): MonthPoint[] {
  const out: MonthPoint[] = [];
  const now = new Date();
  const map = new Map<string, MonthPoint>();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const p: MonthPoint = { month: key, points: 0, contributions: 0 };
    map.set(key, p);
    out.push(p);
  }
  for (const c of contributions) {
    if (c.status !== 'approved' || !c.date) continue;
    const key = String(c.date).slice(0, 7);
    const p = map.get(key);
    if (p) {
      p.points += Number(c.points) || 0;
      p.contributions += 1;
    }
  }
  return out;
}
