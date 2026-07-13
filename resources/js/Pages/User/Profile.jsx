import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { getCurrentUser, setCurrentUser, getUsers, saveUsers } from '@/mockData';

export default function Profile() {
    const [user, setUser] = useState(null);

    // Profile Details Form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Password Form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
        }
    }, []);

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        setProfileSuccess('');
        setProfileError('');

        if (!name.trim() || !email.trim()) {
            setProfileError('All profile fields are required.');
            return;
        }

        const users = getUsers();
        const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== user.id);
        if (emailExists) {
            setProfileError('This email address is already registered by another account.');
            return;
        }

        const updatedUsers = users.map(u => u.id === user.id ? { ...u, name, email } : u);
        saveUsers(updatedUsers);

        const updatedUser = { ...user, name, email };
        setCurrentUser(updatedUser);
        setUser(updatedUser);

        setProfileSuccess('Profile details successfully updated!');
    };

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        setPasswordSuccess('');
        setPasswordError('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All password fields are required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        const expectedPassword = user.email.split('@')[0] + '123';
        if (currentPassword !== expectedPassword) {
            setPasswordError('Incorrect current password.');
            return;
        }

        setPasswordSuccess('Password successfully updated! (Local Store Mock)');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <UserLayout title="Member Profile">
            <Head title="Profile - PlayZa" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Details Form */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-205 h-fit bg-white shadow-sm">
                    <h2 className="text-base font-title font-bold text-slate-905 mb-1">Account Information</h2>
                    <p className="text-xs text-slate-500 mb-6">Update your account display name and email address</p>

                    {profileSuccess && (
                        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                            {profileSuccess}
                        </div>
                    )}

                    {profileError && (
                        <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                            {profileError}
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
                            />
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10"
                            >
                                Save Details
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Form */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-205 h-fit bg-white shadow-sm">
                    <h2 className="text-base font-title font-bold text-slate-905 mb-1">Security Credentials</h2>
                    <p className="text-xs text-slate-500 mb-6">Change your login authentication credentials</p>

                    {passwordSuccess && (
                        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                            {passwordSuccess}
                        </div>
                    )}

                    {passwordError && (
                        <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                            {passwordError}
                        </div>
                    )}

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Current Password</label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">New Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10"
                            >
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </UserLayout>
    );
}
