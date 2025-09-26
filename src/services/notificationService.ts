import { fcm } from '@/lib/firebase/admin';
import type { MessagingPayload } from 'firebase-admin/messaging';

/**
 * Sends a push notification to a specific device token.
 *
 * @param token The FCM registration token of the device.
 * @param payload The notification payload (title, body, etc.).
 * @returns A promise that resolves when the message is sent.
 */
export async function sendPushNotification(
  token: string,
  payload: MessagingPayload
): Promise<void> {
  try {
    await fcm.send({
        token,
        ...payload
    });
    console.log(`Successfully sent message to token: ${token}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
    // In a real app, you might want to handle errors like unregistered tokens
    // by removing the token from your database.
  }
}
