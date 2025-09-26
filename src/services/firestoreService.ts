import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import type { Order, Rider } from '@/lib/types';

/**
 * Fetches a single order from Firestore.
 * @param orderId The ID of the order to fetch.
 * @returns A promise that resolves to the Order object or null if not found.
 */
export async function getOrder(orderId: string): Promise<(Order & { id: string }) | null> {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (orderSnap.exists()) {
    // Note: The document data needs to be explicitly typed on retrieval.
    return { id: orderSnap.id, ...orderSnap.data() } as Order & { id: string };
  } else {
    return null;
  }
}

/**
 * Fetches all riders who are currently active and available.
 * @returns A promise that resolves to an array of available Rider objects.
 */
export async function getAvailableRiders(): Promise<Rider[]> {
  const ridersRef = collection(db, 'riders');
  const q = query(ridersRef, where('activeStatus', '==', 'active'));
  const querySnapshot = await getDocs(q);

  const riders: Rider[] = [];
  querySnapshot.forEach((doc) => {
    riders.push({ id: doc.id, ...doc.data() } as Rider);
  });

  return riders;
}

/**
 * Updates an order document in Firestore.
 * @param orderId The ID of the order to update.
 * @param data The partial data to update the order with.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, data);
}
