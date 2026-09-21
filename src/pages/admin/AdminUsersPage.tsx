

import type { AppUser, RoleId, TeamId, Member, Committee } from '@/types';

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
  const { data: liveMembers } = useCollection<Member>('members');
  const { data: liveCommittees } = useCollection<Committee>('committees');

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

  /* ═══ Live data ONLY — no static fallback ═══ */
  const memberList = liveMembers.map((m) => ({ id: m.id, name: m.name }));
  const committeeList = liveCommittees.map((c) => ({ id: c.id, nameAr: c.nameAr }));

  const reset = () => {
    setEmail(''); setPassword(genPass()); setName('');
    setRole('MEMBER'); setTeamId('helpers'); setCommitteeIds([]); setBio('');
  };

  const create = async () => {
    if (!email.trim() || !name.trim()) { toast.error('Missing data'); return; }
    if (password.length < 6) { toast.error('Password too weak'); return; }
    setBusy(true);
    try {
      await adminCreateMember({
        email: email.trim(),
        temporaryPassword: password,
        name: name.trim(),
        role,
        teamIds: [teamId],
        committeeIds,
        bio: bio.trim() || undefined,
      }, me?.uid ?? 'system');
      setCreated({ email: email.trim(), password, name: name.trim() });
      toast.success('Account created');
      reset();
      setOpen(false);
    } catch (e) {
      toast.error('Failed', e instanceof Error ? e.message : '');
    } finally { setBusy(false); }
  };

  const chRole = async (uid: string, r: RoleId) => {
    try { await updateOne('users', uid, { role: r }); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };
  const chTeam = async (uid: string, t: TeamId) => {
    try { await updateOne('users', uid, { teamId: t }); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };
  const linkMember = async (uid: string, mid: string) => {
    try {
      await updateOne('users', uid, { memberId: mid || null });
      if (mid) await updateOne('members', mid, { linkedUserId: uid });
      toast.success('Linked');
    } catch { toast.error('Failed'); }
  };
  const del = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeOne('users', toDelete);
      toast.success('Deleted');
      setToDelete(null);
    } catch { toast.error('Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Users" description="Create accounts, assign roles, and link members." />
      <SectionHeader
        eyebrow="List"
        title={'Users (' + users.length + ')'}
        action={<button type="button" className="btn btn--primary btn--sm" onClick={() => { reset(); setOpen(true); }}>+ New User</button>}
      />

      {loading ? <SkeletonList count={6} /> : users.length === 0 ? (
        <EmptyState title="No users" message="Start by creating the first user." />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Team</th><th>Member</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td data-label="Name" style={{ fontWeight: 700 }}>
                    {u.displayName}
                    {u.mustChangePassword ? <Badge variant="warning" className="mt-2">New</Badge> : null}
                  </td>
                  <td className="muted small" data-label="Email" dir="ltr">{u.email}</td>
                  <td data-label="Role">
                    <select className="input" value={u.role} onChange={(e) => chRole(u.uid, e.target.value as RoleId)} style={{ minWidth: 150 }}>
                      {ROLE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td data-label="Team">
                    <select className="input" value={u.teamId ?? ''} onChange={(e) => chTeam(u.uid, e.target.value as TeamId)} style={{ minWidth: 130 }}>
                      <option value="">— None —</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td data-label="Member">
                    <select className="input" value={u.memberId ?? ''} onChange={(e) => linkMember(u.uid, e.target.value)} style={{ minWidth: 150 }}>
                      <option value="">— Not linked —</option>
                      {memberList.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </td>
                  <td data-label="Actions">
                    <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(u.uid)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="Create New User" onClose={() => setOpen(false)} wide
        footer={<><button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="btn btn--primary" onClick={create} disabled={busy}>{busy ? '...' : 'Create'}</button></>}>
        <FormField label="Full name" required><TextInput value={name} onChange={setName} placeholder="e.g. Ahmed Mohamed" /></FormField>
        <FormField label="Email" required><TextInput value={email} onChange={setEmail} type="email" placeholder="name@resala-stem.org" /></FormField>
        <FormField label="Temporary password" required hint="Will be required to change on first login">
          <div style={{ display: 'flex', gap: 8 }}>
            <TextInput value={password} onChange={setPassword} type="text" />
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPassword(genPass())}>Generate</button>
          </div>
        </FormField>
        <FormField label="Role" required><Select value={role} onChange={(v) => setRole(v as RoleId)} options={ROLE_OPTS} /></FormField>
        <FormField label="Team" required><Select value={teamId} onChange={(v) => setTeamId(v as TeamId)} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
        <FormField label="Committees" hint={committeeList.length === 0 ? 'No committees yet' : undefined}>
          <MultiSelect values={committeeIds} onChange={setCommitteeIds} options={committeeList.map((c) => ({ value: c.id, label: c.nameAr }))} />
        </FormField>
        <FormField label="Short bio"><TextInput value={bio} onChange={setBio} placeholder="e.g. Frontend developer" /></FormField>
      </Modal>

      <Modal open={created !== null} title="✓ Account Created" onClose={() => setCreated(null)}
        footer={<button type="button" className="btn btn--primary" onClick={() => setCreated(null)}>Got it</button>}>
        <p style={{ marginBottom: 16 }}>Send these credentials to the member:</p>
        <div style={{ background: 'var(--c-off-white)', border: '1px solid var(--c-line)', borderRadius: 10, padding: 16, lineHeight: 2 }}>
          <div><strong>Name:</strong> {created?.name}</div>
          <div style={{ wordBreak: 'break-all' }}><strong>Email:</strong> <span dir="ltr">{created?.email}</span></div>
          <div style={{ wordBreak: 'break-all' }}><strong>Password:</strong> <span dir="ltr">{created?.password}</span></div>
        </div>
      </Modal>

      <ConfirmDialog open={toDelete !== null} title="Delete User" message="This cannot be undone." confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
    </div>
  );
}
