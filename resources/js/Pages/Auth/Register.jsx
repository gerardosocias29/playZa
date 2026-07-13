import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { registerMockUser } from '@/mockData';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const res = registerMockUser(name, email, password);
            setLoading(false);
            if (res.success) {
                setSuccessMessage(res.message);
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(res.message);
            }
        }, 600);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Ambient background glows */}
            <div className="absolute top-1/4 right-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-550/5 blur-[80px] animate-pulse-glow pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/3 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-550/5 blur-[80px] animate-pulse-glow pointer-events-none"></div>

            <Head title="Register - PlayZa" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="flex justify-center">
                    <div className="bg-gradient-to-tr from-emerald-500 to-indigo-650 p-3 rounded-2xl text-white font-black tracking-wider text-xl shadow-lg shadow-emerald-500/20 animate-float">
                        PZ
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-title font-extrabold text-slate-900 tracking-tight">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-655 font-semibold">
                    Join PlayZa to book Getafe sports facilities
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="glass-panel py-8 px-4 bg-white/90 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200">
                    
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2">
                            <svg className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage ? (
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Registration Submitted!</h3>
                            <p className="text-sm text-slate-600 mb-6">{successMessage}</p>
                            <Link
                                href="/login"
                                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                                    Full Name
                                </label>
                                <div className="mt-1.5">
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full px-4 py-3 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 transition-colors duration-200 text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                                    Email address
                                </label>
                                <div className="mt-1.5">
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-4 py-3 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 transition-colors duration-200 text-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                                    Password
                                </label>
                                <div className="mt-1.5">
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-4 py-3 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 transition-colors duration-200 text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1.5">
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full px-4 py-3 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 transition-colors duration-200 text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-850 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 glow-accent"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        'Submit Registration'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500">
                            Already have an account?{' '}
                            <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
