import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, Settings, AlertCircle } from 'lucide-react';

export interface GameOptions {
 timerEnabled: boolean;
 timerDuration: number;
 visibleGuests: number;
 maxGroupSize: number;
 tapToShow: boolean;
 doubleGrouping: boolean;
 vehiclesToComplete: number;
 singleRiders: boolean;
}

interface GameOptionsPopupProps {
 isOpen: boolean;
 onClose: () => void;
 onPlay: (options: GameOptions) => void;
 defaultOptions?: Partial<GameOptions>;
 rideName?: string;
}

const DEFAULT_OPTIONS: GameOptions = {
 timerEnabled: false,
 timerDuration: 60,
 visibleGuests: 16,
 maxGroupSize: 6,
 tapToShow: false,
 doubleGrouping: true,
 vehiclesToComplete: 5,
 singleRiders: false,
};

export default function GameOptionsPopup({ isOpen, onClose, onPlay, defaultOptions, rideName }: GameOptionsPopupProps) {
 const [options, setOptions] = useState<GameOptions>({ ...DEFAULT_OPTIONS, ...defaultOptions });
 const [errors, setErrors] = useState<Record<string, string>>({});

 const updateOption = <K extends keyof GameOptions>(key: K, value: GameOptions[K]) => {
 setOptions(prev => ({ ...prev, [key]: value }));
 if (errors[key]) {
 setErrors(prev => ({ ...prev, [key]: '' }));
 }
 };

 const validate = (): boolean => {
 const newErrors: Record<string, string> = {};

 if (options.visibleGuests < 8 || options.visibleGuests > 30) {
 newErrors.visibleGuests = 'Visible guests must be between 8 and 30';
 }
 if (options.maxGroupSize < 2 || options.maxGroupSize > 8) {
 newErrors.maxGroupSize = 'Max group size must be between 2 and 8';
 }
 if (options.vehiclesToComplete < 1 || options.vehiclesToComplete > 20) {
 newErrors.vehiclesToComplete = 'Vehicles must be between 1 and 20';
 }
 if (options.timerEnabled) {
 if (options.timerDuration < 30 || options.timerDuration > 300) {
 newErrors.timerDuration = 'Timer must be between 30 and 300 seconds';
 }
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handlePlay = () => {
 if (validate()) {
 onPlay(options);
 }
 };

 // Reset options when popup opens
 useEffect(() => {
 if (isOpen) {
 setOptions({ ...DEFAULT_OPTIONS, ...defaultOptions });
 setErrors({});
 }
 }, [isOpen, defaultOptions]);

 return (
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center p-4"
 >
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
 animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
 exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
 onClick={onClose}
 className="absolute inset-0 bg-gray-900/80"
 />

 {/* Modal */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 className="relative w-full max-w-2xl bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 rounded-2xl border border-indigo-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden max-h-[90vh] overflow-y-auto"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 p-6 border-b border-indigo-400/30">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-white">Game Options</h2>
 {rideName && <p className="text-indigo-200 text-sm mt-1">Configure training scenario for {rideName}</p>}
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-white/20 rounded-full transition-all"
 >
 <X className="w-6 h-6 text-white" />
 </button>
 </div>
 </div>

 <div className="p-6 space-y-6">
 {/* Timer Settings */}
 <section className="bg-white/5 rounded-xl p-4 border border-white/10">
 <div className="flex items-center gap-2 mb-4">
 <Clock className="w-5 h-5 text-amber-400" />
 <h3 className="text-lg font-semibold text-white">Timer Settings</h3>
 </div>

 <div className="space-y-4">
 <label className="flex items-center gap-3 cursor-pointer group">
 <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${options.timerEnabled ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
 {options.timerEnabled && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 bg-white rounded-sm" />}
 </div>
 <input
 type="checkbox"
 checked={options.timerEnabled}
 onChange={(e) => updateOption('timerEnabled', e.target.checked)}
 className="sr-only"
 />
 <span className="text-gray-200">Enable Timed Mode</span>
 </label>

 {options.timerEnabled && (
 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pl-9">
 <div className="flex items-center gap-3">
 <span className="text-gray-400 text-sm whitespace-nowrap">Duration:</span>
 <input
 type="number"
 min="30"
 max="300"
 value={options.timerDuration}
 onChange={(e) => updateOption('timerDuration', parseInt(e.target.value) || 60)}
 className="w-24 px-3 py-2 rounded bg-white/10 border border-gray-600 text-white text-center focus:border-indigo-400 focus:outline-none"
 />
 <span className="text-gray-400 text-sm">seconds</span>
 </div>
 {errors.timerDuration && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.timerDuration}</p>}
 </motion.div>
 )}
 </div>
 </section>

 {/* Guest Flow Settings */}
 <section className="bg-white/5 rounded-xl p-4 border border-white/10">
 <div className="flex items-center gap-2 mb-4">
 <Users className="w-5 h-5 text-blue-400" />
 <h3 className="text-lg font-semibold text-white">Guest Flow Settings</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm text-gray-300 mb-2">Visible Guests: {options.visibleGuests}</label>
 <input
 type="range"
 min="8"
 max="30"
 value={options.visibleGuests}
 onChange={(e) => updateOption('visibleGuests', parseInt(e.target.value))}
 className="w-full accent-indigo-500"
 />
 <div className="flex justify-between text-xs text-gray-500 mt-1">
 <span>8</span>
 <span>30</span>
 </div>
 {errors.visibleGuests && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.visibleGuests}</p>}
 </div>

 <div>
 <label className="block text-sm text-gray-300 mb-2">Max Guests Per Group</label>
 <input
 type="number"
 min="2"
 max="8"
 value={options.maxGroupSize}
 onChange={(e) => updateOption('maxGroupSize', parseInt(e.target.value) || 6)}
 className={`w-full px-3 py-2 rounded bg-white/10 border ${errors.maxGroupSize ? 'border-red-500' : 'border-gray-600'} text-white text-center focus:border-indigo-400 focus:outline-none`}
 />
 {errors.maxGroupSize && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.maxGroupSize}</p>}
 </div>
 </div>
 </section>

 {/* Gameplay Settings */}
 <section className="bg-white/5 rounded-xl p-4 border border-white/10">
 <div className="flex items-center gap-2 mb-4">
 <Settings className="w-5 h-5 text-green-400" />
 <h3 className="text-lg font-semibold text-white">Gameplay Settings</h3>
 </div>

 <div className="space-y-4">
 <label className="flex items-center gap-3 cursor-pointer group">
 <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${options.tapToShow ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
 {options.tapToShow && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 bg-white rounded-sm" />}
 </div>
 <input
 type="checkbox"
 checked={options.tapToShow}
 onChange={(e) => updateOption('tapToShow', e.target.checked)}
 className="sr-only"
 />
 <div>
 <span className="text-gray-200">Tap to Show Groups</span>
 <p className="text-gray-500 text-xs">Groups appear immediately without clicking</p>
 </div>
 </label>

 <label className="flex items-center gap-3 cursor-pointer group">
 <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${options.doubleGrouping ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
 {options.doubleGrouping && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 bg-white rounded-sm" />}
 </div>
 <input
 type="checkbox"
 checked={options.doubleGrouping}
 onChange={(e) => updateOption('doubleGrouping', e.target.checked)}
 className="sr-only"
 />
 <div>
 <span className="text-gray-200">Allow Double Grouping</span>
 <p className="text-gray-500 text-xs">Combine smaller groups when possible</p>
 </div>
 </label>

 <div>
 <label className="block text-sm text-gray-300 mb-2">Vehicles to Load: {options.vehiclesToComplete}</label>
 <input
 type="range"
 min="1"
 max="20"
 value={options.vehiclesToComplete}
 onChange={(e) => updateOption('vehiclesToComplete', parseInt(e.target.value))}
 className="w-full accent-indigo-500"
 />
 <div className="flex justify-between text-xs text-gray-500 mt-1">
 <span>1</span>
 <span>20</span>
 </div>
 {errors.vehiclesToComplete && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.vehiclesToComplete}</p>}
 </div>
 </div>
 </section>
 </div>

 {/* Actions */}
 <div className="p-6 border-t border-white/10 bg-white/5 flex gap-3 justify-end">
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={onClose}
 className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/20"
 >
 Cancel
 </motion.button>
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={handlePlay}
 className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold shadow-lg shadow-green-500/30 transition-all"
 >
 🎮 Play
 </motion.button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
