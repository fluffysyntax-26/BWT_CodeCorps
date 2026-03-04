import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import Landing from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Decisions from './pages/Decisions';
import Chat from './pages/Chat';
import UserProfile from './pages/UserProfile';
import ExpenseTracker from './pages/ExpenseTracker';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import CameraRig from './components/canvas/CameraRig';

// A subtle 3D background that stays behind all pages
const SceneBg = () => {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <CameraRig />
                <Sparkles 
                    count={500}
                    scale={[20, 20, 20]}
                    size={2}
                    speed={0.4}
                    opacity={0.5}
                    color="#ffffff" 
                />
            </Canvas>
        </div>
    );
};

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="flex justify-between items-center px-8 py-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link to="/" className="text-xl font-extrabold text-blue-500 tracking-tighter">FIN-GUARD</Link>
                <SignedIn>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
                        <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>
                        <Link to="/profile" className="hover:text-white transition">Profile</Link>
                        <Link to="/expenses" className="hover:text-white transition">Expenses</Link>
                        <Link to="/decisions" className="hover:text-white transition">Risk Engine</Link>
                        <Link to="/chat" className="hover:text-white transition">AI Assistant</Link>
                    </div>
                </SignedIn>
            </div>
            <div className="flex items-center gap-4">
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                    <button 
                        className="md:hidden text-slate-400"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </SignedIn>
                <SignedOut>
                    <Link to="/" className="text-sm font-semibold hover:text-blue-400 text-slate-400">Log In</Link>
                </SignedOut>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 p-4 md:hidden flex flex-col gap-4 shadow-lg"
                >
                    <SignedIn>
                        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">Dashboard</Link>
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">Profile</Link>
                        <Link to="/expenses" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">Expenses</Link>
                        <Link to="/decisions" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">Risk Engine</Link>
                        <Link to="/chat" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">AI Assistant</Link>
                    </SignedIn>
                </motion.div>
            )}
        </nav>
    );
};

const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full"
    >
        {children}
    </motion.div>
);

function App() {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    return (
        <div className="min-h-screen text-slate-200 bg-slate-950 transition-colors duration-300">
            {!isLandingPage && <SceneBg />}
            {!isLandingPage && <Navbar />}

            <main className="relative z-10">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        {/* Public Route */}
                        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <SignedIn>
                                    <PageWrapper><Dashboard /></PageWrapper>
                                </SignedIn>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <SignedIn>
                                    <PageWrapper><UserProfile /></PageWrapper>
                                </SignedIn>
                            }
                        />
                        <Route
                            path="/expenses"
                            element={
                                <SignedIn>
                                    <PageWrapper><ExpenseTracker /></PageWrapper>
                                </SignedIn>
                            }
                        />
                        <Route
                            path="/decisions"
                            element={
                                <SignedIn>
                                    <PageWrapper><Decisions /></PageWrapper>
                                </SignedIn>
                            }
                        />
                        <Route
                            path="/chat"
                            element={
                                <SignedIn>
                                    <PageWrapper><Chat /></PageWrapper>
                                </SignedIn>
                            }
                        />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AnimatePresence>
            </main>

            {!isLandingPage && (
                <footer className="py-10 text-center text-slate-600 text-xs">
                    © 2026 FinGuard AI. Designed for Financial Stability.
                </footer>
            )}
        </div>
    );
}

export default App;
