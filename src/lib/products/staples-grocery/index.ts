// Export all staples-grocery products
export * from './flour';
export * from './pulses';
export * from './rice';
export * from './spices';

// You can also export combined arrays if needed
import { FLOUR_PRODUCTS } from './flour';
import { PULSES_PRODUCTS } from './pulses';
import { RICE_PRODUCTS } from './rice';
import { SPICES_PRODUCTS } from './spices';

export const ALL_STAPLES_GROCERY_PRODUCTS = [
  ...FLOUR_PRODUCTS,
  ...PULSES_PRODUCTS,
  ...RICE_PRODUCTS,
  ...SPICES_PRODUCTS
];
