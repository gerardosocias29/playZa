import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function Toast() {
    const { flash = {} } = usePage().props;
    const [toast, setToast] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const msg = flash?.message || flash?.success || flash?.status;
        const err = flash?.error || flash?.warning;

        if (msg) {
            setToast({ type: 'success', text: msg });
            setVisible(true);
        } else if (err) {
            setToast({ type: 'error', text: err });
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        const handleCustomToast = (event) => {
            if (event.detail?.text) {
                setToast({
                    type: event.detail.type || 'success',
                    text: event.detail.text,
                });
                setVisible(true);
            }
        };

        window.addEventListener('playza:toast', handleCustomToast);
        return () => window.removeEventListener('playza:toast', handleCustomToast);
    }, []);

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(() => {
            setVisible(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, [visible, toast]);

    if (!visible || !toast) return null;

    const isSuccess = toast.type === 'success';

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full sm:w-auto animate-bounce-in">
            <div
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl backdrop-blur-md border transition-all duration-300 ${
                    isSuccess
                        ? 'bg-slate-900/95 text-white border-emerald-500/30'
                        : 'bg-rose-950/95 text-rose-100 border-rose-500/30'
                }`}
            >
                <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSuccess ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}
                >
                    {isSuccess ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>

                <div className="flex-1 pr-2">
                    <p className="text-xs font-bold leading-tight">
                        {isSuccess ? 'Action Successful' : 'Action Notice'}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        {toast.text}
                    </p>
                </div>

                <button
                    onClick={() => setVisible(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Dismiss"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
