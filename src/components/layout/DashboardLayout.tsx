import { Outlet } from 'react-router-dom';
   import { Sidebar } from './Sidebar';

   interface DashboardLayoutProps {
     sidebarOpen?: boolean;
     onSidebarClose?: () => void;
   }

   export function DashboardLayout({ sidebarOpen = false, onSidebarClose }: DashboardLayoutProps) {
     return (
       <div className="container">
         <div className="dashboard-layout">
           <Sidebar
             open={sidebarOpen}
             onClose={onSidebarClose ?? (() => {})}
           />
           <div>
             <Outlet />
           </div>
         </div>
       </div>
     );
   }
   