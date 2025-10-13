'use client';

import { useState, useTransition, useCallback } from 'react';
import { Search, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { SearchSuggestionsInput, SearchSuggestionsOutput } from '@/ai/flows/smart-search-suggestions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { products as allProducts } from '@/lib/data';

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
  const [isPending, startTransition] = useTransition();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      // Pass the full product list to the API
      const productList = allProducts.map(p => p.name_en);
      const payload: SearchSuggestionsInput = { searchQuery, searchHistory, productList };
      
      const response = await fetch('/api/search-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result: SearchSuggestionsOutput = await response.json();
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(query) {
      setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
      setSuggestions([]);
      // Here you would typically trigger a search result page navigation
      console.log(`Searching for: ${query}`);
    }
  };
  
  const handleVoiceSearch = () => {
      setIsListening(true);
      // Placeholder for voice search logic
      setTimeout(() => setIsListening(false), 3000);
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
                    onClick={() => {
                        setQuery(suggestion);
                        setSuggestions([]);
                        setSearchHistory(prev => [suggestion, ...prev.slice(0, 4)]);
                        console.log(`Searching for: ${suggestion}`);
                    }}
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
    </div>
  );
}
