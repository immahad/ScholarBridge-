import React from "react";
import { FaUserGraduate, FaHandHoldingHeart, FaUsers } from "react-icons/fa";

const AboutPlatform = () => {
    return (
        <section className="bg-gray-100 py-16 px-6">
            {/* Section Title */}
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                    About Our Platform
                </h2>
                <p className="mt-4 text-lg sm:text-xl text-gray-600">
                    Connecting students, donors, and admins to create a brighter future.
                </p>
            </div>

            {/* Benefits Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Benefit 1 */}
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
                    <FaUserGraduate className="text-blue-500 text-5xl mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800">For Students</h3>
                    <p className="mt-2 text-gray-600">
                        Apply for grants and unlock new opportunities to pursue your dreams.
                    </p>
                </div>

                {/* Benefit 2 */}
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
                    <FaHandHoldingHeart className="text-green-500 text-5xl mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800">For Donors</h3>
                    <p className="mt-2 text-gray-600">
                        Make a lasting impact by supporting talented and deserving students.
                    </p>
                </div>

                {/* Benefit 3 */}
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
                    <FaUsers className="text-purple-500 text-5xl mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800">For Admins</h3>
                    <p className="mt-2 text-gray-600">
                        Streamline grant management and connect donors with students.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutPlatform;
