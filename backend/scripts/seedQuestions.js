import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Round2Question from '../models/Round2Question.js';
import Round3Question from '../models/Round3Question.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hustle');
        console.log('MongoDB connected for seeding questions');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Read and parse JSON files
const readJsonFile = (filePath) => {
    try {
        const fullPath = path.join(__dirname, '..', '..', '..', filePath);
        console.log(`Attempting to read file: ${fullPath}`);

        if (!fs.existsSync(fullPath)) {
            console.error(`File does not exist: ${fullPath}`);
            return null;
        }

        const data = fs.readFileSync(fullPath, 'utf8');
        console.log(`Successfully read file: ${filePath}`);
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
};

// Seed Round 2 questions
const seedRound2Questions = async () => {
    try {
        console.log('🌱 Seeding Round 2 questions...');

        const round2Data = readJsonFile('round2 (1).json');
        if (!round2Data) {
            console.error('❌ Failed to read Round 2 questions file');
            return;
        }

        // Clear existing Round 2 questions
        await Round2Question.deleteMany({ round: 'Round2' });
        console.log('🗑️  Cleared existing Round 2 questions');

        // Create new Round 2 questions document
        const round2Question = new Round2Question({
            round: 'Round2',
            aptitude: round2Data.round2Questions.aptitude,
            coding: round2Data.round2Questions.coding
        });

        await round2Question.save();
        console.log('✅ Round 2 questions seeded successfully');
        console.log(`   - Aptitude questions: ${round2Question.aptitude.length}`);
        console.log(`   - Coding questions: ${round2Question.coding.length}`);

    } catch (error) {
        console.error('❌ Error seeding Round 2 questions:', error);
    }
};

// Seed Round 3 questions
const seedRound3Questions = async () => {
    try {
        console.log('🌱 Seeding Round 3 questions...');

        const round3Data = readJsonFile('questions-1.json');
        if (!round3Data) {
            console.error('❌ Failed to read Round 3 questions file');
            return;
        }

        // Clear existing Round 3 questions
        await Round3Question.deleteMany({ round: 'Round3' });
        console.log('🗑️  Cleared existing Round 3 questions');

        // Create new Round 3 questions document
        const round3Question = new Round3Question({
            round: 'Round3',
            questionOrders: round3Data.questionOrders,
            questions: round3Data.questions
        });

        await round3Question.save();
        console.log('✅ Round 3 questions seeded successfully');
        console.log(`   - Question orders: ${round3Question.questionOrders.length}`);
        console.log(`   - Questions: ${round3Question.questions.length}`);

    } catch (error) {
        console.error('❌ Error seeding Round 3 questions:', error);
    }
};

// Main seeding function
const seedQuestions = async () => {
    try {
        console.log('🚀 Starting question seeding process...\n');
        console.log('MONGODB_URI:', process.env.MONGODB_URI);

        await connectDB();

        await seedRound2Questions();
        console.log('');
        await seedRound3Questions();

        console.log('\n🎉 Question seeding completed successfully!');

    } catch (error) {
        console.error('❌ Seeding process failed:', error);
        console.error('Error stack:', error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('📡 Database connection closed');
        process.exit(0);
    }
};

// Run seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedQuestions();
}

export default seedQuestions;
