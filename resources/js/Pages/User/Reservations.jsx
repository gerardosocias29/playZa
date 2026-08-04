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

    const todayStr = new Date().toISOString().split('T')[0];

    // Helper to check if a booking date is strictly in the past
    const isPastBooking = (res) => {
        if (res.status === 'completed' || res.status === 'no_show') return true;
        const checkDate = res.end_date || res.reservation_date;
        return checkDate < todayStr;
    };

    const activeReservations = reservations.filter(r => {
        if (r.status === 'rejected' || r.status === 'cancelled' || r.status === 'no_show' || r.status === 'completed') {
            return false;
        }
        if (r.status === 'approved' && isPastBooking(r)) {
            return false;
        }
        return true;
    });

    const pastReservations = reservations.filter(r => {
        if (r.status === 'rejected' || r.status === 'cancelled' || r.status === 'no_show' || r.status === 'completed') {
            return true;
        }
        if (r.status === 'approved' && isPastBooking(r)) {
            return true;
        }
        return false;
    });

    const displayedReservations = tab === 'active' ? activeReservations : pastReservations;

    const getStatusDisplay = (res) => {
        if (res.status === 'completed' || (res.status === 'approved' && isPastBooking(res))) {
            return { label: 'Done', color: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
        }
        if (rStatus(res) === 'pending') {
            return { label: 'Pending Confirmation', color: 'bg-amber-100 text-amber-800 border border-amber-200' };
        }
        if (res.status === 'no_show') {
            return { label: 'No Show', color: 'bg-slate-800 text-slate-100 border border-slate-700' };
        }
        if (res.status === 'approved') {
            return { label: 'Approved', color: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
        }
        if (res.status === 'cancelled') {
            return { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border border-rose-200' };
        }
        return { label: res.status, color: 'bg-slate-100 text-slate-700 border border-slate-200' };
    };

    function rStatus(res) {
        return res.status;
    }

    return (
        <UserLayout title="My Reservations">
            <Head title="My Reservations - PlayZa" />

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-xl font-title font-black text-[#0b1c30]">My Booking Records</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Track active reservations and past booking history</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTab('active')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all border ${
                                tab === 'active'
                                    ? 'bg-[#0b1c30] text-white border-[#0b1c30] shadow-sm'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            Active Bookings ({activeReservations.length})
                        </button>
                        <button
                            onClick={() => setTab('history')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all border ${
                                tab === 'history'
                                    ? 'bg-[#0b1c30] text-white border-[#0b1c30] shadow-sm'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            History & Cancelled ({pastReservations.length})
                        </button>
                    </div>
                </div>

                {/* Grid of Reservation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {displayedReservations.length > 0 ? (
                        displayedReservations.map((res) => {
                            const statusInfo = getStatusDisplay(res);
                            const canCancel = (res.status === 'pending' || res.status === 'approved') && !isPastBooking(res);

                            return (
                                <div key={res.id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h3 className="font-title font-black text-[#0b1c30] text-base">{res.facility?.name || 'Facility'}</h3>
                                                <p className="text-xs text-[#0077CC] font-mono font-bold mt-0.5">
                                                    {res.reservation_date}
                                                    {res.end_date && res.end_date !== res.reservation_date && ` → ${res.end_date}`}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-1.5 font-medium">
                                            <div><span className="font-bold text-[#0b1c30]">Time Slot:</span> {res.start_time} - {res.end_time}</div>
                                            <div><span className="font-bold text-[#0b1c30]">Duration:</span> {res.duration_hours || 1} Hour(s)</div>
                                            {(res.event_type || res.custom_event_name) && (
                                                <div><span className="font-bold text-[#0b1c30]">Event Type:</span> {res.event_type || res.custom_event_name}</div>
                                            )}
                                        </div>
                                    </div>

                                    {canCancel && (
                                        <button
                                            onClick={() => handleCancel(res.id)}
                                            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold rounded-xl transition-colors"
                                        >
                                            Cancel Reservation
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-400 text-xs font-medium">
                            No reservations found in this section.
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
