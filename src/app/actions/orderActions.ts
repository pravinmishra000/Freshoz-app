'use server';

import { createOrder } from '@/services/firestoreService';
import type { Address, OrderItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

interface PlaceOrderInput {
    userId: string;
    address: Address;
    items: OrderItem[];
    total: number;
}

export async function placeOrder(input: PlaceOrderInput): Promise<{ orderId: string }> {
    try {
        const orderId = await createOrder({
            ...input,
            status: 'placed',
        });
        
        // Revalidate the orders page to show the new order
        revalidatePath('/orders');

        return { orderId };
    } catch (error) {
        console.error('Error placing order:', error);
        // In a real app, you might want to throw a more specific error
        throw new Error('Could not place order.');
    }
}
