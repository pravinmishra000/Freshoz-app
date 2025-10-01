
import { db } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  addDoc,
  serverTimestamp,
  Timestamp,
  endAt,
  startAt,
  orderBy,
  increment,
  setDoc,
  onSnapshot, Unsubscribe,
  arrayUnion
} from 'firebase/firestore';
import type { Order, User, OrderStatus, Address } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';

/**
 * Fetch orders for a specific user, sorted newest first
 */
export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const ordersCollection = collection(db, 'orders');
  const q = query(ordersCollection, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  const orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    orders.push({
      firestoreId: doc.id,
      ...data,
      createdAt: data.createdAt ?? Timestamp.now()
    } as Order);
  });

  return orders.sort((a, b) => (b.createdAt as Timestamp).seconds - (a.createdAt as Timestamp).seconds);
}

/**
 * Fetch all orders (admin)
 */
export async function getAllOrders(): Promise<Order[]> {
  const ordersCollection = collection(db, 'orders');
  const querySnapshot = await getDocs(ordersCollection);

  const orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    orders.push({
      firestoreId: doc.id,
      ...data,
      createdAt: data.createdAt ?? Timestamp.now()
    } as Order);
  });

  return orders.sort((a, b) => (b.createdAt as Timestamp).seconds - (a.createdAt as Timestamp).seconds);
}

/**
 * Get single order
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  if (orderSnap.exists()) {
    const data = orderSnap.data();
    return { firestoreId: orderSnap.id, ...data, createdAt: data.createdAt ?? Timestamp.now() } as Order;
  }
  return null;
}

/**
 * Get single user
 */
export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User;
  }
  return null;
}

/**
 * Get wallet balance from wallets collection (one-time fetch)
 */
export async function getWalletBalance(userId: string): Promise<number> {
  const walletRef = doc(db, 'wallets', userId);
  const walletSnap = await getDoc(walletRef);
  if (walletSnap.exists()) {
    return walletSnap.data().balance ?? 0;
  }
  // If wallet doesn't exist, create it with 0 balance
  await setDoc(walletRef, { balance: 0, lastUpdated: serverTimestamp() });
  return 0;
}

/**
 * Listen to real-time updates for a user's wallet balance
 */
export function listenToWalletBalance(userId: string, callback: (balance: number) => void): Unsubscribe {
    const walletRef = doc(db, 'wallets', userId);

    const unsubscribe = onSnapshot(walletRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data().balance ?? 0);
        } else {
            // If the wallet document doesn't exist, we can assume a balance of 0
            callback(0);
        }
    }, (error) => {
        console.error("Error listening to wallet balance:", error);
        callback(0); // Report 0 on error
    });

    return unsubscribe;
}


/**
 * Update wallet balance
 */
export async function updateWalletBalance(userId: string, amount: number): Promise<void> {
  const walletRef = doc(db, 'wallets', userId);
  // Using increment to avoid race conditions
  await setDoc(walletRef, { balance: increment(amount), lastUpdated: serverTimestamp() }, { merge: true });
}


/**
 * Update an order
 */
export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, data);
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { status, updatedAt: serverTimestamp() });
  const updatedOrderSnap = await getDoc(orderRef);
  if (updatedOrderSnap.exists()) {
    const data = updatedOrderSnap.data();
    return { firestoreId: updatedOrderSnap.id, ...data, updatedAt: data.updatedAt ?? Timestamp.now() } as Order;
  }
  return null;
}

interface CreateOrderData {
  userId: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  address: Address;
}

/**
 * Create new order
 */
export async function createOrder(orderData: CreateOrderData): Promise<string> {
  const ordersCollection = collection(db, 'orders');

  const newOrderData = {
    ...orderData,
    firestoreId: '', // placeholder, will replace with doc.id
    deliveryAddress: orderData.address,
    id: `FZ-${uuidv4().split('-')[0].toUpperCase()}`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const newOrderRef = await addDoc(ordersCollection, newOrderData);

  // Directly update firestoreId
  await updateDoc(newOrderRef, { firestoreId: newOrderRef.id });

  return newOrderRef.id;
}

/**
 * Add or update a user's address
 */
export async function updateUserAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    const userRef = doc(db, 'users', userId);
    
    // Generate a unique ID for the new address
    const newAddressId = uuidv4();
    const newAddress: Address = { ...address, id: newAddressId };

    // Atomically add the new address to the 'addresses' array in the user's document.
    await updateDoc(userRef, {
        addresses: arrayUnion(newAddress)
    });

    // Return the newly created address with its ID.
    return newAddress;
}


/**
 * Update product stock (optional: prevent negative stock)
 */
export async function updateProductStock(productId: string, quantityChange: number): Promise<void> {
  const productRef = doc(db, 'products', productId);

  // Optional: prevent negative stock
  // const productSnap = await getDoc(productRef);
  // if (productSnap.exists()) {
  //   const currentStock = productSnap.data().stock_qty ?? 0;
  //   if (currentStock + quantityChange < 0) throw new Error('Insufficient stock');
  // }

  await updateDoc(productRef, { stock_qty: increment(quantityChange) });
}

/**
 * Analytics summary
 */
export async function getAnalyticsSummary() {
  const ordersCollection = collection(db, 'orders');
  const usersCollection = collection(db, 'users');

  // Total revenue & orders
  const ordersSnapshot = await getDocs(ordersCollection);
  let totalRevenue = 0;
  const totalOrders = ordersSnapshot.size;
  ordersSnapshot.forEach(doc => {
    totalRevenue += doc.data()?.totalAmount ?? 0;
  });

  // Total users
  const usersQuery = query(usersCollection, where('role', '==', 'customer'));
  const usersSnapshot = await getDocs(usersQuery);
  const totalUsers = usersSnapshot.size;

  // Last 7 days
  const endDate = new Date();
  const startDate = subDays(endDate, 6);

  const recentOrdersQuery = query(
    ordersCollection,
    orderBy('createdAt'),
    startAt(Timestamp.fromDate(startDate)),
    endAt(Timestamp.fromDate(endDate))
  );

  const recentOrdersSnapshot = await getDocs(recentOrdersQuery);

  const dailyData: { [key: string]: { revenue: number; orders: number } } = {};
  for (let i = 0; i < 7; i++) {
    const day = format(subDays(endDate, i), 'MMM d');
    dailyData[day] = { revenue: 0, orders: 0 };
  }

  recentOrdersSnapshot.forEach(doc => {
    const order = doc.data() as Order;
    const orderDate = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date();
    const formattedDate = format(orderDate, 'MMM d');
    if (dailyData[formattedDate]) {
      dailyData[formattedDate].revenue += order.totalAmount ?? 0;
      dailyData[formattedDate].orders += 1;
    }
  });

  const revenueByDay = Object.entries(dailyData).map(([date, { revenue }]) => ({ date, revenue })).reverse();
  const ordersByDay = Object.entries(dailyData).map(([date, { orders }]) => ({ date, orders })).reverse();

  return {
    totalRevenue,
    totalOrders,
    totalUsers,
    revenueByDay,
    ordersByDay,
  };
}
