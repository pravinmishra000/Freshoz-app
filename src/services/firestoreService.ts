
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
  onSnapshot, Unsubscribe, deleteDoc,
} from 'firebase/firestore';
import type { Order, User, OrderStatus, Address, Product, ProductInput } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';
import { auth } from '@/lib/firebase/server';

const firestoreDb = db; // Use client-side db instance

// USER FUNCTIONS
export async function getUser(userId: string): Promise<User | null> {
    try {
        const userRef = doc(firestoreDb, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() } as User;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user with client SDK:", error);
        return null;
    }
}

// ORDER FUNCTIONS
export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const ordersCollection = collection(firestoreDb, 'orders');
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

export async function getAllOrders(): Promise<Order[]> {
  const ordersCollection = collection(firestoreDb, 'orders');
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

export async function getOrder(orderId: string): Promise<Order | null> {
  const orderRef = doc(firestoreDb, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  if (orderSnap.exists()) {
    const data = orderSnap.data();
    return { firestoreId: orderSnap.id, ...data, createdAt: data.createdAt ?? Timestamp.now() } as Order;
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

export async function createOrder(orderData: CreateOrderData): Promise<string> {
  const ordersCollection = collection(firestoreDb, 'orders');

  const newOrderData = {
    ...orderData,
    firestoreId: '', // placeholder, will replace with doc.id
    deliveryAddress: orderData.address,
    id: `FZ-${uuidv4().split('-')[0].toUpperCase()}`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const newOrderRef = await addDoc(ordersCollection, newOrderData);
  await updateDoc(newOrderRef, { firestoreId: newOrderRef.id });
  return newOrderRef.id;
}

export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
  const orderRef = doc(firestoreDb, 'orders', orderId);
  await updateDoc(orderRef, data);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
  const orderRef = doc(firestoreDb, 'orders', orderId);
  await updateDoc(orderRef, { status, updatedAt: serverTimestamp() });
  const updatedOrderSnap = await getDoc(orderRef);
  if (updatedOrderSnap.exists()) {
    const data = updatedOrderSnap.data();
    return { firestoreId: updatedOrderSnap.id, ...data, updatedAt: data.updatedAt ?? Timestamp.now() } as Order;
  }
  return null;
}

// PRODUCT FUNCTIONS
export async function getAllProducts(): Promise<Product[]> {
    const productsCollection = collection(firestoreDb, 'products');
    const querySnapshot = await getDocs(productsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function createProduct(productData: ProductInput): Promise<string> {
    const productsCollection = collection(firestoreDb, 'products');
    const newProductRef = await addDoc(productsCollection, {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return newProductRef.id;
}

export async function updateProduct(productId: string, productData: Partial<ProductInput>): Promise<void> {
    const productRef = doc(firestoreDb, 'products', productId);
    await updateDoc(productRef, {
        ...productData,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteProduct(productId: string): Promise<void> {
    const productRef = doc(firestoreDb, 'products', productId);
    await deleteDoc(productRef);
}

export async function updateProductStock(productId: string, quantityChange: number): Promise<void> {
  const productRef = doc(firestoreDb, 'products', productId);
  await updateDoc(productRef, { stock_qty: increment(quantityChange) });
}


// WALLET FUNCTIONS
export async function getWalletBalance(userId: string): Promise<number> {
  const walletRef = doc(firestoreDb, 'wallets', userId);
  const walletSnap = await getDoc(walletRef);
  if (walletSnap.exists()) {
    return walletSnap.data().balance ?? 0;
  }
  await setDoc(walletRef, { balance: 0, lastUpdated: serverTimestamp() });
  return 0;
}

export function listenToWalletBalance(userId: string, callback: (balance: number) => void): Unsubscribe {
    const walletRef = doc(firestoreDb, 'wallets', userId);
    const unsubscribe = onSnapshot(walletRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data().balance ?? 0);
        } else {
            callback(0);
        }
    }, (error) => {
        console.error("Error listening to wallet balance:", error);
        callback(0);
    });
    return unsubscribe;
}

export async function updateWalletBalance(userId: string, amount: number): Promise<void> {
  const walletRef = doc(firestoreDb, 'wallets', userId);
  await setDoc(walletRef, { balance: increment(amount), lastUpdated: serverTimestamp() }, { merge: true });
}


// ANALYTICS FUNCTIONS
export async function getAnalyticsSummary() {
  const ordersCollection = collection(firestoreDb, 'orders');
  const usersCollection = collection(firestoreDb, 'users');

  const ordersSnapshot = await getDocs(ordersCollection);
  let totalRevenue = 0;
  const totalOrders = ordersSnapshot.size;
  ordersSnapshot.forEach(doc => {
    totalRevenue += doc.data()?.totalAmount ?? 0;
  });

  const usersQuery = query(usersCollection, where('role', '==', 'customer'));
  const usersSnapshot = await getDocs(usersQuery);
  const totalUsers = usersSnapshot.size;

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
