import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, TextArea } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import type { GovernanceDocument } from '@/types';

const EMPTY: Omit<GovernanceDocument, 'id'> = { title: '', category: 'السياسات', description: '', content: '', version: '1.0', updatedAt: new Date().toISOString().slice(0, 10) };

export function AdminGovernancePage() {
  const { data, loading } = useCollection<GovernanceDocument>('governance');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GovernanceDocument | null>(null);
  const [form, setForm] = useState<Omit<GovernanceDocument, 'id'>>(EMPTY);
  const [toDelete, setToDelete] = useState<GovernanceDocument | null>(null);
  const [busy, setBusy] = useState(false);

  const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title, 'ar'));
  const openCreate = () => { setForm({ ...EMPTY, updatedAt: new Date().toISOString().slice(0, 10) }); setCreating(true); setEditing(null); };
  const openEdit = (d: GovernanceDocument) => { setForm({ title: d.title, category: d.category, description: d.description, content: d.content, version: d.version, updatedAt: d.updatedAt }); setEditing(d); setCreating(false); };
  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('العنوان والوصف مطلوبان'); return; }
    setBusy(true);
    try {
      const payload = { ...form, updatedAt: new Date().toISOString().slice(0, 10) };
      if (editing) { await updateOne('governance', editing.id, payload); toast.success('تم'); }
      else { const id = 'GOV-' + Date.now().toString(36).toUpperCase(); await createOne('governance', { id, ...payload }); toast.success('تمت الإضافة'); }
      close();
    } catch { toast.error('فشل'); } finally { setBusy(false); }
  };

  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('governance', toDelete.id); toast.success('تم'); setToDelete(null); } catch { toast.error('فشل'); } finally { setBusy(false); } };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="الحوكمة" description="أضف السياسات بنفسك." />
      <SectionHeader eyebrow="القائمة" title={'الوثائق (' + data.length + ')'}
        action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ وثيقة جديدة</button>} />
      {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? (
        <EmptyState title="لا وثائق" message="أضف أول وثيقة." action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ إضافة</button>} />
      ) : (
        <div className="stack">
          {sorted.map((d) => (
            <div key={d.id} className="card no-click">
              <div className="row row--between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card__title">{d.title}</div>
                  <div className="card__meta">{d.category} · v{d.version} · آخر تحديث {formatDate(d.updatedAt)}</div>
                </div>
                <Badge variant="info">{d.category}</Badge>
              </div>
              {d.description ? <p className="small soft mt-2">{d.description}</p> : null}
              <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(d)}>تعديل</button>
                <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(d)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'تعديل وثيقة' : 'وثيقة جديدة'} onClose={close} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>إلغاء</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'حفظ'}</button></>}>
        <FormField label="العنوان" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
        <FormField label="التصنيف" required><TextInput value={form.category} onChange={(v) => setForm({ ...form, category: v })} /></FormField>
        <FormField label="الوصف المختصر"><TextInput value={form.description} onChange={(v) => setForm({ ...form, description: v })} /></FormField>
        <FormField label="النص الكامل" required><TextArea value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={8} /></FormField>
        <FormField label="الإصدار" required><TextInput value={form.version} onChange={(v) => setForm({ ...form, version: v })} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="حذف" message={'حذف "' + (toDelete?.title || '') + '"؟'} confirmLabel="حذف" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}
