// Export all dairy-bakery products
export * from './dairy';
export * from './bakery';
export * from './frozen';

// You can also export combined arrays if needed
import { DAIRY_PRODUCTS } from './dairy';
import { BAKERY_PRODUCTS } from './bakery';
import { FROZEN_PRODUCTS } from './frozen';

export const ALL_DAIRY_BAKERY_PRODUCTS = [
  ...DAIRY_PRODUCTS,
  ...BAKERY_PRODUCTS,
  ...FROZEN_PRODUCTS
];
