import React, { useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    useEffect(() => {
        const user = auth?.user;
        if (user) {
            if (user.role === 'admin') {
                router.visit('/admin/dashboard');
            } else {
                router.visit('/user/dashboard');
            }
        } else {
            router.visit('/login');
        }
    }, [auth]);

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 text-[#0b1c30] font-sans">
            <Head title="Redirecting - PlayZa" />
            <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0077CC] border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-600 text-sm font-bold">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
