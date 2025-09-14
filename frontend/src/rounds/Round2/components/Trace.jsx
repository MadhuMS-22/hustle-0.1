import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../../services/api';

const Trace = ({ onSubmit, teamId }) => {
    const [output, setOutput] = useState('');
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
    const [isRunning, setIsRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const autoSaveTimeoutRef = useRef(null);

    const codeToTrace = `#include <stdio.h>

int mystery(int n) {
    if (n <= 1) return 1;
    return n * mystery(n - 1);
}

int main() {
    int result = mystery(4);
    printf("Result: %d\\n", result);
    return 0;
}`;

    useEffect(() => {
        let interval = null;

        // Auto-start timer when component mounts
        if (!isRunning && timeLeft === 900) {
            setIsRunning(true);
        }

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSubmit();
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    // Auto-save functionality
    const autoSave = async () => {
        if (output.trim() && teamId) {
            try {
                const timeTaken = Math.max(0, 900 - timeLeft);
                await apiService.post('/quiz/code/autosave', {
                    teamId,
                    challengeType: 'trace',
                    code: output,
                    timeTaken: timeTaken
                });
                console.log('Auto-saved trace progress');
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    };

    // Auto-save on output change
    useEffect(() => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
            autoSave();
        }, 2000); // Auto-save after 2 seconds of inactivity

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [output]);

    // Auto-save when timer ends
    useEffect(() => {
        if (timeLeft === 0) {
            autoSave();
        }
    }, [timeLeft]);

    const startTimer = () => {
        setIsRunning(true);
    };

    const handleSubmit = async () => {
        if (!output.trim() || submitting) return;

        setSubmitting(true);
        const timeTaken = Math.max(0, 900 - timeLeft); // Ensure it's never negative or NaN
        const code = codeToTrace; // The code being traced

        try {
            await onSubmit(code, timeTaken);
        } catch (error) {
            console.error('Error submitting output:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <div className="glass-dark rounded-3xl shadow-2xl p-8 mb-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                                Trace The Program
                            </h2>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-purple-300'
                                }`}>
                                Time Left: {formatTime(timeLeft)}
                            </div>
                            {!isRunning && timeLeft === 900 && (
                                <div className="mt-3 text-green-400 text-sm">
                                    Timer starting automatically...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Instructions:</h3>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            Trace through the following recursive function and determine what output it will produce.
                            This is a factorial function - trace through the recursive calls step by step.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-dark rounded-3xl shadow-2xl p-8">
                        <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl text-lg font-semibold mr-4">PROGRAM</span>
                            Program Code
                        </h3>
                        <div className="bg-gray-900/50 rounded-2xl p-6 overflow-x-auto border border-purple-500/30 backdrop-blur-sm">
                            <pre className="text-green-400 text-sm font-mono leading-relaxed">
                                <code>{codeToTrace}</code>
                            </pre>
                        </div>
                    </div>

                    <div className="glass-dark rounded-3xl shadow-2xl p-8">
                        <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl text-lg font-semibold mr-4">OUTPUT</span>
                            Trace Output
                        </h3>
                        <textarea
                            value={output}
                            onChange={(e) => setOutput(e.target.value)}
                            placeholder="Enter the expected output here..."
                            className="w-full h-32 p-6 bg-gray-900/50 border border-purple-500/30 rounded-2xl font-mono text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-500 backdrop-blur-sm"
                        />

                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={!output.trim() || timeLeft === 0 || submitting}
                                className={`group flex-1 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-110 ${output.trim() && timeLeft > 0 && !submitting
                                    ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white shadow-2xl glow-purple'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Trace'}
                                {output.trim() && timeLeft > 0 && !submitting && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trace;