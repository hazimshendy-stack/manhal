import { Navigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading } from '@/components/ui/Loading';

   export function MyProfilePage() {
     const { user, loading } = useAuth();

     if (loading) return <Loading fullHeight />;

     if (!user?.memberId) {
       return (
         <div className="container">
           <EmptyState
             icon="👤"
             title="لا يوجد ملف شخصي"
             message="حسابك غير مرتبط بملف عضو. تواصل مع الإدارة."
           />
         </div>
       );
     }

     return <Navigate to={'/members/' + user.memberId} replace />;
   }
   