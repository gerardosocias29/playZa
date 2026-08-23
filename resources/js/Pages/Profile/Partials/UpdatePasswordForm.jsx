import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-lg font-title font-black text-[#0b1c30]">
                    Update Password
                </h3>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                    Ensure your account is protected with a secure password.
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-5 max-w-xl">
                <div>
                    <label htmlFor="current_password" className="block text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">
                        Current Password
                    </label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0077CC] focus:ring-1 focus:ring-[#0077CC] focus:outline-none transition-all"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-1.5 text-xs" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">
                        New Password
                    </label>
                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0077CC] focus:ring-1 focus:ring-[#0077CC] focus:outline-none transition-all"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-1.5 text-xs" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">
                        Confirm New Password
                    </label>
                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0077CC] focus:ring-1 focus:ring-[#0077CC] focus:outline-none transition-all"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-1.5 text-xs" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
                    >
                        {processing ? 'Updating…' : 'Update Password'} <span className="text-[#add911]">→</span>
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Password updated
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
