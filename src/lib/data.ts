
import type { Product, Promotion, EarningPeriod, Transaction, Order, Category } from './types';
import { 
  Carrot, 
  Milk, 
  ShoppingCart, 
  Coffee,
  Drumstick,
  Apple
} from 'lucide-react';
import { ALL_DAIRY_BAKERY_PRODUCTS } from './products/dairy-bakery';
import { ALL_NON_VEG_PRODUCTS } from './products/non-veg';
import { ALL_STAPLES_GROCERY_PRODUCTS } from './products/staples-grocery';
import { ALL_VEGETABLES_FRUITS_PRODUCTS } from './products/vegetables-fruits';
import { ALL_SNACKS_BEVERAGES_PRODUCTS } from './products/snacks-beverages';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name_en: 'Fresh Vegetables',
    name_hi: 'Tazi Sabjiyan',
    slug: 'fresh-vegetables',
    icon: Carrot,
    description: 'Farm-fresh vegetables picked daily',
    description_hi: 'Khet se roz chuni hui tazi sabjiyan',
    image: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/categories%2Fvegetables%2Fvegetable-banner.webp?alt=media&token=8c6a8581-2234-42f2-8951-87130c5e9334',
    tags: ['fresh', 'organic', 'seasonal', 'local'],
    is_active: true,
    display_order: 1,
    parent_id: null,
    subCategories: [
      { name: 'Leafy Greens', slug: 'leafy-greens' },
      { name: 'Root Vegetables', slug: 'root-vegetables' },
      { name: 'Organic', slug: 'organic-veg' },
    ],
    featured: true,
    meta_title: 'Fresh Vegetables Online',
    meta_description: 'Buy farm-fresh vegetables online with quick delivery'
  },
  {
    id: 'cat-6',
    name_en: 'Fresh Fruits',
    name_hi: 'Taze Fal',
    slug: 'fresh-fruits',
    icon: Apple,
    description: 'A variety of fresh and juicy fruits',
    description_hi: 'Alag alag kism ke taze aur rasile fal',
    image: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/categories%2Ffruits%2Ffruits-banner.webp?alt=media&token=c16b3f71-2993-41c3-a3d5-d91240c9d96c',
    tags: ['fresh', 'juicy', 'seasonal', 'exotic'],
    is_active: true,
    display_order: 2,
    parent_id: null,
    subCategories: [
      { name: 'Seasonal Fruits', slug: 'seasonal-fruits' },
      { name: 'Exotic Fruits', slug: 'exotic-fruits' },
      { name: 'Berries', slug: 'berries' },
    ],
    featured: true,
    meta_title: 'Fresh Fruits Online',
    meta_description: 'Order fresh and juicy fruits for delivery'
  },
  {
    id: 'cat-2',
    name_en: 'Dairy & Bakery', 
    name_hi: 'Doodh aur Bread',
    slug: 'dairy-bakery',
    icon: Milk,
    description: 'Fresh dairy products and bakery items',
    description_hi: 'Taze doodh ke utpaad aur bakery ke saaman',
    image: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/categories%2Fdairy%2Fdairy-banner.webp?alt=media&token=86a427f7-3475-4039-9d57-b435b8098555',
    tags: ['fresh', 'daily', 'baked', 'milk'],
    is_active: true,
    display_order: 3,
    parent_id: null,
    subCategories: [
      { name: 'Milk', slug: 'milk' },
      { name: 'Curd & Yogurt', slug: 'curd-yogurt' },
      { name: 'Cheese', slug: 'cheese' },
      { name: 'Butter', slug: 'butter' },
      { name: 'Bread', slug: 'bread' },
      { name: 'Cakes', slug: 'cakes' },
      { name: 'Frozen', slug: 'frozen' },
    ],
    featured: true,
    meta_title: 'Dairy and Bakery Products Online',
    meta_description: 'Fresh dairy and bakery products delivered to your doorstep'
  },
  {
    id: 'cat-4',
    name_en: 'Staples & Grocery',
    name_hi: 'Kirane ka Saman', 
    slug: 'staples-grocery',
    icon: ShoppingCart,
    description: 'Daily essentials and grocery items',
    description_hi: 'Roz ke zaroori saaman aur kirane ki cheezein',
    image: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/categories%2Fstaples%2Fstaples-banner.webp?alt=media&token=1d37446e-5d18-406a-a22a-a92c30c345c2',
    tags: ['essentials', 'grocery', 'staples', 'kitchen'],
    is_active: true,
    display_order: 4,
    parent_id: null,
    subCategories: [
      { name: 'Pulses', slug: 'pulses' },
      { name: 'Flour & Atta', slug: 'flour-atta' },
      { name: 'Rice & Grains', slug: 'rice-grains' },
      { name: 'Spices', slug: 'spices' },
      { name: 'Oil & Ghee', slug: 'oil-ghee' },
      { name: 'Sugar & Salt', slug: 'sugar-salt' },
    ],
    featured: true,
    meta_title: 'Staples and Grocery Items Online',
    meta_description: 'All your kitchen essentials in one place'
  },
  {
    id: 'cat-5',
    name_en: 'Non-Veg',
    name_hi: 'Ande aur Chicken',
    slug: 'non-veg',
    icon: Drumstick,
    description: 'Fresh non-vegetarian products',
    description_hi: 'Taze non-vegetarian utpaad',
    image: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/categories%2Fnon-veg%2Fnon-veg-banner.webp?alt=media&token=5b2639fd-9b7e-4919-8664-9844f2b9843c',
    tags: ['fresh', 'meat', 'chicken', 'fish', 'mutton'],
    is_active: true,
    display_order: 6,
    parent_id: null,
    subCategories: [
      { name: 'Eggs', slug: 'eggs' },
      { name: 'Chicken', slug: 'chicken' },
      { name: 'Mutton', slug: 'mutton' },
      { name: 'Fish', slug: 'fish' },
      { name: 'Seafood', slug: 'seafood' },
      { name: 'Frozen Meat', slug: 'frozen-meat' },
    ],
    featured: true,
    meta_title: 'Fresh Non-Veg Products Online',
    meta_description: 'Quality non-vegetarian products with quick delivery'
  },
  {
    id: 'cat-3',
    name_en: 'Snacks & Beverages',
    name_hi: 'Nashta aur Peene ka Saman',
    slug: 'snacks-beverages', 
    icon: Coffee,
    description: 'Snacks and beverages for quick refreshment',
    description_hi: 'Turant refreshment ke liye snacks aur peene ka saman',
    image: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/categories%2Fsnacks%2Fsnacks-banner.webp?alt=media&token=f0d8b4e7-3f1f-4d6c-8e4a-4e2b0c1b7a2e',
    tags: ['snacks', 'beverages', 'drinks', 'refreshment'],
    is_active: true,
    display_order: 5,
    parent_id: null,
    subCategories: [
      { name: 'Cookies', slug: 'cookies' },
      { name: 'Namkeen', slug: 'namkeen' },
      { name: 'Chips', slug: 'chips' },
      { name: 'Cold Drinks', slug: 'cold-drinks' },
      { name: 'Juices', slug: 'juices' },
      { name: 'Water', slug: 'water' },
      { name: 'Tea & Coffee', slug: 'tea-coffee' },
    ],
    featured: true,
    meta_title: 'Snacks and Beverages Online',
    meta_description: 'Wide range of snacks and beverages available'
  }
];


