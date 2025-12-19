import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader, Briefcase, ArrowRight, Atom, ArrowLeft } from 'lucide-react';

const OrganizerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { loginOrganizer } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await loginOrganizer(email, password);

        if (result.success) {
            navigate('/organizer/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black">

            {/* Left Side - Image/Branding */}
            <div className="relative hidden lg:flex flex-col justify-center items-center overflow-hidden">
                <Link to="/login" className="absolute top-8 left-8 z-20 flex items-center space-x-2 bg-black/40 backdrop-blur-md border border-[#4ade80]/30 px-4 py-2 rounded-full text-[#4ade80] hover:bg-black/60 transition-all group hover:scale-105">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </Link>
                {/* Background Image - Concert/Party Vibe (Same or similar to User) */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop"
                        alt="Event Organizer Vibe"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 text-center px-12">
                    <div className="mb-6 flex justify-center">
                        <div className="bg-[#4ade80]/20 p-4 rounded-2xl backdrop-blur-md border border-[#4ade80]/30 animate-bounce-slow">
                            <Briefcase className="h-16 w-16 text-[#4ade80]" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
                        Power the <span className="text-[#4ade80]">Pulse</span>
                    </h1>
                    <p className="text-xl text-gray-300 font-light max-w-md mx-auto leading-relaxed">
                        Manage your events, analyze performance, and connect with thousands of attendees.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="relative flex items-center justify-center p-8 bg-black">

                <div className="w-full max-w-md space-y-8">

                    <div className="text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center space-x-2 group mb-8 lg:hidden">
                            <div className="bg-[#4ade80] p-1.5 rounded-lg">
                                <Atom className="h-6 w-6 text-black" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">
                                CityPulse <span className="text-[#4ade80]">Org</span>
                            </span>
                        </Link>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Organizer Portal</h2>
                        <p className="mt-2 text-gray-400">Sign in to your dashboard</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center animate-shake">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Work Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                                    placeholder="organizer@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#4ade80]/20 text-sm font-bold text-black bg-[#4ade80] hover:bg-[#4ade80]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ade80] focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : 'Access Dashboard'}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-black text-gray-500">Interested in hosting?</span>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4 text-center">
                        <Link
                            to="/organizer/signup"
                            className="inline-flex justify-center items-center font-bold text-[#4ade80] hover:text-[#4ade80]/80 transition-colors group"
                        >
                            Become a Partner <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerLogin;
