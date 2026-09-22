import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextInput, TextArea, DateInput, TimeInput, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { CalendarEvent, TeamId } from '@/types';

   const EMPTY: Omit<CalendarEvent, 'id'> = { title: '', description: '', date: new Date().toISOString().slice(0, 10), time: '', endTime: '', teamId: null, isPublic: true, type: 'meeting', location: '', seasonId: 'S7', createdBy: '', createdByName: '' };

   export function AdminCalendarPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<CalendarEvent>('calendar');
     const [editing, setEditing] = useState<CalendarEvent | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<CalendarEvent, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<CalendarEvent | null>(null);
     const [busy, setBusy] = useState(false);
     const sorted = [...data].sort((a, b) => (a.date > b.date ? 1 : -1));
     const openCreate = () => { setForm({ ...EMPTY, createdBy: me?.uid ?? '', createdByName: me?.displayName ?? '' }); setCreating(true); setEditing(null); };
     const openEdit = (e: CalendarEvent) => { setForm({ title: e.title, description: e.description || '', date: e.date, time: e.time || '', endTime: e.endTime || '', teamId: e.teamId ?? null, isPublic: e.isPublic ?? true, type: e.type || 'meeting', location: e.location || '', seasonId: e.seasonId || 'S7', createdBy: e.createdBy || '', createdByName: e.createdByName || '' }); setEditing(e); setCreating(false); };
     const close = () => { setCreating(false); setEditing(null); };
     const save = async () => {
       if (!form.title.trim() || !form.date) { toast.error('Title & date required'); return; }
       setBusy(true);
       try {
         const payload = { ...form, teamId: form.isPublic ? null : form.teamId };
         if (editing) { await updateOne('calendar', editing.id, payload); toast.success('Updated'); }
         else { const id = 'EVT-' + Date.now().toString(36).toUpperCase(); await createOne('calendar', { id, ...payload }); toast.success('Added'); }
         close();
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('calendar', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Calendar" description="Manage events." />
         <SectionHeader eyebrow="List" title={'Events (' + data.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Event</button>} />
         {loading ? <SkeletonList count={5} /> : sorted.length === 0 ? <EmptyState title="No events" message="Add the first event." /> : (
           <div className="stack">{sorted.map((e) => {
             const team = e.teamId ? teams.find((t) => t.id === e.teamId) : null;
             return (
               <div key={e.id} className="card no-click">
                 <div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{e.title}</div><div className="card__meta">{formatDate(e.date)}{e.time ? ' · ' + e.time : ''}</div></div><Badge variant={e.isPublic ? 'info' : 'neutral'}>{e.isPublic ? 'Public' : team?.name || 'Team'}</Badge></div>
                 <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                   <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(e)}>Edit</button>
                   <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(e)}>Delete</button>
                 </div>
               </div>
             );
           })}</div>
         )}
         <Modal open={creating || editing !== null} title={editing ? 'Edit Event' : 'New Event'} onClose={close} wide
           footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
           <FormField label="Title" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
           <FormField label="Description"><TextArea value={form.description || ''} onChange={(v) => setForm({ ...form, description: v })} rows={2} /></FormField>
           <FormField label="Date" required><DateInput value={form.date} onChange={(v) => setForm({ ...form, date: v })} /></FormField>
           <FormField label="Start time"><TimeInput value={form.time || ''} onChange={(v) => setForm({ ...form, time: v })} /></FormField>
           <FormField label="End time"><TimeInput value={form.endTime || ''} onChange={(v) => setForm({ ...form, endTime: v })} /></FormField>
           <FormField label="Type"><Select value={form.type || 'meeting'} onChange={(v) => setForm({ ...form, type: v as CalendarEvent['type'] })} options={[{ value: 'meeting', label: 'Meeting' }, { value: 'event', label: 'Event' }, { value: 'workshop', label: 'Workshop' }, { value: 'deadline', label: 'Deadline' }]} /></FormField>
           <FormField label="Scope" required><Select value={form.isPublic ? 'public' : form.teamId ?? 'helpers'} onChange={(v) => { if (v === 'public') setForm({ ...form, isPublic: true, teamId: null }); else setForm({ ...form, isPublic: false, teamId: v as TeamId }); }} options={[{ value: 'public', label: 'Public' }, ...teams.map((t) => ({ value: t.id, label: 'Team ' + t.name }))]} /></FormField>
           <FormField label="Location"><TextInput value={form.location || ''} onChange={(v) => setForm({ ...form, location: v })} /></FormField>
         </Modal>
         <ConfirmDialog open={toDelete !== null} title="Delete Event" message={'Delete "' + (toDelete?.title || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
       </div>
     );
   }
   