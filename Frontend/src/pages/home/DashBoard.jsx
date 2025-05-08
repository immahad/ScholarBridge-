import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AboutPlatform from "./AboutPlatform";
import HowItWorks from "./HowItWorks";

export default function Dashboard() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <main className="font-sans bg-white">
        {/* Modern Hero Section with Minimalist Design */}
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-50">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5" 
            style={{
              backgroundImage: "radial-gradient(#0369a1 1px, transparent 1px)",
              backgroundSize: "30px 30px"
            }}
          />
          
          {/* Accent shapes */}
          <div className="absolute top-0 right-0 h-64 w-64 bg-blue-500 opacity-10 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 h-40 w-96 bg-blue-600 opacity-10 rounded-tr-full"></div>
          
          {/* Content container with modern layout */}
          <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-8 flex flex-col items-center lg:items-start">
            {/* Hero content with animation */}
            <div className="text-center lg:text-left max-w-3xl">
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
                <span className="block opacity-0 animate-[fadeInUp_0.5s_0.3s_forwards]">Empower</span>
                <span className="block opacity-0 animate-[fadeInUp_0.5s_0.5s_forwards]">Your Future</span>
              </h1>
              
              <p className="mt-6 text-xl lg:text-2xl text-gray-600 font-light leading-relaxed opacity-0 animate-[fadeInUp_0.5s_0.7s_forwards]">
                Your path to education, opportunities, and growth starts here. 
                We bring students, donors, and communities together to invest in tomorrow's leaders.
              </p>
              
              {/* CTA button with hover effect */}
              <div className="mt-10 opacity-0 animate-[fadeInUp_0.5s_0.9s_forwards]">
                <Link 
                  to="/signup" 
                  className="inline-block px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-full transition-transform hover:scale-105 hover:shadow-lg hover:shadow-blue-600/20"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Clean Design */}
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Mission Statement Section */}
            <div className="text-center mb-20">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Our Mission</h2>
              <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                IFL - Investing In Future Learning
              </h1>
              <div className="mt-8 max-w-3xl mx-auto">
                <p className="text-xl text-gray-500">
                  We want you to feel valued and supported while you dedicate
                  your time to our cause. To show our appreciation, we've put
                  together a range of benefits to enhance your experience with
                  us.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Keep existing components with styling updates */}
        <div className="bg-gray-50">
          <AboutPlatform />
        </div>
        <HowItWorks />
        
        {/* Footer - Reduced size from py-16 to py-8 */}
        <div className="bg-blue-800 py-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to start your journey?</h2>
            <p className="text-lg text-blue-100 mb-6 max-w-3xl mx-auto">
              Join thousands of students and educators already transforming their futures through our platform.
            </p>
            <Link 
              to="/signup" 
              className="inline-block px-6 py-3 text-base font-bold text-blue-600 bg-white rounded-full transition-all hover:bg-gray-100 hover:shadow-lg"
            >
              Join Now
            </Link>
          </div>
        </div>
      </main>
      
      {/* Add custom styles for animations */}
      <style jsx="true">{`
        @keyframes fadeInUp {
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
    </>
  );
}