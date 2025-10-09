'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // CardDescription add kiya
import { BackButton } from '@/components/freshoz/BackButton';
import { ArrowUp, ArrowDown, Filter, Download, Search, Calendar, CreditCard, Wallet } from 'lucide-react';
import { getTransactions, getCurrentUserId } from '@/lib/wallet';
import type { Transaction } from '@/lib/wallet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function TransactionSkeleton() {
  return (
    <Card className="glass-card animate-pulse border-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const loadTransactionsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        const userTransactions = await getTransactions(userId);
        setTransactions(userTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactionsData();
  }, [loadTransactionsData]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || transaction.type === filter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string, method: string) => {
    if (type === 'credit') {
      return <ArrowUp className="h-5 w-5 text-green-600" />;
    } else {
      if (method.includes('UPI')) return <CreditCard className="h-5 w-5 text-blue-600" />;
      if (method.includes('Card')) return <CreditCard className="h-5 w-5 text-purple-600" />;
      return <Wallet className="h-5 w-5 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div>
                <CardTitle className="font-headline text-4xl font-bold text-primary">Transaction History</CardTitle>
                <CardDescription>
                  View all your wallet transactions and spending
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-700">
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="credit">Credits</TabsTrigger>
                <TabsTrigger value="debit">Spending</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <TransactionSkeleton key={i} />
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card className="glass-card text-center py-12 border-0">
          <CardContent>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filter !== 'all' 
                ? 'Try changing your search or filter' 
                : 'Your transactions will appear here'
              }
            </p>
            {(searchQuery || filter !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="glass-card hover:shadow-lg transition-all duration-300 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}>
                      {getTransactionIcon(transaction.type, transaction.method)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(transaction.timestamp)}</span>
                        <span>•</span>
                        <span>{formatTime(transaction.timestamp)}</span>
                        <span>•</span>
                        <span className="capitalize">{transaction.method}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                    </div>
                    <Badge className={`mt-1 ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}