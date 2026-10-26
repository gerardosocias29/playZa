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
    const [pendingBookingData, setPendingBookingData] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    React.useEffect(() => {
        try {
            const saved = sessionStorage.getItem('playza_pending_booking');
            if (saved) {
                const parsed = JSON.parse(saved);
                sessionStorage.removeItem('playza_pending_booking');
                if (parsed && parsed.facilityId) {
                    const found = facilities.find(f => String(f.id) === String(parsed.facilityId));
                    if (found) setSelectedFacility(found);
                    setPendingBookingData(parsed);
                    setIsAvailabilityModalOpen(true);
                }
            }
        } catch (e) {
            sessionStorage.removeItem('playza_pending_booking');
        }
    }, [facilities]);

    const handleOpenModal = (fac) => {
        setSelectedFacility(fac);
        setIsAvailabilityModalOpen(true);
    };

    const categories = ['all', ...Array.from(new Set(facilities.map(f => f.category || f.type).filter(Boolean)))];

    const filteredFacilities = facilities.filter(fac => {
        const matchesSearch = fac.name.toLowerCase().includes(search.toLowerCase()) ||
                              (fac.description && fac.description.toLowerCase().includes(search.toLowerCase()));
        const matchesCat = selectedCategory === 'all' || fac.category === selectedCategory || fac.type === selectedCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <UserLayout 
            title="Sports & Event Facilities Directory"
            onOpenAvailabilityModal={() => setIsAvailabilityModalOpen(true)}
        >
            <Head title="Facility Directory - PlayZa" />

            {/* Page Header */}
            <div>
                <h2 className="text-xl font-title font-black text-[#0b1c30]">Sports & Event Facilities Directory</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Browse court amenities, operational hours, and real-time availability.</p>
            </div>

            {/* Filter & Search Bar */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search facility name, sport, or details..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:bg-white focus:border-[#0077CC] focus:ring-1 focus:ring-[#0077CC] focus:outline-none transition-all"
                        />
                        <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                                    selectedCategory === cat
                                        ? 'bg-[#0b1c30] text-white shadow-xs'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Facilities Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFacilities.map((fac) => (
                    <div 
                        key={fac.id} 
                        className={`rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-xs hover:shadow-md bg-white overflow-hidden ${!fac.active ? 'opacity-70' : ''}`}
                    >
                        <div className="w-full">
                            <FacilityCarousel 
                                images={fac.images} 
                                title={fac.name} 
                                type={fac.type} 
                                category={fac.category} 
                            />
                        </div>

                        <div className="p-6 flex flex-col justify-between flex-1 space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-extrabold text-[#0077CC] uppercase tracking-wider">
                                        {fac.category || fac.type || 'Court'}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${fac.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                        {fac.active ? 'Open for Booking' : 'Closed / Maintenance'}
                                    </span>
                                </div>
                                <h3 className="font-title font-black text-xl text-[#0b1c30] leading-snug">
                                    {fac.name}
                                </h3>
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                    {fac.description || 'Modern facility equipped for training, competitive sports, and community tournaments.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <svg className="h-3.5 w-3.5 text-[#0077CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Max {fac.max_hours_per_booking || 4} hrs/session</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-medium">
                                    <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{fac.opening_time || '08:00'} - {fac.closing_time || '22:00'}</span>
                                </div>
                            </div>

                            {fac.active ? (
                                <button
                                    onClick={() => handleOpenModal(fac)}
                                    className="w-full py-3 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl text-xs text-center transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    Check Availability & Reserve <span className="text-[#add911]">→</span>
                                </button>
                            ) : (
                                <div className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs text-center cursor-not-allowed">
                                    Currently Unavailable
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredFacilities.length === 0 && (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                    <p className="font-bold text-slate-800 text-sm">No facilities matched your search criteria.</p>
                    <p className="text-xs text-slate-500">Try changing or clearing your search filters.</p>
                </div>
            )}

            <AvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => {
                    setIsAvailabilityModalOpen(false);
                    setPendingBookingData(null);
                }}
                facility={selectedFacility || facilities[0]}
                facilities={facilities}
                initialFacilityId={selectedFacility?.id || (facilities[0]?.id ?? '')}
                initialBookingData={pendingBookingData}
                reservations={reservations}
                allReservations={reservations}
                schedules={schedules}
                allSchedules={schedules}
                user={user}
            />
        </UserLayout>
    );
}
