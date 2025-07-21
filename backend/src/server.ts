import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables for the rest of the application
dotenv.config();

// Application imports
import authRoutes from './routes/authRoutes';
import testRoutes from './routes/testRoutes';
import { createDefaultTeacher } from './controllers/authController';
import { testCloudinaryConnection } from './config/cloudinary'; // Import the test function

const app: Express = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.get('/', (req: Request, res: Response) => res.send('GATE Portal Backend API is running.'));

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'An unexpected server error occurred.', error: err.message });
});

// Asynchronous startup function
const startServer = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('FATAL: MONGO_URI is not defined in .env file');
    }

    // First, verify external connections
    await testCloudinaryConnection();
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    // Then, start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    // Finally, run post-start scripts
    await createDefaultTeacher();

  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
};

startServer();
