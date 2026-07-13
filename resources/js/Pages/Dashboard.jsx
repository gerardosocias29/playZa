import React, { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { getCurrentUser } from '@/mockData';

export default function Dashboard() {
    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            if (user.role === 'admin') {
                router.visit('/admin/dashboard');
            } else {
                router.visit('/user/dashboard');
            }
        } else {
            router.visit('/login');
        }
    }, []);

    return (
        <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-200">
            <Head title="Redirecting - PlayZa" />
            <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-400 text-sm">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
