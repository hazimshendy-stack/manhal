import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { members } from '@/data/members';
   import { contributions } from '@/data/contributions';
   import { requests } from '@/data/requests';
   import { approvals } from '@/data/approvals';
   import { warnings } from '@/data/warnings';
   import { achievements } from '@/data/achievements';
   import { notifications } from '@/data/notifications';
   import { conversations, messages } from '@/data/conversations';
   import { calendarEvents } from '@/data/calendar';
   import { governanceDocuments } from '@/data/governance';
   import { createOne, listAll } from './db';

   export interface SeedResult {
     teams: number;
     committees: number;
     members: number;
     contributions: number;
     requests: number;
     approvals: number;
     warnings: number;
     achievements: number;
     notifications: number;
     conversations: number;
     messages: number;
     calendar: number;
     governance: number;
   }

   export async function seedAll(): Promise<SeedResult> {
     const existingTeams = await listAll('teams').catch(() => []);
     if (existingTeams.length > 0) {
       throw new Error(
         'البيانات موجودة مسبقًا. امسح المجموعات من Firebase Console إن أردت إعادة الرفع.',
       );
     }

     for (const t of teams) await createOne('teams', t);
     for (const c of committees) await createOne('committees', c);
     for (const m of members) await createOne('members', m);
     for (const c of contributions) await createOne('contributions', c);
     for (const r of requests) await createOne('requests', r);
     for (const a of approvals) await createOne('approvals', a);
     for (const w of warnings) await createOne('warnings', w);
     for (const a of achievements) await createOne('achievements', a);
     for (const n of notifications) await createOne('notifications', n);
     for (const c of conversations) await createOne('conversations', c);
     for (const m of messages) await createOne('messages', m);
     for (const e of calendarEvents) await createOne('calendar', e);
     for (const g of governanceDocuments) await createOne('governance', g);

     return {
       teams: teams.length,
       committees: committees.length,
       members: members.length,
       contributions: contributions.length,
       requests: requests.length,
       approvals: approvals.length,
       warnings: warnings.length,
       achievements: achievements.length,
       notifications: notifications.length,
       conversations: conversations.length,
       messages: messages.length,
       calendar: calendarEvents.length,
       governance: governanceDocuments.length,
     };
   }
   