import React, { useEffect, useState, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { getCurrentUser, logoutUser, getReservations } from '@/mockData';

export default function AdminLayout({ children, title }) {
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [recentAlerts, setRecentAlerts] = useState([]);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            router.visit('/login');
        } else {
            setUser(currentUser);
            // Grab some mock notifications to show in the dropdown
            const reservations = getReservations().filter(r => r.status === 'pending');
            setRecentAlerts(reservations.slice(0, 3));
        }

        // Close dropdowns on outside click
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
        logoutUser();
        router.visit('/login');
    };

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800 font-sans">
                <div className="text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-500 text-sm font-medium">Verifying administrator session...</p>
                </div>
            </div>
        );
    }

    const menuGroups = [
        {
            title: 'MENU',
            items: [
                { name: 'Dashboard', href: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { name: 'User Directory', href: '/admin/users', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm7-3a3 3 0 11-5.83 1c.42-.58.91-1.1 1.43-1.54M17 21v-2a4 4 0 00-3-3.87' },
                { name: 'Facility Registry', href: '/admin/facilities', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                { name: 'Reservations', href: '/admin/reservations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { name: 'Schedules', href: '/admin/schedules', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
            ]
        },
        {
            title: 'SUPPORT',
            items: [
                { name: 'Reports', href: '/admin/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
            ]
        }
    ];

    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
            
            {/* Sidebar (TailAdmin Styled) */}
            <aside className={`w-full md:w-64 bg-[#1c2434] text-slate-400 flex flex-col fixed md:sticky top-0 h-[calc(100vh-65px)] md:h-screen z-40 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {/* Brand Logo Section */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-slate-700/30">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2.5 rounded-xl text-white font-bold tracking-wider text-base shadow-lg shadow-indigo-500/20">
                            PZ
                        </div>
                        <div>
                            <span className="font-title font-bold text-xl tracking-tight text-white block">PlayZa</span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 block -mt-1">Admin Portal</span>
                        </div>
                    </Link>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-1 hover:text-white"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Navigation grouped like TailAdmin */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 flex flex-col justify-between">
                    <div className="space-y-6">
                        {menuGroups.map((group) => (
                            <div key={group.title} className="space-y-2">
                                <h3 className="px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    {group.title}
                                </h3>
                                <ul className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = currentPath === item.href;
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                                                        isActive
                                                            ? 'bg-slate-700/40 text-white border-l-4 border-indigo-500'
                                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                                                    }`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <svg className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                                    </svg>
                                                    {item.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <div className="pt-6 border-t border-slate-700/30">
                        <button
                            onClick={handleLogout}
                            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 transition-all duration-150 text-left cursor-pointer"
                        >
                            <svg className="h-5 w-5 text-slate-400 group-hover:text-rose-450 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Layout Area */}
            <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
                
                {/* Header (TailAdmin Styled with Search, Notifications and Profile Dropdowns) */}
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                    {/* Header Left: Search Bar Mockup */}
                    <div className="flex items-center gap-4 flex-1">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <div className="relative max-w-xs w-full hidden sm:block">
                            <input
                                type="text"
                                placeholder="Type to search..."
                                className="w-full pl-9 pr-4 py-1.5 bg-transparent border-0 text-slate-800 text-sm placeholder-slate-405 focus:ring-0 focus:outline-none"
                            />
                            <svg className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Header Right: Controls & Menus */}
                    <div className="flex items-center gap-4">
                        {/* Light/Dark Toggle Placeholder */}
                        <div className="p-2 text-slate-400 hover:text-slate-650 cursor-pointer hidden sm:block" title="Theme Switcher">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                        </div>

                        {/* Notification Bell Dropdown */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100 relative focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {recentAlerts.length > 0 && (
                                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[8px] flex items-center justify-center border border-white">
                                        {recentAlerts.length}
                                    </span>
                                )}
                            </button>

                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-3.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-3">
                                    <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">{recentAlerts.length} Action Required</span>
                                    </div>
                                    <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                        {recentAlerts.length > 0 ? (
                                            recentAlerts.map(alert => (
                                                <Link 
                                                    key={alert.id} 
                                                    href="/admin/reservations"
                                                    onClick={() => setIsNotificationOpen(false)}
                                                    className="block px-4 py-3 hover:bg-slate-50 text-left transition-colors"
                                                >
                                                    <span className="block text-xs font-semibold text-slate-800">Pending reservation request</span>
                                                    <span className="block text-[10px] text-slate-500 mt-1 truncate">{alert.userName} &bull; {alert.facilityName}</span>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="px-4 py-6 text-center text-xs text-slate-400">
                                                No pending bookings to approve.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2.5 focus:outline-none text-left"
                            >
                                <div className="hidden sm:block">
                                    <span className="block text-sm font-semibold text-slate-850 leading-none">{user.name}</span>
                                    <span className="block text-[10px] text-slate-450 uppercase font-extrabold tracking-wider mt-1">{user.role}</span>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white border border-indigo-200 shadow-sm shrink-0">
                                    A
                                </div>
                                <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-sm">
                                    <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                                        <span className="block text-sm font-semibold text-slate-800 leading-none">{user.name}</span>
                                        <span className="block text-[10px] text-slate-450 uppercase font-extrabold tracking-wider mt-1">{user.role}</span>
                                    </div>
                                    <div className="p-1">
                                        <Link
                                            href="/admin/dashboard"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/admin/reports"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            System Logs
                                        </Link>
                                    </div>
                                    <div className="border-t border-slate-100 p-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-left transition-colors font-semibold"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
                    <h2 className="text-xl font-title font-black text-slate-900 mb-6 tracking-tight hidden md:block">{title}</h2>
                    {children}
                </div>
            </div>
        </div>
    );
}
