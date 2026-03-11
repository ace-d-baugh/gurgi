import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { rideApi } from '../services/api';
import { Ride } from '../types';

const parks = [
 { name: 'Magic Kingdom', slug: 'magic-kingdom', icon: '🏰', color: 'from-blue-500 to-purple-600' },
 { name: 'EPCOT', slug: 'epcot', icon: '🌍', color: 'from-cyan-500 to-blue-500' },
 { name: 'Hollywood Studios', slug: 'hollywood-studios', icon: '🎬', color: 'from-red-500 to-pink-600' },
 { name: 'Animal Kingdom', slug: 'animal-kingdom', icon: '🌳', color: 'from-green-500 to-teal-600' }
];

// Floating particles component
function FloatingParticles() {
 return (
 <div className="bg-particles">
 {Array.from({ length: 20 }).map((_, i) => (
 <div
 key={i}
 className="particle"
 style={{
 left: `${Math.random() * 100}%`,
 animationDelay: `${Math.random() * 15}s`,
 animationDuration: `${15 + Math.random() * 10}s`
 }}
 />
 ))}
 </div>
 );
}

export default function Landing() {
 const navigate = useNavigate();
 const [selectedPark, setSelectedPark] = useState<string | null>(null);
 const [rides, setRides] = useState<Ride[]>([]);
 const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
 if (selectedPark) {
 setLoading(true);
 setError('');
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

 return (
 <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-8">
 <FloatingParticles />
 
 <div className="relative z-10 text-center mb-12">
 <motion.h1
 initial={{ opacity: 0, y: -30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8 }}
 className="text-7xl font-bold mb-4 gradient-text"
 style={{ fontFamily: '"Playfair Display", serif' }}
 >
 G.U.R.G.I.
 </motion.h1>
 <motion.p
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.3, duration: 0.6 }}
 className="text-2xl text-white/90 font-light tracking-wide"
 >
 Guest Unit Ride Grouper Interface
 </motion.p>
 <motion.p
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.5, duration: 0.6 }}
 className="text-lg text-yellow-400/80 mt-2"
 >
 ✨ Disney Cast Member Training System ✨
 </motion.p>
 </div>

 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.3, duration: 0.5 }}
 className="glass-card p-10 w-full max-w-5xl relative z-10"
 >
 <h2 className="text-3xl font-bold text-white mb-8 text-center">
 Select Your <span className="text-yellow-400">Park</span>
 </h2>
 
 <div className="grid grid-cols-4 gap-6 mb-10">
 {parks.map((park, index) => (
 <motion.button
 key={park.slug}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 + index * 0.1 }}
 whileHover={{ scale: 1.08, y: -5 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => {
 setSelectedPark(park.slug);
 setSelectedRide(null);
 setRides([]);
 }}
 className={`park-btn ${selectedPark === park.slug ? 'active' : ''}`}
 >
 <motion.span
 animate={{ rotate: [0, -10, 10, 0] }}
 transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
 className="text-5xl mb-3 block"
 >
 {park.icon}
 </motion.span>
 <span className="text-white font-semibold text-sm text-center">{park.name}</span>
 {selectedPark === park.slug && (
 <motion.div
 layoutId="park-indicator"
 className="absolute -bottom-2 w-16 h-1 bg-yellow-400 rounded-full"
 />
 )}
 </motion.button>
 ))}
 </div>

 {selectedPark && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 transition={{ duration: 0.4 }}
 className="border-t border-white/20 pt-8"
 >
 <h3 className="text-2xl text-white mb-6 text-center">
 Choose Your <span className="text-cyan-400">Ride</span>
 </h3>
 
 {error && (
 <div className="text-red-400 text-center mb-6 bg-red-500/10 py-3 rounded-lg">
 {error}
 </div>
 )}
 
 {loading ? (
 <div className="flex justify-center py-8">
 <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
 </div>
 ) : rides.length > 0 ? (
 <>
 <select
 className="w-full p-5 rounded-xl bg-black/30 text-white border-2 border-white/20 focus:border-yellow-400 focus:outline-none transition-colors text-lg"
 value={selectedRide?._id || ''}
 onChange={(e) => {
 const ride = rides.find(r => r._id === e.target.value);
 setSelectedRide(ride || null);
 }}
 >
 <option value="" className="bg-gray-900">Choose a magical experience...</option>
 {rides.map(ride => (
 <option key={String(ride._id)} value={String(ride._id)} className="bg-gray-900">
 {ride.name} {ride.deviceTypeEmoji}
 </option>
 ))}
 </select>

 {selectedRide && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="mt-10 text-center"
 >
 <motion.button
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.98 }}
 onClick={handleGo}
 className="btn-magic text-xl uppercase tracking-widest"
 >
 Start Your Adventure ✨
 </motion.button>
 <p className="text-white/60 mt-4 text-sm">
 Train for: {selectedRide.name}
 </p>
 </motion.div>
 )}
 </>
 ) : (
 <p className="text-center text-white/60 py-8">No rides available for this park</p>
 )}
 </div>
 )}
 </motion.div>

 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 1 }}
 className="mt-10 text-center relative z-10"
 >
 <motion.a
 whileHover={{ scale: 1.05 }}
 href="/proprietor"
 className="text-white/50 hover:text-yellow-400 text-sm transition-colors inline-flex items-center gap-2"
 >
 <span>🔐</span> Administration
 </motion.a>
 </motion.div>
 </div>
 );
}
