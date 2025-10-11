'use server';

import { z } from 'zod';

const SupportChatInputSchema = z.object({
  userId: z.string(),
  message: z.string(),
});

const SupportChatOutputSchema = z.object({
  message: z.string(),
  success: z.boolean(),
});

export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
  const userMessage = input.message.toLowerCase().trim();
  const isHindi = /[\u0900-\u097F]/.test(input.message) || 
                 input.message.includes('hai') || input.message.includes('kaise') ||
                 input.message.includes('kahan') || input.message.includes('mera');

  let response = "";
  
  if (userMessage.includes('order') || userMessage.includes('आर्डर') || userMessage.includes('ऑर्डर') || userMessage.includes('kahan')) {
    response = isHindi ? 
      "Aapka order track karne ke liye order ID share karein! 🚚 Main aapko real-time status bata dunga." :
      "Please share your order ID to track your delivery! 🚚 I'll show you real-time status.";
  }
  else if (userMessage.includes('doodh') || userMessage.includes('दूध') || userMessage.includes('milk')) {
    response = isHindi ?
      "Haan! 🥛 Amul Toned Milk (500ml) available hai ₹28 mein. Kya main aapke cart mein add karun?" :
      "Yes! 🥛 Amul Toned Milk (500ml) is available for ₹28. Should I add it to your cart?";
  }
  else if (userMessage.includes('delivery') || userMessage.includes('time') || userMessage.includes('समय')) {
    response = isHindi ?
      "Hamari delivery 25-35 minute mein hoti hai! ⚡ Fastest in Gurgaon/Delhi NCR." :
      "Our delivery takes 25-35 minutes! ⚡ Fastest in Gurgaon/Delhi NCR.";
  }
  else {
    response = isHindi ?
      "Main Freshoz AI Assistant hoon! 🤖 Aap order tracking, product availability, delivery time ke bare mein pooch sakte hain. 🛒" :
      "I'm Freshoz AI Assistant! 🤖 You can ask about order tracking, product availability, or delivery time. 🛒";
  }

  return { message: response, success: true };
}
