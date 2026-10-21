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
        organization_or_school: '',
        contact_person: '',
        contact_number: '',
    });

    const activeFac = facilities.find(f => String(f.id) === String(data.facility_id)) || facilities[0] || null;
    const openH = parseInt((activeFac?.opening_time || '08:00').split(':')[0], 10);
    const closeH = parseInt((activeFac?.closing_time || '22:00').split(':')[0], 10);

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
                                            <div className="font-bold text-[#0b1c30]">{res.event_type || res.eventType || res.custom_event_name || '--'}</div>
                                            {res.organization_or_school && (
                                                <div className="text-[11px] text-indigo-700 font-bold mt-0.5 flex items-center gap-1.5">
                                                    <svg className="w-3 h-3 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span>{res.organization_or_school}</span>
                                                </div>
                                            )}
                                            {res.contact_person && (
                                                <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                                                    <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>{res.contact_person} {res.contact_number ? `• ${res.contact_number}` : ''}</span>
                                                </div>
                                            )}
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

                            {/* Organization / School and Contact Details */}
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Organization / School Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.organization_or_school}
                                        onChange={(e) => setData('organization_or_school', e.target.value)}
                                        placeholder="e.g. Getafe National High School / Barangay Youth"
                                        className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                                    />
                                    {errors.organization_or_school && <div className="text-xs text-rose-500 mt-1">{errors.organization_or_school}</div>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Contact Person
                                        </label>
                                        <input
                                            type="text"
                                            value={data.contact_person}
                                            onChange={(e) => setData('contact_person', e.target.value)}
                                            placeholder="e.g. Coach Juan Dela Cruz"
                                            className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                                        />
                                        {errors.contact_person && <div className="text-xs text-rose-500 mt-1">{errors.contact_person}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Contact Number
                                        </label>
                                        <input
                                            type="text"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            placeholder="e.g. 0912-345-6789"
                                            className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                                        />
                                        {errors.contact_number && <div className="text-xs text-rose-500 mt-1">{errors.contact_number}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Start Time (Open: {activeFac?.opening_time || '08:00'})
                                    </label>
                                    <select
                                        value={data.start_time}
                                        onChange={(e) => handleTimeChange(e.target.value, data.end_time)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm bg-white font-semibold"
                                        required
                                    >
                                        {Array.from({ length: Math.max(1, closeH - openH) }, (_, i) => openH + i).map(h => {
                                            const timeStr = `${String(h).padStart(2, '0')}:00`;
                                            const h12 = h % 12 || 12;
                                            const sfx = h < 12 ? 'AM' : 'PM';
                                            return (
                                                <option key={timeStr} value={timeStr}>
                                                    {h12}:00 {sfx}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {errors.start_time && <div className="text-xs text-rose-500 mt-1">{errors.start_time}</div>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        End Time (Close: {activeFac?.closing_time || '22:00'})
                                    </label>
                                    <select
                                        value={data.end_time}
                                        onChange={(e) => handleTimeChange(data.start_time, e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm bg-white font-semibold"
                                        required
                                    >
                                        {Array.from({ length: Math.max(1, closeH - openH) }, (_, i) => openH + 1 + i).map(h => {
                                            const timeStr = `${String(h).padStart(2, '0')}:00`;
                                            const startH = parseInt(data.start_time.split(':')[0], 10) || openH;
                                            const startH12 = startH % 12 || 12;
                                            const endH12 = h % 12 || 12;
                                            const sfx = h < 12 ? 'AM' : 'PM';
                                            const startSfx = startH < 12 ? 'AM' : 'PM';
                                            const label = startSfx === sfx ? `${startH12} - ${endH12} ${sfx}` : `${startH12} ${startSfx} - ${endH12} ${sfx}`;
                                            return (
                                                <option key={timeStr} value={timeStr}>
                                                    {label} ({h - startH} hr{h - startH > 1 ? 's' : ''})
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {errors.end_time && <div className="text-xs text-rose-500 mt-1">{errors.end_time}</div>}
                                </div>
                            </div>

                            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Admin Tournament / Intrams events bypass regular facility max hours limits.</span>
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
