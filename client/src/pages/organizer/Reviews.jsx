import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, MessageSquare } from 'lucide-react';

const OrganizerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('userInfo')).token;
                const { data } = await axios.get('http://localhost:5001/api/reviews/organizer', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReviews(data);
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading) return <div>Loading Reviews...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">User Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.length === 0 ? (
                    <div className="col-span-2 text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                        <MessageSquare className="mx-auto mb-4 text-gray-300" size={48} />
                        No reviews received yet.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.event?.title}</h4>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <span>by {review.user?.name}</span>
                                        <span className="mx-2">•</span>
                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-bold text-sm">
                                    <Star size={14} className="fill-current mr-1" />
                                    {review.rating}
                                </div>
                            </div>
                            <p className="text-gray-600 italic">"{review.comment}"</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrganizerReviews;
