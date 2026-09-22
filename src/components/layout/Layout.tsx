import { useEffect, useState } from 'react';
   import { Outlet, useLocation, useNavigate } from 'react-router-dom';
   import { Navbar } from './Navbar';
   import { BottomNav } from './BottomNav';
   import { Sidebar } from './Sidebar';
   import { Footer } from './Footer';
   import { useAuth } from '@/lib/useAuth';
   import { initPwa } from '@/lib/pwa';

   export function Layout() {
     const { pathname } = useLocation();
     const nav = useNavigate();
     const { user, mustChangePassword, loading } = useAuth();
     const [sidebarOpen, setSidebarOpen] = useState(false);
     useEffect(() => { initPwa(); }, []);
     useEffect(() => { window.scrollTo(0, 0); setSidebarOpen(false); }, [pathname]);
     useEffect(() => {
       if (loading) return;
       if (user && mustChangePassword && pathname !== '/change-password') nav('/change-password');
     }, [user, mustChangePassword, pathname, nav, loading]);
     const handleMenuToggle = () => setSidebarOpen((v) => !v);
     const handleSidebarClose = () => setSidebarOpen(false);
     return (
       <div className="app-shell">
         <Navbar onMenuToggle={user ? handleMenuToggle : undefined} />
         <main className="app-main">
           <Outlet />
           {user && sidebarOpen ? <Sidebar open={sidebarOpen} onClose={handleSidebarClose} /> : null}
         </main>
         {user ? <BottomNav /> : null}
         <Footer />
       </div>
     );
   }
   