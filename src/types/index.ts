export type RoleId =
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
