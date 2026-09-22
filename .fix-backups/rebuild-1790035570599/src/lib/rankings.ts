import type { Member, Contribution, TeamId } from '@/types';

function approvedPoints(c: Contribution): number {
  return typeof c.points === 'number' ? c.points : 0;
}

function approvedHours(c: Contribution): number {
  return typeof c.hours === 'number' ? c.hours : 0;
}

export function getMemberPoints(memberId: string, contributions: Contribution[]): number {
  return contributions
    .filter((c) => c.memberId === memberId && c.status === 'approved')
    .reduce((sum, c) => sum + approvedPoints(c), 0);
}

export function getMemberHours(memberId: string, contributions: Contribution[]): number {
  return contributions
    .filter((c) => c.memberId === memberId && c.status === 'approved')
    .reduce((sum, c) => sum + approvedHours(c), 0);
}

export interface RankEntry {
  member: Member;
  points: number;
  hours: number;
  rank: number;
}

export function getGlobalRanking(members: Member[], contributions: Contribution[]): RankEntry[] {
  const eligible = members.filter((m) => m.role !== 'HEAD' && m.role !== 'VICE');
  const withPoints = eligible.map((m) => ({
    member: m,
    points: getMemberPoints(m.id, contributions),
    hours: getMemberHours(m.id, contributions),
  }));
  withPoints.sort((a, b) => b.points - a.points);
  return withPoints.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getTeamRanking(
  members: Member[],
  contributions: Contribution[],
  teamId: TeamId,
): RankEntry[] {
  const teamMembers = members.filter((m) => Array.isArray(m.teamIds) && m.teamIds.includes(teamId));
  const eligible = teamMembers.filter((m) => m.role !== 'HEAD' && m.role !== 'VICE');
  const withPoints = eligible.map((m) => ({
    member: m,
    points: getMemberPoints(m.id, contributions),
    hours: getMemberHours(m.id, contributions),
  }));
  withPoints.sort((a, b) => b.points - a.points);
  return withPoints.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getCommitteeRanking(
  members: Member[],
  contributions: Contribution[],
  committeeId: string,
): RankEntry[] {
  const committeeMembers = members.filter((m) => Array.isArray(m.committeeIds) && m.committeeIds.includes(committeeId));
  const eligible = committeeMembers.filter((m) => m.role !== 'HEAD' && m.role !== 'VICE');
  const withPoints = eligible.map((m) => ({
    member: m,
    points: contributions
      .filter((c) => c.memberId === m.id && c.committeeId === committeeId && c.status === 'approved')
      .reduce((sum, c) => sum + approvedPoints(c), 0),
    hours: contributions
      .filter((c) => c.memberId === m.id && c.committeeId === committeeId && c.status === 'approved')
      .reduce((sum, c) => sum + approvedHours(c), 0),
  }));
  withPoints.sort((a, b) => b.points - a.points);
  return withPoints.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getTeamTotalPoints(members: Member[], contributions: Contribution[], teamId: TeamId): number {
  const teamMembers = members.filter((m) => Array.isArray(m.teamIds) && m.teamIds.includes(teamId));
  const teamMemberIds = new Set(teamMembers.map((m) => m.id));
  return contributions
    .filter((c) => teamMemberIds.has(c.memberId) && c.status === 'approved')
    .reduce((sum, c) => sum + approvedPoints(c), 0);
}

export function getCommitteeTotalPoints(members: Member[], contributions: Contribution[], committeeId: string): number {
  const cm = members.filter((m) => Array.isArray(m.committeeIds) && m.committeeIds.includes(committeeId));
  const cmIds = new Set(cm.map((m) => m.id));
  return contributions
    .filter((c) => cmIds.has(c.memberId) && c.committeeId === committeeId && c.status === 'approved')
    .reduce((sum, c) => sum + approvedPoints(c), 0);
}

export interface UserRanks {
  global: { rank: number; total: number; points: number } | null;
  team: { rank: number; total: number; points: number; teamId: TeamId } | null;
  committees: Array<{ committeeId: string; rank: number; total: number; points: number }>;
}

export function getUserRanks(userMemberId: string | null, members: Member[], contributions: Contribution[]): UserRanks {
  if (!userMemberId) return { global: null, team: null, committees: [] };

  const member = members.find((m) => m.id === userMemberId);
  if (!member) return { global: null, team: null, committees: [] };

  const global = getGlobalRanking(members, contributions);
  const globalEntry = global.find((e) => e.member.id === userMemberId);

  let teamData: UserRanks['team'] = null;
  const teamIds = Array.isArray(member.teamIds) ? member.teamIds : [];
  if (teamIds.length > 0) {
    const tid = teamIds[0];
    const teamRank = getTeamRanking(members, contributions, tid);
    const tEntry = teamRank.find((e) => e.member.id === userMemberId);
    if (tEntry) {
      teamData = { rank: tEntry.rank, total: teamRank.length, points: tEntry.points, teamId: tid };
    }
  }

  const committeeData: UserRanks['committees'] = [];
  const committeeIds = Array.isArray(member.committeeIds) ? member.committeeIds : [];
  for (const cid of committeeIds) {
    const committeeRank = getCommitteeRanking(members, contributions, cid);
    const cEntry = committeeRank.find((e) => e.member.id === userMemberId);
    if (cEntry) {
      committeeData.push({ committeeId: cid, rank: cEntry.rank, total: committeeRank.length, points: cEntry.points });
    }
  }

  return {
    global: globalEntry ? { rank: globalEntry.rank, total: global.length, points: globalEntry.points } : null,
    team: teamData,
    committees: committeeData,
  };
}
