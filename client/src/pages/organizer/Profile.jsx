import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Building, Lock, Check, Globe, Twitter, Linkedin, Instagram, Phone, Camera, Upload } from 'lucide-react';

const OrganizerProfile = () => {
    const { user, login } = useAuth();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        organizationName: user?.organizationName || '',
        contact: user?.contact || '',
        logo: user?.logo || '',
        website: user?.socialLinks?.website || '',
        twitter: user?.socialLinks?.twitter || '',
        linkedin: user?.socialLinks?.linkedin || '',
        instagram: user?.socialLinks?.instagram || '',
        password: '',
        confirmPassword: '',
        profileImage: user?.profileImage || '' // Add profileImage to state
    });

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false); // Uploading state

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const uploadData = new FormData();
            uploadData.append('image', file);
            setUploading(true);

            try {
                const config = {
                    headers: { 'Content-Type': 'multipart/form-data' },
                };
                const { data } = await axios.post('http://localhost:5001/api/upload', uploadData, config);
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
        // Reset form data to original values if needed (omitted for brevity, but ideal for UX)
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            organizationName: user?.organizationName || '',
            contact: user?.contact || '',
            logo: user?.logo || '',
            website: user?.socialLinks?.website || '',
            twitter: user?.socialLinks?.twitter || '',
            linkedin: user?.socialLinks?.linkedin || '',
            instagram: user?.socialLinks?.instagram || '',
            password: '',
            confirmPassword: '',
            profileImage: user?.profileImage || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
            const { data } = await axios.put(
                'http://localhost:5001/api/organizer/profile',
                {
                    name: formData.name,
                    email: formData.email,
                    organizationName: formData.organizationName,
                    contact: formData.contact,
                    logo: formData.logo,
                    socialLinks: {
                        website: formData.website,
                        twitter: formData.twitter,
                        linkedin: formData.linkedin,
                        instagram: formData.instagram
                    },
                    password: formData.password || undefined,
                    profileImage: formData.profileImage
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Update session storage
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const updatedUserInfo = { ...userInfo, ...data };
            sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            setMessage('Profile updated successfully');
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600/10 text-blue-600 rounded-lg hover:bg-blue-600/20 transition font-medium flex items-center gap-2"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Profile Image Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shadow-inner border-2 border-white ring-2 ring-gray-100">
                        {formData.profileImage ? (
                            <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{formData.name?.[0]?.toUpperCase()}</span>
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
                    <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
                    <p className="text-gray-500">{formData.email}</p>
                    <p className="text-sm text-blue-600 font-medium mt-1 uppercase">{formData.organizationName}</p>
                </div>
            </div>

            {message && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-center">
                    <Check size={20} className="mr-2" /> {message}
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
                {/* Basic Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : 'bg-gray-50 text-gray-500'}`} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : 'bg-gray-50 text-gray-500'}`} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} disabled={!isEditing} className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : 'bg-gray-50 text-gray-500'}`} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="contact" value={formData.contact} onChange={handleChange} disabled={!isEditing} className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : 'bg-gray-50 text-gray-500'}`} placeholder="+1 234 567 890" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branding & Socials */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Branding & Socials</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <input type="url" name="logo" value={formData.logo} onChange={handleChange} disabled={!isEditing} className={`w-full px-4 py-2 border rounded-lg outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : 'bg-gray-50 text-gray-500'}`} placeholder="https://example.com/logo.png" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="url" name="website" value={formData.website} onChange={handleChange} disabled={!isEditing} className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : 'bg-gray-50 text-gray-500'}`} placeholder="https://yoursite.com" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
                            <div className="relative">
                                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} disabled={!isEditing} className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : 'bg-gray-50 text-gray-500'}`} placeholder="@username" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} disabled={!isEditing} className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : 'bg-gray-50 text-gray-500'}`} placeholder="Profile URL" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} disabled={!isEditing} className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : 'bg-gray-50 text-gray-500'}`} placeholder="@username" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                {isEditing && (
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Change Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="New password" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Confirm new password" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className="flex justify-end pt-4 space-x-4">
                        <button type="button" onClick={handleCancel} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm">
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
                            Save Changes
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default OrganizerProfile;
