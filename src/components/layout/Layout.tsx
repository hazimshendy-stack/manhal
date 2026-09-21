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

     // ═══ PWA init (once) ═══
     useEffect(() => {
       initPwa();
     }, []);

     // ═══ Scroll to top on route change ═══
     useEffect(() => {
       window.scrollTo(0, 0);
       setSidebarOpen(false);
     }, [pathname]);

     // ═══ إعادة التوجيه لتغيير كلمة المرور ═══
     useEffect(() => {
       if (loading) return;
       if (user && mustChangePassword && pathname !== '/change-password') {
         nav('/change-password');
       }
     }, [user, mustChangePassword, pathname, nav, loading]);

     // ═══ إغلاق الـ drawer عند تغيير المسار ═══
     const handleMenuToggle = () => {
       setSidebarOpen((v) => !v);
     };

     const handleSidebarClose = () => {
       setSidebarOpen(false);
     };

     return (
       <div className="app-shell">
         <Navbar onMenuToggle={user ? handleMenuToggle : undefined} />

         <main className="app-main">
           {/* Sidebar يُعرض كـ drawer على الجوال، ودائمًا ظاهر بجانب المحتوى في الـ dashboard */}
           <Outlet />

           {/* الـ Sidebar الفعلي يُدار داخل DashboardLayout في الصفحات المخصصة */}
           {user && sidebarOpen ? (
             <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
           ) : null}
         </main>

         {user ? <BottomNav /> : null}
         <Footer />
       </div>
     );
   }
   