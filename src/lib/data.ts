import type { Product, Promotion, EarningPeriod, Transaction } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Avocados',
    price: 4.99,
    category: 'Fruits',
    imageUrl: 'https://picsum.photos/seed/avocado/400/400',
    imageHint: 'avocado fruit',
  },
  {
    id: '2',
    name: 'Fresh Strawberries',
    price: 3.5,
    category: 'Fruits',
    imageUrl: 'https://picsum.photos/seed/strawberry/400/400',
    imageHint: 'strawberry fruit',
  },
  {
    id: '3',
    name: 'Heirloom Tomatoes',
    price: 5.2,
    category: 'Vegetables',
    imageUrl: 'https://picsum.photos/seed/tomato/400/400',
    imageHint: 'tomato vegetable',
  },
  {
    id: '4',
    name: 'Crisp Romain Lettuce',
    price: 2.8,
    category: 'Vegetables',
    imageUrl: 'https://picsum.photos/seed/lettuce/400/400',
    imageHint: 'lettuce vegetable',
  },
  {
    id: '5',
    name: 'Artisanal Sourdough',
    price: 6.0,
    category: 'Bakery',
    imageUrl: 'https://picsum.photos/seed/bread/400/400',
    imageHint: 'bread loaf',
  },
  {
    id: '6',
    name: 'Free-Range Eggs',
    price: 7.5,
    category: 'Dairy',
    imageUrl: 'https://picsum.photos/seed/eggs/400/400',
    imageHint: 'eggs carton',
  },
  {
    id: '7',
    name: 'Organic Milk',
    price: 4.25,
    category: 'Dairy',
    imageUrl: 'https://picsum.photos/seed/milk/400/400',
    imageHint: 'milk bottle',
  },
  {
    id: '8',
    name: 'Cold-Pressed Juice',
    price: 5.5,
    category: 'Beverages',
    imageUrl: 'https://picsum.photos/seed/juice/400/400',
    imageHint: 'juice bottle',
  },
  {
    id: '9',
    name: 'Sweet Oranges',
    price: 3.2,
    category: 'Fruits',
    imageUrl: 'https://picsum.photos/seed/oranges/400/400',
    imageHint: 'oranges fruit',
  },
  {
    id: '10',
    name: 'Fresh Broccoli',
    price: 2.99,
    category: 'Vegetables',
    imageUrl: 'https://picsum.photos/seed/broccoli/400/400',
    imageHint: 'broccoli vegetable',
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
