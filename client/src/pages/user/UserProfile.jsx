import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, MapPin, Phone, Lock, Check, Edit2, Settings, Camera, Upload } from 'lucide-react';

const UserProfile = () => {
    const { user } = useAuth();

    // Profile Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        city: '',
        phone: '',
        password: '',
        confirmPassword: '',
        profileImage: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                city: user.city || '',
                phone: user.phone || '',
                profileImage: user.profileImage || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Upload immediately or wait for save? 
            // Better UX: Upload immediately to preview, but only save URL to DB on submit?
            // Or simpler: Upload immediately and set URL in formData state.

            const formData = new FormData();
            formData.append('image', file);
            setUploading(true);

            try {
                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                };

                const { data } = await axios.post('http://localhost:5001/api/upload', formData, config);
                // data is like /uploads/image-123.jpg
                const imageUrl = `http://localhost:5001${data}`;
                setFormData(prev => ({ ...prev, profileImage: imageUrl }));
                setUploading(false);
            } catch (error) {
                console.error(error);
                setUploading(false);
                setError('Image upload failed');
            }
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setMessage('');
        setError('');
        setImageFile(null);
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                city: user.city || '',
                phone: user.phone || '',
                password: '',
                confirmPassword: '',
                profileImage: user.profileImage || ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const token = userInfo?.token;

            if (!token) {
                setError('Not authorized, no token found');
                setLoading(false);
                return;
            }

            const { data } = await axios.put(
                'http://localhost:5001/api/auth/profile',
                {
                    name: formData.name,
                    email: formData.email,
                    city: formData.city,
                    phone: formData.phone,
                    password: formData.password || undefined,
                    profileImage: formData.profileImage
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Update session storage which is the source of truth
            const updatedUserInfo = { ...userInfo, ...data };
            sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

            setMessage('Profile updated successfully');
            setIsEditing(false);
            // Optional: reload to refresh context if context doesn't auto-update
            window.location.reload();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Settings className="text-gray-700" size={32} />
                Settings
            </h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                {/* Header: Avatar & Info & Edit Button */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-8">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shadow-inner border-2 border-white ring-2 ring-gray-100">
                                {formData.profileImage || user?.profileImage ? (
                                    <img
                                        src={formData.profileImage || user?.profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{user?.name?.[0]?.toUpperCase()}</span>
                                )}
                            </div>

                            {isEditing && (
                                <>
                                    <label htmlFor="profile-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </label>
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </>
                            )}

                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                            <p className="text-gray-500 font-medium">{user?.email}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-400">
                                <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide">User Account</span>
                            </div>
                        </div>
                    </div>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition font-semibold"
                        >
                            <Edit2 size={18} /> Edit Profile
                        </button>
                    )}
                </div>

                {message && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center border border-green-100">
                        <Check size={20} className="mr-3" /> {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center">
                        <Lock size={20} className="mr-3" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User size={20} className="text-gray-400" /> Personal Details
                        </h3>
                        {/* INPUT FIELDS (Grid) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white' : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'}`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white' : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'}`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white' : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        placeholder="e.g. New York"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white' : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Lock size={20} className="text-gray-400" /> Security
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Leave blank to keep current" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Confirm new password" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isEditing && (
                        <div className="flex justify-end pt-4 gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="px-10 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center"
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>}
                                {loading ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
