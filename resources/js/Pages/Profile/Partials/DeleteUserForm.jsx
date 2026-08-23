import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="border-b border-rose-100 pb-4 mb-4">
                <h3 className="text-lg font-title font-black text-rose-700">
                    Delete Account
                </h3>
                <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
                    Once your account is deleted, all booking records, personal data, and related information will be permanently removed.
                </p>
            </header>

            <div>
                <button
                    type="button"
                    onClick={confirmUserDeletion}
                    className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold rounded-xl transition-colors active:scale-95 flex items-center gap-2"
                >
                    <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete My Account
                </button>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 sm:p-8 space-y-6">
                    <div>
                        <h3 className="text-lg font-title font-black text-[#0b1c30]">
                            Are you sure you want to delete your account?
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
                            This action is permanent and cannot be undone. Please enter your password to confirm account deletion.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all"
                            placeholder="Enter your current password"
                        />

                        <InputError message={errors.password} className="mt-1.5 text-xs" />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-xs"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95 disabled:opacity-60"
                        >
                            {processing ? 'Deleting…' : 'Confirm Deletion'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
