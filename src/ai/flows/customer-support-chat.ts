
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
  userId: z.string(),
  message: z.string().optional(), // New format
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional() // Old format
});

const SupportChatOutputSchema = z.object({
  message: z.string(),
  success: z.boolean(),
});

export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;
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
  name: 'simpleCustomerSupport',
  model: 'googleai/gemini-1.5-flash',
  system: `You are "Freshoz Assistant" - a friendly customer support agent for Freshoz Quick Commerce Grocery Store.

**ABOUT FRESHOZ:**
- Quick grocery delivery in 25-35 minutes
- Fresh vegetables, fruits, dairy, snacks
- Free delivery above ₹199
- Service area: Gurgaon, Delhi NCR

**RESPONSE RULES:**
1. Respond in same language as user (Hindi/English)
2. Be helpful and friendly
3. Use simple words and emojis
4. If order tracking, ask for order ID
5. If product query, check availability
6. NEVER say "I don't know" or show errors

**USER AUTHENTICATION:**
- If user is logged in, you can access their order history and provide personalized support
- If user is not logged in, encourage them to login for order tracking and personalized help

**EXAMPLES:**
User (Logged in): "mera order kahan hai?"
AI: "Aapka order track karne ke liye order ID share karein! 🚚 Main aapke recent orders bhi check kar sakta hoon."

User (Not logged in): "mera order kahan hai?"
AI: "Order tracking ke liye aapko login karna hoga. Kya aap login kar sakte hain? Ya phir order ID share karein main general status bata dun."

User: "doodh available hai?"
AI: "Haan! Amul Toned Milk available hai ₹28 mein 🥛"

User: "help chahiye"
AI: "Main yahan hoon help ke liye! 🤗 Bataiye aapko kismein help chahiye?"

ALWAYS RESPOND - NEVER STAY SILENT`,
});

const customerSupportFlow = ai.defineFlow(
  {
    name: 'customerSupportFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async (input) => {
    try {
      // Extract the message from either format
      let userMessage = input.message;
      
      // If using old format (history), get the last user message
      if (!userMessage && input.history && input.history.length > 0) {
        const lastUserMessage = input.history
          .filter(msg => msg.role === 'user')
          .pop();
        userMessage = lastUserMessage?.content || input.message;
      }
      
      // If still no message, use default
      if (!userMessage) {
        return {
          message: "Hello! I'm Freshoz Assistant. How can I help you today? 🛒",
          success: true
        };
      }

      // Add user context to the message
      const userContext = input.userId !== 'test-user' && input.userId !== 'guest' ? 
        "User is LOGGED IN - you can access their order history and provide personalized support." :
        "User is NOT LOGGED IN - encourage login for order tracking and personalized help.";

      const enhancedMessage = `${userMessage}\n\n[User Context: ${userContext}]`;

      const response = await prompt({
        messages: [{
          role: 'user',
          content: enhancedMessage
        }]
      });
      
      return {
        message: response.text || "Main Freshoz AI Assistant hoon! Aap order tracking, product availability, ya delivery time ke bare mein pooch sakte hain. 🛒",
        success: true
      };
      
    } catch (error) {
      console.error('Genkit error:', error);
      
      // Fallback responses based on language
      const isHindi = /[\u0900-\u097F]/.test(input.message || '') || 
                     (input.message || '').includes('hai') || 
                     (input.message || '').includes('kaise');
      
      return {
        message: isHindi ? 
          "Namaste! Main Freshoz AI Assistant hoon. Aap order tracking, product availability, ya delivery time ke bare mein pooch sakte hain. 🛒" 
          : "Hello! I'm Freshoz AI Assistant. You can ask me about order tracking, product availability, or delivery time. 🛒",
        success: false
      };
    }
  }
);

// Export with backward compatibility
export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
  return await customerSupportFlow(input);
}