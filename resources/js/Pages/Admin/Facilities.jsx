import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import FacilityCarousel from '@/Components/FacilityCarousel';

export default function Facilities({ facilities = [] }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const { data, setData, post, put, reset, errors } = useForm({
        name: '',
        type: 'Indoor',
        category: 'Sports',
        description: '',
        requires_event_type: false,
        active: true,
    });

    const openCreateForm = () => {
        setEditId(null);
        reset();
        setIsFormOpen(true);
    };

    const openEditForm = (facility) => {
        setEditId(facility.id);
        setData({
            name: facility.name || '',
            type: facility.type || 'Indoor',
            category: facility.category || 'Sports',
            description: facility.description || '',
            requires_event_type: !!facility.requires_event_type,
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editId) {
            put(route('admin.facilities.update', editId), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                }
            });
        } else {
            post(route('admin.facilities.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                }
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
                        <p className="text-sm text-slate-500">Manage court availability, images, descriptions, and rules.</p>
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
                            <div key={facility.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className="h-48 bg-slate-100 relative">
                                    <FacilityCarousel images={facility.images} name={facility.name} />
                                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                                            facility.active ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                                        }`}>
                                            {facility.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className="font-bold text-slate-900 text-lg">{facility.name}</h3>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                                {facility.type}
                                            </span>
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
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editId ? 'Edit Facility' : 'Create New Facility'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Facility Name</label>
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
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Type</label>
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
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Category</label>
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

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-xl text-sm"
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="requires_event_type"
                                    checked={data.requires_event_type}
                                    onChange={(e) => setData('requires_event_type', e.target.checked)}
                                    className="rounded text-indigo-600"
                                />
                                <label htmlFor="requires_event_type" className="text-xs font-medium text-slate-700">Requires Event Type selection</label>
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
