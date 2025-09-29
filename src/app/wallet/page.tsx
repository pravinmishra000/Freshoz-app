
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BackButton } from '@/components/freshoz/BackButton';
import { History, Plus, RefreshCw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/firebase/auth-context';
import { listenToWalletBalance } from '@/services/firestoreService';

const WalletIcon = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(-10 50 50) scale(1.1)">
            {/* Shadow Layer */}
            <path d="M10 37C10 31.4772 14.4772 27 20 27H80C85.5228 27 90 31.4772 90 37V77C90 82.5228 85.5228 87 80 87H20C14.4772 87 10 82.5228 10 77V37Z" fill="rgba(0,0,0,0.15)" />
            {/* Main Body */}
            <path d="M10 35C10 29.4772 14.4772 25 20 25H80C85.5228 25 90 29.4772 90 35V75C90 80.5228 85.5228 85 80 85H20C14.4772 85 10 80.5228 10 75V35Z" fill="#16A34A"/>
            {/* Top Flap - Extended */}
            <path d="M10 35C10 29.4772 14.4772 25 20 25H80C85.5228 25 90 29.4772 90 35V55C90 55 85.5228 50 80 50H20C14.4772 50 10 55 10 55V35Z" fill="#FBBF24"/>
            {/* Rupee Symbol */}
            <text x="50%" y="75%" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" fontFamily="sans-serif">
              ₹
            </text>
        </g>
    </svg>
);

export default function WalletPage() {
  const router = useRouter();
  const { authUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalanceManually = useCallback(async () => {
    if (authUser) {
      setIsRefreshing(true);
      // This is a placeholder for a manual fetch if needed, 
      // but onSnapshot handles real-time updates.
      // We can simulate a refresh for UX purposes.
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsRefreshing(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      setIsLoading(true);
      const unsubscribe = listenToWalletBalance(authUser.uid, (newBalance) => {
        setBalance(newBalance);
        setIsLoading(false);
      });

      // Cleanup listener on component unmount
      return () => unsubscribe();
    } else {
        setIsLoading(false); // Not logged in, stop loading
    }
  }, [authUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-300 via-yellow-200 to-yellow-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <BackButton />
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-black/10 rounded-full">
                <Settings className="w-6 h-6" />
             </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto text-center">

            <div className="flex justify-center mb-4">
                <WalletIcon />
            </div>

            <h1 className="text-5xl font-extrabold text-green-700 tracking-tighter uppercase">Freshoz MONEY</h1>
            <p className="text-gray-600 mt-1">Your Digital Balance</p>

            <div className="mt-8 mb-10">
                 <p className="text-gray-600 text-lg">Current Balance</p>
                 {isLoading ? (
                    <div className="h-16 w-48 bg-gray-300/50 animate-pulse rounded-md mx-auto mt-1"></div>
                 ) : (
                    <p className="text-6xl font-bold text-gray-800 mt-1">
                        <span className="font-sans">₹</span>{balance.toLocaleString('en-IN')}
                    </p>
                 )}
            </div>
            
            <div className="space-y-4">
                <Card 
                    className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push('/wallet/add-money')}
                >
                    <CardContent className="p-5 flex items-center gap-5">
                        <div className="bg-green-100 p-3 rounded-xl">
                            <Plus className="w-6 h-6 text-green-700"/>
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-gray-800">Add Money</h3>
                            <p className="text-gray-600 text-sm">Instantly top up your wallet balance.</p>
                        </div>
                    </CardContent>
                </Card>

                 <Card 
                    className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push('/wallet/transactions')}
                >
                    <CardContent className="p-5 flex items-center gap-5">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <History className="w-6 h-6 text-blue-700"/>
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-gray-800">Transaction History</h3>
                            <p className="text-gray-600 text-sm">View all your past transactions.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>


             <Button
                variant="ghost"
                onClick={fetchBalanceManually}
                disabled={isRefreshing}
                className="mt-8 text-gray-600"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && 'animate-spin')} />
                Refresh Balance
            </Button>
        </div>
      </div>
    </div>
  );
}
