/**
 * Utility to clear old/wrong data
 * Use from admin panel or console
 */

/**
 * Clear ALL notifications
 */
export async function clearAllNotifications(): Promise<number> {
  const snap = await getDocs(collection(db, 'notifications'));
  let count = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, 'notifications', d.id));
    count++;
  }
  return count;
}

/**
 * Clear all notifications for a specific user
 */
export async function clearUserNotifications(userId: string): Promise<number> {
  const snap = await getDocs(collection(db, 'notifications'));
  let count = 0;
  for (const d of snap.docs) {
    if (d.data().userId === userId) {
      await deleteDoc(doc(db, 'notifications', d.id));
      count++;
    }
  }
  return count;
}

/**
 * Clear ALL audit records
 */
export async function clearAllAudit(): Promise<number> {
  const snap = await getDocs(collection(db, 'audit'));
  let count = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, 'audit', d.id));
    count++;
  }
  return count;
}
