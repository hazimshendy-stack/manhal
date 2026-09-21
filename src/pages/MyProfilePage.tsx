
   
   
   

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
   