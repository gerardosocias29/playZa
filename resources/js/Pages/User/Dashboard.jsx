import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import AvailabilityModal from '@/Components/AvailabilityModal';

export default function Dashboard({
    facilities = [],
    userReservations = [],
    upcomingReservations = [],
    notifications = [],
    reservations = [],
    schedules = [],
    stats = {}
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};

    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [selectedFacilityId, setSelectedFacilityId] = useState(facilities.length > 0 ? facilities[0].id : '');
    const [pendingBookingData, setPendingBookingData] = useState(null);

    React.useEffect(() => {
        try {
            const saved = sessionStorage.getItem('playza_pending_booking');
            if (saved) {
                const parsed = JSON.parse(saved);
                sessionStorage.removeItem('playza_pending_booking');
                if (parsed && parsed.facilityId) {
                    setPendingBookingData(parsed);
                    setSelectedFacilityId(parsed.facilityId);
                    setIsAvailabilityModalOpen(true);
                }
            }
        } catch (e) {
            sessionStorage.removeItem('playza_pending_booking');
        }
    }, []);

    const statCards = [
        {
            name: 'Active Bookings',
            value: stats.activeBookings ?? 0,
            desc: 'Confirmed upcoming reservations',
            color: 'text-emerald-700 bg-emerald-50/50 border-emerald-200',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            name: 'Pending Review',
            value: stats.pendingBookings ?? 0,
            desc: 'Awaiting admin approval',
            color: 'text-amber-600 bg-amber-50/50 border-amber-200',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            name: 'Completed Sessions',
            value: stats.completedBookings ?? 0,
            desc: 'Finished court bookings',
            color: 'text-[#0077CC] bg-blue-50/50 border-blue-200',
            icon: 'M5 13l4 4L19 7'
        },
        {
            name: 'Total Reservations',
            value: stats.totalBookings ?? userReservations.length,
            desc: 'Lifetime booking history',
            color: 'text-[#0b1c30] bg-slate-50/50 border-slate-200',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
        },
    ];

    const openModalForFacility = (facilityId) => {
        setSelectedFacilityId(facilityId);
        setIsAvailabilityModalOpen(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>;
            case 'pending':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
            case 'cancelled':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">Cancelled</span>;
            case 'completed':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Completed</span>;
            case 'no_show':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-100">No Show</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    return (
        <UserLayout 
            title="User Dashboard & Overview"
            onOpenAvailabilityModal={() => setIsAvailabilityModalOpen(true)}
        >
            <Head title="Dashboard - PlayZa" />

            {/* Welcome Action Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold backdrop-blur-xs border border-white/10">
                        <span className="h-2 w-2 rounded-full bg-[#add911] animate-pulse"></span>
                        Welcome back, {user.name}!
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-title font-black tracking-tight text-white">
                        Ready to book your next session?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium">
                        Browse active facilities, check real-time availability on the 24-hour scheduler, and confirm reservations instantly.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                        onClick={() => setIsAvailabilityModalOpen(true)}
                        className="px-6 py-3.5 bg-[#add911] hover:bg-[#bce420] text-[#0b1c30] font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Reserve A Facility <span className="text-[#0b1c30]">→</span>
                    </button>
                    <Link
                        href="/my-reservations"
                        className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-wider backdrop-blur-xs border border-white/20 transition-all"
                    >
                        My Bookings
                    </Link>
                </div>
            </div>

            {/* Stat Grid matching Admin layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => (
                    <div key={card.name} className={`p-6 rounded-2xl border ${card.color} transition-all duration-300 hover:scale-[1.01] shadow-xs bg-white`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="block text-xs uppercase tracking-wider font-extrabold text-slate-500">{card.name}</span>
                            <div className="p-2 rounded-xl bg-slate-50">
                                <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                                </svg>
                            </div>
                        </div>
                        <span className="block text-3xl font-black text-[#0b1c30] font-title tracking-tight mb-1">{card.value}</span>
                        <span className="block text-xs text-slate-500 font-medium">{card.desc}</span>
                    </div>
                ))}
            </div>

            {/* Main Section Grid: Upcoming Bookings + Available Facilities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Upcoming Reservations List (Span 2) */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 lg:col-span-2 bg-white shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="font-title font-black text-[#0b1c30] text-lg">Upcoming & Active Reservations</h3>
                            <p className="text-xs text-slate-500 font-medium">Your scheduled time slots at Getafe facilities</p>
                        </div>
                        <Link 
                            href="/my-reservations" 
                            className="text-xs font-bold text-[#0077CC] hover:underline flex items-center gap-1"
                        >
                            View All <span className="text-[#add911]">→</span>
                        </Link>
                    </div>

                    {upcomingReservations && upcomingReservations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="pb-3">Facility</th>
                                        <th className="pb-3">Date</th>
                                        <th className="pb-3">Time Window</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {upcomingReservations.slice(0, 5).map((res) => (
                                        <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 pr-2">
                                                <div className="font-bold text-slate-900">{res.facility?.name || 'Facility'}</div>
                                                <div className="text-[10px] text-slate-400">{res.event_type || 'Court Practice'}</div>
                                            </td>
                                            <td className="py-3.5 px-2 text-slate-700 whitespace-nowrap">
                                                {res.reservation_date}
                                                {res.end_date && res.end_date !== res.reservation_date && (
                                                    <span className="block text-[10px] text-slate-400">to {res.end_date}</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-2 text-slate-700 whitespace-nowrap">
                                                <span className="font-semibold">{res.start_time} - {res.end_time}</span>
                                                <span className="text-[10px] text-slate-400 block">({res.duration_hours || 1} hrs)</span>
                                            </td>
                                            <td className="py-3.5 px-2 whitespace-nowrap">
                                                {getStatusBadge(res.status)}
                                            </td>
                                            <td className="py-3.5 pl-2 text-right whitespace-nowrap">
                                                <Link
                                                    href="/my-reservations"
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-[#0b1c30] hover:text-white text-slate-700 font-bold rounded-lg transition-colors text-[11px]"
                                                >
                                                    Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-blue-50 text-[#0077CC] flex items-center justify-center mx-auto">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-sm text-slate-800">No active bookings scheduled</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                You don't have any upcoming reservations. Check available slots on our sports courts and reserve anytime.
                            </p>
                            <button
                                onClick={() => setIsAvailabilityModalOpen(true)}
                                className="px-5 py-2.5 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-2"
                            >
                                Check Available Facilities <span className="text-[#add911]">→</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Quick Facility Finder */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="font-title font-black text-[#0b1c30] text-base">Quick Facilities</h3>
                                <p className="text-[11px] text-slate-500 font-medium">Browse & reserve in 1 click</p>
                            </div>
                            <Link href="/facilities" className="text-xs font-bold text-[#0077CC] hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {facilities.slice(0, 4).map((f) => (
                                <div 
                                    key={f.id} 
                                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between gap-3 group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-11 w-11 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                            {f.image_url ? (
                                                <img src={f.image_url} alt={f.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <span className="text-[#add911]">PZ</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-[#0077CC] transition-colors">{f.name}</h4>
                                            <p className="text-[10px] text-slate-500 truncate">{f.location || 'Getafe Complex'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openModalForFacility(f.id)}
                                        className="px-3 py-1.5 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-bold rounded-lg text-[11px] shrink-0 transition-all active:scale-95"
                                    >
                                        Book
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Notifications Snippet */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-title font-black text-[#0b1c30] text-base">Recent Updates</h3>
                            <Link href="/notifications" className="text-xs font-bold text-[#0077CC] hover:underline">
                                History
                            </Link>
                        </div>

                        {notifications && notifications.length > 0 ? (
                            <div className="space-y-2.5">
                                {notifications.slice(0, 3).map((n) => (
                                    <div key={n.id} className={`p-3 rounded-xl border text-xs ${n.is_read ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-blue-50/60 border-blue-200 text-slate-900 font-semibold'}`}>
                                        <p className="line-clamp-2">{n.message}</p>
                                        <span className="text-[10px] text-slate-400 block mt-1">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-4">No recent notification alerts.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Interactive Availability & Booking Modal */}
            <AvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => {
                    setIsAvailabilityModalOpen(false);
                    setPendingBookingData(null);
                }}
                facilities={facilities}
                initialFacilityId={selectedFacilityId}
                initialBookingData={pendingBookingData}
                allReservations={reservations}
                reservations={reservations}
                allSchedules={schedules}
                schedules={schedules}
                user={user}
            />
        </UserLayout>
    );
}
