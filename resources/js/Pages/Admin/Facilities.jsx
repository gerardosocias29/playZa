import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { getFacilities, saveFacilities } from '@/mockData';

export default function Facilities() {
    const [facilities, setFacilities] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form inputs
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [capacity, setCapacity] = useState(10);
    const [active, setActive] = useState(true);
    const [image, setImage] = useState('soccer');

    useEffect(() => {
        setFacilities(getFacilities());
    }, []);

    const openCreateForm = () => {
        setEditId(null);
        setName('');
        setDescription('');
        setCapacity(10);
        setActive(true);
        setImage('soccer');
        setIsFormOpen(true);
    };

    const openEditForm = (facility) => {
        setEditId(facility.id);
        setName(facility.name);
        setDescription(facility.description);
        setCapacity(facility.capacity);
        setActive(facility.active);
        setImage(facility.image || 'soccer');
        setIsFormOpen(true);
    };

    const handleToggleActive = (id) => {
        const updated = facilities.map(f => f.id === id ? { ...f, active: !f.active } : f);
        saveFacilities(updated);
        setFacilities(updated);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this facility?')) {
            const updated = facilities.filter(f => f.id !== id);
            saveFacilities(updated);
            setFacilities(updated);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            alert('Facility name is required');
            return;
        }

        let updated;
        if (editId) {
            updated = facilities.map(f => f.id === editId ? { 
                ...f, 
                name, 
                description, 
                capacity: parseInt(capacity), 
                active, 
                image 
            } : f);
        } else {
            const newFacility = {
                id: Date.now(),
                name,
                description,
                capacity: parseInt(capacity),
                active,
                image
            };
            updated = [...facilities, newFacility];
        }

        saveFacilities(updated);
        setFacilities(updated);
        setIsFormOpen(false);
    };

    return (
        <AdminLayout title="Facility Registry">
            <Head title="Facility Registry - PlayZa" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-slate-500 text-sm">Add, remove, or modify Getafe sports centers and courts</p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 hover-scale"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Facility
                </button>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {facilities.map((fac) => (
                    <div key={fac.id} className={`glass-panel rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:border-slate-300 shadow-sm bg-white ${!fac.active ? 'opacity-65' : ''}`}>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                                    fac.active 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-slate-100 text-slate-500 border-slate-205'
                                }`}>
                                    {fac.active ? 'Operational' : 'Maintenance'}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditForm(fac)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-650 rounded-lg hover:bg-indigo-50 transition-colors"
                                        title="Edit Facility"
                                    >
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(fac.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-650 rounded-lg hover:bg-rose-50 transition-colors"
                                        title="Delete Facility"
                                    >
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-title font-bold text-lg text-slate-900 mb-1.5">{fac.name}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">{fac.description}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Max Capacity: <span className="font-semibold text-slate-800">{fac.capacity} players</span></span>
                            
                            <button
                                onClick={() => handleToggleActive(fac.id)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                                    fac.active
                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-705 border-emerald-200'
                                }`}
                            >
                                {fac.active ? 'Disable Facility' : 'Enable Facility'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form Overlay */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-title font-bold text-lg text-slate-900">
                                {editId ? 'Modify Facility' : 'Register New Facility'}
                            </h3>
                            <button 
                                onClick={() => setIsFormOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-905 rounded-lg hover:bg-slate-50"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Facility Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Center Tennis Court B"
                                    className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide dimensions, features, floor type..."
                                    rows="3"
                                    className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400 text-sm resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Max Capacity</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={capacity}
                                        onChange={(e) => setCapacity(e.target.value)}
                                        className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sport Icon</label>
                                    <select
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        className="block w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                                    >
                                        <option value="soccer">Soccer Field</option>
                                        <option value="basketball">Basketball Court</option>
                                        <option value="tennis">Tennis Court</option>
                                        <option value="padel">Padel Court</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center pt-2">
                                <input
                                    id="modal-active"
                                    type="checkbox"
                                    checked={active}
                                    onChange={(e) => setActive(e.target.checked)}
                                    className="h-4 w-4 text-indigo-650 focus:ring-indigo-500 border-slate-300 rounded bg-white"
                                />
                                <label htmlFor="modal-active" className="ml-2.5 text-sm font-semibold text-slate-700">
                                    Operational Status (Available for Reservation)
                                </label>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-indigo-500/10"
                                >
                                    {editId ? 'Save Changes' : 'Create Facility'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
