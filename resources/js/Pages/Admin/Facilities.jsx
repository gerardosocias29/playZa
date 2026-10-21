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
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        type: 'Indoor',
        category: 'Sports',
        description: '',
        opening_time: '08:00',
        closing_time: '22:00',
        requires_event_type: false,
        event_options: DEFAULT_EVENT_OPTIONS,
        allow_custom_event_name: true,
        max_hours: 2,
        active: true,
        images: [],
    });

    const openCreateForm = () => {
        setEditId(null);
        setEnableMaxHours(true);
        setNewOptionInput('');
        setSelectedFiles([]);
        setFilePreviews([]);
        reset();
        setIsFormOpen(true);
    };

    const openEditForm = (facility) => {
        setEditId(facility.id);
        const hasMaxHours = facility.max_hours !== null && facility.max_hours !== undefined;
        setEnableMaxHours(hasMaxHours);
        setNewOptionInput('');
        setSelectedFiles([]);
        setFilePreviews([]);
        setData({
            name: facility.name || '',
            type: facility.type || 'Indoor',
            category: facility.category || 'Sports',
            description: facility.description || '',
            opening_time: facility.opening_time || '08:00',
            closing_time: facility.closing_time || '22:00',
            requires_event_type: !!facility.requires_event_type,
            event_options: facility.event_options && facility.event_options.length > 0 ? facility.event_options : DEFAULT_EVENT_OPTIONS,
            allow_custom_event_name: facility.allow_custom_event_name !== false,
            max_hours: facility.max_hours ?? 2,
            active: !!facility.active,
            images: facility.images || [],
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

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setSelectedFiles(prev => [...prev, ...files]);
        const previews = files.map(file => URL.createObjectURL(file));
        setFilePreviews(prev => [...prev, ...previews]);
    };

    const handleRemovePreview = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setFilePreviews(prev => {
            const removed = prev[index];
            if (removed) URL.revokeObjectURL(removed);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleRemoveExistingImage = (imgUrl) => {
        const currentImgs = data.images || [];
        setData('images', currentImgs.filter(img => img !== imgUrl));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('type', data.type);
        formData.append('category', data.category);
        formData.append('description', data.description || '');
        formData.append('opening_time', data.opening_time || '08:00');
        formData.append('closing_time', data.closing_time || '22:00');
        formData.append('requires_event_type', data.requires_event_type ? '1' : '0');
        formData.append('allow_custom_event_name', data.allow_custom_event_name ? '1' : '0');
        formData.append('active', data.active ? '1' : '0');

        if (enableMaxHours && data.max_hours) {
            formData.append('max_hours', data.max_hours);
        }

        (data.event_options || []).forEach(opt => {
            formData.append('event_options[]', opt);
        });

        (data.images || []).forEach(img => {
            formData.append('images[]', img);
        });

        selectedFiles.forEach(file => {
            formData.append('image_files[]', file);
        });

        if (editId) {
            formData.append('_method', 'PUT');
            router.post(route('admin.facilities.update', editId), formData, {
                forceFormData: true,
                onSuccess: () => {
                    setIsFormOpen(false);
                    setSelectedFiles([]);
                    setFilePreviews([]);
                    reset();
                },
            });
        } else {
            router.post(route('admin.facilities.store'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    setIsFormOpen(false);
                    setSelectedFiles([]);
                    setFilePreviews([]);
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
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {facility.opening_time || '08:00'} - {facility.closing_time || '22:00'}
                                            </span>
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

                            {/* Operating Hours (Open & Close Time) */}
                            <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl space-y-2">
                                <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-blue-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Operating Hours
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Opening Time</label>
                                        <select
                                            value={data.opening_time}
                                            onChange={(e) => setData('opening_time', e.target.value)}
                                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold"
                                        >
                                            {['05:00', '06:00', '07:00', '08:00', '09:00', '10:00'].map(t => (
                                                <option key={t} value={t}>{t} ({parseInt(t) > 12 ? parseInt(t) - 12 + ' PM' : parseInt(t) + ' AM'})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Closing Time</label>
                                        <select
                                            value={data.closing_time}
                                            onChange={(e) => setData('closing_time', e.target.value)}
                                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold"
                                        >
                                            {['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(t => (
                                                <option key={t} value={t}>{t} ({parseInt(t) > 12 ? parseInt(t) - 12 + ' PM' : parseInt(t) + ' AM'})</option>
                                            ))}
                                        </select>
                                    </div>
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

                                    <label className="relative inline-flex items-center cursor-pointer select-none">
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
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-[#4338ca]"></div>
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

                            {/* Real-Time Photo Upload & Image Gallery */}
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Realtime Pictures & Photos
                                    </label>
                                    <span className="text-[10px] text-slate-500 font-medium">Indoor & Outdoor Photos</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer bg-white text-center">
                                        <svg className="h-8 w-8 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-xs font-bold text-slate-700">+ Select / Take Real Photos</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, WEBP (multiple allowed)</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>

                                    {/* Live Real-time Previews */}
                                    {(filePreviews.length > 0 || (data.images && data.images.length > 0)) && (
                                        <div className="space-y-2 pt-2">
                                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Photo Previews</p>
                                            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                                                {/* Newly selected file previews */}
                                                {filePreviews.map((previewUrl, idx) => (
                                                    <div key={`new-${idx}`} className="relative h-20 rounded-lg overflow-hidden border border-indigo-200 group">
                                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                        <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] px-1 rounded font-bold">New</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePreview(idx)}
                                                            className="absolute top-1 right-1 h-5 w-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Existing images */}
                                                {(data.images || []).map((imgUrl, idx) => (
                                                    <div key={`exist-${idx}`} className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group">
                                                        <img src={imgUrl} alt="Facility" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveExistingImage(imgUrl)}
                                                            className="absolute top-1 right-1 h-5 w-5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
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
