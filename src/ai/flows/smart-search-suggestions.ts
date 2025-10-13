'use server';

/**
 * @fileOverview A flow for generating smart search suggestions based on user input.
 *
 * - generateSearchSuggestions - A function that generates search suggestions.
 * - SearchSuggestionsInput - The input type for the generateSearchSuggestions function.
 * - SearchSuggestionsOutput - The return type for the generateSearchSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { products as allProducts } from '@/lib/data';

const SearchSuggestionsInputSchema = z.object({
  searchQuery: z.string().describe('The current search query entered by the user.'),
  searchHistory: z.array(z.string()).describe('The user\'s recent search history.'),
});
export type SearchSuggestionsInput = z.infer<typeof SearchSuggestionsInputSchema>;

const SearchSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested search queries.'),
});
export type SearchSuggestionsOutput = z.infer<typeof SearchSuggestionsOutputSchema>;

export async function generateSearchSuggestions(input: SearchSuggestionsInput): Promise<SearchSuggestionsOutput> {
  return smartSearchSuggestionsFlow(input);
}

const productList = allProducts.map(p => p.name_en);

const prompt = ai.definePrompt({
  name: 'smartSearchSuggestionsPrompt',
  input: {schema: SearchSuggestionsInputSchema},
  output: {schema: SearchSuggestionsOutputSchema},
  prompt: `You are an AI assistant for an online grocery store called Freshoz. Your task is to provide smart, relevant search suggestions.

Context:
- The user is searching for groceries.
- The suggestions should be highly relevant to an Indian grocery context.
- Use the provided product list as the primary source of truth for what is available.

User's current search query: {{{searchQuery}}}

User's recent search history:
{{#if searchHistory}}
{{#each searchHistory}}- {{{this}}}
{{/each}}
{{else}}No search history available.{{/if}}

Available Products:
{{#each productList}}- {{{this}}}
{{/each}}

Based on all this information, provide a list of 3 to 5 highly relevant suggested search queries that the user might be interested in. The suggestions should be short and direct.
- Prioritize suggestions that are substrings or completions of the user's query and exist in the product list.
- Also suggest related items from the product list.
- If the query is a typo for a product in the list, suggest the correct spelling.
- Do not suggest products that are not in the provided product list.

Provide only the list of suggestions.
`, 
});

const smartSearchSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartSearchSuggestionsFlow',
    inputSchema: SearchSuggestionsInputSchema,
    outputSchema: SearchSuggestionsOutputSchema,
  },
  async input => {
    // To reduce the size of the prompt, let's filter the product list
    const filteredProductList = productList.filter(productName => 
      productName.toLowerCase().includes(input.searchQuery.toLowerCase())
    );
    
    // If the filtered list is too small, use a larger portion of the original list
    const productContext = filteredProductList.length > 5 ? filteredProductList : productList.slice(0, 100);

    const response = await prompt({
      ...input,
      productList: productContext
    });
    return response.output!;
  }
);
