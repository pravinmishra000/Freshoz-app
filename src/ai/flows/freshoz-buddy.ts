
'use server';

/**
 * @fileOverview AI flows for the Freshoz Buddy assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { products } from '@/lib/data';

// Main flow for handling cart management and other shopping queries
const ManageCartInput = z.object({
  query: z.string().describe('The user\'s request, e.g., "2kg टमाटर कार्ट में डालो" or "सेब हटाओ".'),
  cartItems: z.array(z.any()).describe("The current items in the user's cart."),
});

const ManageCartOutput = z.object({
  message: z.string().describe('A confirmation message about the action taken, or a clarifying question. This message MUST be in Hindi.'),
  actions: z.array(z.object({
      action: z.enum(['add', 'remove', 'update', 'info']),
      itemName: z.string(),
      quantity: z.number().optional(),
  })).optional().describe('A list of actions to perform on the cart or information to provide.'),
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
Your persona is a friendly female assistant.

User's command: "${query}"

Current Cart Contents:
${cartItems.length > 0 ? JSON.stringify(cartItems.map(item => ({name: item.name, quantity: item.quantity}))) : "The cart is empty."}

Full Product Catalog for reference (name, pack_size, price, variants):
${JSON.stringify(products.map(p => ({name: p.name_en, pack_size: p.pack_size, price: p.price, variants: p.variants?.map(v => ({pack_size: v.pack_size, price: v.price})) })))}

Your tasks:
1.  **Interpret the user's command.** Understand if they want to add, remove, update quantities, ask about price, availability, or just check their cart. The user can use Hindi, English, or Hinglish.
2.  **Identify products and quantities.** Extract product names and amounts from the query. Match them against the product catalog. Be flexible with names (e.g., "tamatar" for "Tomato", "kela" for "Banana"). Handle multiple items in one query.
3.  **Formulate a response in HINDI.**
    *   If the command is clear to **add an item**, and you find a matching product, your response message must ask for confirmation. The corresponding action in the JSON should be 'add'. Example Hindi message: "मुझे 'ताज़ा टमाटर' मिला। क्या मैं इसे आपके कार्ट में डाल दूँ?"
    *   If the command is ambiguous (e.g., "कुछ सेब डालो"), ask a clarifying question in Hindi. Do not return any action. Example: "ज़रूर, आप कितने सेब कार्ट में डालना चाहेंगी?"
    *   If an item is not in the catalog, inform the user gracefully in Hindi. Example: "माफ़ कीजिए, मुझे 'चमकीले गाजर' हमारे स्टोर में नहीं मिले।"
    *   If the user asks about price or availability, provide the information in the message.
    *   If the user asks to see their cart, list the items and their quantities in Hindi.
    *   **CRUCIAL**: Before performing an 'add' or 'update' action, ALWAYS ask for confirmation in your Hindi response. For example: "मुझे 'Amul Gold Milk 1L' ₹56 का मिला। क्या मैं इसे आपके कार्ट में डाल दूँ?"
`,
        output: { schema: ManageCartOutput },
    });
    return llmResponse.output!;
  }
);