export const products: Product[] = [
    ...ALL_DAIRY_BAKERY_PRODUCTS,
    ...ALL_NON_VEG_PRODUCTS,
    ...ALL_STAPLES_GROCERY_PRODUCTS,
    ...ALL_VEGETABLES_FRUITS_PRODUCTS,
    ...ALL_SNACKS_BEVERAGES_PRODUCTS
];

export const promotions: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Smart Grocery Deals',
    description: 'Save ₹300 on orders above ₹1500 – staples, spices & more!',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/banners%2Fcarousel%2Fcarousel-3.webp?alt=media&token=2caedabd-2071-4474-ac15-28143980a111',
    imageHint: 'berries fruit',
  },
  {
    id: 'promo-2',
    title: 'Daily Dairy Fresh',
    description: 'Get flat 15% off on milk, paneer & ghee this week!',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/banners%2Fcarousel%2Fcarousel-2.webp?alt=media&token=e87d815b-fd88-4150-bf65-afdc825c1a44',
    imageHint: 'fresh bread',
  },
  {
    id: 'promo-3',
    title: 'Veggie Freshness',
    description: 'Save ₹400 when you spend ₹2000 on farm-fresh vegetables.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/freshoz-fresh-fast.firebasestorage.app/o/banners%2Fcarousel%2Fcarousel-1.webp?alt=media&token=4c61242c-b096-49d4-af1d-742aa1dc7f25',
    imageHint: 'vegetables variety',
  },
];

export const earningsData: EarningPeriod[] = [
  { day: 'Mon', earnings: 120 },
  { day: 'Tue', earnings: 150 },
  { day: 'Wed', earnings: 170 },
  { day: 'Thu', earnings: 130 },
  { day: 'Fri', earnings: 210 },
  { day: 'Sat', earnings: 250 },
  { day: 'Sun', earnings: 180 },
];

export const transactions: Transaction[] = [
  { id: '#3210', status: 'Completed', amount: 25.0, date: '2023-10-26' },
  { id: '#3209', status: 'Completed', amount: 15.0, date: '2023-10-26' },
  { id: '#3208', status: 'Completed', amount: 42.5, date: '2023-10-25' },
  { id: '#3207', status: 'Pending', amount: 10.0, date: '2023-10-25' },
  { id: '#3206', status: 'Completed', amount: 35.75, date: '2023-10-24' },
];

export const orders: Partial<Order>[] = [
    {
      id: 'FZ-12345',
      userId: 'user1',
      items: [
        { productId: '1', name: 'Organic Avocados', price: 375, quantity: 2, image: 'https://picsum.photos/seed/avocado/100/100' },
        { productId: '5', name: 'Artisanal Sourdough', price: 450, quantity: 1, image: 'https://picsum.photos/seed/bread/100/100' },
      ],
      totalAmount: 1200,
      status: 'out for delivery',
      createdAt: new Date('2023-10-27T10:00:00Z'),
      updatedAt: new Date('2023-10-27T11:00:00Z'),
    },
     {
      id: 'FZ-67890',
      userId: 'user1',
      items: [
        { productId: '2', name: 'Fresh Strawberries', price: 260, quantity: 1, image: 'https://picsum.photos/seed/strawberry/100/100' },
      ],
      totalAmount: 260,
      status: 'delivered',
      createdAt: new Date('2023-10-25T14:30:00Z'),
      updatedAt: new Date('2023-10-25T15:15:00Z'),
    }
  ];

    

    
