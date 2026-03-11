import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { rideApi, gameApi } from '../services/api';
import { Ride, GuestGroup } from '../types';
import { useGameTimer } from '../hooks/useGameTimer';

const guestColors = [
 '#4A90E2', '#E74C3C', '#27AE60', '#F39C12', '#E67E22', '#9B59B6'
];

export default function Game() {
 const { parkSlug, rideSlug } = useParams<{ parkSlug: string; rideSlug: string }>();
 const navigate = useNavigate();
 
 const [ride, setRide] = useState<Ride | null>(null);
 const [guests, setGuests] = useState<GuestGroup[]>([]);
 const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [vehicleNumber, setVehicleNumber] = useState(1);
 
 // Game config (hardcoded for MVP - would come from options popup)
 const config = {
 timerEnabled: false,
 visibleGuests: 30,
 maxGroupSize: 8,
 vehiclesToComplete: 3
 };

 useEffect(() => {
 const loadRide = async () => {
 try {
 const res = await rideApi.getBySlug(rideSlug || '');
 setRide(res.data);
 
 // Generate guests
 const guestRes = await gameApi.generateGuests(30, config.maxGroupSize);
 const groups = guestRes.data.groups.map((g: any, i: number) => ({
 ...g,
 isActive: false,
 color: guestColors[i % guestColors.length]
 }));
 setGuests(groups);
 } catch (err) {
 setError('Failed to load ride');
 } finally {
 setLoading(false);
 }
 };
 loadRide();
 }, [rideSlug]);

 const handleGuestGroupClick = (groupId: string) => {
 setGuests(prev => prev.map(g => 
 g.id === groupId ? { ...g, isActive: true } : g
 ));
 };

 const handleGuestClick = (groupId: string, guestId: string) => {
 setSelectedGuestIds(prev => {
 const next = new Set(prev);
 if (next.has(guestId)) {
 next.delete(guestId);
 } else {
 next.add(guestId);
 }
 return next;
 });
 };

 const handleRowClick = (rowIndex: number) => {
 // Place selected guests in row
 console.log('Placing guests in row', rowIndex);
 setSelectedGuestIds(new Set());
 };

 const handleDispatch = () => {
 setVehicleNumber(prev => {
 if (prev >= config.vehiclesToComplete) {
 alert('Training Complete!');
 navigate('/');
 return prev;
 }
 return prev + 1;
 });
 setSelectedGuestIds(new Set());
 };

 if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
 if (error) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">{error}</div>;
 if (!ride) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Ride not found</div>;

 const rows = Array.isArray(ride.guests[0]) ? ride.guests[0] : ride.guests;

 return (
 <div className="min-h-screen bg-gray-900 text-white">
 {/* Header */}
 <header className="bg-gray-800 p-4 flex justify-between items-center">
 <div>
 <h1 className="text-xl font-bold text-blue-400">{ride.name}</h1>
 <p className="text-sm text-gray-400">Vehicle {vehicleNumber} of {config.vehiclesToComplete}</p>
 </div>
 <button
 onClick={handleDispatch}
 className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-bold text-lg transition-colors"
 >
 Send It! 🚀
 </button>
 </header>

 <div className="flex h-[calc(100vh-80px)]">
 {/* Guest Queue */}
 <div className="w-1/3 bg-gray-800/50 p-4 overflow-y-auto">
 <h3 className="text-lg font-semibold mb-4 text-blue-300">Guest Queue</h3>
 <div className="flex flex-wrap gap-2">
 {guests.map((group, i) => (
 <motion.div
 key={group.id}
 layout
 onClick={() => handleGuestGroupClick(group.id)}
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
 className="absolute -top-5 -left-2 bg-purple-500 text-xs px-2 py-0.5 rounded"
 >
 {group.size} guests
 </motion.div>
 )}
 <div className="flex gap-1">
 {Array.from({ length: Math.min(group.size, 6) }).map((_, j) => {
 const guestId = `${group.id}-${j}`;
 const isSelected = selectedGuestIds.has(guestId);
 return (
 <motion.div
 key={j}
 onClick={(e) => {
 e.stopPropagation();
 handleGuestClick(group.id, guestId);
 }}
 className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-all ${
 group.isActive
 ? isSelected
 ? 'ring-3 ring-white scale-110'
 : ''
 : 'opacity-40'
 }`}
 style={{ backgroundColor: group.isActive ? group.color : '#6B7280' }}
 whileTap={{ scale: 0.9 }}
 >
 {group.isActive ? '👤' : '?'}
 </motion.div>
 );
 })}
 </div>
 </motion.div>
 ))}
 </div>
 </div>

 {/* Vehicle */}
 <div className="w-2/3 p-8 flex items-center justify-center">
 <div className="bg-blue-900/50 p-8 rounded-2xl">
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
 className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${
 seatIdx < selectedGuestIds.size
 ? 'bg-white border-green-500'
 : 'border-gray-600'
 }`}
 style={seatIdx < selectedGuestIds.size ? {} : { backgroundColor: 'transparent' }}
 >
 {seatIdx < selectedGuestIds.size && '👤'}
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
 </div>
 </div>
 </div>
 );
}
