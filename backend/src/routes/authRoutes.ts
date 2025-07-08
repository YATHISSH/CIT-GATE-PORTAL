import { Router } from 'express';
import { studentSignup, studentLogin, teacherLogin } from '../controllers/authController';

const router = Router();

// Student routes
router.post('/student/signup', studentSignup);
router.post('/student/login', studentLogin);

// Teacher routes
router.post('/teacher/login', teacherLogin);

// We might add a route to initialize the default teacher if needed, e.g., a protected admin route
// import { createDefaultTeacher } from '../controllers/authController';
// router.post('/admin/setup-teacher', (req, res) => { /* Add protection here */ createDefaultTeacher(); res.send('Setup initiated'); });

export default router;