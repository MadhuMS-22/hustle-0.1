import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 font-sans antialiased text-white min-h-screen relative overflow-hidden">
      <HomeNavbar />

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        {/* Hero Section */}
        <section className="py-12 text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="h-32 sm:h-40 w-full max-w-4xl relative overflow-hidden rounded-lg">
                <img
                  src="/h-logo.svg"
                  alt="Coding Icon"
                  className="w-full h-full object-cover object-center hover:scale-110 transition-all duration-500"
                />
              </div>
            </div>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed">
              Premier technical competition designed to push the boundaries of coding and problem-solving.
              <span className="block mt-4 text-lg sm:text-xl text-purple-300 font-medium">
                Challenge yourself with complex puzzles and dynamic coding challenges in a high-stakes, timed environment.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="group flex items-center justify-center px-10 py-5 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white text-xl font-bold rounded-2xl shadow-2xl hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transition-all duration-500 transform hover:scale-110 glow-purple"
              >
                Register Your Team
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Competition Format Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                Competition Format
              </h2>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Three exciting rounds designed to test different aspects of your coding skills
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Round 1 Card */}
              <div className="group glass-dark p-8 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:glow-purple">
                <div className="flex justify-center mb-8">
                  <div className="p-6 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 text-white backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                    <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">Round 1: CODE SPARK</h3>
                <p className="text-gray-300 text-center mb-8 leading-relaxed">
                  This round is currently in offline mode. The complete round will be conducted offline, instructions will be given.
                </p>
                <div className="text-center">
                  <span className="inline-block px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-bold rounded-full shadow-lg">
                    Offline Mode
                  </span>
                </div>
              </div>
              {/* Round 2 Card */}
              <div className="group glass-dark p-8 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:glow-purple">
                <div className="flex justify-center mb-8">
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white backdrop-blur-md group-hover:scale-110 transition-transform duration-500 glow-purple">
                    <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">Round 2: Column Clash - Code to win</h3>
                <p className="text-gray-300 text-center mb-8 leading-relaxed">
                  Sequential puzzle unlock system. Solve programming challenges to advance through levels.
                </p>
                <div className="text-center">
                  <span className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
                    Duration: 1.5 hours
                  </span>
                </div>
              </div>

              {/* Round 3 Card */}
              <div className="group glass-dark p-8 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:glow-purple">
                <div className="flex justify-center mb-8">
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white backdrop-blur-md group-hover:scale-110 transition-transform duration-500 glow-purple">
                    <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">Round 3: C-Matrix Code Rush</h3>
                <p className="text-gray-300 text-center mb-8 leading-relaxed">
                  Advanced algorithms and complex problem-solving for qualified teams only.
                </p>
                <div className="text-center">
                  <span className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
                    Duration: 1.5 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
