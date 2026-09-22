import { Navigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading } from '@/components/ui/Loading';
import { members } from '@/data/members';

   export function MyProfilePage() {
     const { user, loading } = useAuth();
     if (loading) return <Loading fullHeight />;
     if (!user?.memberId) return <div className="container"><EmptyState title="No member profile" message="Your account is not linked to a member." /></div>;
     return <Navigate to={'/members/' + user.memberId} replace />;
   }
   