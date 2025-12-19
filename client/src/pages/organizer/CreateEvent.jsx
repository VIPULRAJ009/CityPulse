import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Calendar, Image as ImageIcon, CheckCircle, Loader } from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
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
        bannerUrl: '', googleMapEmbed: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            // In a real app, you might want to configure axios base URL globally
            const { data } = await axios.post('http://localhost:5001/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // data should be the path e.g. /uploads/image-123.jpg
            // We need full URL for frontend to display it easily if on different port, 
            // but for now storing relative path is fine if we prepend server URL when displaying,
            // OR we store full URL. Let's store full URL to be safe for now, or just relative.
            // Server returns relative path "/uploads/...". 
            // Let's prepend http://localhost:5001 for consistency in DB if we want absolute URLs.
            const fullUrl = `http://localhost:5001${data}`;
            setFormData(prev => ({ ...prev, bannerUrl: fullUrl }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
            if (!token) {
                alert("You are not logged in");
                return;
            }

            if (!formData.bannerUrl) {
                alert("Please provide a banner image");
                setLoading(false);
                return;
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                eventType: formData.eventType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                venue: {
                    address: formData.address,
                    city: formData.city
                },
                banner: formData.bannerUrl,
                ticketType: formData.ticketType,
                price: Number(formData.price), // Ensure number
                maxAttendees: Number(formData.maxAttendees), // Ensure number
                status: 'Published',
                googleMapEmbed: formData.googleMapEmbed // Add Google Map
            };

            await axios.post('http://localhost:5001/api/events', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/organizer/events');
        } catch (error) {
            console.error("Failed to create event", error);
            alert(error.response?.data?.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create New Event</h2>
                <p className="text-gray-500">Fill in the details to publish your event.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Event Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Summer Music Festival" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe your event..." />
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
                                <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none" placeholder="123 Main St, Venue Name" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="New York" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed Code</label>
                            <textarea
                                name="googleMapEmbed"
                                value={formData.googleMapEmbed}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                                placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>'
                                rows={3}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Go to Google Maps {'>'} Share {'>'} Embed a map {'>'} Copy HTML. Paste it here.
                            </p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex flex-col space-y-6">
                                {/* Option 1: Image URL */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Option 1: Paste Image Link</label>
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                                            <ImageIcon size={20} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="url"
                                            name="bannerUrl"
                                            value={formData.bannerUrl}
                                            onChange={handleChange}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center space-x-2">
                                    <div className="h-px bg-gray-300 flex-1"></div>
                                    <span className="text-xs text-gray-500 font-bold bg-gray-50 px-2">OR</span>
                                    <div className="h-px bg-gray-300 flex-1"></div>
                                </div>

                                {/* Option 2: File Upload */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Option 2: Upload File</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                // Validation
                                                const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                                                if (!validTypes.includes(file.type)) {
                                                    alert("Please upload a valid image (JPG, PNG)");
                                                    return;
                                                }
                                                if (file.size > 10 * 1024 * 1024) { // 10MB
                                                    alert("File size must be less than 10MB");
                                                    return;
                                                }

                                                const formData = new FormData();
                                                formData.append('image', file);
                                                setUploading(true);

                                                try {
                                                    const { data } = await axios.post('http://localhost:5001/api/upload', formData, {
                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                    });
                                                    // Assuming server returns relative path, prepend server URL
                                                    const fullUrl = `http://localhost:5001${data}`;
                                                    setFormData(prev => ({ ...prev, bannerUrl: fullUrl }));
                                                } catch (error) {
                                                    console.error("Upload failed", error);
                                                    alert("Image upload failed. Please try again.");
                                                } finally {
                                                    setUploading(false);
                                                }
                                            }}
                                            accept="image/png, image/jpeg, image/jpg"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />

                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition group-hover:border-blue-500 group-hover:bg-blue-50 bg-white">
                                            {uploading ? (
                                                <div className="flex flex-col items-center justify-center text-blue-600">
                                                    <Loader className="animate-spin mb-2" size={24} />
                                                    <span className="font-medium">Uploading image...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition">
                                                        <Upload size={24} className="text-blue-600" />
                                                    </div>
                                                    <span className="text-gray-700 font-medium mb-1">Click to upload or drag and drop</span>
                                                    <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                {formData.bannerUrl && (
                                    <div className="mt-4">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Image Preview</label>
                                        <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                                            <img
                                                src={formData.bannerUrl}
                                                alt="Banner Preview"
                                                className="h-64 w-full object-cover bg-gray-100"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL'; }}
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                                                <p className="text-white font-medium flex items-center">
                                                    <CheckCircle size={16} className="mr-2" /> Ready to publish
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, bannerUrl: '', googleMapEmbed: '' }))}
                                                className="absolute top-2 right-2 bg-white/90 text-red-600 p-1.5 rounded-full hover:bg-white shadow-sm transition z-20"
                                                title="Remove Image"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button type="button" onClick={() => navigate('/organizer/events')} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-4 font-medium transition">Cancel</button>
                    <button type="submit" disabled={loading || uploading} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg flex items-center">
                        {loading ? 'Publishing...' : <> <CheckCircle size={18} className="mr-2" /> Publish Event </>}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CreateEvent;
