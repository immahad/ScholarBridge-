import React from "react";
import {
    BookOpen,
    Trophy,
    Users,
    Target,
    Calendar,
    GraduationCap,
    ArrowRight,
    CheckCircle,
    Star
} from "lucide-react";

const AnimatedDiv = ({ children, className, delay = 0 }) => (
    <div
        style={{
            opacity: 0,
            transform: 'translateY(20px)',
            animation: `fadeIn 0.8s ease-out ${delay}s forwards`
        }}
        className={className}
    >
        {children}
    </div>
);

const StudentDashboard = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <style jsx global>{`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
            `}</style>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20 text-center">
                <AnimatedDiv className="max-w-6xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Empowering Students for a Brighter Future
                    </h1>
                    <p className="text-xl text-blue-100 mb-8">
                        Join our platform to unlock opportunities, gain knowledge, and excel in your career.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg shadow-md hover:bg-blue-50">
                            Get Started
                        </button>
                        <button className="border border-white text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700">
                            Learn More
                        </button>
                    </div>
                </AnimatedDiv>
            </div>



            {/* Community and Events */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <AnimatedDiv className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Join Our Community</h2>
                        <p className="text-gray-600">Stay connected, join discussions, and participate in events.</p>
                    </AnimatedDiv>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white shadow-lg p-6 rounded-lg text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Discussion Forums</h3>
                            <p className="text-gray-600">Engage in meaningful conversations with peers and mentors.</p>
                        </div>
                        <div className="bg-white shadow-lg p-6 rounded-lg text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Workshops & Webinars</h3>
                            <p className="text-gray-600">Attend live sessions and enhance your skills.</p>
                        </div>
                        <div className="bg-white shadow-lg p-6 rounded-lg text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Hackathons & Competitions</h3>
                            <p className="text-gray-600">Showcase your talent and win exciting prizes.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="py-20 text-center">
                <AnimatedDiv>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Ready to Start Your Learning Journey?
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Join thousands of students who have already transformed their careers with our platform.
                    </p>
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700">
                        Register Now <ArrowRight className="ml-2 w-5 h-5 inline-block" />
                    </button>
                </AnimatedDiv>
            </div>
        </div>
    );
};

export default StudentDashboard;