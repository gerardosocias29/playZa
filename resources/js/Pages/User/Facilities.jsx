import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { getFacilities } from '@/mockData';

export default function Facilities() {
    const [facilities, setFacilities] = useState([]);

    useEffect(() => {
        setFacilities(getFacilities());
    }, []);

    const iconClasses = {
        soccer: 'from-emerald-500 to-teal-600',
        basketball: 'from-orange-500 to-amber-600',
        tennis: 'from-rose-500 to-pink-600',
        padel: 'from-indigo-500 to-violet-600',
    };

    return (
        <UserLayout title="Facility Directory">
            <Head title="Facilities Directory - PlayZa" />

            <div className="mb-6">
                <p className="text-slate-500 text-sm">Browse available Getafe community sports facilities and equipment capacity details</p>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {facilities.map((fac) => (
                    <div key={fac.id} className={`glass-panel rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:border-slate-350 shadow-sm bg-white ${!fac.active ? 'opacity-65' : ''}`}>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                                    fac.active 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-slate-105 text-slate-500 border-slate-205'
                                }`}>
                                    {fac.active ? 'Operational' : 'Maintenance'}
                                </span>
                                <span className="text-xs text-slate-500">
                                    Capacity: <span className="font-semibold text-slate-800">{fac.capacity} players</span>
                                </span>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${iconClasses[fac.image] || 'from-indigo-500 to-pink-500'} flex items-center justify-center font-bold text-lg text-white shadow-md shrink-0`}>
                                    {fac.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-title font-bold text-lg text-slate-900">{fac.name}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed mt-1.5">{fac.description}</p>
                                </div>
                            </div>
                        </div>

                        {fac.active ? (
                            <div className="pt-5 border-t border-slate-100 mt-6 flex justify-end">
                                <Link
                                    href="/user/dashboard"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 hover-scale"
                                >
                                    Check Availability
                                </Link>
                            </div>
                        ) : (
                            <div className="pt-5 border-t border-slate-100 mt-6 flex justify-end">
                                <span className="text-xs text-slate-450 italic py-2">
                                    Reservations temporarily locked for maintenance
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </UserLayout>
    );
}
