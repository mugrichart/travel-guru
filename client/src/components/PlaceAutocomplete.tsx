'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface Place {
    description: string;
    placeId: string;
}

interface PlaceAutocompleteProps {
    value: string;
    onPlaceSelect: (place: Place | null) => void;
    placeholder: string;
    icon?: ReactNode;
}

export default function PlaceAutocomplete({
    value,
    onPlaceSelect,
    placeholder,
    icon,
}: PlaceAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(value);
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

    // Use shared Google Maps hook
    const { isLoaded, error } = useGoogleMaps();

    // Initialize autocomplete service when Google Maps is loaded
    useEffect(() => {
        if (isLoaded && window.google && window.google.maps) {
            autocompleteService.current = new google.maps.places.AutocompleteService();
            sessionToken.current = new google.maps.places.AutocompleteSessionToken();
        }
    }, [isLoaded]);

    // Log errors
    useEffect(() => {
        if (error) {
            console.error('Google Maps loading error:', error);
        }
    }, [error]);

    // Update input value when prop changes (but not while user is typing)
    useEffect(() => {
        // Always sync with prop value to ensure parent state changes are reflected
        setInputValue(value);
    }, [value]);

    // Fetch predictions
    const fetchPredictions = async (input: string) => {
        if (!input || !autocompleteService.current || !sessionToken.current) {
            setPredictions([]);
            return;
        }

        setIsLoading(true);

        try {
            const request: google.maps.places.AutocompletionRequest = {
                input,
                sessionToken: sessionToken.current,
            };

            autocompleteService.current.getPlacePredictions(request, (results, status) => {
                setIsLoading(false);
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(results);
                    setShowPredictions(true);
                } else {
                    setPredictions([]);
                }
            });
        } catch (error) {
            console.error('Error fetching predictions:', error);
            setIsLoading(false);
            setPredictions([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (!newValue) {
            onPlaceSelect(null);
            setPredictions([]);
            setShowPredictions(false);
            return;
        }

        fetchPredictions(newValue);
    };

    const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
        setInputValue(prediction.description);
        onPlaceSelect({
            description: prediction.description,
            placeId: prediction.place_id,
        });
        setShowPredictions(false);
        setPredictions([]);

        // Create new session token for next search
        if (window.google && window.google.maps) {
            sessionToken.current = new google.maps.places.AutocompleteSessionToken();
        }
    };

    const handleBlur = () => {
        // Delay to allow click on prediction
        setTimeout(() => {
            setShowPredictions(false);
        }, 200);
    };

    return (
        <div className="relative group">
            {/* Icon */}
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-400 transition-colors duration-300 pointer-events-none z-10">
                    {icon}
                </div>
            )}

            {/* Input */}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                    if (predictions.length > 0) {
                        setShowPredictions(true);
                    }
                }}
                onBlur={handleBlur}
                placeholder={placeholder}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all duration-300 hover:border-slate-600"
                autoComplete="off"
            />

            {/* Glow effect on focus */}
            <div className="absolute inset-0 rounded-xl bg-linear-to-r from-gold-500/0 via-gold-500/5 to-gold-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            {/* Predictions dropdown */}
            {showPredictions && predictions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                    {predictions.map((prediction) => (
                        <button
                            key={prediction.place_id}
                            type="button"
                            onMouseDown={(e) => {
                                // Prevent input blur from closing predictions before selection
                                e.preventDefault();
                                handleSelectPrediction(prediction);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors duration-200 flex items-start gap-3 group/item border-b border-slate-700/50 last:border-0"
                        >
                            <div className="text-gold-400 mt-1 shrink-0">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-white text-sm group-hover/item:text-gold-100 transition-colors font-medium">
                                    {prediction.structured_formatting.main_text}
                                </div>
                                <div className="text-slate-400 text-xs mt-0.5 truncate uppercase tracking-wider">
                                    {prediction.structured_formatting.secondary_text}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-4 h-4 border-2 border-slate-600 border-t-gold-400 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
