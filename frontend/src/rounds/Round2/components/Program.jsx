import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../../services/api';
import round2Service from '../../../services/round2Service';

const Program = ({ onSubmit, teamId, isQuizStarted = true, teamProgress }) => {
    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
    const [isRunning, setIsRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [problemStatement, setProblemStatement] = useState('');
    const [sampleOutput, setSampleOutput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const autoSaveTimeoutRef = useRef(null);

    // Fetch program question from database
    useEffect(() => {
        const fetchProgramQuestion = async () => {
            try {
                setLoading(true);
                const response = await round2Service.getCodingQuestion('program');
                console.log('Program API Response:', response);
                if (response && response.problemStatement) {
                    console.log('Setting program data:', response);
                    setProblemStatement(response.problemStatement);
                    setSampleOutput(response.sampleOutput);
                } else {
                    console.error('No problem statement received from API');
                    setError('Failed to load program question from database');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching program question:', error);
                setError('Failed to load program question from database');
                setLoading(false);
            }
        };

        fetchProgramQuestion();
    }, []);

    useEffect(() => {
        let interval = null;

        // Auto-start timer when component mounts and quiz has started
        if (!isRunning && timeLeft === 1500 && isQuizStarted) {
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
                // Check if program question is unlocked before attempting autosave
                if (!teamProgress?.unlockedQuestions?.q6) {
                    console.log('Program question (q6) is not unlocked yet, skipping autosave');
                    return;
                }

                // Ensure timeLeft is a valid number
                const validTimeLeft = typeof timeLeft === 'number' && !isNaN(timeLeft) ? timeLeft : 1500;
                const timeTaken = Math.max(0, 1500 - validTimeLeft);
                console.log('Auto-save - timeLeft:', timeLeft, 'validTimeLeft:', validTimeLeft, 'timeTaken:', timeTaken, 'type:', typeof timeTaken);
                await apiService.post('/quiz/code/autosave', {
                    teamId,
                    challengeType: 'program',
                    code,
                    timeTaken: timeTaken
                });
                console.log('Auto-saved program progress');
            } catch (error) {
                console.error('Auto-save failed:', error);
                // Don't show error to user for autosave failures, just log them
            }
        }
    };

    // Smart auto-save on code change with debouncing and change detection
    useEffect(() => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // Only auto-save if code has actually changed and is not empty
        if (code.trim()) {
            autoSaveTimeoutRef.current = setTimeout(() => {
                autoSave();
            }, 5000); // Increased to 5 seconds to reduce server load
        }

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
        // Ensure timeLeft is a valid number
        const validTimeLeft = typeof timeLeft === 'number' && !isNaN(timeLeft) ? timeLeft : 1500;
        const timeTaken = Math.max(0, 1500 - validTimeLeft); // 25 minutes = 1500 seconds
        console.log('Program submission - timeLeft:', timeLeft, 'validTimeLeft:', validTimeLeft, 'timeTaken:', timeTaken, 'type:', typeof timeTaken);

        try {
            await onSubmit(code, timeTaken);
        } catch (error) {
            console.error('Error submitting code:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Show loading state while fetching question
    if (loading) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-dark rounded-2xl shadow-2xl p-4 mb-4">
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                            <h2 className="text-xl font-bold text-white mb-2">Loading Program Question...</h2>
                            <p className="text-gray-300">Please wait while we load the programming challenge.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if there's an error
    if (error) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-dark rounded-2xl shadow-2xl p-4 mb-4">
                        <div className="text-center py-8">
                            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Question</h2>
                            <p className="text-gray-300 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <div className="glass-dark rounded-3xl shadow-2xl p-8 mb-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                                Write The Program
                            </h2>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-purple-300'
                                }`}>
                                Time Left: {formatTime(timeLeft)}
                            </div>
                            {!isRunning && timeLeft === 1500 && (
                                <div className="mt-3 text-orange-400 text-sm">
                                    Timer starting automatically...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Problem Statement:</h3>
                        <div className="bg-gray-900/50 rounded-2xl p-6 border-l-4 border-orange-500 backdrop-blur-sm">
                            <pre className="text-gray-300 whitespace-pre-line font-mono text-sm leading-relaxed">{problemStatement}</pre>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-dark rounded-3xl shadow-2xl p-8">
                        <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl text-lg font-semibold mr-4">SAMPLE</span>
                            Sample Output
                        </h3>
                        <div className="bg-gray-900/50 rounded-2xl p-6 overflow-x-auto border border-purple-500/30 backdrop-blur-sm">
                            <pre className="text-green-400 text-sm font-mono leading-relaxed">
                                <code>{sampleOutput}</code>
                            </pre>
                        </div>
                    </div>

                    <div className="glass-dark rounded-3xl shadow-2xl p-8">
                        <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl text-lg font-semibold mr-4">CODE</span>
                            Your Code
                        </h3>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Write your C program here..."
                            className="w-full h-64 p-6 bg-gray-900/50 border border-purple-500/30 rounded-2xl font-mono text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-500 backdrop-blur-sm"
                        />

                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={!code.trim() || timeLeft === 0 || submitting}
                                className={`group flex-1 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-110 ${code.trim() && timeLeft > 0 && !submitting
                                    ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white shadow-2xl glow-purple'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Program'}
                                {code.trim() && timeLeft > 0 && !submitting && (
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

export default Program;