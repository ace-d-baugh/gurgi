import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Pencil, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { Location } from '../../types';
import { ConfirmDialog } from './ConfirmDialog';

export interface LocationsListProps {
 locations: Location[];
 onCreate: (data: Partial<Location>) => void;
 onUpdate: (id: string, data: Partial<Location>) => void;
 onDelete: (id: string) => void;
 isLoading?: boolean;
}

export const LocationsList: React.FC<LocationsListProps> = ({
 locations,
 onCreate,
 onUpdate,
 onDelete,
 isLoading = false
}) => {
 const [editingId, setEditingId] = useState<string | null>(null);
 const [editForm, setEditForm] = useState<Partial<Location>>({ name: '', slug: '' });
 const [showCreate, setShowCreate] = useState(false);
 const [createForm, setCreateForm] = useState<Partial<Location>>({ name: '', slug: '' });
 const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; name: string }>(
 { isOpen: false, id: null, name: '' }
 );

 const generateSlug = (name: string) => {
 return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
 };

 const handleNameChange = (value: string, isEdit: boolean) => {
 const slug = generateSlug(value);
 if (isEdit) {
 setEditForm(prev => ({ ...prev, name: value, slug }));
 } else {
 setCreateForm(prev => ({ ...prev, name: value, slug }));
 }
 };

 const handleEdit = (location: Location) => {
 setEditingId(location._id);
 setEditForm({ name: location.name, slug: location.slug });
 };

 const handleSaveEdit = async () => {
 if (editingId && editForm.name) {
 await onUpdate(editingId, editForm);
 setEditingId(null);
 setEditForm({ name: '', slug: '' });
 }
 };

 const handleCreate = async () => {
 if (createForm.name) {
 await onCreate(createForm);
 setCreateForm({ name: '', slug: '' });
 setShowCreate(false);
 }
 };

 const handleDeleteClick = (location: Location) => {
 setDeleteConfirm({ isOpen: true, id: location._id, name: location.name });
 };

 const handleConfirmDelete = async () => {
 if (deleteConfirm.id) {
 await onDelete(deleteConfirm.id);
 setDeleteConfirm({ isOpen: false, id: null, name: '' });
 }
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h2 className="text-2xl font-bold text-white">Locations</h2>
 <p className="text-indigo-300/70 text-sm mt-1">Manage park locations and areas</p>
 </div>
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => setShowCreate(true)}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all"
 >
 <Plus className="w-5 h-5" />
 Add Location
 </motion.button>
 </div>

 {/* Create Form */}
 {showCreate && (
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30"
 >
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-white">Create New Location</h3>
 <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-white/20 rounded">
 <X className="w-5 h-5 text-indigo-300" />
 </button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-indigo-200 mb-2">Name</label>
 <input
 type="text"
 value={createForm.name}
 onChange={(e) => handleNameChange(e.target.value, false)}
 placeholder="e.g. Magic Kingdom"
 className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-indigo-400/30 text-white placeholder-indigo-300/50 focus:outline-none focus:border-indigo-400"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-indigo-200 mb-2">Slug</label>
 <input
 type="text"
 value={createForm.slug}
 onChange={(e) => setCreateForm(prev => ({ ...prev, slug: e.target.value }))}
 placeholder="auto-generated"
 className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-indigo-400/30 text-white placeholder-indigo-300/50 focus:outline-none focus:border-indigo-400"
 />
 <p className="text-xs text-indigo-400/60 mt-1">URL-friendly identifier</p>
 </div>
 </div>
 <div className="flex gap-3 mt-4 justify-end">
 <button
 onClick={() => setShowCreate(false)}
 className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
 >
 Cancel
 </button>
 <button
 onClick={handleCreate}
 disabled={isLoading || !createForm.name}
 className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-medium transition-all flex items-center gap-2 disabled:opacity-50"
 >
 <Save className="w-4 h-4" />
 Create
 </button>
 </div>
 </motion.div>
 )}

 {/* Table */}
 <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-xl">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="bg-indigo-900/50 border-b border-indigo-500/30">
 <th className="text-left px-6 py-4 text-indigo-200 font-semibold text-sm uppercase tracking-wide">Name</th>
 <th className="text-left px-6 py-4 text-indigo-200 font-semibold text-sm uppercase tracking-wide">Slug</th>
 <th className="text-left px-6 py-4 text-indigo-200 font-semibold text-sm uppercase tracking-wide">Status</th>
 <th className="text-right px-6 py-4 text-indigo-200 font-semibold text-sm uppercase tracking-wide w-32">Actions</th>
 </tr>
 </thead>
 <tbody>
 {locations.length === 0 ? (
 <tr>
 <td colSpan={4} className="px-6 py-12 text-center text-indigo-300/50">
 <div className="flex flex-col items-center gap-3">
 <MapPin className="w-12 h-12 opacity-30" />
 <p>No locations found. Create your first location!</p>
 </div>
 </td>
 </tr>
 ) : (
 locations.map((location) => (
 <motion.tr
 key={location._id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="border-b border-indigo-500/10 hover:bg-white/5 transition-colors"
 >
 {editingId === location._id ? (
 <>
 <td className="px-6 py-4">
 <input
 type="text"
 value={editForm.name}
 onChange={(e) => handleNameChange(e.target.value, true)}
 className="w-full max-w-xs px-3 py-2 rounded-lg bg-white/10 border border-indigo-400/50 text-white focus:outline-none focus:border-indigo-400"
 />
 </td>
 <td className="px-6 py-4">
 <input
 type="text"
 value={editForm.slug}
 onChange={(e) => setEditForm(prev => ({ ...prev, slug: e.target.value }))}
 className="w-full max-w-xs px-3 py-2 rounded-lg bg-white/10 border border-indigo-400/50 text-white focus:outline-none focus:border-indigo-400"
 />
 </td>
 <td className="px-6 py-4">
 <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
 Active
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={handleSaveEdit}
 className="p-2 hover:bg-green-500/20 rounded-lg transition-all"
 title="Save"
 >
 <Save className="w-4 h-4 text-green-400" />
 </button>
 <button
 onClick={() => setEditingId(null)}
 className="p-2 hover:bg-white/20 rounded-lg transition-all"
 title="Cancel"
 >
 <X className="w-4 h-4 text-indigo-300" />
 </button>
 </div>
 </td>
 </>
 ) : (
 <>
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <MapPin className="w-5 h-5 text-amber-400" />
 <span className="font-medium text-white">{location.name}</span>
 </div>
 </td>
 <td className="px-6 py-4 text-indigo-300/70 font-mono text-sm">{location.slug}</td>
 <td className="px-6 py-4">
 <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
 Active
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-1">
 <button
 onClick={() => handleEdit(location)}
 className="p-2 hover:bg-indigo-500/20 rounded-lg transition-all"
 title="Edit"
 >
 <Pencil className="w-4 h-4 text-indigo-300" />
 </button>
 <button
 onClick={() => handleDeleteClick(location)}
 className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
 title="Delete"
 >
 <Trash2 className="w-4 h-4 text-red-400" />
 </button>
 </div>
 </td>
 </>
 )}
 </motion.tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Delete Confirmation */}
 <ConfirmDialog
 isOpen={deleteConfirm.isOpen}
 title="Delete Location"
 message={`Are you sure you want to delete "${deleteConfirm.name}"? This will soft-delete the location and hide it from the public site. This action cannot be undone.`}
 onConfirm={handleConfirmDelete}
 onCancel={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
 />
 </div>
 );
};
