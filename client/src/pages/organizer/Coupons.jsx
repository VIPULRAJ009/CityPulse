import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tag, Trash2, Plus, Calendar, AlertCircle } from 'lucide-react';

const OrganizerCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createMode, setCreateMode] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: 10,
        expiryDate: '',
        usageLimit: 100
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
            const { data } = await axios.get('http://localhost:5001/api/coupons', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
            await axios.delete(`http://localhost:5001/api/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(coupons.filter(c => c._id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete coupon');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
            const { data } = await axios.post('http://localhost:5001/api/coupons', 
                { ...formData }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCoupons([data, ...coupons]);
            setCreateMode(false);
            setFormData({ code: '', discountPercentage: 10, expiryDate: '', usageLimit: 100 });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create coupon');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
                    <p className="text-gray-500">Create discount codes for your events</p>
                </div>
                <button 
                    onClick={() => setCreateMode(!createMode)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    {createMode ? 'Cancel' : <><Plus size={18} className="mr-2" /> Create Coupon</>}
                </button>
            </div>

            {createMode && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 animate-fade-in-down">
                    <h3 className="font-bold text-lg mb-4">New Coupon</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                            <input 
                                type="text" 
                                required
                                placeholder="SUMMER25"
                                className="w-full px-3 py-2 border rounded-lg uppercase"
                                value={formData.code}
                                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                            <input 
                                type="number" 
                                required
                                min="1" max="100"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.discountPercentage}
                                onChange={e => setFormData({...formData, discountPercentage: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input 
                                type="date" 
                                required
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.expiryDate}
                                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                            <input 
                                type="number" 
                                required
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.usageLimit}
                                onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})}
                            />
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium">
                            Save Coupon
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div>Loading...</div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl dashed-border">
                    <Tag size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No active coupons found. Create one above!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map(coupon => (
                        <div key={coupon._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 text-blue-700 font-mono font-bold text-xl px-3 py-1 rounded border border-blue-100">
                                    {coupon.code}
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-green-600">{coupon.discountPercentage}%</span>
                                    <span className="text-xs text-gray-500 block">OFF</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Calendar size={14} className="mr-2 text-gray-400" />
                                    Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                    <AlertCircle size={14} className="mr-2 text-gray-400" />
                                    Used: <span className="font-semibold ml-1">{coupon.usedCount}</span> / {coupon.usageLimit}
                                </div>
                            </div>

                            <button 
                                onClick={() => handleDelete(coupon._id)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrganizerCoupons;
