import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB, { checkConnection, getConnectionStatus } from './config/database.js';

// Load environment variables
dotenv.config({ path: './config.env' });
// Environment loaded

import { notFound, errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import competitionRoutes from './routes/competition.js';
import round3Routes from './routes/round3.js';
import adminRoutes from './routes/admin.js';
import adminAuthRoutes from './routes/adminAuth.js';
import quizRoutes from './routes/quiz.js';
import questionsRoutes from './routes/questions.js';

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting - temporarily disabled for testing
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: {
//         success: false,
//         message: 'Too many requests from this IP, please try again later.'
//     }
// });
// app.use('/api/', limiter);

// CORS configuration - allow multiple frontend ports
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:3000',
        process.env.FRONTEND_URL,
        // Add your actual Vercel domains
        'https://hustle-0-1-o6jnk0fkm-mss-projects-919981bd.vercel.app',
        'https://hustle-0-1-petn7ph6b-mss-projects-919981bd.vercel.app',
        'https://hustle-0-1.vercel.app'
    ].filter(Boolean), // Remove undefined values
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root route handler
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Hustle Competition Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            competition: '/api/competition',
            quiz: '/api/quiz',
            questions: '/api/questions',
            admin: '/api/admin'
        }
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/competition', competitionRoutes);
app.use('/api/round3', round3Routes);
app.use('/api/quiz', quizRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    const isConnected = checkConnection();
    const status = getConnectionStatus();

    res.status(isConnected ? 200 : 503).json({
        success: isConnected,
        message: isConnected ? 'Server is healthy' : 'Database connection issue',
        database: {
            connected: isConnected,
            status: status,
            timestamp: new Date().toISOString()
        },
        server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        }
    });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', err);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
    process.exit(1);
});

export default app;
