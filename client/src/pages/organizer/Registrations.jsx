import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Calendar, Mail, Download } from 'lucide-react';

const OrganizerRegistrations = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
                const { data } = await axios.get('http://localhost:5001/api/bookings/organizer', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const downloadCSV = () => {
        if (bookings.length === 0) return;

        const headers = ["Attendee Name", "Attendee Email", "Event Title", "Event Date", "Tickets", "Total Paid", "Coupon Code", "Discount", "Booking Date"];
        const rows = bookings.map(b => [
            b.user.name,
            b.user.email,
            b.event.title,
            new Date(b.event.startDate).toLocaleDateString(),
            b.numberOfTickets,
            b.numberOfTickets,
            b.totalAmount,
            b.coupon ? b.coupon.code : '-',
            b.coupon ? `${b.coupon.discountPercentage}%` : '-',
            new Date(b.createdAt).toLocaleDateString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "registrations.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">All Registrations</h2>
                <button
                    onClick={downloadCSV}
                    disabled={bookings.length === 0}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={18} />
                    <span>Download CSV</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <tr key={booking._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {booking.user.name[0]}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                                            <div className="text-sm text-gray-500">{booking.user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{booking.event.title}</div>
                                    <div className="text-xs text-gray-500">{new Date(booking.event.startDate).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {booking.numberOfTickets} Tickets
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${booking.totalAmount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {booking.coupon ? (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-green-600">{booking.coupon.code}</span>
                                            <span className="text-xs">-{booking.coupon.discountPercentage}%</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(booking.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No registrations found yet.</div>
                )}
            </div>
        </div>
    );
};

export default OrganizerRegistrations;
