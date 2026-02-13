'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

interface DestinationMarkerProps {
    position: google.maps.LatLngLiteral;
}

export function DestinationMarker({ position }: DestinationMarkerProps) {
    return (
        <AdvancedMarker position={position}>
            <div className="relative group">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl scale-150 group-hover:animate-pulse"></div>
                <div className="relative bg-slate-900 border-2 border-red-500 p-2 rounded-full shadow-2xl transform transition-transform group-hover:scale-110">
                    <MapPin className="w-6 h-6 text-red-500" />
                </div>
            </div>
        </AdvancedMarker>
    );
}
