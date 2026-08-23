import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function PublicLayout({ children, title, activeSection = '' }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSectionClick = (sectionId) => {
        setIsMobileMenuOpen(false);
        scrollToSection(sectionId);
    };

    const isHomeActive = activeSection === 'home';
    const isFacilitiesActive = activeSection === 'facilities';
    const isAboutActive = activeSection === 'about';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50/40 via-slate-50/50 to-transparent pointer-events-none z-0"></div>
            <div className="fixed top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#0077CC]/5 blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#add911]/10 blur-[120px] pointer-events-none z-0"></div>

            {title && <Head title={`${title} - PlayZa`} />}

            {/* Top Navigation Header */}
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

                    {/* Auth Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <Link
                                href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                                className="px-5 py-2.5 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
                            >
                                Go to Workspace <span className="text-[#add911]">→</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#0b1c30] font-bold rounded-xl text-xs transition-colors shadow-xs"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                                >
                                    Register <span className="text-[#add911]">→</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <div className="md:hidden flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-slate-700 hover:text-[#0b1c30] focus:outline-none"
                            aria-label="Toggle navigation menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 space-y-4 shadow-xl">
                        <div className="flex flex-col space-y-3">
                            <button
                                type="button"
                                onClick={() => handleSectionClick('home')}
                                className="text-left font-bold text-slate-800 hover:text-[#0077CC] py-1 text-sm"
                            >
                                Home
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSectionClick('facilities')}
                                className="text-left font-bold text-slate-800 hover:text-[#0077CC] py-1 text-sm"
                            >
                                Facilities
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSectionClick('about')}
                                className="text-left font-bold text-slate-800 hover:text-[#0077CC] py-1 text-sm"
                            >
                                About
                            </button>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            {user ? (
                                <Link
                                    href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                                    className="w-full py-2.5 bg-[#0b1c30] text-white text-center font-bold rounded-xl text-xs"
                                >
                                    Go to Workspace
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="w-full py-2.5 bg-slate-100 text-slate-800 text-center font-bold rounded-xl text-xs"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="w-full py-2.5 bg-[#0b1c30] text-white text-center font-bold rounded-xl text-xs"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 pt-28 pb-16 px-6 max-w-7xl w-full mx-auto relative z-10">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200/80 py-10 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} PlayZa &bull; Getafe Sports Facility Management System. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/terms-of-service" className="hover:text-[#0077CC] transition-colors">Terms of Service</Link>
                        <Link href="/privacy-policy" className="hover:text-[#0077CC] transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
