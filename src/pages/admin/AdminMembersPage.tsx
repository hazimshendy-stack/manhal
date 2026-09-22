import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { teams } from '@/data/teams';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextInput, NumberInput, TextArea, Select, MultiSelect } from '@/components/ui/FormField';
   import { Avatar } from '@/components/ui/Avatar';
   import { toast } from '@/components/ui/Toast';
   import type { Member, RoleId, TeamId, Committee } from '@/types';

   const ROLE_OPTS = Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }));
   const EMPTY: Omit<Member, 'id'> = { name: '', role: 'MEMBER', teamIds: [], committeeIds: [], joinedSeason: 7, hours: 0, points: 0, status: 'active', bio: '', email: '' };

   export function AdminMembersPage() {
     const { data: list, loading } = useCollection<Member>('members');
     const { data: liveCommittees } = useCollection<Committee>('committees');
     const [editing, setEditing] = useState<Member | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<Member, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<Member | null>(null);
     const [busy, setBusy] = useState(false);
     const [search, setSearch] = useState('');
     const filtered = list.filter((m) => !search.trim() || m.name.toLowerCase().includes(search.trim().toLowerCase()));
     const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
     const openEdit = (m: Member) => { setForm({ name: m.name, role: m.role, teamIds: Array.isArray(m.teamIds) ? m.teamIds : [], committeeIds: Array.isArray(m.committeeIds) ? m.committeeIds : [], joinedSeason: m.joinedSeason || 7, hours: m.hours || 0, points: m.points || 0, status: m.status || 'active', bio: m.bio || '', email: m.email || '' }); setEditing(m); setCreating(false); };
     const close = () => { setCreating(false); setEditing(null); };
     const save = async () => {
       if (!form.name.trim()) { toast.error('Name required'); return; }
       if (form.teamIds.length === 0) { toast.error('At least one team required'); return; }
       if (form.committeeIds.length === 0) { toast.error('At least one committee required'); return; }
       setBusy(true);
       try {
         if (editing) { await updateOne('members', editing.id, form); toast.success('Updated'); }
         else { const id = 'M-' + Date.now().toString(36).toUpperCase(); await createOne('members', { id, ...form }); toast.success('Added'); }
         close();
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('members', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Members" description="Every member must be in a team AND a committee." />
         <div className="toolbar"><input className="input" type="search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
         <SectionHeader eyebrow="List" title={'Members (' + filtered.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Member</button>} />
         {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? <EmptyState title="No members" message="No members found." /> : (
           <div className="table-wrap"><table className="data">
             <thead><tr><th>Name</th><th>Role</th><th>Teams</th><th>Committees</th><th>Hours</th><th>Points</th><th>Actions</th></tr></thead>
             <tbody>{filtered.map((m) => {
               const mt = teams.filter((t) => Array.isArray(m.teamIds) && m.teamIds.includes(t.id));
               const mc = liveCommittees.filter((c) => Array.isArray(m.committeeIds) && m.committeeIds.includes(c.id));
               return (
                 <tr key={m.id}>
                   <td data-label="Name"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={m.name} size={32} variant="navy" /><span>{m.name}</span></div></td>
                   <td className="muted small" data-label="Role">{ROLE_LABEL[m.role]}</td>
                   <td data-label="Teams"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mt.map((t) => <span key={t.id} className="badge">{t.name}</span>)}</div></td>
                   <td data-label="Committees"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mc.length === 0 ? <span className="muted small">—</span> : mc.map((c) => <span key={c.id} className="badge">{c.nameAr}</span>)}</div></td>
                   <td data-label="Hours">{m.hours || 0}</td>
                   <td className="points" data-label="Points">{m.points || 0}</td>
                   <td data-label="Actions"><div style={{ display: 'flex', gap: 4 }}><button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(m)}>Edit</button><button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(m)}>Delete</button></div></td>
                 </tr>
               );
             })}</tbody>
           </table></div>
         )}
         <Modal open={creating || editing !== null} title={editing ? 'Edit Member' : 'Add Member'} onClose={close} wide
           footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
           <FormField label="Full name" required><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
           <FormField label="Email"><TextInput value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} type="email" /></FormField>
           <FormField label="Role" required><Select value={form.role} onChange={(v) => setForm({ ...form, role: v as RoleId })} options={ROLE_OPTS} /></FormField>
           <FormField label="Teams" required><MultiSelect values={form.teamIds} onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
           <FormField label="Committees" required hint={liveCommittees.length === 0 ? 'No committees yet' : 'At least one required'}>
             <MultiSelect values={form.committeeIds} onChange={(v) => setForm({ ...form, committeeIds: v })} options={liveCommittees.map((c) => ({ value: c.id, label: c.nameAr }))} />
           </FormField>
           <FormField label="Hours"><NumberInput value={form.hours || 0} onChange={(v) => setForm({ ...form, hours: v })} min={0} /></FormField>
           <FormField label="Status"><Select value={form.status || 'active'} onChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' | 'suspended' })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' }]} /></FormField>
           <FormField label="Bio"><TextArea value={form.bio || ''} onChange={(v) => setForm({ ...form, bio: v })} rows={2} /></FormField>
         </Modal>
         <ConfirmDialog open={toDelete !== null} title="Delete Member" message={'Delete "' + (toDelete?.name || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
       </div>
     );
   }
   