import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Location } from '../../types';
import { LocationFormModal } from './LocationFormModal';
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
 isLoading = false,
}) => {
 const [showModal, setShowModal] = useState(false);
 const [editingLocation, setEditingLocation] = useState<Location | null>(null);
 const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; name: string }>(
 { isOpen: false, id: null, name: '' }
 );

 const handleCreate = async (data: Partial<Location>) => {
 await onCreate(data);
 setShowModal(false);
 };

 const handleEdit = (location: Location) => {
 setEditingLocation(location);
 setShowModal(true);
 };

 const handleSave = async (data: Partial<Location>) => {
 if (editingLocation) {
 await onUpdate(editingLocation._id, data);
 } else {
 await onCreate(data);
 }
 setShowModal(false);
 setEditingLocation(null);
 };

 const handleNewLocation = () => {
 setEditingLocation(null);
 setShowModal(true);
 };

 const handleCloseModal = () => {
 setShowModal(false);
 setEditingLocation(null);
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
 onClick={handleNewLocation}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all"
 >
 <Plus className="w-5 h-5" />
 Add Location
 </motion.button>
 </div>

 {/* Table - Slug column removed */}
 <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-xl">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="bg-indigo-900/50 border-b border-indigo-500/30">
 <th className="text-left px-6 py-4 text-indigo-200 font-semibold text-sm uppercase tracking-wide">Name</th>
 <th className="text-left px-6 py-4 text-indigo-200 font-semibold text-sm uppercase tracking-wide">Status</th>
 <th className="text-right px-6 py-4 text-indigo-200 font-semibold text-sm uppercase tracking-wide w-32">Actions</th>
 </tr>
 </thead>
 <tbody>
 {locations.length === 0 ? (
 <tr>
 <td colSpan={3} className="px-6 py-12 text-center text-indigo-300/50">
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
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <MapPin className="w-5 h-5 text-amber-400" />
 <span className="font-medium text-white">{location.name}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${
 location.isActive
 ? 'bg-green-500/20 text-green-300 border border-green-500/30'
 : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
 }`}>
 {location.isActive ? 'Active' : 'Inactive'}
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
 </motion.tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Modal - Task 10, 11: Popup form with only Name field */}
 <LocationFormModal
 isOpen={showModal}
 location={editingLocation}
 onSave={handleSave}
 onCancel={handleCloseModal}
 isLoading={isLoading}
 />

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
