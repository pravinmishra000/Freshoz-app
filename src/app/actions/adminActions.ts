'use server';

import { getAllOrders as getAllOrdersFromDb, updateOrderStatus as updateOrderStatusInDb, getAnalyticsSummary as getAnalyticsFromDb } from '@/services/firestoreService';
import { Order, OrderStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/firebase/server';
import { getUser } from '@/services/firestoreService';


async function verifyAdmin() {
    const user = await auth.currentUser;
    if (!user) throw new Error('Authentication required.');
    const appUser = await getUser(user.uid);
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
        await updateOrderStatusInDb(orderId, status);
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
