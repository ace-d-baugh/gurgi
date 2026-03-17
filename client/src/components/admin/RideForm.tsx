import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin, Type, Users, Check, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { Ride, Location } from '../../types';

export interface RideFormProps {
 ride?: Ride | null;
 locations: Location[];
 onSave: (data: Partial<Ride>) => void;
 onCancel: () => void;
 isLoading?: boolean;
}

// Official RideType enum - matching server model
const RIDE_TYPES = [
 'Stop and Go Single Vehicle',
 'Interval Batch Loader', 
 'Continuous Mover',
 'Corral Counter',
 'Multiple Interval Batch Loader',
 'Multiple Stop and Go Single Vehicle'
] as const;

type RideType = typeof RIDE_TYPES[number];

interface AccordionSectionProps {
 title: string;
 icon: React.ReactNode;
 isOpen: boolean;
 onToggle: () => void;
 children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, icon, isOpen, onToggle, children }) => (
 <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
 <button
 type="button"
 onClick={onToggle}
 className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
 >
 <div className="flex items-center gap-2 text-sm font-semibold text-indigo-200">
 {icon}
 {title}
 </div>
 {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-300" /> : <ChevronDown className="w-4 h-4 text-indigo-300" />}
 </button>
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 >
 <div className="p-4 border-t border-white/10">
 {children}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
);

// Row configuration interface
interface RowConfig {
 seats: number;
 type: RideType;
}

export const RideForm: React.FC<RideFormProps> = ({
 ride,
 locations,
 onSave,
 onCancel,
 isLoading = false
}) => {
 const [formData, setFormData] = useState<Partial<Ride>>({
 name: '',
 nameSlug: '',
 description: '',
 location: undefined,
 rideType: 'Stop and Go Single Vehicle' as RideType,
 guests: [],
 evenOddLines: false,
 singleRiders: false,
 rowRequest: false,
 doubleGroupable: false,
 active: true
 });

 const [errors, setErrors] = useState<Record<string, string>>({});
 
 // Row-based configuration state
 const [rows, setRows] = useState<RowConfig[]>([
 { seats: 2, type: 'Stop and Go Single Vehicle' }
 ]);
 
 // Corral Counter specific state
 const [corralCapacity, setCorralCapacity] = useState<number>(10);

 // Accordion state
 const [openSections, setOpenSections] = useState({
 basicInfo: true,
 vehicleConfig: false,
 loadingPrefs: false
 });

 const toggleSection = (section: keyof typeof openSections) => {
 setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
 };

 // When editing, parse existing guests array
 useEffect(() => {
 if (ride) {
 setFormData({ ...ride });
 
 // Parse guests array
 if (Array.isArray(ride.guests) && ride.guests.length > 0) {
 if (Array.isArray(ride.guests[0])) {
 // Multi-row format: [[2,2],[4,4]] - flattened: [2,2,4,4]
 const parsedRows: RowConfig[] = [];
 (ride.guests as number[][]).forEach(rowArray => {
 // If row is array of seats per row, take the sum or first element
 if (Array.isArray(rowArray)) {
 parsedRows.push({ seats: rowArray.reduce((a, b) => a + b, 0) || rowArray[0] || 1, type: (ride.rideType as RideType) || 'Stop and Go Single Vehicle' });
 } else {
 parsedRows.push({ seats: rowArray as unknown as number, type: (ride.rideType as RideType) || 'Stop and Go Single Vehicle' });
 }
 });
 if (parsedRows.length > 0) {
 setRows(parsedRows);
 }
 } else {
 // Single-row format: [2,2,2] or flat array - treat as one row with capacity
 const capacity = (ride.guests as number[]).reduce((a, b) => a + b, 0);
 if (ride.rideType === 'Corral Counter') {
 setCorralCapacity(capacity || 10);
 setRows([{ seats: capacity || 10, type: 'Corral Counter' }]);
 } else {
 setRows([{ seats: capacity, type: (ride.rideType as RideType) || 'Stop and Go Single Vehicle' }]);
 }
 }
 }
 }
 }, [ride]);

 // Generate guests array from rows configuration
 const generateGuestsArray = (): number[] | number[][] => {
 const rideType = formData.rideType as RideType;
 
 if (rideType === 'Corral Counter') {
 // Corral Counter: single number [capacity]
 return [corralCapacity];
 }
 
 if (rows.length === 1) {
 // Single row: flat array with seat positions
 return Array(rows[0].seats).fill(1);
 }
 
 // Multiple rows: array of seat arrays
 return rows.map(row => Array(row.seats).fill(1));
 };

 const generateSlug = (name: string) => {
 return name
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/(^-|-$)/g, '');
 };

 const handleNameChange = (value: string) => {
 const slug = generateSlug(value);
 setFormData(prev => ({ ...prev, name: value, nameSlug: slug }));
 if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
 };

 const handleChange = (field: keyof Ride, value: any) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
 };

 // Add a new row
 const addRow = () => {
 const currentType = formData.rideType as RideType;
 if (currentType === 'Corral Counter') return; // No rows for Corral Counter
 
 const lastRow = rows[rows.length - 1];
 setRows([...rows, { seats: lastRow?.seats || 2, type: currentType }]);
 };

 // Remove a row (not the first one)
 const removeRow = (index: number) => {
 if (index === 0 || rows.length <= 1) return;
 setRows(rows.filter((_, i) => i !== index));
 };

 // Update seats for a specific row
 const updateRowSeats = (index: number, seats: number) => {
 const newSeats = Math.max(1, Math.min(20, seats));
 setRows(rows.map((row, i) => i === index ? { ...row, seats: newSeats } : row));
 };

 // Cycle ride type for a row
 const cycleRowType = (index: number) => {
 const currentType = rows[index].type;
 const currentIndex = RIDE_TYPES.indexOf(currentType);
 const nextIndex = (currentIndex + 1) % RIDE_TYPES.length;
 const nextType = RIDE_TYPES[nextIndex];
 
 // Update row type
 const newRows = rows.map((row, i) => i === index ? { ...row, type: nextType } : row);
 
 // If Corral Counter selected, update corral capacity
 if (nextType === 'Corral Counter') {
 setCorralCapacity(rows[index].seats);
 // Reset to single row for Corral
 setRows([{ seats: rows[index].seats, type: nextType }]);
 } else {
 setRows(newRows);
 }
 
 // Update main ride type
 handleChange('rideType', nextType);
 };

 // Get row label (for Corral Counter show "Max Capacity")
 const getRowLabel = (index: number): string => {
 if (formData.rideType === 'Corral Counter') {
 return 'Max Capacity';
 }
 return `Row ${index + 1}`;
 };

 const validate = (): boolean => {
 const newErrors: Record<string, string> = {};

 if (!formData.name?.trim()) {
 newErrors.name = 'Name is required';
 }
 if (!formData.location) {
 newErrors.location = 'Location is required';
 }
 if (!formData.rideType) {
 newErrors.rideType = 'Ride type is required';
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (validate()) {
 const guests = generateGuestsArray();
 const dataToSave = { ...formData, guests };
 onSave(dataToSave);
 }
 };

 const getCapacity = () => {
 const guests = generateGuestsArray();
 if (Array.isArray(guests[0])) {
 return (guests as number[][]).reduce((sum, row) => sum + row.length, 0);
 }
 return (guests as number[]).reduce((sum, n) => sum + (typeof n === 'number' ? n : 0), 0);
 };

 const isCorralCounter = formData.rideType === 'Corral Counter';

 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
 onClick={onCancel}
 >
 <motion.div
 initial={{ scale: 0.95, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/20"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-indigo-900/90 backdrop-blur-xl p-6 border-b border-indigo-400/30">
 <div className="flex items-center justify-between">
 <h2 className="text-xl font-bold text-white">
 {ride ? 'Edit Ride' : 'Create New Ride'}
 </h2>
 <button
 onClick={onCancel}
 className="p-2 hover:bg-white/20 rounded-full transition-all"
 >
 <X className="w-5 h-5 text-white" />
 </button>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 {/* Section 1: Basic Info */}
 <AccordionSection
 title="Basic Info"
 icon={<Type className="w-4 h-4" />}
 isOpen={openSections.basicInfo}
 onToggle={() => toggleSection('basicInfo')}
 >
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="flex items-center gap-2 text-sm font-medium text-indigo-200">
 <Type className="w-4 h-4" /> Ride Name
 </label>
 <input
 type="text"
 value={formData.name || ''}
 onChange={(e) => handleNameChange(e.target.value)}
 placeholder="e.g. Space Mountain"
 className="w-full px-4 py-3 rounded-xl bg-white/10 border border-indigo-400/30 text-white placeholder-indigo-300/50 focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all"
 />
 {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
 {formData.nameSlug && (
 <p className="text-indigo-300/60 text-xs">Slug: {formData.nameSlug}</p>
 )}
 </div>

 <div className="space-y-2">
 <label className="flex items-center gap-2 text-sm font-medium text-indigo-200">
 <MapPin className="w-4 h-4" /> Location
 </label>
 <select
 value={typeof formData.location === 'object' ? formData.location?._id : formData.location || ''}
 onChange={(e) => {
 const loc = locations.find(l => l._id === e.target.value);
 handleChange('location', loc);
 }}
 className="w-full px-4 py-3 rounded-xl bg-white/10 border border-indigo-400/30 text-white focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all"
 >
 <option value="" className="bg-slate-800">Select location...</option>
 {locations.map(loc => (
 <option key={loc._id} value={loc._id} className="bg-slate-800">{loc.name}</option>
 ))}
 </select>
 {errors.location && <p className="text-red-400 text-sm">{errors.location}</p>}
 </div>
 </div>

 <div className="space-y-2 mt-4">
 <label className="text-sm font-medium text-indigo-200">Ride Type</label>
 <select
 value={formData.rideType || ''}
 onChange={(e) => handleChange('rideType', e.target.value)}
 className="w-full px-4 py-3 rounded-xl bg-white/10 border border-indigo-400/30 text-white focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all"
 >
 {RIDE_TYPES.map(type => (
 <option key={type} value={type} className="bg-slate-800">{type}</option>
 ))}
 </select>
 </div>

 <div className="mt-4">
 <label className="flex items-center gap-3 cursor-pointer group">
 <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.active ? 'bg-green-500 border-green-500' : 'border-indigo-400/50 group-hover:border-indigo-400'}`}>
 {formData.active && <Check className="w-3 h-3 text-white" />}
 </div>
 <input
 type="checkbox"
 checked={formData.active}
 onChange={(e) => handleChange('active', e.target.checked)}
 className="sr-only"
 />
 <span className="text-sm text-indigo-100 font-medium">Active</span>
 </label>
 </div>
 </AccordionSection>

 {/* Section 2: Vehicle Configuration - REDESIGNED */}
 <AccordionSection
 title="Vehicle Configuration"
 icon={<Users className="w-4 h-4" />}
 isOpen={openSections.vehicleConfig}
 onToggle={() => toggleSection('vehicleConfig')}
 >
 {/* Row-based Configuration */}
 <div className="space-y-3">
 {isCorralCounter ? (
 // Corral Counter: Single "Max Capacity" input
 <div className="bg-white/5 rounded-lg p-4 border border-indigo-400/20">
 <label className="text-sm font-medium text-indigo-200 mb-2 block">
 Max Capacity
 </label>
 <input
 type="number"
 min="1"
 max="100"
 value={corralCapacity}
 onChange={(e) => setCorralCapacity(parseInt(e.target.value) || 1)}
 className="w-24 px-3 py-2 rounded-lg bg-white/10 border border-indigo-400/30 text-white text-center font-semibold focus:outline-none focus:border-indigo-400"
 />
 </div>
 ) : (
 // Multi-row configuration with +/- buttons
 rows.map((row, index) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white/5 rounded-lg p-3 border border-indigo-400/20 flex items-center gap-3"
 >
 {/* Clickable Row Label - cycles through types */}
 <button
 type="button"
 onClick={() => cycleRowType(index)}
 className="px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-lg text-indigo-200 text-sm font-medium transition-colors min-w-[120px] text-center"
 >
 {getRowLabel(index)}
 </button>

 <div className="flex-1 flex items-center gap-2">
 <span className="text-sm text-indigo-300/70">Seats:</span>
 <input
 type="number"
 min="1"
 max="20"
 value={row.seats}
 onChange={(e) => updateRowSeats(index, parseInt(e.target.value) || 1)}
 className="w-16 px-2 py-2 rounded-lg bg-white/10 border border-indigo-400/30 text-white text-center focus:outline-none focus:border-indigo-400"
 />
 </div>

 {/* Show +/- buttons only for non-Corral multi-row */}
 <div className="flex items-center gap-1">
 {index === 0 ? (
 <button
 type="button"
 onClick={addRow}
 className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-300 transition-colors"
 title="Add row"
 >
 <Plus className="w-4 h-4" />
 </button>
 ) : (
 <button
 type="button"
 onClick={() => removeRow(index)}
 className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-300 transition-colors"
 title="Remove row"
 >
 <Minus className="w-4 h-4" />
 </button>
 )}
 </div>
 </motion.div>
 ))
 )}
 </div>

 {/* Configuration Preview */}
 <div className="mt-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-400/20">
 <div className="text-xs text-indigo-300/60 mb-1">Configuration:</div>
 <div className="text-sm font-mono text-amber-300">
 {isCorralCounter ? `[${corralCapacity}]` : JSON.stringify(rows.map(r => r.seats))}
 </div>
 <div className="mt-2 text-xs text-indigo-300/60">
 Total Capacity: <span className="text-amber-300 font-semibold">{getCapacity()}</span> guests
 </div>
 </div>
 </AccordionSection>

 {/* Section 3: Loading Preferences */}
 <AccordionSection
 title="Loading Preferences"
 icon={<Users className="w-4 h-4" />}
 isOpen={openSections.loadingPrefs}
 onToggle={() => toggleSection('loadingPrefs')}
 >
 <div className="grid grid-cols-2 gap-4">
 <label className="flex items-center gap-3 cursor-pointer group">
 <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.singleRiders ? 'bg-amber-500 border-amber-500' : 'border-indigo-400/50 group-hover:border-indigo-400'}`}>
 {formData.singleRiders && <Check className="w-3 h-3 text-white" />}
 </div>
 <input
 type="checkbox"
 checked={formData.singleRiders}
 onChange={(e) => handleChange('singleRiders', e.target.checked)}
 className="sr-only"
 />
 <span className="text-sm text-indigo-100">Single Riders</span>
 </label>

 <label className="flex items-center gap-3 cursor-pointer group">
 <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.evenOddLines ? 'bg-amber-500 border-amber-500' : 'border-indigo-400/50 group-hover:border-indigo-400'}`}>
 {formData.evenOddLines && <Check className="w-3 h-3 text-white" />}
 </div>
 <input
 type="checkbox"
 checked={formData.evenOddLines}
 onChange={(e) => handleChange('evenOddLines', e.target.checked)}
 className="sr-only"
 />
 <span className="text-sm text-indigo-100">Even/Odd Lines</span>
 </label>

 <label className="flex items-center gap-3 cursor-pointer group">
 <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.rowRequest ? 'bg-amber-500 border-amber-500' : 'border-indigo-400/50 group-hover:border-indigo-400'}`}>
 {formData.rowRequest && <Check className="w-3 h-3 text-white" />}
 </div>
 <input
 type="checkbox"
 checked={formData.rowRequest}
 onChange={(e) => handleChange('rowRequest', e.target.checked)}
 className="sr-only"
 />
 <span className="text-sm text-indigo-100">Row Requests</span>
 </label>

 <label className="flex items-center gap-3 cursor-pointer group">
 <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.doubleGroupable ? 'bg-amber-500 border-amber-500' : 'border-indigo-400/50 group-hover:border-indigo-400'}`}>
 {formData.doubleGroupable && <Check className="w-3 h-3 text-white" />}
 </div>
 <input
 type="checkbox"
 checked={formData.doubleGroupable}
 onChange={(e) => handleChange('doubleGroupable', e.target.checked)}
 className="sr-only"
 />
 <span className="text-sm text-indigo-100">Double Grouping</span>
 </label>
 </div>
 </AccordionSection>

 {/* Actions */}
 <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 type="button"
 onClick={onCancel}
 disabled={isLoading}
 className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/20 disabled:opacity-50"
 >
 Cancel
 </motion.button>
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 type="submit"
 disabled={isLoading}
 className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
 >
 <Save className="w-4 h-4" />
 {isLoading ? 'Saving...' : (ride ? 'Update Ride' : 'Create Ride')}
 </motion.button>
 </div>
 </form>
 </motion.div>
 </motion.div>
 );
};
export default RideForm;
