import express from 'express';
import {
    getRound2Questions,
    getRound3Questions,
    getRound2AptitudeQuestion,
    getRound2CodingQuestion
} from '../controllers/questionsController.js';

const router = express.Router();

// Get all Round 2 questions
router.get('/round2', getRound2Questions);

// Get all Round 3 questions
router.get('/round3', getRound3Questions);

// Get specific Round 2 aptitude question by step
router.get('/round2/aptitude/:step', getRound2AptitudeQuestion);

// Get specific Round 2 coding question by challenge type
router.get('/round2/coding/:challengeType', getRound2CodingQuestion);

export default router;
