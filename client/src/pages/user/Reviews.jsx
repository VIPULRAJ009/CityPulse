import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, User, Calendar, MessageSquare, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/reviews');
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // Helper to render stars
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={16}
                className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Community <span className="text-[#4ade80]">Voices</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        See what people are saying about the latest events. Join the conversation and share your own experiences.
                    </p>
                </div>

                {/* Reviews Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm h-64 animate-pulse"></div>
                        ))}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 text-lg">No reviews yet. Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {reviews.map((review) => (
                            <div key={review._id} className="break-inside-avoid bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                {/* Event Banner context */}
                                {review.event && (
                                    <Link to={`/events/${review.event._id}`} className="block relative h-32 overflow-hidden group">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition z-10"></div>
                                        <img
                                            src={review.event.banner || '/placeholder.jpg'}
                                            alt={review.event.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                        <div className="absolute bottom-3 left-3 z-20">
                                            <h3 className="text-white font-bold text-sm bg-black/60 px-2 py-1 rounded backdrop-blur-sm line-clamp-1">
                                                {review.event.title}
                                            </h3>
                                        </div>
                                    </Link>
                                )}

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                                {review.user?.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                                                <p className="text-xs text-gray-500 block md:hidden">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-0.5">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Quote className="absolute -top-1 -left-1 text-gray-100 w-8 h-8 -z-1" />
                                        <p className="text-gray-700 leading-relaxed italic relative z-10 pl-2">
                                            "{review.comment}"
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                        <div className="flex items-center">
                                            <Calendar size={12} className="mr-1" />
                                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
