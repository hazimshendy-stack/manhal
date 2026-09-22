

export async function listAll<T>(collectionName: string): Promise<T[]> {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
}

export async function getOne<T>(collectionName: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export async function createOne<T extends { id?: string }>(
  collectionName: string,
  data: T,
): Promise<string> {
  const dataRecord = data as Record<string, unknown>;
  const explicitId = typeof dataRecord.id === 'string' ? (dataRecord.id as string) : undefined;

  // نبني نسخة بدون id عشان نتجنب تكرار الحقل
  const payload: Record<string, unknown> = {};
  for (const key of Object.keys(dataRecord)) {
    if (key === 'id') continue;
    payload[key] = dataRecord[key];
  }

  if (explicitId) {
    await setDoc(doc(db, collectionName, explicitId), payload);
    return explicitId;
  }

  const ref = await addDoc(collection(db, collectionName), payload);
  return ref.id;
}

export async function updateOne(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>,
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), data);
}

export async function removeOne(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

export async function listWhere<T>(
  collectionName: string,
  field: string,
  value: unknown,
): Promise<T[]> {
  const q = query(collection(db, collectionName), where(field, '==', value));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
}

export function newId(prefix: string): string {
  return (
    prefix +
    '-' +
    Date.now().toString(36).toUpperCase() +
    '-' +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function now(): string {
  return new Date().toISOString();
}
