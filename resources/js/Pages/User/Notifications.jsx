import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

export default function Notifications({ notifications = [] }) {
    const [filter, setFilter] = useState('all');

    const handleMarkAllRead = () => {
        router.post(route('notifications.read-all'));
    };

    const handleMarkSingleRead = (id) => {
        router.patch(route('notifications.read', id));
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <UserLayout title="In-App Notifications & Alerts">
            <Head title="Notifications - PlayZa" />

            <div className="space-y-6">
                
                {/* Header Card */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                        <div>
                            <h2 className="text-xl font-title font-black text-[#0b1c30]">Notification Inbox</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                Real-time updates regarding your facility reservations, approvals, and reminders.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="px-4 py-2 bg-[#0b1c30] hover:bg-[#132c4a] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs"
                                >
                                    Mark All as Read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filter === 'all'
                                    ? 'bg-[#0b1c30] text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filter === 'unread'
                                    ? 'bg-[#0b1c30] text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-3">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notif) => {
                                const isUnread = !notif.is_read;
                                return (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => isUnread && handleMarkSingleRead(notif.id)}
                                        className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                                            isUnread
                                                ? 'bg-blue-50/50 border-blue-200 hover:border-blue-300 cursor-pointer'
                                                : 'bg-white border-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3.5 min-w-0">
                                            <svg className={`h-5 w-5 shrink-0 mt-0.5 ${isUnread ? 'text-[#0077CC]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            <div className="min-w-0 space-y-1">
                                                <p className={`text-xs sm:text-sm leading-relaxed ${isUnread ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>
                                                    {notif.message}
                                                </p>
                                                <span className="text-[10px] text-slate-400 font-mono block">
                                                    {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Just now'}
                                                </span>
                                            </div>
                                        </div>

                                        {isUnread && (
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#0077CC] shrink-0 mt-2" title="Unread"></span>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-16 text-center space-y-2">
                                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm">No notifications</h4>
                                <p className="text-xs text-slate-500">You don't have any alerts in this section.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
