import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 LayoutDashboard, MapPin, Ticket, LogOut, 
 CheckCircle, AlertCircle, X, Menu, Home,
 TrendingUp, Settings, Plus
} from 'lucide-react';
import { Ride, Location } from '../types';
import { adminRideApi, adminLocationApi } from '../services/adminApi';
import { RidesList } from '../components/admin/RidesList';
import { RideForm } from '../components/admin/RideForm';
import { LocationsList } from '../components/admin/LocationsList';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';

type Tab = 'rides' | 'locations' | 'stats';

type Toast = {
 id: string;
 message: string;
 type: 'success' | 'error';
};

export default function Admin() {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [error, setError] = useState('');
 const [activeTab, setActiveTab] = useState<Tab>('rides');
 const [loading, setLoading] = useState(false);
 
 const [rides, setRides] = useState<Ride[]>([]);
 const [locations, setLocations] = useState<Location[]>([]);
 
 const [showRideForm, setShowRideForm] = useState(false);
 const [editingRide, setEditingRide] = useState<Ride | null>(null);
 const [deletingRideId, setDeletingRideId] = useState<string | null>(null);
 
 const [toasts, setToasts] = useState<Toast[]>([]);

 useEffect(() => {
 const token = localStorage.getItem('token');
 if (token) setIsAuthenticated(true);
 }, []);

 useEffect(() => {
 if (isAuthenticated) loadData();
 }, [isAuthenticated]);

 const loadData = async () => {
 setLoading(true);
 try {
 const [ridesData, locationsData] = await Promise.all([
 adminRideApi.getAll(),
 adminLocationApi.getAll()
 ]);
 setRides(ridesData);
 setLocations(locationsData);
 } catch (err) {
 showToast('Failed to load data', 'error');
 } finally {
 setLoading(false);
 }
 };

 const addToast = (message: string, type: 'success' | 'error') => {
 const id = Date.now().toString();
 setToasts(prev => [...prev, { id, message, type }]);
 setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
 };

 const showToast = (message: string, type: 'success' | 'error' = 'success') => addToast(message, type);

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
 if (!res.ok) throw new Error('Invalid credentials');
 const data = await res.json();
 if (data.token) {
 localStorage.setItem('token', data.token);
 setIsAuthenticated(true);
 setError('');
 }
 } catch (err: any) {
 setError(err.message || 'Login failed');
 }
 };

 const handleLogout = () => {
 localStorage.removeItem('token');
 setIsAuthenticated(false);
 setRides([]);
 setLocations([]);
 };

 const handleCreateRide = async (data: Partial<Ride>) => {
 setLoading(true);
 try {
 const newRide = await adminRideApi.create(data);
 setRides(prev => [...prev, newRide]);
 showToast('Ride created successfully');
 setShowRideForm(false);
 } catch (err: any) {
 showToast(err.response?.data?.error || 'Failed to create ride', 'error');
 } finally { setLoading(false); }
 };

 const handleUpdateRide = async (id: string, data: Partial<Ride>) => {
 setLoading(true);
 try {
 const updated = await adminRideApi.update(id, data);
 setRides(prev => prev.map(r => r._id === id ? updated : r));
 showToast('Ride updated successfully');
 setShowRideForm(false);
 setEditingRide(null);
 } catch (err: any) {
 showToast(err.response?.data?.error || 'Failed to update ride', 'error');
 } finally { setLoading(false); }
 };

 const handleDeleteRide = async (id: string) => {
 setLoading(true);
 try {
 await adminRideApi.delete(id);
 setRides(prev => prev.filter(r => r._id !== id));
 showToast('Ride deleted successfully');
 setDeletingRideId(null);
 } catch (err: any) {
 showToast(err.response?.data?.error || 'Failed to delete ride', 'error');
 } finally { setLoading(false); }
 };

 const handleCreateLocation = async (data: Partial<Location>) => {
 setLoading(true);
 try {
 const newLoc = await adminLocationApi.create(data);
 setLocations(prev => [...prev, newLoc]);
 showToast('Location created successfully');
 } catch (err: any) {
 showToast(err.response?.data?.error || 'Failed to create location', 'error');
 } finally { setLoading(false); }
 };

 const handleUpdateLocation = async (id: string, data: Partial<Location>) => {
 setLoading(true);
 try {
 const updated = await adminLocationApi.update(id, data);
 setLocations(prev => prev.map(l => l._id === id ? updated : l));
 setRides(prev => prev.map(r => typeof r.location === 'object' && r.location._id === id ? { ...r, location: updated } : r));
 showToast('Location updated successfully');
 } catch (err: any) {
 showToast(err.response?.data?.error || 'Failed to update location', 'error');
 } finally { setLoading(false); }
 };

 const handleDeleteLocation = async (id: string) => {
 setLoading(true);
 try {
 await adminLocationApi.delete(id);
 setLocations(prev => prev.filter(l => l._id !== id));
 setRides(prev => prev.filter(r => typeof r.location === 'object' ? r.location._id !== id : r.location !== id));
 showToast('Location deleted successfully');
 } catch (err: any) {
 showToast(err.response?.data?.error || 'Failed to delete location', 'error');
 } finally { setLoading(false); }
 };

 const navigation = [
 { id: 'rides' as Tab, label: 'Rides', icon: Ticket, count: rides.length },
 { id: 'locations' as Tab, label: 'Locations', icon: MapPin, count: locations.length },
 { id: 'stats' as Tab, label: 'Statistics', icon: TrendingUp },
 ];

 if (!isAuthenticated) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md border border-indigo-500/30 shadow-2xl">
 <div className="text-center mb-8">
 <h1 className="text-3xl font-bold text-white mb-2">GURGI Admin</h1>
 <p className="text-indigo-300/70">Welcome, The Horned King 👑</p>
 </div>
 
 {error && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
 <AlertCircle className="w-5 h-5" />{error}
 </motion.div>
 )}
 
 <form onSubmit={handleLogin} className="space-y-5">
 <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-indigo-500/30 text-white placeholder-indigo-300/50 focus:outline-none focus:border-amber-500 transition-all" />
 <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-indigo-500/30 text-white placeholder-indigo-300/50 focus:outline-none focus:border-amber-500 transition-all" />
 <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">Sign In</motion.button>
 </form>
 
 <div className="mt-8 text-center">
 <a href="/" className="text-indigo-300/60 hover:text-indigo-300 text-sm flex items-center justify-center gap-2"><Home className="w-4 h-4" /> Back to Training</a>
 </div>
 </motion.div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
 <div className="flex">
 <aside className="hidden lg:block w-72 bg-slate-900/80 backdrop-blur-xl border-r border-indigo-500/30 min-h-screen sticky top-0">
 <div className="p-6">
 <div className="flex items-center gap-3 mb-8">
 <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center"><span className="text-2xl">🐺</span></div>
 <div><h1 className="text-xl font-bold text-white">GURGI</h1><p className="text-indigo-300/60 text-xs">Admin Panel</p></div>
 </div>

 <nav className="space-y-2">
 {navigation.map((item) => {
 const Icon = item.icon;
 return (
 <motion.button key={item.id} whileHover={{ x: 4 }} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30' : 'text-indigo-300 hover:bg-white/5 hover:text-white'}`}>
 <Icon className="w-5 h-5" />
 <span className="flex-1 text-left font-medium">{item.label}</span>
 {item.count !== undefined && (<span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">{item.count}</span>)}
 </motion.button>
 );
 })}
 </nav>

 <div className="mt-auto pt-6 sticky bottom-0 bg-slate-900/80 backdrop-blur-xl">
 <div className="bg-slate-800/50 border border-indigo-500/20 rounded-xl p-4 mb-3">
 <p className="text-indigo-300/60 text-xs mb-1">Logged in as</p>
 <p className="text-white font-medium">The Horned King</p>
 </div>
 <a href="/" className="flex items-center gap-3 px-4 py-3 mb-3 text-indigo-300 hover:bg-white/5 hover:text-white rounded-xl transition-all">
 <Home className="w-5 h-5" />Return to Main
 </a>
 <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all">
 <LogOut className="w-5 h-5" />Sign Out
 </button>
 </div>
 </div>
 </aside>

 <main className="flex-1 p-4 lg:p-8">
 <AnimatePresence mode="wait">
 {activeTab === 'rides' && (
 <motion.div key="rides" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-7xl mx-auto space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-3xl font-bold text-white mb-1">Rides</h2>
 <p className="text-indigo-300/60">Manage attraction configurations</p>
 </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setEditingRide(null); setShowRideForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Ride
          </motion.button>
 </div>

 <RidesList rides={rides} locations={locations} onEdit={(ride) => { setEditingRide(ride); setShowRideForm(true); }} onDelete={(id) => setDeletingRideId(id)} isLoading={loading} />

 <ConfirmDialog isOpen={!!deletingRideId} title="Delete Ride" message="Are you sure you want to delete this ride? This will soft-delete it and hide it from the public site." onConfirm={() => deletingRideId && handleDeleteRide(deletingRideId)} onCancel={() => setDeletingRideId(null)} />

 {showRideForm && (<RideForm ride={editingRide} locations={locations} onSave={(data) => editingRide ? handleUpdateRide(editingRide._id, data) : handleCreateRide(data)} onCancel={() => { setShowRideForm(false); setEditingRide(null); }} isLoading={loading} />)}
 </motion.div>
 )}

 {activeTab === 'locations' && (
 <motion.div key="locations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-5xl mx-auto">
 <LocationsList locations={locations} onCreate={handleCreateLocation} onUpdate={handleUpdateLocation} onDelete={handleDeleteLocation} isLoading={loading} />
 </motion.div>
 )}

 {activeTab === 'stats' && (
 <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-5xl mx-auto">
 <h2 className="text-3xl font-bold text-white mb-6">Statistics Overview</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
 <div className="flex items-center justify-between mb-4"><Ticket className="w-8 h-8 text-amber-400" /><span className="text-4xl font-bold text-white">{rides.length}</span></div>
 <p className="text-indigo-300/70">Total Rides</p>
 </div>
 <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
 <div className="flex items-center justify-between mb-4"><MapPin className="w-8 h-8 text-purple-400" /><span className="text-4xl font-bold text-white">{locations.length}</span></div>
 <p className="text-indigo-300/70">Total Locations</p>
 </div>
 <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
 <div className="flex items-center justify-between mb-4"><TrendingUp className="w-8 h-8 text-green-400" /><span className="text-4xl font-bold text-white">{rides.filter(r => r.active).length}</span></div>
 <p className="text-indigo-300/70">Active Rides</p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </main>
 </div>

 <div className="fixed bottom-6 right-6 z-50 space-y-3">
 <AnimatePresence>
 {toasts.map((toast) => (
 <motion.div key={toast.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl backdrop-blur-xl border ${toast.type === 'success' ? 'bg-green-500/90 border-green-400/50 text-white' : 'bg-red-500/90 border-red-400/50 text-white'}`}>
 {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
 <span className="font-medium">{toast.message}</span>
 <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="p-1 hover:bg-white/20 rounded"><X className="w-4 h-4" /></button>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 </div>
 );
}
