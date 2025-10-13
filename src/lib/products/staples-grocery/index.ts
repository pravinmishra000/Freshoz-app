// Export all staples-grocery products
export * from './flour';
export * from './pulses';
export * from './rice';
export * from './spices';
export * from './grains';

// You can also export combined arrays if needed
import { FLOUR_PRODUCTS } from './flour';
import { PULSES_PRODUCTS } from './pulses';
import { RICE_PRODUCTS } from './rice';
import { SPICES_PRODUCTS } from './spices';
import { GRAINS_PRODUCTS } from './grains';
import { READY_TO_EAT_PRODUCTS } from './ready-to-eat';


export const ALL_STAPLES_GROCERY_PRODUCTS = [
  ...PULSES_PRODUCTS.map(p => ({ ...p, category_id: 'cat-4' })),
  ...RICE_PRODUCTS.map(p => ({ ...p, category_id: 'cat-4' })),
  ...FLOUR_PRODUCTS.map(p => ({ ...p, category_id: 'cat-4' })),
  ...SPICES_PRODUCTS.map(p => ({ ...p, category_id: 'cat-4' })),
  ...GRAINS_PRODUCTS.map(p => ({ ...p, category_id: 'cat-4' })),
  ...READY_TO_EAT_PRODUCTS.map(p => ({ ...p, category_id: 'cat-4' }))
];
