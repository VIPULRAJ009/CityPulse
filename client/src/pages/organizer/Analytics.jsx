import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const OrganizerAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
                const { data } = await axios.get('http://localhost:5001/api/bookings/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading Analytics...</div>;

    const data = [
        { name: 'Events', value: stats.totalEvents },
        { name: 'Upcoming', value: stats.upcomingEvents },
    ];
    
    // Mock monthly data for chart (since backend only gives totals for now)
    const monthlyData = [
        { name: 'Jan', sales: 4000 },
        { name: 'Feb', sales: 3000 },
        { name: 'Mar', sales: 2000 },
        { name: 'Apr', sales: 2780 },
        { name: 'May', sales: 1890 },
        { name: 'Jun', sales: stats.totalSales || 2390 }, // Use real sales for current Month roughly
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Event Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center mt-[-30px] space-x-6 text-sm text-gray-500">
                        <span>Total Events: {stats.totalEvents}</span>
                        <span>Upcoming: {stats.upcomingEvents}</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-2">Performance Summary</h3>
                <p className="text-blue-600">
                    You have generated a total revenue of <span className="font-bold">${stats.totalSales}</span> from {stats.totalAttendees} attendees across {stats.totalEvents} events.
                </p>
            </div>
        </div>
    );
};

export default OrganizerAnalytics;
