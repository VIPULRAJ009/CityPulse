import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle, HelpCircle } from 'lucide-react';

const AboutUs = () => {
    const faqs = [
        {
            question: "How do I book a ticket?",
            answer: "Simply browse our events, click on one you like, and hit the 'Book Ticket' button. You'll receive a digital ticket instantly via email."
        },
        {
            question: "Can I cancel my booking?",
            answer: "Yes! You can cancel your booking from the 'My Tickets' dashboard. Refunds are processed automatically based on the event's policy."
        },
        {
            question: "How can I organize an event?",
            answer: "Sign up as an Organizer, complete your profile, and you can start creating and publishing events immediately."
        },
        {
            question: "Is payment secure?",
            answer: "Absolutely. We use industry-standard encryption and trusted payment gateways to ensure your transactions are safe."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        About <span className="text-[#4ade80]">CityPulse</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                        We are bridging the gap between vibrant local culture and the community. CityPulse is your go-to platform for discovering underground gigs and major festivals.
                    </p>
                </div>

                {/* How it Works */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Discover', desc: 'Browse hundreds of local events curated just for you.', step: '01', link: '/#event-list' },
                            { title: 'Book', desc: 'Secure your spot in seconds with our easy booking system.', step: '02', link: '/#event-list' },
                            { title: 'Experience', desc: 'Attend the event and make memories that last a lifetime.', step: '03', link: '/reviews' }
                        ].map((item, idx) => {
                            const CardContent = (
                                <>
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#4ade80]/20 rounded-full blur-xl group-hover:bg-[#4ade80]/40 transition"></div>
                                    <span className="text-6xl font-black text-gray-100 absolute top-4 right-4">{item.step}</span>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-6 text-xl font-bold">
                                            <CheckCircle size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                    </div>
                                </>
                            );

                            return item.link ? (
                                <Link
                                    key={idx}
                                    to={item.link}
                                    className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:scale-105 transition-transform duration-300 block"
                                >
                                    {CardContent}
                                </Link>
                            ) : (
                                <div
                                    key={idx}
                                    className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:scale-105 transition-transform duration-300"
                                >
                                    {CardContent}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FAQs */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center flex items-center justify-center gap-3">
                        <HelpCircle className="text-[#4ade80]" size={32} /> Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                                <button
                                    className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                >
                                    <span className="font-semibold text-gray-900">{faq.question}</span>
                                    {openIndex === index ? <ChevronUp className="text-[#4ade80]" /> : <ChevronDown className="text-gray-400" />}
                                </button>
                                <div
                                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 py-4 border-t border-gray-100' : 'max-h-0'
                                        }`}
                                >
                                    <p className="text-gray-600">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutUs;
