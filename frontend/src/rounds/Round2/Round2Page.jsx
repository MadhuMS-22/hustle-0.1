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
    const [showStateRecovery, setShowStateRecovery] = useState(false);

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

    // Simplified state recovery function
    const restoreQuizState = (team) => {
        try {
            // Restore completed aptitude questions
            const completedAptitude = [];
            for (let i = 0; i < 3; i++) {
                const questionKey = `q${i + 1}`;
                if (team.completedQuestions[questionKey]) {
                    completedAptitude.push(i);
                }
            }
            setCompletedAptitudeQuestions(completedAptitude);

            // Restore completed challenges
            const completedChallenges = [];
            const challengeMap = { 'q2': 'debug', 'q4': 'trace', 'q6': 'program' };
            Object.keys(challengeMap).forEach(qKey => {
                if (team.completedQuestions[qKey]) {
                    completedChallenges.push(challengeMap[qKey]);
                }
            });
            setCompletedChallenges(completedChallenges);

            // Find next incomplete question/challenge
            // Flow: Q1 (aptitude) -> Q2 (debug) -> Q3 (aptitude) -> Q4 (trace) -> Q5 (aptitude) -> Q6 (program)
            const flowOrder = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
            const flowTypes = ['aptitude', 'challenge', 'aptitude', 'challenge', 'aptitude', 'challenge'];

            for (let i = 0; i < flowOrder.length; i++) {
                const qKey = flowOrder[i];
                if (team.unlockedQuestions[qKey] && !team.completedQuestions[qKey]) {
                    if (flowTypes[i] === 'aptitude') {
                        const aptitudeStep = qKey === 'q1' ? 0 : qKey === 'q3' ? 1 : 2;
                        setCurrentQuestion(aptitudeStep);
                        setCurrentChallenge(null); // Clear any challenge
                        console.log(`📍 Restored to aptitude question ${aptitudeStep + 1}`);
                    } else {
                        setCurrentChallenge(challengeMap[qKey]);
                        setCurrentQuestion(null); // Clear any question
                        console.log(`📍 Restored to challenge: ${challengeMap[qKey]}`);
                    }
                    break;
                }
            }
        } catch (error) {
            console.error('Error in state recovery:', error);
            // Fallback: start from beginning
            setCurrentQuestion(0);
            setCurrentChallenge(null);
        }
    };

    const loadTeamProgress = async (teamId) => {
        try {
            setIsLoading(true);
            const response = await apiService.get(`/quiz/team/${teamId}/progress`);
            if (response && response.team) {
                const team = response.team;
                setTeamProgress(team);
                setIsQuizCompleted(team.isQuizCompleted || false);

                // State Recovery: Restore frontend state based on backend progress
                console.log('🔄 Restoring state from backend progress...');

                // Check if quiz was already started (has any progress)
                const hasAnyProgress = team.startTime || Object.values(team.completedQuestions).some(Boolean);
                if (hasAnyProgress) {
                    console.log('📊 Quiz already in progress, restoring state...');
                    setIsQuizStarted(true);
                    setShowStateRecovery(true);

                    // Simplified state recovery
                    restoreQuizState(team);

                    // Restore quiz start time if available
                    if (team.startTime) {
                        setQuizStartTime(new Date(team.startTime));
                        console.log('⏰ Restored quiz start time');
                    }

                    console.log('✅ State recovery completed');

                    // Auto-hide notification after 5 seconds
                    setTimeout(() => {
                        setShowStateRecovery(false);
                    }, 5000);
                } else {
                    console.log('🆕 No previous progress found, starting fresh');
                }
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

            // Check if question is already completed
            const questionKey = `q${currentQuestion + 1}`;
            if (teamProgress?.completedQuestions?.[questionKey]) {
                console.log(`Question ${questionKey} already completed, moving to next`);
                // Move to next challenge
                const challengeMap = { 0: 'debug', 1: 'trace', 2: 'program' };
                const nextChallenge = challengeMap[currentQuestion];
                if (nextChallenge) {
                    setCurrentChallenge(nextChallenge);
                }
                setIsSubmitting(false);
                return;
            }

            const response = await apiService.post("/quiz/apt/answer", { teamId, step: currentQuestion, selected });
            console.log('Aptitude response:', response);

            // Reload team progress to get updated state
            await loadTeamProgress(teamId);

            if (response.correct) {
                setCompletedAptitudeQuestions(prev => [...prev, currentQuestion]);
                console.log('Answer correct, marking question as completed');

                // Automatically move to the next question/challenge based on flow
                if (currentQuestion === 0) {
                    // Q1 (aptitude) completed - move to Q2 (debug)
                    setCurrentChallenge('debug');
                } else if (currentQuestion === 1) {
                    // Q3 (aptitude) completed - move to Q4 (trace)
                    setCurrentChallenge('trace');
                } else if (currentQuestion === 2) {
                    // Q5 (aptitude) completed - move to Q6 (program)
                    setCurrentChallenge('program');
                }
            } else {
                console.log('Answer incorrect, attempts left:', response.attemptsLeft);

                if (response.attemptsLeft === 0) {
                    // Second attempt failed - move to next question/challenge
                    if (currentQuestion === 0) {
                        // Q1 (aptitude) failed - move to Q2 (debug)
                        setCurrentChallenge('debug');
                    } else if (currentQuestion === 1) {
                        // Q3 (aptitude) failed - move to Q4 (trace)
                        setCurrentChallenge('trace');
                    } else if (currentQuestion === 2) {
                        // Q5 (aptitude) failed - move to Q6 (program)
                        setCurrentChallenge('program');
                    }
                }
            }
        } catch (error) {
            console.error('Error submitting aptitude answer:', error);

            // Handle specific error cases
            if (error.message.includes('Question already completed')) {
                console.log('Question already completed, moving to next');
                // Move to next challenge
                const challengeMap = { 0: 'debug', 1: 'trace', 2: 'program' };
                const nextChallenge = challengeMap[currentQuestion];
                if (nextChallenge) {
                    setCurrentChallenge(nextChallenge);
                }
                return;
            } else if (error.message.includes('Maximum attempts reached')) {
                console.log('Maximum attempts reached, moving to next challenge');
                // Move to next challenge
                const challengeMap = { 0: 'debug', 1: 'trace', 2: 'program' };
                const nextChallenge = challengeMap[currentQuestion];
                if (nextChallenge) {
                    setCurrentChallenge(nextChallenge);
                }
                return;
            } else if (error.message.includes('Team not found')) {
                console.log('Team not found, redirecting to login');
                navigate('/login');
                return;
            }

            console.error(`Error submitting answer: ${error.message}`);
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
                // Automatically move to the next aptitude question after coding challenge
                if (currentChallenge === 'debug') {
                    // Q2 (debug) completed - move to Q3 (aptitude)
                    setCurrentQuestion(1);
                } else if (currentChallenge === 'trace') {
                    // Q4 (trace) completed - move to Q5 (aptitude)
                    setCurrentQuestion(2);
                } else if (currentChallenge === 'program') {
                    // Q6 (program) completed - quiz is done
                    setIsQuizCompleted(true);
                }
            }
        } catch (error) {
            console.error('Error submitting code:', error);

            // Handle specific error cases
            if (error.message.includes('Question already completed')) {
                console.log('Challenge already completed, moving to next');
                return;
            } else if (error.message.includes('Question is locked')) {
                console.log('Challenge is locked, completing prerequisite first');
                return;
            } else if (error.message.includes('Team not found')) {
                console.log('Team not found, redirecting to login');
                navigate('/login');
                return;
            } else if (error.message.includes('Invalid challenge type')) {
                console.log('Invalid challenge type');
                return;
            }

            console.error(`Error submitting code: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChallengeSelect = (challengeId) => {
        setCurrentChallenge(challengeId);
    };

    const handleQuestionClick = (questionStep) => {
        console.log('Question clicked:', questionStep, 'Completed:', completedAptitudeQuestions);

        // Check if question is completed in team progress
        const questionKey = `q${questionStep + 1}`;
        const isCompletedInDB = teamProgress?.completedQuestions?.[questionKey];

        if (isCompletedInDB) {
            console.log(`Question ${questionKey} already completed in database, preventing selection`);
            return;
        }

        if (!completedAptitudeQuestions.includes(questionStep)) {
            setCurrentQuestion(questionStep);
            console.log('Setting current question to:', questionStep);
        }
    };

    const handleChallengeClick = (challengeId) => {
        // Find which aptitude question unlocks this challenge based on new flow
        const challengeMap = {
            'debug': 0,  // Q2 (debug) unlocked by Q1 (aptitude step 0)
            'trace': 1,  // Q4 (trace) unlocked by Q3 (aptitude step 1)
            'program': 2 // Q6 (program) unlocked by Q5 (aptitude step 2)
        };
        const requiredAptitude = challengeMap[challengeId];

        // Check if challenge is already completed in database
        const challengeKeyMap = { 'debug': 'q2', 'trace': 'q4', 'program': 'q6' };
        const challengeKey = challengeKeyMap[challengeId];
        const isCompletedInDB = teamProgress?.completedQuestions?.[challengeKey];

        if (isCompletedInDB) {
            console.log(`Challenge ${challengeId} already completed in database, preventing selection`);
            return;
        }

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
            {/* State Recovery Notification */}
            {showStateRecovery && (
                <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold">Progress Restored!</p>
                        <p className="text-sm">Your quiz progress has been restored from where you left off.</p>
                    </div>
                    <button
                        onClick={() => setShowStateRecovery(false)}
                        className="flex-shrink-0 text-green-200 hover:text-white"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}

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
                                { type: 'aptitude', number: 1, key: 'q1', step: 0 },
                                { type: 'challenge', number: 2, key: 'q2', challenge: 'debug', name: 'Debug' },
                                { type: 'aptitude', number: 3, key: 'q3', step: 1 },
                                { type: 'challenge', number: 4, key: 'q4', challenge: 'trace', name: 'Output' },
                                { type: 'aptitude', number: 5, key: 'q5', step: 2 },
                                { type: 'challenge', number: 6, key: 'q6', challenge: 'program', name: 'Program' }
                            ].map((item, index) => {
                                const isCompleted = teamProgress ? teamProgress.completedQuestions[item.key] : false;
                                const isUnlocked = teamProgress ? teamProgress.unlockedQuestions[item.key] : (item.number === 1);
                                const isCurrent = item.type === 'aptitude' ?
                                    (currentQuestion === item.step && !isCompleted) :
                                    (currentChallenge === item.challenge);

                                return (
                                    <div key={item.key} className="space-y-2">
                                        <div
                                            onClick={() => {
                                                if (item.type === 'aptitude') {
                                                    console.log('Sidebar aptitude clicked:', item.step, 'Completed:', isCompleted, 'Unlocked:', isUnlocked);
                                                    if (isUnlocked && !isCompleted) {
                                                        handleQuestionClick(item.step);
                                                    }
                                                } else {
                                                    console.log('Sidebar challenge clicked:', item.challenge, 'Unlocked:', isUnlocked, 'Completed:', isCompleted);
                                                    if (isUnlocked && !isCompleted) {
                                                        handleChallengeClick(item.challenge);
                                                    }
                                                }
                                            }}
                                            className={`p-3 rounded-xl border transition-all duration-500 transform hover:scale-105 ${isCurrent
                                                ? 'border-purple-400 shadow-2xl bg-purple-500/20 cursor-pointer glow-purple'
                                                : isCompleted
                                                    ? 'border-green-500 bg-green-500/20'
                                                    : isUnlocked
                                                        ? 'border-purple-500/30 bg-purple-500/10 cursor-pointer hover:border-purple-400 hover:bg-purple-500/20'
                                                        : 'border-gray-600 bg-gray-500/20 opacity-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-slate-200">
                                                        Q{item.number}: {item.type === 'aptitude' ? 'Aptitude' : item.name}
                                                    </span>
                                                    {!isUnlocked && (
                                                        <span className="ml-2 text-xs text-slate-500">🔒 Locked</span>
                                                    )}
                                                    {isUnlocked && !isCompleted && (
                                                        <div className="ml-2 flex items-center space-x-1">
                                                            <span className="text-xs text-cyan-400">Click to solve</span>
                                                            {item.type === 'aptitude' && (
                                                                <span className="text-xs text-yellow-400">
                                                                    ({teamProgress ? 2 - teamProgress.aptitudeAttempts[item.key] : 2}/2 chances)
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {isCompleted && <span className="text-green-400 text-sm">✓</span>}
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