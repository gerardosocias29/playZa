import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Reservations({ reservations = [] }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

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

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Filters / Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Filter by facility or user name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 text-sm"
                        />
                        <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                                    filter === status
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold tracking-wider">
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
                                        <td className="py-4 px-4 font-semibold text-slate-900">
                                            {res.facility?.name || res.facilityName}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>
                                                <div className="text-slate-900 font-semibold">{res.user?.name || res.userName}</div>
                                                <div className="text-xs text-slate-500">{res.user?.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-xs">
                                            {res.event_type || res.eventType || res.custom_event_name || '--'}
                                        </td>
                                        <td className="py-4 px-4 text-xs font-mono">
                                            <div>{res.reservation_date || res.date}</div>
                                            <div className="text-slate-500">{res.start_time || res.timeSlot} - {res.end_time}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                res.status === 'approved'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : res.status === 'pending'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : res.status === 'rejected'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {res.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(res.id)}
                                                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(res.id)}
                                                            className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {res.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleCancel(res.id)}
                                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
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
        </AdminLayout>
    );
}
