import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Edit2, Trash2, Layers, XCircle } from 'lucide-react';

const MyEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming'); // upcoming, ongoing, past
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
            const { data } = await axios.get('http://localhost:5001/api/events/myevents', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id, status) => {
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
            await axios.delete(`http://localhost:5001/api/events/${id}`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(events.filter(e => e._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete");
        }
    };

    const handleCancelEvent = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this event? Registered users should be notified.")) return;
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
            await axios.put(`http://localhost:5001/api/events/${id}`, { status: 'Cancelled' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setEvents(events.map(e => e._id === id ? { ...e, status: 'Cancelled' } : e));
        } catch (error) {
            console.error("Cancel failed", error);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading events...</div>;

    const getFilteredEvents = () => {
        const now = new Date();
        return events.filter(event => {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            
            if (filter === 'upcoming') {
                return start > now;
            } else if (filter === 'ongoing') {
                return start <= now && end >= now;
            } else if (filter === 'past') {
                return end < now;
            }
            return true;
        });
    };

    const filteredEvents = getFilteredEvents();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                     <h2 className="text-2xl font-bold text-gray-800">My Events</h2>
                     <p className="text-gray-500">Manage your published and draft events.</p>
                </div>
                <Link to="/organizer/create-event" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
                    Create New Event
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                {['upcoming', 'ongoing', 'past'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`pb-2 px-1 text-sm font-medium capitalize transition-colors relative ${
                            filter === tab 
                                ? 'text-blue-600 border-b-2 border-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab} Events
                    </button>
                ))}
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <Layers size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800">No {filter} events found</h3>
                    <p className="text-gray-500 mt-2">
                        {filter === 'upcoming' ? "Get started by creating your first event." : "Check other categories."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                            <div className="h-48 overflow-hidden relative">
                                <img src={event.banner || 'public/placeholder.jpg'} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                    ${event.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-white/90 backdrop-blur-sm'}
                                `}>
                                    {event.status}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{event.title}</h3>
                                <div className="space-y-2 text-sm text-gray-600 mb-5">
                                    <div className="flex items-center space-x-2">
                                        <Calendar size={16} className="text-blue-500" />
                                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin size={16} className="text-blue-500" />
                                        <span className="truncate">{event.venue?.city}, {event.venue?.address}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className="font-semibold text-gray-900">
                                        {event.ticketType === 'Free' ? 'Free' : `$${event.price}`}
                                    </span>
                                    <div className="flex space-x-2">
                                        {/* Edit Button */}
                                        <button onClick={() => navigate(`/organizer/edit-event/${event._id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Event">
                                            <Edit2 size={18} />
                                        </button>
                                        
                                        {/* Cancel / Delete Logic */}
                                        {event.status === 'Published' ? (
                                             <button onClick={() => handleCancelEvent(event._id)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Cancel Event">
                                                <XCircle size={18} />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleDelete(event._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Forever">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyEvents;
