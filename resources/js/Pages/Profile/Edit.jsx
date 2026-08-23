import React from 'react';
import { Head } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <UserLayout title="Account & Profile Settings">
            <Head title="Profile Settings - PlayZa" />

            <div className="space-y-8 max-w-4xl">
                {/* Header Banner */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <h2 className="text-xl font-title font-black text-[#0b1c30]">Profile & Security Preferences</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Manage your personal contact details, security credentials, and account settings.
                    </p>
                </div>

                {/* Profile Information Card */}
                <div className="glass-panel p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                {/* Update Password Card */}
                <div className="glass-panel p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <UpdatePasswordForm />
                </div>

                {/* Danger Zone / Delete Card */}
                <div className="glass-panel p-6 sm:p-8 bg-white rounded-2xl border border-rose-200/80 shadow-xs">
                    <DeleteUserForm />
                </div>
            </div>
        </UserLayout>
    );
}
