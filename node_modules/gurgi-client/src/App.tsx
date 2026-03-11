import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Game from './pages/Game';
import Admin from './pages/Admin';
import { AuthProvider } from './hooks/useAuth';

function App() {
 return (
 <AuthProvider>
 <div className="min-h-screen bg-gray-100">
 <Routes>
 <Route path="/" element={<Landing />} />
 <Route path="/:parkSlug/:rideSlug" element={<Game />} />
 <Route path="/proprietor" element={<Admin />} />
 </Routes>
 </div>
 </AuthProvider>
 );
}

export default App;
