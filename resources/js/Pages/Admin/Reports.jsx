import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Reports({ stats = {}, recentReservations = [] }) {
    const [activeTab, setActiveTab] = useState('reservations');

    const exportToCSV = (type) => {
        let headers = ['Reservation ID', 'User Name', 'Facility Name', 'Start Date', 'End Date', 'Time Slot', 'Status'];
        let rows = recentReservations.map(r => [
            r.id,
            r.user?.name || r.userName || '',
            r.facility?.name || r.facilityName || '',
            r.reservation_date || r.date || '',
            r.end_date || r.reservation_date || r.date || '',
            `${r.start_time} - ${r.end_time}`,
            r.status
        ]);
        let filename = `playza_${type}_report.csv`;

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout title="System Reports">
            <Head title="System Reports - PlayZa" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 lg:col-span-1 h-fit space-y-2 bg-white shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-3 mb-4">Select Report</h3>
                    {['reservations', 'users', 'facilities'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm capitalize transition-all ${
                                activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            {tab} Summary Report
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Stats Header Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="text-xs text-slate-500 font-bold uppercase">Total Users</div>
                            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="text-xs text-slate-500 font-bold uppercase">Active Facilities</div>
                            <div className="text-2xl font-black text-[#0077CC] mt-1">{stats.activeFacilities || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="text-xs text-slate-500 font-bold uppercase">Total Bookings</div>
                            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.totalReservations || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="text-xs text-slate-500 font-bold uppercase">Pending Bookings</div>
                            <div className="text-2xl font-black text-amber-500 mt-1">{stats.pendingReservations || 0}</div>
                        </div>
                    </div>

                    {/* Report Table & Export */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-bold text-slate-900 capitalize">
                                {activeTab} Activity Log
                            </h3>
                            <button
                                onClick={() => exportToCSV(activeTab)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                            >
                                Export CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                                        <th className="py-3 px-4">User</th>
                                        <th className="py-3 px-4">Facility</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Time Slot</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {recentReservations.length > 0 ? (
                                        recentReservations.map((res) => (
                                            <tr key={res.id} className="hover:bg-slate-50/80">
                                                <td className="py-3 px-4 font-bold text-slate-900">{res.user?.name || 'N/A'}</td>
                                                <td className="py-3 px-4">{res.facility?.name || 'N/A'}</td>
                                                <td className="py-3 px-4 font-mono text-xs">
                                                    {res.reservation_date}
                                                    {res.end_date && res.end_date !== res.reservation_date && ` → ${res.end_date}`}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-xs">{res.start_time} - {res.end_time}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                                                        {res.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-slate-400">No report records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
