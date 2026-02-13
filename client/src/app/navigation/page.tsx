'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Map,
    AdvancedMarker,
    useMap,
    useMapsLibrary,
    Pin
} from '@vis.gl/react-google-maps';
import { Car, MapPin, Loader2, Navigation } from 'lucide-react';

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
            map.fitBounds(bounds, 100);
        }).catch(err => {
            console.error('Error fetching place coordinates:', err);
            setIsLoading(false);
        });
    }, [placesLibrary, originId, destinationId, map]);

    return (
        <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center gap-4 transition-opacity duration-500">
                    <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
                    <p className="text-slate-400 text-lg animate-pulse font-medium tracking-wide text-center px-4">
                        Initializing premium navigation system...
                    </p>
                </div>
            )}

            <Map
                defaultCenter={{ lat: 0, lng: 0 }}
                defaultZoom={3}
                mapId={process.env.NEXT_PUBLIC_MAP_ID || "bf19c36284f108f9"}
                className="w-full h-full"
                disableDefaultUI={true}
                gestureHandling={'greedy'}
            >
                {origin && (
                    <AdvancedMarker position={origin}>
                        <div className="relative group">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gold-500/50 rounded-full blur-xl scale-150 animate-pulse"></div>
                            <div className="relative bg-slate-900 border-2 border-gold-500 p-2 rounded-full shadow-2xl transform transition-transform group-hover:scale-110">
                                <Car className="w-6 h-6 text-gold-500" />
                            </div>
                        </div>
                    </AdvancedMarker>
                )}

                {destination && (
                    <AdvancedMarker position={destination}>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl scale-150 group-hover:animate-pulse"></div>
                            <div className="relative bg-slate-900 border-2 border-red-500 p-2 rounded-full shadow-2xl transform transition-transform group-hover:scale-110">
                                <MapPin className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                    </AdvancedMarker>
                )}
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
