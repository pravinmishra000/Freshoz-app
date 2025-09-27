import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { FieldValue } from 'firebase/firestore';

// 🔧 Base interface for all menu items
export interface MenuItemBase {
  label: string;
  icon?: LucideIcon;
}

// 🔧 Individual variants with discriminated `type` field
export interface MenuItemWithLink extends MenuItemBase {
  type: 'link';
  href: string;
}

export interface MenuItemWithValue extends MenuItemBase {
  type: 'value';
  value: string;
}

export interface MenuItemWithAction extends MenuItemBase {
  type: 'action';
  action: string;
}

export interface MenuItemWithComponent extends MenuItemBase {
  type: 'component';
  component: ReactNode;
}

// ✅ Union type for all menu item variants
export type MenuItem =
  | MenuItemWithLink
  | MenuItemWithValue
  | MenuItemWithAction
  | MenuItemWithComponent;

// ✅ Section containing multiple menu items
export interface MenuSection {
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
}

// ✅ Legal section for footer or policy links
export interface LegalItem {
  label: string;
  href: string;
}

export interface LegalSection {
  title: string;
  items: LegalItem[];
}

export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_hi: string;
  slug: string;
  description?: string;
  description_hi?: string;
  image?: string; // 
  icon?: LucideIcon | string;
  tags?: string[];
  is_active: boolean;
  display_order: number;
  parent_id?: string | null;
  subCategories?: SubCategory[];
  featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at?: Date;
  updated_at?: Date;
}
export interface AllCategory {
  id: string;
  name_en: string;
  slug: string;
  name_hi?: string;
  description?: string; // ✅ Add this line
  icon?: string;
  image?: string;
  tags?: string[];
  is_active?: boolean;
  display_order?: number;
}
export interface WarehouseStock {
  warehouse_id: string;
  stock: number;
}

// ✅ FIXED: AssignedWarehouse should be a string literal type, not an object
export type AssignedWarehouse = 'Sultanganj' | 'Bhagalpur' | 'Khagaria' | 'N/A';

// ✅ If you need a warehouse object type, create a separate interface
export interface Warehouse {
  id: string;
  name: string;
  address: string;
}

// ✅ Nutrition information type
export interface NutritionInfo {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
}

// ✅ Review interface
export interface Review {
  user: string;
  rating: number;
  comment?: string;
  date?: string;
}

export interface Product {
    id: string;
    name_en: string;
    name_hi?: string;
    description?: string;
    image: string; // Changed from optional
    images?: string[];
    imageHint: string;
    slug?: string;
    category_slug?: string;
    subCategory_slug?: string;
    pack_size?: string;
    price: number;
    mrp: number;
    category?: string;
    category_id?: string;
    tags?: string[];
    brand: string;
    stock_qty: number; // Changed from stock
    inStock?: boolean;
    weight?: string;
    delivery_mode?: 'ecom' | 'quick' | 'standard';
    warehouse_stock?: WarehouseStock[];
    is_veg?: boolean;
    unit?: string;
    benefits?: string[];
    rating?: number;
    rating_count?: number;
    reviews?: Review[];
    nutrition?: NutritionInfo;
    createdAt?: string | FieldValue | Date;
    updatedAt?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}


// ✅ ADDED: CartItem interface for shopping cart
export interface CartItem {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  quantity: number;
  pack_size?: string;
  image: string;
  category_id?: string;
  brand?: string;
  unit?: string;
  is_veg?: boolean;
}

// ✅ ADDED: User interface
export type UserRole = 'customer' | 'admin';


// ✅ ADDED: Address interface
export interface Address {
  id?: string;
  type?: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  address: string; // This will be street
  pincode: string;
  city: string;
  state: string;
  isDefault?: boolean;
  landmark?: string;
  country?: string;
}

export interface User {
  id: string; // Corresponds to Firebase Auth UID
  displayName: string | null;
  phoneNumber: string | null;
  addresses?: Address[];
  defaultAddress?: string;
  role: UserRole;
  createdAt: FieldValue | Date;
  fcmToken?: string; // For push notifications
  // Optional fields from Firebase Auth
  email?: string | null;
  photoURL?: string | null;
  // Merged fields
  name?: string;
  address?: Address;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'placed' | 'preparing' | 'out for delivery' | 'delivered' | 'cancelled';


// ✅ ADDED: Order interface
export interface Order {
  id: string;
  firestoreId?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number; // Renamed from finalAmount
  discount?: number;
  deliveryCharge?: number;
  status: OrderStatus;
  createdAt: string | Date | FieldValue | { seconds: number, nanoseconds: number };
  updatedAt?: string | Date | FieldValue;
  deliveryAddress: Address;
  paymentMethod: 'cod' | 'online' | 'wallet' | string;
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  assigned_warehouse?: AssignedWarehouse;
  orderNotes?: string;
  expectedDelivery?: string;
}


// ✅ ADDED: Product Input type (without id for new products)
export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

// ✅ ADDED: API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ✅ ADDED: Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ✅ ADDED: Filter types for products
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  tags?: string[];
  inStock?: boolean;
  is_veg?: boolean;
  delivery_mode?: string;
}

// ✅ ADDED: Search types
export interface SearchParams {
  query: string;
  filters?: ProductFilters;
  pagination?: PaginationParams;
}

// ✅ ADDED: Auth types
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  phone: string;
}

// ✅ ADDED: Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

// ✅ ADDED: Banner/Ad types
export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  type: 'main' | 'side' | 'popup' | 'category' | 'product' | 'offer' | 'seasonal' | 'sponsored';
  active: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
}

// ✅ ADDED: Coupon types
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  categories?: string[];
  products?: string[];
}

// ✅ ADDED: Wishlist types
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  addedAt: string;
}

// ✅ ADDED: Delivery slot types
export interface DeliverySlot {
  id: string;
  time: string;
  available: boolean;
  maxOrders: number;
  currentOrders: number;
}

// ✅ ADDED: Store types
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  location: {
    lat: number;
    lng: number;
  };
  active: boolean;
}

// ✅ ADDED: Inventory types
export interface Inventory {
  productId: string;
  warehouseId: string;
  stock: number;
  lowStockThreshold: number;
  lastUpdated: string;
}

// ✅ ADDED: Analytics types
export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface ProductSales {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

// ✅ ADDED: Settings types
export interface AppSettings {
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  minOrderAmount: number;
  supportPhone: string;
  supportEmail: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

// ✅ ADDED: File upload types
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  fileSize?: number;
}

export interface Rider {
    id: string; // Corresponds to User ID (Auth UID)
    name: string;
    phone: string;
    isAvailable: boolean;
    currentLocation: {
        lat: number;
        lng: number;
    },
    fcmToken?: string;
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