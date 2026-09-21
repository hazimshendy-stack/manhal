

/**
 * Hook للاستماع الحقيقي (Real-time) لمجموعة Firestore
 * يستخدم onSnapshot ليتحدث فورًا عند أي تغيير
 */
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
        const items = snap.docs.map(
          (d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }),
        ) as T[];
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

/**
 * Alias للتوافق الخلفي — استخدام useCollection يعمل بنفس الطريقة
 */
export const useCollection = useRealtimeCollection;
