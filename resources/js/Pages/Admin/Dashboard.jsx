import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { getUsers, getFacilities, getReservations } from '@/mockData';

export default function Dashboard() {
    const [stats, setStats] = useState({
        usersCount: 0,
        pendingUsers: 0,
        facilitiesCount: 0,
        reservationsCount: 0,
        pendingReservations: 0,
    });
    const [recentReservations, setRecentReservations] = useState([]);

    useEffect(() => {
        const users = getUsers();
        const facilities = getFacilities();
        const reservations = getReservations();

        setStats({
            usersCount: users.length,
            pendingUsers: users.filter(u => u.status === 'pending').length,
            facilitiesCount: facilities.length,
            reservationsCount: reservations.length,
            pendingReservations: reservations.filter(r => r.status === 'pending').length,
        });

        const sorted = [...reservations].sort((a, b) => b.id - a.id).slice(0, 4);
        setRecentReservations(sorted);
    }, []);

    const statCards = [
        { name: 'Pending Approvals', value: stats.pendingUsers, desc: 'Users waiting registration approval', color: 'text-amber-600 bg-white border-slate-200' },
        { name: 'Active Facilities', value: stats.facilitiesCount, desc: 'Registered sports installations', color: 'text-indigo-600 bg-white border-slate-200' },
        { name: 'Pending Reservations', value: stats.pendingReservations, desc: 'Bookings awaiting review', color: 'text-rose-600 bg-white border-slate-200' },
        { name: 'Total Reservations', value: stats.reservationsCount, desc: 'Overall booking records', color: 'text-emerald-600 bg-white border-slate-200' },
    ];

    return (
        <AdminLayout title="Dashboard Overview">
            <Head title="Admin Dashboard - PlayZa" />

            {/* Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card) => (
                    <div key={card.name} className={`glass-panel p-6 rounded-2xl border ${card.color} transition-all duration-300 hover:scale-[1.01] shadow-sm bg-white`}>
                        <span className="block text-xs uppercase tracking-wider font-extrabold text-slate-500 mb-1">{card.name}</span>
                        <span className="block text-3xl font-black text-slate-900 font-title tracking-tight mb-2">{card.value}</span>
                        <span className="block text-xs text-slate-550">{card.desc}</span>
                    </div>
                ))}
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings Activity */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 lg:col-span-2 shadow-sm bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-title font-bold text-slate-900">Recent Reservations</h2>
                            <p className="text-xs text-slate-500">Newly placed sports facility booking requests</p>
                        </div>
                        <Link href="/admin/reservations" className="text-xs font-bold text-indigo-600 hover:text-indigo-705">
                            Manage All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentReservations.length > 0 ? (
                            recentReservations.map((res) => (
                                <div key={res.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between transition-colors duration-150 hover:bg-slate-100/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-655 shrink-0">
                                            {res.facilityName.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="block text-sm font-bold text-slate-900">{res.facilityName}</span>
                                            <span className="block text-xs text-slate-500">
                                                By {res.userName} &bull; {res.date} &bull; {res.timeSlot}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                        res.status === 'approved' 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : res.status === 'pending'
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                        {res.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-slate-400 py-6">No reservations found.</p>
                        )}
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm bg-white">
                    <div>
                        <h2 className="text-lg font-title font-bold text-slate-900 mb-1">Administrative Actions</h2>
                        <p className="text-xs text-slate-500 mb-6">Quick shortcuts to vital portal sections</p>
                        
                        <div className="space-y-3">
                            <Link href="/admin/users" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-150 rounded-xl text-sm font-semibold text-indigo-700 transition-all duration-150">
                                <span>Approve Users</span>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs border border-indigo-200 font-bold">{stats.pendingUsers} Pending</span>
                            </Link>
                            <Link href="/admin/facilities" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-150 rounded-xl text-sm font-semibold text-slate-700 transition-all duration-150">
                                <span>Add New Facility</span>
                                <svg className="h-4 w-4 text-slate-450" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </Link>
                            <Link href="/admin/schedules" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-150 rounded-xl text-sm font-semibold text-slate-700 transition-all duration-150">
                                <span>Manage Booking Slots</span>
                                <svg className="h-4 w-4 text-slate-455" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
