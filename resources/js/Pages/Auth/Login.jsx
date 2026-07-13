import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { authenticateMockUser } from '@/mockData';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);



    const submit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            const res = authenticateMockUser(email, password);
            setLoading(false);
            if (res.success) {
                if (res.user.role === 'admin') {
                    router.visit('/admin/dashboard');
                } else {
                    router.visit('/user/dashboard');
                }
            } else {
                setError(res.message);
            }
        }, 600);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/5 blur-[80px] animate-pulse-glow"></div>
            <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-pink-500/5 blur-[80px] animate-pulse-glow"></div>

            <Head title="Sign In - PlayZa" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="flex justify-center">
                    <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-3 rounded-2xl text-white font-black tracking-wider text-xl shadow-lg shadow-indigo-500/20 animate-float">
                        PZ
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-title font-extrabold text-slate-900 tracking-tight">
                    Welcome back to PlayZa
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Getafe Sports Facilities Reservation System
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

                    <form className="space-y-6" onSubmit={submit}>
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
                                    placeholder="Enter your email"
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

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded bg-white"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-500">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-xs">
                                <a href="#" className="font-semibold text-indigo-605 hover:text-indigo-700">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-850 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 glow-primary"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
                                Register now
                            </Link>
                        </p>
                    </div>


                </div>
            </div>
        </div>
    );
}
