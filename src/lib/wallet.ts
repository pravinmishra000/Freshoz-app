
'use server';

import { auth } from '@/lib/firebase/server';

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  method: 'card' | 'upi' | 'netbanking' | 'order' | 'refund';
  timestamp: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    userId: 'user123',
    type: 'credit',
    amount: 1000,
    description: 'Added via Card',
    status: 'completed',
    method: 'card',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn_2',
    userId: 'user123',
    type: 'debit',
    amount: 150.5,
    description: 'Order #FZ-12345',
    status: 'completed',
    method: 'order',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn_3',
    userId: 'user123',
    type: 'credit',
    amount: 500,
    description: 'Added via UPI',
    status: 'completed',
    method: 'upi',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
   {
    id: 'txn_4',
    userId: 'user123',
    type: 'debit',
    amount: 45.00,
    description: 'Order #FZ-67890',
    status: 'completed',
    method: 'order',
    timestamp: new Date().toISOString(),
  },
   {
    id: 'txn_5',
    userId: 'user123',
    type: 'credit',
    amount: 200.00,
    description: 'Refund for Order #FZ-54321',
    status: 'completed',
    method: 'refund',
    timestamp: new Date().toISOString(),
  }
];


export async function getTransactions(userId: string): Promise<Transaction[]> {
  // In a real app, you would fetch this from Firestore
  return new Promise((resolve) => {
    setTimeout(() => {
      const userTransactions = mockTransactions.filter(t => t.userId === 'user123'); // Using mock user for now
      resolve(userTransactions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, 500);
  });
}

export async function getCurrentUserId(): Promise<string | null> {
    try {
        const user = await auth.currentUser;
        return user ? user.uid : null;
    } catch(e) {
        console.error("Could not get current user", e);
        return null;
    }
}
