import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import type { Order, User } from '@/lib/types';

/**
 * Fetches a single order from Firestore.
 * @param orderId The ID of the order to fetch.
 * @returns A promise that resolves to the Order object or null if not found.
 */
export async function getOrder(orderId: string): Promise<(Order & { id: string }) | null> {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (orderSnap.exists()) {
    return { id: orderSnap.id, ...orderSnap.data() } as Order & { id: string };
  } else {
    return null;
  }
}

/**
 * Fetches a single user from Firestore.
 * @param userId The ID of the user to fetch.
 * @returns A promise that resolves to the User object or null if not found.
 */
export async function getUser(userId: string): Promise<(User & { id: string }) | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User & { id: string };
  } else {
    return null;
  }
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
