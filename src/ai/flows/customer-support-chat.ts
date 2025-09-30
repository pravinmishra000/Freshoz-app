
'use server';

/**
 * @fileOverview A customer support chatbot flow.
 *
 * - supportChat - A function that handles the customer support chat interaction.
 * - SupportChatInput - The input type for the supportChat function.
 * - SupportChatOutput - The return type for the supportChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { products, orders } from '@/lib/data'; // Using mock data for now
import type { OrderStatus } from '@/lib/types';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const SupportChatInputSchema = z.object({
  userId: z.string().describe('The ID of the user initiating the chat.'),
  history: z.array(MessageSchema).describe('The chat history.'),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.object({
  message: z.string().describe('The chatbot\'s response message.'),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

// This tool is a placeholder. In a real app, you would fetch this from a database.
const getOrderDetails = ai.defineTool(
  {
    name: 'getOrderDetails',
    description: 'Retrieves details for a specific order by its ID.',
    inputSchema: z.object({
      orderId: z.string().describe('The ID of the order to retrieve.'),
    }),
    outputSchema: z.object({
        id: z.string(),
        status: z.string(),
        totalAmount: z.number(),
        createdAt: z.string(),
        items: z.array(z.object({
            name: z.string(),
            quantity: z.number()
        }))
    }).optional(),
  },
  async ({ orderId }) => {
    // In a real app, this would query your Firestore database
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.id || !order.status || !order.totalAmount || !order.createdAt || !order.items) {
        return undefined;
    }

    return {
        id: order.id,
        status: order.status as OrderStatus,
        totalAmount: order.totalAmount,
        createdAt: (order.createdAt as Date).toISOString(),
        items: order.items.map(i => ({ name: i.name, quantity: i.quantity }))
    };
  }
);


const prompt = ai.definePrompt({
  name: 'customerSupportPrompt',
  input: { schema: SupportChatInputSchema },
  tools: [getOrderDetails],
  system: `You are a helpful and friendly customer support assistant for Freshoz, an online grocery delivery service. Your name is 'FreshoBot'.
  
  - Your goal is to assist users with their questions about orders, products, and deliveries.
  - Be conversational and empathetic.
  - The user may ask in Hindi, English, or Hinglish. Respond naturally in the same language.
  - Use the available tools to get information when needed, for example, to check the status of an order.
  - Do not make up information. If you don't know the answer, say so and suggest they contact a human support agent.
  - The current date is ${new Date().toLocaleDateString()}.
  - The user's ID is {{{userId}}}.
  - You have access to the full product catalog and the user's order history.
  
  Available products: ${JSON.stringify(products.map(p => ({id: p.id, name: p.name_en, price: p.price, category: p.category})))}
  `,
  prompt: `{{#each history}}{{#if (eq role 'user')}}User: {{content}}
{{else}}FreshoBot: {{content}}
{{/if}}{{/each}}
FreshoBot:`,
});

const customerSupportFlow = ai.defineFlow(
  {
    name: 'customerSupportFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const llmResponse = await prompt(input);
    return llmResponse.text;
  }
);


export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
    const response = await customerSupportFlow(input);
    return { message: response };
}
