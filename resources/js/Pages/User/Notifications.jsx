import React from 'react';
import { Head, router } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

export default function Notifications({ notifications = [] }) {
    const handleMarkAllRead = () => {
        router.post(route('user.notifications.read-all'));
    };

    return (
        <UserLayout title="In-App Alerts">
            <Head title="Notifications - PlayZa" />

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-base font-title font-bold text-slate-900">System Notifications</h2>
                        <p className="text-xs text-slate-500">Alerts regarding facility reservations and account approvals</p>
                    </div>
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                        >
                            Mark All Read
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`p-4 rounded-xl border flex items-start gap-4 transition-colors duration-150 shadow-sm ${
                                    !notif.is_read
                                        ? 'bg-emerald-50/50 border-emerald-200'
                                        : 'bg-slate-50 border-slate-200'
                                }`}
                            >
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                                    notif.type === 'approval'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : notif.type === 'rejection' || notif.type === 'cancellation'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-indigo-100 text-indigo-700'
                                }`}>
                                    {notif.type === 'approval' ? (
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-relaxed ${!notif.is_read ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>
                                        {notif.message}
                                    </p>
                                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                                        {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Recent'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-slate-400 text-sm">
                            No notifications yet.
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
