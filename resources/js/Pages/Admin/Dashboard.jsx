import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ 
    stats = {}, 
    recentReservations = [], 
    pendingUsers = [],
    statusBreakdown = {},
    facilityUtilization = [],
    reservationTrends = []
}) {
    const statCards = [
        { name: 'Pending Approvals', value: stats.pendingRegistrations || 0, desc: 'Users waiting registration approval', color: 'text-amber-600 bg-amber-50/50 border-amber-200' },
        { name: 'Active Facilities', value: stats.activeFacilities || 0, desc: 'Registered sports installations', color: 'text-[#0077CC] bg-blue-50/50 border-blue-200' },
        { name: 'Pending Reservations', value: stats.pendingReservations || 0, desc: 'Bookings awaiting review', color: 'text-rose-600 bg-rose-50/50 border-rose-200' },
        { name: 'Total Reservations', value: stats.totalReservations || 0, desc: 'Overall booking records', color: 'text-emerald-700 bg-emerald-50/50 border-emerald-200' },
    ];

    const handleApproveUser = (id) => {
        router.patch(route('admin.users.approve', id));
    };

    const handleRejectUser = (id) => {
        router.patch(route('admin.users.reject', id));
    };

    // Calculate max value for trend bar height scaling
    const maxTrendValue = Math.max(...reservationTrends.map(t => t.count), 5);

    // Calculate total utilization count
    const totalUtilization = facilityUtilization.reduce((sum, f) => sum + f.count, 0) || 1;

    return (
        <AdminLayout title="Dashboard Analytics & Overview">
            {/* Page Header */}
            <div className="mb-6">
                <h2 className="text-xl font-title font-black text-[#0b1c30]">Dashboard Analytics & Overview</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Real-time facility utilization, metrics, and pending approval alerts.</p>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card) => (
                    <div key={card.name} className={`p-6 rounded-2xl border ${card.color} transition-all duration-300 hover:scale-[1.01] shadow-xs bg-white`}>
                        <span className="block text-xs uppercase tracking-wider font-extrabold text-slate-500 mb-1">{card.name}</span>
                        <span className="block text-3xl font-black text-[#0b1c30] font-title tracking-tight mb-2">{card.value}</span>
                        <span className="block text-xs text-slate-500 font-medium">{card.desc}</span>
                    </div>
                ))}
            </div>

            {/* ANALYTICS GRAPHS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                
                {/* Graph 1: Reservation Trends (Monthly Bar Chart) */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 lg:col-span-2 bg-white shadow-xs">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-title font-black text-[#0b1c30] text-lg">Reservation Trends</h3>
                            <p className="text-xs text-slate-500 font-medium">Monthly booking distribution for {new Date().getFullYear()}</p>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-[#0077CC]">
                            {stats.totalReservations || 0} Total Bookings
                        </span>
                    </div>

                    <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
                        {reservationTrends.map((item) => {
                            const barHeightPercent = Math.max((item.count / maxTrendValue) * 100, 8);
                            return (
                                <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                                    <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                                        {item.count}
                                    </div>
                                    <div 
                                        className="w-full max-w-[28px] bg-[#0b1c30] group-hover:bg-[#0077CC] transition-all rounded-t-md relative"
                                        style={{ height: `${barHeightPercent}%` }}
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#add911] rounded-t-md"></div>
                                    </div>
                                    <span className="text-[10px] font-extrabold text-slate-500 mt-2">{item.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Graph 2: Reservation Status Distribution */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="mb-4">
                            <h3 className="font-title font-black text-[#0b1c30] text-lg">Status Breakdown</h3>
                            <p className="text-xs text-slate-500 font-medium">Live reservation state metrics</p>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-emerald-700">Approved / Done</span>
                                    <span className="text-slate-700">{statusBreakdown.approved + statusBreakdown.completed}</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(((statusBreakdown.approved + statusBreakdown.completed) / (stats.totalReservations || 1)) * 100, 100)}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-amber-700">Pending Review</span>
                                    <span className="text-slate-700">{statusBreakdown.pending}</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((statusBreakdown.pending / (stats.totalReservations || 1)) * 100, 100)}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-slate-700">No Show</span>
                                    <span className="text-slate-700">{statusBreakdown.no_show}</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min((statusBreakdown.no_show / (stats.totalReservations || 1)) * 100, 100)}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-rose-700">Cancelled / Rejected</span>
                                    <span className="text-slate-700">{statusBreakdown.cancelled + statusBreakdown.rejected}</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(((statusBreakdown.cancelled + statusBreakdown.rejected) / (stats.totalReservations || 1)) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Facility Utilization & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Facility Utilization */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <h3 className="font-title font-black text-[#0b1c30] text-lg mb-1">Facility Utilization</h3>
                    <p className="text-xs text-slate-500 font-medium mb-4">Bookings distribution per sports court</p>

                    <div className="space-y-4">
                        {facilityUtilization.map((fac) => {
                            const percent = Math.round((fac.count / totalUtilization) * 100);
                            return (
                                <div key={fac.id} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-[#0b1c30]">{fac.name}</span>
                                        <span className="text-[#0077CC]">{fac.count} bookings ({percent}%)</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full bg-[#0b1c30] rounded-full" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Bookings Activity */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-title font-black text-[#0b1c30] text-lg">Recent Bookings</h3>
                            <p className="text-xs text-slate-500">Latest reservation activity</p>
                        </div>
                        <Link href={route('admin.reservations')} className="text-xs font-extrabold text-[#0077CC] hover:underline">
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentReservations.length > 0 ? (
                            recentReservations.map((res) => (
                                <div key={res.id} className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-[#0b1c30] text-xs">{res.facility?.name || 'Facility'}</div>
                                        <div className="text-[11px] text-slate-500 font-medium">
                                            {res.user?.name || 'User'} • {res.reservation_date}
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                        {res.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-center text-slate-400 text-xs">No recent reservations recorded.</div>
                        )}
                    </div>
                </div>

                {/* Pending User Registration Queue */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-xs bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-title font-black text-[#0b1c30] text-lg">Pending Approvals</h3>
                            <p className="text-xs text-slate-500">Registration requests</p>
                        </div>
                        <Link href={route('admin.users')} className="text-xs font-extrabold text-[#0077CC] hover:underline">
                            Manage →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {pendingUsers.length > 0 ? (
                            pendingUsers.map((u) => (
                                <div key={u.id} className="p-3 rounded-xl border border-slate-150 bg-slate-50/50 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-[#0b1c30] text-xs">{u.name}</div>
                                        <div className="text-[11px] text-slate-500">{u.email}</div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => handleApproveUser(u.id)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold transition-all">Approve</button>
                                        <button onClick={() => handleRejectUser(u.id)} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-extrabold transition-all">Reject</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-center text-slate-400 text-xs">No pending user registrations.</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
