import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, AnimatePresence as AnimatePresenceType } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { rideApi } from '../services/api';
import { Ride } from '../types';
import HowToPlayModal from '../components/game/HowToPlayModal';

const parks = [
 { name: 'Magic Kingdom', slug: 'magic-kingdom', icon: '🏰', gradient: 'from-blue-500 via-purple-500 to-pink-500' },
 { name: 'EPCOT', slug: 'epcot', icon: '🌍', gradient: 'from-cyan-400 via-blue-500 to-purple-600' },
 { name: 'Hollywood Studios', slug: 'hollywood-studios', icon: '🎬', gradient: 'from-red-500 via-orange-500 to-yellow-500' },
 { name: 'Animal Kingdom', slug: 'animal-kingdom', icon: '🌳', gradient: 'from-green-400 via-emerald-500 to-teal-600' }
];

function FloatingParticles() {
 return (
 <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
 {Array.from({ length: 30 }).map((_, i) => (
 <motion.div
 key={i}
 className="absolute w-1 h-1 bg-yellow-400/60 rounded-full"
 initial={{
 x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
 y: -10,
 opacity: 0
 }}
 animate={{
 y: [null, (typeof window !== 'undefined' ? window.innerHeight : 800) + 10],
 opacity: [0, 1, 1, 0],
 scale: [0.5, 1.2, 1, 0.8]
 }}
 transition={{
 duration: 8 + Math.random() * 4,
 repeat: Infinity,
 delay: i * 0.3,
 ease: "linear"
 }}
 style={{ left: `${Math.random() * 100}%` }}
 />
 ))}
 </div>
 );
}

// Hamburger Menu Component for Landing Page
function HamburgerMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
 const navigate = useNavigate();
 const [howToPlayOpen, setHowToPlayOpen] = useState(false);

 const handleHowToPlay = () => {
 onClose();
 setHowToPlayOpen(true);
 };

 const handleAdmin = () => {
 onClose();
 navigate('/proprietor');
 };

 const handleMainMenu = () => {
 onClose();
 navigate('/');
 };

 return (
 <>
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
 className="fixed left-0 top-0 bottom-0 w-80 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 border-r border-white/20 z-50 p-6 shadow-2xl"
 >
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-white">Menu</h2>
 <button 
 onClick={onClose}
 className="p-2 hover:bg-white/10 rounded-lg transition-colors"
 >
 <X className="w-6 h-6 text-white" />
 </button>
 </div>
 <nav className="space-y-3">
 <motion.button
 whileHover={{ x: 5 }}
 onClick={handleHowToPlay}
 className="w-full flex items-center gap-4 px-4 py-3 text-indigo-100 hover:bg-white/10 hover:text-yellow-300 rounded-xl transition-all group"
 >
 <span className="text-xl group-hover:scale-110 transition-transform">📖</span>
 <span className="font-medium">How to Play</span>
 </motion.button>
 <motion.button
 whileHover={{ x: 5 }}
 onClick={handleAdmin}
 className="w-full flex items-center gap-4 px-4 py-3 text-indigo-100 hover:bg-white/10 hover:text-yellow-300 rounded-xl transition-all group"
 >
 <span className="text-xl group-hover:scale-110 transition-transform">🔐</span>
 <span className="font-medium">Administration</span>
 </motion.button>
 <div className="border-t border-white/10 my-4" />
 <motion.button
 whileHover={{ x: 5 }}
 onClick={handleMainMenu}
 className="w-full flex items-center gap-4 px-4 py-3 text-indigo-100 hover:bg-white/10 hover:text-yellow-300 rounded-xl transition-all group"
 >
 <span className="text-xl group-hover:scale-110 transition-transform">🏠</span>
 <span className="font-medium">Main Menu</span>
 </motion.button>
 </nav>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 <HowToPlayModal isOpen={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
 </>
 );
}

