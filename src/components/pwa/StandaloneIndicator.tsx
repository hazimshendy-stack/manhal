import { useEffect, useState } from 'react';
   import { isStandalone } from '@/lib/pwa';

   export function StandaloneIndicator() {
     const [standalone, setStandalone] = useState(false);

     useEffect(() => {
       setStandalone(isStandalone());
     }, []);

     if (!standalone) return null;

     return null;
   }
   