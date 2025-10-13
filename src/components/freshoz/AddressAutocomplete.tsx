'use client';

import { useEffect, useState } from 'react';

// Google Maps types fallback
declare global {
  interface Window {
    google: any;
  }
}

interface AddressAutocompleteProps {
  onSelect: (address: string) => void;
}

export default function AddressAutocomplete({ onSelect }: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    if (!inputValue) {
      setPredictions([]);
      return;
    }

    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = () => fetchPredictions();
    } else {
      fetchPredictions();
    }

    function fetchPredictions() {
      if (!window.google || !window.google.maps || !window.google.maps.places) return;

      // ✅ Use AutocompleteSuggestion (recommended by Google)
      const service: any = new window.google.maps.places.AutocompleteSuggestion();

      if (!service) return;

      service.getQueryPredictions({ input: inputValue }, (results: any[], status: string) => {
        if (status === 'OK' && results) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      });
    }
  }, [inputValue]);

  return (
    <div className="address-autocomplete relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter your address"
        className="input-field w-full p-2 border rounded"
      />
      {predictions.length > 0 && (
        <ul className="autocomplete-list absolute top-full left-0 right-0 bg-white border max-h-52 overflow-y-auto z-10 list-none p-0 m-0">
          {predictions.map((pred) => (
            <li
              key={pred.place_id}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onSelect(pred.description);
                setInputValue(pred.description);
                setPredictions([]);
              }}
            >
              {pred.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
