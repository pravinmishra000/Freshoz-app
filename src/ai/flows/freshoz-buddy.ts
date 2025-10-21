'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FreshozBuddyInputSchema = z.object({
  query: z.string().describe('The user\'s shopping query or command.'),
  cartItems: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
      })
    )
    .describe('A list of items currently in the user\'s shopping cart.'),
});

export type FreshozBuddyInput = z.infer<typeof FreshozBuddyInputSchema>;

const FreshozBuddyOutputSchema = z.object({
  response: z
    .string()
    .describe(
      'A helpful, conversational response in the same language as the query (English or Hindi).'
    ),
  success: z.boolean().describe('Indicates if the operation was successful.'),
});

export type FreshozBuddyOutput = z.infer<typeof FreshozBuddyOutputSchema>;

export async function getAiResponse(
  input: FreshozBuddyInput
): Promise<FreshozBuddyOutput> {
  const result = await freshozBuddyFlow(input);
  return {
    response: result.response,
    success: true,
  };
}

const freshozBuddyPrompt = ai.definePrompt({
  name: 'freshozBuddyPrompt',
  input: {schema: FreshozBuddyInputSchema},
  output: {schema: FreshozBuddyOutputSchema},
  prompt: `You are Freshoz Buddy, a friendly and helpful AI shopping assistant for Freshoz, a grocery delivery app. Your goal is to assist users with their shopping queries in a conversational and efficient manner. You can handle requests in both English and Hindi.

Your capabilities include:
1.  **Answering Product Questions:** Provide information about products available in the store.
2.  **Checking Prices:** Tell users the price of specific items.
3.  **Adding Items to Cart:** When a user asks to add an item, confirm the action.
4.  **Handling General Queries:** Answer questions about delivery, offers, etc.

Current Cart:
{{#if cartItems}}
  {{#each cartItems}}
- {{this.name}} (Quantity: {{this.quantity}})
  {{/each}}
{{else}}
  The cart is empty.
{{/if}}

User Query: "{{query}}"

Based on the query and the current cart, provide a helpful and concise response. If the user's query is in Hindi, respond in Hindi.`,
});

const freshozBuddyFlow = ai.defineFlow(
  {
    name: 'freshozBuddyFlow',
    inputSchema: FreshozBuddyInputSchema,
    outputSchema: FreshozBuddyOutputSchema,
  },
  async input => {
    const response = await freshozBuddyPrompt(input);
    return response.output!;
  }
);