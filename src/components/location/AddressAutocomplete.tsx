"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X, CheckCircle, Home, Building, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Address } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Define suggestion type from Google API
interface Suggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressAutocompleteProps {
  apiKey: string;
  initialAddress: Address | null;
  onAddressSelect: (address: Partial<Address>) => void;
  onCancel: () => void;
}

// Constants
const MOCK_SULTANGANJ_DATA = {
  address: "Sultanganj, Bhagalpur, Bihar 813213",
  lat: 25.2439,
  lng: 86.7375,
  pincode: "813213",
  city: "Sultanganj",
  district: "Bhagalpur",
  state: "Bihar"
};

const ALLOWED_AREAS = [
  { 
    pincode: "813213", 
    name: "Sultanganj", 
    lat: 25.2439, 
    lng: 86.7375,
    deliveryTime: "30-45 mins",
    deliveryFee: "Free"
  }
];

const COMING_SOON_AREAS = [
  { pincode: "812001", name: "Bhagalpur", eta: "Coming Soon" },
  { pincode: "851204", name: "Khagaria", eta: "Coming Soon" }
];

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
  const [addressType, setAddressType] = useState<"home" | "work" | "other">(initialAddress?.type || "home");
  const [isDefault, setIsDefault] = useState(initialAddress?.isDefault || false);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getComponent = (components: google.maps.GeocoderAddressComponent[], type: string) => {
    return components.find(c => c.types.includes(type))?.long_name || '';
  };

  // Check if address is in service area
  const isInServiceArea = (pincode: string) => {
    return ALLOWED_AREAS.some(area => area.pincode === pincode);
  };

  // Get current location
  const getCurrentLocation = () => {
    setCurrentLocationLoading(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setCurrentLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Set Sultanganj data (since we're mocking for now)
        const newAddress: Partial<Address> = {
          ...initialAddress,
          address: MOCK_SULTANGANJ_DATA.address,
          lat: MOCK_SULTANGANJ_DATA.lat,
          lng: MOCK_SULTANGANJ_DATA.lng,
          pincode: MOCK_SULTANGANJ_DATA.pincode,
          city: MOCK_SULTANGANJ_DATA.city,
          district: MOCK_SULTANGANJ_DATA.district,
          state: MOCK_SULTANGANJ_DATA.state,
        };
        
        setQuery(MOCK_SULTANGANJ_DATA.address);
        setSelectedAddress(newAddress);
        loadMap(MOCK_SULTANGANJ_DATA.lat, MOCK_SULTANGANJ_DATA.lng);
        setCurrentLocationLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your current location. Please enter address manually.");
        setCurrentLocationLoading(false);
      }
    );
  };

  // Fetch place details - TEMPORARY MOCK VERSION
  const fetchPlaceDetails = async (placeId: string) => {
    console.log("Using mock data for Sultanganj area");
    return MOCK_SULTANGANJ_DATA;
  };

  // Handle selecting suggestion
  const handleSelect = async (sug: Suggestion) => {
    setQuery(sug.description);
    setSuggestions([]);
    setLoading(true);
    
    try {
      const details = await fetchPlaceDetails(sug.place_id);
      
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
          type: addressType,
          isDefault: isDefault,
        };
        setSelectedAddress(newAddress);
        loadMap(details.lat, details.lng);
      }
    } catch (error) {
      console.error('Error selecting address:', error);
      alert('Failed to fetch address details. Please try again.');
    } finally {
      setLoading(false);
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

  // Reverse geocode function for marker drag - TEMPORARY MOCK
  const reverseGeocode = async (lat: number, lng: number) => {
    console.log("Using mock reverse geocode for Sultanganj");
    
    const newAddress: Partial<Address> = {
      ...initialAddress,
      address: MOCK_SULTANGANJ_DATA.address,
      lat: MOCK_SULTANGANJ_DATA.lat,
      lng: MOCK_SULTANGANJ_DATA.lng,
      pincode: MOCK_SULTANGANJ_DATA.pincode,
      city: MOCK_SULTANGANJ_DATA.city,
      district: MOCK_SULTANGANJ_DATA.district,
      state: MOCK_SULTANGANJ_DATA.state,
      type: addressType,
      isDefault: isDefault,
    };
    
    setQuery(MOCK_SULTANGANJ_DATA.address);
    setSelectedAddress(newAddress);
    
    return MOCK_SULTANGANJ_DATA;
  };

  // Initialize map
  const loadMap = useCallback(async (lat: number, lng: number) => {
    await loadMapScript();
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 16,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: true,
      mapTypeControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
      title: "Drag to adjust location",
      animation: google.maps.Animation.DROP
    });

    markerRef.current = marker;

    google.maps.event.addListener(marker, "dragend", async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      
      await reverseGeocode(newLat, newLng);
    });

    setMapLoaded(true);
  }, [apiKey, initialAddress]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, []);

  useEffect(() => {
    if (initialAddress?.lat && initialAddress?.lng) {
      loadMap(initialAddress.lat, initialAddress.lng);
    } else {
      // Load default Sultanganj map
      loadMap(MOCK_SULTANGANJ_DATA.lat, MOCK_SULTANGANJ_DATA.lng);
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
      componentRestrictions: { country: 'in' },
      types: ['address']
    }, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions.slice(0, 5)); // Limit to 5 suggestions
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

  // Handle final address save
  const handleSaveAddress = () => {
    if (!selectedAddress) return;
    
    const finalAddress: Partial<Address> = {
      ...selectedAddress,
      type: addressType,
      isDefault: isDefault,
      name: "Your Name", // You can add input for this
      phone: "Your Phone" // You can add input for this
    };
    
    onAddressSelect(finalAddress);
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Building className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {initialAddress ? '✏️ Edit Address' : '📍 Add New Address'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {initialAddress ? 'Update your delivery address' : 'Where should we deliver your order?'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Service Area Information */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Navigation className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">🚚 Delivery Areas</h3>
                    <div className="space-y-2">
                      {ALLOWED_AREAS.map(area => (
                        <div key={area.pincode} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-green-700">{area.name} ({area.pincode})</span>
                          </div>
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            ✅ Available
                          </Badge>
                        </div>
                      ))}
                      {COMING_SOON_AREAS.map(area => (
                        <div key={area.pincode} className="flex items-center justify-between opacity-60">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-gray-600">{area.name}</span>
                          </div>
                          <Badge variant="outline" className="text-gray-500">
                            {area.eta}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Location Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                disabled={currentLocationLoading}
                className="flex items-center gap-2 border-dashed"
              >
                {currentLocationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                {currentLocationLoading ? "Detecting Location..." : "Use Current Location"}
              </Button>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <Label htmlFor="address-input" className="text-sm font-medium text-gray-700">
                Search Address
              </Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="address-input"
                  placeholder="Enter your complete address..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:border-green-500 transition-colors pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Loading Spinner */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-center py-2"
                >
                  <Loader2 className="animate-spin text-green-600 w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestion Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border-2 border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto"
                >
                  {suggestions.map((sug) => (
                    <li
                      key={sug.place_id}
                      onClick={() => handleSelect(sug)}
                      className="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate group-hover:text-green-700">
                            {sug.structured_formatting?.main_text}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {sug.structured_formatting?.secondary_text}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            {/* Address Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Address Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'home' as const, label: 'Home', icon: Home },
                  { value: 'work' as const, label: 'Work', icon: Building },
                  { value: 'other' as const, label: 'Other', icon: MapPin }
                ].map((type) => (
                  <Button
                    key={type.value}
                    variant={addressType === type.value ? "default" : "outline"}
                    onClick={() => setAddressType(type.value)}
                    className={`flex items-center gap-2 h-12 ${
                      addressType === type.value 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'border-gray-200'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Map Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Location Preview</Label>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden h-[200px] bg-gray-100 relative">
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 text-center">
                📍 Drag the marker to adjust your exact location
              </p>
            </div>

            {/* Default Address Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="default-address" className="text-sm font-medium text-gray-700">
                  Set as default address
                </Label>
                <p className="text-xs text-gray-500">Use this address for all deliveries</p>
              </div>
              <Switch
                id="default-address"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </div>

            {/* Selected Address Display */}
            <AnimatePresence>
              {selectedAddress && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-green-50 border-2 border-green-200 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getAddressTypeIcon(addressType)}
                        <span className="font-semibold text-green-800 capitalize">{addressType} Address</span>
                        {isDefault && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-green-900">{selectedAddress.address}</p>
                      {selectedAddress.pincode === "813213" ? (
                        <div className="flex items-center gap-1 mt-2">
                          <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                            ✅ Delivery Available
                          </Badge>
                          <span className="text-xs text-green-600">
                            {ALLOWED_AREAS[0].deliveryTime} • {ALLOWED_AREAS[0].deliveryFee}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="destructive" className="mt-2 text-xs">
                          ❌ Delivery Not Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="flex-1 border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAddress}
              disabled={!selectedAddress || selectedAddress.pincode !== "813213"}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200"
              size="lg"
            >
              {selectedAddress?.pincode === "813213" ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Save Address
                </div>
              ) : (
                "📍 Sultanganj Only"
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddressAutocomplete;