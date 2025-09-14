import mongoose from 'mongoose';

// Schema for aptitude questions
const aptitudeQuestionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswerIndex: {
        type: Number,
        required: true
    }
}, { _id: false });

// Schema for coding questions
const codingQuestionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    challengeType: {
        type: String,
        enum: ['debug', 'trace', 'program'],
        required: true
    },
    problemStatement: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    sampleOutput: {
        type: String,
        default: ''
    }
}, { _id: false });

// Main Round 2 questions schema
const round2QuestionSchema = new mongoose.Schema({
    round: {
        type: String,
        default: 'Round2'
    },
    aptitude: [aptitudeQuestionSchema],
    coding: [codingQuestionSchema]
}, {
    timestamps: true
});

// Index for efficient queries
round2QuestionSchema.index({ round: 1 });

export default mongoose.model('Round2Question', round2QuestionSchema);
