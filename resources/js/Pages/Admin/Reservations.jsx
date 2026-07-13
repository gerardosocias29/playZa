import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { getReservations, updateReservationStatus } from '@/mockData';

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        setReservations(getReservations());
    }, []);

    const refreshReservations = () => {
        setReservations(getReservations());
    };

    const handleApprove = (id) => {
        updateReservationStatus(id, 'approved');
        refreshReservations();
    };

    const handleReject = (id) => {
        updateReservationStatus(id, 'rejected');
        refreshReservations();
    };

    const handleCancel = (id) => {
        if (confirm('Are you sure you want to cancel this reservation? The user will be notified.')) {
            updateReservationStatus(id, 'cancelled');
            refreshReservations();
        }
    };

    const filteredReservations = reservations.filter(res => {
        const matchesFilter = filter === 'all' || res.status === filter;
        const matchesSearch = res.userName.toLowerCase().includes(search.toLowerCase()) || 
                             res.facilityName.toLowerCase().includes(search.toLowerCase());
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

                    <div className="flex flex-wrap gap-2">
                        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-150 border ${
                                    filter === status
                                        ? 'bg-indigo-600 text-white border-indigo-650 shadow-sm'
                                        : 'bg-slate-50 text-slate-650 hover:text-slate-905 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="pb-4">Reservation ID</th>
                                <th className="pb-4">User</th>
                                <th className="pb-4">Facility</th>
                                <th className="pb-4">Date / Time Slot</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReservations.length > 0 ? (
                                filteredReservations.map((res) => (
                                    <tr key={res.id} className="text-slate-700 text-sm hover:bg-slate-50 transition-colors">
                                        <td className="py-4 font-mono text-xs text-slate-500">#{res.id}</td>
                                        <td className="py-4 font-semibold text-slate-900">{res.userName}</td>
                                        <td className="py-4 text-slate-650">{res.facilityName}</td>
                                        <td className="py-4">
                                            <span className="block font-semibold text-slate-800">{res.date}</span>
                                            <span className="block text-xs text-indigo-600 font-semibold">{res.timeSlot}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                                res.status === 'approved'
                                                    ? 'bg-emerald-50 text-emerald-705 border-emerald-200'
                                                    : res.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-705 border-amber-200'
                                                    : res.status === 'rejected'
                                                    ? 'bg-rose-50 text-rose-705 border-rose-200'
                                                    : 'bg-slate-100 text-slate-500 border-slate-205'
                                            }`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {res.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(res.id)}
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(res.id)}
                                                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {(res.status === 'approved' || res.status === 'pending') && (
                                                    <button
                                                        onClick={() => handleCancel(res.id)}
                                                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold transition-colors"
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
                                        No reservations match the filters.
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
