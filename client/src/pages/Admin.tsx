import { useState } from 'react';

export default function Admin() {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [error, setError] = useState('');

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 const res = await fetch('/api/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ username, password })
 });
 const data = await res.json();
 if (data.token) {
 localStorage.setItem('token', data.token);
 setIsAuthenticated(true);
 } else {
 setError('Invalid credentials');
 }
 } catch (err) {
 setError('Login failed');
 }
 };

 if (isAuthenticated) {
 return (
 <div className="min-h-screen bg-gray-900 text-white p-8">
 <div className="max-w-6xl mx-auto">
 <h1 className="text-3xl font-bold mb-8 text-blue-400">GURGI Admin Panel</h1>
 
 <div className="grid grid-cols-2 gap-8">
 <div className="bg-gray-800 p-6 rounded-xl">
 <h2 className="text-xl font-semibold mb-4">Rides</h2>
 <p className="text-gray-400 mb-4">Manage Disney ride configurations</p>
 <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
 View Rides
 </button>
 </div>
 
 <div className="bg-gray-800 p-6 rounded-xl">
 <h2 className="text-xl font-semibold mb-4">Locations</h2>
 <p className="text-gray-400 mb-4">Manage park locations</p>
 <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
 View Locations
 </button>
 </div>
 </div>
 
 <div className="mt-8 text-center">
 <a href="/" className="text-blue-400 hover:underline">
 ← Back to Training
 </a>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
 <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md">
 <h1 className="text-2xl font-bold text-white mb-2 text-center">Admin Login</h1>
 <p className="text-blue-200 text-center mb-8">The Horned King</p>
 
 {error && (
 <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm">
 {error}
 </div>
 )}
 
 <form onSubmit={handleLogin} className="space-y-4">
 <input
 type="text"
 placeholder="Username"
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
 />
 <input
 type="password"
 placeholder="Password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
 />
 <button
 type="submit"
 className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
 >
 Sign In
 </button>
 </form>
 
 <div className="mt-6 text-center">
 <a href="/" className="text-white/60 hover:text-white text-sm">
 ← Back to Training
 </a>
 </div>
 </div>
 </div>
 );
}
