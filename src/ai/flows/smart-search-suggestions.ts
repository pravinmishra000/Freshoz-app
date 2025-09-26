'use server';

/**
 * @fileOverview A flow for generating smart search suggestions based on user input.
 *
 * - generateSearchSuggestions - A function that generates search suggestions.
 * - SearchSuggestionsInput - The input type for the generateSearchSuggestions function.
 * - SearchSuggestionsOutput - The return type for the generateSearchSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const prompt = ai.definePrompt({
  name: 'smartSearchSuggestionsPrompt',
  input: {schema: SearchSuggestionsInputSchema},
  output: {schema: SearchSuggestionsOutputSchema},
  prompt: `You are an AI assistant that provides smart search suggestions based on the user\'s current query and search history.

Current search query: {{{searchQuery}}}
Recent search history: {{#if searchHistory}}{{#each searchHistory}}- {{{this}}}
{{/each}}{{else}}No search history available.{{/if}}

Based on this information, provide a list of suggested search queries that the user might be interested in. Ensure the suggestions are relevant to the current query and take into account the user's past searches.
`, 
});

const smartSearchSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartSearchSuggestionsFlow',
    inputSchema: SearchSuggestionsInputSchema,
    outputSchema: SearchSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
