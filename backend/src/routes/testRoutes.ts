import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { 
  scheduleTest, 
  getTestsByDepartment, 
  getScheduledTests, 
  getTestById, 
  submitTest,
  getTeacherTests,
  getTestSubmissions,
  getTestAnalytics,
  getAllTests
} from '../controllers/testController';
import { uploadQuestionImages, handleMulterError } from '../utils/fileUpload'; // Updated import

const router = express.Router();

// UPDATED: Use Cloudinary-compatible file upload middleware
router.post('/schedule', protect, authorize('teacher'), uploadQuestionImages, handleMulterError, scheduleTest);

// All other routes remain exactly the same
router.get('/teacher/results', protect, authorize('teacher'), getTeacherTests);
router.get('/teacher', protect, authorize('teacher'), getTeacherTests);
router.get('/department', protect, authorize('student'), getTestsByDepartment);
router.get('/scheduled', protect, authorize('teacher', 'student'), getScheduledTests);
router.get('/:testId/submissions', protect, authorize('teacher'), getTestSubmissions);
router.get('/:testId/analytics', protect, authorize('teacher'), getTestAnalytics);
router.post('/submit-test', protect, authorize('student'), submitTest);
router.get('/', protect, authorize('teacher', 'student'), getAllTests);
router.get('/:id', protect, authorize('teacher', 'student'), getTestById);

export default router;
