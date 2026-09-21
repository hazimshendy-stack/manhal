import type { ReactNode } from 'react';
   
   
   
   import type { RoleId } from '@/types';

   interface RequireAuthProps {
     children: ReactNode;
     roles?: RoleId[];
   }

   export function RequireAuth({ children, roles }: RequireAuthProps) {
     const { user, loading, mustChangePassword } = useAuth();

     if (loading) {
       return <Loading message="جارٍ التحقق من الجلسة..." fullHeight />;
     }

     if (!user) {
       return <Navigate to="/login" replace />;
     }

     if (mustChangePassword) {
       return <Navigate to="/change-password" replace />;
     }

     if (roles && !roles.includes(user.role)) {
       return <Navigate to="/dashboard" replace />;
     }

     return <>{children}</>;
   }
   