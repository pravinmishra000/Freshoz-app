
'use server';

import { createOrder, getOrdersForUser as getOrdersForUserFromDb, updateProductStock } from '@/services/firestoreService';
import type { Address, OrderItem, Order } from '@/lib/types';
import { revalidatePath } from 'next/cache';

interface PlaceOrderInput {
    userId: string;
    deliveryAddress: Address;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<{ orderId: string }> {
    try {
        const orderId = await createOrder({
            ...input,
            address: input.deliveryAddress, // Remapping for createOrder function
            status: 'placed',
        });
        
        // After order is created, decrement stock for each item
        // In a production app, this should be a single atomic transaction (e.g., using a Cloud Function)
        // to prevent race conditions or partial failures.
        for (const item of input.items) {
            try {
                await updateProductStock(item.productId, -item.quantity);
            } catch (stockError) {
                // Handle stock update error - maybe log it for admin review.
                // For now, we'll log it to the console. The order is already placed.
                console.error(`Failed to update stock for product ${item.productId}:`, stockError);
            }
        }

        // Revalidate the orders page to show the new order
        revalidatePath('/orders');

        return { orderId };
    } catch (error) {
        console.error('Error placing order:', error);
        // In a real app, you might want to throw a more specific error
        throw new Error('Could not place order.');
    }
}


export async function getOrdersForUser(userId: string): Promise<Order[]> {
    try {
        const orders = await getOrdersForUserFromDb(userId);
        return orders;
    } catch (error) {
        console.error('Error fetching orders for user:', error);
        // In a real app, you would have more robust error handling
        return [];
    }
}
