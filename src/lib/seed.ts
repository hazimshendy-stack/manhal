import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { createOne, listAll } from './db';

   export interface SeedResult {
     teams: number;
     committees: number;
     members: number;
     contributions: number;
   }

   export async function seedAll(): Promise<SeedResult> {
     const existing = await listAll('teams').catch(() => []);
     if (existing.length > 0) {
       throw new Error('Data already exists. Clear Firestore collections to re-seed.');
     }
     for (const t of teams) await createOne('teams', t);
     for (const c of committees) await createOne('committees', c);
     return {
       teams: teams.length,
       committees: committees.length,
       members: 0,
       contributions: 0,
     };
   }
   