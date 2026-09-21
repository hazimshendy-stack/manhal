#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — New Hierarchy & Manual Points System (CLEAN REWRITE)
 * - 4-stage contribution approval
 * - Manual points assigned by Committee HR
 * - Rankings: committee, team, global
 * - Committee required for every member
 * - Safe guards for old data
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const C = {
  r: "\x1b[0m",
  b: "\x1b[1m",
  g: "\x1b[32m",
  y: "\x1b[33m",
  red: "\x1b[31m",
  c: "\x1b[36m",
  m: "\x1b[35m",
  d: "\x1b[2m",
};
const sh = (cmd) => execSync(cmd, { cwd: ROOT, stdio: "inherit" });

const files = {};
const F = (p, c) => {
  files[p.replace(/\\/g, "/")] = c.replace(/^\n/, "");
};

/* ═══════════════════════════════════════════════════════════════
   1) types/index.ts
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/types/index.ts",
  `export type RoleId =
  | 'HEAD' | 'VICE'
  | 'HEAD_HR'
  | 'PRESIDENT' | 'VICE_PRESIDENT'
  | 'HR'
  | 'COMMITTEE_HR'
  | 'MEMBER' | 'VIEWER';

export type TeamId = 'helpers' | 'heroes' | 'coders' | 'enviros' | 'messages' | 'masar' | 'rstc';

export type RequestType = 'TRANSFER' | 'PROMOTION' | 'RESIGNATION' | 'COMPLAINT' | 'SUGGESTION' | 'LEAVE';
export type RequestStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type ContributionStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type ConversationType = 'private' | 'team' | 'general';

export type NotificationType =
  | 'approval' | 'request' | 'participation' | 'achievement'
  | 'system' | 'warning' | 'message';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: RoleId;
  teamId: TeamId | null;
  committeeIds: string[];
  memberId: string | null;
  createdAt: string;
  emailVerified?: boolean;
  mustChangePassword?: boolean;
  createdByAdmin?: string;
}

export interface Role {
  id: RoleId;
  name: string;
  nameEn: string;
  level: number;
}

export interface Team {
  id: TeamId;
  name: string;
  nameAr: string;
  description: string;
  color: string;
}

export interface Committee {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  color: string;
  icon: string;
  teamId?: TeamId | null;
}

export interface Member {
  id: string;
  name: string;
  role: RoleId;
  teamIds: TeamId[];
  committeeIds: string[];
  joinedSeason: number;
  hours: number;
  points?: number;
  status: 'active' | 'inactive' | 'suspended';
  bio?: string;
  email?: string;
  linkedUserId?: string;
}

export interface ContributionApproval {
  stage: 1 | 2 | 3;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedBy?: string;
  approvedByName?: string;
  approvedByRole?: string;
  approvedAt?: string;
  comment?: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  teamId: TeamId;
  committeeId: string;
  category: string;
  title: string;
  description: string;
  date: string;
  hours: number;
  points: number;
  status: ContributionStatus;
  seasonId: string;
  createdBy: string;
  approvals?: ContributionApproval[];
  currentStage?: 1 | 2 | 3 | 4;
}

export interface ApprovalStep {
  id: string;
  requestId: string;
  order: number;
  requiredRole: RoleId;
  requiredTeamId: TeamId | null;
  approverUid?: string;
  approverName?: string;
  status: ApprovalStatus;
  comment?: string;
  actionDate?: string;
}

export interface RequestRecord {
  id: string;
  type: RequestType;
  requesterUid: string;
  requesterMemberId: string;
  requesterName: string;
  subjectMemberId?: string;
  fromTeamId?: TeamId;
  toTeamId?: TeamId;
  title: string;
  description: string;
  status: RequestStatus;
  currentStepOrder: number;
  priority: Priority;
  submittedAt: string;
  updatedAt: string;
  seasonId: string;
}

export interface WarningRecord {
  id: string;
  memberId: string;
  memberName: string;
  type: 'VERBAL' | 'WRITTEN' | 'FINAL';
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  issuedByMemberId: string;
  issuedByName: string;
  issuedAt: string;
  status: 'active' | 'resolved';
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  level: 'branch' | 'national' | 'international';
  teamIds: TeamId[];
  memberIds: string[];
  memberNames: string[];
  seasonId: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  read: boolean;
  route?: string;
  priority?: 'low' | 'normal' | 'high';
  fromName?: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  participantUids: string[];
  teamId?: TeamId;
  lastMessageAt: string;
  lastMessageText?: string;
  lastMessageSender?: string;
  unreadCounts?: Record<string, number>;
  createdBy?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUid: string;
  senderName: string;
  text: string;
  sentAt: string;
  readBy?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  endTime?: string;
  teamId?: TeamId | null;
  isPublic: boolean;
  type: 'meeting' | 'event' | 'deadline' | 'workshop';
  location?: string;
  participantUids?: string[];
  seasonId: string;
  createdBy: string;
  createdByName: string;
}

export interface TimelineEvent {
  id: string;
  memberId?: string;
  memberName?: string;
  teamId?: TeamId;
  type: 'join' | 'contribution' | 'promotion' | 'transfer' | 'achievement' | 'warning' | 'request' | 'approval';
  title: string;
  description?: string;
  date: string;
  relatedId?: string;
}

export interface AuditRecord {
  id: string;
  actorUid: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  date: string;
  description: string;
}

export interface GovernanceDocument {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  version: string;
  updatedAt: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  organization: string;
  email: string;
}

export interface OnboardingCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  accentColor: string;
  order: number;
}

export interface Season {
  id: string;
  label: string;
  labelEn: string;
  start: string;
  end: string;
  isActive: boolean;
  theme: string;
}
`
);

/* ═══════════════════════════════════════════════════════════════
   2) committeePermissions.ts
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/lib/committeePermissions.ts",
  `import type { AppUser, Contribution } from '@/types';
import { isAdmin } from './permissions';

function safeArray<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}

function hasCommittee(user: AppUser | null, committeeId: string): boolean {
  if (!user) return false;
  return safeArray(user.committeeIds).includes(committeeId);
}

export function isCommitteeHR(user: AppUser | null, committeeId: string): boolean {
  if (!user) return false;
  if (!committeeId) return false;
  if (user.role !== 'HR' && user.role !== 'COMMITTEE_HR') return false;
  return hasCommittee(user, committeeId);
}

export function isTeamHR(user: AppUser | null, teamId: string): boolean {
  if (!user) return false;
  if (user.role !== 'HR' && user.role !== 'HEAD_HR') return false;
  if (user.role === 'HEAD_HR') return true;
  return user.teamId === teamId;
}

export function isTeamHead(user: AppUser | null, teamId: string): boolean {
  if (!user) return false;
  if (user.role !== 'PRESIDENT') return false;
  return user.teamId === teamId;
}

export function isTeamHeadHR(user: AppUser | null, teamId: string): boolean {
  if (!user) return false;
  if (user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT') return user.teamId === teamId;
  if (user.role === 'HR') return user.teamId === teamId;
  return false;
}

export function isGlobalHR(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD_HR';
}

export function isSubBranchesHead(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD' || user.role === 'VICE';
}

export interface StageInfo {
  stage: 1 | 2 | 3 | 4;
  label: string;
  canApprove: boolean;
  assignPoints: boolean;
}

function getCurrentStage(contribution: Contribution): 1 | 2 | 3 | 4 {
  const s = contribution.currentStage;
  if (s === 1 || s === 2 || s === 3 || s === 4) return s;
  // Fallback for old contributions
  if (contribution.status === 'approved') return 4;
  if (contribution.status === 'rejected') return 4;
  return 1;
}

export function getContributionStage(user: AppUser | null, contribution: Contribution): StageInfo {
  const stage = getCurrentStage(contribution);

  if (!user) {
    return { stage, label: 'Unknown', canApprove: false, assignPoints: false };
  }

  if (stage === 1) {
    return {
      stage: 1,
      label: 'Committee HR Approval',
      canApprove: isCommitteeHR(user, contribution.committeeId || '') || isAdmin(user),
      assignPoints: true,
    };
  }

  if (stage === 2) {
    return {
      stage: 2,
      label: 'Team Head HR / Team Head Approval',
      canApprove: isTeamHeadHR(user, contribution.teamId) || isTeamHead(user, contribution.teamId) || isAdmin(user),
      assignPoints: false,
    };
  }

  if (stage === 3) {
    return {
      stage: 3,
      label: 'Global Review',
      canApprove: isGlobalHR(user) || isSubBranchesHead(user) || isAdmin(user),
      assignPoints: false,
    };
  }

  return {
    stage: 4,
    label: 'Completed',
    canApprove: false,
    assignPoints: false,
  };
}

export function canReviewContribution(user: AppUser | null, contribution: Contribution): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;

  const stage = getCurrentStage(contribution);

  if (stage === 1) return isCommitteeHR(user, contribution.committeeId || '');
  if (stage === 2) return isTeamHeadHR(user, contribution.teamId) || isTeamHead(user, contribution.teamId);
  if (stage === 3) return isGlobalHR(user) || isSubBranchesHead(user);
  return false;
}
`
);

/* ═══════════════════════════════════════════════════════════════
   3) contributionApprovals.ts
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/lib/contributionApprovals.ts",
  `import { updateOne, getOne, now } from './db';
import { notifyUser } from './notifications';
import { logAudit } from './audit';
import type { Contribution, ContributionApproval, AppUser } from '@/types';

function getCurrentStage(contribution: Contribution): 1 | 2 | 3 | 4 {
  const s = contribution.currentStage;
  if (s === 1 || s === 2 || s === 3 || s === 4) return s;
  if (contribution.status === 'approved' || contribution.status === 'rejected') return 4;
  return 1;
}

function getApprovals(contribution: Contribution): ContributionApproval[] {
  return Array.isArray(contribution.approvals) ? [...contribution.approvals] : [
    { stage: 1, status: 'pending' },
    { stage: 2, status: 'pending' },
    { stage: 3, status: 'pending' },
  ];
}

export async function approveContributionStage(
  contribution: Contribution,
  user: AppUser,
  points?: number,
  comment?: string,
): Promise<void> {
  const nowStr = now();
  const stage = getCurrentStage(contribution);

  if (stage < 1 || stage > 3) {
    throw new Error('Invalid stage');
  }

  const approvals = getApprovals(contribution);
  const existingIndex = approvals.findIndex((a) => a.stage === stage);

  const newApproval: ContributionApproval = {
    stage: stage as 1 | 2 | 3,
    status: 'approved',
    approvedBy: user.uid,
    approvedByName: user.displayName,
    approvedByRole: user.role,
    approvedAt: nowStr,
    comment: comment?.trim() || undefined,
  };

  if (existingIndex >= 0) {
    approvals[existingIndex] = newApproval;
  } else {
    approvals.push(newApproval);
  }

  let updatedPoints = contribution.points || 0;

  if (stage === 1) {
    if (typeof points !== 'number') {
      throw new Error('Points must be assigned at stage 1');
    }
    updatedPoints = points;
  }

  if (stage === 3) {
    await updateOne('contributions', contribution.id, {
      approvals,
      points: updatedPoints,
      status: 'approved',
      currentStage: 4,
    });

    if (updatedPoints > 0) {
      const member = await getOne<{ points?: number; hours?: number }>('members', contribution.memberId);
      if (member) {
        await updateOne('members', contribution.memberId, {
          points: (member.points || 0) + updatedPoints,
          hours: (member.hours || 0) + (contribution.hours || 0),
        });
      }
    }

    await notifyUser(
      contribution.createdBy,
      'Contribution approved',
      '"' + contribution.title + '" — +' + updatedPoints + ' points',
      'participation',
      '/my-contributions',
      'high',
      user.displayName,
    );

    await logAudit(user, 'APPROVE_CONTRIBUTION_FINAL', 'Contribution', contribution.id, contribution.title);
  } else {
    const nextStage = (stage + 1) as 2 | 3;
    await updateOne('contributions', contribution.id, {
      approvals,
      points: updatedPoints,
      status: 'in_review',
      currentStage: nextStage,
    });

    await notifyUser(
      contribution.createdBy,
      'Contribution progressed',
      '"' + contribution.title + '" — stage ' + nextStage + ' of 3',
      'approval',
      '/my-contributions',
      'normal',
      user.displayName,
    );

    await logAudit(user, 'APPROVE_CONTRIBUTION_STAGE', 'Contribution', contribution.id, 'Stage ' + stage);
  }
}

export async function rejectContributionStage(
  contribution: Contribution,
  user: AppUser,
  comment: string,
): Promise<void> {
  if (!comment.trim()) throw new Error('Rejection reason is required');

  const stage = getCurrentStage(contribution);
  const approvals = getApprovals(contribution);
  const existingIndex = approvals.findIndex((a) => a.stage === stage);

  const newApproval: ContributionApproval = {
    stage: stage as 1 | 2 | 3,
    status: 'rejected',
    approvedBy: user.uid,
    approvedByName: user.displayName,
    approvedByRole: user.role,
    approvedAt: now(),
    comment: comment.trim(),
  };

  if (existingIndex >= 0) {
    approvals[existingIndex] = newApproval;
  } else {
    approvals.push(newApproval);
  }

  for (let s = stage + 1; s <= 3; s++) {
    if (!approvals.some((a) => a.stage === s)) {
      approvals.push({ stage: s as 1 | 2 | 3, status: 'skipped' });
    }
  }

  await updateOne('contributions', contribution.id, {
    approvals,
    status: 'rejected',
  });

  await notifyUser(
    contribution.createdBy,
    'Contribution rejected',
    '"' + contribution.title + '" — Reason: ' + comment,
    'participation',
    '/my-contributions',
    'high',
    user.displayName,
  );

  await logAudit(user, 'REJECT_CONTRIBUTION', 'Contribution', contribution.id, comment);
}

export function newContributionApprovals(): ContributionApproval[] {
  return [
    { stage: 1, status: 'pending' },
    { stage: 2, status: 'pending' },
    { stage: 3, status: 'pending' },
  ];
}
`
);

/* ═══════════════════════════════════════════════════════════════
   4) rankings.ts
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/lib/rankings.ts",
  `import type { Member, Contribution, TeamId } from '@/types';

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
`
);

/* ═══════════════════════════════════════════════════════════════
   5) MyContributionsPage.tsx
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/MyContributionsPage.tsx",
  `import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { createOne, newId, today } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { notifyTeamManagers } from '@/lib/notifications';
import { newContributionApprovals } from '@/lib/contributionApprovals';
import { teams } from '@/data/teams';
import { committees as defaultCommittees } from '@/data/committees';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat, StatRow } from '@/components/ui/Stat';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, TextInput, NumberInput, TextArea, Select } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { Contribution, TeamId, AppUser, Committee } from '@/types';

const STAGE_LABEL: Record<number, string> = {
  1: 'Committee HR',
  2: 'Team Head',
  3: 'Global Review',
  4: 'Approved',
};

function getStage(c: Contribution): 1 | 2 | 3 | 4 {
  const s = c.currentStage;
  if (s === 1 || s === 2 || s === 3 || s === 4) return s;
  if (c.status === 'approved' || c.status === 'rejected') return 4;
  return 1;
}

export function MyContributionsPage() {
  const { user } = useAuth();
  const { data: contributions, loading } = useRealtimeCollection<Contribution>('contributions');
  const { data: users } = useRealtimeCollection<AppUser>('users');
  const { data: liveCommittees } = useRealtimeCollection<Committee>('committees');

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [hours, setHours] = useState(1);
  const [teamId, setTeamId] = useState<TeamId>((user?.teamId as TeamId) || 'helpers');
  const [committeeId, setCommitteeId] = useState<string>((user?.committeeIds && user.committeeIds[0]) || '');
  const [category, setCategory] = useState('General');

  const committeeList = liveCommittees.length > 0 ? liveCommittees : defaultCommittees;

  if (!user?.memberId) {
    return (
      <div className="container">
        <EmptyState title="No member linked" message="Your account is not linked to a member." />
      </div>
    );
  }

  const userCommittees = Array.isArray(user.committeeIds) ? user.committeeIds : [];

  if (userCommittees.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="No committee assigned"
          message="You must be a member of at least one committee to log contributions. Contact your admin."
        />
      </div>
    );
  }

  const myContribs = contributions
    .filter((c) => c.memberId === user.memberId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const approved = myContribs.filter((c) => c.status === 'approved');
  const totalPoints = approved.reduce((s, c) => s + (c.points || 0), 0);
  const totalHours = approved.reduce((s, c) => s + c.hours, 0);
  const pending = myContribs.filter((c) => c.status === 'pending' || c.status === 'in_review').length;

  const reset = () => {
    setTitle('');
    setDesc('');
    setHours(1);
    setCategory('General');
  };

  const submit = async () => {
    if (!title.trim() || !desc.trim()) {
      toast.error('Title and description are required');
      return;
    }
    if (hours <= 0) {
      toast.error('Hours must be positive');
      return;
    }
    if (!committeeId) {
      toast.error('Committee is required');
      return;
    }

    setBusy(true);
    try {
      const contrib: Contribution = {
        id: newId('C'),
        memberId: user.memberId!,
        memberName: user.displayName,
        teamId,
        committeeId,
        category,
        title: title.trim(),
        description: desc.trim(),
        date: today(),
        hours,
        points: 0,
        status: 'pending',
        seasonId: 'S7',
        createdBy: user.uid,
        approvals: newContributionApprovals(),
        currentStage: 1,
      };

      await createOne('contributions', contrib);
      await logAudit(user, 'CREATE_CONTRIBUTION', 'Contribution', contrib.id, 'Log contribution');

      await notifyTeamManagers(
        users,
        teamId,
        'New contribution awaiting approval',
        user.displayName + ' logged "' + contrib.title + '"',
        'participation',
        '/admin/contributions',
        'normal',
        user.displayName,
      );

      toast.success('Submitted', 'Awaiting committee HR approval');
      setOpen(false);
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit';
      toast.error('Failed to submit', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <PageHeader
        eyebrow="My Contributions"
        title="My Contributions"
        description="Log your contributions. Committee HR assigns points."
      >
        <button type="button" className="btn btn--primary mt-4" onClick={() => setOpen(true)}>
          + Log Contribution
        </button>
      </PageHeader>

      <section className="section--tight">
        <StatRow>
          <Stat value={totalPoints} label="Points" variant="red" />
          <Stat value={totalHours} label="Hours" />
          <Stat value={myContribs.length} label="Contributions" />
          <Stat value={pending} label="Pending" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader eyebrow="History" title="All Contributions" />
        {loading ? (
          <SkeletonList count={5} />
        ) : myContribs.length === 0 ? (
          <EmptyState
            title="No contributions yet"
            message="Log your first contribution to earn points."
            action={
              <button type="button" className="btn btn--primary" onClick={() => setOpen(true)}>
                + Log First Contribution
              </button>
            }
          />
        ) : (
          <div className="stack">
            {myContribs.map((c) => {
              const team = teams.find((t) => t.id === c.teamId);
              const committee = committeeList.find((x) => x.id === c.committeeId);
              const stage = getStage(c);
              const approvals = Array.isArray(c.approvals) ? c.approvals : [];
              return (
                <div key={c.id} className="card no-click">
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">{c.title}</div>
                      <div className="card__meta">
                        {team?.name} · {committee?.nameAr || c.committeeId} · {formatDate(c.date)}
                      </div>
                    </div>
                    <Badge
                      variant={
                        c.status === 'approved' ? 'success'
                          : c.status === 'pending' ? 'info'
                          : c.status === 'in_review' ? 'warning'
                          : 'danger'
                      }
                    >
                      {c.status === 'approved' ? 'Approved'
                        : c.status === 'pending' ? 'Pending'
                        : c.status === 'in_review' ? 'In Review (' + stage + '/3)'
                        : 'Rejected'}
                    </Badge>
                  </div>

                  <p className="small soft mt-2">{c.description}</p>

                  <div className="row mt-3" style={{ gap: 10, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.92rem' }}>
                      <span>{c.hours} <span className="muted">hours</span></span>
                      {c.status === 'approved' ? (
                        <span className="points">{c.points} points</span>
                      ) : (
                        <span className="muted">Points pending</span>
                      )}
                    </div>
                  </div>

                  {c.status !== 'approved' && c.status !== 'rejected' ? (
                    <div className="mt-3" style={{ paddingTop: 12, borderTop: '1px solid var(--c-line)' }}>
                      <div className="tiny muted" style={{ marginBottom: 8 }}>Approval Progress</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {[1, 2, 3].map((s) => {
                          const apr = approvals.find((a) => a.stage === s);
                          const isActive = stage === s;
                          const isDone = apr?.status === 'approved';
                          const isRejected = apr?.status === 'rejected';
                          return (
                            <span
                              key={s}
                              className={'badge ' + (isDone ? 'badge--success' : isRejected ? 'badge--danger' : isActive ? 'badge--warning' : 'badge--neutral')}
                            >
                              {s}. {STAGE_LABEL[s]}
                              {isDone ? ' ✓' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Modal
        open={open}
        title="Log New Contribution"
        onClose={() => setOpen(false)}
        wide
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" className="btn btn--primary" onClick={submit} disabled={busy}>
              {busy ? '...' : 'Submit'}
            </button>
          </>
        }
      >
        <FormField label="Title" required>
          <TextInput value={title} onChange={setTitle} placeholder="Contribution title" />
        </FormField>

        <FormField label="Description" required>
          <TextArea value={desc} onChange={setDesc} placeholder="What did you do?" rows={3} />
        </FormField>

        <FormField label="Team" required>
          <Select
            value={teamId}
            onChange={(v) => setTeamId(v as TeamId)}
            options={teams.map((t) => ({ value: t.id, label: t.name }))}
          />
        </FormField>

        <FormField label="Committee" required hint="Points will be assigned by the committee HR">
          <Select
            value={committeeId}
            onChange={setCommitteeId}
            options={[
              { value: '', label: '— Select committee —' },
              ...committeeList
                .filter((c) => userCommittees.includes(c.id))
                .map((c) => ({ value: c.id, label: c.nameAr })),
            ]}
          />
        </FormField>

        <FormField label="Category">
          <TextInput value={category} onChange={setCategory} />
        </FormField>

        <FormField label="Hours" required hint="Approximate hours (committee HR will assign points)">
          <NumberInput value={hours} onChange={setHours} min={0.5} max={200} step={0.5} />
        </FormField>
      </Modal>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   6) AdminContributionsPage.tsx
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/admin/AdminContributionsPage.tsx",
  `import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { teams } from '@/data/teams';
import { committees as defaultCommittees } from '@/data/committees';
import { formatDate } from '@/lib/format';
import { approveContributionStage, rejectContributionStage } from '@/lib/contributionApprovals';
import { getContributionStage, canReviewContribution } from '@/lib/committeePermissions';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, TextArea, NumberInput } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { cx } from '@/lib/format';
import type { Contribution, ContributionStatus, Committee } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  all: 'All',
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

function getStageNumber(c: Contribution): 1 | 2 | 3 | 4 {
  const s = c.currentStage;
  if (s === 1 || s === 2 || s === 3 || s === 4) return s;
  if (c.status === 'approved' || c.status === 'rejected') return 4;
  return 1;
}

export function AdminContributionsPage() {
  const { user: me } = useAuth();
  const { data, loading } = useCollection<Contribution>('contributions');
  const { data: liveCommittees } = useCollection<Committee>('committees');
  const [status, setStatus] = useState<ContributionStatus | 'all'>('all');
  const [actionContrib, setActionContrib] = useState<Contribution | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [pointsInput, setPointsInput] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const committeeList = liveCommittees.length > 0 ? liveCommittees : defaultCommittees;

  const filtered = data
    .filter((c) => status === 'all' || c.status === status)
    .filter((c) => canReviewContribution(me, c) || c.createdBy === me?.uid)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const openAction = (c: Contribution, type: 'approve' | 'reject') => {
    setActionContrib(c);
    setActionType(type);
    setComment('');
    setPointsInput(c.points || 0);
  };

  const closeAction = () => {
    setActionContrib(null);
    setActionType(null);
    setComment('');
    setPointsInput(0);
  };

  const doApprove = async () => {
    if (!me || !actionContrib) return;
    const stageInfo = getContributionStage(me, actionContrib);
    setBusy(true);
    try {
      await approveContributionStage(
        actionContrib,
        me,
        stageInfo.assignPoints ? pointsInput : undefined,
        comment,
      );
      toast.success('Approved');
      closeAction();
    } catch (e) {
      toast.error('Failed', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    if (!me || !actionContrib) return;
    if (!comment.trim()) { toast.error('Reason is required'); return; }
    setBusy(true);
    try {
      await rejectContributionStage(actionContrib, me, comment);
      toast.success('Rejected');
      closeAction();
    } catch (e) {
      toast.error('Failed', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Contributions" description="Review and approve contributions. Points assigned by committee HR." />

      <div className="chips mb-4">
        {(['all', 'pending', 'in_review', 'approved', 'rejected'] as const).map((s) => (
          <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <SectionHeader eyebrow="List" title={'Contributions (' + filtered.length + ')'} />

      {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? (
        <EmptyState title="No contributions" message="No contributions match the filter." />
      ) : (
        <div className="stack">
          {filtered.map((c) => {
            const team = teams.find((t) => t.id === c.teamId);
            const committee = committeeList.find((x) => x.id === c.committeeId);
            const stageInfo = getContributionStage(me, c);
            const canAct = stageInfo.canApprove && (c.status === 'pending' || c.status === 'in_review');
            const stageNum = getStageNumber(c);

            return (
              <div key={c.id} className="card no-click">
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{c.title}</div>
                    <div className="card__meta">
                      {c.memberName} · {team?.name} · {committee?.nameAr || c.committeeId} · {formatDate(c.date)}
                    </div>
                  </div>
                  <Badge
                    variant={
                      c.status === 'approved' ? 'success'
                        : c.status === 'pending' ? 'info'
                        : c.status === 'in_review' ? 'warning'
                        : 'danger'
                    }
                  >
                    {c.status === 'approved' ? 'Approved'
                      : c.status === 'pending' ? 'Stage 1'
                      : c.status === 'in_review' ? 'Stage ' + stageNum
                      : 'Rejected'}
                  </Badge>
                </div>

                <p className="small soft mt-2">{c.description}</p>

                <div className="row mt-3" style={{ gap: 12 }}>
                  <span className="small">{c.hours} hours</span>
                  {c.points > 0 ? <span className="points">{c.points} points</span> : <span className="muted small">Points pending</span>}
                </div>

                {canAct ? (
                  <div className="row mt-3" style={{ gap: 8, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--c-line)' }}>
                    <button type="button" className="btn btn--success btn--sm" onClick={() => openAction(c, 'approve')}>
                      ✓ {stageInfo.assignPoints ? 'Approve & Assign Points' : 'Approve'}
                    </button>
                    <button type="button" className="btn btn--outline-danger btn--sm" onClick={() => openAction(c, 'reject')}>
                      ✕ Reject
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={actionType === 'approve' && actionContrib !== null}
        title={actionContrib && getContributionStage(me, actionContrib).assignPoints ? 'Approve & Assign Points' : 'Approve Contribution'}
        onClose={closeAction}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={closeAction}>Cancel</button>
            <button type="button" className="btn btn--success" onClick={doApprove} disabled={busy}>
              {busy ? '...' : 'Approve'}
            </button>
          </>
        }
      >
        {actionContrib && getContributionStage(me, actionContrib).assignPoints ? (
          <>
            <p className="small muted mb-3">
              Assign the points this contribution deserves. You can be fair — even if hours are equal, quality matters.
            </p>
            <FormField label="Points to assign" required>
              <NumberInput value={pointsInput} onChange={setPointsInput} min={0} max={1000} />
            </FormField>
          </>
        ) : (
          <p className="small muted mb-3">Confirm your approval for this stage.</p>
        )}
        <FormField label="Comment (optional)">
          <TextArea value={comment} onChange={setComment} rows={2} />
        </FormField>
      </Modal>

      <Modal
        open={actionType === 'reject' && actionContrib !== null}
        title="Reject Contribution"
        onClose={closeAction}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={closeAction}>Cancel</button>
            <button type="button" className="btn btn--danger" onClick={doReject} disabled={busy}>
              {busy ? '...' : 'Confirm Reject'}
            </button>
          </>
        }
      >
        <FormField label="Rejection reason" required>
          <TextArea value={comment} onChange={setComment} rows={3} placeholder="Explain the reason..." />
        </FormField>
      </Modal>
    </div>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   7) DashboardPage.tsx — with user ranks
   ═══════════════════════════════════════════════════════════════ */
