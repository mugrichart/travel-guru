'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Map,
    useMap,
    useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Loader2 } from 'lucide-react';
import { VehicleMarker } from '@/components/VehicleMarker';
import { DestinationMarker } from '@/components/DestinationMarker';
import { LoadingOverlay } from '@/components/LoadingOverlay';

interface Location {
    lat: number;
    lng: number;
}

function NavigationContent() {
    const searchParams = useSearchParams();
    const map = useMap();
    const placesLibrary = useMapsLibrary('places');

    const [origin, setOrigin] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [heading, setHeading] = useState(0);

    const originId = searchParams.get('originId');
    const destinationId = searchParams.get('destinationId');

    useEffect(() => {
        if (!placesLibrary || !originId || !destinationId || !map) return;

        const service = new google.maps.places.PlacesService(map);

        const getPlaceCoords = (placeId: string): Promise<Location> => {
            return new Promise((resolve, reject) => {
                service.getDetails({ placeId, fields: ['geometry'] }, (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                        resolve({
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        });
                    } else {
                        reject(status);
                    }
                });
            });
        };

        Promise.all([
            getPlaceCoords(originId),
            getPlaceCoords(destinationId)
        ]).then(([originCoords, destCoords]) => {
            setOrigin(originCoords);
            setDestination(destCoords);
            setIsLoading(false);

            // Fit map to markers
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(originCoords);
            bounds.extend(destCoords);

            // Note: fitBounds resets heading/tilt to 0
            map.fitBounds(bounds, 100);

            // Re-apply rotation after fitting bounds
            const randomHeading = Math.floor(Math.random() * 360);
            setHeading(randomHeading);
        }).catch(err => {
            console.error('Error fetching place coordinates:', err);
            setIsLoading(false);
        });
    }, [placesLibrary, originId, destinationId, map]);

    return (
        <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
            {isLoading && <LoadingOverlay message="Initializing premium navigation system..." />}

            <Map
                defaultCenter={{ lat: 0, lng: 0 }}
                defaultZoom={3}
                mapId={process.env.NEXT_PUBLIC_MAP_ID || "32991419fc15604ca1f17398"}
                className="w-full h-full"
                disableDefaultUI={true}
                gestureHandling={'greedy'}
                heading={heading}
                tilt={75}
            >
                {origin && <VehicleMarker position={origin} />}
                {destination && <DestinationMarker position={destination} />}
            </Map>
        </div>
    );
}

export default function NavigationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
                <p className="text-slate-400 text-lg animate-pulse">Loading navigation page...</p>
            </div>
        }>
            <NavigationContent />
        </Suspense>
    );
}
