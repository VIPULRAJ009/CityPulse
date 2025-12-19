import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Download, Clock, Ticket as TicketIcon, AlertCircle, CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../context/AuthContext';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [cancelling, setCancelling] = useState(null);

    // Cancel Modal State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [cancelSuccess, setCancelSuccess] = useState(false);

    // Review State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', eventId: null });
    const [submittingReview, setSubmittingReview] = useState(false);
    const ticketRefs = useRef({});

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
            if (!token) return;
            const { data } = await axios.get('http://localhost:5001/api/bookings/mybookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const initiateCancel = (bookingId) => {
        setBookingToCancel(bookingId);
        setCancelSuccess(false);
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        if (!bookingToCancel) return;

        setCancelling(bookingToCancel);
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
            await axios.put(`http://localhost:5001/api/bookings/${bookingToCancel}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Show success state in modal instead of closing immediately
            setCancelSuccess(true);
            setCancelling(null);
            // Refresh bookings in background so when they close modal it's updated
            fetchBookings();
        } catch (error) {
            console.error("Cancel failed", error);
            alert("Failed to cancel booking. " + (error.response?.data?.message || ""));
            setCancelling(null);
            setShowCancelModal(false);
        }
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setBookingToCancel(null);
        setCancelSuccess(false);
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm("Delete this booking record?")) return;

        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
            await axios.delete(`http://localhost:5001/api/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from list
            setBookings(bookings.filter(b => b._id !== bookingId));
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete booking.");
        }
    };

    const downloadTicket = async (uniqueId, eventTitle) => {
        // Target the specific detailed ticket element
        const element = document.getElementById(`ticket-download-${uniqueId}`);
        if (!element) {
            console.error("Ticket element not found");
            return;
        }

        try {
            // High quality capture
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');

            // A4 size PDF or custom ticket size? Let's do a nice portrait ticket size
            // approx 3.5 inch x 8 inch usually, or we can just fit the image.
            // Let's make it standard A4 print or just matching the image dimensions for digital keeping.
            // Matching image dimensions is safest for "photo-like" PDF.

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`CityPulse-Ticket-${eventTitle}-${uniqueId}.pdf`);
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    const handleOpenReview = (eventId) => {
        setReviewData({ rating: 5, comment: '', eventId });
        setShowReviewModal(true);
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
            await axios.post('http://localhost:5001/api/reviews', {
                eventId: reviewData.eventId,
                rating: reviewData.rating,
                comment: reviewData.comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowReviewModal(false);
            alert("Review submitted successfully!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Filter and Process Bookings
    const today = new Date();

    // Flatten bookings into individual tickets
    const allTickets = bookings.flatMap(booking =>
        Array.from({ length: booking.numberOfTickets }).map((_, index) => ({
            booking,
            event: booking.event,
            ticketIndex: index,
            uniqueId: `${booking._id}-${index}`
        }))
    );

    const filteredTickets = allTickets.filter(({ event }) => {
        const eventDate = new Date(event?.startDate);
        return activeTab === 'upcoming' ? eventDate >= today : eventDate < today;
    }).sort((a, b) => new Date(a.event.startDate) - new Date(b.event.startDate));

    if (loading) return <div className="text-center py-20">Loading tickets...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
                    <p className="text-gray-500">Manage your bookings and tickets.</p>
                </div>

                {/* Tabs */}
                <div className="mt-4 md:mt-0 bg-gray-100 p-1 rounded-lg inline-flex">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'upcoming'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Upcoming Events
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'past'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Past Events
                    </button>
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className="text-center py-20 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <TicketIcon size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} events found</h2>
                    <p className="text-gray-500">You don't have any {activeTab} bookings.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTickets.map(({ booking, event, ticketIndex, uniqueId }) => {
                        const qrData = JSON.stringify({
                            bid: booking._id,
                            uid: booking.user,
                            idx: ticketIndex + 1,
                            valid: booking.status === 'confirmed'
                        });

                        const isCancelled = booking.status === 'cancelled';
                        const isUpcoming = new Date(event?.startDate) > new Date();

                        return (
                            <div key={uniqueId} className={`relative group perspective-1000 ${isCancelled ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                {/* Ticket Card */}
                                <div
                                    ref={el => ticketRefs.current[uniqueId] = el}
                                    className="bg-white rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full"
                                >
                                    {/* Top: Event Info */}
                                    <div className={`p-5 flex-1 relative overflow-hidden ${isCancelled ? 'bg-gray-50' : ''}`}>
                                        <div className="absolute -right-6 -top-6 text-gray-100 opacity-20 rotate-12">
                                            <TicketIcon size={140} />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${event?.category === 'Music' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {event?.category || 'Event'}
                                                </span>
                                                <span className="text-gray-400 font-mono text-xs">
                                                    #{booking._id.slice(-4)}-{ticketIndex + 1}
                                                </span>
                                            </div>

                                            <h2 className="text-lg font-bold text-gray-900 leading-tight mb-3 line-clamp-2 min-h-[3.5rem]">
                                                {event?.title}
                                            </h2>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center text-gray-600">
                                                    <Calendar size={14} className="mr-2 text-blue-500 shrink-0" />
                                                    <span className="font-medium">
                                                        {new Date(event?.startDate).toDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Clock size={14} className="mr-2 text-blue-500 shrink-0" />
                                                    <span className="font-medium">
                                                        {new Date(event?.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <MapPin size={14} className="mr-2 text-blue-500 shrink-0" />
                                                    <span className="font-medium line-clamp-1">
                                                        {event?.venue?.city}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Perforation */}
                                    <div className="relative h-px bg-gray-200 w-full my-0">
                                        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-100 rounded-full"></div>
                                        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-100 rounded-full"></div>
                                    </div>

                                    {/* Bottom: QR & Status */}
                                    <div className="bg-gray-50 p-4 flex items-center justify-between">
                                        <div className="bg-white p-1 rounded border border-gray-200">
                                            <QRCodeSVG value={qrData} size={64} fgColor={isCancelled ? '#9ca3af' : '#000000'} />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 mb-1">Status</div>
                                            <span className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-full uppercase ${isCancelled
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-green-100 text-green-600'
                                                }`}>
                                                {isCancelled ? <XCircle size={12} className="mr-1" /> : <CheckCircle size={12} className="mr-1" />}
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions Footer */}
                                    {ticketIndex === 0 && (
                                        <div className="px-4 py-3 bg-white border-t border-gray-100 flex justify-end">
                                            {isCancelled ? (
                                                <button
                                                    onClick={() => handleDelete(booking._id)}
                                                    className="text-xs text-gray-500 hover:text-red-600 font-medium hover:underline flex items-center"
                                                >
                                                    <XCircle size={14} className="mr-1" /> Delete Record
                                                </button>
                                            ) : (
                                                isUpcoming && (
                                                    <button
                                                        onClick={() => initiateCancel(booking._id)}
                                                        disabled={cancelling === booking._id}
                                                        className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline disabled:opacity-50"
                                                    >
                                                        Cancel Booking
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {/* past event review button */}
                                    {ticketIndex === 0 && !isCancelled && new Date() > new Date(event?.endDate || event?.startDate) && (
                                        <div className="px-4 py-3 bg-white border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={() => handleOpenReview(event._id)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center"
                                            >
                                                <Star size={12} className="mr-1" /> Write Review
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Hover Download Button */}
                                {!isCancelled && (
                                    <button
                                        onClick={() => downloadTicket(uniqueId, event?.title)}
                                        className="absolute top-3 right-3 bg-white text-gray-700 hover:text-blue-600 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 z-20 border border-gray-100"
                                        title="Download Ticket"
                                    >
                                        <Download size={18} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Hidden Detailed Ticket Templates for Downloading */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                {filteredTickets.map(({ booking, event, ticketIndex, uniqueId }) => {
                    const qrData = JSON.stringify({
                        bid: booking._id,
                        uid: booking.user,
                        idx: ticketIndex + 1,
                        valid: booking.status === 'confirmed'
                    });

                    return (
                        <div
                            key={`print-${uniqueId}`}
                            id={`ticket-download-${uniqueId}`}
                            className="bg-white overflow-hidden flex flex-col relative font-sans text-gray-900 border border-gray-200"
                            style={{ width: '400px', borderRadius: '24px' }} // Vertical standard width, rounded corners
                        >
                            {/* Banner Section with Overlay */}
                            <div className="h-64 relative w-full">
                                <img
                                    src="/ticket-bg.jpg"
                                    alt="Event Banner"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                                {/* Custom Corner QR Code (Payment/Brand) */}
                                <div className="absolute top-4 right-4 bg-white p-1 rounded-lg z-20 shadow-lg">
                                    <img src="/corner-qr.jpg" alt="Payment QR" className="w-16 h-16 object-cover" />
                                </div>

                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded mb-3 inline-block uppercase tracking-wider">
                                        {event?.category || 'Event'}
                                    </span>
                                    <h1 className="text-3xl font-extrabold leading-tight mb-1">
                                        {event?.title}
                                    </h1>
                                </div>
                            </div>

                            {/* Ticket Body */}
                            <div className="p-6 bg-white relative">
                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-y-6 mb-6">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Date</p>
                                        <div className="flex items-center text-gray-800 font-bold">
                                            <Calendar size={16} className="mr-2 text-blue-600" />
                                            <span>{new Date(event?.startDate).toDateString()}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Time</p>
                                        <div className="flex items-center text-gray-800 font-bold">
                                            <Clock size={16} className="mr-2 text-blue-600" />
                                            <span>{new Date(event?.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Venue</p>
                                        <div className="flex items-center text-gray-800 font-bold">
                                            <MapPin size={16} className="mr-2 text-blue-600" />
                                            <span>{event?.venue?.address}, {event?.venue?.city}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider Line with Cutouts */}
                                <div className="relative flex items-center justify-between py-4">
                                    <div className="absolute -left-8 w-6 h-6 bg-gray-900 rounded-full"></div> {/* Left Cutout (dark to match bg if needed, or white if transparent) - actually user image has dark bg around ticket? Let's assume transparent or white. User image has dark background outside. Let's make cutout look transparent or use correct color. The container has border, so maybe just simple dash line. User image has semicircle cutouts. */}
                                    <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full z-10"></div>
                                    <div className="absolute -right-9 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full z-10"></div>
                                    <div className="w-full border-t-2 border-dashed border-gray-200"></div>
                                </div>


                                {/* Attendee Info */}
                                <div className="flex justify-between items-end mt-2">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Attendee</p>
                                        <p className="text-lg font-bold text-gray-900">{user?.name || 'Valued Guest'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Ticket ID</p>
                                        <p className="text-sm font-bold text-gray-900">#{booking._id.slice(-6)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer (Dark Blue) */}
                            <div className="bg-[#0f172a] text-white p-6 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Admit One</p>
                                    <p className="text-3xl font-bold text-blue-500">
                                        {event.ticketType === 'Free' ? 'Free' : `$${event.price}`}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-1">Presented by CityPulse</p>
                                </div>
                                <div className="bg-white p-2 rounded-lg">
                                    <QRCodeSVG value={qrData} size={70} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Review Modal */}
            {
                showReviewModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="text-blue-600" /> Write Review
                            </h3>
                            <form onSubmit={submitReview} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                className={`p-1 transition-transform hover:scale-110 focus:outline-none`}
                                            >
                                                <Star
                                                    size={32}
                                                    className={star <= reviewData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Experience</label>
                                    <textarea
                                        value={reviewData.comment}
                                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50 focus:bg-white transition"
                                        placeholder="Tell us about the event..."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center shadow-lg shadow-blue-200"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Post Review'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center shadow-lg shadow-blue-200"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Post Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Cancellation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all scale-100">
                        {cancelSuccess ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Ticket Cancelled</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Your booking has been successfully cancelled. The organizer has been notified.
                                </p>
                                <button
                                    onClick={closeCancelModal}
                                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-3 mb-4 text-red-600">
                                    <AlertCircle size={28} />
                                    <h3 className="text-xl font-bold text-gray-900">Cancel Booking?</h3>
                                </div>
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                    Are you sure you want to cancel this ticket? This action cannot be undone and you may lose your reserved spot.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={closeCancelModal}
                                        className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Keep Ticket
                                    </button>
                                    <button
                                        onClick={confirmCancel}
                                        disabled={cancelling === bookingToCancel}
                                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {cancelling === bookingToCancel ? 'Cancelling...' : 'Yes, Cancel'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div >
    );
};

export default MyBookings;
