'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ✅ CORRECT PRODUCT IMPORTS - Use the same as SmartSearchBar
import { ALL_DAIRY_BAKERY_PRODUCTS } from '@/lib/products/dairy-bakery';
import { ALL_NON_VEG_PRODUCTS } from '@/lib/products/non-veg';
import { ALL_VEGETABLES_FRUITS_PRODUCTS } from '@/lib/products/vegetables-fruits';
import { ALL_SNACKS_BEVERAGES_PRODUCTS } from '@/lib/products/snacks-beverages';
import { ALL_STAPLES_GROCERY_PRODUCTS } from '@/lib/products/staples-grocery';

// Combine ALL products
const allProducts = [
  ...ALL_DAIRY_BAKERY_PRODUCTS,
  ...ALL_NON_VEG_PRODUCTS,
  ...ALL_VEGETABLES_FRUITS_PRODUCTS,
  ...ALL_SNACKS_BEVERAGES_PRODUCTS,
  ...ALL_STAPLES_GROCERY_PRODUCTS
];

const productList = allProducts.map(p => p.name_en);

const SearchSuggestionsInputSchema = z.object({
  searchQuery: z.string(),
  searchHistory: z.array(z.string()),
  productList: z.array(z.string()).optional(),
});

const SearchSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()),
});

// ✅ SIMPLE & RELIABLE NON-AI SOLUTION
export async function generateSearchSuggestions(input: SearchSuggestionsInput): Promise<SearchSuggestionsOutput> {
  try {
    const query = input.searchQuery.toLowerCase().trim();
    
    console.log(`[Search] Query: "${query}"`);

    // Hindi-English mapping for common grocery items
    const queryMap: {[key: string]: string} = {
      'tamatar': 'tomato', 'tamato': 'tomato', 'tamater': 'tomato',
      'aloo': 'potato', 'alu': 'potato',
      'pyaaz': 'onion', 'pyaz': 'onion',
      'doodh': 'milk',
      'double roti': 'bread', 'pav': 'bread',
      'chawal': 'rice',
      'dal': 'lentils', 'daal': 'lentils',
      'atta': 'flour', 'aata': 'flour',
      'cheeni': 'sugar', 'shakkar': 'sugar',
      'namak': 'salt',
      'palak': 'spinach',
      'gobhi': 'cauliflower',
      'baingan': 'brinjal', 'begun': 'brinjal',
      'kheera': 'cucumber', 'kakdi': 'cucumber',
      'adrak': 'ginger',
      'lahsun': 'garlic'
    };

    // Find English equivalent
    let searchTerm = query;
    for (const [hindi, english] of Object.entries(queryMap)) {
      if (query.includes(hindi)) {
        searchTerm = english;
        console.log(`[Search] Hindi detected: "${hindi}" → "${english}"`);
        break;
      }
    }

    // Get matching products
    const matchingProducts = productList.filter(product =>
      product.toLowerCase().includes(searchTerm)
    );

    console.log(`[Search] Found ${matchingProducts.length} products for "${searchTerm}"`);

    // If no direct matches, try broader search
    let suggestions = matchingProducts.slice(0, 5);
    
    if (suggestions.length === 0) {
      // Try partial matches
      suggestions = productList
        .filter(product => {
          const productLower = product.toLowerCase();
          return searchTerm.split(' ').some(word => 
            word.length > 2 && productLower.includes(word)
          );
        })
        .slice(0, 3);
    }

    // If still no matches, return the query itself
    if (suggestions.length === 0) {
      suggestions = [input.searchQuery];
    }

    console.log(`[Search] Final suggestions:`, suggestions);
    return { suggestions };
    
  } catch (error) {
    console.error('[SearchSuggestions Error]', error);
    
    // Simple fallback
    const fallback = productList
      .filter(p => p.toLowerCase().includes(input.searchQuery.toLowerCase()))
      .slice(0, 3);
    
    return { 
      suggestions: fallback.length > 0 ? fallback : [input.searchQuery]
    };
  }
}

// Define flow if needed elsewhere
export const smartSearchSuggestionsFlow = ai.defineFlow({
  name: 'smartSearchSuggestionsFlow',
  inputSchema: SearchSuggestionsInputSchema,
  outputSchema: SearchSuggestionsOutputSchema,
}, generateSearchSuggestions);

export type SearchSuggestionsInput = z.infer<typeof SearchSuggestionsInputSchema>;
export type SearchSuggestionsOutput = z.infer<typeof SearchSuggestionsOutputSchema>;