import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Atom, Clock, CalendarDays, PlayCircle, Home, Mail, Info } from 'lucide-react';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Dropdown State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Determine current view from query param
    const searchParams = new URLSearchParams(location.search);
    const view = searchParams.get('time') || 'upcoming';

    // Cycle Logic Requested:
    // "Click on Past Event redirect to Upcoming Event"
    // implies Button Text = "Past Event" (Current View), Action = Go to Upcoming.

    let buttonConfig = {
        text: 'Upcoming Events', // Current View Label
        to: '/?time=current',    // Next View Link
        icon: CalendarDays       // Current View Icon
    };

    if (view === 'current') {
        buttonConfig = {
            text: 'Happening Now',
            to: '/?time=past',
            icon: PlayCircle
        };
    } else if (view === 'past') {
        buttonConfig = {
            text: 'Past Events',
            to: '/?time=upcoming', // or just '/'
            icon: Clock
        };
    }



    // Page Cycle Logic: Home (Contact Us) -> Contact Us (About Us) -> About Us (Home)
    const currentPath = location.pathname;
    // Default: Home Page
    let pageButtonConfig = {
        text: 'Home',           // Current View: Home
        to: '/contact',       // Next View: Contact
        icon: Home
    };

    if (currentPath === '/contact') {
        pageButtonConfig = {
            text: 'Contact Us',   // Current View: Contact
            to: '/about',         // Next View: About
            icon: Mail
        };
    } else if (currentPath === '/about') {
        pageButtonConfig = {
            text: 'About Us',     // Current View: About
            to: '/',              // Next View: Home
            icon: Info
        };
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Navbar */}
            <nav className="bg-black/95 backdrop-blur-sm text-white sticky top-0 z-50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-2 group">
                                <div className="bg-[#4ade80] p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                                    <Atom className="h-6 w-6 text-black" strokeWidth={2.5} />
                                </div>
                                <span className="text-2xl font-bold tracking-tight text-white group-hover:text-[#4ade80] transition-colors">
                                    CityPulse
                                </span>
                            </Link>

                            {/* Rotating Page Button (Left Side - Next to Logo) */}
                            <Link
                                to={pageButtonConfig.to}
                                className="hidden md:inline-flex items-center justify-center px-6 py-2 ml-8 border border-transparent text-sm font-bold rounded-full text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                            >
                                <pageButtonConfig.icon className="mr-2 h-4 w-4" /> {pageButtonConfig.text}
                            </Link>

                        </div>

                        <div className="flex items-center space-x-6">
                            {/* Rotating Page Button (Left Side) */}

                            {/* Rotating View Button (Label = Current View) */}
                            <Link
                                to={buttonConfig.to}
                                className="hidden md:inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-full text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                                title="Click to switch view"
                            >
                                <buttonConfig.icon className="mr-2 h-4 w-4" /> {buttonConfig.text}
                            </Link>

                            <div className="h-6 w-px bg-white/20 hidden md:block"></div>

                            {user ? (
                                <>
                                    <Link
                                        to={user.role === 'organizer' ? "/organizer/dashboard" : "/user/tickets"}
                                        className="font-medium text-gray-300 hover:text-white transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold">{user.name?.[0]?.toUpperCase()}</span>
                                                )}
                                            </div>
                                        </button>

                                        {isMenuOpen && (
                                            <div className="absolute right-0 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl mt-4 py-2 origin-top-right transition-all z-50">
                                                <div className="px-4 py-3 border-b border-zinc-800">
                                                    <p className="text-sm text-white font-medium truncate">{user.name}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                                </div>

                                                <div className="py-1">
                                                    <Link
                                                        to={user.role === 'organizer' ? "/organizer/dashboard" : "/user/tickets"}
                                                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        Dashboard
                                                    </Link>
                                                    <Link
                                                        to="/user/profile"
                                                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        Profile Settings
                                                    </Link>
                                                </div>

                                                <div className="border-t border-zinc-800 py-1">
                                                    <button
                                                        onClick={() => {
                                                            setIsMenuOpen(false);
                                                            logout();
                                                            navigate('/login');
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300"
                                                    >
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Link to="/login" className="font-medium text-white hover:text-[#4ade80] transition-colors border border-white/20 hover:border-[#4ade80] px-6 py-2 rounded-full">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">CityPulse</h3>
                        <p className="text-sm text-slate-400">Discover and book the best local events securely and easily.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Explore</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-blue-400">Concerts</a></li>
                            <li><a href="#" className="hover:text-blue-400">Workshops</a></li>
                            <li><a href="#" className="hover:text-blue-400">Sports</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <p className="text-sm">support@citypulse.com</p>
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500">
                    © 2024 CityPulse. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default UserLayout;
