
'use server';

/**
 * @fileOverview AI flows for the Freshoz Buddy assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { products, orders } from '@/lib/data';
import type { CartItem } from '@/lib/types';

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

const getCartContents = ai.defineTool(
    {
      name: 'getCartContents',
      description: 'Retrieves the current items in the shopping cart.',
      inputSchema: z.void(),
      outputSchema: z.array(z.object({
          id: z.string(),
          name: z.string(),
          quantity: z.number(),
          price: z.number(),
      })),
    },
    async () => {
      // This is a placeholder. In the real implementation, the client will
      // pass the cart contents to the flow.
      return [];
    }
);


const ManageCartInput = z.object({
  query: z.string().describe('The user\'s request, e.g., "2kg टमाटर कार्ट में डालो" or "सेब हटाओ".'),
  cartItems: z.array(z.any()).describe("The current items in the user's cart."),
});
const ManageCartOutput = z.object({
  message: z.string().describe('A confirmation message about the action taken, or a clarifying question. This message MUST be in Hindi.'),
  actions: z.array(z.object({
      action: z.enum(['add', 'remove', 'update']),
      itemName: z.string(),
      quantity: z.number().optional(),
  })).optional().describe('A list of actions to perform on the cart.'),
});

export const manageCart = ai.defineFlow(
  {
    name: 'manageCart',
    inputSchema: ManageCartInput,
    outputSchema: ManageCartOutput,
  },
  async ({ query, cartItems }) => {
    const llmResponse = await ai.generate({
        prompt: `You are an intelligent shopping assistant for Freshoz. Your name is Freshoz. You MUST respond in Hindi.

User's command: "${query}"

Current Cart Contents:
${cartItems.length > 0 ? JSON.stringify(cartItems.map(item => ({name: item.name, quantity: item.quantity}))) : "The cart is empty."}

Full Product Catalog for reference (name, pack_size, price):
${JSON.stringify(products.map(p => ({name: p.name_en, pack_size: p.pack_size, price: p.price, variants: p.variants?.map(v => ({pack_size: v.pack_size, price: v.price})) })))}

Your tasks:
1.  **Interpret the user's command.** Understand if they want to add, remove, update quantities, or just check their cart. The user can use Hindi, English, or Hinglish.
2.  **Identify products and quantities.** Extract product names and amounts from the query. Match them against the product catalog. Be flexible with names (e.g., "tamatar" for "Tomato", "kela" for "Banana").
3.  **Check availability.** If a user wants to add an item, assume it's available from the catalog.
4.  **Formulate a response in HINDI.**
    *   If the command is clear and you find a matching product, respond with a confirmation message and the corresponding action JSON. Example Hindi message: "मुझे 'ताज़ा टमाटर' मिला। क्या मैं इसे आपके कार्ट में डाल दूँ?"
    *   If the command is ambiguous (e.g., "कुछ सेब डालो"), ask a clarifying question in Hindi. Example: "ज़रूर, आप कितने सेब कार्ट में डालना चाहेंगे?"
    *   If an item is not in the catalog, inform the user gracefully in Hindi. Example: "माफ़ कीजिए, मुझे 'चमकीले गाजर' हमारे स्टोर में नहीं मिले।"
    *   If the user asks to see their cart, list the items and their quantities in Hindi.
    *   **CRUCIAL**: Before performing an 'add' or 'update' action, ALWAYS ask for confirmation in Hindi. For example: "मुझे 'Amul Gold Milk 1L' ₹56 का मिला। क्या मैं इसे आपके कार्ट में डाल दूँ?"
`,
        output: { schema: ManageCartOutput },
        tools: [getCartContents],
    });
    return llmResponse.output!;
  }
);
