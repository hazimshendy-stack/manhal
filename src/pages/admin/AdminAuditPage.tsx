import { useCollection } from '@/lib/useRealtimeCollection';
import type { AuditRecord } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { formatDateTime } from '@/lib/format';

export function AdminAuditPage() {
  const { data, loading } = useCollection<AuditRecord>('audit');
  const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Audit Log" description="All admin actions are recorded here." />
      <SectionHeader eyebrow="Log" title={'Events (' + data.length + ')'} />
      {loading ? <SkeletonList count={8} /> : sorted.length === 0 ? (
        <EmptyState title="No events" message="No actions recorded yet." />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Description</th></tr></thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a.id}>
                  <td className="muted small nowrap" data-label="Date">{formatDateTime(a.date)}</td>
                  <td data-label="User" style={{ fontWeight: 700 }}>{a.actorName}</td>
                  <td data-label="Action"><span className="badge badge--neutral">{a.action}</span></td>
                  <td data-label="Description">{a.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}