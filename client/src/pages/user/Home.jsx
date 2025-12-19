import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Tag, Grid, List, ChevronLeft, ChevronRight, History } from 'lucide-react';

const Home = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation(); // Get location for hash
    const timeFilter = searchParams.get('time') || 'upcoming'; // Default to upcoming

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // View Mode
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                // Build query string
                const params = new URLSearchParams();
                if (searchTerm) params.append('keyword', searchTerm);
                if (category) params.append('category', category);
                params.append('page', page);
                params.append('limit', 9);
                params.append('time', timeFilter);

                const { data } = await axios.get(`http://localhost:5001/api/events?${params.toString()}`);

                // Handle response (new structure: { events, page, pages })
                if (data.events) {
                    setEvents(data.events);
                    setTotalPages(data.pages);
                } else {
                    // Fallback if backend not updated immediately
                    setEvents(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, category, page, timeFilter]);

    // Handle Hash Scroll on Mount/Update
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100); // Small delay to ensure render
            }
        }
    }, [location]);

    // Custom Smooth Scroll Function
    const scrollToEvents = () => {
        const target = document.getElementById('event-list');
        if (!target) return;

        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 2000; // 2 seconds slow scroll
        let start = null;

        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = easeInOutCubic(Math.min(timeElapsed / duration, 1));

            window.scrollTo(0, startPosition + distance * run);

            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    };

    return (
        <div>
            {/* Hero Section */}
            {/* Hero Section */}
            <div className="bg-black relative overflow-hidden h-screen flex items-center justify-center">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></div>
                            <span className="text-xs font-bold text-[#4ade80] tracking-wider uppercase">Live in 12 Cities</span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight">
                        Don't Just <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Live</span> <span className="text-[#4ade80]">Here.</span><br />
                        Experience It.
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        CityPulse is the definitive calendar for underground gigs, block parties, and major festivals. Connect with your local culture and never miss a beat.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <button className="px-8 py-4 bg-[#4ade80] text-black font-bold rounded-full hover:bg-[#22c55e] transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(74,222,128,0.4)] flex items-center">
                            Find Your Vibe <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                        <button
                            onClick={scrollToEvents}
                            className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center backdrop-blur-sm"
                        >
                            Amplify Your Reach <Grid className="ml-2 w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar Floating */}
                    <div className="mt-16 max-w-4xl mx-auto bg-white/10 backdrop-blur-md border border-white/10 p-2 rounded-full flex flex-col md:flex-row items-center shadow-2xl">
                        <div className="flex-1 flex items-center px-6 w-full mb-2 md:mb-0 border-r border-white/10">
                            <Search className="text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by event name..."
                                className="w-full px-4 py-3 outline-none text-white bg-transparent placeholder-gray-400"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="flex-1 flex items-center px-6 w-full mb-2 md:mb-0">
                            <Tag className="text-gray-400" size={20} />
                            <select
                                className="w-full px-4 py-3 outline-none text-white bg-transparent appearance-none cursor-pointer"
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="" className="text-black">All Categories</option>
                                <option value="Music" className="text-black">Music</option>
                                <option value="Tech" className="text-black">Tech</option>
                                <option value="Sports" className="text-black">Sports</option>
                                <option value="Cultural" className="text-black">Cultural</option>
                                <option value="Workshop" className="text-black">Workshop</option>
                                <option value="Seminar" className="text-black">Seminar</option>
                                <option value="Other" className="text-black">Other</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event List */}
            <div id="event-list" className="max-w-7xl mx-auto px-4 py-20 min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {timeFilter === 'past' ? 'Past Events' : (timeFilter === 'current' ? 'Happening Now' : 'Upcoming Events')}
                        </h2>
                        <span className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">{events.length} shown</span>
                    </div>

                    {/* View Toggles */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`bg-gray-200 rounded-xl animate-pulse ${viewMode === 'grid' ? 'h-80' : 'h-48'}`}></div>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Search size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-xl font-medium text-gray-600">No events found matching your criteria.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setCategory(''); }}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {events.map(event => (
                            <Link
                                to={`/events/${event._id}`}
                                key={event._id}
                                className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex ${viewMode === 'list' ? 'flex-col md:flex-row' : 'flex-col'}`}
                            >
                                {/* Image Section */}
                                <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-full md:w-72 h-48 md:h-auto shrink-0' : 'h-56 w-full'}`}>
                                    <img src={event.banner || '/placeholder.jpg'} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />

                                    {/* Date Badge (Grid Only or Overlay) */}
                                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur shadow-sm px-3 py-1.5 rounded-lg text-center min-w-[60px]">
                                        <div className="text-xs font-bold text-red-500 uppercase tracking-wide">
                                            {event.startDate ? new Date(event.startDate).toLocaleString('default', { month: 'short' }) : 'TBD'}
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 leading-none">
                                            {event.startDate ? new Date(event.startDate).getDate() : '--'}
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium">
                                        {event.category}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">{event.title}</h3>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-start space-x-2 text-sm text-gray-600">
                                                <MapPin size={16} className="mt-0.5 text-gray-400 shrink-0" />
                                                <span className="line-clamp-1">{event.venue?.address}, {event.venue?.city}</span>
                                            </div>
                                            <div className="flex items-start space-x-2 text-sm text-gray-600">
                                                <Calendar size={16} className="mt-0.5 text-gray-400 shrink-0" />
                                                <span>
                                                    {event.startDate
                                                        ? new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : 'Time TBD'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                        <div className="flex items-center space-x-2">
                                            {/* Organizer Logo/Avatar */}
                                            {event.organizer?.logo ? (
                                                <img
                                                    src={event.organizer.logo}
                                                    alt="Org"
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                                    {(event.organizer?.organizationName?.[0] || event.organizer?.name?.[0] || 'O').toUpperCase()}
                                                </div>
                                            )}

                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400">Organized by</span>
                                                <span className="text-xs font-semibold text-gray-700 line-clamp-1 max-w-[100px]">
                                                    {event.organizer?.organizationName || event.organizer?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-bold text-blue-600">
                                                {event.ticketType === 'Free' ? 'Free' : `$${event.price}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 space-x-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center space-x-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-10 h-10 rounded-full font-medium transition ${page === pageNum
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 border rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
