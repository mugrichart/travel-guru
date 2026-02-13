'use client';

import { ReactNode } from 'react';

interface PlaceInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    icon?: ReactNode;
}

export default function PlaceInput({ value, onChange, placeholder, icon }: PlaceInputProps) {
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
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all duration-300 hover:border-slate-600"
            />

            {/* Glow effect on focus */}
            <div className="absolute inset-0 rounded-xl bg-linear-to-r from-gold-500/0 via-gold-500/5 to-gold-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
    );
}
