import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Reports({ 
    stats = {}, 
    reservationsList = [],
    usersList = [],
    facilitiesList = [],
    schedulesList = []
}) {
    const [activeTab, setActiveTab] = useState('reservations');

    const exportToCSV = (type) => {
        window.location.href = `/admin/reports/export-csv?type=${type}`;
    };

    const exportToPDF = (type) => {
        window.open(`/admin/reports/export-pdf?type=${type}`, '_blank');
    };

    return (
        <AdminLayout title="System Reports">
            <Head title="System Reports - PlayZa" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-title font-black text-[#0b1c30]">System Activity & Analytics Reports</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Export filtered CSV spreadsheets and official PDF document summaries.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200 lg:col-span-1 h-fit space-y-2 bg-white shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-3 mb-3">Select Report</h3>
                        {[
                            { id: 'reservations', label: 'Reservations Report' },
                            { id: 'users', label: 'User Activity Report' },
                            { id: 'facilities', label: 'Facility Usage Report' },
                            { id: 'schedules', label: 'Schedule & Maintenance' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl font-extrabold text-xs transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-[#0b1c30] text-white shadow-sm'
                                        : 'text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Stats Header Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                                <div className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">Total Users</div>
                                <div className="text-2xl font-black text-[#0b1c30] font-title mt-1">{stats.totalUsers || 0}</div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                                <div className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">Active Facilities</div>
                                <div className="text-2xl font-black text-[#0077CC] font-title mt-1">{stats.activeFacilities || 0}</div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                                <div className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">Total Bookings</div>
                                <div className="text-2xl font-black text-emerald-700 font-title mt-1">{stats.totalReservations || 0}</div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                                <div className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">Pending Bookings</div>
                                <div className="text-2xl font-black text-amber-600 font-title mt-1">{stats.pendingReservations || 0}</div>
                            </div>
                        </div>

                        {/* Report Table & Export Buttons */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h3 className="text-base font-title font-black text-[#0b1c30] capitalize">
                                    {activeTab} Summary & Activity Log
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => exportToCSV(activeTab)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                                    >
                                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export CSV
                                    </button>
                                    <button
                                        onClick={() => exportToPDF(activeTab)}
                                        className="px-4 py-2 bg-[#0b1c30] hover:bg-[#132c4a] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        Export PDF <span className="text-[#add911]">→</span>
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                {activeTab === 'reservations' && (
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                                                <th className="py-3 px-4">User</th>
                                                <th className="py-3 px-4">Facility</th>
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4">Time Slot</th>
                                                <th className="py-3 px-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {reservationsList.length > 0 ? (
                                                reservationsList.map((res) => (
                                                    <tr key={res.id} className="hover:bg-slate-50/80">
                                                        <td className="py-3 px-4 font-bold text-[#0b1c30]">{res.user?.name || 'N/A'}</td>
                                                        <td className="py-3 px-4 font-semibold">{res.facility?.name || 'N/A'}</td>
                                                        <td className="py-3 px-4 font-mono text-slate-600">
                                                            {res.reservation_date}
                                                            {res.end_date && res.end_date !== res.reservation_date && ` → ${res.end_date}`}
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-slate-600">{res.start_time} - {res.end_time}</td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800">
                                                                {res.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-slate-400">No reservation records found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {activeTab === 'users' && (
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                                                <th className="py-3 px-4">Name</th>
                                                <th className="py-3 px-4">Email</th>
                                                <th className="py-3 px-4">Role</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4">Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {usersList.length > 0 ? (
                                                usersList.map((u) => (
                                                    <tr key={u.id} className="hover:bg-slate-50/80">
                                                        <td className="py-3 px-4 font-bold text-[#0b1c30]">{u.name}</td>
                                                        <td className="py-3 px-4 text-slate-600">{u.email}</td>
                                                        <td className="py-3 px-4 font-semibold capitalize">{u.role}</td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                                                                {u.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-slate-600">
                                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-slate-400">No user records found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {activeTab === 'facilities' && (
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                                                <th className="py-3 px-4">Facility Name</th>
                                                <th className="py-3 px-4">Type</th>
                                                <th className="py-3 px-4">Category</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4">Total Bookings</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {facilitiesList.length > 0 ? (
                                                facilitiesList.map((f) => (
                                                    <tr key={f.id} className="hover:bg-slate-50/80">
                                                        <td className="py-3 px-4 font-bold text-[#0b1c30]">{f.name}</td>
                                                        <td className="py-3 px-4 text-slate-600">{f.type}</td>
                                                        <td className="py-3 px-4 text-slate-600">{f.category}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${f.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                                                {f.active ? 'Active' : 'Disabled'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 font-bold text-[#0077CC]">{f.reservations_count}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-slate-400">No facility records found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {activeTab === 'schedules' && (
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                                                <th className="py-3 px-4">Facility</th>
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4">Time Slot</th>
                                                <th className="py-3 px-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {schedulesList.length > 0 ? (
                                                schedulesList.map((s) => (
                                                    <tr key={s.id} className="hover:bg-slate-50/80">
                                                        <td className="py-3 px-4 font-bold text-[#0b1c30]">{s.facility?.name || 'N/A'}</td>
                                                        <td className="py-3 px-4 font-mono text-slate-600">{s.date}</td>
                                                        <td className="py-3 px-4 font-mono text-slate-600">{s.start_time} - {s.end_time}</td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 capitalize">
                                                                {s.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="py-8 text-center text-slate-400">No schedule records found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
