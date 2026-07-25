import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-[#0b1c30]">
            <Head title="Privacy Policy - PlayZa" />

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
                            Data Protection & Privacy
                        </span>
                        <h1 className="text-3xl font-title font-black text-[#0b1c30]">
                            PlayZa Privacy Policy
                        </h1>
                        <p className="text-xs text-slate-500 mt-2">
                            Effective Date: July 20, 2026 | Last Updated: July 2026
                        </p>
                    </div>

                    <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6">
                        <section>
                            <h2 className="text-lg font-bold text-[#0b1c30] mb-2">1. Information We Collect</h2>
                            <p className="text-slate-600">
                                PlayZa collects personal information provided during account registration, including your full name and email address, as well as facility reservation records necessary to process bookings and send notifications.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#0b1c30] mb-2">2. How We Use Your Data</h2>
                            <p className="text-slate-600">
                                Your information is used strictly to manage user accounts, confirm reservation availability, notify you of booking status changes, and maintain Getafe sports facility operational records.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#0b1c30] mb-2">3. Data Security & Storage</h2>
                            <p className="text-slate-600">
                                We employ industry-standard administrative and technical safeguards to protect your personal data against unauthorized access, loss, or misuse.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#0b1c30] mb-2">4. Third-Party Sharing</h2>
                            <p className="text-slate-600">
                                PlayZa does not sell, rent, or share your personal information with third-party advertisers. Information is accessed only by authorized municipal facility administrators.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#0b1c30] mb-2">5. Your Privacy Rights</h2>
                            <p className="text-slate-600">
                                You have the right to inspect, update, or request the deletion of your personal account data at any time by contacting our support team or updating your profile settings.
                            </p>
                        </section>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                        <p>© 2026 PlayZa Getafe Sports Facilities. All rights reserved.</p>
                        <Link href="/terms-of-service" className="text-[#0077CC] font-bold hover:underline">
                            View Terms of Service →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
