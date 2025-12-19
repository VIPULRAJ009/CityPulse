import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Building, Loader, Briefcase, MapPin, Phone, ArrowRight, Atom, TrendingUp, ArrowLeft } from 'lucide-react';

const OrganizerSignup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        organizationName: '',
        city: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { registerOrganizer } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.organizationName) {
            setError("Organization Name is required");
            setLoading(false);
            return;
        }

        const result = await registerOrganizer(formData);

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
            <div className="relative hidden lg:flex flex-col justify-center items-center overflow-hidden order-2 lg:order-1">
                <Link to="/register" className="absolute top-8 left-8 z-20 flex items-center space-x-2 bg-black/40 backdrop-blur-md border border-[#4ade80]/30 px-4 py-2 rounded-full text-[#4ade80] hover:bg-black/60 transition-all group hover:scale-105">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </Link>
                {/* Background Image - High Energy */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop"
                        alt="Event Planning"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 text-center px-12">
                    <div className="mb-6 flex justify-center">
                        <div className="bg-[#4ade80]/20 p-4 rounded-2xl backdrop-blur-md border border-[#4ade80]/30 animate-pulse">
                            <TrendingUp className="h-16 w-16 text-[#4ade80]" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
                        Elevate Your <span className="text-[#4ade80]">Events</span>
                    </h1>
                    <p className="text-xl text-gray-300 font-light max-w-md mx-auto leading-relaxed">
                        Join the platform that processes thousands of tickets daily. Your stage is waiting.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="relative flex items-center justify-center p-8 bg-black order-1 lg:order-2 overflow-y-auto">

                <div className="w-full max-w-md space-y-8 py-8">

                    <div className="text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center space-x-2 group mb-8 lg:hidden">
                            <div className="bg-[#4ade80] p-1.5 rounded-lg">
                                <Atom className="h-6 w-6 text-black" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">
                                CityPulse <span className="text-[#4ade80]">Org</span>
                            </span>
                        </Link>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Partner Application</h2>
                        <p className="mt-2 text-gray-400">Create your professional organizer account</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center animate-shake">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-300 ml-1">Organization Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building className="h-5 w-5 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="organizationName"
                                    required
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                                    placeholder="Event Company Ltd."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-300 ml-1">Work Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                                    placeholder="organizer@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 ml-1">City</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                                        placeholder="New York"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 ml-1">Phone</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                                        placeholder="+1 234..."
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#4ade80]/20 text-sm font-bold text-black bg-[#4ade80] hover:bg-[#4ade80]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ade80] focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] mt-4"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : 'Create Organizer Account'}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-black text-gray-500">Already have an account?</span>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4 text-center">
                        <Link
                            to="/organizer/login"
                            className="inline-flex justify-center items-center font-bold text-[#4ade80] hover:text-[#4ade80]/80 transition-colors group"
                        >
                            Sign in to Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerSignup;
