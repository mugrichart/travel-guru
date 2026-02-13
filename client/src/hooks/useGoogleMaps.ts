import { useEffect, useState } from 'react';

let isScriptLoaded = false;
let isScriptLoading = false;
let loadPromise: Promise<void> | null = null;

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
    // Return existing promise if script is currently loading
    if (loadPromise) {
        return loadPromise;
    }

    // Return resolved promise if script is already loaded
    if (isScriptLoaded) {
        return Promise.resolve();
    }

    // Create new loading promise
    loadPromise = new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Window is undefined'));
            return;
        }

        // Check if Google Maps is already available
        if (window.google && window.google.maps) {
            isScriptLoaded = true;
            resolve();
            return;
        }

        // Check if script tag already exists
        const existingScript = document.querySelector(
            `script[src*="maps.googleapis.com/maps/api/js"]`
        );

        if (existingScript) {
            existingScript.addEventListener('load', () => {
                isScriptLoaded = true;
                resolve();
            });
            existingScript.addEventListener('error', () => {
                reject(new Error('Failed to load Google Maps script'));
            });
            return;
        }

        // Create and load the script
        isScriptLoading = true;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            isScriptLoaded = true;
            isScriptLoading = false;
            resolve();
        };

        script.onerror = () => {
            isScriptLoading = false;
            loadPromise = null;
            reject(new Error('Failed to load Google Maps script'));
        };

        document.head.appendChild(script);
    });

    return loadPromise;
};

export function useGoogleMaps() {
    const [isLoaded, setIsLoaded] = useState(isScriptLoaded);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            setError(new Error('Google Maps API key is not set'));
            return;
        }

        // If already loaded, just update state
        if (isScriptLoaded) {
            setIsLoaded(true);
            return;
        }

        // Load the script
        loadGoogleMapsScript(apiKey)
            .then(() => {
                setIsLoaded(true);
                setError(null);
            })
            .catch((err) => {
                setError(err);
                setIsLoaded(false);
            });
    }, []);

    return { isLoaded, error };
}
