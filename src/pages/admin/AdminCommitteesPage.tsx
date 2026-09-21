import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { createOne, updateOne, removeOne } from '@/lib/db';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
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

  const sorted = [...committees].sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
  const openEdit = (c: Committee) => { setForm({ name: c.name, nameAr: c.nameAr, description: c.description, color: c.color, icon: c.icon }); setEditing(c); setCreating(false); };
  const close = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.nameAr.trim()) { toast.error('الاسم مطلوب'); return; }
    setBusy(true);
    try {
      const payload = { name: form.name.trim() || form.nameAr.trim(), nameAr: form.nameAr.trim(), description: form.description.trim(), color: form.color, icon: form.icon };
      if (editing) { await updateOne('committees', editing.id, payload); toast.success('تم'); }
      else { const id = 'COMM-' + Date.now().toString(36).toUpperCase(); await createOne('committees', { id, ...payload }); toast.success('تمت الإضافة'); }
      close();
    } catch { toast.error('فشل'); } finally { setBusy(false); }
  };

  const del = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('committees', toDelete.id);
      for (const m of members) {
        if (m.committeeIds.includes(toDelete.id)) {
          await updateOne('members', m.id, { committeeIds: m.committeeIds.filter((c) => c !== toDelete.id) });
        }
      }
      toast.success('تم');
      setToDelete(null);
    } catch { toast.error('فشل'); } finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="اللجان" description="أضف اللجان." />
      <SectionHeader eyebrow="القائمة" title={'اللجان (' + committees.length + ')'}
        action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ لجنة جديدة</button>} />
      {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? (
        <EmptyState title="لا لجان" message="أضف أول لجنة." action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ إضافة</button>} />
      ) : (
        <div className="grid grid--wide">
          {sorted.map((c) => {
            const count = members.filter((m) => m.committeeIds.includes(c.id)).length;
            return (
              <div key={c.id} className="card no-click">
                <div className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card__title">{c.nameAr}</div>
                    {c.name ? <div className="card__meta">{c.name}</div> : null}
                  </div>
                  <span style={{ width: 12, height: 12, borderRadius: 4, background: c.color }} />
                </div>
                {c.description ? <p className="small soft mt-3">{c.description}</p> : null}
                <div className="small muted mt-3">{count} عضو</div>
                <div className="row mt-4" style={{ gap: 6, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(c)}>تعديل</button>
                  <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(c)}>حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={creating || editing !== null} title={editing ? 'تعديل لجنة' : 'لجنة جديدة'} onClose={close}
        footer={<><button type="button" className="btn btn--ghost" onClick={close}>إلغاء</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'حفظ'}</button></>}>
        <FormField label="الاسم بالعربية" required><TextInput value={form.nameAr} onChange={(v) => setForm({ ...form, nameAr: v })} /></FormField>
        <FormField label="الاسم بالإنجليزية"><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
        <FormField label="الوصف"><TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} /></FormField>
        <FormField label="اللون"><Select value={form.color} onChange={(v) => setForm({ ...form, color: v })} options={[
          { value: '#151A45', label: 'كحلي' }, { value: '#C1272D', label: 'أحمر' }, { value: '#16A34A', label: 'أخضر' },
          { value: '#2563EB', label: 'أزرق' }, { value: '#7C3AED', label: 'بنفسجي' }, { value: '#EC4899', label: 'وردي' },
        ]} /></FormField>
      </Modal>
      <ConfirmDialog open={toDelete !== null} title="حذف لجنة" message={'حذف "' + (toDelete?.nameAr || '') + '"؟'} confirmLabel="حذف" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}
