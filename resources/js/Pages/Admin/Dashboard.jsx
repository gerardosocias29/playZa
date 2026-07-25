import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ stats = {}, recentReservations = [], pendingUsers = [] }) {
    const statCards = [
        { name: 'Pending Approvals', value: stats.pendingRegistrations || 0, desc: 'Users waiting registration approval', color: 'text-amber-600 bg-white border-slate-200' },
        { name: 'Active Facilities', value: stats.activeFacilities || 0, desc: 'Registered sports installations', color: 'text-indigo-600 bg-white border-slate-200' },
        { name: 'Pending Reservations', value: stats.pendingReservations || 0, desc: 'Bookings awaiting review', color: 'text-rose-600 bg-white border-slate-200' },
        { name: 'Total Reservations', value: stats.totalReservations || 0, desc: 'Overall booking records', color: 'text-emerald-600 bg-white border-slate-200' },
    ];

    const handleApproveUser = (id) => {
        router.patch(route('admin.users.approve', id));
    };

    const handleRejectUser = (id) => {
        router.patch(route('admin.users.reject', id));
    };

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
                            <h3 className="font-bold text-slate-900 text-lg">Recent Reservations</h3>
                            <p className="text-xs text-slate-500">Latest reservation requests across all facilities</p>
                        </div>
                        <Link href={route('admin.reservations')} className="text-xs font-bold text-indigo-600 hover:underline">
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentReservations.length > 0 ? (
                            recentReservations.map((res) => (
                                <div key={res.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{res.facility?.name || 'Facility'}</div>
                                        <div className="text-xs text-slate-500">
                                            By {res.user?.name || 'User'} • {res.reservation_date} ({res.start_time} - {res.end_time})
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white border text-slate-700 shadow-2xs">
                                        {res.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-slate-400 text-xs">No recent reservations recorded.</div>
                        )}
                    </div>
                </div>

                {/* Pending User Registration Queue */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Pending Approvals</h3>
                            <p className="text-xs text-slate-500">Users waiting for access permission</p>
                        </div>
                        <Link href={route('admin.users')} className="text-xs font-bold text-indigo-600 hover:underline">
                            Manage →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {pendingUsers.length > 0 ? (
                            pendingUsers.map((u) => (
                                <div key={u.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                                        <div className="text-[11px] text-slate-500">{u.email}</div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleApproveUser(u.id)} className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold">Approve</button>
                                        <button onClick={() => handleRejectUser(u.id)} className="px-2 py-1 bg-rose-500 text-white rounded text-[10px] font-bold">Reject</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-slate-400 text-xs">No pending user registrations.</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
