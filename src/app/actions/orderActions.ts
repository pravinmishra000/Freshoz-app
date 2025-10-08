'use server';

import { createOrder, getOrdersForUser as getOrdersForUserFromDb, updateProductStock } from '@/services/firestoreService';
import type { Address, OrderItem, Order, OrderStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

interface PlaceOrderInput {
    userId: string;
    deliveryAddress: Address;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
    deliverySlot?: string;
    substitution?: string;
    deliveryTip?: number;
}

export async function placeOrder(input: PlaceOrderInput): Promise<{ 
    success: boolean; 
    orderId?: string; 
    error?: string;
}> {
    try {
        // Validate input data
        if (!input.userId || !input.deliveryAddress || !input.items || input.items.length === 0) {
            return { 
                success: false, 
                error: 'Invalid order data. Please check your information and try again.' 
            };
        }

        // Check if items are available (basic validation)
        const invalidItems = input.items.filter(item => 
            !item.productId || item.quantity <= 0 || item.price <= 0
        );
        
        if (invalidItems.length > 0) {
            return { 
                success: false, 
                error: 'Some items in your cart are invalid. Please refresh the page and try again.' 
            };
        }

        // Create order with proper OrderStatus type
        const orderData = {
            userId: input.userId,
            address: input.deliveryAddress,
            items: input.items,
            totalAmount: input.totalAmount,
            paymentMethod: input.paymentMethod,
            status: 'confirmed' as OrderStatus, // Type assertion here
            deliverySlot: input.deliverySlot || 'morning',
            substitution: input.substitution || 'best',
            deliveryTip: input.deliveryTip || 0,
            createdAt: new Date(),
            orderNumber: generateOrderNumber(),
        };

        const orderId = await createOrder(orderData);
        
        // Update stock for each item with better error handling
        const stockUpdateResults = await Promise.allSettled(
            input.items.map(item => 
                updateProductStock(item.productId, -item.quantity)
            )
        );

        // Check if any stock updates failed
        const failedUpdates = stockUpdateResults.filter(
            (result): result is PromiseRejectedResult => result.status === 'rejected'
        );

        if (failedUpdates.length > 0) {
            console.warn(`${failedUpdates.length} stock updates failed:`, failedUpdates);
            // We don't fail the order for stock update failures, but log them
        }

        // Revalidate the orders page to show the new order
        revalidatePath('/orders');
        revalidatePath('/orders/[orderId]', 'page');

        return { 
            success: true, 
            orderId 
        };

    } catch (error: any) {
        console.error('Error placing order:', error);
        
        // Specific error messages based on error type
        let errorMessage = 'Could not place order. Please try again.';
        
        if (error.message?.includes('permission-denied') || error.code === 'permission-denied') {
            errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.message?.includes('unavailable') || error.code === 'unavailable') {
            errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message?.includes('not-found')) {
            errorMessage = 'Product not found. Please update your cart.';
        } else if (error.message?.includes('insufficient-stock')) {
            errorMessage = 'Some items are out of stock. Please update your cart.';
        }

        return { 
            success: false, 
            error: errorMessage 
        };
    }
}

// Helper function to generate order number
function generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FRESH${timestamp.slice(-8)}${random}`;
}

export async function getOrdersForUser(userId: string): Promise<{ 
    success: boolean; 
    orders?: Order[]; 
    error?: string;
}> {
    try {
        if (!userId) {
            return { 
                success: false, 
                error: 'User ID is required.' 
            };
        }

        const orders = await getOrdersForUserFromDb(userId);
        return { 
            success: true, 
            orders 
        };
    } catch (error: any) {
        console.error('Error fetching orders for user:', error);
        
        let errorMessage = 'Could not fetch orders. Please try again.';
        
        if (error.message?.includes('permission-denied') || error.code === 'permission-denied') {
            errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.message?.includes('unavailable') || error.code === 'unavailable') {
            errorMessage = 'Network error. Please check your connection.';
        }

        return { 
            success: false, 
            error: errorMessage 
        };
    }
}