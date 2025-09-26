import type { Product, Promotion, EarningPeriod, Transaction, Order } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Avocados',
    description: 'Creamy and delicious organic Hass avocados, perfect for toast or guacamole.',
    price: 4.99,
    category: 'Fruits',
    imageUrl: 'https://picsum.photos/seed/avocado/400/400',
    imageHint: 'avocado fruit',
    stock: 50,
  },
  {
    id: '2',
    name: 'Fresh Strawberries',
    description: 'Sweet, juicy, and locally grown strawberries. A seasonal favorite.',
    price: 3.5,
    category: 'Fruits',
    imageUrl: 'https://picsum.photos/seed/strawberry/400/400',
    imageHint: 'strawberry fruit',
    stock: 80,
  },
  {
    id: '3',
    name: 'Heirloom Tomatoes',
    description: 'Flavorful and colorful heirloom tomatoes, straight from the farm.',
    price: 5.2,
    category: 'Vegetables',
    imageUrl: 'https://picsum.photos/seed/tomato/400/400',
    imageHint: 'tomato vegetable',
    stock: 40,
  },
  {
    id: '4',
    name: 'Crisp Romain Lettuce',
    description: 'Fresh and crisp heads of Romaine lettuce, ideal for salads and sandwiches.',
    price: 2.8,
    category: 'Vegetables',
    imageUrl: 'https://picsum.photos/seed/lettuce/400/400',
    imageHint: 'lettuce vegetable',
    stock: 60,
  },
  {
    id: '5',
    name: 'Artisanal Sourdough',
    description: 'A rustic loaf of naturally leavened sourdough, baked fresh daily.',
    price: 6.0,
    category: 'Bakery',
    imageUrl: 'https://picsum.photos/seed/bread/400/400',
    imageHint: 'bread loaf',
    stock: 30,
  },
  {
    id: '6',
    name: 'Free-Range Eggs',
    description: 'One dozen large brown eggs from pasture-raised, free-range chickens.',
    price: 7.5,
    category: 'Dairy',
    imageUrl: 'https://picsum.photos/seed/eggs/400/400',
    imageHint: 'eggs carton',
    stock: 100,
  },
  {
    id: '7',
    name: 'Organic Milk',
    description: 'A half-gallon of fresh, organic whole milk. Rich and wholesome.',
    price: 4.25,
    category: 'Dairy',
    imageUrl: 'https://picsum.photos/seed/milk/400/400',
    imageHint: 'milk bottle',
    stock: 75,
  },
  {
    id: '8',
    name: 'Cold-Pressed Juice',
    description: 'A refreshing blend of apple, kale, and ginger cold-pressed juice.',
    price: 5.5,
    category: 'Beverages',
    imageUrl: 'https://picsum.photos/seed/juice/400/400',
    imageHint: 'juice bottle',
    stock: 45,
  },
  {
    id: '9',
    name: 'Sweet Oranges',
    description: 'Juicy and sweet Navel oranges, packed with Vitamin C.',
    price: 3.2,
    category: 'Fruits',
    imageUrl: 'https://picsum.photos/seed/oranges/400/400',
    imageHint: 'oranges fruit',
    stock: 90,
  },
  {
    id: '10',
    name: 'Fresh Broccoli',
    description: 'Crisp and tender broccoli crowns, perfect for steaming or roasting.',
    price: 2.99,
    category: 'Vegetables',
    imageUrl: 'https://picsum.photos/seed/broccoli/400/400',
    imageHint: 'broccoli vegetable',
    stock: 55,
  },
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
    description: 'Save $5 when you spend $25 on fresh vegetables.',
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

export const orders: Omit<Order, 'deliveryAddress'>[] = [
    {
      id: 'FZ-12345',
      userId: 'user1',
      items: [
        { productId: '1', name: 'Organic Avocados', price: 4.99, quantity: 2 },
        { productId: '5', name: 'Artisanal Sourdough', price: 6.0, quantity: 1 },
      ],
      total: 15.98,
      status: 'out for delivery',
      createdAt: new Date('2023-10-27T10:00:00Z'),
      updatedAt: new Date('2023-10-27T11:00:00Z'),
    },
     {
      id: 'FZ-67890',
      userId: 'user1',
      items: [
        { productId: '2', name: 'Fresh Strawberries', price: 3.50, quantity: 1 },
      ],
      total: 3.50,
      status: 'delivered',
      createdAt: new Date('2023-10-25T14:30:00Z'),
      updatedAt: new Date('2023-10-25T15:15:00Z'),
    }
  ];
