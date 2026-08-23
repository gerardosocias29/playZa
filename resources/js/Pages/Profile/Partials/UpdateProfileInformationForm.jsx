import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-lg font-title font-black text-[#0b1c30]">
                    Personal Information
                </h3>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                    Update your account details and contact email address.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-5 max-w-xl">
                <div>
                    <label htmlFor="name" className="block text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">
                        Full Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0077CC] focus:ring-1 focus:ring-[#0077CC] focus:outline-none transition-all"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-1.5 text-xs" message={errors.name} />
                </div>

                <div>
                    <label htmlFor="email" className="block text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-[#0077CC] focus:ring-1 focus:ring-[#0077CC] focus:outline-none transition-all"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-1.5 text-xs" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                        <p className="font-semibold">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 underline font-bold text-[#0077CC] hover:text-[#0b1c30]"
                            >
                                Click here to resend the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-bold text-emerald-700">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
                    >
                        {processing ? 'Saving…' : 'Save Changes'} <span className="text-[#add911]">→</span>
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
                            Saved successfully
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
