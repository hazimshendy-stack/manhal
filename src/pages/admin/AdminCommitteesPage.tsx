import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Committee, Member, TeamId } from '@/types';

   const EMPTY: Omit<Committee, 'id'> = { name: '', nameAr: '', description: '', color: '#151A45', icon: '', teamId: 'helpers' };

   export function AdminCommitteesPage() {
     const { user: me } = useAuth();
     const { data: committees, loading } = useCollection<Committee>('committees');
     const { data: members } = useCollection<Member>('members');
     const [creating, setCreating] = useState(false);
     const [editing, setEditing] = useState<Committee | null>(null);
     const [form, setForm] = useState<Omit<Committee, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<Committee | null>(null);
     const [busy, setBusy] = useState(false);
     const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
     const openEdit = (c: Committee) => { setForm({ name: c.name, nameAr: c.nameAr, description: c.description, color: c.color, icon: c.icon, teamId: c.teamId }); setEditing(c); setCreating(false); };
     const close = () => { setCreating(false); setEditing(null); };
     const save = async () => {
       if (!form.nameAr.trim()) { toast.error('Name required'); return; }
       setBusy(true);
       try {
         const payload = { name: form.name.trim() || form.nameAr.trim(), nameAr: form.nameAr.trim(), description: form.description.trim(), color: form.color, icon: form.icon, teamId: form.teamId };
         if (editing) { await updateOne('committees', editing.id, payload); toast.success('Updated'); }
         else { const id = 'COMM-' + Date.now().toString(36).toUpperCase(); await createOne('committees', { id, ...payload }); toast.success('Added'); }
         close();
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     const del = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('committees', toDelete.id);
         for (const m of members) { if (Array.isArray(m.committeeIds) && m.committeeIds.includes(toDelete.id)) await updateOne('members', m.id, { committeeIds: m.committeeIds.filter((c) => c !== toDelete.id) }); }
         toast.success('Deleted');
         setToDelete(null);
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Committees" description="Add committees like teams. Each member must join at least one." />
         <SectionHeader eyebrow="List" title={'Committees (' + committees.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Committee</button>} />
         {loading ? <SkeletonList count={4} /> : committees.length === 0 ? <EmptyState title="No committees" message="Add your first committee." action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ Add Committee</button>} /> : (
           <div className="grid grid--wide">{committees.map((c) => {
             const count = members.filter((m) => Array.isArray(m.committeeIds) && m.committeeIds.includes(c.id)).length;
             const team = c.teamId ? teams.find((t) => t.id === c.teamId) : null;
             return (
               <div key={c.id} className="card no-click">
                 <div className="row row--between">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{c.nameAr}</div>
                     {team ? <div className="card__meta">Team: {team.name}</div> : null}
                   </div>
                   <span style={{ width: 14, height: 14, borderRadius: 4, background: c.color }} />
                 </div>
                 {c.description ? <p className="small soft mt-3">{c.description}</p> : null}
                 <div className="small muted mt-3">{count} members</div>
                 <div className="row mt-4" style={{ gap: 6, justifyContent: 'flex-end' }}>
                   <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(c)}>Edit</button>
                   <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(c)}>Delete</button>
                 </div>
               </div>
             );
           })}</div>
         )}
         <Modal open={creating || editing !== null} title={editing ? 'Edit Committee' : 'New Committee'} onClose={close}
           footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
           <FormField label="Name (Arabic)" required><TextInput value={form.nameAr} onChange={(v) => setForm({ ...form, nameAr: v })} /></FormField>
           <FormField label="Name (English)"><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
           <FormField label="Team" required><Select value={form.teamId ?? 'helpers'} onChange={(v) => setForm({ ...form, teamId: v as TeamId })} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
           <FormField label="Description"><TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} /></FormField>
           <FormField label="Color"><Select value={form.color} onChange={(v) => setForm({ ...form, color: v })} options={[
             { value: '#151A45', label: 'Navy' }, { value: '#C1272D', label: 'Red' }, { value: '#16A34A', label: 'Green' },
             { value: '#2563EB', label: 'Blue' }, { value: '#7C3AED', label: 'Purple' }, { value: '#EC4899', label: 'Pink' },
           ]} /></FormField>
         </Modal>
         <ConfirmDialog open={toDelete !== null} title="Delete Committee" message={'Delete "' + (toDelete?.nameAr || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
       </div>
     );
   }
   