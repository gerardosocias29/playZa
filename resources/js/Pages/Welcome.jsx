import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import FacilityCarousel from '@/Components/FacilityCarousel';
import { getFacilities } from '@/mockData';

export default function Welcome({ facilities: serverFacilities = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const displayFacilities = serverFacilities && serverFacilities.length > 0
        ? serverFacilities
        : getFacilities();

    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Click outside listener for user profile dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll listener for header animation & section active tracking
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

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

    const handleLogout = (e) => {
        e.preventDefault();
        setIsProfileOpen(false);
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50/40 via-slate-50/50 to-transparent pointer-events-none z-0"></div>
            <div className="fixed top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#0077CC]/5 blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#add911]/10 blur-[120px] pointer-events-none z-0"></div>

            <Head title="Welcome to PlayZa - Getafe Sports Reservations" />

            {/* Header / Top Navigation Bar */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
                    isScrolled
                        ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80 py-3.5'
                        : 'bg-transparent border-b border-transparent py-5'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <img
                            src="/images/playza_horizontal.png"
                            alt="PlayZa Logo"
                            className="h-10 object-contain transition-transform group-hover:scale-[1.02]"
                        />
                    </Link>

                    {/* Navigation Menu (Home | Facilities | About) */}
                    <nav className="hidden md:flex items-center gap-8">
                        {[
                            { id: 'home', label: 'Home' },
                            { id: 'facilities', label: 'Facilities' },
                            { id: 'about', label: 'About' },
                        ].map((item) => {
                            const isActive = activeSection === item.id;
                            return (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    onClick={(e) => scrollToSection(e, item.id)}
                                    className={`relative text-sm font-extrabold transition-all duration-200 py-1 ${
                                        isActive
                                            ? 'text-[#0077CC]'
                                            : 'text-slate-600 hover:text-[#0b1c30]'
                                    }`}
                                >
                                    {item.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0077CC] rounded-full transition-all"></span>
                                    )}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Right User Actions (Logged-in Header controls vs Guest links) */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3 sm:gap-5">
                                {/* 1. My Reservations Link */}
                                <Link
                                    href="/my-reservations"
                                    className="text-xs font-extrabold text-[#0b1c30] hover:text-[#0077CC] px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-all flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4 text-[#0077CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="hidden sm:inline">My Reservations</span>
                                </Link>

                                {/* 2. Notifications Bell Icon */}
                                <Link
                                    href="/notifications"
                                    className="relative p-2 text-slate-600 hover:text-[#0b1c30] hover:bg-slate-100/80 rounded-xl transition-all"
                                    title="Notifications"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#add911] ring-2 ring-white"></span>
                                </Link>

                                {/* 3. Avatar + Name/Email + Dropdown Icon */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200/80"
                                    >
                                        {/* Avatar Circle */}
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0b1c30] to-[#0077CC] text-white flex items-center justify-center font-black text-xs shadow-sm">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>

                                        {/* Name / Email Stack */}
                                        <div className="hidden md:flex flex-col text-left">
                                            <span className="text-xs font-black text-[#0b1c30] leading-tight">
                                                {user.name}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-450 leading-tight">
                                                {user.email}
                                            </span>
                                        </div>

                                        {/* Dropdown Icon */}
                                        <svg
                                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-fadeIn">
                                            <div className="px-4 py-2.5 border-b border-slate-100 md:hidden">
                                                <p className="text-xs font-black text-[#0b1c30]">{user.name}</p>
                                                <p className="text-[10px] text-slate-450">{user.email}</p>
                                            </div>

                                            <Link
                                                href="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-[#0b1c30] hover:bg-slate-50 transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-[#0077CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span>My Profile</span>
                                            </Link>

                                            <div className="border-t border-slate-100 my-1"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                                            >
                                                <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="text-xs font-bold text-slate-700 hover:text-[#0b1c30] px-3 py-2 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#0b1c30] hover:bg-[#132c4a] rounded-xl transition-all shadow-md"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* SECTION 1: HERO (#home) */}
            <section
                id="home"
                className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto z-10 pt-36 pb-20 scroll-mt-28"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-[#0077CC] text-xs font-bold mb-6 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#add911] animate-pulse"></span>
                    Getafe Municipal Sports & Event Facility System
                </div>
                <h1 className="text-4xl md:text-6xl font-title font-black tracking-tight text-[#0b1c30] mb-6 leading-tight">
                    Book Getafe Sports Facilities <span className="text-[#0077CC]">Effortlessly</span>
                </h1>
                <p className="text-base md:text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium">
                    Check real-time court availability, inspect 24-hour schedules, and reserve basketball hardwood courts, volleyball arenas, tennis grounds, and event halls across Getafe.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none">
                    <Link
                        href={user ? '/my-reservations' : '/register'}
                        className="px-8 py-4 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl shadow-lg transition-all duration-200 text-sm hover-scale text-center flex items-center justify-center gap-2"
                    >
                        {user ? 'My Reservations' : 'Get Started Now'} <span className="text-[#add911]">→</span>
                    </Link>
                    <a
                        href="#facilities"
                        onClick={(e) => scrollToSection(e, 'facilities')}
                        className="px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-[#0b1c30] font-bold rounded-xl transition-colors duration-200 text-sm text-center shadow-sm"
                    >
                        Browse Facilities
                    </a>
                </div>
            </section>

            {/* SECTION 2: FACILITIES (#facilities) */}
            <section
                id="facilities"
                className="max-w-7xl w-full mx-auto px-6 py-24 border-t border-slate-200/80 z-10 scroll-mt-28"
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

                                <Link
                                    href={user ? '/my-reservations' : '/login'}
                                    className="w-full py-3.5 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl text-xs text-center transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    Check Availability <span className="text-[#add911]">→</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 3: ABOUT (#about) */}
            <section
                id="about"
                className="max-w-7xl w-full mx-auto px-6 py-24 border-t border-slate-200/80 z-10 scroll-mt-28 text-center"
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
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none mx-auto">
                    <Link
                        href={user ? '/my-reservations' : '/register'}
                        className="px-8 py-4 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl shadow-lg transition-all duration-200 text-sm hover-scale text-center flex items-center justify-center gap-2"
                    >
                        {user ? 'My Reservations' : 'Create Your Account Now!'} <span className="text-[#add911]">→</span>
                    </Link>
                    {!user && (
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-[#0b1c30] font-bold rounded-xl transition-colors duration-200 text-sm text-center shadow-sm"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white text-slate-700 py-10 border-t border-slate-200/90 mt-auto z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/playza_horizontal.png"
                            alt="PlayZa Logo"
                            className="h-9 object-contain drop-shadow-sm"
                        />
                        <span className="text-xs text-slate-500 font-medium">
                            © {new Date().getFullYear()} PlayZa Getafe Sports System. All rights reserved.
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-slate-600 font-bold">
                        <Link href="/terms-of-service" className="hover:text-[#0077CC] transition-colors">Terms of Service</Link>
                        <Link href="/privacy-policy" className="hover:text-[#0077CC] transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
