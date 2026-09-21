

import type { Committee, Member } from '@/types';

const EMPTY: Omit<Committee, 'id'> = { name: '', nameAr: '', description: '', color: '#151A45', icon: '' };

export function AdminCommitteesPage() {
  const { data: committees, loading } = useCollection<Committee>('committees');
  const { data: members } = useCollection<Member>('members');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Committee | null>(null);
  const [form, setForm] = useState<Omit<Committee, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<Committee | null>(null);
  const [busy, setBusy] = useState(false);
  const sorted = [...committees].sort((a, b) => a.nameAr.localeCompare(b.nameAr));
  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
  const openEdit = (c: Committee) => { setForm({ name: c.name, nameAr: c.nameAr, description: c.description, color: c.color, icon: c.icon }); setEditing(c); setCreating(false); };
  const close = () => { setCreating(false); setEditing(null); };
  const save = async () => {
    if (!form.nameAr.trim()) { toast.error('Name is required'); return; }
    setBusy(true);
    try {
      const payload = { name: form.name.trim() || form.nameAr.trim(), nameAr: form.nameAr.trim(), description: form.description.trim(), color: form.color, icon: form.icon };
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
      for (const m of members) { if (m.committeeIds.includes(toDelete.id)) await updateOne('members', m.id, { committeeIds: m.committeeIds.filter((c) => c !== toDelete.id) }); }
      toast.success('Deleted');
      setToDelete(null);
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Committees" description="Add and manage committees." />
      <SectionHeader eyebrow="List" title={'Committees (' + committees.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Committee</button>} />
      {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? (
        <EmptyState title="No committees" message="Add your first committee." action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ Add Committee</button>} />
      ) : (
        <div className="grid grid--wide">
          {sorted.map((c) => {
            const count = members.filter((m) => m.committeeIds.includes(c.id)).length;
            return (
              <div key={c.id} className="card no-click">
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{c.nameAr}</div>
                    {c.name && c.name !== c.nameAr ? <div className="card__meta">{c.name}</div> : null}
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
          })}
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'Edit Committee' : 'New Committee'} onClose={close}
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
        <FormField label="Name (Arabic)" required><TextInput value={form.nameAr} onChange={(v) => setForm({ ...form, nameAr: v })} /></FormField>
        <FormField label="Name (English)"><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
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