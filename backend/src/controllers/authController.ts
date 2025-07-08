import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not defined in .env file');
  process.exit(1);
}

const generateToken = (user: IUser) => {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

// Student Signup
export const studentSignup = async (req: Request, res: Response) => {
  try {
    const { name, regno, email, dob, dept } = req.body;

    if (!name || !regno || !email || !dob || !dept) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format for student
    if (!email.endsWith('@citchennai.net')) {
        return res.status(400).json({ message: 'Email must be your college email ending with @citchennai.net' });
    }

    // Validate DOB format (DD/MM/YYYY)
    const dobPattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dobPattern.test(dob)) {
        return res.status(400).json({ message: 'Date of birth must be in DD/MM/YYYY format' });
    }

    let existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { regno: regno.toUpperCase() }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or registration number already exists' });
    }
    

    const newUser = new User({
      name,
      regno: regno.toUpperCase(),
      email: email.toLowerCase(),
      password: dob, // Using DOB as password for students, will be hashed by pre-save hook
      department: dept,
      role: 'student',
    });

    await newUser.save();

    res.status(201).json({ 
        message: 'Student registered successfully',
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });

  } catch (error: any) {
    console.error('Student signup error:', error);
    res.status(500).json({ message: 'Server error during student signup', error: error.message });
  }
};

// Student Login
export const studentLogin = async (req: Request, res: Response) => {
  try {
    const { email, dob } = req.body; // Student logs in with email and DOB

    if (!email || !dob) {
      return res.status(400).json({ message: 'Email and Date of Birth (DOB) are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase(), role: 'student' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or not a student account' });
    }

    // DOB is stored as hashed password
    const isMatch = await user.comparePassword(dob);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.status(200).json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, regno: user.regno }
    });

  } catch (error: any) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error during student login', error: error.message });
  }
};

// Teacher Login
export const teacherLogin = async (req: Request, res: Response) => {
  console.log('Teacher login attempt:', req.body); // Added log
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // For teachers, we can assume a default email pattern or specific emails
    // For simplicity, let's assume teacher emails might not follow the @citchennai.net pattern
    // or they could have a specific subdomain like @teacher.citchennai.net

    const user = await User.findOne({ email: email.toLowerCase(), role: 'teacher' });
    if (!user) {
      console.log('Teacher not found or not a teacher account:', email);
      return res.status(401).json({ message: 'Invalid credentials or not a teacher account' });
    }
    console.log('Teacher found:', user.email); // Added log

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for teacher:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('Password match for teacher:', email); // Added log

    const token = generateToken(user);
    res.status(200).json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error: any) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Server error during teacher login', error: error.message });
  }
};

// Optional: A function to create a default teacher account if it doesn't exist
// This could be called once when the application starts or via a protected route
export const createDefaultTeacher = async () => {
    try {
        const defaultTeacherEmail = process.env.DEFAULT_TEACHER_EMAIL ;
        const defaultTeacherPassword = process.env.DEFAULT_TEACHER_PASSWORD;

        const existingTeacher = await User.findOne({ email: defaultTeacherEmail, role: 'teacher' });
        if (!existingTeacher) {
            const teacher = new User({
                name: 'Default Teacher',
                email: defaultTeacherEmail,
                password: defaultTeacherPassword,
                role: 'teacher',
            });
            await teacher.save();
            console.log('Default teacher account created successfully.');
        } else {
            console.log('Default teacher account already exists.');
        }
    } catch (error) {
        console.error('Error creating default teacher account:', error);
    }
};