import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin } from 'lucide-react';
import { Location } from '../../types';

interface LocationFormModalProps {
 isOpen: boolean;
 location: Location | null;
 onSave: (data: Partial<Location>) => void;
 onCancel: () => void;
 isLoading?: boolean;
}

export const LocationFormModal: React.FC<LocationFormModalProps> = ({
 isOpen,
 location,
 onSave,
 onCancel,
 isLoading = false,
}) => {
 const [formData, setFormData] = useState<Partial<Location>>({ name: '' });

 useEffect(() => {
 if (location) {
 setFormData({ name: location.name });
 } else {
 setFormData({ name: '' });
 }
 }, [location, isOpen]);

 const generateSlug = (name: string) => {
 return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
 };

 const handleNameChange = (value: string) => {
 setFormData({ name: value });
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (formData.name) {
 const slug = generateSlug(formData.name);
 onSave({ ...formData, slug });
 }
 };

 if (!isOpen) return null;

 return (
 <AnimatePresence>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
 onClick={onCancel}
 >
 <motion.div
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-amber-500/20 rounded-lg">
 <MapPin className="w-5 h-5 text-amber-400" />
 </div>
 <h2 className="text-xl font-semibold text-white">
 {location ? 'Edit Location' : 'Create New Location'}
 </h2>
 </div>
 <button
 onClick={onCancel}
 className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
 >
 <X className="w-5 h-5 text-gray-400" />
 </button>
 </div>

 {/* Form */}
 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 <div>
 <label className="block text-sm font-medium text-gray-300 mb-2">
 Location Name
 </label>
 <input
 type="text"
 value={formData.name || ''}
 onChange={(e) => handleNameChange(e.target.value)}
 placeholder="e.g. Main Entrance"
 className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
 autoFocus
 />
 <p className="mt-2 text-xs text-gray-500">
 URL-friendly slug will be auto-generated
 </p>
 </div>

 {/* Buttons */}
 <div className="flex gap-3 pt-2">
 <button
 type="button"
 onClick={onCancel}
 className="flex-1 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-all"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isLoading || !formData.name}
 className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
 >
 <Save className="w-4 h-4" />
 {location ? 'Save Changes' : 'Create Location'}
 </button>
 </div>
 </form>
 </motion.div>
 </motion.div>
 </AnimatePresence>
 );
};
