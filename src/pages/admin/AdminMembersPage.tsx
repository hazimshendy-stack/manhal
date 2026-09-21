

import type { Member, RoleId, TeamId } from '@/types';

const ROLE_OPTS = Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }));
const EMPTY: Omit<Member, 'id'> = { name: '', role: 'MEMBER', teamIds: [], committeeIds: [], joinedSeason: 7, hours: 0, status: 'active', bio: '', email: '' };

export function AdminMembersPage() {
  const { data: list, loading } = useCollection<Member>('members');
  const { data: liveCommittees } = useCollection<{ id: string; nameAr: string }>('committees');
  const [editing, setEditing] = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Member, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const committeeList = liveCommittees.length > 0 ? liveCommittees : committees.map((c) => ({ id: c.id, nameAr: c.nameAr }));
  const filtered = list.filter((m) => !search.trim() || m.name.toLowerCase().includes(search.trim().toLowerCase()));
  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
  const openEdit = (m: Member) => {
    setForm({ name: m.name, role: m.role, teamIds: m.teamIds, committeeIds: m.committeeIds, joinedSeason: m.joinedSeason, hours: m.hours, status: m.status, bio: m.bio || '', email: m.email || '' });
    setEditing(m);
    setCreating(false);
  };
  const close = () => { setCreating(false); setEditing(null); };
  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (form.teamIds.length === 0) { toast.error('At least one team is required'); return; }
    setBusy(true);
    try {
      if (editing) { await updateOne('members', editing.id, form); toast.success('Updated'); }
      else { const id = 'M-' + Date.now().toString(36).toUpperCase(); await createOne('members', { id, ...form }); toast.success('Added'); }
      close();
    } catch { toast.error('Failed to save'); }
    finally { setBusy(false); }
  };
  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('members', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Members" description="Add, edit, and remove member data." />
      <div className="toolbar"><input className="input" type="search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <SectionHeader eyebrow="List" title={'Members (' + filtered.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Member</button>} />
      {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? <EmptyState title="No members" message="No members found." /> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Name</th><th>Role</th><th>Teams</th><th>Committees</th><th>Hours</th><th>Points</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((m) => {
                const mt = teams.filter((t) => m.teamIds.includes(t.id));
                const mc = committeeList.filter((c) => m.committeeIds.includes(c.id));
                return (
                  <tr key={m.id}>
                    <td data-label="Name"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={m.name} size={32} variant="navy" /><span>{m.name}</span></div></td>
                    <td className="muted small" data-label="Role">{ROLE_LABEL[m.role]}</td>
                    <td data-label="Teams"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mt.map((t) => <span key={t.id} className="badge">{t.name}</span>)}</div></td>
                    <td data-label="Committees"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mc.length === 0 ? <span className="muted small">—</span> : mc.map((c) => <span key={c.id} className="badge">{c.nameAr}</span>)}</div></td>
                    <td data-label="Hours">{m.hours}</td>
                    <td className="points" data-label="Points">{hoursToPoints(m.hours)}</td>
                    <td data-label="Actions"><div style={{ display: 'flex', gap: 4 }}><button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(m)}>Edit</button><button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(m)}>Delete</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'Edit Member' : 'Add Member'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
        <FormField label="Full name" required><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
        <FormField label="Email"><TextInput value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} type="email" /></FormField>
        <FormField label="Role" required><Select value={form.role} onChange={(v) => setForm({ ...form, role: v as RoleId })} options={ROLE_OPTS} /></FormField>
        <FormField label="Teams" required><MultiSelect values={form.teamIds} onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
        <FormField label="Committees"><MultiSelect values={form.committeeIds} onChange={(v) => setForm({ ...form, committeeIds: v })} options={committeeList.map((c) => ({ value: c.id, label: c.nameAr }))} /></FormField>
        <FormField label="Hours"><NumberInput value={form.hours} onChange={(v) => setForm({ ...form, hours: v })} min={0} /></FormField>
        <FormField label="Status"><Select value={form.status} onChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' | 'suspended' })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' }]} /></FormField>
        <FormField label="Bio"><TextArea value={form.bio || ''} onChange={(v) => setForm({ ...form, bio: v })} rows={2} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="Delete Member" message={'Delete "' + (toDelete?.name || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}