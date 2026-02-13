'use client';

import { useApiIsLoaded } from '@vis.gl/react-google-maps';

export function useGoogleMaps() {
    const isLoaded = useApiIsLoaded();

    return { isLoaded, error: null };
}
