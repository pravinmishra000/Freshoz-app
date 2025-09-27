// Export all snacks-beverages products
export * from './beverages';
export * from './snacks';
export * from './water-juice';

// You can also export combined arrays if needed
import { BEVERAGES_PRODUCTS } from './beverages';
import { SNACKS_PRODUCTS } from './snacks';
import { WATER_JUICE_PRODUCTS } from './water-juice';

export const ALL_SNACKS_BEVERAGES_PRODUCTS = [
  ...BEVERAGES_PRODUCTS,
  ...SNACKS_PRODUCTS,
  ...WATER_JUICE_PRODUCTS
];