export default function Landing() {
 const navigate = useNavigate();
 const [selectedPark, setSelectedPark] = useState<string | null>(null);
 const [rides, setRides] = useState<Ride[]>([]);
 const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [menuOpen, setMenuOpen] = useState(false);

 useEffect(() => {
 if (selectedPark) {
 setLoading(true);
 setError('');
 setSelectedRide(null); // Reset selected ride when park changes
   
   rideApi.getAll()
     .then(res => {
       const parkRides = res.data.filter((r: Ride) => r.location?.slug === selectedPark);
       setRides(parkRides);
       if (parkRides.length === 0) {
         setError('No rides found for this park');
       }
     })
     .catch(err => {
       setError('Failed to load rides');
       console.error(err);
     })
     .finally(() => setLoading(false));
 }
 }, [selectedPark]);

 const handleGo = () => {
 if (selectedRide && selectedPark) {
 navigate(`/${selectedPark}/${selectedRide.nameSlug}`);
 }
 };

 // TASK 30: Fix park re-click - reload dropdown instead of disappearing
 const handleParkClick = (parkSlug: string) => {
 if (selectedPark === parkSlug) {
 // Re-clicking same park should reload the dropdown
 setLoading(true);
 setError('');
 setSelectedRide(null);
 
   rideApi.getAll()
     .then(res => {
       const parkRides = res.data.filter((r: Ride) => r.location?.slug === parkSlug);
       setRides(parkRides);
       if (parkRides.length === 0) {
         setError('No rides found for this park');
       } else {
         setError('');
       }
     })
     .catch(err => {
       setError('Failed to load rides');
       console.error(err);
     })
     .finally(() => setLoading(false));
 } else {
   setSelectedPark(parkSlug);
 }
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
 <FloatingParticles />
   
 {/* Hamburger Menu */}
 <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
   
 {/* Header with Hamburger */}
 <header className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
 <motion.button
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => setMenuOpen(true)}
 className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all group"
 >
 <Menu className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors" />
 </motion.button>
 </header>
 
 <div className="relative z-10 container mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center">
 <motion.div
 initial={{ opacity: 0, y: -30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, type: "spring" }}
 className="text-center mb-12"
 >
 <h1 className="text-6xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
 G.U.R.G.I.
 </h1>
 <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide mb-2">
 Guest Unit Ride Grouper Interface
 </p>
 <p className="text-lg text-yellow-300/80 font-medium">
 ✨ Disney Cast Member Training System ✨
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.2, duration: 0.5 }}
 className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 w-full max-w-5xl shadow-2xl"
 >
 <h2 className="text-3xl font-bold text-white mb-8 text-center drop-shadow-md">
 Select Your <span className="text-yellow-400">Park</span>
 </h2>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
 {parks.map((park, index) => (
 <motion.button
 key={park.slug}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 * index, duration: 0.4 }}
 whileHover={{ scale: 1.05, y: -5 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => handleParkClick(park.slug)}
 className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
 selectedPark === park.slug
 ? `border-yellow-400 bg-gradient-to-br ${park.gradient} shadow-[0_0_30px_rgba(255,193,7,0.4)]`
 : 'border-white/20 bg-white/5 hover:bg-white/15 hover:border-white/40'
 }`}
 >
 <motion.span
 className="text-4xl md:text-5xl mb-3 filter drop-shadow-lg"
 animate={{ rotate: selectedPark === park.slug ? [0, -10, 10, 0] : 0 }}
 transition={{ duration: 0.5 }}
 >
 {park.icon}
 </motion.span>
 <span className="text-white font-semibold text-sm md:text-base text-center">{park.name}</span>
 {selectedPark === park.slug && (
 <motion.div
 layoutId="selector"
 className="absolute -bottom-3 w-20 h-1.5 bg-yellow-400 rounded-full"
 transition={{ type: "spring", stiffness: 500, damping: 30 }}
 />
 )}
 </motion.button>
 ))}
 </div>

 {selectedPark && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 className="border-t border-white/20 pt-8"
 >
 <h3 className="text-2xl font-bold text-white mb-6 text-center">
 Choose Your <span className="text-cyan-400">Ride</span>
 </h3>
 
 {error && (
 <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-6 py-4 rounded-xl mb-4 text-center">
 {error}
 </div>
 )}
 
 {loading ? (
 <div className="flex items-center justify-center py-8">
 <div className="animate-spin h-12 w-12 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
 </div>
 ) : rides.length > 0 ? (
 <>
 <div className="space-y-4">
 <select
 className="w-full p-4 bg-black/30 border-2 border-white/20 rounded-xl text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
 value={selectedRide?._id || ''}
 onChange={(e) => {
 const ride = rides.find(r => r._id === e.target.value);
 setSelectedRide(ride || null);
 }}
 >
 <option value="" className="text-gray-800 bg-white">Select a Ride...</option>
 {rides.map(ride => (
 <option key={String(ride._id)} value={String(ride._id)} className="text-gray-800 bg-white">
 {ride.name} {ride.deviceTypeEmoji}
 </option>
 ))}
 </select>

 {selectedRide && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="mt-6 text-center"
 >
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={handleGo}
 className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:shadow-green-400/30 transition-all text-lg uppercase tracking-wider"
 >
 Start Training! ✨
 </motion.button>
 <p className="text-white/60 mt-4">Training for: <span className="text-yellow-300">{selectedRide.name}</span></p>
 </motion.div>
 )}
 </div>
 </>
 ) : (
 <p className="text-center text-white/60 py-8">No rides available for this park</p>
 )}
 </motion.div>
 )}
 </motion.div>
</div>
 </div>
 );
}
