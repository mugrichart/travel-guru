'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Car } from 'lucide-react';

interface VehicleMarkerProps {
    position: google.maps.LatLngLiteral;
    rotation?: number;
}

export function VehicleMarker({ position, rotation = 0 }: VehicleMarkerProps) {
    return (
        <AdvancedMarker position={position}>
            <div className="relative group flex items-center justify-center">
                {/* Ground Glow */}
                <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-3xl scale-150 animate-pulse"></div>

                {/* Custom Premium Car Rear SVG */}
                <div
                    className="relative transition-transform duration-300 ease-out"
                    style={{
                        filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
                        transform: `rotate(${rotation}deg)`
                    }}
                >
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Car Body Shell */}
                        <path
                            d="M8 36L12 14C12 14 14 8 24 8C34 8 36 14 36 14L40 36H8Z"
                            fill="#1e293b"
                            stroke="#fbbf24"
                            strokeWidth="1.5"
                        />
                        {/* Rear Window */}
                        <path
                            d="M16 16C16 16 17 12 24 12C31 12 32 16 32 16L34 24H14L16 16Z"
                            fill="#0f172a"
                        />
                        {/* Taillights (Glowing Red) */}
                        <rect x="10" y="30" width="8" height="3" rx="1.5" fill="#ef4444" className="animate-pulse" />
                        <rect x="30" y="30" width="8" height="3" rx="1.5" fill="#ef4444" className="animate-pulse" />
                        {/* Diffuser / Lower Bumper */}
                        <path d="M14 36V39H34V36H14Z" fill="#020617" />
                        <rect x="20" y="36" width="2" height="4" fill="#1e293b" />
                        <rect x="26" y="36" width="2" height="4" fill="#1e293b" />
                        {/* Spoiler detail */}
                        <path d="M10 12L38 12" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        </AdvancedMarker>
    );
}
