import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('GATE Portal Backend API');
});

import authRoutes from './routes/authRoutes';
import { createDefaultTeacher } from './controllers/authController';

app.use('/api/auth', authRoutes);

// Create a default teacher account on startup if it doesn't exist
(async () => {
  await createDefaultTeacher();
})();

import testRoutes from './routes/testRoutes';
// Import test attempt routes

app.use('/api/tests', testRoutes);
 // Use test attempt routes

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('src/uploads'));

// TODO: Add result routes (teacher, student)
// Test scheduling is part of testRoutes
// Test attempt routes are now added

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});