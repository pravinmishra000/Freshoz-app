export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imageHint: string;
  stock: number;
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
  id: string;
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

export type UserRole = 'customer' | 'rider' | 'admin';

export interface User {
  id: string; // Corresponds to Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
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
  riderId?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rider {
  id: string; // Corresponds to a User ID
  vehicle: {
    type: 'bicycle' | 'scooter' | 'car';
    model: string;
    licensePlate?: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  isAvailable: boolean;
  rating: number;
  completedDeliveries: number;
}

export interface Admin {
  id: string; // Corresponds to a User ID
  permissions: string[]; // e.g., ['manage_products', 'manage_users']
}
