import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';

const Aptitude = ({ questionStep, onSubmit, teamProgress }) => {
    const [question, setQuestion] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                setLoading(true);
                const response = await apiService.get(`/quiz/apt/${questionStep}`);
                setQuestion(response);
                setSelected(null);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching question:', error);
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [questionStep]);

    const handleOptionClick = (index) => {
        setSelected(index);
    };

    const handleSubmit = async () => {
        if (selected !== null && !submitting) {
            setSubmitting(true);
            try {
                console.log('Submitting answer, selected:', selected);
                await onSubmit(selected);
                console.log('Answer submitted successfully');
            } catch (error) {
                console.error('Error submitting answer:', error);
                alert(`Error: ${error.message}`);
            } finally {
                setSubmitting(false);
            }
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    <div className="text-purple-300 text-xl font-semibold">Loading question...</div>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-purple-300 text-xl font-semibold mb-4">Question not found</div>
                    <div className="text-gray-300">Please try refreshing the page</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 flex items-center justify-center">
            <div className="max-w-4xl mx-auto w-full">
                <div className="glass-dark rounded-2xl shadow-2xl p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent">
                            Aptitude Question
                        </h2>
                        {teamProgress && (
                            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-3 max-w-md mx-auto mb-4">
                                <p className="text-yellow-300 text-sm font-semibold">
                                    You have {2 - (teamProgress.aptitudeAttempts?.[`q${questionStep + 1}`] || 0)} out of 2 attempts remaining
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <div className="glass rounded-xl p-4 mb-4">
                            <p className="text-lg text-gray-200 leading-relaxed">{question.question}</p>
                        </div>

                        <div className="space-y-3">
                            {question.options.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleOptionClick(index)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-500 transform hover:scale-105 ${selected === index
                                        ? 'border-purple-400 bg-purple-500/20 text-white shadow-2xl glow-purple'
                                        : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 text-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-bold text-base ${selected === index
                                            ? 'border-purple-300 bg-purple-300 text-purple-900'
                                            : 'border-purple-400 text-purple-300'
                                            }`}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className="text-base font-medium">{option}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={selected === null || submitting}
                        className={`group w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-500 transform hover:scale-110 ${selected !== null && !submitting
                            ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white shadow-2xl glow-purple'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {submitting ? 'Submitting...' : 'Submit Answer'}
                        {selected !== null && !submitting && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Aptitude;