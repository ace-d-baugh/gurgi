import { motion } from 'framer-motion';
import { ChevronLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
 const navigate = useNavigate();

 return (
 <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
 {/* Floating Particles */}
 <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
 {Array.from({ length: 20 }).map((_, i) => (
 <motion.div
 key={i}
 className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
 initial={{
 x: Math.random() * 1000,
 y: -10,
 opacity: 0
 }}
 animate={{
 y: [null, 800 + 10],
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

 {/* Header */}
 <header className="fixed top-0 left-0 right-0 z-40 p-4 flex items-center gap-4 bg-gradient-to-b from-black/50 to-transparent">
 <motion.button
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => navigate('/')}
 className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all text-white"
 >
 <ChevronLeft className="w-5 h-5" />
 <span>Back</span>
 </motion.button>
 <h1 className="text-xl font-bold text-white flex items-center gap-2">
 <Info className="w-5 h-5 text-amber-400" />
 About
 </h1>
 </header>

 {/* Content */}
 <div className="relative z-10 container mx-auto px-4 py-24 max-w-4xl">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
 >
 <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
 G.U.R.G.I.
 </h1>
 <p className="text-xl text-white/80 mb-2">Guest Unit Ride Grouper Interface</p>
 <p className="text-lg text-yellow-300/80 mb-8">✨ Disney Cast Member Training System ✨</p>

 {/* Mission Section */}
 <div className="mb-8">
 <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
 <span className="text-3xl">🎯</span> Our Mission
 </h2>
 <p className="text-indigo-100/90 leading-relaxed">
 G.U.R.G.I. is a browser-based training application designed to help Disney theme park cast members learn how to efficiently and safely group guests onto ride vehicles. The application gamifies the learning experience, allowing trainers to customize scenarios based on specific rides and operational parameters.
 </p>
 </div>

 {/* Why GURGI Section */}
 <div className="mb-8">
 <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
 <span className="text-3xl">🎢</span> Why G.U.R.G.I.?
 </h2>
 <div className="bg-indigo-900/30 rounded-xl p-6 border border-white/10">
 <ul className="space-y-3 text-indigo-100/90">
 <li className="flex items-start gap-3">
 <span className="text-green-400 text-xl">✅</span>
 <span><strong>Safe Practice Environment</strong> – Learn without the pressure of real guests waiting</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="text-green-400 text-xl">✅</span>
 <span><strong>Realistic Scenarios</strong> – Train on actual Disney World ride configurations</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="text-green-400 text-xl">✅</span>
 <span><strong>Progressive Difficulty</strong> – Adjustable settings let trainers increase complexity over time</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="text-green-400 text-xl">✅</span>
 <span><strong>Immediate Feedback</strong> – Visual cues help trainees understand mistakes instantly</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="text-green-400 text-xl">✅</span>
 <span><strong>Gamified Experience</strong> – Fun, engaging interface keeps trainees motivated</span>
 </li>
 </ul>
 </div>
 </div>

 {/* How It Works Section */}
 <div className="mb-8">
 <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
 <span className="text-3xl">🎮</span> How It Works
 </h2>

 <div className="grid md:grid-cols-2 gap-6">
 <div className="bg-white/5 rounded-xl p-5 border border-white/10">
 <h3 className="text-lg font-semibold text-amber-300 mb-3">For Trainers</h3>
 <ol className="space-y-2 text-sm text-indigo-100/80 list-decimal list-inside">
 <li><strong>Select a Ride</strong> – Choose from 67+ Disney World attractions</li>
 <li><strong>Configure Settings</strong> – Adjust timer, guest flow, and difficulty</li>
 <li><strong>Start Training</strong> – Hand over to your trainee and observe</li>
 <li><strong>Review Performance</strong> – Use completion stats to guide improvement</li>
 </ol>
 </div>

 <div className="bg-white/5 rounded-xl p-5 border border-white/10">
 <h3 className="text-lg font-semibold text-amber-300 mb-3">For Trainees</h3>
 <ol className="space-y-2 text-sm text-indigo-100/80 list-decimal list-inside">
 <li><strong>Tap Groups</strong> – Reveal how many guests are in each party</li>
 <li><strong>Select Guests</strong> – Choose the right number for each row</li>
 <li><strong>Place in Vehicle</strong> – Tap a row to seat your selected guests</li>
 <li><strong>Dispatch</strong> – Send the vehicle when full or time runs out</li>
 <li><strong>Repeat</strong> – Complete multiple vehicles to finish</li>
 </ol>
 </div>
 </div>
 </div>

 {/* Supported Parks Section */}
 <div className="mb-8">
 <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
 <span className="text-3xl">🏰</span> Supported Parks
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
 <div className="text-3xl mb-2">🏰</div>
 <p className="text-white font-semibold text-sm">Magic Kingdom</p>
 <p className="text-indigo-200/70 text-xs">18 rides</p>
 </div>
 <div className="bg-cyan-500/20 border border-cyan-400/30 rounded-xl p-4 text-center">
 <div className="text-3xl mb-2">🌍</div>
 <p className="text-white font-semibold text-sm">EPCOT</p>
 <p className="text-indigo-200/70 text-xs">11 rides</p>
 </div>
 <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-center">
 <div className="text-3xl mb-2">🎬</div>
 <p className="text-white font-semibold text-sm">Hollywood Studios</p>
 <p className="text-indigo-200/70 text-xs">9 rides</p>
 </div>
 <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 text-center">
 <div className="text-3xl mb-2">🌳</div>
 <p className="text-white font-semibold text-sm">Animal Kingdom</p>
 <p className="text-indigo-200/70 text-xs">6 rides</p>
 </div>
 </div>
 </div>

 {/* Key Features Section */}
 <div className="mb-8">
 <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
 <span className="text-3xl">🎨</span> Key Features
 </h2>
 <div className="grid md:grid-cols-2 gap-4">
 <div className="bg-white/5 rounded-lg p-4 border-l-4 border-amber-500">
 <h3 className="font-semibold text-amber-300 mb-1">Realistic Guest Generation</h3>
 <p className="text-sm text-indigo-100/70">Groups generated using real-world probability distributions matching actual Disney park demographics</p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border-l-4 border-amber-500">
 <h3 className="font-semibold text-amber-300 mb-1">Flexible Training Modes</h3>
 <p className="text-sm text-indigo-100/70">Timed mode with countdown or practice mode without pressure</p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border-l-4 border-amber-500">
 <h3 className="font-semibold text-amber-300 mb-1">"Call for #" Button</h3>
 <p className="text-sm text-indigo-100/70">Request specific group sizes to fill remaining seats</p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border-l-4 border-amber-500">
 <h3 className="font-semibold text-amber-300 mb-1">Single Rider Lines</h3>
 <p className="text-sm text-indigo-100/70">Practice filling empty seats efficiently</p>
 </div>
 </div>
 </div>

 {/* Footer Info */}
 <div className="border-t border-white/20 pt-6 text-center">
 <p className="text-indigo-200/60 text-sm mb-2">
 Built with ❤️ for Disney cast members everywhere
 </p>
 <p className="text-indigo-200/50 text-xs">
 Contact: ace@digitalelegance.com
 </p>
 </div>
 </motion.div>
 </div>
 </div>
 );
}
