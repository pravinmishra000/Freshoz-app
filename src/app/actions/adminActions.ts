
'use server';

import { 
    getAllOrders as getAllOrdersFromDb, 
    updateOrderStatus as updateOrderStatusInDb, 
    getAnalyticsSummary as getAnalyticsFromDb, 
    getUser,
    getAllProducts as getAllProductsFromDb,
    createProduct,
    updateProduct as updateProductInDb,
    deleteProduct as deleteProductInDb
} from '@/services/firestoreService';
import type { Order, OrderStatus, Product, ProductInput } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/firebase/client';
import { sendPushNotification } from '@/services/notificationService';
import { onAuthStateChanged } from 'firebase/auth';


async function verifyAdmin() {
    const user = await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });

    if (!user) throw new Error('Authentication required.');
    const appUser = await getUser((user as any).uid);
    if (appUser?.role !== 'admin') throw new Error('Unauthorized: Admin access required.');
}


export async function getAllOrders(): Promise<Order[]> {
    try {
        await verifyAdmin();
        const orders = await getAllOrdersFromDb();
        return orders;
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return [];
    }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success: boolean, message?: string }> {
    try {
        await verifyAdmin();
        const order = await updateOrderStatusInDb(orderId, status);
        
        // After updating, send a notification
        if (order && order.userId) {
            const user = await getUser(order.userId);
            if (user?.fcmToken) {
                await sendPushNotification(user.fcmToken, {
                    notification: {
                        title: 'Order Status Updated',
                        body: `Your order #${order.id} is now ${status}.`
                    }
                });
            } else {
                console.log(`User ${order.userId} does not have an FCM token. Skipping notification.`);
            }
        }

        revalidatePath('/admin/orders');
        revalidatePath('/orders');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating order status:', error);
        return { success: false, message: error.message || 'Could not update order status.' };
    }
}

export async function getAnalyticsSummary() {
    try {
        await verifyAdmin();
        return await getAnalyticsFromDb();
    } catch (error) {
        console.error('Error fetching analytics summary:', error);
        // Return empty/zeroed data on error to prevent client-side crashes
        return {
            totalRevenue: 0,
            totalOrders: 0,
            totalUsers: 0,
            revenueByDay: [],
            ordersByDay: [],
        };
    }
}

export async function getProducts(): Promise<Product[]> {
    try {
        await verifyAdmin();
        const products = await getAllProductsFromDb();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function addProduct(product: ProductInput): Promise<{ success: boolean; message?: string; productId?: string }> {
    try {
        await verifyAdmin();
        const productId = await createProduct(product);
        revalidatePath('/admin/products');
        return { success: true, productId };
    } catch (error: any) {
        return { success: false, message: error.message || 'Could not add product.' };
    }
}

export async function updateProduct(productId: string, product: Partial<ProductInput>): Promise<{ success: boolean; message?: string }> {
    try {
        await verifyAdmin();
        await updateProductInDb(productId, product);
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || 'Could not update product.' };
    }
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; message?: string }> {
    try {
        await verifyAdmin();
        await deleteProductInDb(productId);
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || 'Could not delete product.' };
    }
}