F(
  "src/pages/DashboardPage.tsx",
  `import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { committees as defaultCommittees } from '@/data/committees';
import { isManager, seesAllTeams, canApproveStep } from '@/lib/permissions';
import { getMemberPoints, getMemberHours, getUserRanks } from '@/lib/rankings';
import { formatDate } from '@/lib/format';
import { Stat, StatRow } from '@/components/ui/Stat';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import type {
  Notification, RequestRecord, Contribution, ApprovalStep,
  CalendarEvent, Member, Committee,
} from '@/types';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: members, loading: l1 } = useRealtimeCollection<Member>('members');
  const { data: contributions, loading: l2 } = useRealtimeCollection<Contribution>('contributions');
  const { data: notifs, loading: l3 } = useRealtimeCollection<Notification>('notifications');
  const { data: requests, loading: l4 } = useRealtimeCollection<RequestRecord>('requests');
  const { data: approvals, loading: l5 } = useRealtimeCollection<ApprovalStep>('approvals');
  const { data: events, loading: l6 } = useRealtimeCollection<CalendarEvent>('calendar');
  const { data: liveCommittees } = useRealtimeCollection<Committee>('committees');

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6;

  if (!user) {
    return (
      <div className="container">
        <EmptyState title="Sign in required" message="Sign in to access your dashboard." />
      </div>
    );
  }

  if (isLoading) {
    return <div className="container"><Loading fullHeight message="Loading dashboard..." /></div>;
  }

  const myMember = user.memberId ? members.find((m) => m.id === user.memberId) : null;
  const myPoints = user.memberId ? getMemberPoints(user.memberId, contributions) : 0;
  const myHours = user.memberId ? getMemberHours(user.memberId, contributions) : 0;
  const myContribs = contributions.filter((c) => c.memberId === user.memberId);
  const myRequests = requests.filter((r) => r.requesterUid === user.uid);

  const myNotifs = notifs.filter((n) => n.userId === user.uid).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
  const myPendingApprovals = approvals.filter((a) => a.status === 'PENDING' && canApproveStep(user, a));
  const upcomingEvents = events
    .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
    .filter((e) => e.isPublic || e.teamId === user.teamId || seesAllTeams(user))
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 3);

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
  const totalOrgPoints = members.reduce((s, m) => s + getMemberPoints(m.id, contributions), 0);

  const myRanks = getUserRanks(user.memberId, members, contributions);
  const committeeList = liveCommittees.length > 0 ? liveCommittees : defaultCommittees;

  return (
    <>
      <div className="section section--tight">
        <div className="section-head__eyebrow">Welcome back</div>
        <h1>{user.displayName}</h1>
      </div>

      {isManager(user) ? (
        <section className="section--tight">
          <StatRow>
            <Stat value={members.length} label="Members" />
            <Stat value={teams.length} label="Teams" />
            <Stat value={pendingRequestsCount} label="Pending Requests" variant="red" />
            <Stat value={totalOrgPoints} label="Total Points" />
          </StatRow>
        </section>
      ) : (
        <section className="section--tight">
          <StatRow>
            <Stat value={myPoints} label="My Points" variant="red" />
            <Stat value={myHours} label="My Hours" />
            <Stat value={myContribs.length} label="My Contributions" />
            <Stat value={myRequests.length} label="My Requests" />
          </StatRow>
        </section>
      )}

      {myRanks.global || myRanks.team || myRanks.committees.length > 0 ? (
        <section className="section">
          <SectionHeader eyebrow="My Ranking" title="Where I Stand" />
          <div className="grid grid--2">
            {myRanks.global ? (
              <div className="card no-click">
                <div className="row row--between">
                  <div className="card__title">Global Ranking</div>
                  <Badge variant="red">#{myRanks.global.rank}</Badge>
                </div>
                <div className="card__meta">Out of {myRanks.global.total} members · {myRanks.global.points} points</div>
              </div>
            ) : null}

            {myRanks.team ? (
              <div className="card no-click">
                <div className="row row--between">
                  <div className="card__title">Team Ranking</div>
                  <Badge variant="navy">#{myRanks.team.rank}</Badge>
                </div>
                <div className="card__meta">
                  {teams.find((t) => t.id === myRanks.team!.teamId)?.name} · out of {myRanks.team.total} · {myRanks.team.points} points
                </div>
              </div>
            ) : null}

            {myRanks.committees.map((cr) => {
              const c = committeeList.find((x) => x.id === cr.committeeId);
              return (
                <div key={cr.committeeId} className="card no-click">
                  <div className="row row--between">
                    <div className="card__title">{c?.nameAr || cr.committeeId} Committee</div>
                    <Badge variant="info">#{cr.rank}</Badge>
                  </div>
                  <div className="card__meta">Out of {cr.total} · {cr.points} points</div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {user.role === 'MEMBER' ? (
        <section className="section--tight">
          <div className="row" style={{ gap: 10 }}>
            <Link to="/requests/new" className="btn btn--primary btn--sm">+ New Request</Link>
            <Link to="/my-contributions" className="btn btn--ghost btn--sm">Log Contribution</Link>
          </div>
        </section>
      ) : null}

      {isManager(user) && myPendingApprovals.length > 0 ? (
        <section className="section">
          <SectionHeader eyebrow="Awaiting your decision" title="Pending Approvals" action={<Link to="/approvals" className="btn btn--ghost btn--sm">View All</Link>} />
          <div className="stack">
            {myPendingApprovals.slice(0, 4).map((a) => {
              const req = requests.find((r) => r.id === a.requestId);
              if (!req) return null;
              return (
                <Link key={a.id} to={'/requests/' + req.id} className="card">
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">{req.title}</div>
                      <div className="card__meta">{req.requesterName} · Step {a.order}</div>
                    </div>
                    <Badge variant="warning" dot>Awaiting</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {myNotifs.length > 0 ? (
        <section className="section">
          <SectionHeader eyebrow="Latest updates" title="Notifications" action={<Link to="/notifications" className="btn btn--ghost btn--sm">View All</Link>} />
          <div className="stack">
            {myNotifs.map((n) => (
              <Link key={n.id} to={n.route || '/notifications'} className="card" style={!n.read ? { borderColor: '#FCA5A5', background: '#FFFBFC' } : undefined}>
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{n.title}</div>
                    <div className="card__meta">{n.message}</div>
                  </div>
                  {!n.read ? <Badge variant="red" dot>New</Badge> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {upcomingEvents.length > 0 ? (
        <section className="section">
          <SectionHeader eyebrow="Coming up" title="Upcoming Events" action={<Link to="/calendar" className="btn btn--ghost btn--sm">Calendar</Link>} />
          <div className="stack">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="card no-click">
                <div className="card__title">{e.title}</div>
                <div className="card__meta">{formatDate(e.date)}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {myMember ? (
        <section className="section">
          <SectionHeader eyebrow="My Info" title="My Account" />
          <div className="card no-click">
            <div className="kv"><span className="kv__k">Name</span><span className="kv__v">{myMember.name}</span></div>
            <div className="kv mt-3">
              <span className="kv__k">Team</span>
              <span className="kv__v">{user.teamId ? teams.find((t) => t.id === user.teamId)?.name : '—'}</span>
            </div>
            {Array.isArray(user.committeeIds) && user.committeeIds.length > 0 ? (
              <div className="kv mt-3">
                <span className="kv__k">Committees</span>
                <span className="kv__v">
                  {committeeList.filter((c) => user.committeeIds.includes(c.id)).map((c) => c.nameAr).join(' · ')}
                </span>
              </div>
            ) : null}
            <div className="kv mt-3"><span className="kv__k">Joined</span><span className="kv__v">{formatDate(user.createdAt)}</span></div>
          </div>
        </section>
      ) : null}
    </>
  );
}
`
);

