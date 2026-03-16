import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin, Type, Hash, Users, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Ride, Location } from '../../types';

export interface RideFormProps {
  ride?: Ride | null;
  locations: Location[];
  onSave: (data: Partial<Ride>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const rideTypes = [
  'Interval Batch Loader',
  'Continuous Mover',
  'Free Flow',
  'Show',
  'Dark Ride',
  'Roller Coaster',
  'Motion Simulator',
  'Carousel'
];

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
    rideType: rideTypes[0],
    guests: [],
    evenOddLines: false,
    singleRiders: false,
    rowRequest: false,
    doubleGroupable: false,
    active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dimensions, setDimensions] = useState({ width: 0, rows: 0, height: 0 });

  // Accordion state
  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    vehicleConfig: false,
    loadingPrefs: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (ride) {
      // Parse guests array for dimensions
      let width = 0, rows = 0, height = 0;
      if (Array.isArray(ride.guests)) {
        if (ride.guests.length > 0 && Array.isArray(ride.guests[0])) {
          rows = ride.guests.length;
          height = (ride.guests[0] as number[]).length;
          width = Math.max(...ride.guests.map((row: any) => row.length));
        } else {
          width = ride.guests.length;
        }
      }

      setFormData({ ...ride });
      setDimensions({ width, rows, height });
    }
  }, [ride]);

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

  const updateDimensions = (field: keyof typeof dimensions, value: number) => {
    const newDimensions = { ...dimensions, [field]: value };
    setDimensions(newDimensions);

    // Generate guests array from dimensions
    if (newDimensions.width > 0 && newDimensions.rows > 0) {
      // 2D array
      const guests: number[][] = [];
      for (let r = 0; r < newDimensions.rows; r++) {
        const row: number[] = [];
        for (let w = 0; w < newDimensions.width; w++) {
          for (let h = 0; h < newDimensions.height; h++) {
            row.push(1);
          }
        }
        guests.push(row);
      }
      setFormData(prev => ({ ...prev, guests }));
    } else if (newDimensions.width > 0 && newDimensions.rows === 0) {
      // 1D array
      const guests: number[] = [];
      for (let h = 0; h < newDimensions.height; h++) {
        for (let w = 0; w < newDimensions.width; w++) {
          guests.push(1);
        }
      }
      setFormData(prev => ({ ...prev, guests }));
    }
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
      onSave(formData);
    }
  };

  const getCapacity = () => {
    if (!formData.guests) return 0;
    if (Array.isArray(formData.guests[0])) {
      return (formData.guests as number[][]).reduce((sum, row) => sum + row.length, 0);
    }
    return (formData.guests as number[]).length;
  };

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
                {rideTypes.map(type => (
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

          {/* Section 2: Vehicle Configuration */}
          <AccordionSection
            title="Vehicle Configuration"
            icon={<Users className="w-4 h-4" />}
            isOpen={openSections.vehicleConfig}
            onToggle={() => toggleSection('vehicleConfig')}
          >
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-indigo-300/70 mb-1 block">Width (seats)</label>
                <input
                  type="number"
                  min="0"
                  value={dimensions.width}
                  onChange={(e) => updateDimensions('width', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-indigo-400/30 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs text-indigo-300/70 mb-1 block">Rows</label>
                <input
                  type="number"
                  min="0"
                  value={dimensions.rows}
                  onChange={(e) => updateDimensions('rows', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-indigo-400/30 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs text-indigo-300/70 mb-1 block">Height</label>
                <input
                  type="number"
                  min="0"
                  value={dimensions.height}
                  onChange={(e) => updateDimensions('height', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-indigo-400/30 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div className="mt-3 text-xs text-indigo-300/60">
              Capacity: <span className="text-amber-300 font-semibold">{getCapacity()}</span> guests per vehicle
            </div>
          </AccordionSection>

          {/* Section 3: Loading Preferences */}
          <AccordionSection
            title="Loading Preferences"
            icon={<Hash className="w-4 h-4" />}
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
