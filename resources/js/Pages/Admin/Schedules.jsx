import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TimelineScheduler from '@/Components/TimelineScheduler';

export default function Schedules({ facilities = [], schedules = [], reservations = [] }) {
    const [selectedFacilityId, setSelectedFacilityId] = useState(facilities.length > 0 ? facilities[0].id : '');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const selectedFacility = facilities.find(f => f.id === parseInt(selectedFacilityId)) || facilities[0];

    // Build blocked slots map from database schedules
    const blockedSlots = {};
    schedules.forEach(s => {
        if (s.status !== 'available') {
            const key = `${s.facility_id}_${s.date}_${s.start_time} - ${s.end_time}`;
            blockedSlots[key] = true;
        }
    });

    const handleBlockSlot = (slotData) => {
        router.post(route('admin.schedules.store'), {
            facility_id: selectedFacility.id,
            date: selectedDate,
            start_time: slotData.startTime,
            end_time: slotData.endTime,
            status: 'maintenance',
        });
    };

    return (
        <AdminLayout title="Schedule & Availability Management">
            <Head title="Schedule Management - PlayZa" />

            <div className="space-y-6">
                {/* Facility & Date Selector Bar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Facility</label>
                        <select
                            value={selectedFacilityId}
                            onChange={(e) => setSelectedFacilityId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900"
                        >
                            {facilities.map((fac) => (
                                <option key={fac.id} value={fac.id}>
                                    {fac.name} ({fac.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Target Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900"
                        />
                    </div>
                </div>

                {/* Interactive Scheduler with Drag & Drop */}
                {selectedFacility && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <TimelineScheduler
                            selectedFacility={selectedFacility}
                            selectedDate={selectedDate}
                            onDateChange={(newDate) => setSelectedDate(newDate)}
                            reservations={reservations}
                            blockedSlots={blockedSlots}
                            onContinueBooking={(slotData) => handleBlockSlot(slotData)}
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
