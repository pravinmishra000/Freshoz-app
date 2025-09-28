
'use client';

import { useState, useTransition, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { generateSearchSuggestions } from '@/ai/flows/smart-search-suggestions';

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

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const result = await generateSearchSuggestions({ searchQuery, searchHistory });
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

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search grocery & vegetables..."
            className="w-full rounded-full bg-background/80 py-2 pl-12 pr-4"
            value={query}
            onChange={handleInputChange}
          />
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
