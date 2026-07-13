import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { getFacilities, getReservations, saveReservations } from '@/mockData';

export default function Schedules() {
    const [facilities, setFacilities] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [selectedFacilityId, setSelectedFacilityId] = useState('');
    const [selectedDate, setSelectedDate] = useState('2026-07-14');

    const timeSlots = [
        '08:00 - 10:00',
        '10:00 - 12:00',
        '12:00 - 14:00',
        '14:00 - 16:00',
        '16:00 - 18:00',
        '18:00 - 20:00',
        '20:00 - 22:00'
    ];

    const [blockedSlots, setBlockedSlots] = useState({});

    useEffect(() => {
        const facs = getFacilities();
        setFacilities(facs);
        if (facs.length > 0) {
            setSelectedFacilityId(facs[0].id.toString());
        }
        setReservations(getReservations());

        const storedBlocked = JSON.parse(localStorage.getItem('playza_blocked_slots')) || {};
        setBlockedSlots(storedBlocked);
    }, []);

    const handleBlockSlot = (slot) => {
        const key = `${selectedFacilityId}_${selectedDate}_${slot}`;
        
        const isReserved = reservations.some(r => 
            r.facilityId === parseInt(selectedFacilityId) && 
            r.date === selectedDate && 
            r.timeSlot === slot && 
            (r.status === 'approved' || r.status === 'pending')
        );

        if (isReserved) {
            alert('Cannot modify this slot: There is an active or pending reservation for this time. You must resolve or cancel the reservation first.');
            return;
        }

        const updated = {
            ...blockedSlots,
            [key]: !blockedSlots[key]
        };
        setBlockedSlots(updated);
        localStorage.setItem('playza_blocked_slots', JSON.stringify(updated));
    };

    const getSlotDetails = (slot) => {
        const activeRes = reservations.find(r => 
            r.facilityId === parseInt(selectedFacilityId) && 
            r.date === selectedDate && 
            r.timeSlot === slot && 
            r.status !== 'rejected' && 
            r.status !== 'cancelled'
        );

        const key = `${selectedFacilityId}_${selectedDate}_${slot}`;
        const isBlocked = blockedSlots[key];

        if (activeRes) {
            return {
                status: 'reserved',
                res: activeRes,
                label: `Booked by ${activeRes.userName} (${activeRes.status.toUpperCase()})`
            };
        }

        if (isBlocked) {
            return {
                status: 'maintenance',
                label: 'Maintenance / Closed by Admin'
            };
        }

        return {
            status: 'available',
            label: 'Open for Bookings'
        };
    };

    return (
        <AdminLayout title="Schedule Management">
            <Head title="Schedules - PlayZa" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Control Panel */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 lg:col-span-1 h-fit space-y-5 bg-white shadow-sm">
                    <h2 className="text-base font-title font-bold text-slate-900 mb-2">Schedule Filters</h2>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Facility</label>
                        <select
                            value={selectedFacilityId}
                            onChange={(e) => setSelectedFacilityId(e.target.value)}
                            className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
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
                            className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed font-semibold">
                        <span className="font-bold text-slate-800 uppercase block mb-1">Double Booking Safety</span>
                        The system automatically locks approved reservation slots. Admin can manually close open slots for maintenance/cleaning.
                    </div>
                </div>

                {/* Timeline Sheets */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 lg:col-span-3 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-title font-bold text-slate-900">Daily Booking Sheet</h2>
                            <p className="text-xs text-slate-500">Timeline grid of slots for {facilities.find(f => f.id.toString() === selectedFacilityId)?.name || 'Facility'} on {selectedDate}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {timeSlots.map((slot) => {
                            const details = getSlotDetails(slot);
                            
                            return (
                                <div key={slot} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-indigo-600 text-center shrink-0 shadow-sm">
                                            {slot}
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                                details.status === 'reserved'
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : details.status === 'maintenance'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${
                                                    details.status === 'reserved'
                                                        ? 'bg-rose-500'
                                                        : details.status === 'maintenance'
                                                        ? 'bg-amber-550'
                                                        : 'bg-emerald-500'
                                                }`}></span>
                                                {details.status === 'reserved' ? 'Booked' : details.status === 'maintenance' ? 'Closed' : 'Available'}
                                            </span>
                                            <span className="block text-sm text-slate-700 mt-1.5 font-bold">
                                                {details.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end shrink-0">
                                        {details.status !== 'reserved' ? (
                                            <button
                                                onClick={() => handleBlockSlot(slot)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 ${
                                                    details.status === 'maintenance'
                                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                                                        : 'bg-white hover:bg-slate-50 text-amber-700 border-slate-200 hover:border-slate-350 shadow-sm'
                                                }`}
                                            >
                                                {details.status === 'maintenance' ? 'Re-open Slot' : 'Block Slot'}
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold pr-2 py-1.5">
                                                Locked
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
