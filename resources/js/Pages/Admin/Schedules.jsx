import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Schedules({ facilities = [], schedules = [], reservations = [] }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateWholeDay, setIsCreateWholeDay] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [isEditWholeDay, setIsEditWholeDay] = useState(false);
    const [facilityFilter, setFacilityFilter] = useState('all');
    const [searchDate, setSearchDate] = useState('');

    // Form for creating a new schedule/maintenance block
    const { 
        data: createData, 
        setData: setCreateData, 
        post: postCreate, 
        processing: createProcessing, 
        errors: createErrors, 
        reset: resetCreate 
    } = useForm({
        facility_id: facilities[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '12:00',
        status: 'maintenance',
    });

    // Form for editing an existing schedule block
    const { 
        data: editData, 
        setData: setEditData, 
        put: putEdit, 
        processing: editProcessing, 
        errors: editErrors, 
        reset: resetEdit 
    } = useForm({
        facility_id: '',
        date: '',
        start_time: '08:00',
        end_time: '10:00',
        status: 'maintenance',
    });

    const handleCreateSchedule = (e) => {
        e.preventDefault();
        postCreate(route('admin.schedules.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetCreate();
            },
        });
    };

    const handleDeleteSchedule = (id) => {
        if (confirm('Are you sure you want to remove this schedule slot?')) {
            router.delete(route('admin.schedules.destroy', id));
        }
    };

    const handleOpenEditModal = (sch) => {
        setEditingSchedule(sch);
        const isWhole = sch.start_time === '00:00' && (sch.end_time === '23:59' || sch.end_time === '24:00');
        setIsEditWholeDay(isWhole);
        setEditData({
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

        putEdit(route('admin.schedules.update', editingSchedule.id), {
            onSuccess: () => {
                setEditingSchedule(null);
                resetEdit();
            },
        });
    };

    const filteredSchedules = schedules.filter(sch => {
        const matchesFacility = facilityFilter === 'all' || String(sch.facility_id) === String(facilityFilter);
        const matchesDate = !searchDate || sch.date.includes(searchDate);
        return matchesFacility && matchesDate;
    });

    return (
        <AdminLayout title="Schedule & Availability Management">
            <Head title="Schedule Management - PlayZa" />

            <div className="space-y-6">
                {/* Header with Title and Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-title font-black text-[#0b1c30]">Schedule & Maintenance Management</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Block court availability for maintenance, repairs, or manage existing schedule rules.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            resetCreate();
                            setIsCreateWholeDay(false);
                            setIsCreateModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0077CC] hover:bg-[#005fa3] text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Block Facility / Add Schedule
                    </button>
                </div>

                {/* Maintenance & Blocked Slots Table Card */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="font-title font-black text-[#0b1c30] text-base">Configured Maintenance & Blocked Slots</h3>
                        
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={facilityFilter}
                                onChange={(e) => setFacilityFilter(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0b1c30]"
                            >
                                <option value="all">All Facilities</option>
                                {facilities.map((fac) => (
                                    <option key={fac.id} value={fac.id}>{fac.name}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0b1c30]"
                                placeholder="Filter date..."
                            />
                            {searchDate && (
                                <button
                                    onClick={() => setSearchDate('')}
                                    className="text-xs text-slate-400 hover:text-slate-600 px-1"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    
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
                                {filteredSchedules.length > 0 ? (
                                    filteredSchedules.map((sch) => (
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
                                                        title="Delete schedule block"
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
                                        <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                                            {schedules.length === 0 
                                                ? 'No maintenance or custom schedule blocks created yet. Click "+ Block Facility / Add Schedule" above to add one.'
                                                : 'No schedule blocks match the selected filters.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Schedule Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full px-6 pt-5 pb-6 shadow-xl space-y-5">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <h3 className="text-base font-title font-black text-[#0b1c30]">Block Facility Time Slot</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Set maintenance or block hours for a facility.</p>
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <form onSubmit={handleCreateSchedule} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Facility</label>
                                    <select
                                        value={createData.facility_id}
                                        onChange={(e) => setCreateData('facility_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                        required
                                    >
                                        {facilities.map((fac) => (
                                            <option key={fac.id} value={fac.id}>{fac.name} ({fac.type})</option>
                                        ))}
                                    </select>
                                    {createErrors.facility_id && <p className="text-rose-500 text-[11px] mt-1">{createErrors.facility_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={createData.date}
                                        onChange={(e) => setCreateData('date', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                        required
                                    />
                                    {createErrors.date && <p className="text-rose-500 text-[11px] mt-1">{createErrors.date}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Start Time</label>
                                            <label className="inline-flex items-center gap-1 cursor-pointer text-[11px] font-bold text-[#0077CC] hover:text-[#005fa3] select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={isCreateWholeDay}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setIsCreateWholeDay(checked);
                                                        if (checked) {
                                                            setCreateData((prev) => ({ ...prev, start_time: '00:00', end_time: '23:59' }));
                                                        } else {
                                                            setCreateData((prev) => ({ ...prev, start_time: '08:00', end_time: '12:00' }));
                                                        }
                                                    }}
                                                    className="rounded text-[#0077CC] focus:ring-[#0077CC] h-3.5 w-3.5 border-slate-300"
                                                />
                                                <span>Whole Day</span>
                                            </label>
                                        </div>
                                        <input
                                            type="time"
                                            value={createData.start_time}
                                            disabled={isCreateWholeDay}
                                            onChange={(e) => setCreateData('start_time', e.target.value)}
                                            className={`w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium ${
                                                isCreateWholeDay ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                                            }`}
                                            required
                                        />
                                        {createErrors.start_time && <p className="text-rose-500 text-[11px] mt-1">{createErrors.start_time}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={createData.end_time}
                                            disabled={isCreateWholeDay}
                                            onChange={(e) => setCreateData('end_time', e.target.value)}
                                            className={`w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium ${
                                                isCreateWholeDay ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                                            }`}
                                            required
                                        />
                                        {createErrors.end_time && <p className="text-rose-500 text-[11px] mt-1">{createErrors.end_time}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status Type</label>
                                    <select
                                        value={createData.status}
                                        onChange={(e) => setCreateData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                    >
                                        <option value="maintenance">Maintenance</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                    {createErrors.status && <p className="text-rose-500 text-[11px] mt-1">{createErrors.status}</p>}
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createProcessing}
                                        className="px-5 py-2 bg-[#0077CC] hover:bg-[#005fa3] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                                    >
                                        Confirm Block Slot
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Schedule Modal */}
                {editingSchedule && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full px-6 pt-5 pb-6 shadow-xl space-y-5">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <h3 className="text-base font-title font-black text-[#0b1c30]">Edit Schedule Block</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Update blocked hours or status.</p>
                                </div>
                                <button onClick={() => setEditingSchedule(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <form onSubmit={handleUpdateSchedule} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Facility</label>
                                    <select
                                        value={editData.facility_id}
                                        onChange={(e) => setEditData('facility_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                        required
                                    >
                                        {facilities.map((fac) => (
                                            <option key={fac.id} value={fac.id}>{fac.name}</option>
                                        ))}
                                    </select>
                                    {editErrors.facility_id && <p className="text-rose-500 text-[11px] mt-1">{editErrors.facility_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={editData.date}
                                        onChange={(e) => setEditData('date', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                        required
                                    />
                                    {editErrors.date && <p className="text-rose-500 text-[11px] mt-1">{editErrors.date}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Start Time</label>
                                            <label className="inline-flex items-center gap-1 cursor-pointer text-[11px] font-bold text-[#0077CC] hover:text-[#005fa3] select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={isEditWholeDay}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setIsEditWholeDay(checked);
                                                        if (checked) {
                                                            setEditData((prev) => ({ ...prev, start_time: '00:00', end_time: '23:59' }));
                                                        } else {
                                                            setEditData((prev) => ({ ...prev, start_time: '08:00', end_time: '10:00' }));
                                                        }
                                                    }}
                                                    className="rounded text-[#0077CC] focus:ring-[#0077CC] h-3.5 w-3.5 border-slate-300"
                                                />
                                                <span>Whole Day</span>
                                            </label>
                                        </div>
                                        <input
                                            type="time"
                                            value={editData.start_time}
                                            disabled={isEditWholeDay}
                                            onChange={(e) => setEditData('start_time', e.target.value)}
                                            className={`w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium ${
                                                isEditWholeDay ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                                            }`}
                                            required
                                        />
                                        {editErrors.start_time && <p className="text-rose-500 text-[11px] mt-1">{editErrors.start_time}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={editData.end_time}
                                            disabled={isEditWholeDay}
                                            onChange={(e) => setEditData('end_time', e.target.value)}
                                            className={`w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium ${
                                                isEditWholeDay ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                                            }`}
                                            required
                                        />
                                        {editErrors.end_time && <p className="text-rose-500 text-[11px] mt-1">{editErrors.end_time}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status Type</label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                    >
                                        <option value="maintenance">Maintenance</option>
                                        <option value="blocked">Blocked</option>
                                        <option value="available">Available</option>
                                    </select>
                                    {editErrors.status && <p className="text-rose-500 text-[11px] mt-1">{editErrors.status}</p>}
                                </div>

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
                                        disabled={editProcessing}
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
