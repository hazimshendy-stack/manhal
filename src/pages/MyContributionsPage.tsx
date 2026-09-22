import { useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection, useCollection } from '@/lib/useRealtimeCollection';
   import { createOne, newId, today } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { newContributionApprovals } from '@/lib/contributionApprovals';
   import { safeArray, safeNumber } from '@/lib/safe';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { FormField, TextInput, NumberInput, TextArea, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Contribution, TeamId, Committee } from '@/types';

   const STAGE_LABEL: Record<number, string> = { 1: 'Committee HR', 2: 'Team Head HR / Head', 3: 'Sub-Branches Review' };

   function getStage(c: Contribution): 1 | 2 | 3 | 4 {
     const s = c.currentStage;
     if (s === 1 || s === 2 || s === 3 || s === 4) return s;
     if (c.status === 'approved' || c.status === 'rejected') return 4;
     return 1;
   }

   export function MyContributionsPage() {
     const { user } = useAuth();
     const { data: contributions, loading } = useRealtimeCollection<Contribution>('contributions');
     const { data: liveCommittees } = useCollection<Committee>('committees');
     const [open, setOpen] = useState(false);
     const [busy, setBusy] = useState(false);
     const [title, setTitle] = useState('');
     const [desc, setDesc] = useState('');
     const [hours, setHours] = useState(1);
     const [teamId, setTeamId] = useState<TeamId>('helpers');
     const [committeeId, setCommitteeId] = useState<string>('');

     if (!user?.memberId) return <div className="container"><EmptyState title="No member linked" message="Your account is not linked to a member." /></div>;

     const userCommittees = safeArray(user.committeeIds);
     const myContribs = safeArray(contributions).filter((c) => c.memberId === user.memberId).sort((a, b) => (a.date < b.date ? 1 : -1));
     const approved = myContribs.filter((c) => c.status === 'approved');
     const totalPoints = approved.reduce((s, c) => s + safeNumber(c.points), 0);
     const totalHours = approved.reduce((s, c) => s + safeNumber(c.hours), 0);
     const pending = myContribs.filter((c) => c.status === 'pending' || c.status === 'in_review').length;

     const reset = () => { setTitle(''); setDesc(''); setHours(1); };

     const submit = async () => {
       if (!title.trim() || !desc.trim()) { toast.error('Title & description required'); return; }
       if (hours <= 0) { toast.error('Hours must be positive'); return; }
       if (!committeeId) { toast.error('Committee required'); return; }
       setBusy(true);
       try {
         const contrib: Contribution = {
           id: newId('C'), memberId: user.memberId!, memberName: user.displayName,
           teamId, committeeId, title: title.trim(), description: desc.trim(),
           date: today(), hours, points: 0, status: 'pending', seasonId: 'S7',
           createdBy: user.uid, approvals: newContributionApprovals(), currentStage: 1,
         };
         await createOne('contributions', contrib);
         try { await logAudit(user, 'CREATE_CONTRIBUTION', 'Contribution', contrib.id, 'Log contribution'); } catch { /* ignore */ }
         toast.success('Submitted', 'Awaiting committee HR approval');
         setOpen(false); reset();
       } catch (err) { toast.error('Failed', err instanceof Error ? err.message : ''); }
       finally { setBusy(false); }
     };

     return (
       <div className="container">
         <PageHeader eyebrow="My Contributions" title="My Contributions" description="Log contributions. Committee HR assigns points.">
           <button type="button" className="btn btn--primary mt-4" onClick={() => setOpen(true)}>+ Log Contribution</button>
         </PageHeader>
         <section className="section--tight"><StatRow>
           <Stat value={totalPoints} label="Points" variant="red" />
           <Stat value={totalHours} label="Hours" />
           <Stat value={myContribs.length} label="Contributions" />
           <Stat value={pending} label="Pending" />
         </StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="History" title="All Contributions" />
           {loading ? <SkeletonList count={5} /> : myContribs.length === 0 ? (
             <EmptyState title="No contributions yet" message="Log your first contribution." />
           ) : (
             <div className="stack">{myContribs.map((c) => {
               const team = teams.find((t) => t.id === c.teamId);
               const committee = liveCommittees.find((x) => x.id === c.committeeId);
               const stage = getStage(c);
               const approvals = safeArray(c.approvals);
               return (
                 <div key={c.id} className="card no-click">
                   <div className="row row--between">
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="card__title">{c.title}</div>
                       <div className="card__meta">{team?.name} · {committee?.nameAr || c.committeeId} · {formatDate(c.date)}</div>
                     </div>
                     <Badge variant={c.status === 'approved' ? 'success' : c.status === 'pending' ? 'info' : c.status === 'in_review' ? 'warning' : 'danger'}>
                       {c.status === 'approved' ? 'Approved' : c.status === 'pending' ? 'Stage 1' : c.status === 'in_review' ? 'Stage ' + stage + '/3' : 'Rejected'}
                     </Badge>
                   </div>
                   <p className="small soft mt-2">{c.description}</p>
                   <div className="row mt-3" style={{ gap: 12 }}>
                     <span className="small">{safeNumber(c.hours)} hours</span>
                     {c.status === 'approved' ? <span className="points">{safeNumber(c.points)} points</span> : <span className="muted small">Points pending</span>}
                   </div>
                   {c.status !== 'approved' && c.status !== 'rejected' ? (
                     <div className="mt-3" style={{ paddingTop: 12, borderTop: '1px solid var(--c-line)' }}>
                       <div className="tiny muted" style={{ marginBottom: 8 }}>Approval Progress</div>
                       <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                         {[1, 2, 3].map((s) => {
                           const apr = approvals.find((a) => a.stage === s);
                           const isDone = apr?.status === 'approved';
                           const isRej = apr?.status === 'rejected';
                           const isActive = stage === s;
                           return <span key={s} className={'badge ' + (isDone ? 'badge--success' : isRej ? 'badge--danger' : isActive ? 'badge--warning' : 'badge--neutral')}>{s}. {STAGE_LABEL[s]}{isDone ? ' ✓' : ''}</span>;
                         })}
                       </div>
                     </div>
                   ) : null}
                 </div>
               );
             })}</div>
           )}
         </section>
         <Modal open={open} title="Log New Contribution" onClose={() => setOpen(false)} wide
           footer={<><button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="btn btn--primary" onClick={submit} disabled={busy}>{busy ? '...' : 'Submit'}</button></>}>
           <FormField label="Title" required><TextInput value={title} onChange={setTitle} /></FormField>
           <FormField label="Description" required><TextArea value={desc} onChange={setDesc} rows={3} /></FormField>
           <FormField label="Team" required><Select value={teamId} onChange={(v) => setTeamId(v as TeamId)} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
           <FormField label="Committee" required hint="Points will be assigned by committee HR">
             <Select value={committeeId} onChange={setCommitteeId}
               options={[{ value: '', label: '— Select —' }, ...liveCommittees.filter((c) => userCommittees.includes(c.id)).map((c) => ({ value: c.id, label: c.nameAr }))]} />
           </FormField>
           <FormField label="Hours" required hint="Approximate — committee HR assigns final points"><NumberInput value={hours} onChange={setHours} min={0.5} max={200} step={0.5} /></FormField>
         </Modal>
       </div>
     );
   }
   