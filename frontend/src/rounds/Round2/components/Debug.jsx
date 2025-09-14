import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../../services/api';

const Debug = ({ onSubmit, teamId }) => {
    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [isRunning, setIsRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const autoSaveTimeoutRef = useRef(null);

    const codeToDebug = `#include <stdio.h>

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int sum = 0;
    
    for (int i = 0; i <= 5; i++) {
        sum += arr[i];
    }
    
    printf("Sum: %d\\n", sum);
    return 0;
}`;

    // Initialize code only once when component mounts
    useEffect(() => {
        setCode(codeToDebug);
    }, []);

    useEffect(() => {
        let interval = null;

        // Auto-start timer when component mounts
        if (!isRunning && timeLeft === 300) {
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
        if (code.trim() && teamId) {
            try {
                const timeTaken = Math.max(0, 300 - timeLeft); // Ensure it's never negative or NaN
                await apiService.post('/quiz/code/autosave', {
                    teamId,
                    challengeType: 'debug',
                    code,
                    timeTaken: timeTaken
                });
                console.log('Auto-saved debug progress');
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    };

    // Auto-save on code change
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
    }, [code]);

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
        if (!code.trim() || submitting) return;

        setSubmitting(true);
        const timeTaken = Math.max(0, 300 - timeLeft); // Ensure it's never negative or NaN

        try {
            await onSubmit(code, timeTaken);
        } catch (error) {
            console.error('Error submitting solution:', error);
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
                <div className="glass-dark rounded-2xl shadow-2xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent">
                                Debug The Program
                            </h2>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-purple-300'
                                }`}>
                                Time: {formatTime(timeLeft)}
                            </div>
                            {!isRunning && timeLeft === 300 && (
                                <div className="mt-1 text-green-400 text-xs">
                                    Timer starting automatically...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-xl p-3">
                        <h3 className="text-base font-bold text-white mb-2">Instructions:</h3>
                        <p className="text-gray-300 text-base leading-relaxed">
                            Find and fix the bug in the following C code. The program should calculate the sum of array elements correctly.
                            Look for the off-by-one error in the loop condition.
                        </p>
                    </div>
                </div>

                <div className="glass-dark rounded-2xl shadow-2xl p-4">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                        <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-1 rounded-lg text-xs font-semibold mr-2">DEBUG</span>
                        Fix the Code Below
                    </h3>

                    <div className="mb-3 p-3 glass rounded-xl">
                        <p className="text-gray-300 text-sm">
                            Find and fix the bug in the code below.
                        </p>
                    </div>

                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Fix the code here..."
                        className="w-full h-80 p-4 bg-gray-900/50 border border-purple-500/30 rounded-xl font-mono text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-500 backdrop-blur-sm"
                    />

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={!code.trim() || timeLeft === 0 || submitting}
                            className={`group flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all duration-500 transform hover:scale-110 ${code.trim() && timeLeft > 0 && !submitting
                                ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white shadow-2xl glow-purple'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Solution'}
                            {code.trim() && timeLeft > 0 && !submitting && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform duration-300 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={() => setCode(codeToDebug)}
                            className="group px-4 py-2 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white rounded-xl font-bold text-sm transition-all duration-500 transform hover:scale-110 shadow-2xl glow-purple"
                        >
                            Reset Code
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 group-hover:rotate-180 transition-transform duration-300 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Debug;