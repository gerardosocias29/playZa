import React, { useEffect, useState, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { getCurrentUser, logoutUser, getNotifications } from '@/mockData';

export default function UserLayout({ children, title }) {
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [recentNotifications, setRecentNotifications] = useState([]);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'user') {
            router.visit('/login');
        } else {
            setUser(currentUser);
            // Get unread notifications
            const notifications = getNotifications(currentUser.id);
            setUnreadCount(notifications.filter(n => !n.is_read).length);
            setRecentNotifications(notifications.slice(0, 3));
        }

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
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-500 text-sm font-medium">Verifying session...</p>
                </div>
            </div>
        );
    }

    const menuGroups = [
        {
            title: 'MENU',
            items: [
                { name: 'Dashboard / Slots', href: '/user/dashboard', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { name: 'Facility Registry', href: '/user/facilities', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                { name: 'My Reservations', href: '/user/reservations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
            ]
        },
        {
            title: 'PERSONAL',
            items: [
                { name: 'Notifications', href: '/user/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge: unreadCount },
                { name: 'My Profile', href: '/user/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
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
                    <Link href="/user/dashboard" className="flex items-center gap-3">
                        <div className="bg-emerald-600 p-2.5 rounded-xl text-white font-bold tracking-wider text-base shadow-lg shadow-emerald-500/20">
                            PZ
                        </div>
                        <div>
                            <span className="font-title font-bold text-xl tracking-tight text-white block">PlayZa</span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 block -mt-1">Sports Facilities</span>
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
                                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                                                        isActive
                                                            ? 'bg-slate-700/40 text-white border-l-4 border-emerald-500'
                                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                                                    }`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <svg className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                                        </svg>
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {item.badge > 0 && (
                                                        <span className="bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0">
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
                                className="p-2 text-slate-400 hover:text-emerald-600 rounded-full hover:bg-slate-100 relative focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-4.5 w-4.5 rounded-full bg-rose-500 text-white font-extrabold text-[8px] flex items-center justify-center border border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-3.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-3">
                                    <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{unreadCount} Unread</span>
                                    </div>
                                    <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                        {recentNotifications.length > 0 ? (
                                            recentNotifications.map(notif => (
                                                <Link 
                                                    key={notif.id} 
                                                    href="/user/notifications"
                                                    onClick={() => setIsNotificationOpen(false)}
                                                    className="block px-4 py-3 hover:bg-slate-55 text-left transition-colors"
                                                >
                                                    <span className={`block text-xs ${!notif.is_read ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{notif.message}</span>
                                                    <span className="block text-[9px] text-slate-450 mt-1 font-semibold">{notif.created_at}</span>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="px-4 py-6 text-center text-xs text-slate-450">
                                                You have no alerts at this time.
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
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-605 flex items-center justify-center font-bold text-sm text-white border border-emerald-200 shadow-sm shrink-0">
                                    U
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
                                            href="/user/dashboard"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-slate-650 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            View Schedule
                                        </Link>
                                        <Link
                                            href="/user/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-slate-655 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            My Profile
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
