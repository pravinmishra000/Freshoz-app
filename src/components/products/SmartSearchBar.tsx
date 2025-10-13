'use client';

import { useState, useTransition, useCallback } from 'react';
import { Search, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/products/ProductCard';

// ✅ SIMPLE IMPORT - Use from lib/data
import { products as allProducts, CATEGORIES } from '@/lib/data';
import type { Product } from '@/lib/types';


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
      const payload = { 
        searchQuery: searchQuery, 
        searchHistory: searchHistory 
      };
      
      const response = await fetch('/api/search-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    startTransition(() => {
      debouncedGetSuggestions(newQuery);
    });
  };

  const handleRedirect = (product: Product) => {
    console.log(`📍 Product clicked: ${product.name_en}`);
    
    const category = CATEGORIES.find(cat => cat.id === product.category_id);
    
    if (category) {
      router.push(`/products/category/${category.slug}?highlight=${encodeURIComponent(product.name_en)}`);
    } else {
      router.push(`/products?search=${encodeURIComponent(product.name_en)}`);
    }
    
    setQuery('');
    setFilteredProducts([]);
    setSuggestions([]);
  };

  const performSearch = (searchQuery: string) => {
    console.log(`🔍 Searching products for: ${searchQuery}`);
    
    const filtered = allProducts.filter(product =>
      product.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_hi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filtered.length === 1) {
        handleRedirect(filtered[0]);
        return;
    }

    setFilteredProducts(filtered);
    console.log(`✅ Found ${filtered.length} products for: ${searchQuery}`);
  };


  const CustomProductCard = ({ product }: { product: any }) => {
    return (
      <div 
        className="cursor-pointer hover:scale-105 transition-transform duration-200"
        onClick={() => handleRedirect(product)}
      >
        <ProductCard product={product} />
      </div>
    );
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
      }, 3000);
  }

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
      
      {suggestions.length > 0 && (
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

      {filteredProducts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Search Results for "{query}" ({filteredProducts.length} products)
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

      {query && filteredProducts.length === 0 && (
        <div className="mt-6 text-center text-muted-foreground">
          No products found for "{query}"
        </div>
      )}
    </div>
  );
}
