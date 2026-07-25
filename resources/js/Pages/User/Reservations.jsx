import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

export default function Reservations({ reservations = [] }) {
    const [tab, setTab] = useState('active');

    const handleCancel = (id) => {
        if (confirm('Are you sure you want to cancel this reservation?')) {
            router.patch(route('user.reservations.cancel', id));
        }
    };

    const activeReservations = reservations.filter(r => r.status === 'pending' || r.status === 'approved');
    const pastReservations = reservations.filter(r => r.status === 'rejected' || r.status === 'cancelled');

    const displayedReservations = tab === 'active' ? activeReservations : pastReservations;

    return (
        <UserLayout title="My Reservations">
            <Head title="My Reservations - PlayZa" />

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
                    <button
                        onClick={() => setTab('active')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            tab === 'active'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        Active Bookings ({activeReservations.length})
                    </button>
                    <button
                        onClick={() => setTab('history')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            tab === 'history'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        History & Cancelled ({pastReservations.length})
                    </button>
                </div>

                {/* Grid of Reservation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedReservations.length > 0 ? (
                        displayedReservations.map((res) => (
                            <div key={res.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">{res.facility?.name || 'Facility'}</h3>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{res.reservation_date}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        res.status === 'approved' 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : res.status === 'pending'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-rose-100 text-rose-800'
                                    }`}>
                                        {res.status}
                                    </span>
                                </div>

                                <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                                    <div><span className="font-bold">Time Slot:</span> {res.start_time} - {res.end_time}</div>
                                    <div><span className="font-bold">Duration:</span> {res.duration_hours || 1} Hour(s)</div>
                                    {(res.event_type || res.custom_event_name) && (
                                        <div><span className="font-bold">Event Type:</span> {res.event_type || res.custom_event_name}</div>
                                    )}
                                </div>

                                {(res.status === 'pending' || res.status === 'approved') && (
                                    <button
                                        onClick={() => handleCancel(res.id)}
                                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold rounded-xl transition-colors"
                                    >
                                        Cancel Reservation
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                            No reservations in this section.
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
