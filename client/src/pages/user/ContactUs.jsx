import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const ContactUs = () => {
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuccess(true);
        // Reset form or hide message after some time if needed
        setTimeout(() => setShowSuccess(false), 5000);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    {showSuccess && (
                        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 z-50 animate-bounce">
                            <CheckCircle size={20} />
                            <span className="font-bold">Message sent successfully!</span>
                        </div>
                    )}
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Get in <span className="text-[#4ade80]">Touch</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h3>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-lg font-semibold text-gray-900">support@citypulse.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-green-50 p-3 rounded-lg text-green-600">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p className="text-lg font-semibold text-gray-900">+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Office</p>
                                    <p className="text-lg font-semibold text-gray-900">123 Event St, San Francisco, CA 94105</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4ade80] focus:border-transparent outline-none transition"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4ade80] focus:border-transparent outline-none transition"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea
                                    rows="4"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4ade80] focus:border-transparent outline-none transition"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-800 transition flex items-center justify-center space-x-2"
                            >
                                <span>Send Message</span>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
