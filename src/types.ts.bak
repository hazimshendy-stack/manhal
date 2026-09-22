// src/types.ts
// Reconstructed type surface referenced across the codebase.

export type RoleId =
  | 'MEMBER'
  | 'VIEWER'
  | 'HR'
  | 'COMMITTEE_HR'
  | 'HEAD_HR_TEAM'
  | 'HEAD_HR_GLOBAL'
  | 'PRESIDENT'
  | 'VICE_PRESIDENT'
  | 'HEAD'
  | 'VICE';

export type TeamId =
  | 'helpers'
  | 'heroes'
  | 'coders'
  | 'enviros'
  | 'messages'
  | 'masar'
  | 'rstc'
  | 'mb';

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
export type ContributionStatus = 'pending' | 'approved' | 'rejected';

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
  committeeId?: string | null;
  teamId?: TeamId | null;
  points: number;
  hours: number;
  status: ContributionStatus;
  date?: string;
  description?: string;
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
