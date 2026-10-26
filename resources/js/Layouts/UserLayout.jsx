import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Toast from '@/Components/Toast';

export default function UserLayout({ children, title, onOpenAvailabilityModal }) {
    const { auth, flash = {} } = usePage().props;
    const user = auth?.user || { id: 0, name: 'Guest User', email: 'user@playza.com', role: 'user' };
    const unreadCount = auth?.unreadNotificationsCount ?? 0;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    // Click outside listener for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const currentPath = window.location.pathname;

    const menuGroups = [
        {
            title: 'MAIN MENU',
            items: [
                {
                    name: 'Dashboard',
                    href: '/dashboard',
                    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                },
                {
                    name: 'Facilities & Courts',
                    href: '/facilities',
                    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                },
                {
                    name: 'My Reservations',
                    href: '/my-reservations',
                    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                },
            ]
        },
        {
            title: 'ACCOUNT & SUPPORT',
            items: [
                {
                    name: 'Notifications',
                    href: '/notifications',
                    badge: unreadCount > 0 ? unreadCount : null,
                    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                },
                {
                    name: 'Profile Settings',
                    href: '/profile',
                    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                }
            ]
        }
    ];

    // User avatar initials
    const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row font-sans">
            {title && <Head title={`${title} - PlayZa`} />}

            {/* Sidebar */}
            <aside className={`w-full md:w-72 bg-slate-950 text-slate-300 flex flex-col fixed md:sticky top-0 h-[calc(100vh-65px)] md:h-screen z-40 transition-transform duration-300 md:translate-x-0 border-r border-slate-800 shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {/* Brand Logo Section */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800 bg-slate-950/90">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <img 
                            src="/images/playza_horizontal.png" 
                            alt="PlayZa Logo" 
                            className="h-10 object-contain drop-shadow-md brightness-0 invert"
                        />
                    </Link>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-1 text-slate-400 hover:text-white"
                        aria-label="Close menu"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 flex flex-col justify-between">
                    <div className="space-y-6">
                        {menuGroups.map((group) => (
                            <div key={group.title} className="space-y-2">
                                <h3 className="px-3 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                                    {group.title}
                                </h3>
                                <ul className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = currentPath === item.href || (item.href === '/facilities' && currentPath === '/user/facilities');
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                                        isActive
                                                            ? 'bg-[#0077CC]/20 text-white shadow-inner ring-1 ring-[#0077CC]/40 border-l-4 border-[#0077CC]'
                                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                                    }`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <svg className={`h-5 w-5 ${isActive ? 'text-[#add911]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                                        </svg>
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {item.badge && (
                                                        <span className="h-5 w-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Footer: Quick Action & Logout */}
                    <div className="space-y-3 pt-6 border-t border-slate-700/30">
                        {onOpenAvailabilityModal && (
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    onOpenAvailabilityModal();
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-[#add911] hover:bg-[#bce420] text-[#0b1c30] transition-all shadow-md active:scale-95"
                            >
                                <svg className="h-4 w-4 text-[#0b1c30]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Book Facility Slot
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150 text-left cursor-pointer"
                        >
                            <svg className="h-5 w-5 text-slate-400 group-hover:text-rose-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Workspace Area */}
            <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
                
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
                    {/* Header Left: Search Bar / Mobile Toggle */}
                    <div className="flex items-center gap-4 flex-1">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg"
                            aria-label="Open Navigation Menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <div className="relative max-w-xs w-full hidden sm:block">
                            <input
                                type="text"
                                placeholder="Search facilities, bookings..."
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0077CC] focus:ring-1 focus:ring-[#0077CC] focus:outline-none transition-all"
                            />
                            <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Header Right: Notifications & User Profile Dropdowns */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Notification Bell Dropdown */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="p-2 text-slate-400 hover:text-[#0077CC] rounded-full hover:bg-slate-100 relative focus:outline-none transition-colors"
                                aria-label="Notifications"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[8px] flex items-center justify-center border border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-3.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-3">
                                    <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                                        <div className="flex items-center gap-3">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={() => router.post('/notifications/read-all', {}, { preserveScroll: true })}
                                                    className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                            <Link 
                                                href="/notifications" 
                                                onClick={() => setIsNotificationOpen(false)}
                                                className="text-[10px] text-[#0077CC] hover:underline font-bold"
                                            >
                                                View all
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="p-2 text-center text-xs text-slate-500">
                                        {unreadCount > 0 ? (
                                            <Link 
                                                href="/notifications" 
                                                onClick={() => setIsNotificationOpen(false)}
                                                className="block py-2 text-[#0077CC] font-bold hover:underline"
                                            >
                                                You have {unreadCount} unread update(s). Click to view.
                                            </Link>
                                        ) : (
                                            <p className="py-3 text-slate-400">All caught up! No unread notifications.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 focus:outline-none text-left px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <div className="hidden sm:block text-right">
                                    <span className="block text-sm font-semibold text-slate-900 leading-none">{user.name}</span>
                                    <span className="block text-[10px] text-slate-500 uppercase font-extrabold tracking-wider mt-1">{user.role || 'Member'}</span>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0b1c30] to-[#0077CC] flex items-center justify-center font-black text-sm text-white border border-slate-200 shadow-sm shrink-0">
                                    {userInitials}
                                </div>
                                <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-sm">
                                    <div className="px-4 py-2.5 border-b border-slate-100">
                                        <span className="block text-sm font-semibold text-slate-800 leading-none">{user.name}</span>
                                        <span className="block text-[11px] text-slate-500 mt-1 truncate">{user.email}</span>
                                    </div>
                                    <div className="p-1 space-y-0.5">
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
                                        >
                                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/my-reservations"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
                                        >
                                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            My Reservations
                                        </Link>
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
                                        >
                                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Profile Settings
                                        </Link>
                                    </div>
                                    <div className="border-t border-slate-100 p-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-left transition-colors font-semibold"
                                        >
                                            <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
                    {children}
                </main>
            </div>
            <Toast />
        </div>
    );
}
