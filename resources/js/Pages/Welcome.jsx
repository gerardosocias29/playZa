import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50/40 to-transparent pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse-glow pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pink-500/5 blur-[120px] animate-pulse-glow pointer-events-none"></div>

            <Head title="Welcome to PlayZa - Getafe Sports Reservations" />

            {/* Navbar */}
            <nav className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-2.5 rounded-xl text-white font-black tracking-wider text-base shadow-lg shadow-indigo-500/20">
                        PZ
                    </div>
                    <span className="font-title font-bold text-xl tracking-tight text-slate-900">PlayZa</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-150">
                        Sign In
                    </Link>
                    <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all duration-150 shadow-md shadow-indigo-500/10 hover-scale">
                        Register
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto z-10 py-12 md:py-24">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-6 animate-float">
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    Modern Sports Facilities Scheduling
                </div>
                <h1 className="text-4xl md:text-6xl font-title font-black tracking-tight text-slate-900 mb-6 leading-tight">
                    Book Getafe Sports Facilities <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">Effortlessly</span>
                </h1>
                <p className="text-base md:text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed">
                    Check real-time schedules, reserve fields, courts, and halls, and manage bookings for you or your team on Getafe's premium community sports network.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none">
                    <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-705 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 text-base hover-scale text-center">
                        Get Started Now
                    </Link>
                    <a href="#facilities" className="px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold rounded-xl transition-colors duration-200 text-base text-center shadow-sm">
                        Browse Facilities
                    </a>
                </div>
            </section>

            {/* Facilities Section */}
            <section id="facilities" className="max-w-7xl w-full mx-auto px-6 py-24 border-t border-slate-200 z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-title font-bold text-slate-900 mb-4">Explore Facilities</h2>
                    <p className="text-slate-600">Getafe features professional-grade sports installations available for community reservations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { name: 'Soccer Field A', sport: 'Football / Soccer', tag: 'Outdoor', desc: 'Full-size artificial turf pitch, ideal for 11v11 matches, equipped with night-ready LED lighting systems.', color: 'from-emerald-500 to-teal-600' },
                        { name: 'Indoor Basketball Court', sport: 'Basketball / Volleyball', tag: 'Indoor', desc: 'State of the art hardwood indoor court with automated hoops, full electronic scoreboard, and audience seating.', color: 'from-orange-500 to-amber-600' },
                        { name: 'Clay Tennis Court 1', sport: 'Tennis', tag: 'Outdoor', desc: 'Premium clay court surface, meticulously groomed daily. Features full windbreaks and equipment rental options.', color: 'from-rose-500 to-pink-600' },
                        { name: 'Padel Glass Court A', sport: 'Padel', tag: 'Outdoor', desc: 'Panoramic structural glass walls, blue textured turf, and glare-free lighting for premium gameplay.', color: 'from-indigo-500 to-violet-600' }
                    ].map((facility) => (
                        <div key={facility.name} className="glass-panel rounded-2xl p-6 border border-slate-200 hover:border-slate-350 transition-all duration-300 hover:translate-y-[-4px] flex flex-col justify-between shadow-sm bg-white">
                            <div>
                                <div className={`h-1.5 w-12 rounded bg-gradient-to-r ${facility.color} mb-6`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-title font-bold text-lg text-slate-900">{facility.name}</h3>
                                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500">
                                        {facility.tag}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-slate-500 block mb-4">{facility.sport}</span>
                                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                    {facility.desc}
                                </p>
                            </div>
                            <Link href="/login" className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-center text-xs font-bold transition-all duration-150 block">
                                Book Facility
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-8 border-t border-slate-200 z-10 text-center text-xs text-slate-500 mt-auto">
                <p>&copy; {new Date().getFullYear()} PlayZa Getafe. All rights reserved.</p>
                <p className="mt-1 text-slate-450">Mockup UI Demo powered by Laravel + React + Inertia</p>
            </footer>
        </div>
    );
}
