import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { updateOne, removeOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { adminCreateMember } from '@/lib/auth';
import { members } from '@/data/members';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { ROLE_LABEL } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField, TextInput, Select, MultiSelect } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import type { AppUser, RoleId, TeamId } from '@/types';

const ROLE_OPTS: Array<{ value: RoleId; label: string }> = (Object.entries(ROLE_LABEL) as Array<[RoleId, string]>).map(([value, label]) => ({ value, label }));

function genPass(): string {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 10; i += 1) p += c.charAt(Math.floor(Math.random() * c.length));
  return p + '@1';
}

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const { data: users, loading } = useCollection<AppUser>('users');
  const { data: liveMembers } = useCollection<{ id: string; name: string }>('members');
  const { data: liveCommittees } = useCollection<{ id: string; nameAr: string }>('committees');

  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(genPass());
  const [name, setName] = useState('');
  const [role, setRole] = useState<RoleId>('MEMBER');
  const [teamId, setTeamId] = useState<TeamId>('helpers');
  const [committeeIds, setCommitteeIds] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [created, setCreated] = useState<{ email: string; password: string; name: string } | null>(null);

  const memberList = liveMembers.length > 0 ? liveMembers : members.map((m) => ({ id: m.id, name: m.name }));
  const committeeList = liveCommittees.length > 0 ? liveCommittees : committees.map((c) => ({ id: c.id, nameAr: c.nameAr }));

  const reset = () => { setEmail(''); setPassword(genPass()); setName(''); setRole('MEMBER'); setTeamId('helpers'); setCommitteeIds([]); setBio(''); };

  const create = async () => {
    if (!email.trim() || !name.trim()) { toast.error('البيانات ناقصة'); return; }
    if (password.length < 6) { toast.error('كلمة المرور ضعيفة'); return; }
    setBusy(true);
    try {
      await adminCreateMember({ email: email.trim(), temporaryPassword: password, name: name.trim(), role, teamIds: [teamId], committeeIds, bio: bio.trim() || undefined }, me?.uid ?? 'system');
      await logAudit(me, 'CREATE_USER', 'User', email, 'إنشاء: ' + name);
      setCreated({ email: email.trim(), password, name: name.trim() });
      toast.success('تم إنشاء الحساب');
      reset(); setOpen(false);
    } catch (e) { toast.error('فشل', e instanceof Error ? e.message : ''); }
    finally { setBusy(false); }
  };

  const chRole = async (uid: string, r: RoleId) => { try { await updateOne('users', uid, { role: r }); toast.success('تم'); } catch { toast.error('فشل'); } };
  const chTeam = async (uid: string, t: TeamId) => { try { await updateOne('users', uid, { teamId: t }); toast.success('تم'); } catch { toast.error('فشل'); } };
  const link = async (uid: string, mid: string) => { try { await updateOne('users', uid, { memberId: mid || null }); if (mid) await updateOne('members', mid, { linkedUserId: uid }); toast.success('تم'); } catch { toast.error('فشل'); } };
  const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('users', toDelete); toast.success('تم'); setToDelete(null); } catch { toast.error('فشل'); } finally { setBusy(false); } };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="إدارة" title="المستخدمون" description="إنشاء الحسابات والأدوار." />
      <SectionHeader eyebrow="القائمة" title={'المستخدمون (' + users.length + ')'}
        action={<button type="button" className="btn btn--primary btn--sm" onClick={() => { reset(); setOpen(true); }}>+ مستخدم جديد</button>} />

      {loading ? <SkeletonList count={6} /> : users.length === 0 ? <EmptyState title="لا مستخدمين" message="ابدأ." /> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>الفريق</th><th>العضو</th><th>إجراءات</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td data-label="الاسم" style={{ fontWeight: 700 }}>
                    {u.displayName}
                    {u.mustChangePassword ? <Badge variant="warning" className="mt-2">جديد</Badge> : null}
                  </td>
                  <td className="muted small" data-label="البريد" dir="ltr">{u.email}</td>
                  <td data-label="الدور">
                    <select className="input" value={u.role} onChange={(e) => chRole(u.uid, e.target.value as RoleId)} style={{ minWidth: 140 }}>
                      {ROLE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td data-label="الفريق">
                    <select className="input" value={u.teamId ?? ''} onChange={(e) => chTeam(u.uid, e.target.value as TeamId)} style={{ minWidth: 120 }}>
                      <option value="">— بدون —</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td data-label="العضو">
                    <select className="input" value={u.memberId ?? ''} onChange={(e) => link(u.uid, e.target.value)} style={{ minWidth: 140 }}>
                      <option value="">— غير مرتبط —</option>
                      {memberList.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </td>
                  <td data-label="إجراءات"><button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(u.uid)}>حذف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="إنشاء مستخدم جديد" onClose={() => setOpen(false)} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>إلغاء</button><button type="button" className="btn btn--primary" onClick={create} disabled={busy}>{busy ? '...' : 'إنشاء'}</button></>}>
        <FormField label="الاسم الكامل" required><TextInput value={name} onChange={setName} /></FormField>
        <FormField label="البريد" required><TextInput value={email} onChange={setEmail} type="email" /></FormField>
        <FormField label="كلمة المرور المؤقتة" required hint="يجب تغييرها عند أول دخول">
          <div style={{ display: 'flex', gap: 8 }}>
            <TextInput value={password} onChange={setPassword} type="text" />
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPassword(genPass())}>توليد</button>
          </div>
        </FormField>
        <FormField label="الدور" required><Select value={role} onChange={(v) => setRole(v as RoleId)} options={ROLE_OPTS} /></FormField>
        <FormField label="الفريق" required><Select value={teamId} onChange={(v) => setTeamId(v as TeamId)} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
        <FormField label="اللجان" hint={committeeList.length === 0 ? 'لا توجد لجان' : undefined}>
          <MultiSelect values={committeeIds} onChange={setCommitteeIds} options={committeeList.map((c) => ({ value: c.id, label: c.nameAr }))} />
        </FormField>
        <FormField label="نبذة"><TextInput value={bio} onChange={setBio} /></FormField>
      </Modal>

      <Modal open={created !== null} title="✓ تم إنشاء الحساب" onClose={() => setCreated(null)}
        footer={<button type="button" className="btn btn--primary" onClick={() => setCreated(null)}>فهمت</button>}>
        <p style={{ lineHeight: 1.8, marginBottom: 16 }}>أرسل البيانات للعضو:</p>
        <div style={{ background: 'var(--c-off-white)', border: '1px solid var(--c-line)', borderRadius: 10, padding: 16, fontSize: '0.9rem', lineHeight: 2 }}>
          <div><strong>الاسم:</strong> {created?.name}</div>
          <div style={{ wordBreak: 'break-all' }}><strong>البريد:</strong> <span dir="ltr">{created?.email}</span></div>
          <div style={{ wordBreak: 'break-all' }}><strong>المرور:</strong> <span dir="ltr" style={{ fontFamily: 'var(--font-en)' }}>{created?.password}</span></div>
        </div>
      </Modal>

      <ConfirmDialog open={toDelete !== null} title="حذف" message="متأكد؟" confirmLabel="حذف" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}
