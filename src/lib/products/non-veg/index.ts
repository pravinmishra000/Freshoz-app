// Export all non-veg products
export * from './chicken';
export * from './eggs';
export * from './fish';
export * from './mutton';
export * from './ready-to-eat';

// You can also export combined arrays if needed
import { CHICKEN_PRODUCTS } from './chicken';
import { EGGS_PRODUCTS } from './eggs';
import { FISH_PRODUCTS } from './fish';
import { MUTTON_PRODUCTS } from './mutton';
import { READY_TO_EAT_PRODUCTS } from './ready-to-eat';

export const ALL_NON_VEG_PRODUCTS = [
  ...CHICKEN_PRODUCTS,
  ...EGGS_PRODUCTS,
  ...FISH_PRODUCTS,
  ...MUTTON_PRODUCTS,
  ...READY_TO_EAT_PRODUCTS,
];
