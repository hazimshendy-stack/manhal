import { useEffect, useState } from 'react';
   import { collection, onSnapshot, query } from 'firebase/firestore';
   import { db } from './firebase';

   export function useRealtimeCollection<T>(
     collectionName: string,
   ): { data: T[]; loading: boolean } {
     const [data, setData] = useState<T[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const q = query(collection(db, collectionName));
       const unsub = onSnapshot(
         q,
         (snap) => {
           const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
           setData(items);
           setLoading(false);
         },
         () => {
           setData([]);
           setLoading(false);
         },
       );
       return () => unsub();
     }, [collectionName]);

     return { data, loading };
   }
   