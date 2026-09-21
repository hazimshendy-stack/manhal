import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { toast } from '@/components/ui/Toast';
   import { relativeTime } from '@/lib/format';
   import type { Conversation, TeamId } from '@/types';

   export function AdminConversationsPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<Conversation>('conversations');
     const [toDelete, setToDelete] = useState<Conversation | null>(null);
     const [busy, setBusy] = useState(false);

     const createTeamConv = async (team: (typeof teams)[number]) => {
       const exists = data.some((c) => c.type === 'team' && c.teamId === team.id);
       if (exists) {
         toast.info('المحادثة موجودة بالفعل');
         return;
       }
       setBusy(true);
       try {
         const id = 'CONV-TEAM-' + team.id;
         await createOne('conversations', {
           id,
           type: 'team',
           title: 'فريق ' + team.nameAr,
           teamId: team.id,
           participantUids: [],
           lastMessageAt: new Date().toISOString(),
         });
         await logAudit(me, 'CREATE_CONVERSATION', 'Conversation', id, team.name);
         toast.success('تم إنشاء محادثة الفريق');
       } catch {
         toast.error('فشل الإنشاء');
       } finally {
         setBusy(false);
       }
     };

     const handleDelete = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('conversations', toDelete.id);
         await logAudit(me, 'DELETE_CONVERSATION', 'Conversation', toDelete.id, toDelete.title);
         toast.success('تم الحذف');
         setToDelete(null);
       } catch {
         toast.error('فشل الحذف');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="المحادثات"
           description="إدارة محادثات الفرق والمحادثة العامة."
         />

         <section className="section">
           <SectionHeader
             eyebrow="إنشاء سريع"
             title="محادثات الفرق"
             description="محادثة واحدة لكل فريق — تُنشأ تلقائيًا لكل فريق."
           />
           <div className="chips">
             {teams.map((t) => {
               const exists = data.some(
                 (c) => c.type === 'team' && c.teamId === t.id,
               );
               return (
                 <button
                   key={t.id}
                   type="button"
                   disabled={busy || exists}
                   className={'chip' + (exists ? ' is-active' : '')}
                   onClick={() => createTeamConv(t)}
                 >
                   {t.name} {exists ? '✓' : '+'}
                 </button>
               );
             })}
           </div>
         </section>

         <section className="section">
           <SectionHeader
             eyebrow="القائمة"
             title={'المحادثات (' + data.length + ')'}
           />
           {loading ? (
             <SkeletonList count={5} />
           ) : data.length === 0 ? (
             <EmptyState
               icon="💬"
               title="لا محادثات"
               message="أنشئ محادثات الفرق من الأعلى."
             />
           ) : (
             <div className="stack">
               {data.map((c) => {
                 const team = c.teamId ? teams.find((t) => t.id === c.teamId) : null;
                 return (
                   <div key={c.id} className="card no-click">
                     <div className="row row--between">
                       <div style={{ flex: 1, minWidth: 0 }}>
                         <div className="card__title">
                           {c.title ||
                             (c.type === 'general'
                               ? 'المحادثة العامة'
                               : team?.name)}
                         </div>
                         <div className="card__meta">
                           {c.type === 'general'
                             ? 'عام'
                             : c.type === 'team'
                               ? 'فريق'
                               : 'خاصة'}
                           {c.lastMessageAt
                             ? ' · ' + relativeTime(c.lastMessageAt)
                             : ''}
                         </div>
                       </div>
                       <Badge
                         variant={
                           c.type === 'general'
                             ? 'red'
                             : c.type === 'team'
                               ? 'info'
                               : 'neutral'
                         }
                       >
                         {c.type}
                       </Badge>
                     </div>

                     {c.type !== 'general' ? (
                       <div
                         className="row mt-3"
                         style={{ justifyContent: 'flex-end' }}
                       >
                         <button
                           type="button"
                           className="btn btn--danger btn--xs"
                           onClick={() => setToDelete(c)}
                         >
                           حذف
                         </button>
                       </div>
                     ) : null}
                   </div>
                 );
               })}
             </div>
           )}
         </section>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف المحادثة"
           message="سيتم حذف المحادثة وكل رسائلها."
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   