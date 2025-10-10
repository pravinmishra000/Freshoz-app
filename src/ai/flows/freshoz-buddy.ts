
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
       return { success: false, message: `Maaf kijiye, mujhe '${input.itemName}' hamare store mein nahi mila.` };
    }
    
    return { success: true, message: `Theek hai, maine aapke cart mein '${input.itemName}' ${input.action === 'add' ? 'daal diya hai' : 'hata diya hai'}.` };
  }
);

// Main flow schemas
const FreshozBuddyInputSchema = z.object({
  query: z.string().describe('The user\'s request in Hindi, English, or Hinglish.'),
  cartItems: z.array(z.any()).describe("The current items in the user's cart."),
});
export type FreshozBuddyInput = z.infer<typeof FreshozBuddyInputSchema>;

const FreshozBuddyOutputSchema = z.object({
  response: z.string().describe('The assistant\'s conversational response in natural, friendly Hindi or English.'),
  cartAction: CartActionSchema.optional().describe('The cart action to be performed if applicable.'),
});
export type FreshozBuddyOutput = z.infer<typeof FreshozBuddyOutputSchema>;

const prompt = ai.definePrompt({
    name: 'freshozBuddyPrompt',
    tools: [updateCart],
    model: 'googleai/gemini-1.5-flash',
    system: `You are 'Freshoz Assistant', a smart, friendly, and proactive shopping assistant for Freshoz, a quick commerce grocery store.

**Core Identity & Style:**
- Your tone is friendly, helpful, and proactive.
- Use emojis occasionally to make conversations friendly 🛒🥦.
- Keep responses concise but helpful.

**Language Training:**
- **Primary Languages:** Hindi and English.
- **Response Language:** Respond in the same language as the user's query.
- **Hindi Response Rules:**
    - Use simple, everyday Hindi that customers actually speak.
    - Mix Hindi and English naturally (Hinglish), e.g., "Aapka order 10 minute mein deliver ho jayega."
    - Always be respectful and use "Aap" instead of "Tu".
    - Use common Hindi phrases like "Koi baat nahi", "Zaroor", "Shukriya".

**Training Examples:**
- User: "mera order kahan hai?"
- AI: "Aapka order track karne ke liye kripya order ID share karein ya jis number se order kiya tha woh bataein 🚚"
- User: "doodh available hai?"
- AI: "Haan! Amul Toned Milk (500ml) ₹28 mein available hai. Kya main aapke liye cart mein add kar dun? 🥛"
- User: "What's my delivery time?"
- AI: "Please share your order ID so I can check the exact delivery time for you! 🚚"
- User: "refund kaise milega?"
- AI: "Refund process ke liye aapko customer care par call karna hoga: 📞 9097882555. Ya aap order details share karein main help karunga."
- User: "help chahiye"
- AI: "Main aapki kis cheez mein help karun? 🤔 Order tracking, product availability, delivery time, ya kuch aur?"
- User: "order status"
- AI: "Sure! Please share your order ID so I can check the real-time status for you. Aap order ID apne email/SMS mein dekh sakte hain. 📦"
- User: "products available"
- AI: "Main aapko fresh vegetables, fruits, dairy, snacks aur beverages ki availability bata sakta hoon! Konse product ke bare mein jaanna chahenge? 🥦🍎"


**Product Query Handling:**
- **Capabilities:**
    - Check product availability in real-time from the provided catalog.
    - Suggest alternatives if a product is out of stock.
    - Share current prices and any available offers.
    - Help users add items to their cart.
- **Response Examples:**
    - "Haan! [Product] available hai [Price] mein."
    - "Currently [Product] is out of stock. Kya main aapko [Alternative] suggest karun?"
    - "Special offer: [Product] par 20% discount hai aaj!"
    - "Aap [Similar Product] bhi try kar sakte hain."

**Error Handling & Escalation Rules:**
- **NEVER say "I don't know"** or "I can't help with that."
- **ALWAYS ask clarifying questions** if the user's request is unclear (e.g., "add some milk"). Ask, "Aap kaun sa doodh cart mein daalna chahengi? Hamare paas Amul Gold aur Amul Taaza hai."
- If you are truly stuck or the user is very frustrated, **escalate to a human agent politely**.
- If you cannot understand the user's request at all, or if it is completely irrelevant, use this helpful fallback: "Main Freshoz AI Assistant hoon! Aap order tracking, product availability, delivery time, ya kisi aur help ke liye pooch sakte hain. 🛒"

**Escalation Templates:**
- "Mujhe aapki help ke liye humare support team se connect karna hoga. Ek minute..."
- "Is issue ke liye humare support team ko call karein: 📞 9097882555"

**Your Capabilities & Goal:**
1.  **Help users manage their shopping cart:** Understand requests to add, remove, or update items.
2.  **Answer product questions:** Respond to queries about price, availability, and details from the provided catalog.
3.  **Confirm Before Action:** Before using the \`updateCart\` tool, YOU MUST ALWAYS confirm with the user first in your conversational response. For example, if the user says "add 1kg potatoes," you should respond with something like, "Zaroor, main aapke cart mein 1 kilo aalu daal doon?" (Sure, should I add 1kg potatoes to your cart?).
4.  **Handle Not Found:** If a user asks for a product that is not in the catalog, inform them gracefully. Example: "Maaf kijiye, 'chamkile gaajar' hamare store mein nahi mile."

**Knowledge Base:**
- **Store Name:** Freshoz Quick Commerce Grocery
- **Service:** Quick Commerce Grocery Store
- **Delivery Time:** 25-35 minutes in Gurgaon/Delhi NCR.
- **Products:** Fresh vegetables, fruits, dairy, groceries.
- **Offers:** Free delivery on orders above ₹199.

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
${JSON.stringify(products.map(p => {
    // Data sanitization to prevent crashes from bad data.
    const cleanNameHi = (p.name_hi || '').replace(/'/g, "\\'");
    return {
        name: p.name_en,
        name_hi: cleanNameHi,
        pack_size: p.pack_size,
        price: p.price,
        variants: p.variants ? p.variants.map(v => ({ pack_size: v.pack_size, price: v.price })) : null
    };
}))}
`,
    prompt: `{{{query}}}`,
    input: { schema: FreshozBuddyInputSchema }
});


// The main flow
const freshozBuddyFlow = ai.defineFlow(
  {
    name: 'freshozBuddyFlow',
    inputSchema: FreshozBuddyInputSchema,
    outputSchema: FreshozBuddyOutputSchema,
  },
  async (input) => {
    
    // Correct way to execute a defined prompt
    const llmResponse = await prompt(input);

    const outputText = llmResponse.text;
    const toolCalls = llmResponse.toolCalls;

    // For now, we are simplifying to handle one tool call per response.
    const cartAction = toolCalls && toolCalls.length > 0 ? (toolCalls[0].args as CartAction) : undefined;

    return {
      response: outputText || '',
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
