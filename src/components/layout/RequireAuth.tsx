   import type { ReactNode } from 'react';
   import { Navigate, useLocation } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { Loading } from '@/components/ui/Loading';
   import type { RoleId } from '@/types';

   interface RequireAuthProps {
     children: ReactNode;
     roles?: RoleId[];
   }

   export function RequireAuth({ children, roles }: RequireAuthProps) {
     const { user, loading, mustChangePassword } = useAuth();
     const { pathname } = useLocation();

     if (loading) {
       return <Loading message="Verifying session..." fullHeight />;
     }

     if (!user) {
       return <Navigate to="/login" replace />;
     }

     /* ─── Pending / rejected users → force to pending page ─── */
     if (user.status === 'pending' || user.status === 'rejected') {
       if (pathname !== '/pending-approval') {
         return <Navigate to="/pending-approval" replace />;
       }
       return <>{children}</>;
     }

     if (mustChangePassword && pathname !== '/change-password') {
       return <Navigate to="/change-password" replace />;
     }

     if (roles && !roles.includes(user.role)) {
       return <Navigate to="/dashboard" replace />;
     }

     return <>{children}</>;
   }
   