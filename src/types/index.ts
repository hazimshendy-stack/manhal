export type RoleId =
   | 'HEAD'
   | 'VICE'
   | 'HEAD_HR'
   | 'PRESIDENT'
   | 'VICE_PRESIDENT'
   | 'HR'
   | 'MEMBER'
   | 'VIEWER';

 export type TeamId =
   | 'helpers'
   | 'heroes'
   | 'coders'
   | 'enviros'
   | 'messages'
   | 'masar'
   | 'rstc';

 export type RequestType =
   | 'TRANSFER'
   | 'PROMOTION'
   | 'RESIGNATION'
   | 'COMPLAINT'
   | 'SUGGESTION'
   | 'LEAVE';

 export type RequestStatus =
   | 'PENDING'
   | 'IN_REVIEW'
   | 'APPROVED'
   | 'REJECTED'
   | 'CANCELLED'
   | 'COMPLETED';

 export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';

 export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

 export type ContributionStatus = 'pending' | 'approved' | 'rejected';

 export type ConversationType = 'private' | 'team' | 'general';

 export type NotificationType =
   | 'approval'
   | 'request'
   | 'participation'
   | 'achievement'
   | 'system'
   | 'warning'
   | 'message';

 /* ═══════════ المستخدم ═══════════ */

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

 /* ═══════════ الأدوار ═══════════ */

 export interface Role {
   id: RoleId;
   name: string;
   nameEn: string;
   level: number;
 }

 /* ═══════════ الفرق ═══════════ */

 export interface Team {
   id: TeamId;
   name: string;
   nameAr: string;
   description: string;
   color: string;
 }

 /* ═══════════ اللجان ═══════════ */

 export interface Committee {
   id: string;
   name: string;
   nameAr: string;
   description: string;
   color: string;
   icon: string;
 }

 /* ═══════════ الأعضاء ═══════════ */

 export interface Member {
   id: string;
   name: string;
   role: RoleId;
   teamIds: TeamId[];
   committeeIds: string[];
   joinedSeason: number;
   hours: number;
   status: 'active' | 'inactive' | 'suspended';
   bio?: string;
   email?: string;
   linkedUserId?: string;
 }

 /* ═══════════ المشاركات (سابقًا مساهمات) ═══════════ */

 export interface Contribution {
   id: string;
   memberId: string;
   memberName: string;
   teamId: TeamId;
   committeeId?: string;
   category: string;
   title: string;
   description: string;
   date: string;
   hours: number;
   status: ContributionStatus;
   seasonId: string;
   createdBy: string;
 }

 /* ═══════════ الطلبات ═══════════ */

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

 /* ═══════════ التحذيرات ═══════════ */

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

 /* ═══════════ الإنجازات ═══════════ */

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

 /* ═══════════ الإشعارات ═══════════ */

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

 /* ═══════════ المحادثات (Messenger-style) ═══════════ */

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

 /* ═══════════ التقويم ═══════════ */

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

 /* ═══════════ الخط الزمني ═══════════ */

 export interface TimelineEvent {
   id: string;
   memberId?: string;
   memberName?: string;
   teamId?: TeamId;
   type:
     | 'join'
     | 'contribution'
     | 'promotion'
     | 'transfer'
     | 'achievement'
     | 'warning'
     | 'request'
     | 'approval';
   title: string;
   description?: string;
   date: string;
   relatedId?: string;
 }

 /* ═══════════ سجل التغييرات ═══════════ */

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

 /* ═══════════ الحوكمة ═══════════ */

 export interface GovernanceDocument {
   id: string;
   title: string;
   category: string;
   description: string;
   content: string;
   version: string;
   updatedAt: string;
 }

 /* ═══════════ الإعدادات ═══════════ */

 export interface SiteConfig {
   name: string;
   tagline: string;
   description: string;
   organization: string;
   email: string;
 }

 /* ═══════════ Onboarding ═══════════ */

 export interface OnboardingCard {
   id: string;
   icon: string;
   title: string;
   description: string;
   accentColor: string;
   order: number;
 }

 /* ═══════════ Season ═══════════ */

 export interface Season {
   id: string;
   label: string;
   labelEn: string;
   start: string;
   end: string;
   isActive: boolean;
   theme: string;
 }
 