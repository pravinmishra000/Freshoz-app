"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Address } from "@/lib/types";

// Define suggestion type from Google API
interface Suggestion {
  description: string;
  place_id: string;
}

interface AddressAutocompleteProps {
  apiKey: string;
  initialAddress: Address | null;
  onAddressSelect: (address: Partial<Address>) => void;
  onCancel: () => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  apiKey,
  initialAddress,
  onAddressSelect,
  onCancel,
}) => {
  const [query, setQuery] = useState(initialAddress?.address || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Partial<Address> | null>(initialAddress);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const getComponent = (components: google.maps.GeocoderAddressComponent[], type: string) => {
    return components.find(c => c.types.includes(type))?.long_name || '';
  }

  // Fetch place details for coordinates
  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`
      );
      const data = await res.json();
      if (data.status === "OK" && data.result) {
        const { geometry, address_components, formatted_address } = data.result;
        return {
          address: formatted_address,
          lat: geometry.location.lat,
          lng: geometry.location.lng,
          pincode: getComponent(address_components, 'postal_code'),
          city: getComponent(address_components, 'locality'),
          district: getComponent(address_components, 'administrative_area_level_2'),
          state: getComponent(address_components, 'administrative_area_level_1'),
        };
      }
    } catch (err) {
      console.error("Error fetching place details:", err);
    }
    return null;
  };

  // Handle selecting suggestion
  const handleSelect = async (sug: Suggestion) => {
    setQuery(sug.description);
    setSuggestions([]);
    setLoading(true);
    const details = await fetchPlaceDetails(sug.place_id);
    setLoading(false);

    if (details) {
      const newAddress: Partial<Address> = {
        ...initialAddress,
        address: details.address,
        lat: details.lat,
        lng: details.lng,
        pincode: details.pincode,
        city: details.city,
        district: details.district,
        state: details.state,
      };
      setSelectedAddress(newAddress);
      loadMap(details.lat, details.lng);
    }
  };

  // Load Google Map dynamically
  const loadMapScript = () => {
    return new Promise<void>((resolve) => {
      if (typeof window.google === "object" && typeof window.google.maps === "object") {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  // Initialize map
  const loadMap = useCallback(async (lat: number, lng: number) => {
    await loadMapScript();
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 16,
      disableDefaultUI: true,
    });

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
    });

    markerRef.current = marker;

    google.maps.event.addListener(marker, "dragend", async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLat},${newLng}&key=${apiKey}`);
      const data = await res.json();
      
      if (data.status === "OK" && data.results[0]) {
        const result = data.results[0];
        const newAddress: Partial<Address> = {
           ...initialAddress,
           address: result.formatted_address,
           lat: newLat,
           lng: newLng,
           pincode: getComponent(result.address_components, 'postal_code'),
           city: getComponent(result.address_components, 'locality'),
           district: getComponent(result.address_components, 'administrative_area_level_2'),
           state: getComponent(result.address_components, 'administrative_area_level_1'),
        };
        setQuery(result.formatted_address);
        setSelectedAddress(newAddress);
      }
    });

    setMapLoaded(true);
  }, [apiKey, initialAddress]);


  useEffect(() => {
    if (initialAddress?.lat && initialAddress?.lng) {
      loadMap(initialAddress.lat, initialAddress.lng);
    }
  }, [initialAddress, loadMap]);

  // Input debounce for API
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || !window.google?.maps?.places) {
      setSuggestions([]);
      return;
    }
    
    const service = new window.google.maps.places.AutocompleteService();
    setLoading(true);
    service.getPlacePredictions({ 
      input,
      componentRestrictions: { country: 'in' }, // Restrict to India
    }, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions);
      } else {
        setSuggestions([]);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadMapScript();
    const handler = setTimeout(() => {
      if (query.length > 2) fetchSuggestions(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query, fetchSuggestions]);


  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white p-4 rounded-2xl shadow-lg border border-gray-200"
      >
        <h2 className="text-xl font-bold mb-4 text-primary">
          {initialAddress ? 'Edit Address' : 'Add New Address'}
        </h2>
      {/* Input Field */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search or type your delivery address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border rounded-xl p-2 text-gray-700"
        />
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center my-2">
          <Loader2 className="animate-spin text-gray-400 w-5 h-5" />
        </div>
      )}

      {/* Suggestion Dropdown */}
      {suggestions.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border rounded-xl shadow-md mt-1 max-h-48 overflow-auto"
        >
          {suggestions.map((sug) => (
            <li
              key={sug.place_id}
              onClick={() => handleSelect(sug)}
              className="p-2 hover:bg-green-50 cursor-pointer flex items-center gap-2 text-sm"
            >
              <MapPin className="w-4 h-4 text-green-600" />
              {sug.description}
            </li>
          ))}
        </motion.ul>
      )}

      {/* Map Preview */}
      <div className="mt-4 border rounded-xl overflow-hidden h-[250px] bg-gray-200">
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-gray-700"
        >
          <div className="flex items-center justify-between">
            <p className="flex-1">{selectedAddress.address}</p>
            <CheckCircle className="text-green-600 w-5 h-5 ml-2" />
          </div>
        </motion.div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button 
          className="neon-button" 
          onClick={() => onAddressSelect(selectedAddress || {})}
          disabled={!selectedAddress}
        >
          Confirm & Save Address
        </Button>
      </div>

      </motion.div>
    </div>
  );
};

export default AddressAutocomplete;
