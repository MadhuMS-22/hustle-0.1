import express from 'express';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import Round2Question from '../models/Round2Question.js';

const router = express.Router();

// Get aptitude question
router.get('/apt/:step', async (req, res) => {
    try {
        const step = parseInt(req.params.step);

        const questions = await Round2Question.findOne({ round: 'Round2' });
        if (!questions) {
            return res.status(404).json({ error: 'Questions not found' });
        }

        if (step < 0 || step >= questions.aptitude.length) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const question = questions.aptitude[step];
        res.json({
            question: question.question,
            options: question.options
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit aptitude answer
router.post('/apt/answer', async (req, res) => {
    try {
        const { teamId, step, selected } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const questions = await Round2Question.findOne({ round: 'Round2' });
        if (!questions) {
            return res.status(404).json({ error: 'Questions not found' });
        }

        if (step < 0 || step >= questions.aptitude.length) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const question = questions.aptitude[step];

        const questionKey = `q${step + 1}`;
        const attemptKey = `q${step + 1}`;

        // Check if already completed
        if (team.completedQuestions[questionKey]) {
            return res.status(400).json({ error: 'Question already completed' });
        }

        // Check attempt limit
        if (team.aptitudeAttempts[attemptKey] >= 2) {
            return res.status(400).json({ error: 'Maximum attempts reached for this question' });
        }

        const correct = selected === question.correctAnswerIndex;

        // Set start time on first quiz
        if (step === 0 && !team.startTime) {
            team.startTime = new Date();
        }

        // Increment attempt count
        team.aptitudeAttempts[attemptKey] += 1;

        let score = 0;
        if (correct) {
            // 2 points on first attempt, 1 point on second
            score = team.aptitudeAttempts[attemptKey] === 1 ? 2 : 1;
            team.completedQuestions[questionKey] = true;

            // Only unlock next question if answered correctly
            if (step === 0) { // Q1 (aptitude) completed - unlock Q2 (debug)
                team.unlockedQuestions.q2 = true;
            } else if (step === 1) { // Q3 (aptitude) completed - unlock Q4 (trace)
                team.unlockedQuestions.q4 = true;
            } else if (step === 2) { // Q5 (aptitude) completed - unlock Q6 (program)
                team.unlockedQuestions.q6 = true;
            }
        } else {
            // If incorrect and no attempts left, still unlock next question
            if (team.aptitudeAttempts[attemptKey] >= 2) {
                if (step === 0) { // Q1 (aptitude) failed - unlock Q2 (debug)
                    team.unlockedQuestions.q2 = true;
                } else if (step === 1) { // Q3 (aptitude) failed - unlock Q4 (trace)
                    team.unlockedQuestions.q4 = true;
                } else if (step === 2) { // Q5 (aptitude) failed - unlock Q6 (program)
                    team.unlockedQuestions.q6 = true;
                }
            }
        }

        // Update scores
        team.scores[questionKey] = score;
        team.totalScore = Object.values(team.scores).reduce((sum, score) => sum + score, 0);

        await team.save();

        // Save submission
        const submission = new Submission({
            team: teamId,
            questionNumber: questionKey,
            questionType: 'aptitude',
            step: 0, // Aptitude questions use step 0
            challengeType: 'aptitude',
            originalQuestion: question.question,
            userSolution: selected.toString(),
            timeTaken: 0, // Not applicable for aptitude
            attemptNumber: team.aptitudeAttempts[attemptKey],
            isCorrect: correct,
            score: score
        });

        await submission.save();

        res.json({
            correct,
            score,
            attemptsLeft: 2 - team.aptitudeAttempts[attemptKey],
            unlockedQuestions: team.unlockedQuestions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get coding question by type
router.get('/code/:challengeType', async (req, res) => {
    try {
        const { challengeType } = req.params;

        if (!['debug', 'trace', 'program'].includes(challengeType)) {
            return res.status(400).json({ error: 'Invalid challenge type' });
        }

        const questions = await Round2Question.findOne({ round: 'Round2' });
        if (!questions) {
            return res.status(404).json({ error: 'Questions not found' });
        }

        const codingQuestion = questions.coding.find(q => q.challengeType === challengeType);
        if (!codingQuestion) {
            return res.status(404).json({ error: 'Coding question not found' });
        }

        res.json({
            title: codingQuestion.title,
            problemStatement: codingQuestion.problemStatement,
            code: codingQuestion.code,
            sampleOutput: codingQuestion.sampleOutput,
            challengeType: codingQuestion.challengeType
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit coding solution
router.post('/code/submit', async (req, res) => {
    try {
        const { teamId, challengeType, code, timeTaken, isAutoSave = false } = req.body;

        console.log('Code submission received:', { teamId, challengeType, codeLength: code?.length, timeTaken, isAutoSave });

        if (!teamId) {
            return res.status(400).json({ error: 'Team ID is required' });
        }

        if (!challengeType) {
            return res.status(400).json({ error: 'Challenge type is required' });
        }

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Validate challenge type
        if (!['debug', 'trace', 'program'].includes(challengeType)) {
            return res.status(400).json({ error: 'Invalid challenge type' });
        }

        // Map challenge type to question number and step
        const challengeMap = {
            'debug': { questionNumber: 'q2', step: 1 },
            'trace': { questionNumber: 'q4', step: 2 },
            'program': { questionNumber: 'q6', step: 3 }
        };

        const { questionNumber, step } = challengeMap[challengeType];

        // Check if question is unlocked
        if (!team.unlockedQuestions[questionNumber]) {
            return res.status(400).json({ error: 'Question is locked. Complete the prerequisite aptitude question first.' });
        }

        // Enforce 5-minute cap
        const maxTime = 300; // 5 minutes in seconds
        const actualTimeTaken = Math.min(timeTaken, maxTime);

        // Get original questions from database
        const questions = await Round2Question.findOne({ round: 'Round2' });
        if (!questions) {
            return res.status(404).json({ error: 'Questions not found' });
        }

        const codingQuestion = questions.coding.find(q => q.challengeType === challengeType);
        if (!codingQuestion) {
            return res.status(404).json({ error: 'Coding question not found' });
        }

        const originalQuestion = codingQuestion.problemStatement + '\n\n' + codingQuestion.code;

        // Calculate score based on code quality and time taken
        let score = 0;
        let isCorrect = false;

        if (!isAutoSave) {
            // No automatic scoring for coding challenges, score is always 0
            isCorrect = false;
            score = 0;

            // Update team scores and completion status
            team.scores[questionNumber] = score;
            team.completedQuestions[questionNumber] = true;
            team.totalScore = Object.values(team.scores).reduce((sum, score) => sum + score, 0);

            // Sequential unlocking: Unlock next aptitude question when coding challenge is completed
            if (challengeType === 'debug') { // Q2 (debug) completed - unlock Q3 (aptitude)
                team.unlockedQuestions.q3 = true;
            } else if (challengeType === 'trace') { // Q4 (trace) completed - unlock Q5 (aptitude)
                team.unlockedQuestions.q5 = true;
            }

            // Check if all questions are completed
            const allCompleted = Object.values(team.completedQuestions).every(completed => completed);
            if (allCompleted) {
                team.isQuizCompleted = true;
                team.endTime = new Date();
                team.totalTimeTaken = Math.floor((team.endTime - team.startTime) / 1000);
            }

            await team.save();
        }

        // Save submission
        const submission = new Submission({
            team: teamId,
            questionNumber: questionNumber,
            questionType: challengeType,
            step: step,
            challengeType: challengeType,
            originalQuestion: originalQuestion,
            userSolution: code,
            timeTaken: actualTimeTaken,
            attemptNumber: 1,
            isCorrect: isCorrect,
            score: score,
            isAutoSaved: isAutoSave
        });

        await submission.save();

        res.json({
            success: true,
            score: score,
            isCorrect: isCorrect,
            isQuizCompleted: team.isQuizCompleted,
            totalScore: team.totalScore
        });
    } catch (error) {
        console.error('Code submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Auto-save coding solution
router.post('/code/autosave', async (req, res) => {
    try {
        const { teamId, challengeType, code, timeTaken } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Map challenge type to question number and step
        const challengeMap = {
            'debug': { questionNumber: 'q2', step: 1 },
            'trace': { questionNumber: 'q4', step: 2 },
            'program': { questionNumber: 'q6', step: 3 }
        };

        const { questionNumber, step } = challengeMap[challengeType];

        // Check if question is unlocked
        if (!team.unlockedQuestions[questionNumber]) {
            return res.status(400).json({ error: 'Question is locked' });
        }

        // Get original questions from database
        const questions = await Round2Question.findOne({ round: 'Round2' });
        if (!questions) {
            return res.status(404).json({ error: 'Questions not found' });
        }

        const codingQuestion = questions.coding.find(q => q.challengeType === challengeType);
        if (!codingQuestion) {
            return res.status(404).json({ error: 'Coding question not found' });
        }

        const originalQuestion = codingQuestion.problemStatement + '\n\n' + codingQuestion.code;

        // Save auto-save submission
        const submission = new Submission({
            team: teamId,
            questionNumber: questionNumber,
            questionType: challengeType,
            step: step,
            challengeType: challengeType,
            originalQuestion: originalQuestion,
            userSolution: code,
            timeTaken: timeTaken,
            attemptNumber: 1,
            isCorrect: false,
            score: 0,
            isAutoSaved: true
        });

        await submission.save();

        res.json({ success: true, message: 'Progress auto-saved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get team progress
router.get('/team/:teamId/progress', async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json({
            team: {
                name: team.teamName,
                startTime: team.startTime,
                endTime: team.endTime,
                totalTimeTaken: team.totalTimeTaken,
                isQuizCompleted: team.isQuizCompleted,
                totalScore: team.totalScore,
                scores: team.scores,
                completedQuestions: team.completedQuestions,
                unlockedQuestions: team.unlockedQuestions,
                aptitudeAttempts: team.aptitudeAttempts
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;