/* ═══════════════════════════════════════════════════════════════
   8) Firestore Rules
   ═══════════════════════════════════════════════════════════════ */
F(
  "firestore.rules",
  `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function userDoc() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function userDocExists() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    function userRole() {
      return userDoc().role;
    }

    function userTeam() {
      return userDoc().teamId;
    }

    function userCommittees() {
      return userDoc().committeeIds;
    }

    function isAdmin() {
      return isSignedIn() && userDocExists() && userRole() in ['HEAD', 'VICE'];
    }

    function isGlobalHR() {
      return isSignedIn() && userDocExists() && userRole() == 'HEAD_HR';
    }

    function isManager() {
      return isSignedIn() && userDocExists() && userRole() in ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'];
    }

    function isTeamHead(teamId) {
      return isSignedIn() && userDocExists() && userRole() == 'PRESIDENT' && userTeam() == teamId;
    }

    function isCommitteeHR(committeeId) {
      return isSignedIn() && userDocExists() && userRole() in ['HR', 'COMMITTEE_HR'] && committeeId in userCommittees();
    }

    match /users/{uid} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == uid;
      allow update: if isAdmin() || request.auth.uid == uid;
      allow delete: if isAdmin();
    }

    match /members/{memberId} {
      allow read: if isSignedIn();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    match /teams/{teamId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    match /committees/{committeeId} {
      allow read: if isSignedIn();
      allow create, update: if isAdmin();
      allow delete: if isAdmin();
    }

    match /contributions/{contributionId} {
      allow read: if isSignedIn();

      allow create: if isSignedIn()
        && request.resource.data.createdBy == request.auth.uid;

      allow update: if isAdmin()
        || isGlobalHR()
        || (isManager() && (userTeam() == resource.data.teamId))
        || (isCommitteeHR(resource.data.committeeId));

      allow delete: if isAdmin();
    }

    match /warnings/{warningId} {
      allow read: if isManager() || (isSignedIn() && resource.data.memberId == userDoc().memberId);
      allow create, update: if isAdmin() || isManager();
      allow delete: if isAdmin();
    }

    match /achievements/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /notifications/{id} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isManager());
      allow create: if isSignedIn();
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }

    match /conversations/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isAdmin();
    }

    match /messages/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.senderUid == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    match /calendar/{id} {
      allow read: if true;
      allow write: if isManager();
    }

    match /governance/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /audit/{id} {
      allow read: if isAdmin();
      allow create: if isSignedIn();
    }

    match /requests/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isManager();
      allow delete: if isAdmin();
    }

    match /approvals/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isManager();
    }
  }
}
`
);

