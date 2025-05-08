import React from 'react';
import personteam from '../../homeimage/person-team.png'; // Update the path to your image
import missionImage from '../../homeimage/AboutImage.jpg';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
const teamMembers = [
  {
    name: "Jane Doe",
    title: "CEO & Founder",
    description: "Some text that describes me lorem ipsum ipsum lorem.",
    email: "jane@example.com",
    image: personteam,
  },
  {
    name: "Mike Ross",
    title: "Art Director",
    description: "Some text that describes me lorem ipsum ipsum lorem.",
    email: "mike@example.com",
    image: personteam,
  },
  {
    name: "John Doe",
    title: "Designer",
    description: "Some text that describes me lorem ipsum ipsum lorem.",
    email: "john@example.com",
    image: personteam,
  },
];

const AboutUs = () => {
  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          About Us
        </h1>

        {/* Mission Section */}
        <div className="mb-12 flex flex-col md:flex-row items-center gap-8">
          {/* Text Content */}
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              At <span className="font-bold text-indigo-600">Investing in Future Learning</span>,
              we believe that every student deserves access to quality education, regardless of
              their financial situation. Our mission is to bridge the gap between students in
              need and generous donors who want to make a difference.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mt-4">
              Together, we can empower the next generation of learners and leaders through
              innovative solutions and community-driven support.
            </p>
          </div>

          {/* Image */}
          <div className="md:w-1/2 relative group">
            <img
              src={missionImage}
              alt="Our Mission"
              className="w-full h-auto md:h-96 object-cover rounded-lg shadow-xl transform transition-all duration-300 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 to-purple-100/20 rounded-lg"></div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Students */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">For Students</h3>
              <p className="text-gray-600">
                Students can apply for financial assistance to cover their educational expenses. Our team reviews each application to ensure fairness and transparency.
              </p>
            </div>

            {/* Donors */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">For Donors</h3>
              <p className="text-gray-600">
                Donors can contribute to support students' education. Every donation makes a direct impact, and donors can track how their contributions are being used.
              </p>
            </div>

            {/* Admins */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">For Admins</h3>
              <p className="text-gray-600">
                Our dedicated admin team manages the platform, ensures smooth operations, and maintains transparency between students and donors.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
            Our Team
          </h2>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className="w-full"
          >
            {teamMembers.map((member, index) => (
              <SwiperSlide key={index}>
                <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl group">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Team Member Image */}
                  <div className="relative h-64 w-full">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
                  </div>

                  {/* Team Member Details */}
                  <div className="p-6 relative">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-gray-600 text-sm font-medium mb-3">
                      {member.title}
                    </p>
                    <p className="text-gray-600 text-base mb-4">
                      {member.description}
                    </p>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {member.email}
                    </a>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Join Us in Making a Difference
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Whether you're a student in need, a donor looking to contribute, or someone who wants to support our cause, we invite you to be a part of our community.
          </p>
          <a
            href="/signup"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
