
'use server';

import admin from '@/lib/firebase/admin';
import { v4 as uuidv4 } from 'uuid';
import type { Address } from '@/lib/types';

const db = admin.firestore();

/**
 * Add or update a user's address. This is a Server Action.
 */
export async function updateUserAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    const userRef = db.collection('users').doc(userId);
    
    // Generate a unique ID for the new address
    const newAddressId = uuidv4();
    const newAddress: Address = { ...address, id: newAddressId };

    // Atomically add the new address to the 'addresses' array in the user's document.
    await userRef.update({
        addresses: admin.firestore.FieldValue.arrayUnion(newAddress)
    });

    // Return the newly created address with its ID.
    return newAddress;
}
