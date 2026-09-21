import type { Conversation, Message } from '@/types';

 export const conversations: Conversation[] = [
   {
     id: 'CONV-GENERAL',
     type: 'general',
     title: 'المحادثة العامة',
     participantUids: [],
     lastMessageAt: '2026-05-02T20:00:00.000Z',
     lastMessageText: 'أهلاً بالجميع في المنصة الجديدة!',
     lastMessageSender: 'ياسين عبد الرحمن',
     createdBy: 'seed-u-001',
   },
   {
     id: 'CONV-TEAM-helpers',
     type: 'team',
     title: 'فريق المساعدون',
     teamId: 'helpers',
     participantUids: [],
     lastMessageAt: '2026-05-01T18:30:00.000Z',
     lastMessageText: 'جدول الأسبوع جاهز.',
     lastMessageSender: 'أحمد فؤاد',
   },
   {
     id: 'CONV-TEAM-coders',
     type: 'team',
     title: 'فريق المبرمجون',
     teamId: 'coders',
     participantUids: [],
     lastMessageAt: '2026-05-02T15:00:00.000Z',
     lastMessageText: 'المكتبة جاهزة للنشر.',
     lastMessageSender: 'ملك هشام',
   },
   {
     id: 'CONV-PRIVATE-001',
     type: 'private',
     title: '',
     participantUids: ['seed-u-001', 'seed-u-003'],
     lastMessageAt: '2026-05-02T12:00:00.000Z',
     lastMessageText: 'سأراجع الطلب حالًا.',
     lastMessageSender: 'ياسين عبد الرحمن',
   },
 ];

 export const messages: Message[] = [
   {
     id: 'MSG001',
     conversationId: 'CONV-GENERAL',
     senderUid: 'seed-u-001',
     senderName: 'ياسين عبد الرحمن',
     text: 'أهلاً بالجميع في المنصة الجديدة!',
     sentAt: '2026-05-02T20:00:00.000Z',
   },
   {
     id: 'MSG002',
     conversationId: 'CONV-TEAM-helpers',
     senderUid: 'seed-u-008',
     senderName: 'أحمد فؤاد',
     text: 'جدول الأسبوع جاهز.',
     sentAt: '2026-05-01T18:30:00.000Z',
   },
   {
     id: 'MSG003',
     conversationId: 'CONV-TEAM-coders',
     senderUid: 'seed-u-002',
     senderName: 'ملك هشام',
     text: 'المكتبة جاهزة للنشر.',
     sentAt: '2026-05-02T15:00:00.000Z',
   },
   {
     id: 'MSG004',
     conversationId: 'CONV-PRIVATE-001',
     senderUid: 'seed-u-003',
     senderName: 'سلمى عادل',
     text: 'هل راجعت طلب الترقية؟',
     sentAt: '2026-05-02T11:30:00.000Z',
   },
   {
     id: 'MSG005',
     conversationId: 'CONV-PRIVATE-001',
     senderUid: 'seed-u-001',
     senderName: 'ياسين عبد الرحمن',
     text: 'سأراجع الطلب حالًا.',
     sentAt: '2026-05-02T12:00:00.000Z',
   },
 ];
 