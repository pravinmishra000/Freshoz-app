'use server';
/**
 * @fileOverview A flow to assign an order to the nearest available rider.
 *
 * - assignOrderToRider - A function that finds the nearest available rider and assigns them to an order.
 * - AssignOrderInput - The input type for the assignOrderToRider function.
 * - AssignOrderOutput - The return type for the assignOrderToRider function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getOrder, getAvailableRiders, updateOrder, getUser } from '@/services/firestoreService';
import { getCoordinatesForAddress } from '@/services/geocodingService';
import { haversineDistance } from '@/services/haversineService';
import { sendPushNotification } from '@/services/notificationService';
import { Rider } from '@/lib/types';


export const AssignOrderInputSchema = z.object({
  orderId: z.string().describe('The ID of the order to be assigned.'),
});
export type AssignOrderInput = z.infer<typeof AssignOrderInputSchema>;


export const AssignOrderOutputSchema = z.object({
  success: z.boolean(),
  orderId: z.string(),
  assignedRiderId: z.string().optional(),
  message: z.string(),
});
export type AssignOrderOutput = z.infer<typeof AssignOrderOutputSchema>;

export async function assignOrderToRider(
  input: AssignOrderInput
): Promise<AssignOrderOutput> {
  return assignOrderFlow(input);
}


const assignOrderFlow = ai.defineFlow(
  {
    name: 'assignOrderFlow',
    inputSchema: AssignOrderInputSchema,
    outputSchema: AssignOrderOutputSchema,
  },
  async ({ orderId }) => {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, orderId, message: 'Order not found.' };
    }
    if (order.assignedRiderId) {
        return { success: false, orderId, message: 'Order already assigned.' };
    }

    const orderCoordinates = await getCoordinatesForAddress(order.address);
    if (!orderCoordinates) {
        return { success: false, orderId, message: 'Could not geocode order address.' };
    }

    const availableRiders = await getAvailableRiders();
    if (availableRiders.length === 0) {
      // In a real app, you might queue this order for later assignment
      return { success: false, orderId, message: 'No riders are available right now.' };
    }

    let closestRider: Rider | null = null;
    let minDistance = Infinity;

    for (const rider of availableRiders) {
      if (rider.currentLocation) {
        const distance = haversineDistance(orderCoordinates, rider.currentLocation);
        if (distance < minDistance) {
          minDistance = distance;
          closestRider = rider;
        }
      }
    }

    if (closestRider) {
      await updateOrder(orderId, {
        assignedRiderId: closestRider.id,
        status: 'preparing', // Or 'assigned'
      });
      console.log(`Assigned order ${orderId} to rider ${closestRider.id} (${minDistance.toFixed(2)} km away).`);

      // Send push notification to the assigned rider
      const riderUserDoc = await getUser(closestRider.id);
      if(riderUserDoc && riderUserDoc.fcmToken) {
        await sendPushNotification(riderUserDoc.fcmToken, {
            notification: {
                title: 'New Order Assignment!',
                body: `You have a new order pickup: #${orderId}.`,
            },
            data: {
                orderId,
            }
        });
      }

      return {
        success: true,
        orderId,
        assignedRiderId: closestRider.id,
        message: `Successfully assigned order to ${closestRider.name}.`,
      };
    } else {
      return {
        success: false,
        orderId,
        message: 'No riders with location data are available.',
      };
    }
  }
);
