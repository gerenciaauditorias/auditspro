import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { DocumentReminderService } from './services/documentReminderService';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Routes
app.use('/api', routes);

// Error handler (debe ser el último middleware)
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        await initializeDatabase();

        // Start scheduled jobs for document reminders
        DocumentReminderService.startScheduledJobs();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV}`);
            console.log(`⏰ Document reminder jobs scheduled`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
