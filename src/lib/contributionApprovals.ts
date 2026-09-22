import { updateOne, getOne, now } from './db';
   import { notifyUser } from './notifications';
   import { logAudit } from './audit';
   import { safeNumber } from './safe';
   import type { Contribution, ContributionApproval, AppUser } from '@/types';

   /* ═══════════════════════════════════════════════════════════════
      3-stage approval — points assigned by Committee HR (flexible).
      Stage 1: Committee HR (mandatory, assigns points)
      Stage 2: Team Head HR OR Team Head (one of them)
      Stage 3: Head HR Global OR Head Sub Branches OR Vice (one of them)
      ═══════════════════════════════════════════════════════════════ */

   function getStage(c: Contribution): 1 | 2 | 3 | 4 {
     const s = c.currentStage;
     if (s === 1 || s === 2 || s === 3 || s === 4) return s;
     if (c.status === 'approved' || c.status === 'rejected') return 4;
     return 1;
   }

   function getApprovals(c: Contribution): ContributionApproval[] {
     if (Array.isArray(c.approvals) && c.approvals.length > 0) return [...c.approvals];
     return [
       { stage: 1, status: 'pending' },
       { stage: 2, status: 'pending' },
       { stage: 3, status: 'pending' },
     ];
   }

   export function newContributionApprovals(): ContributionApproval[] {
     return [
       { stage: 1, status: 'pending' },
       { stage: 2, status: 'pending' },
       { stage: 3, status: 'pending' },
     ];
   }

   /* ═══════════ Approve current stage ═══════════ */

   export async function approveContributionStage(
     contribution: Contribution,
     user: AppUser,
     points?: number,
     comment?: string,
   ): Promise<void> {
     const stage = getStage(contribution);
     if (stage < 1 || stage > 3) throw new Error('Invalid stage');

     const approvals = getApprovals(contribution);
     const idx = approvals.findIndex((a) => a.stage === stage);

     const newApproval: ContributionApproval = {
       stage: stage as 1 | 2 | 3,
       status: 'approved',
       approvedBy: user.uid,
       approvedByName: user.displayName,
       approvedByRole: user.role,
       approvedAt: now(),
       comment: comment?.trim() || undefined,
       points: stage === 1 && typeof points === 'number' ? points : undefined,
     };

     if (idx >= 0) approvals[idx] = newApproval;
     else approvals.push(newApproval);

     let updatedPoints = safeNumber(contribution.points);

     if (stage === 1) {
       if (typeof points !== 'number') throw new Error('Points must be assigned at stage 1');
       updatedPoints = points;
     }

     if (stage === 3) {
       /* ─── Final approval: award points, update member, notify ─── */
       await updateOne('contributions', contribution.id, {
         approvals,
         points: updatedPoints,
         status: 'approved',
         currentStage: 4,
       });

       /* Award points to member */
       if (updatedPoints > 0) {
         try {
           const member = await getOne<{ points?: number; hours?: number }>('members', contribution.memberId);
           if (member) {
             await updateOne('members', contribution.memberId, {
               points: safeNumber(member.points) + updatedPoints,
               hours: safeNumber(member.hours) + safeNumber(contribution.hours),
             });
           }
         } catch (e) { console.warn('Member update failed:', e); }
       }

       /* Notify member */
       try {
         await notifyUser(
           contribution.createdBy || '',
           'Contribution approved',
           '"' + contribution.title + '" — +' + updatedPoints + ' points',
           'participation',
           '/my-contributions',
           'high',
           user.displayName,
         );
       } catch (e) { /* ignore */ }

       try { await logAudit(user, 'APPROVE_CONTRIBUTION_FINAL', 'Contribution', contribution.id, contribution.title); } catch (e) { /* ignore */ }
     } else {
       /* Move to next stage */
       const nextStage = (stage + 1) as 2 | 3;
       await updateOne('contributions', contribution.id, {
         approvals,
         points: updatedPoints,
         status: 'in_review',
         currentStage: nextStage,
       });

       try {
         await notifyUser(
           contribution.createdBy || '',
           'Contribution progressing',
           '"' + contribution.title + '" — stage ' + nextStage + ' of 3',
           'approval',
           '/my-contributions',
           'normal',
           user.displayName,
         );
       } catch (e) { /* ignore */ }

       try { await logAudit(user, 'APPROVE_CONTRIBUTION_STAGE', 'Contribution', contribution.id, 'Stage ' + stage); } catch (e) { /* ignore */ }
     }
   }

   /* ═══════════ Reject ═══════════ */

   export async function rejectContributionStage(
     contribution: Contribution,
     user: AppUser,
     comment: string,
   ): Promise<void> {
     if (!comment.trim()) throw new Error('Reason required');

     const stage = getStage(contribution);
     const approvals = getApprovals(contribution);
     const idx = approvals.findIndex((a) => a.stage === stage);

     const newApproval: ContributionApproval = {
       stage: stage as 1 | 2 | 3,
       status: 'rejected',
       approvedBy: user.uid,
       approvedByName: user.displayName,
       approvedByRole: user.role,
       approvedAt: now(),
       comment: comment.trim(),
     };

     if (idx >= 0) approvals[idx] = newApproval;
     else approvals.push(newApproval);

     for (let s = stage + 1; s <= 3; s++) {
       if (!approvals.some((a) => a.stage === s)) {
         approvals.push({ stage: s as 1 | 2 | 3, status: 'skipped' });
       }
     }

     await updateOne('contributions', contribution.id, { approvals, status: 'rejected' });

     try {
       await notifyUser(
         contribution.createdBy || '',
         'Contribution rejected',
         '"' + contribution.title + '" — ' + comment,
         'participation',
         '/my-contributions',
         'high',
         user.displayName,
       );
     } catch (e) { /* ignore */ }

     try { await logAudit(user, 'REJECT_CONTRIBUTION', 'Contribution', contribution.id, comment); } catch (e) { /* ignore */ }
   }
   