

import type { Member, Contribution, WarningRecord, TimelineEvent } from '@/types';

export function MemberProfilePage() {
  const { memberId } = useParams<{ memberId: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: contributions } = useCollection<Contribution>('contributions');
  const { data: warnings } = useCollection<WarningRecord>('warnings');

  useEffect(() => {
    if (!memberId) return;
    void (async () => {
      const m = await getOne<Member>('members', memberId);
      setMember(m);
      setLoading(false);
    })();
  }, [memberId]);

  if (loading) return <Loading fullHeight />;
  if (!member) return <NotFoundPage />;

  const myContribs = contributions.filter((c) => c.memberId === member.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const approvedContribs = myContribs.filter((c) => c.status === 'approved');
  const totalHours = approvedContribs.reduce((s, c) => s + c.hours, 0);
  const totalPoints = hoursToPoints(totalHours);
  const myWarnings = warnings.filter((w) => w.memberId === member.id);
  const memberTeams = teams.filter((t) => member.teamIds.includes(t.id));
  const memberCommittees = committees.filter((c) => member.committeeIds.includes(c.id));

  const timeline: TimelineEvent[] = [
    { id: 'join', memberId: member.id, type: 'join', title: 'Joined the organization', date: '2021-09-01' },
    ...myContribs.map((c) => ({
      id: 'c-' + c.id, memberId: member.id, type: 'contribution' as const,
      title: c.title, description: c.hours + ' hours', date: c.date,
    })),
  ];

  return (
    <div className="container section--tight">
      <div className="profile">
        <Avatar name={member.name} size={80} variant="gradient" />
        <div className="profile__main">
          <div className="row row--between" style={{ gap: 12 }}>
            <h1 className="profile__name">{member.name}</h1>
            <MemberStatusBadge status={member.status} />
          </div>
          <div className="profile__role">{ROLE_LABEL[member.role]}</div>
          {member.bio ? <p className="profile__bio">{member.bio}</p> : null}
          {memberTeams.length > 0 ? (
            <div className="row mt-4" style={{ gap: 6 }}>
              {memberTeams.map((t) => (
                <Link key={t.id} to={'/teams/' + t.id}><Badge variant="navy">{t.name}</Badge></Link>
              ))}
            </div>
          ) : null}
          {memberCommittees.length > 0 ? (
            <div className="row mt-2" style={{ gap: 6 }}>
              {memberCommittees.map((c) => <Badge key={c.id}>{c.nameAr}</Badge>)}
            </div>
          ) : null}
        </div>
        <div className="profile__side">
          <div className="kv"><span className="kv__k">Points</span><span className="kv__v" style={{ color: 'var(--c-red)' }}>{totalPoints}</span></div>
          <div className="kv"><span className="kv__k">Hours</span><span className="kv__v">{totalHours}</span></div>
          <div className="kv"><span className="kv__k">Contributions</span><span className="kv__v">{myContribs.length}</span></div>
          {member.email ? (
            <div className="kv"><span className="kv__k">Email</span><a className="kv__v" href={'mailto:' + member.email} dir="ltr">{member.email}</a></div>
          ) : null}
        </div>
      </div>

      <section className="section">
        <StatRow>
          <Stat value={totalPoints} label="Points" variant="red" />
          <Stat value={totalHours} label="Hours" />
          <Stat value={myContribs.length} label="Contributions" />
          <Stat value={myWarnings.length} label="Warnings" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Contributions" title="Contribution History" />
        {myContribs.length === 0 ? (
          <EmptyState title="No contributions" message="This member has no contributions yet." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Title</th><th>Team</th><th>Date</th><th>Hours</th><th>Points</th><th>Status</th></tr></thead>
              <tbody>
                {myContribs.map((c) => (
                  <ContributionRow key={c.id} contribution={c} showMember={false} showTeam />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {myWarnings.length > 0 ? (
        <section className="section">
          <SectionHeader eyebrow="Warnings" title="Disciplinary Record" />
          <div className="stack">
            {myWarnings.map((w) => (
              <div key={w.id} className="card no-click">
                <div className="row row--between">
                  <div className="card__title">{w.reason}</div>
                  <Badge variant={w.status === 'active' ? 'danger' : 'success'} dot>
                    {w.status === 'active' ? 'Active' : 'Resolved'}
                  </Badge>
                </div>
                <div className="small muted mt-2">{formatDate(w.issuedAt)} · by {w.issuedByName}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <SectionHeader eyebrow="Activity" title="Timeline" />
        <TimelineList events={timeline} />
      </section>
    </div>
  );
}