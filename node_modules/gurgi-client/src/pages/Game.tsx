import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { rideApi, gameApi } from '../services/api';
import { Ride, Guest } from '../types';

// Group colors cycling through
const GROUP_COLORS = [
 { color: '#3B82F6', name: 'Blue', shade: 'blue' },
 { color: '#EF4444', name: 'Red', shade: 'red' },
 { color: '#10B981', name: 'Green', shade: 'green' },
 { color: '#F59E0B', name: 'Yellow', shade: 'yellow' },
 { color: '#F97316', name: 'Orange', shade: 'orange' },
 { color: '#8B5CF6', name: 'Purple', shade: 'purple' },
];

// Types
type VehicleState = 'entering' | 'loading' | 'ready' | 'exiting' | 'exited';

interface GameGroup {
 id: string;
 color: string;
 colorName: string;
 guests: Guest[];
 discovered: boolean;
 size: number;
}

interface VehicleRow {
 capacity: number;
 guests: (Guest | null)[];
}

// Generate UUID helper
const generateId = () => Math.random().toString(36).substring(2, 9);

// Slide Menu Component
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

// Mystery Group Component - Shows before discovery
function MysteryGroup({ onClick, index }: { onClick: () => void; index: number }) {
 return (
 <motion.div
 layout
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex flex-col items-center"
 onClick={onClick}
 >
 <span className="text-xs text-gray-500 mb-1 font-medium">GROUP {index + 1}</span>
 <motion.div
 className="w-12 h-12 rounded-full cursor-pointer relative overflow-hidden"
 style={{
 background: 'linear-gradient(135deg, #1f2937, #374151)',
 boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
 }}
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 animate={{ 
 boxShadow: ['0 4px 15px rgba(0,0,0,0.3)', '0 4px 25px rgba(255,255,255,0.1)', '0 4px 15px rgba(0,0,0,0.3)']
 }}
 transition={{ 
 boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
 }}
 >
 <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-400">
 ?
 </span>
 </motion.div>
 </motion.div>
 );
}

// Discovered Group Component - Shows after discovery
function DiscoveredGroup({
 group,
 groupIndex,
 active,
 selectedGuestId,
 onGuestClick
}: {
 group: GameGroup;
 groupIndex: number;
 active: boolean;
 selectedGuestId: string | null;
 onGuestClick: (guest: Guest) => void;
}) {
 return (
 <motion.div
 layout
 className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
 active ? 'bg-white/10 ring-2 ring-white' : ''
 }`}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 >
 <div className="flex items-center gap-2 mb-1">
 <span className="text-xs text-gray-400">GROUP {groupIndex + 1}</span>
 {active && (
 <motion.span
 initial={{ opacity: 0, scale: 0 }}
 animate={{ opacity: 1, scale: 1 }}
 className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold"
 >
 DISCOVERED
 </motion.span>
 )}
 </div>
 <div className="flex items-center gap-1 flex-wrap justify-center">
 {group.guests.map((guest) => {
 const isSelected = selectedGuestId === guest.id;
 return (
 <motion.div
 key={guest.id}
 data-guest-id={active ? guest.id : undefined}
 layoutId={`guest-${guest.id}`}
 onClick={() => active && onGuestClick(guest)}
 className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ${
 active ? 'hover:scale-110' : 'opacity-50 cursor-not-allowed'
 }`}
 style={{
 backgroundColor: group.color,
 border: isSelected ? '3px solid white' : '3px solid transparent',
 boxShadow: isSelected ? '0 0 15px rgba(255,255,255,0.5)' : 'none'
 }}
 whileTap={active ? { scale: 0.9 } : {}}
 animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
 transition={{ duration: 0.3 }}
 />
 );
 })}
 </div>
 </motion.div>
 );
}

