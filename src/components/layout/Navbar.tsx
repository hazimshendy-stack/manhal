

import type { Notification } from '@/types';

interface NavbarProps { onMenuToggle?: () => void; }

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user } = useAuth();
  const nav = useNavigate();
  const { data: notifs } = useRealtimeCollection<Notification>('notifications');
  const unread = user ? notifs.filter((n) => n.userId === user.uid && !n.read).length : 0;
  const doLogout = async () => { await logout(); nav('/'); };
  return (
    <header className="navbar no-print">
      <div className="container navbar__inner">
        <Link to={user ? '/dashboard' : '/'} className="brand">{site.name}</Link>
        <div className="nav-actions">
          {user ? (
            <>
              {onMenuToggle ? (
                <button type="button" className="nav-action nav-action--icon show-mobile" onClick={onMenuToggle} aria-label="Menu">
                  <span className="nav-action__menu" aria-hidden="true"><span /><span /><span /></span>
                </button>
              ) : null}
              <Link to="/notifications" className="nav-action nav-action--icon" aria-label="Notifications">
                <IconBell size={22} />
                {unread > 0 ? <span className="nav-action__badge">{unread > 99 ? '99+' : unread}</span> : null}
              </Link>
              <button type="button" className="nav-action nav-action--danger" onClick={doLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-action nav-action--primary">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}