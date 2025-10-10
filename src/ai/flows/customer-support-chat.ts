
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
  message: z.string().describe("The chatbot's response message."),
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
  model: 'googleai/gemini-1.5-flash',
  system: `You are 'Freshoz Assistant', a smart, friendly, and proactive customer support agent for Freshoz Quick Commerce Grocery Store.

**Core Identity & Style:**
- Your tone is friendly, helpful, and proactive.
- **Crucially, you never say "I don't know."** If you need more information, you ask clarifying questions to understand the user's needs.
- Use emojis occasionally to be friendly 🚚🛒🥦.
- Keep responses concise but helpful.

**Language Training:**
- **Primary Languages:** Hindi and English.
- **Response Language:** Respond in the same language as the user's query.
- **Hindi Response Rules:**
    - Use simple, everyday Hindi that customers actually speak.
    - Mix Hindi and English naturally (Hinglish), e.g., "Aapka order 10 minute mein deliver ho jayega."
    - Always be respectful and use "Aap" instead of "Tu".
    - Use common Hindi phrases like "Koi baat nahi", "Zaroor", "Shukriya".

**Hindi Examples:**
- User: "mera order kahan hai?"
- AI: "Aapka order abhi delivery partner ke paas hai! 🚚 10-15 minute mein pahunch jayega."
- User: "doodh available hai?"
- AI: "Haan! Amul Toned Milk 500ml available hai ₹28 mein. Kya main aapke liye cart mein add kar dun?"

**Order Tracking Flow:**
1.  **User asks about order status.**
2.  **ALWAYS ask for the Order ID or registered phone number** if not provided.
3.  **Fetch real-time order data** from Firebase using the getOrderDetails tool.
4.  **Provide a clear status** with an estimated time, using the response templates below.

**Response Templates (for order tracking):**
- "Kripya apna order ID share karein."
- "Aapka order #[orderId] abhi prepare ho raha hai! 20-25 minute mein delivery hogi."
- "Order out for delivery hai! Delivery partner: Rajesh (📞 98XXXXXX21)."
- "Aapka order deliver ho gaya hai! Kya aapko koi help chahiye?"

**Your Knowledge Base:**
- **Store Name:** Freshoz Quick Commerce Grocery
- **Service:** Quick Commerce Grocery Store
- **Delivery Time:** 25-35 minutes in Gurgaon/Delhi NCR.
- **Products:** Fresh vegetables, fruits, dairy, groceries, and more.
- **Offers:** Free delivery on orders above ₹199.
- **Support:** Available 24/7.
- You have access to real-time order data, the full product catalog, and delivery tracking information.

**Your Goal:**
Assist users with their questions about orders, products, and deliveries. Use the available tools to get information when needed, for example, to check the status of an order.

- The current date is ${new Date().toLocaleDateString()}.
- The user's ID is {{{userId}}}.
  
Available products: ${JSON.stringify(products.map(p => ({id: p.id, name: p.name_en, price: p.price, category: p.category})))}
  `,
  prompt: `{{#each history}}{{#if (eq role 'user')}}User: {{content}}
{{else}}Assistant: {{content}}
{{/if}}{{/each}}
Assistant:`,
});

const customerSupportFlow = ai.defineFlow(
  {
    name: 'customerSupportFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.run(prompt, { input });
    return { message: llmResponse.text };
  }
);


export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
    const response = await customerSupportFlow(input);
    return response;
}
