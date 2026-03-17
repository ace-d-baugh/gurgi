import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
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

 return (
 <div className="space-y-4">
 {/* Header with Add Button */}
 <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
 
 </div>

 {/* Locations with Collapsible Rides */}
 <div className="space-y-3">
 {locations.map((location) => {
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
 ride.active
 ? 'bg-green-500/20 text-green-300 border border-green-500/30'
 : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
 }`}>
 {ride.active ? 'Active' : 'Inactive'}
 </span>
 </div>
 <p className="text-sm text-indigo-300/60 mt-1">{ride.rideType}</p>
 </div>
 <div className="flex items-center gap-2">
 <motion.button
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => onEdit(ride)}
 className="p-2.5 rounded-lg bg-indigo-500/40 hover:bg-indigo-500/60 active:bg-indigo-500/80 text-indigo-200 hover:text-white transition-all"
 title="Edit ride"
 >
 <Pencil className="w-5 h-5" />
 </motion.button>
 <motion.button
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => onDelete(ride._id)}
 className="p-2.5 rounded-lg bg-red-500/40 hover:bg-red-500/60 active:bg-red-500/80 text-red-200 hover:text-white transition-all"
 title="Delete ride"
 >
 <Trash2 className="w-5 h-5" />
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
 {locations.length === 0 && (
 <div className="text-center py-12">
 <p className="text-white/50 text-lg">'No locations available'</p>
 </div>
 )}
 </div>
 );
};
