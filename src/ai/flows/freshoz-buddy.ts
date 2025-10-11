// src/ai/flows/freshoz-buddy.ts - Mock version
'use server';

import { z } from 'zod';

const FreshozBuddyInputSchema = z.object({
  query: z.string(),
  cartItems: z.array(z.any()),
});

export type FreshozBuddyInput = z.infer<typeof FreshozBuddyInputSchema>;

const FreshozBuddyOutputSchema = z.object({
  response: z.string(),
  success: z.boolean(),
});

export type FreshozBuddyOutput = z.infer<typeof FreshozBuddyOutputSchema>;

export async function getAiResponse(input: FreshozBuddyInput): Promise<FreshozBuddyOutput> {
  const userMessage = input.query.toLowerCase().trim();
  const isHindi = /[\u0900-\u097F]/.test(input.query) || 
                 input.query.includes('hai') || input.query.includes('kaise');

  let response = "";
  
  if (userMessage.includes('add') || userMessage.includes('डाल') || userMessage.includes('जोड़')) {
    response = isHindi ?
      "Aapka product cart mein add ho gaya hai! 🛒 Kya aap kuch aur add karna chahenge?" :
      "Your product has been added to cart! 🛒 Would you like to add anything else?";
  }
  else if (userMessage.includes('price') || userMessage.includes('कीमत') || userMessage.includes('भाव')) {
    response = isHindi ?
      "Main kisi bhi product ki price bata sakta hoon! 🏷️ Aap konse product ki price jaanna chahte hain?" :
      "I can tell you the price of any product! 🏷️ Which product's price would you like to know?";
  }
  else if (userMessage.includes('order') || userMessage.includes('आर्डर')) {
    response = isHindi ?
      "Order tracking ke liye aapko login karna hoga. 📱 Kya aap login kar sakte hain?" :
      "Please login for order tracking. 📱 Can you login?";
  }
  else {
    response = isHindi ?
      "Main Freshoz Shopping Assistant hoon! 🤖 Aap products add karne, prices check karne, ya order tracking ke bare mein pooch sakte hain. 🛒" :
      "I'm Freshoz Shopping Assistant! 🤖 You can ask about adding products, checking prices, or order tracking. 🛒";
  }

  return {
    response: response,
    success: true
  };
}
