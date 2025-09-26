import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, getDocs, query, updateDoc, where, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Order, User, OrderStatus } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetches all orders for a specific user from Firestore.
 * @param userId The ID of the user whose orders to fetch.
 * @returns A promise that resolves to an array of Order objects.
 */
export async function getOrdersForUser(userId: string): Promise<Order[]> {
    const ordersCollection = collection(db, 'orders');
    const q = query(ordersCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
        orders.push({ firestoreId: doc.id, ...doc.data() } as Order);
    });
    // Sort by creation date, newest first
    return orders.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
}

/**
 * Fetches all orders from Firestore, intended for admin use.
 * @returns A promise that resolves to an array of all Order objects.
 */
export async function getAllOrders(): Promise<Order[]> {
    const ordersCollection = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersCollection);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
        orders.push({ firestoreId: doc.id, ...doc.data() } as Order);
    });
    // Sort by creation date, newest first
    return orders.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
}

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
 * @param orderId The Firestore document ID of the order to update.
 * @param data The partial data to update the order with.
 */
export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, data);
}

/**
 * Updates the status of a specific order.
 * @param orderId The Firestore document ID of the order.
 * @param status The new status for the order.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: status, updatedAt: serverTimestamp() });
}

/**
 * Creates a new order in Firestore.
 * @param orderData The data for the new order.
 * @returns A promise that resolves to the new order's ID.
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'firestoreId'>): Promise<string> {
  const ordersCollection = collection(db, 'orders');
  const newOrderRef = await addDoc(ordersCollection, {
    ...orderData,
    id: `FZ-${uuidv4().split('-')[0].toUpperCase()}`, // A more user-friendly ID
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Update the document with its own Firestore ID for consistency
  await updateDoc(newOrderRef, { firestoreId: newOrderRef.id });
  return newOrderRef.id;
}
