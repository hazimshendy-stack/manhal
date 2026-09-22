import { useEffect, useState } from 'react';
   import { collection, onSnapshot, query } from 'firebase/firestore';
   import { db } from './firebase';

   export function useRealtimeCollection<T>(collectionName: string): { data: T[]; loading: boolean } {
     const [data, setData] = useState<T[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       let unsub: (() => void) | null = null;
       try {
         const q = query(collection(db, collectionName));
         unsub = onSnapshot(
           q,
           (snap) => {
             try {
               const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
               setData(items);
             } catch (e) {
               console.error('Map failed for ' + collectionName + ':', e);
               setData([]);
             }
             setLoading(false);
           },
           (err) => {
             console.error('Snapshot error ' + collectionName + ':', err);
             setData([]);
             setLoading(false);
           },
         );
       } catch (e) {
         console.error('Subscribe error ' + collectionName + ':', e);
         setData([]);
         setLoading(false);
       }
       return () => { if (unsub) try { unsub(); } catch (e) { /* ignore */ } };
     }, [collectionName]);

     return { data, loading };
   }

   export const useCollection = useRealtimeCollection;
   