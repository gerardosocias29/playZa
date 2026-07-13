import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { getFacilities, getReservations, addReservation, getCurrentUser } from '@/mockData';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [facilities, setFacilities] = useState([]);
    const [reservations, setReservations] = useState([]);
    
    // Reservation form state
    const [selectedFacilityId, setSelectedFacilityId] = useState('');
    const [selectedDate, setSelectedDate] = useState('2026-07-14');
    const [bookingSlot, setBookingSlot] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');

    const timeSlots = [
        '08:00 - 10:00',
        '10:00 - 12:00',
        '12:00 - 14:00',
        '14:00 - 16:00',
        '16:00 - 18:00',
        '18:00 - 20:00',
        '20:00 - 22:00'
    ];

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);

        const facs = getFacilities().filter(f => f.active);
        setFacilities(facs);
        if (facs.length > 0) {
            setSelectedFacilityId(facs[0].id.toString());
        }

        setReservations(getReservations());
    }, []);

    const handleSelectSlot = (slot, status) => {
        if (status !== 'available') return;
        setBookingSlot(slot);
        setBookingError('');
        setBookingSuccess('');
        setIsConfirmOpen(true);
    };

    const confirmBooking = (e) => {
        e.preventDefault();
        setBookingError('');
        setBookingSuccess('');

        const facility = facilities.find(f => f.id === parseInt(selectedFacilityId));
        if (!facility) return;

        const res = addReservation(
            user.id,
            user.name,
            selectedFacilityId,
            facility.name,
            selectedDate,
            bookingSlot
        );

        if (res.success) {
            setBookingSuccess(`Successfully booked! Your reservation is now pending Admin approval.`);
            setReservations(getReservations());
            setTimeout(() => {
                setIsConfirmOpen(false);
                setBookingSuccess('');
            }, 2000);
        } else {
            setBookingError(res.message);
        }
    };

    const getSlotStatus = (slot) => {
        const activeRes = reservations.find(r => 
            r.facilityId === parseInt(selectedFacilityId) && 
            r.date === selectedDate && 
            r.timeSlot === slot && 
            (r.status === 'approved' || r.status === 'pending')
        );

        const blockedSlots = JSON.parse(localStorage.getItem('playza_blocked_slots')) || {};
        const blockKey = `${selectedFacilityId}_${selectedDate}_${slot}`;

        if (activeRes) {
            return activeRes.userId === user?.id ? 'my-booking' : 'reserved';
        }

        if (blockedSlots[blockKey]) {
            return 'maintenance';
        }

        return 'available';
    };

    const activeFacility = facilities.find(f => f.id === parseInt(selectedFacilityId));

    return (
        <UserLayout title="Facility Scheduler">
            <Head title="Facility Booking - PlayZa" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Control Column */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 lg:col-span-1 h-fit space-y-5 bg-white shadow-sm">
                    <h2 className="text-base font-title font-bold text-slate-900 mb-2">Book a Session</h2>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Facility</label>
                        <select
                            value={selectedFacilityId}
                            onChange={(e) => setSelectedFacilityId(e.target.value)}
                            className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
                        >
                            {facilities.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
                        />
                    </div>

                    {activeFacility && (
                        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                            <span className="font-bold text-slate-800 uppercase block mb-1">Facility Details</span>
                            <p className="leading-relaxed">{activeFacility.description}</p>
                            <p className="text-emerald-600 font-bold">Max Capacity: {activeFacility.capacity} players</p>
                        </div>
                    )}
                </div>

                {/* Timeline Grid */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 lg:col-span-3 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-title font-bold text-slate-900">Select an Open Slot</h2>
                            <p className="text-xs text-slate-550">Timeline grid of slots for {activeFacility?.name} on {selectedDate}</p>
                        </div>
                    </div>

                    {/* Timeline Legend */}
                    <div className="flex flex-wrap gap-4 p-4 bg-slate-50 border border-slate-150 rounded-xl mb-6 text-xs text-slate-550 font-semibold shadow-inner">
                        <div className="flex items-center gap-1.5">
                            <span className="h-3.5 w-3.5 rounded bg-emerald-50 border border-emerald-200 inline-block"></span>
                            Available
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-3.5 w-3.5 rounded bg-rose-50 border border-rose-200 inline-block"></span>
                            Reserved
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-3.5 w-3.5 rounded bg-indigo-50 border border-indigo-200 inline-block"></span>
                            My Reservation
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-3.5 w-3.5 rounded bg-slate-100 border border-slate-205 inline-block"></span>
                            Blocked / Closed
                        </div>
                    </div>

                    <div className="space-y-4">
                        {timeSlots.map((slot) => {
                            const status = getSlotStatus(slot);
                            
                            return (
                                <button
                                    key={slot}
                                    disabled={status !== 'available'}
                                    onClick={() => handleSelectSlot(slot, status)}
                                    className={`w-full text-left p-4 rounded-xl flex items-center justify-between border transition-all duration-200 ${
                                        status === 'available'
                                            ? 'bg-slate-50/50 hover:bg-emerald-50/40 border-slate-200 hover:border-emerald-350 cursor-pointer shadow-sm'
                                            : status === 'my-booking'
                                            ? 'bg-indigo-50/60 border-indigo-200 cursor-not-allowed'
                                            : status === 'maintenance'
                                            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                                            : 'bg-rose-50/60 border-rose-200 opacity-60 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1.5 border rounded-lg text-xs font-mono font-bold shrink-0 shadow-sm ${
                                            status === 'available'
                                                ? 'bg-white border-slate-200 text-emerald-650'
                                                : status === 'my-booking'
                                                ? 'bg-white border-indigo-200 text-indigo-600'
                                                : 'bg-slate-100 border-slate-200 text-slate-450'
                                        }`}>
                                            {slot}
                                        </div>
                                        <span className={`text-sm font-semibold ${
                                            status === 'available'
                                                ? 'text-slate-800'
                                                : status === 'my-booking'
                                                ? 'text-indigo-705'
                                                : status === 'maintenance'
                                                ? 'text-slate-450'
                                                : 'text-slate-500'
                                        }`}>
                                            {status === 'available' 
                                                ? 'Click to Reserve' 
                                                : status === 'my-booking'
                                                ? 'Your Booking Session'
                                                : status === 'maintenance'
                                                ? 'Temporarily Closed'
                                                : 'Reserved by Another Member'}
                                        </span>
                                    </div>
                                    
                                    <div className="shrink-0 text-xs font-extrabold uppercase tracking-wider">
                                        {status === 'available' && <span className="text-emerald-600">Select</span>}
                                        {status === 'my-booking' && <span className="text-indigo-600">Booked</span>}
                                        {status === 'maintenance' && <span className="text-slate-450 font-normal">Closed</span>}
                                        {status === 'reserved' && <span className="text-rose-600">Locked</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Reservation Confirmation Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-6 bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-title font-bold text-lg text-slate-900">Confirm Reservation</h3>
                            <button 
                                onClick={() => setIsConfirmOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-905 rounded-lg hover:bg-slate-50"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {bookingError && (
                            <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                                {bookingError}
                            </div>
                        )}

                        {bookingSuccess && (
                            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                                {bookingSuccess}
                            </div>
                        )}

                        {!bookingSuccess && (
                            <form onSubmit={confirmBooking} className="space-y-4">
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-sm text-slate-700">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Facility:</span>
                                        <span className="font-semibold text-slate-900">{activeFacility?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Date:</span>
                                        <span className="font-semibold text-slate-900">{selectedDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Time Slot:</span>
                                        <span className="font-bold text-emerald-600 font-mono">{bookingSlot}</span>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-205">
                                    New reservations are submitted to the Administrator for approval. You will receive an in-app alert upon approval or rejection.
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmOpen(false)}
                                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-semibold text-slate-750 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-emerald-500/10"
                                    >
                                        Request Booking
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </UserLayout>
    );
}
