'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Car } from 'lucide-react';

interface VehicleMarkerProps {
    position: google.maps.LatLngLiteral;
}

export function VehicleMarker({ position }: VehicleMarkerProps) {
    return (
        <AdvancedMarker position={position}>
            <div className="relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gold-500/50 rounded-full blur-xl scale-150 animate-pulse"></div>
                <div className="relative bg-slate-900 border-2 border-gold-500 p-2 rounded-full shadow-2xl transform transition-transform group-hover:scale-110">
                    <Car className="w-6 h-6 text-gold-500" />
                </div>
            </div>
        </AdvancedMarker>
    );
}
