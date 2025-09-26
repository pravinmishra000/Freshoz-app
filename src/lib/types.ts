import { FieldValue } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imageHint: string;
  stock: number;
  brand?: string;
  createdAt?: FieldValue | Date;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export interface EarningPeriod {
  day: string;
  earnings: number;
}

export interface Transaction {
  id:string;
  status: 'Completed' | 'Pending' | 'Failed';
  amount: number;
  date: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}


// Firestore Collection Types

export type UserRole = 'customer' | 'admin';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  id: string; // Corresponds to Firebase Auth UID
  displayName: string | null;
  phoneNumber: string | null;
  address?: Address;
  role: UserRole;
  createdAt: FieldValue | Date;
  fcmToken?: string; // For push notifications
  // Optional fields from Firebase Auth
  email?: string | null;
  photoURL?: string | null;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'placed' | 'preparing' | 'out for delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  address: Address;
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export interface Admin {
  id: string; // Corresponds to a User ID (Auth UID)
  name: string;
  email: string;
  role: 'admin';
}
