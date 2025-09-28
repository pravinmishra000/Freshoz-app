
import type { Product, Promotion, EarningPeriod, Transaction, Order, Category } from './types';
import { 
  Carrot, 
  Milk, 
  ShoppingCart, 
  Coffee,
  Drumstick 
} from 'lucide-react';
import { ALL_DAIRY_BAKERY_PRODUCTS } from './products/dairy-bakery';
import { ALL_NON_VEG_PRODUCTS } from './products/non-veg';
import { ALL_STAPLES_GROCERY_PRODUCTS } from './products/staples-grocery';
import { ALL_VEGETABLES_FRUITS_PRODUCTS } from './products/vegetables-fruits';
import { ALL_SNACKS_BEVERAGES_PRODUCTS } from './products/snacks-beverages';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name_en: 'Vegetables & Fruits',
    name_hi: 'Sabji aur Fal',
    slug: 'vegetables-fruits',
    icon: Carrot,
    description: 'Fresh vegetables and fruits from local farms',
    description_hi: 'Local farms se fresh vegetables aur fruits',
    image: 'https://picsum.photos/seed/cat-1/400/400',
    tags: ['fresh', 'organic', 'seasonal', 'local'],
    is_active: true,
    display_order: 1,
    parent_id: null,
    subCategories: [
      { name: 'Fresh Vegetables', slug: 'fresh-vegetables' },
      { name: 'Fresh Fruits', slug: 'fresh-fruits' },
      { name: 'Organic', slug: 'organic' },
      { name: 'Exotic Fruits', slug: 'exotic-fruits' },
      { name: 'Leafy Greens', slug: 'leafy-greens' },
    ],
    featured: true,
    meta_title: 'Fresh Vegetables and Fruits Online',
    meta_description: 'Buy fresh vegetables and fruits online with quick delivery'
  },
  {
    id: 'cat-2',
    name_en: 'Dairy & Bakery', 
    name_hi: 'Doodh aur Bread',
    slug: 'dairy-bakery',
    icon: Milk,
    description: 'Fresh dairy products and bakery items',
    description_hi: 'Fresh dairy products aur bakery items',
    image: 'https://picsum.photos/seed/cat-2/400/400',
    tags: ['fresh', 'daily', 'baked', 'milk'],
    is_active: true,
    display_order: 2,
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
    id: 'cat-3',
    name_en: 'Snacks & Beverages',
    name_hi: 'Nashte aur Peene ki Cheezein',
    slug: 'snacks-beverages', 
    icon: Coffee,
    description: 'Snacks and beverages for quick refreshment',
    description_hi: 'Quick refreshment ke liye snacks aur beverages',
    image: 'https://picsum.photos/seed/cat-3/400/400',
    tags: ['snacks', 'beverages', 'drinks', 'refreshment'],
    is_active: true,
    display_order: 4,
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
  },
  {
    id: 'cat-4',
    name_en: 'Staples & Grocery',
    name_hi: 'Kirane ka Saman', 
    slug: 'staples-grocery',
    icon: ShoppingCart,
    description: 'Daily essentials and grocery items',
    description_hi: 'Daily essentials aur grocery items',
    image: 'https://picsum.photos/seed/cat-4/400/400',
    tags: ['essentials', 'grocery', 'staples', 'kitchen'],
    is_active: true,
    display_order: 3,
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
    description_hi: 'Fresh non-vegetarian products',
    image: 'https://picsum.photos/seed/cat-5/400/400',
    tags: ['fresh', 'meat', 'chicken', 'fish', 'mutton'],
    is_active: true,
    display_order: 5,
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
    title: 'Weekly Special',
    description: 'Get 20% off all organic berries!',
    imageUrl: 'https://picsum.photos/seed/promo-berries/600/400',
    imageHint: 'berries fruit',
  },
  {
    id: 'promo-2',
    title: 'Bakery Bonanza',
    description: 'Buy one, get one free on all sourdough bread.',
    imageUrl: 'https://picsum.photos/seed/promo-bread/600/400',
    imageHint: 'fresh bread',
  },
  {
    id: 'promo-3',
    title: 'Veggie Power',
    description: 'Save ₹400 when you spend ₹2000 on fresh vegetables.',
    imageUrl: 'https://picsum.photos/seed/promo-veggies/600/400',
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
