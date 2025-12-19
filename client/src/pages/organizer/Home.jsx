import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Tag } from 'lucide-react';

const OrganizerHome = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
                
                // Fetch public events (All events listed)
                const publicRes = await axios.get('http://localhost:5001/api/events');
                setAllEvents(publicRes.data);

                // Fetch my events
                const myRes = await axios.get('http://localhost:5001/api/events/myevents', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMyEvents(myRes.data);
                
                // Filter upcoming from my events
                const upcoming = myRes.data.filter(e => new Date(e.startDate) > new Date());
                setUpcomingEvents(upcoming);

            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const EventCard = ({ event }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="h-40 overflow-hidden">
                <img src={event.banner || '/placeholder.jpg'} alt={event.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex-1">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1 block">{event.category}</span>
                <h4 className="font-bold text-gray-900 mb-2 trunkate">{event.title}</h4>
                <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <MapPin size={12} />
                        <span className="truncate">{event.venue?.city}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Organizer Hub</h1>
                <p className="text-gray-500">Welcome back! Here is what's happening.</p>
            </div>

            {/* My Hosted Events */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">My Hosted Events</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{myEvents.length}</span>
                </div>
                {myEvents.length === 0 ? (
                    <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500">You haven't created any events yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {myEvents.slice(0, 4).map(e => <EventCard key={e._id} event={e} />)}
                    </div>
                )}
            </section>

             {/* Upcoming Events (Subset of Hosted) */}
             <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
                </div>
                 {upcomingEvents.length === 0 ? (
                    <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500">No upcoming events scheduled.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {upcomingEvents.slice(0, 4).map(e => <EventCard key={e._id} event={e} />)}
                    </div>
                )}
            </section>

            {/* All Events on Platform */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">All Events on CityPulse</h2>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {allEvents.slice(0, 8).map(e => <EventCard key={e._id} event={e} />)}
                </div>
            </section>
        </div>
    );
};

export default OrganizerHome;
