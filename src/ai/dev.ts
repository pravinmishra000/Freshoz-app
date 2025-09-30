'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/smart-search-suggestions.ts';
import '@/ai/flows/product-recommendation.ts';
import '@/ai/flows/customer-support-chat.ts';
import '@/ai/flows/freshoz-buddy.ts';
