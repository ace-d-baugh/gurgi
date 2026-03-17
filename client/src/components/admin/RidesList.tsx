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
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${
