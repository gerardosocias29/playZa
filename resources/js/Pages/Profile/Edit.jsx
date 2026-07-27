import React from 'react';
import { Head } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <UserLayout title="My Profile">
            <Head title="Profile - PlayZa" />

            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </UserLayout>
    );
}
