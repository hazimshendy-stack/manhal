   import { useEffect, useState } from 'react';
   import { Outlet, useLocation, useNavigate } from 'react-router-dom';
   import { Navbar } from './Navbar';
   import { BottomNav } from './BottomNav';
   import { Sidebar } from './Sidebar';
   import { Footer } from './Footer';
   import { useAuth } from '@/lib/useAuth';
   import { initPwa } from '@/lib/pwa';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { login } from '@/lib/auth';
import { initPwa } from '@/lib/pwa';
import { useAuth } from '@/lib/useAuth';

   export function Layout() {
     const { pathname } = useLocation();
     const nav = useNavigate();
     const { user, mustChangePassword, loading } = useAuth();
     const [sidebarOpen, setSidebarOpen] = useState(false);

     useEffect(() => { initPwa(); }, []);
     useEffect(() => {
       window.scrollTo(0, 0);
       setSidebarOpen(false);
     }, [pathname]);

     /* ─── Handle redirects ─── */
     useEffect(() => {
       if (loading) return;

       /* Pending or rejected → forced to waiting page */
       if (user && (user.status === 'pending' || user.status === 'rejected')) {
         if (pathname !== '/pending-approval' && pathname !== '/login' && pathname !== '/') {
           nav('/pending-approval');
         }
         return;
       }

       /* Force password change */
       if (user && mustChangePassword && pathname !== '/change-password') {
         nav('/change-password');
       }
     }, [user, mustChangePassword, pathname, nav, loading]);

     const handleMenuToggle = () => setSidebarOpen((v) => !v);
     const handleSidebarClose = () => setSidebarOpen(false);

     const isPending = user && (user.status === 'pending' || user.status === 'rejected');
     const showNav = user && !isPending;

     return (
       <div className="app-shell">
         <Navbar onMenuToggle={showNav ? handleMenuToggle : undefined} />
         <main className="app-main">
           <Outlet />
           {showNav && sidebarOpen ? (
             <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
           ) : null}
         </main>
         {showNav ? <BottomNav /> : null}
         {!isPending ? <Footer /> : null}
       </div>
     );
   }
   