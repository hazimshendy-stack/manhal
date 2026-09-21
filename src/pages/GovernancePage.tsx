

import type { GovernanceDocument } from '@/types';

export function GovernancePage() {
  const { data, loading } = useCollection<GovernanceDocument>('governance');
  const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title));
  const grouped = sorted.reduce<Record<string, GovernanceDocument[]>>((acc, doc) => {
    const key = doc.category || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  return (
    <div className="container">
      <PageHeader eyebrow="Governance" title="Official Documents" description="Policies, procedures, and official bylaws." />
      {loading ? (
        <SkeletonList count={4} />
      ) : sorted.length === 0 ? (
        <EmptyState title="No documents" message="No governance documents have been added yet." />
      ) : (
        Object.entries(grouped).map(([category, docs]) => (
          <section key={category} className="section">
            <SectionHeader eyebrow={category} title={category} />
            <div className="stack">
              {docs.map((d) => (
                <div key={d.id} className="card no-click">
                  <div className="row row--between">
                    <div className="card__title">{d.title}</div>
                    <Badge variant="neutral">v{d.version}</Badge>
                  </div>
                  {d.description ? <div className="card__meta">{d.description}</div> : null}
                  <div className="small muted mt-3">Last updated {formatDate(d.updatedAt)}</div>
                  <p className="mt-3 small soft" style={{ lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{d.content}</p>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}