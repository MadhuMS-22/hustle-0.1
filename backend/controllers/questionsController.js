import Round2Question from '../models/Round2Question.js';
import Round3Question from '../models/Round3Question.js';

// Get Round 2 questions
export const getRound2Questions = async (req, res) => {
    try {
        const questions = await Round2Question.findOne({ round: 'Round2' });

        if (!questions) {
            return res.status(404).json({
                success: false,
                message: 'Round 2 questions not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                aptitude: questions.aptitude,
                coding: questions.coding
            }
        });
    } catch (error) {
        console.error('Get Round 2 questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching Round 2 questions'
        });
    }
};

// Get Round 3 questions
export const getRound3Questions = async (req, res) => {
    try {
        const questions = await Round3Question.findOne({ round: 'Round3' });

        if (!questions) {
            return res.status(404).json({
                success: false,
                message: 'Round 3 questions not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                questionOrders: questions.questionOrders,
                questions: questions.questions
            }
        });
    } catch (error) {
        console.error('Get Round 3 questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching Round 3 questions'
        });
    }
};

// Get specific Round 2 aptitude question by step
export const getRound2AptitudeQuestion = async (req, res) => {
    try {
        const { step } = req.params;
        const stepIndex = parseInt(step);

        const questions = await Round2Question.findOne({ round: 'Round2' });

        if (!questions) {
            return res.status(404).json({
                success: false,
                message: 'Round 2 questions not found'
            });
        }

        if (stepIndex < 0 || stepIndex >= questions.aptitude.length) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        const question = questions.aptitude[stepIndex];

        res.status(200).json({
            success: true,
            data: {
                question: question.question,
                options: question.options
            }
        });
    } catch (error) {
        console.error('Get Round 2 aptitude question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching aptitude question'
        });
    }
};

// Get specific Round 2 coding question by challenge type
export const getRound2CodingQuestion = async (req, res) => {
    try {
        const { challengeType } = req.params;

        const questions = await Round2Question.findOne({ round: 'Round2' });

        if (!questions) {
            return res.status(404).json({
                success: false,
                message: 'Round 2 questions not found'
            });
        }

        const codingQuestion = questions.coding.find(q => q.challengeType === challengeType);

        if (!codingQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Coding question not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: codingQuestion.id,
                title: codingQuestion.title,
                challengeType: codingQuestion.challengeType,
                problemStatement: codingQuestion.problemStatement,
                code: codingQuestion.code,
                sampleOutput: codingQuestion.sampleOutput
            }
        });
    } catch (error) {
        console.error('Get Round 2 coding question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching coding question'
        });
    }
};
