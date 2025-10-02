
'use server';

import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { v4 as uuidv4 } from 'uuid';
import type { Address } from '@/lib/types';

/**
 * Add or update a user's address. This is a Server Action.
 */
export async function updateUserAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    const userRef = doc(db, 'users', userId);
    
    // Generate a unique ID for the new address
    const newAddressId = uuidv4();
    const newAddress: Address = { ...address, id: newAddressId };

    // Atomically add the new address to the 'addresses' array in the user's document.
    await updateDoc(userRef, {
        addresses: arrayUnion(newAddress)
    });

    // Return the newly created address with its ID.
    return newAddress;
}
