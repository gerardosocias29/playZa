import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import FacilityCarousel from '@/Components/FacilityCarousel';

const DEFAULT_EVENT_OPTIONS = [
    'Graduation',
    'Meeting',
    'Meeting de Avance',
    'Wedding',
    'Birthday',
    'Intramurals',
    'Sports Tournament',
    'Others',
];

export default function Facilities({ facilities = [] }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [enableMaxHours, setEnableMaxHours] = useState(true);
    const [newOptionInput, setNewOptionInput] = useState('');

    const { data, setData, post, put, reset, errors } = useForm({
        name: '',
        type: 'Indoor',
        category: 'Sports',
        description: '',
        requires_event_type: false,
        event_options: DEFAULT_EVENT_OPTIONS,
        allow_custom_event_name: true,
        max_hours: 2,
        active: true,
    });

    const openCreateForm = () => {
        setEditId(null);
        setEnableMaxHours(true);
        setNewOptionInput('');
        reset();
        setIsFormOpen(true);
    };

    const openEditForm = (facility) => {
        setEditId(facility.id);
        const hasMaxHours = facility.max_hours !== null && facility.max_hours !== undefined;
        setEnableMaxHours(hasMaxHours);
        setNewOptionInput('');
        setData({
            name: facility.name || '',
            type: facility.type || 'Indoor',
            category: facility.category || 'Sports',
            description: facility.description || '',
            requires_event_type: !!facility.requires_event_type,
            event_options: facility.event_options && facility.event_options.length > 0 ? facility.event_options : DEFAULT_EVENT_OPTIONS,
            allow_custom_event_name: facility.allow_custom_event_name !== false,
            max_hours: facility.max_hours ?? 2,
            active: !!facility.active,
        });
        setIsFormOpen(true);
    };

    const handleToggleActive = (id) => {
        router.patch(route('admin.facilities.toggle', id));
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this facility?')) {
            router.delete(route('admin.facilities.destroy', id));
        }
    };

    const handleAddEventOption = () => {
        if (!newOptionInput.trim()) return;
        const opt = newOptionInput.trim();
        const currentOpts = data.event_options || [];
        if (!currentOpts.includes(opt)) {
            setData('event_options', [...currentOpts, opt]);
        }
        setNewOptionInput('');
    };

    const handleRemoveEventOption = (optToRemove) => {
        const currentOpts = data.event_options || [];
        setData('event_options', currentOpts.filter((o) => o !== optToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...data,
            max_hours: enableMaxHours ? (data.max_hours || 2) : null,
        };

        if (editId) {
            put(route('admin.facilities.update', editId), {
                data: payload,
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.facilities.store'), {
                data: payload,
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AdminLayout title="Facility Management">
            <Head title="Facility Management - PlayZa" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Sports & Event Facilities</h2>
                        <p className="text-sm text-slate-500">
                            Manage court availability, max booking hours, custom events, descriptions, and rules.
                        </p>
                    </div>
                    <button
                        onClick={openCreateForm}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Facility
                    </button>
                </div>

                {/* Facilities List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilities.length > 0 ? (
                        facilities.map((facility) => (
                            <div
                                key={facility.id}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                            >
                                <div className="h-48 bg-slate-100 relative">
                                    <FacilityCarousel
                                        images={facility.images}
                                        title={facility.name}
                                        type={facility.type}
                                        category={facility.category}
                                    />
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <h3 className="font-bold text-slate-900 text-lg truncate">{facility.name}</h3>
                                            <span
                                                className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs ${
                                                    facility.active
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                                                }`}
                                            >
                                                {facility.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                Max: {facility.max_hours ? `${facility.max_hours} hrs/session` : 'Unlimited'}
                                            </span>
                                            {facility.requires_event_type && (
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100">
                                                    Event Selection Required
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                            {facility.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <button
                                            onClick={() => handleToggleActive(facility.id)}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                                facility.active
                                                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                            }`}
                                        >
                                            {facility.active ? 'Deactivate' : 'Activate'}
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditForm(facility)}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(facility.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                            No facilities added yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editId ? 'Edit Facility' : 'Create New Facility'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Facility Name
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-xl text-sm"
                                    required
                                />
                                {errors.name && <div className="text-xs text-rose-500 mt-1">{errors.name}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm"
                                    >
                                        <option value="Indoor">Indoor</option>
                                        <option value="Outdoor">Outdoor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-xl text-sm"
                                    >
                                        <option value="Sports">Sports</option>
                                        <option value="Events">Events</option>
                                    </select>
                                </div>
                            </div>

                            {/* Max Hours Section with Switch & Tooltip */}
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            MAX HOURS
                                        </label>
                                        <div className="group relative inline-flex items-center">
                                            <span className="cursor-help text-slate-400 hover:text-indigo-600 font-black text-xs">
                                                ⓘ
                                            </span>
                                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg whitespace-nowrap z-50 shadow-lg">
                                                If Enabled, sets max hours per reservation
                                            </div>
                                        </div>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={enableMaxHours}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setEnableMaxHours(checked);
                                                if (!checked) setData('max_hours', null);
                                                else if (!data.max_hours) setData('max_hours', 2);
                                            }}
                                            className="sr-only peer"
                                        />
                                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                {enableMaxHours ? (
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        value={data.max_hours ?? ''}
                                        onChange={(e) => setData('max_hours', e.target.value ? parseInt(e.target.value) : '')}
                                        placeholder="e.g. 2"
                                        className="w-full px-3 py-2 border rounded-xl text-sm bg-white font-semibold focus:ring-2 focus:ring-indigo-500"
                                        required={enableMaxHours}
                                    />
                                ) : (
                                    <p className="text-xs font-semibold text-slate-500 italic">
                                        Max hours disabled (Unlimited duration per booking)
                                    </p>
                                )}
                                {errors.max_hours && <div className="text-xs text-rose-500 mt-1">{errors.max_hours}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-xl text-sm"
                                ></textarea>
                            </div>

                            {/* Requires Event Type Selection Section */}
                            <div className="space-y-3 pt-2 border-t border-slate-200">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="requires_event_type"
                                        checked={data.requires_event_type}
                                        onChange={(e) => setData('requires_event_type', e.target.checked)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="requires_event_type" className="text-xs font-bold text-slate-800 cursor-pointer">
                                        Requires Event Type selection
                                    </label>
                                </div>

                                {data.requires_event_type && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                                Event Type Options (Menus)
                                            </label>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={newOptionInput}
                                                    onChange={(e) => setNewOptionInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddEventOption();
                                                        }
                                                    }}
                                                    placeholder="e.g. Meeting de Avance"
                                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddEventOption}
                                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    + Add
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                                                {(data.event_options || []).map((opt) => (
                                                    <span
                                                        key={opt}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-800"
                                                    >
                                                        {opt}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveEventOption(opt)}
                                                            className="text-indigo-400 hover:text-rose-600 font-bold"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.allow_custom_event_name}
                                                    onChange={(e) => setData('allow_custom_event_name', e.target.checked)}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-xs font-semibold text-slate-700">
                                                    Allow custom event name when "Others" is selected
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
                                >
                                    Save Facility
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
