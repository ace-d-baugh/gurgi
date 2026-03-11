import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideApi, locationApi } from '../services/api';
import { Location, Ride } from '../types';

const parks = [
 { name: 'Magic Kingdom', slug: 'magic-kingdom', icon: '🏰' },
 { name: 'EPCOT', slug: 'epcot', icon: '🌍' },
 { name: 'Hollywood Studios', slug: 'hollywood-studios', icon: '🎬' },
 { name: 'Animal Kingdom', slug: 'animal-kingdom', icon: '🦒' }
];

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
 <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex flex-col items-center justify-center p-8">
 <div className="text-center mb-12">
 <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
 G.U.R.G.I.
 </h1>
 <p className="text-xl text-blue-200">Guest Unit Ride Grouper Interface</p>
 <p className="text-blue-300 mt-2">Disney Cast Member Training System</p>
 </div>

 <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-4xl">
 <h2 className="text-2xl font-semibold text-white mb-6 text-center">Select a Park</h2>
 
 <div className="grid grid-cols-4 gap-4 mb-8">
 {parks.map(park => (
 <button
 key={park.slug}
 onClick={() => {
 setSelectedPark(park.slug);
 setSelectedRide(null);
 setRides([]);
 }}
 className={`flex flex-col items-center p-6 rounded-xl transition-all ${
 selectedPark === park.slug
 ? 'bg-blue-500 text-white scale-105'
 : 'bg-white/20 text-white hover:bg-white/30'
 }`}
 >
 <span className="text-4xl mb-2">{park.icon}</span>
 <span className="text-sm font-medium text-center">{park.name}</span>
 </button>
 ))}
 </div>

 {selectedPark && (
 <div className="border-t border-white/20 pt-6">
 <h3 className="text-xl text-white mb-4">Select a Ride</h3>
 
 {error && (
 <div className="text-red-300 text-center mb-4">{error}</div>
 )}
 
 {loading ? (
 <div className="text-center text-blue-200">Loading rides...</div>
 ) : rides.length > 0 ? (
 <>
 <select
 className="w-full p-4 rounded-lg bg-white/20 text-white border border-white/30"
 value={selectedRide?._id || ''}
 onChange={(e) => {
 const ride = rides.find(r => r._id === e.target.value);
 setSelectedRide(ride || null);
 }}
 >
 <option value="" className="text-gray-800">Choose a ride...</option>
 {rides.map(ride => (
 <option key={String(ride._id)} value={String(ride._id)} className="text-gray-800">
 {ride.name}
 </option>
 ))}
 </select>

 {selectedRide && (
 <div className="mt-6">
 <button
 onClick={handleGo}
 className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg transition-colors"
 >
 START TRAINING
 </button>
 </div>
 )}
 </>
 ) : (
 <p className="text-center text-gray-400">No rides available for this park</p>
 )}
 </div>
 )}

 {!selectedPark && (
 <p className="text-center text-blue-200 mt-4">
 Click a park icon above to begin
 </p>
 )}
 </div>

 <div className="mt-8 text-center">
 <a 
 href="/proprietor" 
 className="text-white/60 hover:text-white text-sm underline"
 >
 Administration
 </a>
 </div>
 </div>
 );
}
