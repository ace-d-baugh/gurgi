import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { Ride, Location } from '../../types';

interface RidesListProps {
 rides: Ride[];
 locations: Location[];
 onEdit: (ride: Ride) => void;
 onDelete: (id: string) => void;
 onCreate: () => void;
}

export const RidesList: React.FC<RidesListProps> = ({
 rides,
 locations,
 onEdit,
 onDelete,
 onCreate,
}) => {
 const [searchQuery, setSearchQuery] = useState('');
 const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());

 const getLocationName = (locationId: string) => {
 const location = locations.find((l) => l._id === locationId);
 return location?.name || 'Unknown';
 };

 const getLocationRides = (locationId: string) => {
 return rides.filter(r => 
 (typeof r.location === 'object' && r.location?._id === locationId) ||
 r.location === locationId
 );
 };

 const toggleLocation = (locationId: string) => {
 setExpandedLocations(prev => {
 const newSet = new Set(prev);
 if (newSet.has(locationId)) {
 newSet.delete(locationId);
 } else {
 newSet.add(locationId);
 }
 return newSet;
 });
 };

 const filteredLocations = useMemo(() => {
 if (!searchQuery) return locations;
 return locations.filter(loc => 
 loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 getLocationRides(loc._id).some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
 );
 }, [locations, rides, searchQuery]);

 return (
 <div className="space-y-4">
 {/* Header with Add Button */}
 <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
 <div className="relative flex-1 w-full sm:max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
 <input
 type="text"
 placeholder="Search rides by name, location..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-amber-400/50 transition-colors"
 />
 </div>
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={onCreate}
 className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-white font-medium shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
 >
 <Plus className="w-5 h-5" />
 Add New Ride
 </motion.button>
 </div>

 {/* Locations with Collapsible Rides */}
 <div className="space-y-3">
 {filteredLocations.map((location) => {
 const locationRides = getLocationRides(location._id);
 const isExpanded = expandedLocations.has(location._id);

 return (
 <motion.div
 key={location._id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
 >
 {/* Location Header */}
 <button
 onClick={() => toggleLocation(location._id)}
 className="w-full px-6 py-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
 >
 <div className="flex items-center gap-3">
 <motion.div
 animate={{ rotate: isExpanded ? 90 : 0 }}
 transition={{ duration: 0.2 }}
 >
 <ChevronRight className="w-5 h-5 text-amber-400" />
 </motion.div>
 <div className="text-left">
 <h3 className="text-lg font-semibold text-white">{location.name}</h3>
 <p className="text-sm text-indigo-300/60">{locationRides.length} ride{locationRides.length !== 1 ? 's' : ''}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${
 location.isActive 
 ? 'bg-green-500/20 text-green-300 border border-green-500/30'
 : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
 }`}>
 {location.isActive ? 'Active' : 'Inactive'}
 </span>
 {isExpanded ? (
 <ChevronUp className="w-5 h-5 text-white/60" />
 ) : (
 <ChevronDown className="w-5 h-5 text-white/60" />
 )}
 </div>
 </button>

 {/* Rides under Location */}
 <AnimatePresence>
 {isExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.3, ease: "easeInOut" }}
 className="overflow-hidden"
 >
 <div className="border-t border-white/10">
 {locationRides.length === 0 ? (
 <p className="p-6 text-center text-white/50">No rides in this location</p>
 ) : (
 locationRides.map((ride) => (
 <motion.div
 key={ride._id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="p-4 border-b border-white/10 hover:bg-white/5 transition-colors flex items-center justify-between"
 >
 <div className="flex-1">
 <div className="flex items-center gap-3">
 <h4 className="font-medium text-white">{ride.name}</h4>
 <span className={`px-2 py-0.5 rounded-full text-xs ${
 ride.isActive
 ? 'bg-green-500/20 text-green-300 border border-green-500/30'
 : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
 }`}>
 {ride.isActive ? 'Active' : 'Inactive'}
 </span>
 </div>
 <p className="text-sm text-indigo-300/60 mt-1">{ride.rideType}</p>
 </div>
 <div className="flex items-center gap-2">
 <motion.button
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => onEdit(ride)}
 className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition-colors"
 title="Edit ride"
 >
 <Pencil className="w-4 h-4" />
 </motion.button>
 <motion.button
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => onDelete(ride._id)}
 className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
 title="Delete ride"
 >
 <Trash2 className="w-4 h-4" />
 </motion.button>
 </div>
 </motion.div>
 ))
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
 })}
 </div>

 {/* No Results */}
 {filteredLocations.length === 0 && (
 <div className="text-center py-12">
 <p className="text-white/50 text-lg">{searchQuery ? 'No locations match your search' : 'No locations available'}</p>
 </div>
 )}
 </div>
 );
};
