import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Ride, Location } from '../../types';

interface RidesListProps {
  rides: Ride[];
  locations: Location[];
  onEdit: (ride: Ride) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

type SortField = 'name' | 'location' | 'type' | 'capacity' | 'isActive';
type SortDirection = 'asc' | 'desc';

export const RidesList: React.FC<RidesListProps> = ({
  rides,
  locations,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const getLocationName = (locationId: string) => {
    const location = locations.find((l) => l._id === locationId);
    return location?.name || 'Unknown';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortHeader: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({
    field,
    children,
    className = '',
  }) => (
    <th
      onClick={() => handleSort(field)}
      className={`px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${className}`}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  const filteredAndSortedRides = useMemo(() => {
    let result = [...rides];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ride) =>
          ride.name.toLowerCase().includes(query) ||
          getLocationName(ride.locationId).toLowerCase().includes(query) ||
          ride.rideType.toLowerCase().includes(query)
      );
    }
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'location':
          comparison = getLocationName(a.locationId).localeCompare(getLocationName(b.locationId));
          break;
        case 'type':
          comparison = a.rideType.localeCompare(b.rideType);
          break;
        case 'capacity':
          comparison = a.capacity - b.capacity;
          break;
        case 'isActive':
          comparison = Number(a.isActive) - Number(b.isActive);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [rides, searchQuery, sortField, sortDirection]);

  return (
    <div className="space-y-6">
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

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <SortHeader field="name">Name</SortHeader>                <SortHeader field="type" className="hidden md:table-cell">Type</SortHeader>
                <SortHeader field="capacity" className="hidden lg:table-cell">Capacity</SortHeader>
                <SortHeader field="isActive">Status</SortHeader>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredAndSortedRides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/60">
                    {searchQuery ? 'No rides match your search' : 'No rides found'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedRides.map((ride) => (
                  <motion.tr
                    key={ride._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{ride.name}</div>
                    </td>                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 text-sm">
                        {ride.rideType}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-white/80">{ride.capacity}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ride.isActive
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}
                      >
                        {ride.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
