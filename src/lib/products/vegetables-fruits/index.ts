// Export all vegetables-fruits products
export * from './fruits';
export * from './vegetables';

// You can also export combined arrays if needed
import { FRUITS_PRODUCTS } from './fruits';
import { VEGETABLES_PRODUCTS } from './vegetables';

export const ALL_VEGETABLES_FRUITS_PRODUCTS = [
  ...FRUITS_PRODUCTS,
  ...VEGETABLES_PRODUCTS
];
