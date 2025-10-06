
'use client';

import {
  APIProvider,
  Map,
  useMap,
  Marker,
} from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { updateUserAddress } from '@/app/actions/userActions';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/types';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface AddressAutocompleteProps {
  onAddressSelect: (address: Address) => void;
  onCancel: () => void;
  initialAddress?: Address | null;
  apiKey: string; // The API key is now a required prop
}

const MAP_ID = 'freshoz_map_id';

// Centered around Bhagalpur
const aoiCenter = { lat: 25.2424, lng: 86.9850 };

// Bounding box for suggestions, roughly covering Bhagalpur and Khagaria districts
const aoiBounds = {
    north: aoiCenter.lat + 0.5,
    south: aoiCenter.lat - 0.5,
    east: aoiCenter.lng + 0.7,
    west: aoiCenter.lng - 0.7,
};


export default function AddressAutocomplete({ onAddressSelect, onCancel, initialAddress, apiKey }: AddressAutocompleteProps) {
  // The check for the API key is removed from here and handled in the parent Server Component.
  return (
    <div className="flex h-screen flex-col bg-gray-50">
        <div className="p-4 border-b bg-white z-10 shadow-sm flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="h-5 w-5" />
            </Button>
            <APIProvider apiKey={apiKey} libraries={['places', 'geocoding']}>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-center mb-1">{initialAddress ? 'Edit Address' : 'Set Delivery Location'}</h2>
                    <Autocomplete onPlaceSelect={(place) => {
                         if (place?.geometry?.location) {
                            const lat = place.geometry.location.lat();
                            const lng = place.geometry.location.lng();
                            // This will be picked up by the LocationPicker component
                            const event = new CustomEvent('place-selected', { detail: { lat, lng, place } });
                            window.dispatchEvent(event);
                        }
                    }} initialValue={initialAddress?.address} />
                </div>
            </APIProvider>
        </div>
        <APIProvider apiKey={apiKey} libraries={['places', 'geocoding']}>
            <LocationPicker onAddressSelect={onAddressSelect} onCancel={onCancel} initialAddress={initialAddress} />
        </APIProvider>
    </div>
  );
}

function LocationPicker({ onAddressSelect, onCancel, initialAddress }: Omit<AddressAutocompleteProps, 'apiKey'>) {
  const map = useMap();
  const [position, setPosition] = useState(initialAddress?.lat && initialAddress?.lng ? { lat: initialAddress.lat, lng: initialAddress.lng } : aoiCenter);
  const [addressDetails, setAddressDetails] = useState<Partial<Address>>(initialAddress || {});
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
              type: addressDetails.type || 'home',
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
  
  const parsePlace = useCallback((place: google.maps.places.PlaceResult) => {
    const addressComponents = place.address_components;
    if (!addressComponents) return {};

    const getPart = (type: string, nameType: 'long_name' | 'short_name' = 'long_name') =>
        addressComponents.find(c => c.types.includes(type))?.[nameType] || '';

    const streetNumber = getPart('street_number');
    const route = getPart('route');
    const sublocality = getPart('sublocality_level_1');

    let fullAddress = `${streetNumber} ${route}`.trim();
    if (sublocality && !fullAddress.includes(sublocality)) {
        fullAddress = fullAddress ? `${fullAddress}, ${sublocality}` : sublocality;
    }

    return {
        address: fullAddress || place.name,
        city: getPart('locality'),
        district: getPart('administrative_area_level_2'),
        state: getPart('administrative_area_level_1'),
        pincode: getPart('postal_code'),
        country: getPart('country'),
    };
  }, []);

  const geocodePosition = useCallback((lat: number, lng: number) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const details = parsePlace(results[0]);
         setAddressDetails(prev => ({...prev, ...details, lat, lng }));
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  }, [parsePlace]);

  useEffect(() => {
    if (map && position) {
      map.panTo(position);
    }
  }, [map, position]);
  
  const handleMapDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    const newCenter = e.latLng;
    if(newCenter) {
      const lat = newCenter.lat();
      const lng = newCenter.lng();
      setPosition({ lat, lng });
      geocodePosition(lat, lng);
    }
  }, [geocodePosition]);

  useEffect(() => {
    const handlePlaceSelected = (event: Event) => {
      const { lat, lng, place } = (event as CustomEvent).detail;
      setPosition({ lat, lng });
      const details = parsePlace(place);
      setAddressDetails({ ...initialAddress, ...details, lat, lng });
    };

    window.addEventListener('place-selected', handlePlaceSelected);
    return () => {
      window.removeEventListener('place-selected', handlePlaceSelected);
    };
  }, [initialAddress, parsePlace]);


  return (
    <>
      <div className="flex-1 relative">
        <Map
          mapId={MAP_ID}
          center={position}
          zoom={16}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          className="w-full h-full"
          onDragend={handleMapDragEnd}
        >
          <Marker position={position} />
        </Map>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] pointer-events-none">
            <div className="relative flex flex-col items-center">
                <div className="absolute -bottom-2 w-4 h-4 bg-black/20 rounded-full blur-md"></div>
                <MapPin className="h-12 w-12 text-red-500 drop-shadow-lg" fill='currentColor'/>
            </div>
        </div>
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
    </>
  );
}

function Autocomplete({onPlaceSelect, initialValue}: {onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void, initialValue?: string}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(initialValue || '');
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placePredictions, setPlacePredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isPlacePredictionsLoading, setIsPlacePredictionsLoading] = useState(false);
  
  useEffect(() => {
    if (window.google?.maps?.places) {
      setPlaceAutocomplete(new window.google.maps.places.AutocompleteService());
    }
  }, []);

  const fetchPredictions = useCallback(
    (value: string) => {
      if (!placeAutocomplete) return;
      setIsPlacePredictionsLoading(true);
      placeAutocomplete.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: 'in' },
          locationBias: aoiBounds,
          types: ['geocode', 'address'],
        },
        (predictions) => {
          setPlacePredictions(predictions || []);
          setIsPlacePredictionsLoading(false);
        }
      );
    },
    [placeAutocomplete]
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    fetchPredictions(value);
  }

  const handleSuggestionClick = (place: google.maps.places.AutocompletePrediction) => {
    if (!place.place_id || !window.google?.maps?.places) return;
    
    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    placesService.getDetails({
        placeId: place.place_id,
        fields: ["address_components", "geometry", "formatted_address", "name"],
    }, (placeResult, status) => {
        if(status === 'OK' && placeResult){
            onPlaceSelect(placeResult);
            setInputValue(placeResult.formatted_address || place.description);
            setPlacePredictions([]);
        } else {
             console.error("Error getting place details", status);
        }
    });
  };
  
  return (
    <div className='relative'>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
                ref={inputRef}
                placeholder="Enter your address"
                className="w-full pl-10 pr-4 py-2 h-12 text-base"
                value={inputValue}
                onChange={handleInputChange}
                autoComplete="off"
            />
            {isPlacePredictionsLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />}
        </div>
      {placePredictions.length > 0 && (
          <div className='absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border z-20'>
              {placePredictions.map((prediction) => {
                return (
                    <button key={prediction.place_id} onClick={() => handleSuggestionClick(prediction)} className="block w-full text-left p-4 hover:bg-gray-100">
                        {prediction.description}
                    </button>
                )
              })}
          </div>
      )}
    </div>
  );
}
    