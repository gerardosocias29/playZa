import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import AvailabilityModal from '@/Components/AvailabilityModal';

export default function Reservations({ reservations = [], facilities = [], blockedSchedules = [] }) {
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

    const handleCancel = (id) => {
        if (confirm('Are you sure you want to cancel this reservation request?')) {
            router.patch(route('reservations.cancel', id));
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const isPastBooking = (res) => {
        if (res.status === 'completed' || res.status === 'no_show') return true;
        const checkDate = res.end_date || res.reservation_date;
        return checkDate < todayStr;
    };

    const getStatusDisplay = (res) => {
        if (res.status === 'completed' || (res.status === 'approved' && isPastBooking(res))) {
            return { label: 'Done / Completed', color: 'bg-blue-100 text-blue-800 border border-blue-200' };
        }
        if (res.status === 'pending') {
            return { label: 'Pending Approval', color: 'bg-amber-100 text-amber-800 border border-amber-200' };
        }
        if (res.status === 'no_show') {
            return { label: 'No Show', color: 'bg-slate-800 text-slate-100 border border-slate-700' };
        }
        if (res.status === 'approved') {
            return { label: 'Approved & Active', color: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
        }
        if (res.status === 'cancelled') {
            return { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border border-rose-200' };
        }
        if (res.status === 'rejected') {
            return { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border border-rose-200' };
        }
        return { label: res.status, color: 'bg-slate-100 text-slate-700 border border-slate-200' };
    };

    const filteredReservations = reservations.filter((res) => {
        const facilityName = res.facility?.name || '';
        const eventName = res.event_type || res.custom_event_name || '';
        const dateStr = res.reservation_date || '';
        const matchesSearch = facilityName.toLowerCase().includes(search.toLowerCase()) ||
                              eventName.toLowerCase().includes(search.toLowerCase()) ||
                              dateStr.includes(search);

        if (!matchesSearch) return false;

        if (tab === 'active') {
            return res.status === 'approved' && !isPastBooking(res);
        }
        if (tab === 'pending') {
            return res.status === 'pending';
        }
        if (tab === 'completed') {
            return res.status === 'completed' || (res.status === 'approved' && isPastBooking(res));
        }
        if (tab === 'cancelled') {
            return res.status === 'cancelled' || res.status === 'rejected' || res.status === 'no_show';
        }
        return true;
    });

    const activeCount = reservations.filter(r => r.status === 'approved' && !isPastBooking(r)).length;
    const pendingCount = reservations.filter(r => r.status === 'pending').length;
    const completedCount = reservations.filter(r => r.status === 'completed' || (r.status === 'approved' && isPastBooking(r))).length;
    const cancelledCount = reservations.filter(r => r.status === 'cancelled' || r.status === 'rejected' || r.status === 'no_show').length;

    return (
        <UserLayout 
            title="My Reservations & Booking Records"
            onOpenAvailabilityModal={() => setIsAvailabilityModalOpen(true)}
        >
            <Head title="My Reservations - PlayZa" />

            <div className="space-y-6">
                
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-title font-black text-[#0b1c30]">Manage Your Bookings</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Track active reservations, inspect time slots, and check approval status.</p>
                    </div>
                    <button
                        onClick={() => setIsAvailabilityModalOpen(true)}
                        className="px-5 py-3 bg-[#0b1c30] hover:bg-[#132c4a] text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-2 self-start sm:self-auto hover-scale"
                    >
                        <svg className="h-4 w-4 text-[#add911]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Reservation <span className="text-[#add911]">→</span>
                    </button>
                </div>

                {/* Main Filter & Tabs Card */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-6">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by court name, event, or date..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:bg-white focus:border-[#0077CC] focus:ring-1 focus:ring-[#0077CC] focus:outline-none transition-all"
                            />
                            <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Status Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            <button
                                onClick={() => setTab('all')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    tab === 'all'
                                        ? 'bg-[#0b1c30] text-white shadow-xs'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                All ({reservations.length})
                            </button>
                            <button
                                onClick={() => setTab('active')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    tab === 'active'
                                        ? 'bg-[#0b1c30] text-white shadow-xs'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                Active ({activeCount})
                            </button>
                            <button
                                onClick={() => setTab('pending')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    tab === 'pending'
                                        ? 'bg-[#0b1c30] text-white shadow-xs'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                Pending ({pendingCount})
                            </button>
                            <button
                                onClick={() => setTab('completed')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    tab === 'completed'
                                        ? 'bg-[#0b1c30] text-white shadow-xs'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                Done ({completedCount})
                            </button>
                            <button
                                onClick={() => setTab('cancelled')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    tab === 'cancelled'
                                        ? 'bg-[#0b1c30] text-white shadow-xs'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                Cancelled ({cancelledCount})
                            </button>
                        </div>
                    </div>

                    {/* Reservation Cards List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredReservations.length > 0 ? (
                            filteredReservations.map((res) => {
                                const statusInfo = getStatusDisplay(res);
                                const canCancel = (res.status === 'pending' || res.status === 'approved') && !isPastBooking(res);

                                return (
                                    <div 
                                        key={res.id} 
                                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-4"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <span className="text-[10px] font-extrabold text-[#0077CC] uppercase tracking-wider block">
                                                        {res.facility?.type || 'Court Booking'}
                                                    </span>
                                                    <h3 className="font-title font-black text-[#0b1c30] text-lg">
                                                        {res.facility?.name || 'Facility'}
                                                    </h3>
                                                    <p className="text-xs text-slate-700 font-mono font-bold mt-0.5 flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>
                                                            {res.reservation_date}
                                                            {res.end_date && res.end_date !== res.reservation_date && ` to ${res.end_date}`}
                                                        </span>
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>

                                            <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2 font-medium">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-semibold">Time Window:</span>
                                                    <span className="font-bold text-[#0b1c30]">{res.start_time} - {res.end_time}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-semibold">Duration:</span>
                                                    <span className="font-bold text-[#0b1c30]">{res.duration_hours || 1} Hour(s)</span>
                                                </div>
                                                {(res.event_type || res.custom_event_name) && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500 font-semibold">Event Type:</span>
                                                        <span className="font-bold text-[#0077CC]">{res.event_type || res.custom_event_name}</span>
                                                    </div>
                                                )}
                                                {res.organization_or_school && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500 font-semibold">Organization / School:</span>
                                                        <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                            <span>{res.organization_or_school}</span>
                                                        </span>
                                                    </div>
                                                )}
                                                {res.contact_person && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500 font-semibold">Point Person:</span>
                                                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            <span>{res.contact_person} {res.contact_number ? `(${res.contact_number})` : ''}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {canCancel && (
                                            <div className="pt-2 border-t border-slate-100">
                                                <button
                                                    onClick={() => handleCancel(res.id)}
                                                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold rounded-xl transition-colors active:scale-98"
                                                >
                                                    Cancel Reservation Request
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-16 text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm">No reservations found</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    No booking records match the selected tab or search query.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                facilities={facilities}
                initialFacilityId={facilities[0]?.id || ''}
                allReservations={reservations}
                allSchedules={blockedSchedules}
            />
        </UserLayout>
    );
}
