   import { useState, useMemo } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { adminApproveUser, adminRejectUser } from '@/lib/auth';
   import { logAudit } from '@/lib/audit';
   import { notifyUser } from '@/lib/notifications';
   import { teams } from '@/data/teams';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, Select, MultiSelect, TextArea } from '@/components/ui/FormField';
   import { Badge } from '@/components/ui/Badge';
   import { Avatar } from '@/components/ui/Avatar';
   import { toast } from '@/components/ui/Toast';
   import type { AppUser, RoleId, TeamId, Committee } from '@/types';

   const ROLE_OPTS: Array<{ value: RoleId; label: string }> = (
     Object.entries(ROLE_LABEL) as Array<[RoleId, string]>
   ).map(([value, label]) => ({ value, label }));

   type Tab = 'pending' | 'rejected' | 'all';

   export function AdminPendingUsersPage() {
     const { user: me } = useAuth();
     const { data: users, loading } = useCollection<AppUser>('users');
     const { data: liveCommittees } = useCollection<Committee>('committees');

     const [tab, setTab] = useState<Tab>('pending');

     /* Approve modal */
     const [approveTarget, setApproveTarget] = useState<AppUser | null>(null);
     const [approveRole, setApproveRole] = useState<RoleId>('MEMBER');
     const [approveTeam, setApproveTeam] = useState<TeamId>('helpers');
     const [approveCommittees, setApproveCommittees] = useState<string[]>([]);
     const [approveBusy, setApproveBusy] = useState(false);

     /* Reject modal */
     const [rejectTarget, setRejectTarget] = useState<AppUser | null>(null);
     const [rejectReason, setRejectReason] = useState('');
     const [rejectBusy, setRejectBusy] = useState(false);

     const pending = useMemo(
       () => users.filter((u) => u.status === 'pending'),
       [users],
     );
     const rejected = useMemo(
       () => users.filter((u) => u.status === 'rejected'),
       [users],
     );

     const list = useMemo(() => {
       if (tab === 'pending') return pending;
       if (tab === 'rejected') return rejected;
       return users;
     }, [tab, pending, rejected, users]);

     const committees = useMemo(
       () => liveCommittees.map((c) => ({ id: c.id, nameAr: c.nameAr })),
       [liveCommittees],
     );

     /* ═══════════════════════════════════════════════════════════
        Approve handlers
        ═══════════════════════════════════════════════════════════ */

     const openApprove = (u: AppUser) => {
       setApproveTarget(u);
       setApproveRole('MEMBER');
       setApproveTeam((u.preferredTeamId as TeamId) || 'helpers');
       setApproveCommittees([]);
     };

     const closeApprove = () => {
       setApproveTarget(null);
       setApproveRole('MEMBER');
       setApproveTeam('helpers');
       setApproveCommittees([]);
     };

     const doApprove = async () => {
       if (!approveTarget || !me) return;
       if (approveCommittees.length === 0) {
         toast.error('Committee required', 'Select at least one');
         return;
       }
       setApproveBusy(true);
       try {
         await adminApproveUser(
           approveTarget,
           {
             role: approveRole,
             teamIds: [approveTeam],
             committeeIds: approveCommittees,
           },
           me.uid,
         );

         try {
           await logAudit(
             me,
             'APPROVE_USER',
             'User',
             approveTarget.uid,
             'Approved: ' + approveTarget.displayName,
           );
         } catch { /* ignore */ }

         try {
           await notifyUser(
             approveTarget.uid,
             'Your account is approved! 🎉',
             'Welcome to sbapiaryy. You can now access all features.',
             'system',
             '/dashboard',
             'high',
             me.displayName,
           );
         } catch { /* ignore */ }

         toast.success('User approved', 'They can now log in');
         closeApprove();
       } catch (err) {
         toast.error('Failed', err instanceof Error ? err.message : '');
       } finally {
         setApproveBusy(false);
       }
     };

     /* ═══════════════════════════════════════════════════════════
        Reject handlers
        ═══════════════════════════════════════════════════════════ */

     const openReject = (u: AppUser) => {
       setRejectTarget(u);
       setRejectReason('');
     };

     const closeReject = () => {
       setRejectTarget(null);
       setRejectReason('');
     };

     const doReject = async () => {
       if (!rejectTarget || !me) return;
       if (!rejectReason.trim()) {
         toast.error('Reason required');
         return;
       }
       setRejectBusy(true);
       try {
         await adminRejectUser(rejectTarget.uid, rejectReason, me.uid);
         try {
           await logAudit(
             me,
             'REJECT_USER',
             'User',
             rejectTarget.uid,
             'Rejected: ' + rejectReason,
           );
         } catch { /* ignore */ }

         toast.success('User rejected');
         closeReject();
       } catch (err) {
         toast.error('Failed', err instanceof Error ? err.message : '');
       } finally {
         setRejectBusy(false);
       }
     };

     /* ═══════════════════════════════════════════════════════════
        RENDER
        ═══════════════════════════════════════════════════════════ */

     return (
       <div className="admin-page">
         <PageHeader
           eyebrow="Admin"
           title="Pending Registrations"
           description="Review new sign-ups. Approve them to grant access."
         />

         <div className="chips mb-4">
           <button
             type="button"
             className={'chip' + (tab === 'pending' ? ' is-active' : '')}
             onClick={() => setTab('pending')}
           >
             Pending ({pending.length})
           </button>
           <button
             type="button"
             className={'chip' + (tab === 'rejected' ? ' is-active' : '')}
             onClick={() => setTab('rejected')}
           >
             Rejected ({rejected.length})
           </button>
           <button
             type="button"
             className={'chip' + (tab === 'all' ? ' is-active' : '')}
             onClick={() => setTab('all')}
           >
             All Users ({users.length})
           </button>
         </div>

         <SectionHeader
           eyebrow="List"
           title={
             tab === 'pending'
               ? 'Pending (' + pending.length + ')'
               : tab === 'rejected'
                 ? 'Rejected (' + rejected.length + ')'
                 : 'All Users (' + users.length + ')'
           }
         />

         {loading ? (
           <SkeletonList count={5} />
         ) : list.length === 0 ? (
           <EmptyState
             title="Nothing here"
             message={
               tab === 'pending'
                 ? 'No pending registrations. Everyone is approved.'
                 : 'No users in this view.'
             }
           />
         ) : (
           <div className="stack">
             {list.map((u) => (
               <div key={u.uid} className="card no-click">
                 <div
                   className="row row--between"
                   style={{ gap: 12, alignItems: 'flex-start' }}
                 >
                   <div
                     style={{
                       display: 'flex',
                       gap: 14,
                       alignItems: 'center',
                       flex: 1,
                       minWidth: 0,
                     }}
                   >
                     <Avatar name={u.displayName} size={52} variant="navy" />
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="card__title" style={{ fontSize: '1.05rem' }}>
                         {u.displayName}
                       </div>
                       <div
                         className="card__meta"
                         dir="ltr"
                         style={{ textAlign: 'start' }}
                       >
                         {u.email}
                       </div>
                       {u.createdAt ? (
                         <div className="tiny muted mt-1">
                           Registered {formatDate(u.createdAt)}
                         </div>
                       ) : null}
                     </div>
                   </div>

                   <Badge
                     variant={
                       u.status === 'pending'
                         ? 'warning'
                         : u.status === 'rejected'
                           ? 'danger'
                           : 'success'
                     }
                     dot
                   >
                     {u.status ?? 'active'}
                   </Badge>
                 </div>

                 {/* Extra info */}
                 {(u.preferredTeamId || u.registrationNote) ? (
                   <div
                     className="mt-3"
                     style={{
                       padding: 12,
                       background: 'var(--c-off-white)',
                       border: '1px solid var(--c-line)',
                       borderRadius: 'var(--radius-sm)',
                       fontSize: '0.85rem',
                       lineHeight: 1.7,
                     }}
                   >
                     {u.preferredTeamId ? (
                       <div>
                         <strong>Preferred team:</strong>{' '}
                         {teams.find((t) => t.id === u.preferredTeamId)?.name ??
                           u.preferredTeamId}
                       </div>
                     ) : null}
                     {u.registrationNote ? (
                       <div style={{ marginTop: 4 }}>
                         <strong>Note:</strong> {u.registrationNote}
                       </div>
                     ) : null}
                     {u.rejectionReason ? (
                       <div style={{ marginTop: 4 }}>
                         <strong>Rejection reason:</strong> {u.rejectionReason}
                       </div>
                     ) : null}
                   </div>
                 ) : null}

                 {/* Actions */}
                 {u.status === 'pending' ? (
                   <div
                     className="row mt-4"
                     style={{
                       gap: 8,
                       justifyContent: 'flex-end',
                       paddingTop: 14,
                       borderTop: '1px solid var(--c-line)',
                     }}
                   >
                     <button
                       type="button"
                       className="btn btn--success btn--sm"
                       onClick={() => openApprove(u)}
                     >
                       ✓ Approve
                     </button>
                     <button
                       type="button"
                       className="btn btn--outline-danger btn--sm"
                       onClick={() => openReject(u)}
                     >
                       ✕ Reject
                     </button>
                   </div>
                 ) : null}
               </div>
             ))}
           </div>
         )}

         {/* ═══════════════════════════════════════════════════════
            APPROVE MODAL
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={approveTarget !== null}
           title={'Approve: ' + (approveTarget?.displayName ?? '')}
           onClose={closeApprove}
           wide
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={closeApprove}
                 disabled={approveBusy}
               >
                 Cancel
               </button>
               <button
                 type="button"
                 className="btn btn--success"
                 onClick={doApprove}
                 disabled={approveBusy}
               >
                 {approveBusy ? 'Approving...' : 'Confirm Approval'}
               </button>
             </>
           }
         >
           <p
             className="small muted"
             style={{ marginBottom: 18, lineHeight: 1.7 }}
           >
             Assign a role, team, and committees. The user will get a member
             profile created automatically and will be able to log in
             immediately.
           </p>

           <div
             style={{
               background: 'var(--c-off-white)',
               border: '1px solid var(--c-line)',
               borderRadius: 'var(--radius-sm)',
               padding: 14,
               marginBottom: 18,
               fontSize: '0.9rem',
               lineHeight: 1.8,
             }}
           >
             <div>
               <strong>Name:</strong> {approveTarget?.displayName}
             </div>
             <div style={{ wordBreak: 'break-all' }}>
               <strong>Email:</strong>{' '}
               <span dir="ltr">{approveTarget?.email}</span>
             </div>
           </div>

           <FormField label="Role" required>
             <Select
               value={approveRole}
               onChange={(v) => setApproveRole(v as RoleId)}
               options={ROLE_OPTS}
             />
           </FormField>

           <FormField label="Team" required>
             <Select
               value={approveTeam}
               onChange={(v) => setApproveTeam(v as TeamId)}
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField
             label="Committees"
             required
             hint={committees.length === 0 ? 'Create a committee first' : 'At least one required'}
           >
             <MultiSelect
               values={approveCommittees}
               onChange={setApproveCommittees}
               options={committees.map((c) => ({
                 value: c.id,
                 label: c.nameAr,
               }))}
             />
           </FormField>
         </Modal>

         {/* ═══════════════════════════════════════════════════════
            REJECT MODAL
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={rejectTarget !== null}
           title={'Reject: ' + (rejectTarget?.displayName ?? '')}
           onClose={closeReject}
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={closeReject}
                 disabled={rejectBusy}
               >
                 Cancel
               </button>
               <button
                 type="button"
                 className="btn btn--danger"
                 onClick={doReject}
                 disabled={rejectBusy}
               >
                 {rejectBusy ? 'Rejecting...' : 'Confirm Rejection'}
               </button>
             </>
           }
         >
           <p
             className="small muted"
             style={{ marginBottom: 16, lineHeight: 1.7 }}
           >
             The user will see this reason when they try to access the platform.
           </p>
           <FormField label="Rejection reason" required>
             <TextArea
               value={rejectReason}
               onChange={setRejectReason}
               rows={3}
               placeholder="e.g. We could not verify your affiliation"
             />
           </FormField>
         </Modal>
       </div>
     );
   }
   