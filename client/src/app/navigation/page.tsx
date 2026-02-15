'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Map,
    useMap,
    useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Loader2, Play, RotateCcw, Navigation, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const routesLibrary = useMapsLibrary('routes');
    const placesLibrary = useMapsLibrary('places');
    const geometryLibrary = useMapsLibrary('geometry');

    const [origin, setOrigin] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [path, setPath] = useState<google.maps.LatLng[]>([]);
    const [currentPos, setCurrentPos] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [heading, setHeading] = useState(0);
    const [isDriving, setIsDriving] = useState(false);
    const [progress, setProgress] = useState(0);

    const originId = searchParams.get('originId');
    const destinationId = searchParams.get('destinationId');

    // Fetch coordinates and route
    useEffect(() => {
        if (!placesLibrary || !routesLibrary || !originId || !destinationId || !map) return;

        const placesService = new google.maps.places.PlacesService(map);
        const directionsService = new google.maps.DirectionsService();

        const getPlaceCoords = (placeId: string): Promise<Location> => {
            return new Promise((resolve, reject) => {
                placesService.getDetails({ placeId, fields: ['geometry'] }, (place, status) => {
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
            setCurrentPos(originCoords);

            // Fetch Route
            directionsService.route({
                origin: originCoords,
                destination: destCoords,
                travelMode: google.maps.TravelMode.DRIVING
            }, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    const fullPath = result.routes[0].overview_path;
                    setPath(fullPath);

                    // Set initial heading to face the first leg
                    if (fullPath.length >= 2 && geometryLibrary) {
                        const initialHeading = google.maps.geometry.spherical.computeHeading(fullPath[0], fullPath[1]);
                        setHeading(initialHeading);
                    }

                    // Fit map to route
                    const bounds = new google.maps.LatLngBounds();
                    fullPath.forEach(point => bounds.extend(point));
                    map.fitBounds(bounds, 100);

                    setIsLoading(false);
                }
            });
        }).catch(err => {
            console.error('Error fetching navigation data:', err);
            setIsLoading(false);
        });
    }, [placesLibrary, routesLibrary, originId, destinationId, map]);

    // Handle Driving Simulation
    useEffect(() => {
        if (!isDriving || path.length < 2 || !geometryLibrary || !map) return;

        let animationFrame: number;
        let startTime = Date.now();

        // Calculate total distance for uniform speed
        const totalDistance = google.maps.geometry.spherical.computeLength(path);
        const baseSpeedMS = 40;

        // Dynamic speed and smoothing state
        let currentProgress = progress;
        let lastTimestamp = Date.now();

        const animate = () => {
            const now = Date.now();
            const deltaTime = (now - lastTimestamp) / 1000;
            lastTimestamp = now;

            if (currentProgress < 1) {
                const currentDistance = totalDistance * currentProgress;

                // Find current segment
                let accumulatedDistance = 0;
                let segmentIndex = 0;
                for (let i = 0; i < path.length - 1; i++) {
                    const segmentDist = google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i + 1]);
                    if (accumulatedDistance + segmentDist >= currentDistance) {
                        segmentIndex = i;
                        break;
                    }
                    accumulatedDistance += segmentDist;
                }

                const p1 = path[segmentIndex];
                const p2 = path[segmentIndex + 1];
                const segmentDist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
                const distanceInSegment = currentDistance - accumulatedDistance;
                const segmentProgress = distanceInSegment / segmentDist;

                const lat = p1.lat() + (p2.lat() - p1.lat()) * segmentProgress;
                const lng = p1.lng() + (p2.lng() - p1.lng()) * segmentProgress;
                const newPos = { lat, lng };
                setCurrentPos(newPos);

                // 1. LOOK-AHEAD HEADING
                // Find a point slightly further ahead to anticipate the turn
                const lookAheadDist = 30; // 30 meters ahead
                const targetPointDist = Math.min(currentDistance + lookAheadDist, totalDistance);

                let targetAccDist = 0;
                let targetSegIdx = 0;
                for (let i = 0; i < path.length - 1; i++) {
                    const d = google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i + 1]);
                    if (targetAccDist + d >= targetPointDist) {
                        targetSegIdx = i;
                        break;
                    }
                    targetAccDist += d;
                }
                const targetHeading = google.maps.geometry.spherical.computeHeading(path[targetSegIdx], path[targetSegIdx + 1]);

                // Smooth Heading Adjustment
                setHeading(prev => {
                    let diff = targetHeading - prev;
                    if (diff > 180) diff -= 360;
                    if (diff < -180) diff += 360;
                    return prev + (diff * 0.05); // Gentler smoothing for look-ahead
                });

                // 2. DYNAMIC SPEED (Slow down for turns)
                // Calculate "curvature" based on heading difference between current and next segment
                const nextSegIdx = Math.min(segmentIndex + 1, path.length - 2);
                const currentSegHeading = google.maps.geometry.spherical.computeHeading(p1, p2);
                const nextSegHeading = google.maps.geometry.spherical.computeHeading(path[nextSegIdx], path[nextSegIdx + 1]);

                let angleDiff = Math.abs(nextSegHeading - currentSegHeading);
                if (angleDiff > 180) angleDiff = 360 - angleDiff;

                // Slow down factor: more turn = slower speed (min 40% of base speed)
                const slowdown = Math.max(0.4, 1 - (angleDiff / 90));
                const speedMS = baseSpeedMS * slowdown;

                // Update progress based on delta time and current variable speed
                const progressStep = (speedMS * deltaTime) / totalDistance;
                currentProgress = Math.min(currentProgress + progressStep, 1);
                setProgress(currentProgress);

                if (map) map.panTo(newPos);
                animationFrame = requestAnimationFrame(animate);
            } else {
                setIsDriving(false);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isDriving, path, geometryLibrary, map]);

    const startSimulation = () => {
        if (!origin) return;
        setIsDriving(true);

        // Even closer zoom for 3D building immersion
        if (map) {
            map.setZoom(20);
        }

        if (progress >= 1) {
            setProgress(0);
            setCurrentPos(origin);
        }
    };

    const resetSimulation = () => {
        if (!origin) return;
        setIsDriving(false);
        setProgress(0);
        setCurrentPos(origin);
        setHeading(0);
        if (path.length > 0 && map) {
            const bounds = new google.maps.LatLngBounds();
            path.forEach(point => bounds.extend(point));
            map.fitBounds(bounds, 100);
        }
    };

    return (
        <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
            {isLoading && <LoadingOverlay message="Initializing premium navigation system..." />}

            {/* Simulation Controls */}
            {!isLoading && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl border border-gold-500/30 p-2 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 border-r border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center">
                            <Navigation className={`w-5 h-5 text-gold-500 ${isDriving ? 'animate-pulse' : ''}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Status</p>
                            <p className="text-sm text-slate-100 font-bold">{isDriving ? 'Simulating' : 'Ready'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-1">
                        <button
                            onClick={startSimulation}
                            disabled={isDriving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 disabled:bg-slate-700 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-gold-500/20"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            {progress > 0 && progress < 1 ? 'Resume' : 'Start Trip'}
                        </button>
                        <button
                            onClick={resetSimulation}
                            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:rotate-180 border border-slate-700"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Directional Controls */}
            {!isLoading && (
                <div className="absolute bottom-12 right-12 z-40 flex flex-col items-center gap-3">
                    <div className="flex justify-center">
                        <button
                            className="w-16 h-16 bg-slate-900/80 backdrop-blur-xl border border-gold-500/30 rounded-2xl flex items-center justify-center text-gold-500 hover:bg-gold-500/20 hover:border-gold-500/60 transition-all active:scale-90 shadow-2xl group"
                            aria-label="Move Up"
                        >
                            <ChevronUp className="w-10 h-10 group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-all" />
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="w-16 h-16 bg-slate-900/80 backdrop-blur-xl border border-gold-500/30 rounded-2xl flex items-center justify-center text-gold-500 hover:bg-gold-500/20 hover:border-gold-500/60 transition-all active:scale-90 shadow-2xl group"
                            aria-label="Move Left"
                        >
                            <ChevronLeft className="w-10 h-10 group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-all" />
                        </button>
                        <button
                            className="w-16 h-16 bg-slate-900/80 backdrop-blur-xl border border-gold-500/30 rounded-2xl flex items-center justify-center text-gold-500 hover:bg-gold-500/20 hover:border-gold-500/60 transition-all active:scale-90 shadow-2xl group"
                            aria-label="Move Down"
                        >
                            <ChevronDown className="w-10 h-10 group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-all" />
                        </button>
                        <button
                            className="w-16 h-16 bg-slate-900/80 backdrop-blur-xl border border-gold-500/30 rounded-2xl flex items-center justify-center text-gold-500 hover:bg-gold-500/20 hover:border-gold-500/60 transition-all active:scale-90 shadow-2xl group"
                            aria-label="Move Right"
                        >
                            <ChevronRight className="w-10 h-10 group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-all" />
                        </button>
                    </div>
                </div>
            )}

            <Map
                defaultCenter={{ lat: 0, lng: 0 }}
                defaultZoom={3}
                mapId={process.env.NEXT_PUBLIC_MAP_ID || "32991419fc15604ca1f17398"}
                className="w-full h-full"
                disableDefaultUI={true}
                gestureHandling={'greedy'}
                heading={heading}
                tilt={(path.length > 0 || isDriving) ? 85 : 0}
            >
                {currentPos && <VehicleMarker position={currentPos} rotation={0} />}
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
