import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import FacilityCarousel from '@/Components/FacilityCarousel';
import TimelineScheduler from '@/Components/TimelineScheduler';

export default function Dashboard({ 
    facilities = [], 
    userReservations = [], 
    notifications = [], 
    reservations = [], 
    schedules = [] 
}) {
    const { auth, errors } = usePage().props;
    const user = auth.user;

    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [selectedFacilityId, setSelectedFacilityId] = useState(facilities.length > 0 ? facilities[0].id : '');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookingSummaryData, setBookingSummaryData] = useState(null);
    const [eventType, setEventType] = useState('Graduation');
    const [customEventName, setCustomEventName] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    const selectedFacility = facilities.find(f => f.id === parseInt(selectedFacilityId)) || facilities[0];

    // Scroll listener for section tracking
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'facilities', 'about'];
            const scrollPosition = window.scrollY + 200;

            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(sections[i]);
                if (el && el.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i]);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const openModalForFacility = (facilityId) => {
        setSelectedFacilityId(facilityId);
        setIsAvailabilityModalOpen(true);
    };

    const handleContinueBooking = (summary) => {
        setBookingSummaryData(summary);
        setIsConfirmOpen(true);
    };

    const handleConfirmBooking = () => {
        if (!bookingSummaryData || !selectedFacility) return;

        router.post(route('reservations.store'), {
            facility_id: selectedFacility.id,
            reservation_date: bookingSummaryData.date || selectedDate,
            start_time: bookingSummaryData.startTime,
            end_time: bookingSummaryData.endTime,
            duration_hours: bookingSummaryData.durationHours,
            event_type: selectedFacility.requires_event_type ? eventType : null,
            custom_event_name: selectedFacility.requires_event_type ? customEventName : null,
        }, {
            onSuccess: () => {
                setIsConfirmOpen(false);
                setIsAvailabilityModalOpen(false);
                setBookingSummaryData(null);
            }
        });
    };

    return (
        <UserLayout 
            title="Getafe Sports & Event Facility Booking" 
            activeSection={activeSection}
            onOpenAvailabilityModal={() => setIsAvailabilityModalOpen(true)}
        >
            <Head title="Home - PlayZa Sports & Events" />

            <div className="space-y-16">
                
                {/* HERO SECTION (#home) */}
                <section id="home" className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-14 text-white shadow-2xl">
                    <div className="max-w-2xl space-y-6">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-black uppercase tracking-wider border border-indigo-400/20">
                            <span className="h-2 w-2 rounded-full bg-[#add911] animate-pulse"></span>
                            Welcome, {user?.name}
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Reserve Premium Sports & Event Courts in Getafe
                        </h1>
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                            Browse official facilities, inspect live 24-hour schedules, and drag & drop time slots directly to date targets.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <button
                                onClick={() => setIsAvailabilityModalOpen(true)}
                                className="px-6 py-4 bg-[#add911] hover:bg-[#bce420] text-[#0b1c30] font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-2"
                            >
                                ⚡ Check Availability & Book Modal
                            </button>
                            <Link
                                href="/my-reservations"
                                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider backdrop-blur-md border border-white/20 transition-all"
                            >
                                View My Reservations
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FACILITIES DIRECTORY (#facilities) */}
                <section id="facilities" className="space-y-8 scroll-mt-28">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-extrabold text-[#0077CC] uppercase tracking-widest block mb-1">
                                DIRECTORY
                            </span>
                            <h2 className="text-2xl font-black text-slate-900">Sports & Event Facilities</h2>
                            <p className="text-xs text-slate-500 mt-1">Explore available indoor and outdoor installations</p>
                        </div>
                        <button
                            onClick={() => setIsAvailabilityModalOpen(true)}
                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all self-start sm:self-auto"
                        >
                            Open Scheduler Modal 📅
                        </button>
                    </div>

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
                                            onClick={() => openModalForFacility(fac.id)}
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
                </section>

                {/* ABOUT SECTION (#about) */}
                <section id="about" className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6 scroll-mt-28">
                    <div className="max-w-3xl space-y-4">
                        <span className="text-xs font-black uppercase tracking-widest text-[#add911]">
                            ABOUT PLAYZA
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black">
                            Getafe Official Municipal Sports & Event Reservation System
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                            PlayZa provides transparent, real-time availability checks and double-booking protection across all Getafe sports courts and event spaces. Submit booking requests with instant status feedback and automated in-app alerts.
                        </p>
                    </div>
                </section>

            </div>

            {/* CHECK AVAILABILITY MODAL */}
            {isAvailabilityModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <span>📅</span> Check Availability & Book Time Slots
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Select facility, date, hours, or drag & drop open time slots onto date targets
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAvailabilityModalOpen(false)}
                                className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Facility & Date Selector Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                                    Select Facility
                                </label>
                                <select
                                    value={selectedFacilityId}
                                    onChange={(e) => setSelectedFacilityId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                                >
                                    {facilities.map((f) => (
                                        <option key={f.id} value={f.id}>{f.name} ({f.type})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                                    Select Target Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        {errors.start_time && (
                            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                                ⚠️ {errors.start_time}
                            </div>
                        )}

                        {/* Interactive Drag & Drop Scheduler */}
                        {selectedFacility && (
                            <TimelineScheduler
                                selectedFacility={selectedFacility}
                                selectedDate={selectedDate}
                                onDateChange={(newDate) => setSelectedDate(newDate)}
                                reservations={reservations}
                                onContinueBooking={handleContinueBooking}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODAL */}
            {isConfirmOpen && bookingSummaryData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-black text-slate-900 text-lg">Confirm Reservation Request</h3>
                            <button onClick={() => setIsConfirmOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
                            <div><span className="font-bold">Facility:</span> {selectedFacility?.name}</div>
                            <div><span className="font-bold">Date:</span> {bookingSummaryData.date || selectedDate}</div>
                            <div><span className="font-bold">Time Range:</span> {bookingSummaryData.startTime} - {bookingSummaryData.endTime}</div>
                            <div><span className="font-bold">Duration:</span> {bookingSummaryData.durationHours} Hour(s)</div>
                            <div><span className="font-bold">Estimated Cost:</span> €{bookingSummaryData.estimatedPrice}</div>
                        </div>

                        {selectedFacility?.requires_event_type && (
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-slate-700 uppercase">Event Type Selection</label>
                                <select
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                                >
                                    <option value="Graduation">Graduation</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Wedding">Wedding</option>
                                    <option value="Birthday">Birthday</option>
                                    <option value="Others">Others</option>
                                </select>

                                {eventType === 'Others' && (
                                    <input
                                        type="text"
                                        placeholder="Specify custom event name..."
                                        value={customEventName}
                                        onChange={(e) => setCustomEventName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs mt-2"
                                    />
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}
