'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
    message?: string;
}

export function LoadingOverlay({ message = "Initializing system..." }: LoadingOverlayProps) {
    return (
        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center gap-4 transition-opacity duration-500">
            <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
            <p className="text-slate-400 text-lg animate-pulse font-medium tracking-wide text-center px-4">
                {message}
            </p>
        </div>
    );
}
