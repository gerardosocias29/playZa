import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { getReservations, updateReservationStatus, getCurrentUser } from '@/mockData';

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('active');

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            const all = getReservations();
            const filtered = all.filter(r => r.userId === currentUser.id);
            setReservations(filtered);
        }
    }, []);

    const handleCancel = (id) => {
        if (confirm('Are you sure you want to cancel this reservation?')) {
            updateReservationStatus(id, 'cancelled');
            
            const all = getReservations();
            const filtered = all.filter(r => r.userId === user.id);
            setReservations(filtered);
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
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-slate-50 text-slate-655 hover:text-slate-905 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        Active Bookings ({activeReservations.length})
                    </button>
                    <button
                        onClick={() => setTab('history')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            tab === 'history'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-slate-50 text-slate-655 hover:text-slate-905 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        Booking History ({pastReservations.length})
                    </button>
                </div>

                {/* Reservation List */}
                <div className="space-y-4">
                    {displayedReservations.length > 0 ? (
                        displayedReservations.map((res) => (
                            <div key={res.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-655 shrink-0 shadow-sm">
                                        {res.facilityName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900 text-sm">{res.facilityName}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border ${
                                                res.status === 'approved'
                                                    ? 'bg-emerald-50 text-emerald-705 border-emerald-200'
                                                    : res.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-705 border-amber-200'
                                                    : res.status === 'rejected'
                                                    ? 'bg-rose-50 text-rose-705 border-rose-200'
                                                    : 'bg-slate-100 text-slate-500 border-slate-205'
                                            }`}>
                                                {res.status}
                                            </span>
                                        </div>
                                        <span className="block text-xs text-slate-550 mt-1 font-medium">
                                            Reserved Session: {res.date} &bull; <span className="text-emerald-605 font-bold">{res.timeSlot}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end shrink-0">
                                    {(res.status === 'approved' || res.status === 'pending') && (
                                        <button
                                            onClick={() => handleCancel(res.id)}
                                            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-rose-600 rounded-lg text-xs font-bold transition-all shadow-sm"
                                        >
                                            Cancel Reservation
                                        </button>
                                    )}
                                    {res.status === 'cancelled' && (
                                        <span className="text-xs text-slate-450 italic pr-2 font-medium">
                                            Cancelled by you
                                        </span>
                                    )}
                                    {res.status === 'rejected' && (
                                        <span className="text-xs text-rose-600 pr-2 font-medium">
                                            Booking rejected by Admin
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <svg className="h-10 w-10 text-slate-350 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-slate-400">No reservations found in this section.</p>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
