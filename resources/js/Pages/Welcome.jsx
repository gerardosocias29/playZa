import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import FacilityCarousel from '@/Components/FacilityCarousel';
import AvailabilityModal from '@/Components/AvailabilityModal';
import { getFacilities } from '@/mockData';

export default function Welcome({ facilities: serverFacilities = [], reservations = [], schedules = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const displayFacilities = serverFacilities && serverFacilities.length > 0
        ? serverFacilities
        : getFacilities();

    const [activeSection, setActiveSection] = useState('home');
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(displayFacilities[0] || null);

    // Scroll listener for section active tracking
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'facilities', 'about'];
            const scrollPosition = window.scrollY + 180;

            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(sections[i]);
                if (el && el.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i]);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(sectionId);
        }
    };

    const handleOpenAvailabilityModal = (facility = null) => {
        setSelectedFacility(facility || displayFacilities[0]);
        setIsAvailabilityModalOpen(true);
    };

    return (
        <UserLayout title="Welcome to PlayZa - Getafe Sports Reservations" activeSection={activeSection}>
            <Head title="Welcome to PlayZa - Getafe Sports Reservations" />

            <div className="space-y-24">
                {/* SECTION 1: HERO (#home) */}
                <section
                    id="home"
                    className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto pt-8 pb-12 scroll-mt-28"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-[#0077CC] text-xs font-bold mb-6 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-[#add911] animate-pulse"></span>
                        Getafe Municipal Sports & Event Facility System
                    </div>
                    <h1 className="text-4xl md:text-6xl font-title font-black tracking-tight text-[#0b1c30] mb-6 leading-tight">
                        Book Getafe Sports Facilities <span className="text-[#0077CC]">Effortlessly</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium">
                        Check real-time facility availability, inspect 24-hour schedules, and reserve sports courts and municipal grounds across Getafe.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-xs sm:max-w-none">
                        <button
                            onClick={() => handleOpenAvailabilityModal(displayFacilities[0])}
                            className="w-full sm:w-auto px-5 sm:px-8 py-3.5 sm:py-4 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl shadow-lg transition-all duration-200 text-sm hover-scale text-center flex items-center justify-center gap-2 active:scale-95"
                        >
                            Check Availability <span className="text-[#add911]">→</span>
                        </button>
                        <a
                            href="#facilities"
                            onClick={(e) => scrollToSection(e, 'facilities')}
                            className="w-full sm:w-auto px-5 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-slate-50 border border-slate-200 text-[#0b1c30] font-bold rounded-xl transition-colors duration-200 text-sm text-center shadow-sm"
                        >
                            Browse Facilities
                        </a>
                    </div>
                </section>

                {/* SECTION 2: FACILITIES (#facilities) */}
                <section
                    id="facilities"
                    className="max-w-7xl w-full mx-auto pt-16 pb-12 border-t border-slate-200/80 scroll-mt-28"
                >
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <h2 className="text-3xl sm:text-4xl font-title font-black text-[#0b1c30] mb-3">
                            Sports & Event Facilities
                        </h2>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            Explore available indoor and outdoor installations in Getafe
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayFacilities.map((fac) => (
                            <div
                                key={fac.id}
                                className="rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-sm hover:shadow-md bg-white overflow-hidden"
                            >
                                <div className="w-full">
                                    <FacilityCarousel
                                        images={fac.images}
                                        title={fac.name}
                                        type={fac.type}
                                        category={fac.category}
                                    />
                                </div>

                                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                                    <div>
                                        <h3 className="font-title font-black text-xl text-[#0b1c30] mb-2 leading-tight">
                                            {fac.name}
                                        </h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {fac.description}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleOpenAvailabilityModal(fac)}
                                        className="w-full py-3.5 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl text-xs text-center transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                                    >
                                        Check Availability <span className="text-[#add911]">→</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 3: ABOUT (#about) */}
                <section
                    id="about"
                    className="max-w-7xl w-full mx-auto pt-16 pb-12 border-t border-slate-200/80 scroll-mt-28 text-center"
                >
                    <div className="max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-title font-black tracking-tight text-[#0b1c30] mb-4 leading-tight">
                            Getafe Premier Sports & Event Network
                        </h2>

                        <p className="text-base text-slate-600 leading-relaxed font-medium">
                            PlayZa provides residents, sports clubs, and athletes in Getafe with transparent, real-time availability checks and double-booking protection across all municipal installations.
                        </p>
                    </div>

                    {/* 3-Card Feature Grid matching Theme with SVG Icons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-16">
                        
                        {/* Feature 1: Admin Verification */}
                        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                            <div>
                                <div className="h-12 w-12 rounded-2xl bg-[#add911]/25 text-[#0b1c30] flex items-center justify-center mb-6 shadow-sm">
                                    <svg className="w-6 h-6 text-[#0b1c30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-title font-black text-[#0b1c30] mb-2">
                                    Admin Verification
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Accounts and bookings are verified by municipal admins to ensure maximum reliability and fair play for all users.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0077CC]">
                                <span>Verified Access</span>
                                <span>→</span>
                            </div>
                        </div>

                        {/* Feature 2: Live 24-Hour Schedules */}
                        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                            <div>
                                <div className="h-12 w-12 rounded-2xl bg-[#0077CC]/15 text-[#0077CC] flex items-center justify-center mb-6 shadow-sm">
                                    <svg className="w-6 h-6 text-[#0077CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-title font-black text-[#0b1c30] mb-2">
                                    Live 24-Hour Schedules
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Inspect real-time court availability, open time slots, and schedule court sessions directly from date targets.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0077CC]">
                                <span>Live Slot Checking</span>
                                <span>→</span>
                            </div>
                        </div>

                        {/* Feature 3: Conflict Prevention */}
                        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                            <div>
                                <div className="h-12 w-12 rounded-2xl bg-[#0b1c30] text-[#add911] flex items-center justify-center mb-6 shadow-sm ring-2 ring-[#add911]/60">
                                    <svg className="w-6 h-6 text-[#add911]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-title font-black text-[#0b1c30] mb-2">
                                    Conflict Prevention
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Automated schedule validation prevents overlapping reservations, guaranteeing your reserved slot is yours.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0077CC]">
                                <span>Zero Conflicts</span>
                                <span>→</span>
                            </div>
                        </div>
                    </div>

                    {/* Call To Action Buttons */}
                    <div className="flex justify-center w-full mx-auto">
                        <button
                            onClick={() => handleOpenAvailabilityModal(displayFacilities[0])}
                            className="w-full max-w-xs sm:max-w-none sm:w-auto px-5 sm:px-8 py-3.5 sm:py-4 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl shadow-lg transition-all duration-200 text-sm hover-scale text-center flex items-center justify-center gap-2 active:scale-95"
                        >
                            Check Availability <span className="text-[#add911]">→</span>
                        </button>
                    </div>
                </section>
            </div>

            <AvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                facility={selectedFacility || displayFacilities[0]}
                facilities={displayFacilities}
                reservations={reservations}
                schedules={schedules}
                user={user}
            />
        </UserLayout>
    );
}
