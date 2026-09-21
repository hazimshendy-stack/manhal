import { useEffect, useState } from 'react';
   import { observeAuth } from './auth';
   import { isAdmin, isManager, seesAllTeams } from './permissions';
   import type { AppUser } from '@/types';

   export interface AuthState {
     user: AppUser | null;
     loading: boolean;
     admin: boolean;
     manager: boolean;
     allTeams: boolean;
     mustChangePassword: boolean;
   }

   export function useAuth(): AuthState {
     const [user, setUser] = useState<AppUser | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const unsub = observeAuth((u, l) => {
         setUser(u);
         setLoading(l);
       });
       return unsub;
     }, []);

     return {
       user,
       loading,
       admin: isAdmin(user),
       manager: isManager(user),
       allTeams: seesAllTeams(user),
       mustChangePassword: user?.mustChangePassword === true,
     };
   }
   