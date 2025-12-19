import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Music',
        eventType: 'Offline',
        startDate: '',
        endDate: '',
        address: '',
        city: '',
        price: 0,
        maxAttendees: 100,
        ticketType: 'Paid',
        bannerUrl: '',
        status: 'Published'
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5001/api/events/${id}`);
                // Format dates for input[type="datetime-local"]
                const formatDateTime = (dateStr) => {
                    if(!dateStr) return '';
                    return new Date(dateStr).toISOString().slice(0, 16);
                };

                setFormData({
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    eventType: data.eventType,
                    startDate: formatDateTime(data.startDate),
                    endDate: formatDateTime(data.endDate),
                    address: data.venue?.address || '',
                    city: data.venue?.city || '',
                    price: data.price,
                    maxAttendees: data.maxAttendees,
                    ticketType: data.ticketType,
                    bannerUrl: data.banner || '',
                    status: data.status
                });
            } catch (error) {
                console.error("Failed to fetch event", error);
                alert("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
            
            const payload = {
                ...formData,
                venue: {
                    address: formData.address,
                    city: formData.city
                },
                banner: formData.bannerUrl
            };

            await axios.put(`http://localhost:5001/api/events/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/organizer/events');
        } catch (error) {
            console.error("Failed to update event", error);
            alert("Failed to update event");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center">
                <button onClick={() => navigate('/organizer/events')} className="mr-4 text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Edit Event</h2>
                    <p className="text-gray-500">Update the details of your event.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
                
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Event Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                             <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                             <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none">
                                {['Music', 'Tech', 'Sports', 'Cultural', 'Workshop', 'Seminar', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                            <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none">
                                <option value="Offline">Offline</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>
                        
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                             <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none font-medium">
                                 <option value="Draft">Draft</option>
                                 <option value="Published">Published</option>
                                 <option value="Cancelled">Cancelled</option>
                                 <option value="Completed">Completed</option>
                             </select>
                        </div>
                    </div>
                </div>

                {/* Date & Location */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Date & Location</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                             <input required type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                             <input required type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                         </div>
                         
                         <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                             <div className="relative">
                                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                 <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none" />
                             </div>
                         </div>
                         
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                         </div>
                     </div>
                </div>

                 {/* Ticket & Media */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Tickets & Media</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
                            <select name="ticketType" value={formData.ticketType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none">
                                <option value="Paid">Paid</option>
                                <option value="Free">Free</option>
                            </select>
                        </div>

                         {formData.ticketType === 'Paid' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" min="0" />
                            </div>
                         )}
                         
                          <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                                <input required type="number" name="maxAttendees" value={formData.maxAttendees} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" min="1" />
                            </div>
                     </div>

                     <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                           <input type="url" name="bannerUrl" value={formData.bannerUrl} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
                           {formData.bannerUrl && (
                               <img src={formData.bannerUrl} alt="Preview" className="mt-4 h-48 w-full object-cover rounded-lg bg-gray-100" />
                           )}
                     </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button type="button" onClick={() => navigate('/organizer/events')} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-4 font-medium transition">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg flex items-center">
                        {submitting ? 'Updating...' : <> <CheckCircle size={18} className="mr-2" /> Update Event </>}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditEvent;
