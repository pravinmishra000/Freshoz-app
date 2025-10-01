

'use client';

import {
  APIProvider,
  Map,
  useMap,
  useAutocomplete,
  AdvancedMarker,
} from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Search } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { updateUserAddress } from '@/services/firestoreService';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/types';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface AddressAutocompleteProps {
  onAddressSelect: (address: Address) => void;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const MAP_ID = 'freshoz_map_id';

const indiaBounds = {
  north: 35.501,
  south: 8.067,
  west: 68.111,
  east: 97.415,
};

export default function AddressAutocomplete({ onAddressSelect }: AddressAutocompleteProps) {
  if (!API_KEY) {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-red-50 p-4 text-center">
            <h2 className="text-xl font-bold text-red-700">Google Maps API Key Missing</h2>
            <p className="text-red-600">Please provide the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.</p>
        </div>
    );
  }
  return (
    <APIProvider apiKey={API_KEY}>
      <LocationPicker onAddressSelect={onAddressSelect} />
    </APIProvider>
  );
}

function LocationPicker({ onAddressSelect }: AddressAutocompleteProps) {
  const map = useMap();
  const [position, setPosition] = useState({ lat: 25.27, lng: 86.97 }); // Default to Sultanganj
  const [addressDetails, setAddressDetails] = useState<Partial<Address>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { authUser } = useAuth();
  const { toast } = useToast();

  const handleSaveAddress = async () => {
      if (!authUser || !addressDetails?.address) {
          toast({ variant: 'destructive', title: 'Error', description: 'Incomplete address. Please select a valid location.'});
          return;
      }

      setIsLoading(true);
      try {
          const finalAddress: Omit<Address, 'id'> = {
              name: authUser.displayName || 'Home',
              phone: authUser.phoneNumber || '',
              address: addressDetails.address,
              city: addressDetails.city || '',
              district: addressDetails.district || '',
              state: addressDetails.state || '',
              pincode: addressDetails.pincode || '',
              country: addressDetails.country || '',
              lat: position.lat,
              lng: position.lng,
              type: 'home',
          };
          const savedAddress = await updateUserAddress(authUser.uid, finalAddress);
          toast({ title: 'Address Saved!', description: 'Your new address has been added successfully.' });
          onAddressSelect(savedAddress);
      } catch (error) {
          console.error("Failed to save address:", error);
          toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save your address.' });
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    if (map && position) {
      map.panTo(position);
    }
  }, [map, position]);

  const onPlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setPosition({ lat, lng });

        const addressComponents = place.address_components;
        if (addressComponents) {
            const getPart = (type: string, nameType: 'long_name' | 'short_name' = 'long_name') => 
                addressComponents.find(c => c.types.includes(type))?.[nameType] || '';
            
            const streetNumber = getPart('street_number');
            const route = getPart('route');
            const sublocality = getPart('sublocality_level_1');
            
            let fullAddress = `${streetNumber} ${route}`.trim();
            if (sublocality && !fullAddress.includes(sublocality)) {
              fullAddress = fullAddress ? `${fullAddress}, ${sublocality}` : sublocality;
            }

            setAddressDetails({
                address: fullAddress,
                city: getPart('locality'),
                district: getPart('administrative_area_level_2'),
                state: getPart('administrative_area_level_1'),
                pincode: getPart('postal_code'),
                country: getPart('country'),
                lat: lat,
                lng: lng
            });
        }
    }
  };


  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <div className="p-4 border-b bg-white z-10 shadow-sm">
        <h2 className="text-xl font-bold text-center mb-4">Set Delivery Location</h2>
        <Autocomplete onPlaceSelect={onPlaceSelect} />
      </div>

      <div className="flex-1 relative">
        <Map
          mapId={MAP_ID}
          center={position}
          zoom={16}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          className="w-full h-full"
        >
          <AdvancedMarker
            position={position}
            draggable={true}
            onDragEnd={(e) => {
                const lat = e.latLng?.lat();
                const lng = e.latLng?.lng();
                if (lat && lng) {
                    setPosition({lat, lng});
                    // You might want to trigger reverse geocoding here to update address details
                }
            }}
          >
            <div className="relative">
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/20 rounded-full blur-md"></div>
                <MapPin className="h-12 w-12 text-red-500 drop-shadow-lg" fill='currentColor'/>
            </div>
          </AdvancedMarker>
        </Map>
      </div>

      <Card className="rounded-t-2xl rounded-b-none shadow-2xl z-10">
          <CardHeader>
              <CardTitle>Confirm Your Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="street-address">Street Address</Label>
                      <Input id="street-address" readOnly value={addressDetails?.address || 'Select a location'} className="bg-gray-100"/>
                  </div>
                   <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" readOnly value={addressDetails?.city || ''} className="bg-gray-100"/>
                  </div>
                  <div>
                      <Label htmlFor="district">District</Label>
                      <Input id="district" readOnly value={addressDetails?.district || ''} className="bg-gray-100"/>
                  </div>
                  <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" readOnly value={addressDetails?.pincode || ''} className="bg-gray-100"/>
                  </div>
              </div>
            <Button onClick={handleSaveAddress} disabled={isLoading || !addressDetails?.address} className="w-full h-12 text-lg font-semibold bg-positive hover:bg-positive/90">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm & Save Address'}
            </Button>
          </CardContent>
      </Card>
    </div>
  );
}

function Autocomplete({onPlaceSelect}: {onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  
  const { placeAutocomplete, isPlacePredictionsLoading, placePredictions, getPlacePredictions } = useAutocomplete({
    inputField: inputRef.current,
    options: {
      componentRestrictions: { country: 'in' },
      bounds: indiaBounds,
      strictBounds: false
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if(e.target.value) {
        getPlacePredictions({input: e.target.value})
    }
  };

  const handleSuggestionClick = (place: google.maps.places.AutocompletePrediction) => {
      if (!place.place_id) return;
      const placesService = new google.maps.places.PlacesService(document.createElement('div'));
      placesService.getDetails({placeId: place.place_id, fields: ['geometry.location', 'address_components', 'formatted_address']}, (placeResult, status) => {
          if (status === 'OK' && placeResult) {
              onPlaceSelect(placeResult);
              setInputValue(placeResult.formatted_address || place.description);
          }
      })
  }

  return (
    <div className='relative'>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
                ref={inputRef}
                placeholder="Search for area, street name..."
                className="w-full pl-10 pr-4 py-2 h-12 text-base"
                value={inputValue}
                onChange={handleInputChange}
            />
            {isPlacePredictionsLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />}
        </div>
      {placePredictions.length > 0 && (
          <div className='absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border z-20'>
              {placePredictions.map(({ description, place_id }) => (
                <button key={place_id} onClick={() => handleSuggestionClick({ description, place_id } as any)} className="block w-full text-left p-4 hover:bg-gray-100">
                    {description}
                </button>
              ))}
          </div>
      )}
    </div>
  );
}
