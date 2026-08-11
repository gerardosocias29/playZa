import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function UserLayout({ children, title, activeSection = '' }) {
    const { auth, notificationsCount = 0 } = usePage().props;
    const user = auth?.user ?? null;


    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileRef = useRef(null);

    // Scroll listener for header shadow
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const handleLogout = (e) => {
        e.preventDefault();
        setIsProfileOpen(false);
        router.post('/logout');
    };

    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || currentPath === '/dashboard';
    const activeNavSection = isHomePage ? (activeSection || 'home') : '';

    const scrollToSection = (sectionId) => {
        if (window.location.pathname !== '/') {
            router.visit('/', {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setTimeout(() => {
                        const el = document.getElementById(sectionId);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 50);
                },
            });
            return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSectionClick = (sectionId) => {
        setIsMobileMenuOpen(false);
        scrollToSection(sectionId);
    };

    const isHomeActive = isHomePage && activeNavSection === 'home';
    const isFacilitiesActive = isHomePage ? activeNavSection === 'facilities' : currentPath === '/user/facilities';
    const isAboutActive = isHomePage && activeNavSection === 'about';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50/40 via-slate-50/50 to-transparent pointer-events-none z-0"></div>
            <div className="fixed top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#0077CC]/5 blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#add911]/10 blur-[120px] pointer-events-none z-0"></div>

            {title && <Head title={`${title} - PlayZa`} />}

            {/* Top Navigation Header (Exact Landing Page Header) */}
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
                        <button
                            type="button"
                            onClick={() => handleSectionClick('home')}
                            className={`relative text-sm font-extrabold transition-all duration-200 py-1 ${
                                isHomeActive
                                    ? 'text-[#0077CC]'
                                    : 'text-slate-600 hover:text-[#0b1c30]'
                            }`}
                        >
                            Home
                            {isHomeActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0077CC] rounded-full transition-all"></span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSectionClick('facilities')}
                            className={`relative text-sm font-extrabold transition-all duration-200 py-1 ${
                                isFacilitiesActive
                                    ? 'text-[#0077CC]'
                                    : 'text-slate-600 hover:text-[#0b1c30]'
                            }`}
                        >
                            Facilities
                            {isFacilitiesActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0077CC] rounded-full transition-all"></span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSectionClick('about')}
                            className={`relative text-sm font-extrabold transition-all duration-200 py-1 ${
                                isAboutActive
                                    ? 'text-[#0077CC]'
                                    : 'text-slate-600 hover:text-[#0b1c30]'
                            }`}
                        >
                            About
                            {isAboutActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0077CC] rounded-full transition-all"></span>
                            )}
                        </button>
                    </nav>

                    {/* Right User Actions (Identical across all pages) */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-sm"
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            aria-label="Toggle navigation"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        {user ? (
                            <div className="flex items-center gap-3 sm:gap-5">
                                {/* 1. My Reservations Link */}
                                <Link
                                    href="/my-reservations"
                                    className={`text-xs font-extrabold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                                        currentPath === '/my-reservations'
                                            ? 'bg-indigo-50 text-[#0077CC] ring-1 ring-indigo-200'
                                            : 'text-[#0b1c30] hover:text-[#0077CC] hover:bg-slate-100/80'
                                    }`}
                                >
                                    <svg className="w-4 h-4 text-[#0077CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="hidden sm:inline">My Reservations</span>
                                </Link>

                                {/* 2. Notifications Bell Icon */}
                                <Link
                                    href="/notifications"
                                    className={`relative p-2 rounded-xl transition-all ${
                                        currentPath === '/notifications'
                                            ? 'bg-indigo-50 text-[#0077CC]'
                                            : 'text-slate-600 hover:text-[#0b1c30] hover:bg-slate-100/80'
                                    }`}
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
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0b1c30] to-[#0077CC] text-white flex items-center justify-center font-black text-xs shadow-sm">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>

                                        <div className="hidden md:flex flex-col text-left">
                                            <span className="text-xs font-black text-[#0b1c30] leading-tight">
                                                {user.name}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-450 leading-tight">
                                                {user.email}
                                            </span>
                                        </div>

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
                                                href="/my-reservations"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-[#0b1c30] hover:bg-slate-50 transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-[#0077CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>My Reservations</span>
                                            </Link>

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

            {isMobileMenuOpen && (
                <div className="md:hidden fixed top-[76px] left-4 right-4 z-40 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md">
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => handleSectionClick('home')}
                            className={`rounded-xl px-3 py-2 text-left text-sm font-extrabold ${isHomeActive ? 'bg-[#0077CC]/10 text-[#0077CC]' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            Home
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSectionClick('facilities')}
                            className={`rounded-xl px-3 py-2 text-left text-sm font-extrabold ${isFacilitiesActive ? 'bg-[#0077CC]/10 text-[#0077CC]' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            Facilities
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSectionClick('about')}
                            className={`rounded-xl px-3 py-2 text-left text-sm font-extrabold ${isAboutActive ? 'bg-[#0077CC]/10 text-[#0077CC]' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            About
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 pt-28 pb-16 px-6 max-w-7xl w-full mx-auto relative">
                {children}
            </main>

            {/* Footer (Landing Page Style) */}
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
