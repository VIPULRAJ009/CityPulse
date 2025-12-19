import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Share2, Ticket, Check, Users, AlertCircle, Tag, X, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingAmount, setBookingAmount] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [discountData, setDiscountData] = useState(null); // { valid: true, discountPercentage: 10, code: 'X' }
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);

    const isPastEvent = event && new Date() > new Date(event.endDate || event.startDate);

    const handleOpenReview = () => {
        if (!user) {
            alert("Please login to write a review");
            navigate('/login');
            return;
        }
        setEditingReviewId(null);
        setReviewData({ rating: 5, comment: '' });
        setShowReviewModal(true);
    };

    const handleEditReview = (review) => {
        setEditingReviewId(review._id);
        setReviewData({ rating: review.rating, comment: review.comment });
        setShowReviewModal(true);
    }

    const handleCloseReview = () => {
        setShowReviewModal(false);
        setEditingReviewId(null);
        setReviewData({ rating: 5, comment: '' });
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingReviewId) {
                // Update existing review
                await axios.put(`http://localhost:5001/api/reviews/${editingReviewId}`, {
                    rating: reviewData.rating,
                    comment: reviewData.comment
                }, config);
                alert("Review updated successfully!");
            } else {
                // Create new review
                await axios.post('http://localhost:5001/api/reviews', {
                    eventId: id,
                    rating: reviewData.rating,
                    comment: reviewData.comment
                }, config);
                alert("Review submitted successfully!");
            }

            handleCloseReview();

            // Refresh reviews
            const { data } = await axios.get(`http://localhost:5001/api/reviews/event/${id}`);
            setReviews(data);
            if (data.length > 0) {
                const avg = data.reduce((acc, review) => acc + review.rating, 0) / data.length;
                setAverageRating(avg);
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5001/api/events/${id}`);
                setEvent(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5001/api/reviews/event/${id}`);
                setReviews(data);
                if (data.length > 0) {
                    const avg = data.reduce((acc, review) => acc + review.rating, 0) / data.length;
                    setAverageRating(avg);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            }
        };

        fetchEvent();
        fetchReviews();
    }, [id]);

    const seatsLeft = event ? (event.maxAttendees - (event.soldTickets || 0)) : 0;
    const isSoldOut = seatsLeft <= 0;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setValidatingCoupon(true);
        setCouponError('');
        setDiscountData(null);

        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo'))?.token;
            if (!token) {
                // If user not logged in, they can't validate (api protects it). 
                // Maybe allow public validation or ask to login. For now catch 401.
                alert("Please login to apply coupons"); // Simple UX
                return;
            }

            const { data } = await axios.post('http://localhost:5001/api/coupons/validate',
                { code: couponCode, eventId: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDiscountData(data);
        } catch (error) {
            setCouponError(error.response?.data?.message || 'Invalid Coupon');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setDiscountData(null);
        setCouponCode('');
        setCouponError('');
    };

    const handleBook = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Final Price Check
        const basePrice = event.price * bookingAmount;
        const discount = discountData ? (basePrice * discountData.discountPercentage / 100) : 0;
        const total = Math.max(0, basePrice - discount);

        if (!window.confirm(`Confirm booking for ${bookingAmount} tickets? Total: $${total.toFixed(2)}`)) return;

        setBookingLoading(true);
        try {
            const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
            await axios.post('http://localhost:5001/api/bookings', {
                eventId: id,
                numberOfTickets: bookingAmount,
                couponCode: discountData ? discountData.code : null,
                paymentMethod: 'mock_card'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Booking Successful! Redirecting to your tickets...");
            navigate('/user/tickets');
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                alert("Session expired or invalid. Please login again.");
                sessionStorage.removeItem('userInfo');
                navigate('/login');
                return;
            }
            alert(error.response?.data?.message || "Booking Failed");
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="py-20 text-center">Loading event...</div>;
    if (!event) return <div className="py-20 text-center">Event not found</div>;

    // Derived Financials
    const basePrice = event.ticketType === 'Free' ? 0 : (event.price * bookingAmount);
    const discountAmount = discountData ? (basePrice * discountData.discountPercentage / 100) : 0;
    const finalPrice = Math.max(0, basePrice - discountAmount);

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Banner */}
            <div className="h-[400px] w-full relative">
                <img src={event.banner || '/placeholder.jpg'} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">{event.category}</span>
                            {isSoldOut ? (
                                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Sold Out</span>
                            ) : (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${seatsLeft < 10 ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                                    {seatsLeft} Seats Left
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{event.title}</h1>
                        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-8 text-gray-200">
                            <div className="flex items-center space-x-2">
                                <Calendar size={20} />
                                <span>{new Date(event.startDate).toDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock size={20} />
                                <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MapPin size={20} />
                                <span>{event.venue.address}, {event.venue.city}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">About the Event</h3>
                        <div className="prose prose-lg text-gray-600">
                            {event.description}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Location</h3>
                        <div className="rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            {event.googleMapEmbed ? (
                                <div
                                    className="w-full h-80 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                                    dangerouslySetInnerHTML={{ __html: event.googleMapEmbed }}
                                />
                            ) : (
                                <div className="text-center py-20">
                                    <MapPin size={48} className="mx-auto mb-2 opacity-50" />
                                    <p className="font-semibold">{event.venue.city}</p>
                                    <p className="text-sm">{event.venue.address}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Reviews Section */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                Event Reviews
                                {reviews.length > 0 && (
                                    <span className="text-base font-normal text-gray-500 flex items-center bg-gray-100 px-3 py-1 rounded-full">
                                        <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                                        {averageRating.toFixed(1)} ({reviews.length} reviews)
                                    </span>
                                )}
                            </h3>
                            {isPastEvent && (
                                <button
                                    onClick={handleOpenReview}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center"
                                >
                                    <Star size={16} className="mr-1" /> Write a Review
                                </button>
                            )}
                        </div>

                        {reviews.length === 0 ? (
                            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                                <p>No reviews yet for this event.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review._id} className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs">
                                                    {review.user?.name?.[0] || 'U'}
                                                </div>
                                                <span className="font-semibold text-gray-900">{review.user?.name || 'Anonymous user'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                {user && review.user?._id === user._id && (
                                                    <button
                                                        onClick={() => handleEditReview(review)}
                                                        className="text-xs text-blue-600 hover:underline font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 italic">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Booking Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Summary</h3>

                        {/* Sold Out Overlay */}
                        {isSoldOut && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center font-bold">
                                This event is completely sold out!
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-6">
                            <span className="text-gray-500">Price per ticket</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {event.ticketType === 'Free' ? 'Free' : `$${event.price}`}
                            </span>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Tickets</label>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                    onClick={() => setBookingAmount(Math.max(1, bookingAmount - 1))}
                                    className="px-4 py-2 hover:bg-gray-100 border-r disabled:opacity-50"
                                    disabled={isSoldOut}
                                >-</button>
                                <input type="text" readOnly value={bookingAmount} className="w-full text-center py-2 outline-none bg-white" />
                                <button
                                    onClick={() => setBookingAmount(Math.min(10, Math.min(seatsLeft, bookingAmount + 1)))}
                                    className="px-4 py-2 hover:bg-gray-100 border-l disabled:opacity-50"
                                    disabled={isSoldOut || bookingAmount >= seatsLeft}
                                >+</button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">Max 10 per booking</p>
                        </div>

                        {/* Coupon Section (Only for Paid) */}
                        {event.ticketType !== 'Free' && !isSoldOut && (
                            <div className="mb-6 pt-6 border-t border-gray-100">
                                {discountData ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-green-700 font-bold text-sm flex items-center">
                                                <Tag size={12} className="mr-1" /> Code: {discountData.code}
                                            </p>
                                            <p className="text-xs text-green-600">-{discountData.discountPercentage}% Applied</p>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Coupon Code"
                                            className="flex-1 px-3 py-2 border rounded-lg uppercase text-sm"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={validatingCoupon}
                                            className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {validatingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
                                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                            </div>
                        )}

                        {/* Totals */}
                        <div className="space-y-2 border-t border-gray-100 pt-4 mb-6">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>${basePrice.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <span>Discount</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                                <span>Total Payment</span>
                                <span>${finalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleBook}
                            disabled={bookingLoading || isSoldOut}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg flex items-center justify-center
                                ${isSoldOut
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
                        >
                            {bookingLoading
                                ? 'Processing...'
                                : event.ticketType === 'Free' ? 'Get Ticket' : 'Proceed to Payment'}
                        </button>

                        {!isSoldOut && (
                            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center">
                                <Check size={14} className="mr-1 text-green-500" /> Secure mock transaction
                            </p>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Organizer</h4>
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                                {event.organizer.name?.[0]}
                            </div>
                            <div>
                                <p className="font-medium">{event.organizer.name}</p>
                                <p className="text-xs text-gray-500">{event.organizer.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                            <button onClick={handleCloseReview} className="text-gray-400 hover:text-red-500"><X /></button>
                        </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
                                <textarea
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50 focus:bg-white transition"
                                    placeholder="Share your experience..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseReview}
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
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetails;
