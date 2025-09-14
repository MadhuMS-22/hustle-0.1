import mongoose from 'mongoose';

// Schema for question orders
const questionOrderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    questionIds: [{
        type: Number,
        required: true
    }]
}, { _id: false });

// Schema for code block options
const codeBlockOptionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
}, { _id: false });

// Schema for code blocks
const codeBlockSchema = new mongoose.Schema({
    isPuzzle: {
        type: Boolean,
        required: true
    },
    code: {
        type: String,
        default: ''
    },
    options: [codeBlockOptionSchema]
}, { _id: false });

// Schema for individual questions
const questionSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    timeLimit: {
        type: Number,
        required: true
    },
    codeBlocks: [codeBlockSchema]
}, { _id: false });

// Main Round 3 questions schema
const round3QuestionSchema = new mongoose.Schema({
    round: {
        type: String,
        default: 'Round3'
    },
    questionOrders: [questionOrderSchema],
    questions: [questionSchema]
}, {
    timestamps: true
});

// Index for efficient queries
round3QuestionSchema.index({ round: 1 });

export default mongoose.model('Round3Question', round3QuestionSchema);
