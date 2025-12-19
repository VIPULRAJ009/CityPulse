import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

const OrganizerDashboard = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalSales: 0,
        totalAttendees: 0,
        upcomingEvents: 0
    });
    const [loading, setLoading] = useState(true);

    // Dummy data for chart if api empty
    const chartData = [
        { name: 'Jan', sales: 4000 },
        { name: 'Feb', sales: 3000 },
        { name: 'Mar', sales: 2000 },
        { name: 'Apr', sales: 2780 },
        { name: 'May', sales: 1890 },
        { name: 'Jun', sales: 2390 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
                const headers = { Authorization: `Bearer ${token}` };

                const [statsRes, reviewsRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/bookings/stats', { headers }),
                    axios.get('http://localhost:5001/api/reviews/organizer', { headers })
                ]);

                setStats(statsRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    );

    // Calculate Average Rating
    const overallRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalSales.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Attendees"
                    value={stats.totalAttendees}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Events"
                    value={stats.totalEvents}
                    icon={Calendar}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Avg. Rating"
                    value={overallRating}
                    icon={TrendingUp}
                    color="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue Analytics</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Reviews Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex justify-between items-center">
                        Recent Reviews
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{reviews.length} total</span>
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {reviews.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <p>No reviews yet.</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{review.event?.title}</p>
                                            <p className="text-xs text-gray-500">by {review.user?.name || 'Anonymous'}</p>
                                        </div>
                                        <div className="flex bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                            <span className="text-xs font-bold mr-1">{review.rating}</span>
                                            <span className="text-yellow-400 text-xs">★</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 italic line-clamp-2">"{review.comment}"</p>
                                    <p className="text-[10px] text-gray-400 mt-2 text-right">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
