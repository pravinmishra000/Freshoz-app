
'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { Search, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/products/ProductCard';

import { ALL_DAIRY_BAKERY_PRODUCTS } from '@/lib/products/dairy-bakery';
import { ALL_NON_VEG_PRODUCTS } from '@/lib/products/non-veg';
import { ALL_VEGETABLES_FRUITS_PRODUCTS } from '@/lib/products/vegetables-fruits';
import { ALL_SNACKS_BEVERAGES_PRODUCTS } from '@/lib/products/snacks-beverages';
import { ALL_STAPLES_GROCERY_PRODUCTS } from '@/lib/products/staples-grocery';
import { CATEGORIES } from '@/lib/data';
import type { Product } from '@/lib/types';


const allProducts = [
  ...ALL_DAIRY_BAKERY_PRODUCTS,
  ...ALL_NON_VEG_PRODUCTS,
  ...ALL_VEGETABLES_FRUITS_PRODUCTS,
  ...ALL_SNACKS_BEVERAGES_PRODUCTS,
  ...ALL_STAPLES_GROCERY_PRODUCTS
];

console.log(`📦 Total products loaded for search: ${allProducts.length}`);

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

export function SmartSearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch('/api/search-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery, searchHistory }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Failed to get search suggestions:", error);
      setSuggestions([]);
    }
  }, [searchHistory]);

  const debouncedGetSuggestions = useCallback(debounce(getSuggestions, 300), [getSuggestions]);

  const handleRedirect = (product: Product) => {
    const category = CATEGORIES.find(c => c.id === product.category_id);
    const categorySlug = category ? category.slug : 'fresh-vegetables';
    
    // Clear search state before redirecting
    setQuery('');
    setFilteredProducts([]);
    setSuggestions([]);

    router.push(`/products/category/${categorySlug}?highlight=${product.id}`);
  };


  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
        setFilteredProducts([]);
        return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = allProducts.filter(product =>
      product.name_en.toLowerCase().includes(lowerCaseQuery) ||
      (product.name_hi && product.name_hi.toLowerCase().includes(lowerCaseQuery)) ||
      (product.category && product.category.toLowerCase().includes(lowerCaseQuery)) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
    );

    // If exactly one product matches, redirect to its page.
    if (filtered.length === 1) {
      handleRedirect(filtered[0]);
    } else {
      setFilteredProducts(filtered);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    startTransition(() => {
      debouncedGetSuggestions(newQuery);
      if (newQuery.length > 1) {
        performSearch(newQuery);
      } else {
        setFilteredProducts([]);
      }
    });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(query) {
      setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
      setSuggestions([]);
      performSearch(query);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    setSearchHistory(prev => [suggestion, ...prev.slice(0, 4)]);
    performSearch(suggestion);
  };

  const handleVoiceSearch = () => {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const voiceQuery = 'tomato';
        setQuery(voiceQuery);
        performSearch(voiceQuery);
      }, 2000);
  }

  const CustomProductCard = ({ product }: { product: Product }) => {
    return (
      <div 
        className="cursor-pointer hover:scale-105 transition-transform duration-200"
        onClick={() => handleRedirect(product)}
      >
        <ProductCard product={product} />
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search grocery & vegetables..."
            className="w-full rounded-full bg-background/80 py-2 pl-12 pr-12"
            value={query}
            onChange={handleInputChange}
          />
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceSearch}
            className={cn("absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full", isListening && "animate-pulse")}
          >
              <Mic className={cn("h-5 w-5", isListening ? "text-primary" : "text-muted-foreground")} />
              <span className="sr-only">Search by voice</span>
          </Button>
        </div>
      </form>
      
      {suggestions.length > 0 && query.length > 1 && (
        <Card className="glass-card absolute top-full mt-2 w-full overflow-hidden z-50">
          <CardContent className="p-2">
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full rounded-md p-3 text-left hover:bg-accent/10"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {filteredProducts.length > 0 && query.length > 1 && (
        <div className="fixed inset-0 top-36 bg-background z-40 overflow-y-auto px-4 pb-24">
            <h3 className="text-lg font-semibold mb-4 mt-4">
                Search Results for "{query}" ({filteredProducts.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                <CustomProductCard 
                    key={product.id} 
                    product={product}
                />
                ))}
            </div>
        </div>
      )}

      {query.length > 1 && filteredProducts.length === 0 && !isPending && (
        <div className="fixed inset-0 top-36 bg-background z-40 flex items-center justify-center">
            <p className="text-center text-muted-foreground">No products found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
