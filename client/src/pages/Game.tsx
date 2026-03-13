import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { rideApi, gameApi } from '../services/api';
import { Ride, GuestGroup } from '../types';

const guestColors = [
 '#4A90E2', '#E74C3C', '#27AE60', '#F39C12', '#E67E22', '#9B59B6'
];

// Types
type ViewState = 'ARRIVING' | 'STOPPED' | 'DISPATCHING' | 'COMPLETED';

interface SelectedGuest {
 groupId: string;
 guestIndex: number;
}

interface VehicleState {
 guests: SelectedGuest[];
 rows: number[];
}

// Menu Component
function SlideMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
 const navigate = useNavigate();
 
 return (
 <AnimatePresence>
 {isOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-black/50 z-40"
 />
 <motion.div
 initial={{ x: '-100%' }}
 animate={{ x: 0 }}
 exit={{ x: '-100%' }}
 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
 className="fixed left-0 top-0 bottom-0 w-80 bg-gray-900 border-r border-gray-700 z-50 p-6"
 >
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-white">Menu</h2>
 <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
 </div>
 
 <nav className="space-y-4">
 <a href="#" className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
 About GURGI
 </a>
 <button 
 onClick={() => navigate('/')}
 className="block w-full text-left px-4 py-3 text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"
 >
 Main Menu
 </button>
 </nav>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}

export default function Game() {
 const { parkSlug, rideSlug } = useParams<{ parkSlug: string; rideSlug: string }>();
 const navigate = useNavigate();
 
 const [ride, setRide] = useState<Ride | null>(null);
 const [guests, setGuests] = useState<GuestGroup[]>([]);
 const [selectedGuests, setSelectedGuests] = useState<SelectedGuest[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [vehicleNumber, setVehicleNumber] = useState(1);
 const [viewState, setViewState] = useState<ViewState>('ARRIVING');
 const [menuOpen, setMenuOpen] = useState(false);
 
 const config = {
 vehiclesToComplete: 3,
 visibleGuests: 30,
 maxGroupSize: 8,
 timerEnabled: false,
 };

 // Load ride and generate guests on mount
 useEffect(() => {
 let isMounted = true;
 
 const loadRide = async () => {
 try {
 const res = await rideApi.getBySlug(rideSlug || '');
 if (!isMounted) return;
 setRide(res.data);
 
 // Generate guests
 const guestRes = await gameApi.generateGuests(30, config.maxGroupSize);
 if (!isMounted) return;
 
 const groups = guestRes.data.groups.map((g: any, i: number) => ({
 ...g,
 isActive: false,
 color: guestColors[i % guestColors.length],
 guests: Array.from({ length: g.size }, (_, j) => ({ id: `${g.id}-${j}`, selected: false }))
 }));
 setGuests(groups);
 } catch (err) {
 if (isMounted) setError('Failed to load ride');
 } finally {
 if (isMounted) setLoading(false);
 }
 };
 
 loadRide();
 
 return () => { isMounted = false; };
 }, [rideSlug]);

 // Handle vehicle arriving animation
 useEffect(() => {
 if (!loading) {
 setViewState('ARRIVING');
 const timer = setTimeout(() => setViewState('STOPPED'), 1000);
 return () => clearTimeout(timer);
 }
 }, [loading, vehicleNumber]);

 // Group activation
 const handleGroupClick = useCallback((groupId: string) => {
 setGuests(prev => prev.map(g => 
 g.id === groupId ? { ...g, isActive: true } : g
 ));
 }, []);

 // Individual guest selection
 const handleGuestClick = useCallback((groupId: string, guestIndex: number) => {
 const group = guests.find(g => g.id === groupId);
 if (!group || !group.isActive) return;
 
 const existingSelection = selectedGuests.find(
 sg => sg.groupId === groupId && sg.guestIndex === guestIndex
 );
 
 if (existingSelection) {
 // Deselect
 setSelectedGuests(prev => prev.filter(sg => sg !== existingSelection));
 } else if (selectedGuests.length < 3) { // Max 3 for demo
 // Select
 setSelectedGuests(prev => [...prev, { groupId, guestIndex }]);
 }
 }, [guests, selectedGuests]);

 // Place guests in vehicle row
 const handleRowClick = useCallback((rowIndex: number) => {
 if (selectedGuests.length === 0) return;
 
 // Add to vehicle
 setSelectedGuests([]);
 
 // Animate guests moving
 setGuests(prev => prev.map(g => ({
 ...g,
 guests: g.guests.map((guest: any, i: number) => ({
 ...guest,
 selected: false
 }))
 })));
 }, [selectedGuests]);

 // Dispatch vehicle
 const handleDispatch = useCallback(() => {
 setViewState('DISPATCHING');
 setTimeout(() => {
 setVehicleNumber(prev => prev + 1);
 if (vehicleNumber >= config.vehiclesToComplete) {
 setViewState('COMPLETED');
 } else {
 // Reset for next vehicle
 setSelectedGuests([]);
 }
 }, 1500);
 }, [vehicleNumber, config.vehiclesToComplete]);

 if (loading) return (
 <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
 className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
 />
 </div>
 );
 
 if (error) return (
 <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">
 {error}
 </div>
 );
 
 if (!ride) return (
 <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
 Ride not found
 </div>
 );

 const rows = Array.isArray(ride.guests[0]) ? ride.guests[0] : ride.guests;

 return (
 <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
 {/* Menu */}
 <SlideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
 
 {/* Header */}
 <header className="bg-gray-800 p-4 flex justify-between items-center z-10">
 <div className="flex items-center gap-4">
 <button 
 onClick={() => setMenuOpen(true)}
 className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
 >
 <span className="text-2xl">☰</span>
 </button>
 <div>
 <h1 className="text-xl font-bold text-blue-400">{ride.name}</h1>
 <p className="text-sm text-gray-400">Vehicle {vehicleNumber} of {config.vehiclesToComplete}</p>
 </div>
 </div>
 <button
 onClick={handleDispatch}
 disabled={viewState !== 'STOPPED'}
 className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
 viewState === 'STOPPED' 
 ? 'bg-green-500 hover:bg-green-600 text-white' 
 : 'bg-gray-600 text-gray-400 cursor-not-allowed'
 }`}
 >
 Send It! 🚀
 </button>
 </header>

 {/* Main Content */}
 <div className="flex-1 flex relative overflow-hidden">
 {/* Vehicle Animation Layer */}
 <AnimatePresence mode="wait">
 <motion.div
 key={vehicleNumber}
 initial={{ y: '100%' }}
 animate={{ 
 y: viewState === 'ARRIVING' ? '-40%' : 
 viewState === 'STOPPED' ? '0%' : 
 viewState === 'DISPATCHING' ? '-100%' : '0%'
 }}
 transition={{ duration: 1.5, ease: 'easeInOut' }}
 className="absolute inset-x-0 z-0 flex items-center justify-center"
 style={{ top: '50%', transform: 'translateY(-50%)' }}
 >
 <div className="bg-blue-900/50 p-8 rounded-2xl border-2 border-blue-500">
 <h3 className="text-xl font-semibold mb-6 text-center text-blue-300">Vehicle</h3>
 <div className="space-y-4">
 {Array.isArray(rows) && rows.map((capacity, rowIdx) => (
 <motion.div
 key={rowIdx}
 onClick={() => handleRowClick(rowIdx)}
 className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors border-2 border-gray-600"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 <div className="flex items-center gap-4">
 <span className="text-gray-400 w-20">Row {rowIdx + 1}</span>
 <div className="flex gap-2">
 {Array.from({ length: capacity }).map((_, seatIdx) => (
 <div
 key={seatIdx}
 className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
 seatIdx < selectedGuests.length
 ? 'bg-white border-green-500'
 : 'border-gray-600 bg-transparent'
 }`}
 >
 {seatIdx < selectedGuests.length && (
 <motion.span
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className="text-2xl"
 >
 👤
 </motion.span>
 )}
 </div>
 ))}
 </div>
 <span className="text-gray-400 text-sm">
 {capacity} seats
 </span>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </motion.div>
 </AnimatePresence>

 {/* Guest Queue */}
 <div className="w-1/3 bg-gray-800/80 p-4 overflow-y-auto z-10 backdrop-blur">
 <h3 className="text-lg font-semibold mb-4 text-blue-300">Guest Queue</h3>
 <div className="flex flex-wrap gap-2">
 {guests.map((group, i) => (
 <motion.div
 key={group.id}
 layout
 onClick={() => handleGroupClick(group.id)}
 className={`relative cursor-pointer ${
 group.isActive ? 'ring-2 ring-white' : ''
 }`}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 {group.isActive && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="absolute -top-5 -left-2 bg-purple-500 text-xs px-2 py-0.5 rounded whitespace-nowrap"
 >
 {group.size} 👥
 </motion.div>
 )}
 <div className="flex gap-1 flex-wrap">
 {group.guests.slice(0, 6).map((guest: any, j: number) => {
 const isSelected = selectedGuests.some(
 sg => sg.groupId === group.id && sg.guestIndex === j
 );
 return (
 <motion.div
 key={j}
 onClick={(e) => {
 e.stopPropagation();
 handleGuestClick(group.id, j);
 }}
 className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-all ${
 group.isActive
 ? isSelected
 ? 'ring-4 ring-white scale-110'
 : 'hover:scale-105'
 : 'opacity-40'
 }`}
 style={{ 
 backgroundColor: group.isActive ? group.color : '#6B7280',
 border: isSelected ? '3px solid white' : 'none'
 }}
 whileTap={{ scale: 0.9 }}
 animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
 >
 {group.isActive ? '' : '?'}
 </motion.div>
 );
 })}
 {group.size > 6 && (
 <span className="text-xs text-gray-400 self-center">+{group.size - 6}</span>
 )}
 </div>
 </motion.div>
 ))}
 </div>
 
 <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
 <p className="text-sm text-gray-300">
 <strong className="text-white">How to play:</strong><br/>
 1. Tap a group to reveal sizes<br/>
 2. Tap individuals to select them<br/>
 3. Click a row to place guests
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
