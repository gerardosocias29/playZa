import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-[#0b1c30]">
            <Head title="Terms of Service - PlayZa" />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <img 
                            src="/images/playza_horizontal.png" 
                            alt="PlayZa Logo" 
                            className="h-10 object-contain"
                        />
                    </Link>
                    <Link 
                        href="/register" 
                        className="text-xs font-extrabold text-white bg-[#0b1c30] hover:bg-[#132c4a] px-4 py-2 rounded-xl transition-all"
                    >
                        Back to Registration
                    </Link>
                </div>
            </header>

            {/* Content Container */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200/80 shadow-sm space-y-8">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0077CC] block mb-1">
                            Legal & Compliance
                        </span>
                        <h1 className="text-3xl font-title font-black text-[#0b1c30]">
                            PlayZa Terms of Service
                        </h1>
                        <p className="text-xs text-slate-500 mt-2">
                            Effective Date: July 20, 2026 | Last Updated: July 2026
                        </p>
                    </div>

                    <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6">
                        <section>
                            <h2 className="text-lg font-bold text-[#0b1c30] mb-2">1. Acceptance of Terms</h2>
                            <p className="text-slate-600">
                                By registering an account or making facility reservations through PlayZa (Getafe Sports Facilities Reservation System), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please refrain from using the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#0b1c30] mb-2">2. User Accounts & Approval</h2>
                            <p className="text-slate-600">
                                Registration requires providing valid contact information. Accounts created by new users may undergo administrative verification and approval. PlayZa reserves the right to suspend or terminate accounts that provide false information or violate facility rules.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#0b1c30] mb-2">3. Facility Reservations & Maximum Duration</h2>
                            <p className="text-slate-600">
                                Reservations are subject to court/field availability and maximum duration limits (up to 5 consecutive hours per booking). Users must adhere to allocated time slots and vacate facilities promptly at the end of their reserved time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#0b1c30] mb-2">4. Cancellations & Conduct</h2>
                            <p className="text-slate-600">
                                Users are expected to maintain proper sportsmanship and respect facility property. Equipment loaners (such as free balls on request) must be returned in good condition. Double bookings and fraudulent reservation attempts are strictly prohibited.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#0b1c30] mb-2">5. Modifications to Terms</h2>
                            <p className="text-slate-600">
                                PlayZa reserves the right to update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.
                            </p>
                        </section>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                        <p>© 2026 PlayZa Getafe Sports Facilities. All rights reserved.</p>
                        <Link href="/privacy-policy" className="text-[#0077CC] font-bold hover:underline">
                            View Privacy Policy →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
