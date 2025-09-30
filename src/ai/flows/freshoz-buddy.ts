
'use server';

/**
 * @fileOverview AI flows for the Freshoz Buddy assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { products } from '@/lib/data';

// Zod schemas for the tool
const CartActionSchema = z.object({
  action: z.enum(['add', 'remove', 'update', 'clear']),
  itemName: z.string().describe('The name of the item, e.g., "Tomato" or "Amul Gold Milk".'),
  quantity: z.string().describe('The quantity, including units, e.g., "1 kg" or "2 packets".').optional(),
});
export type CartAction = z.infer<typeof CartActionSchema>;

const updateCart = ai.defineTool(
  {
    name: 'updateCart',
    description: 'Use this tool to add, remove, or update items in the shopping cart. You must confirm with the user before using this tool.',
    inputSchema: CartActionSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string().describe("A message confirming the action taken, in Hindi."),
    }),
  },
  async (input) => {
    // In a real application, this would interact with the cart state.
    // For now, we simulate success.
    console.log('Updating cart with action:', input);
    const product = products.find(p => p.name_en.toLowerCase() === input.itemName.toLowerCase());
    
    if (input.action === 'add' && !product) {
       return { success: false, message: `माफ़ कीजिए, मुझे '${input.itemName}' हमारे स्टोर में नहीं मिला।` };
    }
    
    return { success: true, message: `ठीक है, मैंने आपके कार्ट में '${input.itemName}' ${input.action === 'add' ? 'डाल दिया है' : 'हटा दिया है'}।` };
  }
);

// Main flow schemas
const FreshozBuddyInputSchema = z.object({
  query: z.string().describe('The user\'s request in Hindi, English, or Hinglish.'),
  cartItems: z.array(z.any()).describe("The current items in the user's cart."),
});
export type FreshozBuddyInput = z.infer<typeof FreshozBuddyInputSchema>;

const FreshozBuddyOutputSchema = z.object({
  response: z.string().describe('The assistant\'s conversational response in natural, friendly Hindi.'),
  cartAction: CartActionSchema.optional().describe('The cart action to be performed if applicable.'),
});
export type FreshozBuddyOutput = z.infer<typeof FreshozBuddyOutputSchema>;


// The main flow
const freshozBuddyFlow = ai.defineFlow(
  {
    name: 'freshozBuddyFlow',
    inputSchema: FreshozBuddyInputSchema,
    outputSchema: FreshozBuddyOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: input.query,
      model: 'googleai/gemini-1.5-flash',
      tools: [updateCart],
      config: {
          system: `You are a smart, friendly, and helpful female shopping assistant for an online grocery store called Freshoz. Your name is Freshoz.

Your primary goal is to help users manage their shopping cart and answer their questions about products in a natural, conversational way. You MUST respond in conversational Hindi.

**Your Capabilities:**
1.  **Add, Remove, Update Items:** Understand user requests to modify their cart. For example, "add 2kg tomatoes," "remove apples," "change milk to 2 packets."
2.  **Answer Questions:** Respond to queries about product price, availability, and details based on the provided catalog.
3.  **Confirmation First:** Before using the \`updateCart\` tool to make any change, YOU MUST ALWAYS confirm with the user first in your conversational response. For example, if the user says "add 1kg potatoes," you should respond with something like, "ज़रूर, मैं आपके कार्ट में 1 किलो आलू डाल दूँ?" (Sure, should I add 1kg potatoes to your cart?).
4.  **Handle Ambiguity:** If a request is unclear (e.g., "add some milk"), ask a clarifying question like, "आप कौन सा दूध कार्ट में डालना चाहेंगी? हमारे पास Amul Gold और Amul Taaza है।" (Which milk would you like to add? We have Amul Gold and Amul Taaza).
5.  **Product Not Found:** If a user asks for a product that is not in the catalog, inform them gracefully. Example: "माफ़ कीजिए, 'चमकीले गाजर' हमारे स्टोर में नहीं मिले।" (Sorry, 'shiny carrots' were not found in our store).

**Current Shopping Cart:**
{{#if cartItems.length}}
{{#each cartItems}}
- {{this.name}} (Quantity: {{this.quantity}})
{{/each}}
{{else}}
The cart is empty.
{{/if}}

**Product Catalog for Reference:**
(The full catalog is provided to you. Use it to find item names, prices, and variants.)
${JSON.stringify(products.map(p => ({name: p.name_en, name_hi: p.name_hi, pack_size: p.pack_size, price: p.price, variants: p.variants?.map(v => ({pack_size: v.pack_size, price: v.price})) })))}
`
      },
      context: {
        cartItems: input.cartItems,
      },
    });


    const outputText = llmResponse.text;
    const toolCalls = llmResponse.toolCalls;

    // For now, we are simplifying to handle one tool call per response.
    const cartAction = toolCalls && toolCalls.length > 0 ? (toolCalls[0].args as CartAction) : undefined;

    return {
      response: outputText,
      cartAction: cartAction,
    };
  }
);


export async function getAiResponse(input: FreshozBuddyInput): Promise<FreshozBuddyOutput> {
  const result = await freshozBuddyFlow(input);

  // If the AI decided to use the cart tool, execute it.
  if (result.cartAction) {
    const toolResult = await updateCart(result.cartAction);
    // You could potentially use this toolResult to further modify the response.
    console.log("Tool Result:", toolResult);
  }

  return result;
}
