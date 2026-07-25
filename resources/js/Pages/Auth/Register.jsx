import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        agree_terms: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-[#0b1c30]">
            {/* Ambient Soft Glows */}
            <div className="absolute top-1/4 right-1/3 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#add911]/15 blur-[120px] pointer-events-none animate-pulse-glow"></div>
            <div className="absolute bottom-1/4 left-1/3 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#0077CC]/10 blur-[120px] pointer-events-none animate-pulse-glow"></div>

            <Head title="Create Account - PlayZa" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
                <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
                    <img 
                        src="/images/playza_horizontal.png" 
                        alt="PlayZa Logo" 
                        className="h-16 mx-auto object-contain drop-shadow-sm"
                    />
                </Link>
                <h2 className="mt-6 text-2xl font-title font-extrabold text-[#0b1c30] tracking-tight">
                    Create your account
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                    Join PlayZa to book & manage Getafe sports facilities
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
                <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl">
                    
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                            <svg className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="space-y-1">
                                {Object.values(errors).map((err, idx) => (
                                    <p key={idx}>{err}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={submit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-[#0b1c30]">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0077CC] focus:border-[#0077CC] text-[#0b1c30] placeholder-slate-400 transition-colors duration-200 text-sm shadow-sm"
                                    placeholder="Jane Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-[#0b1c30]">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0077CC] focus:border-[#0077CC] text-[#0b1c30] placeholder-slate-400 transition-colors duration-200 text-sm shadow-sm"
                                    placeholder="jane@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-[#0b1c30]">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0077CC] focus:border-[#0077CC] text-[#0b1c30] placeholder-slate-400 transition-colors duration-200 text-sm shadow-sm"
                                    placeholder="At least 6 characters"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-bold text-[#0b1c30]">
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0077CC] focus:border-[#0077CC] text-[#0b1c30] placeholder-slate-400 transition-colors duration-200 text-sm shadow-sm"
                                    placeholder="Re-enter your password"
                                />
                            </div>
                        </div>

                        <div className="flex items-start pt-1">
                            <input
                                id="agree-terms"
                                name="agree-terms"
                                type="checkbox"
                                required
                                checked={data.agree_terms}
                                onChange={(e) => setData('agree_terms', e.target.checked)}
                                className="h-4 w-4 mt-0.5 text-[#0077CC] focus:ring-[#0077CC] border-slate-300 rounded bg-white"
                            />
                            <label htmlFor="agree-terms" className="ml-2 block text-xs text-slate-600 leading-normal font-medium">
                                I agree to the{' '}
                                <a 
                                    href="/terms-of-service" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[#0077CC] font-bold hover:underline"
                                >
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a 
                                    href="/privacy-policy" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[#0077CC] font-bold hover:underline"
                                >
                                    Privacy Policy
                                </a>{' '}
                                of PlayZa.
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-extrabold text-white bg-[#0b1c30] hover:bg-[#132c4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b1c30] transition-all duration-200 disabled:opacity-50 active:scale-[0.99]"
                            >
                                {processing ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Create Account <span className="text-[#add911]">→</span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
                        <p className="text-xs text-slate-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-extrabold text-[#0077CC] hover:underline transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
