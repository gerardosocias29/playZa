import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Users({ users = [] }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'user',
        status: 'approved',
    });

    const handleApprove = (id) => {
        router.patch(route('admin.users.approve', id));
    };

    const handleReject = (id) => {
        router.patch(route('admin.users.reject', id));
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'user',
            status: user.status || 'approved',
        });
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        put(route('admin.users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                reset();
            },
        });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name || '').toLowerCase().includes(search.toLowerCase()) || 
                             (user.email || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || user.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <AdminLayout title="User Management">
            <Head title="User Directory - PlayZa" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-title font-black text-[#0b1c30]">User Management & Permissions</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Approve registrations, edit user details, and manage roles.</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Search & Filter Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-[#0077CC] text-slate-900 placeholder-slate-400 text-xs font-medium"
                            />
                            <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-500 mr-1">Filter:</span>
                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all ${
                                        filter === status
                                            ? 'bg-[#0b1c30] text-white shadow-xs'
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
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Joined</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-[#0b1c30] text-[#add911] flex items-center justify-center font-bold text-xs">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#0b1c30] text-xs">{user.name}</div>
                                                        <div className="text-[11px] text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                                    user.role === 'admin' 
                                                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                                    user.status === 'approved' 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : user.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {user.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(user.id)}
                                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(user.id)}
                                                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => handleOpenEditModal(user)}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                                            No users found matching criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit User Modal */}
                {editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-base font-title font-black text-[#0b1c30]">Edit User Details</h3>
                                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                        required
                                    />
                                    {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                        required
                                    />
                                    {errors.email && <p className="text-rose-500 text-[11px] mt-1">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                                        <select
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                                        >
                                            <option value="approved">Approved</option>
                                            <option value="pending">Pending</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 bg-[#0b1c30] hover:bg-[#132c4a] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                                    >
                                        Save Changes <span className="text-[#add911]">→</span>
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
