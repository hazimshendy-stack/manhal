export interface ContributionApproval {
  stage: 1 | 2 | 3;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedBy?: string;
  approvedByName?: string;
  approvedByRole?: string;
  approvedAt?: string;
  comment?: string;
  points?: number;
}

// src/types.ts
// Reconstructed type surface referenced across the codebase.

// [auto-fix] v7 role union
export type RoleId =
  | 'HEAD'
  | 'VICE'
  | 'HEAD_HR_GLOBAL'
  | 'PRESIDENT'
  | 'VICE_PRESIDENT'
  | 'HR'
  | 'COMMITTEE_HR'
  | 'MEMBER'
  | 'VIEWER';

// [auto-fix] v7 team ids
// [auto-fix] v7 team union
export type TeamId =
  | 'helpers'
  | 'coders'
  | 'innovators'
  | 'heroes'
  | 'messengers'
  | 'rstc'
  | 'track';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive' | 'suspended';
export type MemberStatus = 'active' | 'inactive' | 'suspended';
export type RequestStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
export type RequestType =
  | 'TRANSFER'
  | 'PROMOTION'
  | 'RESIGNATION'
  | 'COMPLAINT'
  | 'SUGGESTION'
  | 'LEAVE';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ContributionStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'blocked_no_approver';

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
  teamId?: TeamId;
  headId?: string;
  hrId?: string;
  description?: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  realName?: string;
  fullName?: string;
  role: RoleId;
  status: UserStatus;
  teamId?: TeamId | null;
  committeeId?: string | null;
  memberId?: string | null;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  id: string;
  name: string;
  role: RoleId;
  teamIds: TeamId[];
  committeeIds: string[];
  joinedSeason: number;
  hours: number;
  points: number;
  status: MemberStatus;
  bio?: string;
  email?: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName?: string;
  teamId: TeamId | null;
  committeeId?: string | null;
  category?: string;
  title: string;
  description?: string;
  date: string;
  hours: number;
  points: number;
  status: ContributionStatus;
  seasonId?: string;
  createdBy?: string;
  currentStage?: 1 | 2 | 3 | 4;
  approvals?: ContributionApproval[];
  // [auto-fix] v7.1 routing fields
  pendingApproverId?: string | null;
  pendingApproverRole?: string | null;
  blockedReason?: string | null;
}

export interface ApprovalStep {
  id: string;
  requestId: string;
  order: number;
  requiredRole: RoleId;
  requiredTeamId: TeamId | null;
  status: ApprovalStatus;
  approverUid?: string | null;
  approverName?: string | null;
  comment?: string | null;
  decidedAt?: string | null;
}

export interface RequestRecord {
  id: string;
  type: RequestType;
  requesterUid: string;
  requesterMemberId: string;
  requesterName: string;
  subjectMemberId?: string;
  title: string;
  description: string;
  status: RequestStatus;
  currentStepOrder: number;
  priority: Priority;
  submittedAt: string;
  updatedAt: string;
  seasonId: string;
  fromTeamId?: TeamId;
  toTeamId?: TeamId;
  /** Parallel single-step approval: either team head OR team HR head is sufficient. */
  parallelApproval?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  route?: string;
  priority?: 'low' | 'normal' | 'high';
  source?: string;
  senderName?: string;
}

export interface GovernanceFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface GovernanceDocument {
  id: string;
  title: string;
  category: string;
  description?: string;
  content: string;
  version: string;
  updatedAt: string;
  files?: GovernanceFile[];
}

export interface AuditEntry {
  id: string;
  actorUid: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  note?: string;
  date: string;
}

export interface PostRecord {
  id: string;
  authorUid: string;
  authorMemberId: string;
  authorTeamId: TeamId;
  authorCommitteeId: string;
  title: string;
  body: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  stage: 1 | 2 | 3;
  points: number;
  createdAt: string;
}

export interface PointsLedgerEntry {
  id: string;
  memberId: string;
  postId: string;
  approverUid: string;
  points: number;
  awardedAt: string;
}
