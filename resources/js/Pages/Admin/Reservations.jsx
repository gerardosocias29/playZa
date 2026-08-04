import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Reservations({ reservations = [], facilities = [] }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    const { data, setData, post, reset, errors, processing } = useForm({
        facility_id: facilities[0]?.id || '',
        reservation_date: '',
        end_date: '',
        start_time: '08:00',
        end_time: '17:00',
        duration_hours: 9,
        event_type: 'Tournament',
        custom_event_name: 'Intramurals',
    });

    const handleApprove = (id) => {
        router.patch(route('admin.reservations.approve', id));
    };

    const handleReject = (id) => {
        router.patch(route('admin.reservations.reject', id));
    };

    const handleCancel = (id) => {
        if (confirm('Are you sure you want to cancel this reservation? The user will be notified.')) {
            router.patch(route('admin.reservations.cancel', id));
        }
    };

    const handleNoShow = (id) => {
        if (confirm('Are you sure you want to flag this reservation as NO SHOW? The user will be notified.')) {
            router.patch(route('admin.reservations.no-show', id));
        }
    };

    const handleTimeChange = (start, end) => {
        setData(prev => {
            const startH = parseInt(start.split(':')[0] || '0', 10);
            const endH = parseInt(end.split(':')[0] || '0', 10);
            const duration = Math.max(1, endH - startH);
            return { ...prev, start_time: start, end_time: end, duration_hours: duration };
        });
    };

    const handleEventSubmit = (e) => {
        e.preventDefault();
        post(route('admin.reservations.store'), {
            onSuccess: () => {
                setIsEventModalOpen(false);
                reset();
            }
        });
    };

    const filteredReservations = reservations.filter(res => {
        const matchesFilter = filter === 'all' || res.status === filter;
        const userName = res.user?.name || res.userName || '';
        const facilityName = res.facility?.name || res.facilityName || '';
        const matchesSearch = userName.toLowerCase().includes(search.toLowerCase()) || 
                             facilityName.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <AdminLayout title="Reservation Management">
            <Head title="Reservations - PlayZa" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-title font-black text-[#0b1c30]">Reservation & Event Management</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Approve user requests, mark attendance/no-show, or reserve facilities for Tournaments & Intramurals.</p>
                    </div>
                    <button
                        onClick={() => {
                            if (facilities.length > 0 && !data.facility_id) {
                                setData('facility_id', facilities[0].id);
                            }
                            setIsEventModalOpen(true);
                        }}
                        className="px-5 py-3 bg-[#0b1c30] hover:bg-[#132c4a] text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-2 self-start sm:self-auto hover-scale"
                    >
                        <svg className="h-4 w-4 text-[#add911]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        + Reserve for Tournament / Intrams <span className="text-[#add911]">→</span>
                    </button>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Filters / Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Filter by facility or user name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-[#0077CC] text-slate-900 placeholder-slate-400 text-xs font-medium"
                            />
                            <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            {['all', 'pending', 'approved', 'completed', 'no_show', 'rejected', 'cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all ${
                                        filter === status
                                            ? 'bg-[#0b1c30] text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {status === 'no_show' ? 'No Show' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                                <th className="py-3 px-4">Facility</th>
                                <th className="py-3 px-4">User</th>
                                <th className="py-3 px-4">Event Type</th>
                                <th className="py-3 px-4">Date & Time</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredReservations.length > 0 ? (
                                filteredReservations.map((res) => (
                                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-4 font-bold text-[#0b1c30]">
                                            {res.facility?.name || res.facilityName}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>
                                                <div className="text-[#0b1c30] font-bold">{res.user?.name || res.userName}</div>
                                                <div className="text-[11px] text-slate-500">{res.user?.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-xs font-semibold">
                                            {res.event_type || res.eventType || res.custom_event_name || '--'}
                                        </td>
                                        <td className="py-4 px-4 text-xs font-mono">
                                            <div>
                                                {res.reservation_date || res.date}
                                                {res.end_date && res.end_date !== res.reservation_date && (
                                                    <span className="text-[#0077CC]"> → {res.end_date}</span>
                                                )}
                                            </div>
                                            <div className="text-slate-500">{res.start_time || res.timeSlot} - {res.end_time}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                                res.status === 'approved' || res.status === 'completed'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : res.status === 'pending'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : res.status === 'no_show'
                                                    ? 'bg-slate-800 text-slate-200'
                                                    : res.status === 'rejected'
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {res.status === 'completed' ? 'Done' : res.status === 'no_show' ? 'No Show' : res.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {res.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(res.id)}
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(res.id)}
                                                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {(res.status === 'approved' || res.status === 'completed') && (
                                                    <button
                                                        onClick={() => handleNoShow(res.id)}
                                                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        Mark No Show
                                                    </button>
                                                )}

                                                {res.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleCancel(res.id)}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-400 text-sm">
                                        No reservations found matching filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tournament / Custom Event Reservation Modal */}
            {isEventModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Reserve Facility for Event / Intrams
                                </h3>
                                <p className="text-xs text-slate-500">Sports Administrator & Admin Event Booking</p>
                            </div>
                            <button onClick={() => setIsEventModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleEventSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Select Facility</label>
                                <select
                                    value={data.facility_id}
                                    onChange={(e) => setData('facility_id', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-xl text-sm"
                                    required
                                >
                                    {facilities.map((fac) => (
                                        <option key={fac.id} value={fac.id}>
                                            {fac.name} ({fac.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Event Category</label>
                                    <select
                                        value={data.event_type}
                                        onChange={(e) => setData('event_type', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm"
                                    >
                                        <option value="Tournament">Tournament</option>
                                        <option value="Intramurals">Intramurals</option>
                                        <option value="Exhibition">Exhibition Match</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Event Title / Name</label>
                                    <input
                                        type="text"
                                        value={data.custom_event_name}
                                        onChange={(e) => setData('custom_event_name', e.target.value)}
                                        placeholder="e.g. CDG Intramurals 2026"
                                        className="w-full px-3 py-2 border rounded-xl text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={data.reservation_date}
                                        onChange={(e) => setData('reservation_date', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">End Date (Multi-Day)</label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        min={data.reservation_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        placeholder="Same as start date if 1 day"
                                        className="w-full px-3 py-2 border rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => handleTimeChange(e.target.value, data.end_time)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => handleTimeChange(data.start_time, e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
                                ⚡ Admin Tournament / Intrams events bypass regular facility max hours limits.
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsEventModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm"
                                >
                                    Confirm Event Reservation
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
