import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { getNotifications, markNotificationsAsRead, getCurrentUser } from '@/mockData';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            const list = getNotifications(currentUser.id);
            setNotifications([...list].sort((a, b) => b.id - a.id));
            markNotificationsAsRead(currentUser.id);
        }
    }, []);

    return (
        <UserLayout title="In-App Alerts">
            <Head title="Notifications - PlayZa" />

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-base font-title font-bold text-slate-900">System Notifications</h2>
                        <p className="text-xs text-slate-550">Alerts regarding facility reservations and account approvals</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`p-4 rounded-xl border flex items-start gap-4 transition-colors duration-150 shadow-sm ${
                                    !notif.is_read
                                        ? 'bg-emerald-50/50 border-emerald-250'
                                        : 'bg-slate-50 border-slate-150'
                                }`}
                            >
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                                    notif.type === 'approval'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-rose-105 text-rose-700'
                                }`}>
                                    {notif.type === 'approval' ? (
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-relaxed ${!notif.is_read ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>
                                        {notif.message}
                                    </p>
                                    <span className="block text-[10px] text-slate-450 mt-1.5 font-bold">
                                        Received: {notif.created_at}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <svg className="h-10 w-10 text-slate-350 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-sm text-slate-400">You have no notifications yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
