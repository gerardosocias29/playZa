import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import FacilityCarousel from '@/Components/FacilityCarousel';
import AvailabilityModal from '@/Components/AvailabilityModal';

export default function Facilities({ facilities = [], reservations = [], schedules = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(facilities[0] || null);

    const handleOpenModal = (fac) => {
        setSelectedFacility(fac);
        setIsAvailabilityModalOpen(true);
    };

    return (
        <UserLayout title="Facility Directory">
            <Head title="Facilities Directory - PlayZa" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-[#0b1c30]">Sports Facilities Directory</h2>
                    <p className="text-slate-500 text-xs mt-1">Explore indoor courts, outdoor grounds, arenas, and sports halls</p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {facilities.length} Active Facilities
                </div>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {facilities.map((fac) => (
                    <div 
                        key={fac.id} 
                        className={`rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-sm hover:shadow-md bg-white overflow-hidden ${!fac.active ? 'opacity-65' : ''}`}
                    >
                        <div className="w-full">
                            <FacilityCarousel 
                                images={fac.images} 
                                title={fac.name} 
                                type={fac.type} 
                                category={fac.category} 
                            />
                        </div>

                        <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                            <div>
                                <h3 className="font-title font-black text-xl text-[#0b1c30] mb-2 leading-tight">
                                    {fac.name}
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {fac.description}
                                </p>
                            </div>

                            {fac.active ? (
                                <button
                                    onClick={() => handleOpenModal(fac)}
                                    className="w-full py-3.5 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl text-xs text-center transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    Check Availability <span className="text-[#add911]">→</span>
                                </button>
                            ) : (
                                <div className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs text-center cursor-not-allowed">
                                    Currently Unavailable
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <AvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                facility={selectedFacility || facilities[0]}
                facilities={facilities}
                reservations={reservations}
                schedules={schedules}
                user={user}
            />
        </UserLayout>
    );
}
