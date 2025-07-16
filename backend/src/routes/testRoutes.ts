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
import { upload } from '../utils/fileUpload';

const router = express.Router();

// POST /api/tests/schedule - Schedule a new test (teachers only)
router.post('/schedule', protect, authorize('teacher'), upload.any(), scheduleTest);

// GET /api/tests/teacher/results - Get teacher's test results dashboard data
router.get('/teacher/results', protect, authorize('teacher'), getTeacherTests);

// GET /api/tests/teacher - Get teacher's own tests (teachers only) - MUST BE BEFORE /:id
router.get('/teacher', protect, authorize('teacher'), getTeacherTests);

// GET /api/tests/department - Get tests by department (students only)
router.get('/department', protect, authorize('student'), getTestsByDepartment);

// GET /api/tests/scheduled - Get scheduled tests (both roles)
router.get('/scheduled', protect, authorize('teacher', 'student'), getScheduledTests);

// GET /api/tests/:testId/submissions - Get submissions for a test (teachers only)
router.get('/:testId/submissions', protect, authorize('teacher'), getTestSubmissions);

// GET /api/tests/:testId/analytics - Get analytics for a test (teachers only)
router.get('/:testId/analytics', protect, authorize('teacher'), getTestAnalytics);

// POST /api/tests/submit-test - Submit test answers (students only)
router.post('/submit-test', protect, authorize('student'), submitTest);

// GET /api/tests - Get all tests (role-based access)
router.get('/', protect, authorize('teacher', 'student'), getAllTests);

// GET /api/tests/:id - Get specific test by ID (both roles) - MUST BE LAST
router.get('/:id', protect, authorize('teacher', 'student'), getTestById);

export default router;
