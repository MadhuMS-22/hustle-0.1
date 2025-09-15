import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChallengeSelection = ({ onStart }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl mx-auto">
                <div className="glass-dark rounded-3xl shadow-2xl p-8 text-white text-center">
                    <h2 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                        Welcome to Round 2
                    </h2>
                    <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Prepare to test your problem-solving and coding skills. You will face a series of challenges that must be completed sequentially.
                    </p>
                    <div className="glass rounded-2xl p-8 mb-10">
                        <h3 className="text-2xl font-bold text-white mb-6">Rules and Format</h3>
                        <ul className="text-left text-gray-300 space-y-3 list-disc list-inside max-w-2xl mx-auto">
                            <li>Complete three aptitude questions to unlock the three coding challenges.</li>
                            <li>Each aptitude question has <strong>two attempts</strong>. A correct first attempt gives <strong>2 points</strong>, while a correct second attempt gives <strong>1 point</strong>.</li>
                            <li>The coding challenges (Debug, Trace, Program) do not award points directly. Submissions will be reviewed by administrators.</li>
                            <li>Each coding challenge has a 5-minute timer.</li>
                            <li>Each coding challenge has its own specific time limit that must be followed strictly.</li>
                            <li>The total time allotted for Round 2 is 45 minutes, within which all challenges must be completed and submitted.</li>
                        </ul>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={onStart}
                            className="group flex items-center justify-center px-10 py-5 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white text-xl font-bold rounded-2xl shadow-2xl hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transition-all duration-500 transform hover:scale-110 glow-purple"
                        >
                            Start Round 2 Now
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeSelection;