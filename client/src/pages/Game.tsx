import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { rideApi, gameApi } from '../services/api';
import { Ride, Guest } from '../types';
import HowToPlayModal from '../components/game/HowToPlayModal';

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
function SlideMenu({ isOpen, onClose, onHowToPlay }: { isOpen: boolean; onClose: () => void; onHowToPlay: () => void }) {
 const navigate = useNavigate();

 const handleHowToPlay = () => {
 onClose();
 onHowToPlay();
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-black/50 z-50"
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
 <nav className="space-y-3">
 <button
 onClick={handleHowToPlay}
 className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors flex items-center gap-3"
 >
 <span>📖</span> How to Play
 </button>
 <div className="border-t border-gray-700 my-2" />
 <button
 onClick={() => { onClose(); navigate('/about'); }}
 className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors flex items-center gap-3"
 >
 <span>ℹ️</span> About
 </button>
 <button
 onClick={() => navigate('/')}
 className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors flex items-center gap-3"
 >
 <span>🏠</span> Main Menu
 </button>
 </nav>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}

// Mystery Group Component - Shows before discovery
function MysteryGroup({ onClick, index, disabled }: { onClick: () => void; index: number; disabled?: boolean }) {
 return (
 <motion.div
 layout
 initial={{ opacity: 0, x: -50, scale: 0.8 }}
 animate={{ opacity: 1, x: 0, scale: 1 }}
 transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.1 }}
 className="flex flex-col items-center"
 onClick={onClick}
 >
 <span className="text-xs text-gray-500 mb-1 font-medium">GROUP {index + 1}</span>
 <motion.div
 className={`w-12 h-12 rounded-full relative overflow-hidden ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
 style={{
 background: 'linear-gradient(135deg, #1f2937, #374151)',
 boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
 }}
 whileHover={disabled ? {} : { scale: 1.1 }}
 whileTap={disabled ? {} : { scale: 0.95 }}
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
 </div>
 <div className="flex items-center gap-1 flex-wrap justify-center">
 {group.guests.map((guest) => {
 const isSelected = selectedGuestId === guest.id;
 return (
 <motion.div
 key={guest.id}
 data-guest-id={active ? guest.id : undefined}
 layoutId={`guest-${guest.id}`}
 onClick={() => onGuestClick(guest)}
 className="w-10 h-10 rounded-full cursor-pointer transition-all duration-200 hover:scale-110"
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
 <div className="flex items-center justify-center gap-4">
 <div className="flex gap-3">
 {Array.from({ length: capacity }).map((_, seatIndex) => {
 const guest = filled[seatIndex];
 return (
 <motion.div
 key={seatIndex}
 data-seat-index={startSeatIndex + seatIndex}
 onClick={() => !disabled && !guest && onClick(seatIndex)}
 className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
 guest
 ? 'bg-white border-4 border-green-500'
 : disabled
 ? 'border-4 border-gray-700 bg-transparent cursor-not-allowed'
 : 'border-4 border-gray-500 bg-gray-800/50 cursor-pointer hover:border-blue-400 hover:bg-gray-600'
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
 </div>
 );
}

export default function Game() {
 const { rideSlug } = useParams<{ rideSlug: string }>();
 const navigate = useNavigate();

 const [ride, setRide] = useState<Ride | null>(null);
 const [groups, setGroups] = useState<GameGroup[]>([]);
 const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
 const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
 const [discoveredGroups, setDiscoveredGroups] = useState<Set<string>>(new Set());
 const [completedGroups, setCompletedGroups] = useState<Set<string>>(new Set());
 const [vehicleNumber, setVehicleNumber] = useState(1);
 const [vehicleState, setVehicleState] = useState<VehicleState>('entering');
 const [vehicleGuests, setVehicleGuests] = useState<(Guest | null)[]>([]);
 const [singleRiders, setSingleRiders] = useState<GameGroup[]>([]);
 const [showSingleRiders, setShowSingleRiders] = useState(false);
 const [callForNumber, setCallForNumber] = useState<number | null>(null);
 const [callForMessage, setCallForMessage] = useState<string | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [menuOpen, setMenuOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
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
 console.log('Loading game for ride:', rideSlug);
 const [gameConfigRes, guestRes] = await Promise.all([
 gameApi.getConfig(rideSlug || ''),
 gameApi.generateGuests(30, config.maxGroupSize)
 ]);

 if (!isMounted) return;

 console.log('API responses - gameConfig:', gameConfigRes.data);
 console.log('API responses - guestRes data:', guestRes.data);

 setRide(gameConfigRes.data);
 console.log('Ride set, guests data:', gameConfigRes.data.guests);

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
 const guests = gameConfigRes.data?.guests;
 let capacity = 6;
 if (guests && guests.length > 0) {
 if (Array.isArray(guests[0])) {
 // Multi-row: sum all seats
 capacity = (guests[0] as number[]).reduce((a: number, b: number) => a + b, 0);
 } else {
 capacity = (guests[0] as number) || 6;
 }
 }
 setVehicleGuests(new Array(capacity).fill(null));

 } catch (err) {
 console.error('Game load error:', err);
 console.error('Error stack:', (err as any)?.stack);
 if (isMounted) setError('Failed to load game: ' + (err as any)?.message || String(err));
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

 // Handle group discovery - TASK 24: Allow trainees to select from ANY unlocked group
 const handleGroupClick = useCallback((groupId: string) => {
 // Check if group is already discovered or completed
 if (discoveredGroups.has(groupId) || completedGroups.has(groupId)) return;

 // TASK 24 FIX: Allow discovering ANY undiscovered group (not just sequential)
 // This lets trainees choose which groups to work with

 // Discover the group
 setDiscoveredGroups(prev => new Set([...prev, groupId]));
 setActiveGroupId(groupId);
 }, [groups, discoveredGroups, completedGroups]);

 // Handle guest selection - allow selecting from ANY discovered group
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

 // CRITICAL FIX: Only place in empty seats
 if (vehicleGuests[seatIndex] !== null) return;

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
 }, [selectedGuest, groups, vehicleGuests]);

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

 // Generate a new group helper
const generateNewGroup = () => {
 const colorConfig = GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
 const groupId = generateId();
 // Random size 1-6 for variety
 const size = Math.floor(Math.random() * 6) + 1;
 const groupGuests: Guest[] = Array.from({ length: size }, (_, j) => ({
 id: `${groupId}-${j}`,
 groupId: groupId,
 color: colorConfig.color,
 selected: false,
 }));

 return {
 id: groupId,
 color: colorConfig.color,
 colorName: colorConfig.name,
 guests: groupGuests,
 discovered: false,
 size: size,
 };
};

// If group is now empty, mark it as completed but NO auto-unlock
 if (group.guests.length === 0) {
 setCompletedGroups(prevCompleted => new Set([...prevCompleted, guest.groupId]));
 setActiveGroupId(null);
 // Remove empty group
 newGroups.splice(groupIndex, 1);
 // Add new undiscovered group at the end - NO auto-discovery
 newGroups.push(generateNewGroup());
 }
 }
 return newGroups;
 });

 // Clear selection and walking state
 setSelectedGuest(null);
 setWalkingGuest(null);
 }, [walkingGuest, vehicleGuests]);

 
 // Handle "Call for #" functionality - TASK 37
 const handleCallFor = useCallback((number: number) => {
 // Search for a group of the specified size among undiscovered groups
 const matchingGroup = groups.find(g => !discoveredGroups.has(g.id) && !completedGroups.has(g.id) && g.size === number);
 
 if (matchingGroup) {
 // Move this group to the front by rotating the groups array
 const newGroups = [...groups];
 const groupIndex = newGroups.findIndex(g => g.id === matchingGroup.id);
 if (groupIndex > -1) {
 const [group] = newGroups.splice(groupIndex, 1);
 newGroups.unshift(group);
 setGroups(newGroups);
 }
 
 // Discover and activate the group
 setDiscoveredGroups(prev => new Set([...prev, matchingGroup.id]));
 setActiveGroupId(matchingGroup.id);
 setCallForMessage(null);
 } else {
 // Show no group available message
 setCallForMessage(`No group of ${number} available.`);
 // Clear message after 2 seconds
 setTimeout(() => setCallForMessage(null), 2000);
 }
 }, [groups, discoveredGroups, completedGroups]);

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
 const guests = ride?.guests;
 let capacity = 6;
 if (guests && guests.length > 0) {
 if (Array.isArray(guests[0])) {
 capacity = (guests[0] as number[]).reduce((a: number, b: number) => a + b, 0);
 } else {
 capacity = (guests[0] as number) || 6;
 }
 }
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

 // TASK 25 & 26 FIX: Calculate vehicle rows and show unified vehicle
 // Multi-row: [[6,6]] → rows = [6,6], display as one unified vehicle
 // Corral: [10] → rows = [10], display as one row
 const vehicleConfig = Array.isArray(ride.guests[0]) 
 ? (ride.guests[0] as number[]) 
 : (ride.guests as number[]);

 return (
 <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
 {/* Menu */}
 <SlideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onHowToPlay={() => setHowToPlayOpen(true)} />
      <HowToPlayModal isOpen={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />

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
 <header className="bg-gray-800 p-4 flex justify-between items-center z-20 shadow-lg flex-shrink-0">
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
 {/* TASK 37: Call for # buttons */}
 <div className="flex items-center gap-2 mr-4">
 {[2, 4, 6].map(num => (
 <motion.button
 key={num}
 onClick={() => handleCallFor(num)}
 disabled={vehicleState !== 'loading'}
 className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
 vehicleState === 'loading'
 ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'
 : 'bg-gray-600 text-gray-400 cursor-not-allowed'
 }`}
 whileHover={vehicleState === 'loading' ? { scale: 1.05 } : {}}
 whileTap={vehicleState === 'loading' ? { scale: 0.95 } : {}}
 >
 Call for {num}
 </motion.button>
 ))}
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
 {/* TASK 37: Call for # message display */}
 {callForMessage && (
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg z-50"
 >
 {callForMessage}
 </motion.div>
 )}
