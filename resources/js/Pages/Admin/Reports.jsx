import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { getUsers, getFacilities, getReservations } from '@/mockData';

export default function Reports() {
    const [activeTab, setActiveTab] = useState('reservations');
    
    // Data sources
    const [users, setUsers] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [reservations, setReservations] = useState([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        setUsers(getUsers());
        setFacilities(getFacilities());
        setReservations(getReservations());
    }, []);

    // CSV Exporter (Mock/Client-Side)
    const exportToCSV = (type) => {
        let headers = [];
        let rows = [];
        let filename = `playza_${type}_report.csv`;

        if (type === 'reservations') {
            headers = ['Reservation ID', 'User Name', 'Facility Name', 'Date', 'Time Slot', 'Status', 'Created At'];
            rows = reservations.map(r => [r.id, r.userName, r.facilityName, r.date, r.timeSlot, r.status, r.created_at]);
        } else if (type === 'users') {
            headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Joined Date'];
            rows = users.map(u => [u.id, u.name, u.email, u.role, u.status, u.joined]);
        } else {
            headers = ['Facility ID', 'Name', 'Max Capacity', 'Status', 'Description'];
            rows = facilities.map(f => [f.id, f.name, f.capacity, f.active ? 'Operational' : 'Maintenance', f.description]);
        }

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
                    {[
                        { id: 'reservations', name: 'Reservations Report', count: reservations.length },
                        { id: 'users', name: 'User Accounts Log', count: users.length },
                        { id: 'facilities', name: 'Facilities Audit', count: facilities.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setStatusFilter('all'); }}
                            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                                    : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <span>{tab.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                activeTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Report Viewer */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 lg:col-span-3 bg-white shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                        <div>
                            <h2 className="text-lg font-title font-bold text-slate-900 capitalize">{activeTab} Details</h2>
                            <p className="text-xs text-slate-550">Generate, filter and export data logs instantly</p>
                        </div>
                        <button
                            onClick={() => exportToCSV(activeTab)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all duration-150 shadow-sm"
                        >
                            <svg className="h-4.5 w-4.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export to CSV
                        </button>
                    </div>

                    {/* Filter selector based on tab */}
                    {activeTab === 'reservations' && (
                        <div className="flex gap-2 mb-6">
                            {['all', 'approved', 'pending', 'rejected', 'cancelled'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                        statusFilter === st
                                            ? 'bg-slate-100 text-slate-800 border-slate-250 font-extrabold'
                                            : 'bg-transparent text-slate-450 hover:text-slate-700 border-transparent hover:bg-slate-50'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Report Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            {activeTab === 'reservations' && (
                                <>
                                    <thead>
                                        <tr className="border-b border-slate-205 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                            <th className="pb-3">ID</th>
                                            <th className="pb-3">User</th>
                                            <th className="pb-3">Facility</th>
                                            <th className="pb-3">Schedule</th>
                                            <th className="pb-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reservations
                                            .filter(r => statusFilter === 'all' || r.status === statusFilter)
                                            .map(res => (
                                                <tr key={res.id} className="text-slate-705 text-xs hover:bg-slate-50">
                                                    <td className="py-3.5 font-mono">#{res.id}</td>
                                                    <td className="py-3.5 font-semibold text-slate-900">{res.userName}</td>
                                                    <td className="py-3.5">{res.facilityName}</td>
                                                    <td className="py-3.5">{res.date} &bull; {res.timeSlot}</td>
                                                    <td className="py-3.5">
                                                        <span className="text-[10px] uppercase font-extrabold text-indigo-650">{res.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </>
                            )}

                            {activeTab === 'users' && (
                                <>
                                    <thead>
                                        <tr className="border-b border-slate-205 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                            <th className="pb-3">ID</th>
                                            <th className="pb-3">Name</th>
                                            <th className="pb-3">Email</th>
                                            <th className="pb-3">Role</th>
                                            <th className="pb-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map(u => (
                                            <tr key={u.id} className="text-slate-750 text-xs hover:bg-slate-50">
                                                <td className="py-3.5">#{u.id}</td>
                                                <td className="py-3.5 font-semibold text-slate-900">{u.name}</td>
                                                <td className="py-3.5">{u.email}</td>
                                                <td className="py-3.5 uppercase">{u.role}</td>
                                                <td className="py-3.5">
                                                    <span className="text-[10px] uppercase font-extrabold text-indigo-650">{u.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}

                            {activeTab === 'facilities' && (
                                <>
                                    <thead>
                                        <tr className="border-b border-slate-205 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                            <th className="pb-3">ID</th>
                                            <th className="pb-3">Facility Name</th>
                                            <th className="pb-3">Max Cap</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {facilities.map(f => (
                                            <tr key={f.id} className="text-slate-750 text-xs hover:bg-slate-50">
                                                <td className="py-3.5">#{f.id}</td>
                                                <td className="py-3.5 font-semibold text-slate-900">{f.name}</td>
                                                <td className="py-3.5 text-slate-600">{f.capacity} players</td>
                                                <td className="py-3.5">
                                                    <span className={`text-[10px] font-bold ${f.active ? 'text-emerald-600' : 'text-slate-450'}`}>
                                                        {f.active ? 'OPERATIONAL' : 'MAINTENANCE'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 truncate max-w-xs text-slate-550">{f.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
