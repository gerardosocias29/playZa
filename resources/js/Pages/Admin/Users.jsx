import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { getUsers, saveUsers, approveUser, rejectUser } from '@/mockData';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setUsers(getUsers());
    }, []);

    const refreshUsers = () => {
        setUsers(getUsers());
    };

    const handleApprove = (id) => {
        approveUser(id);
        refreshUsers();
    };

    const handleReject = (id) => {
        rejectUser(id);
        refreshUsers();
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            const updated = users.filter(u => u.id !== id);
            saveUsers(updated);
            setUsers(updated);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                             user.email.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || user.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <AdminLayout title="User Directory">
            <Head title="User Directory - PlayZa" />

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 text-sm"
                        />
                        <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex gap-2">
                        {['all', 'pending', 'approved', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 border ${
                                    filter === status
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-slate-50 text-slate-650 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="pb-4">Name / ID</th>
                                <th className="pb-4">Email</th>
                                <th className="pb-4">Role</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Joined</th>
                                <th className="pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="text-slate-700 text-sm hover:bg-slate-50 transition-colors">
                                        <td className="py-4 font-semibold text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-550">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="block">{user.name}</span>
                                                    <span className="block text-[10px] text-slate-450 font-normal">ID: {user.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-600">{user.email}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                                user.role === 'admin' 
                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                                user.status === 'approved'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : user.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-xs text-slate-500">{user.joined}</td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(user.id)}
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                                            title="Approve User"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(user.id)}
                                                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                                                            title="Reject User"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-400 text-sm">
                                        No users match the search criteria.
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
