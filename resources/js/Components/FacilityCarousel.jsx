import React, { useState } from 'react';

export default function FacilityCarousel({ images = [], title = 'Facility', type = 'Indoor', category = 'Sports' }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-56 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
                No images available
            </div>
        );
    }

    const prevSlide = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextSlide = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const goToSlide = (e, index) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex(index);
    };

    const isIndoor = type === 'Indoor';

    return (
        <div className="relative w-full h-56 sm:h-60 overflow-hidden group select-none bg-slate-950">
            {/* Full-bleed Image Slide */}
            <img
                src={images[currentIndex]}
                alt={`${title} - Photo ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 transform group-hover:scale-105"
            />

            {/* Subtle Gradient Overlays for Badges & Controls Visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none"></div>

            {/* Top Left: Category Badge */}
            <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-[#0b1c30]/85 backdrop-blur-md border border-white/20 text-white text-[11px] font-extrabold tracking-wider z-10 shadow-sm">
                {category}
            </div>

            {/* Top Right: Indoor / Outdoor Pill */}
            <div 
                className={`absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider z-10 shadow-sm flex items-center gap-1.5 backdrop-blur-md border border-white/20 ${
                    isIndoor 
                        ? 'bg-[#add911] text-[#0b1c30]' 
                        : 'bg-[#0077CC] text-white'
                }`}
            >
                <span className={`h-2 w-2 rounded-full ${isIndoor ? 'bg-[#0b1c30] animate-pulse' : 'bg-white animate-pulse'}`}></span>
                {type ? type.toUpperCase() : 'INDOOR'}
            </div>

            {/* Slide Counter Badge (Bottom Right) */}
            <div className="absolute bottom-3.5 right-3.5 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold z-10">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Navigation Arrow - Left */}
            {images.length > 1 && (
                <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous Photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#0b1c30]/80 hover:bg-[#0077CC] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-lg border border-white/20 active:scale-95"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Navigation Arrow - Right */}
            {images.length > 1 && (
                <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next Photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#0b1c30]/80 hover:bg-[#0077CC] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-lg border border-white/20 active:scale-95"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {/* Pagination Dots */}
            {images.length > 1 && (
                <div className="absolute bottom-3.5 left-0 right-0 flex justify-center gap-1.5 z-20">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={(e) => goToSlide(e, idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                currentIndex === idx 
                                    ? 'w-6 bg-[#add911]' 
                                    : 'w-2 bg-white/50 hover:bg-white'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
