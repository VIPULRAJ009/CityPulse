import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Building, Loader, ArrowRight, Atom, Check, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user', // Default
    organizationName: '',
    city: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.role === 'organizer' && !formData.organizationName) {
      setError("Organization Name is required for Organizers");
      setLoading(false);
      return;
    }

    const result = await register(formData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black">

      {/* Left Side - Image/Branding (Order Last on Mobile) */}
      <div className="relative hidden lg:flex flex-col justify-center items-center overflow-hidden order-2 lg:order-1">
        {/* Background Image - Different from Login */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2940&auto=format&fit=crop"
            alt="Concert Lights"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center px-12">
          <div className="mb-6 flex justify-center">
            <div className="bg-[#4ade80]/20 p-4 rounded-2xl backdrop-blur-md border border-[#4ade80]/30 animate-bounce-slow">
              <Atom className="h-16 w-16 text-[#4ade80]" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
            Join the <span className="text-[#4ade80]">Vibe</span>
          </h1>
          <p className="text-xl text-gray-300 font-light max-w-md mx-auto leading-relaxed">
            Create an account to track your tickets, follow your favorite organizers, and never miss a beat.
          </p>

          <div className="mt-8 space-y-4">
            {['Exclusive Event Access', 'Seamless Ticket Booking', 'Real-time Notifications'].map((item, i) => (
              <div key={i} className="flex items-center text-gray-200 justify-center">
                <Check className="w-5 h-5 text-[#4ade80] mr-2" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-black order-1 lg:order-2 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">

          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex items-center space-x-2 group mb-8 lg:hidden">
              <div className="bg-[#4ade80] p-1.5 rounded-lg">
                <Atom className="h-6 w-6 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                CityPulse
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="mt-2 text-gray-400">Join thousands of event enthusiasts today</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center animate-shake">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          {/* Organizer Toggle */}
          <div className="bg-white/5 p-1 rounded-xl flex">
            <Link to="/register" className="flex-1 py-2 text-center text-sm font-bold rounded-lg bg-[#4ade80] text-black shadow-lg">
              User
            </Link>
            <Link to="/organizer/signup" className="flex-1 py-2 text-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Organizer
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
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
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                  placeholder="+1 234..."
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
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {formData.role === 'organizer' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium text-gray-300 ml-1">Organization Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-500 group-focus-within:text-[#4ade80] transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="organizationName"
                    required={formData.role === 'organizer'}
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] focus:bg-white/10 transition-all duration-200 sm:text-sm"
                    placeholder="Event Company Ltd."
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#4ade80]/20 text-sm font-bold text-black bg-[#4ade80] hover:bg-[#4ade80]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ade80] focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] mt-4"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : 'Create Account'}
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

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center font-bold text-white hover:text-[#4ade80] transition-colors group"
            >
              Log in to your account <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
