"use client";

import React from 'react';

// ENABLE/DISABLE FLAG
const ENABLE_LILYUM_UI = true;

// Lilyum SVG Path (Simple elegant flower shape)
const LilyumIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" style={{ opacity: 0 }} /> {/* Spacer */}
        <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 8C12 8 15 10 15 13C15 16 12 18 12 18C12 18 9 16 9 13C9 10 12 8 12 8Z" stroke="currentColor" />
        <path d="M12 2V22" stroke="currentColor" strokeWidth="0.5" />
        <path d="M12 13L18 7" stroke="currentColor" strokeWidth="0.5" />
        <path d="M12 13L6 7" stroke="currentColor" strokeWidth="0.5" />
    </svg>
);

export function LilyumBackground() {
    if (!ENABLE_LILYUM_UI) return null;

    return (
        <div
            className="fixed inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
        >
            {/* Header Text - "karımı çok seviyorum" - Permanent & Visible */}
            <div
                className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-bloom"
                style={{ animationDelay: '0.5s' }}
            >
                <h1 className="text-3xl md:text-5xl font-light tracking-wide text-rose-500/80 font-['var(--font-great-vibes)'] select-none drop-shadow-sm">
                    karımı çok seviyorum
                </h1>
            </div>

            {/* Lilyum Visuals - Fixed behind content (z-0) - Permanent */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-100">
                {/* Bottom Left Flower */}
                <div className="absolute bottom-[-10px] left-[-10px] w-64 h-64 rotate-12 drop-shadow-lg animate-bloom" style={{ animationDelay: '0.2s' }}>
                    <LilyumIcon className="w-full h-full text-rose-400/30 animate-draw" />
                </div>

                {/* Bottom Right Flower */}
                <div className="absolute bottom-10 right-[-10px] w-48 h-48 -rotate-12 transform scale-x-[-1] drop-shadow-lg animate-bloom" style={{ animationDelay: '0.8s' }}>
                    <LilyumIcon className="w-full h-full text-emerald-400/20 animate-draw" />
                </div>

                {/* Top Right - Subtle */}
                <div className="absolute top-20 right-[5%] w-32 h-32 rotate-45 animate-bloom" style={{ animationDelay: '1.2s' }}>
                    <LilyumIcon className="w-full h-full text-slate-400/20 animate-draw" />
                </div>
            </div>

            {/* Gradient Overlay for Warmth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-50/10 via-transparent to-transparent mix-blend-multiply opacity-100" />
        </div>
    );
}
