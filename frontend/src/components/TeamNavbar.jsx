import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TeamNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, teamData, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <header className="fixed top-0 left-0 w-full glass-dark z-50 shadow-2xl border-b border-purple-400/30 transition-all duration-300">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <button onClick={handleGoHome} className="flex items-center group">
                            <img src="/h-logo.png" alt="Hustle Logo" className="h-12 w-12 group-hover:scale-110 transition-all duration-500" />
                        </button>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated && teamData ? (
                            <>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-300 font-medium">
                                            {teamData.teamName || 'Team'}
                                        </div>
                                        <div className="text-xs text-purple-300">
                                            {teamData.competitionStatus === 'Selected' ? 'Selected' : 'Not Selected'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500 hover:bg-opacity-20 transition-all duration-300 rounded-lg backdrop-blur-md"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-3 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 hover:bg-purple-500/20 rounded-xl backdrop-blur-md border border-purple-400/30 hover:border-purple-400/50"
                            >
                                Login
                            </button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 py-4 border-t border-purple-400/30">
                        <div className="flex flex-col space-y-4">
                            {isAuthenticated && teamData ? (
                                <>
                                    <div className="px-4 py-2 bg-purple-500/10 rounded-lg">
                                        <div className="text-sm text-gray-300 font-medium">
                                            {teamData.teamName || 'Team'}
                                        </div>
                                        <div className="text-xs text-purple-300">
                                            {teamData.competitionStatus === 'Selected' ? 'Selected' : 'Not Selected'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500 hover:bg-opacity-20 transition-all duration-300 rounded-lg"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        navigate('/login');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 hover:bg-purple-500/20 rounded-lg"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default TeamNavbar;
