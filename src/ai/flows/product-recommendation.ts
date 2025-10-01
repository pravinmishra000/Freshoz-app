// Product Recommendation Flow
'use server';

/**
 * @fileOverview Product recommendation AI agent.
 *
 * - getProductRecommendations - A function that suggests related products based on search history and viewed items.
 * - ProductRecommendationInput - The input type for the getProductRecommendations function.
 * - ProductRecommendationOutput - The return type for the getProductRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductRecommendationInputSchema = z.object({
  searchHistory: z
    .array(z.string())
    .describe('The user search history as an array of search queries.'),
  viewedItems: z
    .array(z.string())
    .describe('The user viewed items as an array of product IDs.'),
});

export type ProductRecommendationInput = z.infer<
  typeof ProductRecommendationInputSchema
>;

const ProductRecommendationOutputSchema = z.object({
  recommendedProducts: z
    .array(z.string())
    .describe('An array of recommended product IDs.'),
});

export type ProductRecommendationOutput = z.infer<
  typeof ProductRecommendationOutputSchema
>;

export async function getProductRecommendations(
  input: ProductRecommendationInput
): Promise<ProductRecommendationOutput> {
  return productRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommendationPrompt',
  input: {schema: ProductRecommendationInputSchema},
  output: {schema: ProductRecommendationOutputSchema},
  prompt: `You are an expert product recommendation agent.

  Based on the user's search history and viewed items, recommend other products that the user might be interested in.

  Search History: {{{searchHistory}}}
  Viewed Items: {{{viewedItems}}}

  Recommended Products:`,
});

const productRecommendationFlow = ai.defineFlow(
  {
    name: 'productRecommendationFlow',
    inputSchema: ProductRecommendationInputSchema,
    outputSchema: ProductRecommendationOutputSchema,
  },
  async input => {
    const response = await prompt(input);
    return response.output!;
  }
);
