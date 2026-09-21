

import type { GovernanceDocument } from '@/types';

const EMPTY: Omit<GovernanceDocument, 'id'> = { title: '', category: 'Policies', description: '', content: '', version: '1.0', updatedAt: new Date().toISOString().slice(0, 10) };

export function AdminGovernancePage() {
  const { data, loading } = useCollection<GovernanceDocument>('governance');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GovernanceDocument | null>(null);
  const [form, setForm] = useState<Omit<GovernanceDocument, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<GovernanceDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title));
  const openCreate = () => { setForm({ ...EMPTY, updatedAt: new Date().toISOString().slice(0, 10) }); setCreating(true); setEditing(null); };
  const openEdit = (d: GovernanceDocument) => { setForm({ title: d.title, category: d.category, description: d.description, content: d.content, version: d.version, updatedAt: d.updatedAt }); setEditing(d); setCreating(false); };
  const close = () => { setCreating(false); setEditing(null); };
  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required'); return; }
    setBusy(true);
    try {
      const payload = { ...form, updatedAt: new Date().toISOString().slice(0, 10) };
      if (editing) { await updateOne('governance', editing.id, payload); toast.success('Updated'); }
      else { const id = 'GOV-' + Date.now().toString(36).toUpperCase(); await createOne('governance', { id, ...payload }); toast.success('Added'); }
      close();
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };
  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('governance', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Governance" description="Add policies and documents yourself." />
      <SectionHeader eyebrow="List" title={'Documents (' + data.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Document</button>} />
      {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? (
        <EmptyState title="No documents" message="Add the first document." action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ Add Document</button>} />
      ) : (
        <div className="stack">
          {sorted.map((d) => (
            <div key={d.id} className="card no-click">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{d.title}</div>
                  <div className="card__meta">{d.category} · v{d.version} · Last updated {formatDate(d.updatedAt)}</div>
                </div>
                <Badge variant="info">{d.category}</Badge>
              </div>
              {d.description ? <p className="small soft mt-2">{d.description}</p> : null}
              <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(d)}>Edit</button>
                <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(d)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'Edit Document' : 'New Document'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
        <FormField label="Title" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
        <FormField label="Category" required><TextInput value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Policies / Procedures / Governance" /></FormField>
        <FormField label="Short description"><TextInput value={form.description} onChange={(v) => setForm({ ...form, description: v })} /></FormField>
        <FormField label="Full content" required><TextArea value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={8} /></FormField>
        <FormField label="Version" required><TextInput value={form.version} onChange={(v) => setForm({ ...form, version: v })} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="Delete Document" message={'Delete "' + (toDelete?.title || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}