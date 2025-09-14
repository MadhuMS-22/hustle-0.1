import React, { useState } from 'react';
import competitionService from '../services/competitionService';

const CodeVerification = ({ onCodeVerified, onCancel, roundNumber }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsVerifying(true);

        try {
            // Call the onCodeVerified function with the entered code
            onCodeVerified(code);
        } catch (error) {
            console.error('Code verification error:', error);
            setError(error.message || 'Failed to verify code. Please try again.');
            setCode('');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="glass-dark rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-purple-400/30">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 glow-purple">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent">Round {roundNumber} Access Code</h2>
                    <p className="text-gray-300">
                        Enter the access code to start Round {roundNumber}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                            Access Code
                        </label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full px-4 py-3 glass border border-purple-400/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-md"
                            placeholder="Enter access code"
                            required
                            autoComplete="off"
                            disabled={isVerifying}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 backdrop-blur-md">
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 backdrop-blur-md border border-white/20 hover:border-white/30"
                            disabled={isVerifying}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center hover:scale-105 transform shadow-lg glow-purple"
                            disabled={isVerifying || !code.trim()}
                        >
                            {isVerifying ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                'Verify & Start'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        🔒 This code is required to access Round {roundNumber}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CodeVerification;
