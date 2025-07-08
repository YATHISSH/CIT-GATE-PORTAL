import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { scheduleTest, getTestsByDepartment, getScheduledTests, getTestById, submitTest } from '../controllers/testController';
import { upload } from '../utils/fileUpload';
const router = express.Router();

// POST /api/tests/schedule


// POST /api/tests/schedule
router.post('/schedule', protect, authorize('teacher'), upload.any(), scheduleTest);

// GET /api/tests
router.get('/', protect, authorize('student'), getTestsByDepartment);

// GET /api/tests/scheduled
router.get('/scheduled', protect, authorize('teacher', 'student'), getScheduledTests);
router.get('/:id', protect, authorize('teacher', 'student'), getTestById);
router.post('/submit-test', protect, authorize('student'), submitTest);

export default router;