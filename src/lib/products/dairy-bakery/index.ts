// Export all dairy-bakery products
export * from './dairy';
export * from './bakery';
export * from './frozen';

// You can also export combined arrays if needed
import { DAIRY_PRODUCTS } from './dairy';
import { BAKERY_PRODUCTS } from './bakery';
import { FROZEN_PRODUCTS } from './frozen';

export const ALL_DAIRY_BAKERY_PRODUCTS = [
  ...DAIRY_PRODUCTS.map(p => ({ ...p, category_id: 'cat-2' })), // category id for Dairy & Bakery
  ...BAKERY_PRODUCTS.map(p => ({ ...p, category_id: 'cat-2' })),
  ...FROZEN_PRODUCTS.map(p => ({ ...p, category_id: 'cat-2' }))
];