// Walking Guest Component - Animates from queue to seat
function WalkingGuest({
 guest,
 fromPosition,
 toPosition,
 onComplete,
 groupColor
}: {
 guest: Guest;
 fromPosition: { x: number; y: number };
 toPosition: { x: number; y: number };
 onComplete: () => void;
 groupColor: string;
}) {
 return (
 <motion.div
 layoutId={`guest-${guest.id}`}
 initial={{ x: fromPosition.x, y: fromPosition.y, scale: 1 }}
 animate={{
 x: toPosition.x,
 y: toPosition.y,
 scale: 1,
 }}
 transition={{
 duration: 0.8,
 ease: [0.4, 0, 0.2, 1],
 }}
 onAnimationComplete={onComplete}
 className="fixed w-10 h-10 rounded-full z-50 pointer-events-none"
 style={{
 backgroundColor: groupColor,
 border: '3px solid white',
 boxShadow: '0 0 20px rgba(255,255,255,0.5)',
 }}
 />
 );
}

// Seat Component
function Seat({
 capacity,
 filled,
 onClick,
 disabled,
 rowIndex,
 startSeatIndex
}: {
 capacity: number;
 filled: (Guest | null)[];
 onClick: (seatIndex: number) => void;
 disabled: boolean;
 rowIndex: number;
 startSeatIndex: number;
}) {
 return (
 <div className="flex items-center gap-3">
 <span className="text-gray-400 w-16 text-sm">Row {rowIndex + 1}</span>
 <div className="flex gap-2">
 {Array.from({ length: capacity }).map((_, seatIndex) => {
 const guest = filled[seatIndex];
 return (
 <motion.div
 key={seatIndex}
 data-seat-index={startSeatIndex + seatIndex}
 onClick={() => !disabled && !guest && onClick(seatIndex)}
 className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
 guest
 ? 'bg-white border-green-500'
 : disabled
 ? 'border-gray-700 bg-transparent cursor-not-allowed'
 : 'border-gray-600 bg-gray-800/50 cursor-pointer hover:border-blue-400 hover:bg-gray-700'
 }`}
 whileHover={!disabled && !guest ? { scale: 1.05 } : {}}
 whileTap={!disabled && !guest ? { scale: 0.95 } : {}}
 >
 {guest && (
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className="w-8 h-8 rounded-full"
 style={{ backgroundColor: guest.color }}
 />
 )}
 </motion.div>
 );
 })}
 </div>
 <span className="text-gray-500 text-xs">{capacity} seats</span>
 </div>
 );
}

export default function Game() {
 const { rideSlug } = useParams<{ rideSlug: string }>();
 const navigate = useNavigate();

 const [ride, setRide] = useState<Ride | null>(null);
 const [groups, setGroups] = useState<GameGroup[]>([]);
 const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
 const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
 const [discoveredGroups, setDiscoveredGroups] = useState<Set<number>>(new Set());
 const [vehicleNumber, setVehicleNumber] = useState(1);
 const [vehicleState, setVehicleState] = useState<VehicleState>('entering');
 const [vehicleGuests, setVehicleGuests] = useState<(Guest | null)[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [menuOpen, setMenuOpen] = useState(false);
 const [score, setScore] = useState({ loaded: 0, dispatched: 0 });
 const [walkingGuest, setWalkingGuest] = useState<{
 guest: Guest;
 from: { x: number; y: number };
 to: { x: number; y: number };
 groupColor: string;
 } | null>(null);

 const config = {
 vehiclesToComplete: 3,
 visibleGuests: 30,
 maxGroupSize: 6,
 };

 // Generate initial groups on mount
 useEffect(() => {
 let isMounted = true;

 const loadGame = async () => {
 try {
 const [gameConfigRes, guestRes] = await Promise.all([
 gameApi.getConfig(rideSlug || ''),
 gameApi.generateGuests(30, config.maxGroupSize)
 ]);

 if (!isMounted) return;

 setRide(gameConfigRes.data);

 // Create game groups with the generated guest sizes
 const gameGroups: GameGroup[] = guestRes.data.groups.map((g: any, i: number) => {
 const colorConfig = GROUP_COLORS[i % GROUP_COLORS.length];
 const groupGuests: Guest[] = Array.from({ length: g.size }, (_, j) => ({
 id: `${g.id}-${j}`,
 groupId: g.id,
 color: colorConfig.color,
 selected: false,
 }));

 return {
 id: g.id,
 color: colorConfig.color,
 colorName: colorConfig.name,
 guests: groupGuests,
 discovered: false,
 size: g.size,
 };
 });

 setGroups(gameGroups);

 // Initialize vehicle capacity based on ride config
 const capacity = (gameConfigRes.data.guests[0] as number[])?.reduce((a: number, b: number) => a + b, 0) || 6;
 setVehicleGuests(new Array(capacity).fill(null));

 } catch (err) {
 if (isMounted) setError('Failed to load game');
 } finally {
 if (isMounted) setLoading(false);
 }
 };

 loadGame();
 return () => { isMounted = false; };
 }, [rideSlug]);

 // Vehicle entry animation sequence
 useEffect(() => {
 if (loading) return;

 // Start with vehicle entering
 setVehicleState('entering');

 const timer = setTimeout(() => {
 setVehicleState('loading');
 }, 800);

 return () => clearTimeout(timer);
 }, [loading, vehicleNumber]);

 // Handle group discovery - tap to reveal
 const handleGroupClick = useCallback((groupIndex: number) => {
 // Only allow discovery of front group (index 0)
 if (groupIndex !== 0) return;

 // Only discover if not already discovered
 if (!discoveredGroups.has(groupIndex)) {
 setDiscoveredGroups(prev => new Set([...prev, groupIndex]));
 setActiveGroupIndex(groupIndex);
 }
 }, [discoveredGroups]);

 // Handle guest selection from active group
 const handleGuestClick = useCallback((guest: Guest) => {
 if (selectedGuest?.id === guest.id) {
 setSelectedGuest(null);
 } else {
 setSelectedGuest(guest);
 }
 }, [selectedGuest]);

 // Handle seat selection - animate guest walking to seat
 const handleSeatClick = useCallback((seatIndex: number) => {
 if (!selectedGuest) return;

 // Get the source element position (queue)
 const guestElement = document.querySelector(`[data-guest-id="${selectedGuest.id}"]`);
 const seatElement = document.querySelector(`[data-seat-index="${seatIndex}"]`);

 if (!guestElement || !seatElement) return;

 const guestRect = guestElement.getBoundingClientRect();
 const seatRect = seatElement.getBoundingClientRect();

 // Calculate relative positions
 const from = {
 x: guestRect.left + guestRect.width / 2 - 20,
 y: guestRect.top + guestRect.height / 2 - 20,
 };
 const to = {
 x: seatRect.left + seatRect.width / 2 - 20,
 y: seatRect.top + seatRect.height / 2 - 20,
 };

 // Find group color
 const group = groups.find(g => g.id === selectedGuest.groupId);
 if (!group) return;

 // Start walking animation
 setWalkingGuest({
 guest: selectedGuest,
 from,
 to,
 groupColor: group.color,
 });
 }, [selectedGuest, groups]);

 // Complete walk animation and update state
 const completeWalkAnimation = useCallback(() => {
 if (!walkingGuest) return;

 const { guest } = walkingGuest;

 // Update vehicle seats
 const emptySeatIndex = vehicleGuests.findIndex(g => g === null);
 if (emptySeatIndex !== -1) {
 const newVehicleGuests = [...vehicleGuests];
 newVehicleGuests[emptySeatIndex] = guest;
 setVehicleGuests(newVehicleGuests);

 // Update score
 setScore(prev => ({ ...prev, loaded: prev.loaded + 1 }));
 }

 // Remove guest from their group
 setGroups(prev => {
 const newGroups = [...prev];
 const groupIndex = newGroups.findIndex(g => g.id === guest.groupId);
 if (groupIndex !== -1) {
 const group = newGroups[groupIndex];
 group.guests = group.guests.filter(g => g.id !== guest.id);

 // Remove empty groups
 if (group.guests.length === 0) {
 newGroups.splice(groupIndex, 1);
 }
 }
 return newGroups;
 });

 // Clear selection and walking state
 setSelectedGuest(null);
 setWalkingGuest(null);

 // Move to next group if current is empty
 setGroups(prev => {
 if (prev.length > 0 && prev[0].guests.length === 0) {
 setDiscoveredGroups(new Set());
 setActiveGroupIndex(null);
 // Discover next group automatically
 if (prev.length > 1) {
 setTimeout(() => {
 setDiscoveredGroups(new Set([0]));
 setActiveGroupIndex(0);
 }, 300);
 }
 return prev.slice(1);
 }
 return prev;
 });
 }, [walkingGuest, vehicleGuests]);

 // Dispatch vehicle
 const handleDispatch = useCallback(() => {
 if (vehicleState !== 'loading') return;

 setVehicleState('ready');

 setTimeout(() => {
 setVehicleState('exiting');

 setTimeout(() => {
 setVehicleState('exited');
 setScore(prev => ({ ...prev, dispatched: prev.dispatched + 1 }));

 // Reset for next vehicle
 setTimeout(() => {
 const capacity = (ride?.guests[0] as number[])?.reduce((a: number, b: number) => a + b, 0) || 6;
 setVehicleGuests(new Array(capacity).fill(null));
 setVehicleNumber(prev => prev + 1);
 }, 500);
 }, 800);
 }, 300);
 }, [vehicleState, ride]);

 if (loading) {
 return (
 <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
 className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
 />
 </div>
 );
 }

 if (error) {
 return (
 <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">
 {error}
 </div>
 );
 }

 if (!ride) {
 return (
 <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
 Ride not found
 </div>
 );
 }

 // Calculate vehicle rows from ride config
 const rows = Array.isArray(ride.guests[0]) ? ride.guests[0] : [ride.guests];

 return (
 <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
 {/* Menu */}
 <SlideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

 {/* Walking Guest Animation Layer */}
 <AnimatePresence>
 {walkingGuest && (
 <WalkingGuest
 guest={walkingGuest.guest}
 fromPosition={walkingGuest.from}
 toPosition={walkingGuest.to}
 onComplete={completeWalkAnimation}
 groupColor={walkingGuest.groupColor}
 />
 )}
 </AnimatePresence>

 {/* Header */}
 <header className="bg-gray-800 p-4 flex justify-between items-center z-20 shadow-lg">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setMenuOpen(true)}
 className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
 aria-label="Open menu"
 >
 <span className="text-2xl">☰</span>
 </button>
 <div>
 <h1 className="text-xl font-bold text-blue-400">{ride.name}</h1>
 <p className="text-sm text-gray-400">
 Vehicle {vehicleNumber} of {config.vehiclesToComplete}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="text-right mr-4">
 <p className="text-sm text-gray-400">Loaded: <span className="text-green-400 font-bold">{score.loaded}</span></p>
 <p className="text-sm text-gray-400">Dispatched: <span className="text-blue-400 font-bold">{score.dispatched}</span></p>
 </div>
 <motion.button
 onClick={handleDispatch}
 disabled={vehicleState !== 'loading'}
 className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
 vehicleState === 'loading'
 ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
 : 'bg-gray-600 text-gray-400 cursor-not-allowed'
 }`}
 whileHover={vehicleState === 'loading' ? { scale: 1.05 } : {}}
 whileTap={vehicleState === 'loading' ? { scale: 0.95 } : {}}
 >
 Send It! 🚀
 </motion.button>
 </div>
 </header>

 {/* Main Game Area */}
 <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
 {/* Guest Queue - Left Side */}
 <div className="lg:w-1/3 bg-gray-800/50 p-4 overflow-y-auto z-10 backdrop-blur">
 <div className="flex items-center gap-2 mb-4">
 <h3 className="text-lg font-semibold text-blue-300">Guest Queue</h3>
 {activeGroupIndex === 0 && (
 <motion.span
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 className="text-xs bg-green-500 text-white px-2 py-1 rounded-full"
 >
 FRONT
 </motion.span>
 )}
 </div>

 {/* Queue Flow: Left to Right, wrapping */}
 <div className="flex flex-wrap gap-4 content-start">
 <AnimatePresence mode="popLayout">
 {groups.slice(0, 8).map((group, index) => {
 const isDiscovered = discoveredGroups.has(index);
 const isActive = activeGroupIndex === index;

 if (!isDiscovered) {
 return (
 <MysteryGroup
 key={group.id}
 index={index}
 onClick={() => handleGroupClick(index)}
 />
 );
 }

 return (
 <motion.div
 key={group.id}
 layout
 >
 <DiscoveredGroup
 group={group}
 groupIndex={index}
 active={isActive}
 selectedGuestId={selectedGuest?.id || null}
 onGuestClick={handleGuestClick}
 />
 </motion.div>
 );
 })}
 </AnimatePresence>

 {groups.length === 0 && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="text-center text-gray-500 w-full py-8"
 >
 All guests loaded! 🎉
 </motion.div>
 )}
 </div>

 {/* Instructions */}
 <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
 <p className="text-sm text-gray-300">
 <strong className="text-white">How to play:</strong>
 </p>
 <ol className="text-sm text-gray-400 mt-2 space-y-1 list-decimal list-inside">
 <li>Tap the <strong>mystery group</strong> (?) at the front to reveal</li>
 <li>Tap an <strong>individual</strong> to select them</li>
 <li>Tap a <strong>seat</strong> in the vehicle to load them</li>
 <li>When full or ready, click <strong>Send It!</strong></li>
 </ol>
 </div>
 </div>

 {/* Vehicle Area - Center/Right */}
 <div className="lg:w-2/3 relative flex items-center justify-center p-8">
 <AnimatePresence mode="wait">
 <motion.div
 key={vehicleNumber}
 initial={{ y: '100vh' }}
 animate={{
 y: vehicleState === 'entering' ? 0 :
 vehicleState === 'loading' || vehicleState === 'ready' ? 0 :
 vehicleState === 'exiting' ? '-100vh' :
 vehicleState === 'exited' ? '-100vh' : 0,
 }}
 transition={{
 duration: 0.8,
 ease: [0.4, 0, 0.2, 1],
 }}
 className="w-full max-w-2xl"
 >
 {/* Vehicle Container */}
 <div className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 p-6 rounded-2xl border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-semibold text-blue-300">Vehicle {vehicleNumber}</h3>
 <div className="flex items-center gap-2">
 <span className="text-gray-400">Status:</span>
 <span className={`px-3 py-1 rounded-full text-sm font-medium ${
 vehicleState === 'entering' ? 'bg-yellow-500/20 text-yellow-400' :
 vehicleState === 'loading' ? 'bg-green-500/20 text-green-400' :
 vehicleState === 'ready' ? 'bg-blue-500/20 text-blue-400' :
 vehicleState === 'exiting' ? 'bg-purple-500/20 text-purple-400' :
 'bg-gray-700 text-gray-400'
 }`}>
 {vehicleState === 'entering' ? 'Arriving...' :
 vehicleState === 'loading' ? 'Loading' :
 vehicleState === 'ready' ? 'Ready' :
 vehicleState === 'exiting' ? 'Dispatching...' :
 'Gone'}
 </span>
 </div>
 </div>

 {/* Vehicle Rows */}
 <div className="space-y-4">
 {rows.map((capacity: number, rowIndex: number) => {
 // Calculate which seats belong to this row
 const startIdx = rows.slice(0, rowIndex).reduce((a: number, b: number) => a + b, 0);
 const rowGuests = vehicleGuests.slice(startIdx, startIdx + capacity);

 return (
 <motion.div
 key={rowIndex}
 className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50"
 >
 <Seat
 capacity={capacity}
 filled={rowGuests}
 onClick={(seatIndex) => handleSeatClick(startIdx + seatIndex)}
 disabled={vehicleState !== 'loading'}
 rowIndex={rowIndex}
 startSeatIndex={startIdx}
 />
 </motion.div>
 );
 })}
 </div>

 {/* Vehicle Capacity Indicator */}
 <div className="mt-4 flex items-center justify-between text-sm">
 <span className="text-gray-400">
 Capacity: {vehicleGuests.filter(g => g !== null).length} / {vehicleGuests.length}
 </span>
 <div className="flex gap-1">
 {vehicleGuests.map((guest, i) => (
 <div
 key={i}
 className={`w-3 h-3 rounded-full ${
 guest ? 'bg-green-500' : 'bg-gray-700'
 }`}
 />
 ))}
 </div>
 </div>
 </div>
 </motion.div>
 </AnimatePresence>
 </div>
 </div>
</div>
 );
}
