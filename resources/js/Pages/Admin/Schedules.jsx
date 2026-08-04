import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TimelineScheduler from '@/Components/TimelineScheduler';

export default function Schedules({ facilities = [], schedules = [], reservations = [] }) {
    const [selectedFacilityId, setSelectedFacilityId] = useState(facilities.length > 0 ? facilities[0].id : '');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const selectedFacility = facilities.find(f => f.id === parseInt(selectedFacilityId)) || facilities[0];

    const { data, setData, put, processing, errors, reset } = useForm({
        facility_id: '',
        date: '',
        start_time: '08:00',
        end_time: '10:00',
        status: 'maintenance',
    });

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

    const handleDeleteSchedule = (id) => {
        if (confirm('Are you sure you want to remove this schedule slot?')) {
            router.delete(route('admin.schedules.destroy', id));
        }
    };

    const handleOpenEditModal = (sch) => {
        setEditingSchedule(sch);
        setData({
            facility_id: sch.facility_id,
            date: sch.date,
            start_time: sch.start_time,
            end_time: sch.end_time,
            status: sch.status,
        });
    };

    const handleUpdateSchedule = (e) => {
        e.preventDefault();
        if (!editingSchedule) return;

        put(route('admin.schedules.update', editingSchedule.id), {
            onSuccess: () => {
                setEditingSchedule(null);
                reset();
            },
        });
    };

    return (
        <AdminLayout title="Schedule & Availability Management">
            <Head title="Schedule Management - PlayZa" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-title font-black text-[#0b1c30]">Schedule & Maintenance Management</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Block court availability for maintenance, tournaments, or edit existing schedule rules.</p>
                </div>

                {/* Facility & Date Selector Bar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Facility</label>
                        <select
                            value={selectedFacilityId}
                            onChange={(e) => setSelectedFacilityId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#0b1c30]"
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
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#0b1c30]"
                        />
                    </div>
                </div>

                {/* Interactive Scheduler */}
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

                {/* Existing Schedule Overrides Table */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                    <h3 className="font-title font-black text-[#0b1c30] text-base">Configured Maintenance & Blocked Slots</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                                    <th className="py-3 px-4">Facility</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Time Slot</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {schedules.length > 0 ? (
                                    schedules.map((sch) => (
                                        <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4 font-bold text-[#0b1c30]">
                                                {sch.facility?.name || 'Facility'}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-600">
                                                {sch.date}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-600">
                                                {sch.start_time} - {sch.end_time}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold capitalize ${
                                                    sch.status === 'maintenance'
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                        : sch.status === 'blocked'
                                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                }`}>
                                                    {sch.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEditModal(sch)}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSchedule(sch.id)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-6 text-center text-slate-400 text-xs">
                                            No maintenance or custom schedule blocks created.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Schedule Modal */}
                {editingSchedule && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-base font-title font-black text-[#0b1c30]">Edit Schedule Block</h3>
                                <button onClick={() => setEditingSchedule(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <form onSubmit={handleUpdateSchedule} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Facility</label>
                                    <select
                                        value={data.facility_id}
                                        onChange={(e) => setData('facility_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                        required
                                    >
                                        {facilities.map((fac) => (
                                            <option key={fac.id} value={fac.id}>{fac.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status Type</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                    >
                                        <option value="maintenance">Maintenance</option>
                                        <option value="blocked">Blocked</option>
                                        <option value="available">Available</option>
                                    </select>
                                </div>

                                {errors.start_time && <p className="text-rose-500 text-[11px]">{errors.start_time}</p>}

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditingSchedule(null)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 bg-[#0b1c30] hover:bg-[#132c4a] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                                    >
                                        Save Changes <span className="text-[#add911]">→</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
