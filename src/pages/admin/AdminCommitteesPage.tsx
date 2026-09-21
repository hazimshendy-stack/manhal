import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { updateOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { committees } from '@/data/committees';
   import { teams } from '@/data/teams';
   import { hoursToPoints } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import type { Member } from '@/types';

   export function AdminCommitteesPage() {
     const { user: me } = useAuth();
     const { data: members, loading } = useCollection<Member>('members');
     const [busy, setBusy] = useState<string | null>(null);

     const toggleCommittee = async (
       member: Member,
       committeeId: string,
     ) => {
       setBusy(member.id + '-' + committeeId);
       try {
         const has = member.committeeIds.includes(committeeId);
         const newIds = has
           ? member.committeeIds.filter((c) => c !== committeeId)
           : [...member.committeeIds, committeeId];
         await updateOne('members', member.id, { committeeIds: newIds });
         await logAudit(
           me,
           has ? 'REMOVE_FROM_COMMITTEE' : 'ADD_TO_COMMITTEE',
           'Member',
           member.id,
           committeeId,
         );
         toast.success(has ? 'تم الإزالة' : 'تم الإضافة');
       } catch {
         toast.error('فشل التحديث');
       } finally {
         setBusy(null);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="اللجان"
           description="توزيع الأعضاء على اللجان بضغطة واحدة."
         />

         {loading ? (
           <SkeletonList count={5} />
         ) : members.length === 0 ? (
           <EmptyState
             icon="🏛️"
             title="لا أعضاء"
             message="أضف أعضاء أولًا لتوزيعهم على اللجان."
           />
         ) : (
           <section className="section">
             <SectionHeader
               eyebrow="القائمة"
               title={'الأعضاء (' + members.length + ')'}
             />
             <div className="stack">
               {members.map((m) => (
                 <div key={m.id} className="card no-click">
                   <div
                     style={{
                       display: 'flex',
                       gap: 12,
                       alignItems: 'center',
                     }}
                   >
                     <Avatar name={m.name} size={44} variant="navy" />
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="card__title">{m.name}</div>
                       <div className="card__meta">
                         {teams
                           .filter((t) => m.teamIds.includes(t.id))
                           .map((t) => t.name)
                           .join(' · ')}
                         {' · '}
                         {hoursToPoints(m.hours)} نقطة
                       </div>
                     </div>
                   </div>

                   <div className="chips mt-3">
                     {committees.map((c) => {
                       const has = m.committeeIds.includes(c.id);
                       const isBusy = busy === m.id + '-' + c.id;
                       return (
                         <button
                           key={c.id}
                           type="button"
                           disabled={isBusy}
                           className={cx('chip', has && 'is-active')}
                           onClick={() => toggleCommittee(m, c.id)}
                         >
                           {c.icon} {c.nameAr}
                           {has ? ' ✓' : ''}
                         </button>
                       );
                     })}
                   </div>

                   {m.committeeIds.length > 0 ? (
                     <div className="row mt-3" style={{ gap: 6 }}>
                       <span className="small muted">مسجّل في:</span>
                       {committees
                         .filter((c) => m.committeeIds.includes(c.id))
                         .map((c) => (
                           <Badge
                             key={c.id}
                             variant="info"
                           >
                             {c.icon} {c.nameAr}
                           </Badge>
                         ))}
                     </div>
                   ) : null}
                 </div>
               ))}
             </div>
           </section>
         )}
       </div>
     );
   }

   // helper محلي
   import { cx } from '@/lib/format';
   