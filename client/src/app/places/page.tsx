'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PlaceAutocomplete from '@/components/PlaceAutocomplete';
import { MapPin, Navigation, Sparkles } from 'lucide-react';

interface Place {
    description: string;
    placeId: string;
}

export default function PlacesPage() {
    const router = useRouter();
    const [origin, setOrigin] = useState<Place | null>(null);
    const [destination, setDestination] = useState<Place | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!origin || !destination) {
            return;
        }

        setIsSearching(true);

        // Navigate to navigation page with place IDs
        const params = new URLSearchParams({
            originId: origin.placeId,
            destinationId: destination.placeId,
            originDesc: origin.description,
            destinationDesc: destination.description
        });

        router.push(`/navigation?${params.toString()}`);
    };

    const handleSwap = () => {
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full mb-6 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-gold-400" />
                        <span className="text-sm text-gold-400 font-medium">Plan Your Journey</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-linear-to-r from-white via-gold-200 to-gold-400 bg-clip-text text-transparent">
                        Where to next?
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Enter your starting point and destination to discover the perfect route for your adventure
                    </p>
                </div>

                {/* Main Card */}
                <div className="max-w-3xl mx-auto">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 md:p-12 shadow-2xl">
                        {/* Origin Input */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                                <MapPin className="w-4 h-4 text-gold-400" />
                                Starting Point
                            </label>
                            <PlaceAutocomplete
                                value={origin?.description || ''}
                                onPlaceSelect={setOrigin}
                                placeholder="Enter your origin"
                                icon={<MapPin className="w-5 h-5" />}
                            />
                        </div>

                        {/* Swap Button */}
                        <div className="flex justify-center -my-3 relative z-20">
                            <button
                                onClick={handleSwap}
                                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full p-3 transition-all duration-300 hover:scale-110 hover:rotate-180 shadow-lg group"
                                aria-label="Swap origin and destination"
                            >
                                <svg
                                    className="w-5 h-5 text-gold-400 group-hover:text-gold-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Destination Input */}
                        <div className="mb-8">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                                <Navigation className="w-4 h-4 text-gold-400" />
                                Destination
                            </label>
                            <PlaceAutocomplete
                                value={destination?.description || ''}
                                onPlaceSelect={setDestination}
                                placeholder="Enter your destination"
                                icon={<Navigation className="w-5 h-5" />}
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={!origin || !destination || isSearching}
                            className="w-full bg-linear-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 disabled:from-slate-700 disabled:to-slate-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-gold-500/20 disabled:cursor-not-allowed disabled:hover:shadow-none transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
                        >
                            {isSearching ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Starting...</span>
                                </>
                            ) : (
                                <>
                                    <span>Start Journey</span>
                                    <svg
                                        className="w-5 h-5 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </>
                            )}
                        </button>

                        {/* Quick Tips */}
                        <div className="mt-8 pt-8 border-t border-slate-800">
                            <h3 className="text-sm font-medium text-slate-400 mb-4">Quick Tips</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-start gap-3 text-sm text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5"></div>
                                    <span>Use specific addresses for best results</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5"></div>
                                    <span>City names work great too</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
