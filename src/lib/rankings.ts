import type { Member, Contribution, TeamId } from '@/types';
import { safeArray, safeNumber } from './safe';

export function getMemberPoints(memberId: string, contributions: Contribution[]): number {
  return safeArray(contributions)
    .filter((c) => c.memberId === memberId && c.status === 'approved')
    .reduce((sum, c) => sum + safeNumber(c.points), 0);
}

export function getMemberHours(memberId: string, contributions: Contribution[]): number {
  return safeArray(contributions)
    .filter((c) => c.memberId === memberId && c.status === 'approved')
    .reduce((sum, c) => sum + safeNumber(c.hours), 0);
}

export interface RankEntry {
  member: Member;
  points: number;
  hours: number;
  rank: number;
}

export function getGlobalRanking(members: Member[], contributions: Contribution[]): RankEntry[] {
  const eligible = safeArray(members).filter((m) => m.role !== 'HEAD' && m.role !== 'VICE');
  const withPoints = eligible.map((m) => ({
    member: m,
    points: getMemberPoints(m.id, contributions),
    hours: getMemberHours(m.id, contributions),
  }));
  withPoints.sort((a, b) => b.points - a.points);
  return withPoints.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getTeamRanking(members: Member[], contributions: Contribution[], teamId: TeamId): RankEntry[] {
  const teamMembers = safeArray(members).filter((m) => safeArray(m.teamIds).includes(teamId));
  const eligible = teamMembers.filter((m) => m.role !== 'HEAD' && m.role !== 'VICE');
  const withPoints = eligible.map((m) => ({
    member: m,
    points: getMemberPoints(m.id, contributions),
    hours: getMemberHours(m.id, contributions),
  }));
  withPoints.sort((a, b) => b.points - a.points);
  return withPoints.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getCommitteeRanking(members: Member[], contributions: Contribution[], committeeId: string): RankEntry[] {
  const cm = safeArray(members).filter((m) => safeArray(m.committeeIds).includes(committeeId));
  const eligible = cm.filter((m) => m.role !== 'HEAD' && m.role !== 'VICE');
  const withPoints = eligible.map((m) => ({
    member: m,
    points: safeArray(contributions)
      .filter((c) => c.memberId === m.id && c.committeeId === committeeId && c.status === 'approved')
      .reduce((s, c) => s + safeNumber(c.points), 0),
    hours: safeArray(contributions)
      .filter((c) => c.memberId === m.id && c.committeeId === committeeId && c.status === 'approved')
      .reduce((s, c) => s + safeNumber(c.hours), 0),
  }));
  withPoints.sort((a, b) => b.points - a.points);
  return withPoints.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getTeamTotalPoints(members: Member[], contributions: Contribution[], teamId: TeamId): number {
  const tmIds = new Set(safeArray(members).filter((m) => safeArray(m.teamIds).includes(teamId)).map((m) => m.id));
  return safeArray(contributions)
    .filter((c) => tmIds.has(c.memberId) && c.status === 'approved')
    .reduce((s, c) => s + safeNumber(c.points), 0);
}

export function getCommitteeTotalPoints(members: Member[], contributions: Contribution[], committeeId: string): number {
  const cmIds = new Set(safeArray(members).filter((m) => safeArray(m.committeeIds).includes(committeeId)).map((m) => m.id));
  return safeArray(contributions)
    .filter((c) => cmIds.has(c.memberId) && c.committeeId === committeeId && c.status === 'approved')
    .reduce((s, c) => s + safeNumber(c.points), 0);
}

export interface UserRanks {
  global: { rank: number; total: number; points: number } | null;
  team: { rank: number; total: number; points: number; teamId: TeamId } | null;
  committees: Array<{ committeeId: string; rank: number; total: number; points: number }>;
}

export function getUserRanks(userMemberId: string | null | undefined, members: Member[], contributions: Contribution[]): UserRanks {
  if (!userMemberId) return { global: null, team: null, committees: [] };
  const member = safeArray(members).find((m) => m.id === userMemberId);
  if (!member) return { global: null, team: null, committees: [] };

  const global = getGlobalRanking(members, contributions);
  const gEntry = global.find((e) => e.member.id === userMemberId);

  let teamData: UserRanks['team'] = null;
  const teamIds = safeArray(member.teamIds);
  if (teamIds.length > 0) {
    const tid = teamIds[0];
    const tRank = getTeamRanking(members, contributions, tid);
    const tEntry = tRank.find((e) => e.member.id === userMemberId);
    if (tEntry) teamData = { rank: tEntry.rank, total: tRank.length, points: tEntry.points, teamId: tid };
  }

  const committeeData: UserRanks['committees'] = [];
  for (const cid of safeArray(member.committeeIds)) {
    const cRank = getCommitteeRanking(members, contributions, cid);
    const cEntry = cRank.find((e) => e.member.id === userMemberId);
    if (cEntry) committeeData.push({ committeeId: cid, rank: cEntry.rank, total: cRank.length, points: cEntry.points });
  }

  return {
    global: gEntry ? { rank: gEntry.rank, total: global.length, points: gEntry.points } : null,
    team: teamData,
    committees: committeeData,
  };
}