</div>
 </header>

 {/* Main Game Area */}
 <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
 {/* Guest Queue - Full Width on Mobile/Side on Desktop */}
 <div className="w-full lg:w-2/5 xl:w-1/3 bg-gray-800/50 p-4 lg:p-6 overflow-y-auto z-10 backdrop-blur flex-shrink-0 transition-all duration-300">
 <div className="flex items-center justify-between mb-4 lg:mb-6">
 <h3 className="text-lg lg:text-xl font-semibold text-blue-300">Guest Queue</h3>
 </div>

 {/* Queue Flow: Responsive grid with fly-in animations */}
 <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-4 xl:grid-cols-3 gap-3 lg:gap-4 content-start">
 <AnimatePresence mode="popLayout">
 {groups.slice(0, 8).map((group, index) => {
 const isDiscovered = discoveredGroups.has(group.id);
 const isActive = activeGroupId === group.id;

 if (!isDiscovered) {
 // Find the first undiscovered group by ID
 // CRITICAL FIX: Allow ANY undiscovered group to be clickable
 const isClickable = !completedGroups.has(group.id);

 return (
 <motion.div
 key={group.id}
 layout
 initial={{ opacity: 0, x: -30, scale: 0.9 }}
 animate={{ opacity: 1, x: 0, scale: 1 }}
 transition={{ type: "spring", stiffness: 250, damping: 20 }}
 >
 <MysteryGroup
 index={index}
 onClick={() => isClickable && handleGroupClick(group.id)}
 disabled={!isClickable}
 />
 </motion.div>
 );
 }
 return (
 />
 </motion.div>
 );
 }

 return (
 <motion.div
 key={group.id}
 layout
 initial={{ opacity: 0, y: 20, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ type: "spring", stiffness: 300, damping: 25 }}
 >
 <DiscoveredGroup
 group={group}
 groupIndex={index}
 active={isDiscovered}
 selectedGuestId={selectedGuest?.id || null}
 onGuestClick={handleGuestClick}
 />
 </motion.div>
 );
 })}
 </AnimatePresence>
 );
 })()}

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

 </div>

 {/* Vehicle Area - Side on Desktop, Below on Mobile */}
 <div className="w-full lg:w-3/5 xl:w-2/3 relative flex flex-col items-center justify-center min-h-[300px] lg:min-h-0 bg-gray-900/50 lg:bg-transparent">
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
 className="w-full max-w-2xl px-4"
 >
 {/* TASK 25: Unified Vehicle Display */}
 <div className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 p-6 rounded-2xl border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20">
 <div className="flex items-center justify-between mb-4">
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

 {/* TASK 25: Unified Vehicle - All rows in one container */}
 <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 overflow-hidden">
 {vehicleConfig.map((capacity: number, rowIndex: number) => {
 // Calculate which seats belong to this row
 const startIdx = vehicleConfig.slice(0, rowIndex).reduce((a: number, b: number) => a + b, 0);
 const rowGuests = vehicleGuests.slice(startIdx, startIdx + capacity);

 return (
 <div
 key={rowIndex}
 className={`p-4 flex items-center justify-center ${
 rowIndex < vehicleConfig.length - 1 ? 'border-b border-gray-700/50' : ''
 }`}
 >
 <Seat
 capacity={capacity}
 filled={rowGuests}
 onClick={(seatIndex) => handleSeatClick(startIdx + seatIndex)}
 disabled={vehicleState !== 'loading'}
 rowIndex={rowIndex}
 startSeatIndex={startIdx}
 />
 </div>
 );
 })}
 </div>

 {/* Vehicle Capacity Indicator - Seats as circles */}
 <div className="mt-4 flex items-center justify-between text-sm">
 <span className="text-gray-400">
 Capacity: {vehicleGuests.filter(g => g !== null).length} / {vehicleConfig.reduce((a, b) => a + b, 0)}
 </span>
 </div>
 </div>
 </motion.div>
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}
