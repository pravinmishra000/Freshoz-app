// Export all non-veg products
export * from './chicken';
export * from './eggs';
export * from './fish';
export * from './mutton';
export * from './ready-to-eat-non-veg';

// You can also export combined arrays if needed
import { CHICKEN_PRODUCTS } from './chicken';
import { EGGS_PRODUCTS } from './eggs';
import { FISH_PRODUCTS } from './fish';
import { MUTTON_PRODUCTS } from './mutton';
import { READY_TO_EAT_NON_VEG_PRODUCTS } from './ready-to-eat-non-veg';


export const ALL_NON_VEG_PRODUCTS = [
  ...CHICKEN_PRODUCTS.map(p => ({ ...p, category_id: 'cat-5' })),
  ...MUTTON_PRODUCTS.map(p => ({ ...p, category_id: 'cat-5' })),
  ...FISH_PRODUCTS.map(p => ({ ...p, category_id: 'cat-5' })),
  ...EGGS_PRODUCTS.map(p => ({ ...p, category_id: 'cat-5' })),
  ...READY_TO_EAT_NON_VEG_PRODUCTS.map(p => ({ ...p, category_id: 'cat-5' }))
];
