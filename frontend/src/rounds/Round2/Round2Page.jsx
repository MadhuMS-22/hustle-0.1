import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import authService from "../../services/authService";

import Aptitude from "./components/Aptitude";
import Debug from "./components/Debug";
import Trace from "./components/Trace";
import Program from "./components/Program";
import QuestionSidebar from "./components/QuestionSidebar";
import GlobalTimer from "./components/GlobalTimer";
import ChallengeSelection from "./components/ChallengeSelection";

const Round2Page = () => {
    const navigate = useNavigate();
    const [teamId, setTeamId] = useState(null);
    const [step, setStep] = useState(0);
    const [teamName, setTeamName] = useState('');
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [completedChallenges, setCompletedChallenges] = useState([]);
    const [completedAptitudeQuestions, setCompletedAptitudeQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [teamProgress, setTeamProgress] = useState(null);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isQuizStarted, setIsQuizStarted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check authentication and get team info
    useEffect(() => {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login');
            return;
        }

        // Get team data from localStorage
        const storedTeam = localStorage.getItem('hustle_team');
        if (storedTeam) {
            const teamData = JSON.parse(storedTeam);
            setTeamId(teamData._id);
            setTeamName(teamData.teamName);
            // Don't set quiz start time yet - wait for Start button

            // Load team progress
            loadTeamProgress(teamData._id);
        } else {
            console.log('No team data found, redirecting to login');
            navigate('/login');
        }
    }, [navigate]);


    useEffect(() => {
        // Load team progress to check if quiz has already started/completed
        if (teamId) {
            loadTeamProgress(teamId);
        }
    }, [teamId]);

    const loadTeamProgress = async (teamId) => {
        try {
            setIsLoading(true);
            const response = await apiService.get(`/quiz/team/${teamId}/progress`);
            if (response && response.team) {
                setTeamProgress(response.team);
                setIsQuizCompleted(response.team.isQuizCompleted || false);
            }
        } catch (error) {
            console.error('Error loading team progress:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartRound2 = () => {
        setIsQuizStarted(true);
        setQuizStartTime(new Date()); // Start the timer when user clicks Start
        // Set the first question as current
        if (teamProgress?.unlockedQuestions.q1) {
            setCurrentQuestion(0);
        }
    };

    const handleAptSubmit = async (selected) => {
        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true);
        try {
            console.log('Submitting aptitude answer:', { teamId, currentQuestion, selected });

            if (!teamId) {
                throw new Error('No team ID found. Please log in again.');
            }

            const response = await apiService.post("/quiz/apt/answer", { teamId, step: currentQuestion, selected });
            console.log('Aptitude response:', response);

            // Reload team progress to get updated state
            await loadTeamProgress(teamId);

            if (response.correct) {
                setCompletedAptitudeQuestions(prev => [...prev, currentQuestion]);
                console.log('Answer correct, marking question as completed');

                // Automatically move to the unlocked challenge
                const challengeMap = { 0: 'debug', 1: 'trace', 2: 'program' };
                const nextChallenge = challengeMap[currentQuestion];
                if (nextChallenge) {
                    setCurrentChallenge(nextChallenge);
                }
            } else {
                console.log('Answer incorrect, attempts left:', response.attemptsLeft);
                if (response.attemptsLeft === 0) {
                    // Automatically move to the unlocked challenge even if failed
                    const challengeMap = { 0: 'debug', 1: 'trace', 2: 'program' };
                    const nextChallenge = challengeMap[currentQuestion];
                    if (nextChallenge) {
                        setCurrentChallenge(nextChallenge);
                    }
                }
            }
        } catch (error) {
            console.error('Error submitting aptitude answer:', error);

            // Handle specific error cases
            if (error.message.includes('Question already completed')) {
                alert('This question has already been completed. Please select an incomplete question.');
                return;
            } else if (error.message.includes('Maximum attempts reached')) {
                alert('Maximum attempts reached for this question. Moving to next challenge.');
                // Move to next challenge
                const challengeMap = { 0: 'debug', 1: 'trace', 2: 'program' };
                const nextChallenge = challengeMap[currentQuestion];
                if (nextChallenge) {
                    setCurrentChallenge(nextChallenge);
                }
                return;
            } else if (error.message.includes('Team not found')) {
                alert('Team not found. Please log in again.');
                navigate('/login');
                return;
            }

            alert(`Error submitting answer: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCodeSubmit = async (code, timeTaken) => {
        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true);
        try {
            if (!teamId) {
                throw new Error('No team ID found. Please log in again.');
            }

            const response = await apiService.post("/quiz/code/submit", { teamId, challengeType: currentChallenge, code, timeTaken });

            // Reload team progress to get updated state
            await loadTeamProgress(teamId);

            setCompletedChallenges(prev => [...prev, currentChallenge]);
            setCurrentChallenge(null);

            if (response.isQuizCompleted) {
                setIsQuizCompleted(true);
                // Redirect to team page after Round 2 completion
                setTimeout(() => {
                    navigate('/team');
                }, 2000); // Give user 2 seconds to see completion message
            } else {
                // Automatically move to the next aptitude question
                const challengeToAptitudeMap = { 'debug': 1, 'trace': 2, 'program': 3 };
                const nextAptitude = challengeToAptitudeMap[currentChallenge];
                if (nextAptitude && nextAptitude <= 2) {
                    setCurrentQuestion(nextAptitude);
                }
            }
        } catch (error) {
            console.error('Error submitting code:', error);

            // Handle specific error cases
            if (error.message.includes('Question already completed')) {
                alert('This challenge has already been completed. Please select an incomplete challenge.');
                return;
            } else if (error.message.includes('Question is locked')) {
                alert('This challenge is locked. Complete the prerequisite aptitude question first.');
                return;
            } else if (error.message.includes('Team not found')) {
                alert('Team not found. Please log in again.');
                navigate('/login');
                return;
            } else if (error.message.includes('Invalid challenge type')) {
                alert('Invalid challenge type. Please try again.');
                return;
            }

            alert(`Error submitting code: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChallengeSelect = (challengeId) => {
        setCurrentChallenge(challengeId);
    };

    const handleQuestionClick = (questionStep) => {
        console.log('Question clicked:', questionStep, 'Completed:', completedAptitudeQuestions);
        if (!completedAptitudeQuestions.includes(questionStep)) {
            setCurrentQuestion(questionStep);
            console.log('Setting current question to:', questionStep);
        }
    };

    const handleChallengeClick = (challengeId) => {
        // Find which aptitude question unlocks this challenge
        const challengeMap = {
            'debug': 0,
            'trace': 1,
            'program': 2
        };
        const requiredAptitude = challengeMap[challengeId];

        console.log('Challenge clicked:', challengeId, 'Required aptitude:', requiredAptitude, 'Completed aptitudes:', completedAptitudeQuestions, 'Completed challenges:', completedChallenges);

        if (completedAptitudeQuestions.includes(requiredAptitude) && !completedChallenges.includes(challengeId)) {
            setCurrentChallenge(challengeId);
            console.log('Setting current challenge to:', challengeId);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    <div className="text-purple-300 text-xl font-semibold">Loading Round 2...</div>
                </div>
            </div>
        );
    }


    return (
        <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 font-sans antialiased text-white min-h-screen relative overflow-hidden">
            <div className="flex h-screen">
                {/* Navigation sidebar - only show when quiz has started */}
                {isQuizStarted && (
                    <div className="w-80 glass-dark border-r border-purple-500/20 p-6 h-screen overflow-hidden">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-purple-300 mb-2">Team: {teamName}</h3>
                            <div className="text-sm text-gray-300">
                                Progress: {teamProgress ? Object.values(teamProgress.completedQuestions).filter(Boolean).length : 0}/6 Questions
                            </div>
                        </div>

                        <GlobalTimer startTime={quizStartTime} isActive={!!teamId && !isQuizCompleted} />

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">Quiz Questions</h4>

                            {/* Sequential Question Flow */}
                            {[
                                { aptitude: 0, challenge: 'debug', challengeName: 'Debug Q1' },
                                { aptitude: 1, challenge: 'trace', challengeName: 'Output Q2' },
                                { aptitude: 2, challenge: 'program', challengeName: 'Program Q3' }
                            ].map((pair, index) => {
                                const aptitudeKey = `q${pair.aptitude + 1}`;
                                const challengeKey = `q${pair.aptitude + 4}`;

                                const aptitudeCompleted = teamProgress ? teamProgress.completedQuestions[aptitudeKey] : false;
                                const challengeCompleted = teamProgress ? teamProgress.completedQuestions[challengeKey] : false;

                                // Sequential unlocking logic
                                const aptitudeUnlocked = teamProgress ? teamProgress.unlockedQuestions[aptitudeKey] : (pair.aptitude === 0);
                                const challengeUnlocked = teamProgress ? teamProgress.unlockedQuestions[challengeKey] : false;

                                const isCurrentAptitude = currentQuestion === pair.aptitude && !aptitudeCompleted;
                                const isCurrentChallenge = currentChallenge === pair.challenge;

                                return (
                                    <div key={pair.aptitude} className="space-y-2">
                                        {/* Aptitude Question */}
                                        <div
                                            onClick={() => {
                                                console.log('Sidebar aptitude clicked:', pair.aptitude, 'Completed:', aptitudeCompleted, 'Unlocked:', aptitudeUnlocked);
                                                if (aptitudeUnlocked && !aptitudeCompleted) {
                                                    handleQuestionClick(pair.aptitude);
                                                }
                                            }}
                                            className={`p-3 rounded-xl border transition-all duration-500 transform hover:scale-105 ${isCurrentAptitude
                                                ? 'border-purple-400 shadow-2xl bg-purple-500/20 cursor-pointer glow-purple'
                                                : aptitudeCompleted
                                                    ? 'border-green-500 bg-green-500/20'
                                                    : aptitudeUnlocked
                                                        ? 'border-purple-500/30 bg-purple-500/10 cursor-pointer hover:border-purple-400 hover:bg-purple-500/20'
                                                        : 'border-gray-600 bg-gray-500/20 opacity-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-slate-200">Q{pair.aptitude + 1}: Aptitude</span>
                                                    {!aptitudeUnlocked && (
                                                        <span className="ml-2 text-xs text-slate-500">🔒 Locked</span>
                                                    )}
                                                    {aptitudeUnlocked && !aptitudeCompleted && (
                                                        <div className="ml-2 flex items-center space-x-1">
                                                            <span className="text-xs text-cyan-400">Click to solve</span>
                                                            <span className="text-xs text-yellow-400">
                                                                ({teamProgress ? 2 - teamProgress.aptitudeAttempts[`q${pair.aptitude + 1}`] : 2}/2 chances)
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {aptitudeCompleted && <span className="text-green-400 text-sm">✓</span>}
                                            </div>
                                        </div>

                                        {/* Connected Challenge */}
                                        <div
                                            onClick={() => {
                                                console.log('Sidebar challenge clicked:', pair.challenge, 'Unlocked:', challengeUnlocked, 'Completed:', challengeCompleted);
                                                if (challengeUnlocked && !challengeCompleted) {
                                                    handleChallengeClick(pair.challenge);
                                                }
                                            }}
                                            className={`p-3 rounded-xl border transition-all duration-500 transform hover:scale-105 ml-4 ${isCurrentChallenge
                                                ? 'border-purple-400 shadow-2xl bg-purple-500/20 glow-purple'
                                                : challengeCompleted
                                                    ? 'border-green-500 bg-green-500/20'
                                                    : challengeUnlocked
                                                        ? 'border-purple-500/30 bg-purple-500/10 cursor-pointer hover:border-purple-400 hover:bg-purple-500/20'
                                                        : 'border-gray-600 bg-gray-500/20 opacity-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-slate-200">Q{pair.aptitude + 4}: {pair.challengeName}</span>
                                                    {!challengeUnlocked && (
                                                        <span className="ml-2 text-xs text-slate-500">🔒 Locked</span>
                                                    )}
                                                    {challengeUnlocked && !challengeCompleted && (
                                                        <span className="ml-2 text-xs text-cyan-400">Click to solve</span>
                                                    )}
                                                </div>
                                                {challengeCompleted && <span className="text-green-400 text-sm">✓</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {!isQuizStarted ? (
                        <ChallengeSelection onStart={handleStartRound2} teamProgress={teamProgress} />
                    ) : currentChallenge ? (
                        currentChallenge === 'debug' ? (
                            <Debug onSubmit={handleCodeSubmit} teamId={teamId} isQuizStarted={isQuizStarted} />
                        ) : currentChallenge === 'trace' ? (
                            <Trace onSubmit={handleCodeSubmit} teamId={teamId} isQuizStarted={isQuizStarted} />
                        ) : currentChallenge === 'program' ? (
                            <Program onSubmit={handleCodeSubmit} teamId={teamId} isQuizStarted={isQuizStarted} />
                        ) : null
                    ) : isQuizCompleted ? (
                        <div className="min-h-screen flex items-center justify-center p-4">
                            <div className="text-center">
                                <div className="text-8xl mb-6">🎉</div>
                                <h2 className="text-5xl text-purple-300 font-bold mb-4 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                                    Round 2 Completed!
                                </h2>
                                <p className="text-xl text-gray-300 mb-8">
                                    Congratulations! You have successfully completed all challenges.
                                </p>
                                <div className="glass-dark rounded-3xl p-8 max-w-md mx-auto shadow-2xl">
                                    <p className="text-gray-300 text-lg mb-4">
                                        Thank you for participating in Round 2!
                                    </p>
                                    <div className="text-purple-300 font-semibold mb-4">
                                        All challenges completed successfully!
                                    </div>
                                    <div className="text-gray-400 text-sm mb-6">
                                        Your responses have been submitted and recorded. You will be redirected to the team page shortly.
                                    </div>
                                    <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4 mb-6">
                                        <div className="text-yellow-300 font-semibold mb-2">📋 Next Steps:</div>
                                        <div className="text-yellow-200 text-sm">
                                            • Return to team page to see your progress<br />
                                            • Wait for admin to announce Round 2 results<br />
                                            • If qualified, Round 3 will be unlocked
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/team')}
                                        className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white text-lg font-bold rounded-2xl shadow-2xl hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transition-all duration-500 transform hover:scale-110 glow-purple"
                                    >
                                        Back to Team Page
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Aptitude questionStep={currentQuestion} onSubmit={handleAptSubmit} teamProgress={teamProgress} isQuizStarted={isQuizStarted} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Round2Page;