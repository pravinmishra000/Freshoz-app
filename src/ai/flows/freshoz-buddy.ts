'use server';

/**
 * @fileOverview AI flows for the Freshoz Buddy assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { products, orders } from '@/lib/data';

// Flow 1: Get Cheaper Alternatives
const CheaperAlternativesInput = z.object({
  productName: z.string().describe('The name of the product to find alternatives for.'),
});
const CheaperAlternativesOutput = z.object({
  reasoning: z.string().describe('A short explanation of the suggestions.'),
  alternatives: z.array(z.string()).describe('A list of cheaper alternative product names.'),
});

export const getCheaperAlternatives = ai.defineFlow(
  {
    name: 'getCheaperAlternatives',
    inputSchema: CheaperAlternativesInput,
    outputSchema: CheaperAlternativesOutput,
  },
  async ({ productName }) => {
    const llmResponse = await ai.generate({
      prompt: `A user is looking for cheaper alternatives to "${productName}". Analyze the product list and suggest 1-3 cheaper alternatives from the same category. Explain your reasoning.

Product List: ${JSON.stringify(products.map(p => ({ name: p.name_en, price: p.price, category: p.category })))}`,
      output: {
        schema: CheaperAlternativesOutput,
      },
    });
    return llmResponse.output!;
  }
);


// Flow 2: Track Order Status
const TrackOrderStatusInput = z.object({
  orderId: z.string().describe('The ID of the order to track.'),
  userId: z.string().describe('The ID of the user who owns the order.'),
});
const TrackOrderStatusOutput = z.object({
  orderStatus: z.string().describe('The current status of the order.'),
  deliveryETA: z.string().optional().describe('The estimated delivery time if available.'),
});

export const trackOrderStatus = ai.defineFlow(
  {
    name: 'trackOrderStatus',
    inputSchema: TrackOrderStatusInput,
    outputSchema: TrackOrderStatusOutput,
  },
  async ({ orderId, userId }) => {
    // In a real app, this would query a database (e.g., Firestore)
    const order = orders.find(o => o.id === orderId && o.userId === userId);

    if (!order) {
      return { orderStatus: `Sorry, I couldn't find an order with the ID ${orderId}. Please double-check the ID.` };
    }
    
    let eta = 'Not available';
    if (order.status === 'out for delivery') {
        eta = 'Within 30 minutes';
    } else if (order.status === 'preparing') {
        eta = 'Approximately 1 hour';
    }

    return {
      orderStatus: `Your order #${orderId} is currently '${order.status}'.`,
      deliveryETA: eta,
    };
  }
);


// Flow 3: Check Product Availability
const ProductAvailabilityInput = z.object({
  productName: z.string().describe('The name of the product to check availability for.'),
});
const ProductAvailabilityOutput = z.object({
  isAvailable: z.boolean().describe('Whether the product is available.'),
  availabilityMessage: z.string().describe('A message to the user about the availability.'),
});

export const checkProductAvailability = ai.defineFlow(
  {
    name: 'checkProductAvailability',
    inputSchema: ProductAvailabilityInput,
    outputSchema: ProductAvailabilityOutput,
  },
  async ({ productName }) => {
    const product = products.find(p => p.name_en.toLowerCase() === productName.toLowerCase());
    if (product && product.stock_qty > 0) {
      return {
        isAvailable: true,
        availabilityMessage: `Yes, "${product.name_en}" is available with a stock of ${product.stock_qty} items.`,
      };
    }
    return {
      isAvailable: false,
      availabilityMessage: `Sorry, "${productName}" is currently out of stock. I can notify you when it's back.`,
    };
  }
);


// Flow 4: Manage Cart
const ManageCartInput = z.object({
  query: z.string().describe('The user\'s request, e.g., "add 2kg tomatoes" or "remove apples".'),
});
const ManageCartOutput = z.object({
  message: z.string().describe('A confirmation message about the action taken.'),
});

export const manageCart = ai.defineFlow(
  {
    name: 'manageCart',
    inputSchema: ManageCartInput,
    outputSchema: ManageCartOutput,
  },
  async ({ query }) => {
    // This is a mock. In a real app, this flow would need to interact with the
    // client-side cart state, which is complex. This flow demonstrates the AI's
    // understanding of the intent. The actual cart modification would be
    // handled by client-side code after getting the structured output from the AI.
    const llmResponse = await ai.generate({
        prompt: `The user wants to manage their cart. Their query is: "${query}". Interpret the query and respond with a confirmation of the action.`,
        output: { schema: ManageCartOutput }
    });
    return llmResponse.output!;
  }
);
