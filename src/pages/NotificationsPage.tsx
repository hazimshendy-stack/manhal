import { useAuth } from '@/lib/useAuth';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { updateOne } from '@/lib/db';
import { PageHeader } from '@/components/ui/PageHeader';
import { NotificationItem } from '@/components/notification/NotificationItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { toast } from '@/components/ui/Toast';
import type { Notification } from '@/types';

export function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifs, loading } = useRealtimeCollection<Notification>('notifications');
  if (!user) return null;
  const mine = notifs.filter((n) => n.userId === user.uid).sort((a, b) => (a.date < b.date ? 1 : -1));
  const unreadCount = mine.filter((n) => !n.read).length;
  const markRead = async (id: string) => { try { await updateOne('notifications', id, { read: true }); } catch { /* ignore */ } };
  const markAllRead = async () => {
    try { for (const n of mine) { if (!n.read) await updateOne('notifications', n.id, { read: true }); } toast.success('All marked as read'); }
    catch { toast.error('Failed to update'); }
  };
  return (
    <div className="container">
      <PageHeader eyebrow="Notifications" title="Notifications" description={unreadCount > 0 ? 'You have ' + unreadCount + ' unread notification(s)' : 'All caught up'}>
        {unreadCount > 0 ? <button type="button" className="btn btn--ghost btn--sm mt-4" onClick={markAllRead}>Mark all as read</button> : null}
      </PageHeader>
      <section className="section">
        {loading ? <SkeletonList count={5} /> : mine.length === 0 ? (
          <EmptyState title="No notifications" message="You have no notifications yet. When something happens related to you, it will appear here." />
        ) : (
          <div className="stack">{mine.map((n) => <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />)}</div>
        )}
      </section>
    </div>
  );
}