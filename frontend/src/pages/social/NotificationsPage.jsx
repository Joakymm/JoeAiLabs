import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from '../../components/social/NotificationItem';

export default function NotificationsPage() {
  const { notifications, loading, pagination, markAsRead, markAllAsRead, loadMore } = useNotifications();

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.4rem', color: 'var(--text-main)' }}>Notifications</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={markAllAsRead}
          disabled={notifications.every(n => n.read)}
        >
          Mark all as read
        </button>
      </div>

      {loading && notifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
          <i className="fas fa-spinner fa-spin fa-2x" />
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-bell" />
          <h3>No notifications yet</h3>
          <p>When someone likes your post, comments, or follows you, you'll see it here.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {notifications.map(notif => (
          <NotificationItem
            key={notif._id}
            notification={notif}
            onMarkRead={markAsRead}
          />
        ))}
      </div>

      {pagination && pagination.page < pagination.pages && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <button className="btn btn-ghost" onClick={loadMore} disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin" /> : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