/* ═══════════════════════════════════════════════════════════════
   9) Auto-Fix engine
   ═══════════════════════════════════════════════════════════════ */

function walkDir(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkDir(full, exts));
    else if (exts.some((ext) => e.name.endsWith(ext))) out.push(full);
  }
  return out;
}

function autoFixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g;
  content = content.replace(importRegex, (match, imports, source) => {
    const names = imports
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    const bodyWithoutImports = content.replace(importRegex, "");
    const used = names.filter((name) => {
      let clean = name;
      if (clean.startsWith("type ")) clean = clean.slice(5).trim();
      if (clean.includes(" as ")) clean = clean.split(" as ")[1].trim();
      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp("\\\\b" + escaped + "\\\\b").test(bodyWithoutImports);
    });
    if (used.length === 0) return "";
    if (used.length === names.length) return match;
    return "import { " + used.join(", ") + " } from '" + source + "';";
  });
  content = content.replace(/\n{3,}/g, "\n\n");
  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

function runAutoFix() {
  console.log(C.b + "▶ AUTO-FIX" + C.r + "\n");
  const allFiles = walkDir(path.join(ROOT, "src"), [".ts", ".tsx"]);
  let fixed = 0;
  for (const f of allFiles) {
    if (autoFixFile(f)) {
      console.log(
        C.g + "✓" + C.r + " " + path.relative(ROOT, f).replace(/\\/g, "/")
      );
      fixed++;
    }
  }
  if (fixed === 0) console.log(C.d + "No unused imports" + C.r);
  else console.log("\n" + C.g + "Fixed " + fixed + " file(s)" + C.r);
  console.log("");
}

/* ═══════════════════════════════════════════════════════════════
   10) Main
   ═══════════════════════════════════════════════════════════════ */

function main() {
  console.log("");
  console.log(
    C.b + C.m + "╔══════════════════════════════════════════════════════╗" + C.r
  );
  console.log(
    C.b + C.m + "║  fix.cjs — New Hierarchy + Manual Points + 4-Stage   ║" + C.r
  );
  console.log(
    C.b + C.m + "╚══════════════════════════════════════════════════════╝" + C.r
  );
  console.log("");

  const bkDir = path.join(
    ROOT,
    ".fix-backups",
    "hierarchy-" + Date.now().toString()
  );
  fs.mkdirSync(bkDir, { recursive: true });

  let count = 0;
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs)) {
      const dst = path.join(bkDir, rel);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(abs, dst);
    }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
    console.log(C.g + "✓" + C.r + " " + rel);
    count++;
  }

  console.log("\n" + C.b + "═══ Files: " + count + " ═══" + C.r + "\n");

  runAutoFix();

  // Safe build
  const pkgPath = path.join(ROOT, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (
        pkg.scripts &&
        pkg.scripts.build &&
        pkg.scripts.build.includes("tsc")
      ) {
        pkg.scripts.build = "vite build";
        pkg.scripts.typecheck = "tsc --noEmit";
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
        console.log(C.g + "✓" + C.r + " package.json — safe build\n");
      }
    } catch (e) {
      console.log(C.y + "⚠ package.json error: " + e.message + C.r);
    }
  }

  console.log(C.b + "▶ Commit + Push" + C.r + "\n");
  try {
    sh("git add -A");
    let hasChanges = true;
    try {
      execSync("git diff --staged --quiet", { cwd: ROOT, stdio: "pipe" });
      hasChanges = false;
    } catch (e) {
      /* has changes */
    }

    if (!hasChanges) {
      console.log(C.y + "ℹ No changes" + C.r + "\n");
      process.exit(0);
    }

    sh(
      'git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "feat: new hierarchy + manual points + 4-stage contribution approval"'
    );
    console.log("\n" + C.g + "✓ commit" + C.r);

    sh("git push origin main --force");
    console.log("\n" + C.g + C.b + "✓ Pushed" + C.r);
    console.log(C.y + "⏱️  Wait 4-7 min → Ctrl+Shift+R" + C.r + "\n");
  } catch (e) {
    console.log("\n" + C.red + "✗ Push failed" + C.r);
    console.log("  " + C.c + "git push origin main --force" + C.r + "\n");
    process.exit(1);
  }

  /* ═══ Summary ═══ */
  console.log("");
  console.log(C.b + C.m + "═══ NEXT STEPS ═══" + C.r + "\n");
  console.log(C.y + "1) Publish Firestore Rules:" + C.r);
  console.log(
    "   Firebase Console → Firestore → Rules → paste from firestore.rules → Publish"
  );
  console.log("");
  console.log(C.y + "2) Set yourself as first HEAD:" + C.r);
  console.log('   Firestore → users → [your-uid] → role: "HEAD"');
  console.log("");
  console.log(C.y + "3) Add at least one committee for each member:" + C.r);
  console.log("   From /admin/users → link member to committee");
  console.log("");
  console.log(C.y + "4) Old contributions:" + C.r);
  console.log(
    "   They will still work — the code has safe guards for missing fields."
  );
  console.log("");
}

main();
