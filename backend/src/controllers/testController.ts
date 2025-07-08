
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Test from '../models/Test';
import Submission from '../models/Submission';
import { IUser } from '../models/User';

import { Request } from 'express';
import fs from 'fs';
import path from 'path';

export const getTestsByDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const department = req.query.department as string;
    
    if (!department) {
      return res.status(400).json({ message: 'Department is required' });
    }

    const tests = await Test.find({ department }).sort({ startTime: -1 });
    res.status(200).json(tests);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error while fetching tests', error: error.message });
  }
};
export const getScheduledTests = async (req: AuthRequest, res: Response) => {
  try {
    const { department } = req.query;
    let query: any = {};

    if (department && typeof department === 'string') {
      query.department = department;
    }

    const now = new Date();
    const tests = await Test.find({
      ...query,
      endTime: { $gte: now } // Only fetch tests that haven't ended yet
    });
    res.status(200).json(tests);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error while fetching scheduled tests', error: error.message });
  }
};

export const getTestById = async (req: AuthRequest, res: Response) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.status(200).json(test);
  } catch (error: any) {
    console.error('Error in getTestById:', error);
    res.status(500).json({ message: 'Server error while fetching test', error: error.message, stack: error.stack });
  }
};

export const submitTest = async (req: AuthRequest, res: Response) => {
  try {
    const { testId, answers } = req.body;
    const studentId = req.user?._id; // Assuming req.user contains student's ID

    if (!testId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Test ID and answers are required.' });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    let score = 0;
    const results = answers.map((submittedAnswer: { questionId: string; answer: string }) => {
      const question = test.questions.find(q => q._id.toString() === submittedAnswer.questionId);
      let isCorrect = false;

      if (question) {
        console.log(`Question Type received: ${question.type}`);
        // For MCQ/MSQ, correctAnswer is an array of strings (e.g., ['A'], ['A', 'B'])
        // For NAT, correctAnswer is an array of strings (e.g., ['123'])
        if (question.type === 'mcq') {
          // Ensure submittedAnswer.answer is treated as a string for comparison
          const correctOptionIndex = question.correctAnswer[0].charCodeAt(0) - 'A'.charCodeAt(0);
          const correctOptionText = question.options[correctOptionIndex]?.text;
          isCorrect = submittedAnswer.answer === correctOptionText;
        } else if (question.type === 'numerical' || question.type === 'nat') {
          // For numerical and nat questions, compare the submitted answer string with the first element of the correct answer array (which is expected to be a string)
          const submittedAnswerString = String(submittedAnswer.answer).trim();
          const correctAnswerString = String(question.correctAnswer[0]).trim();

          // Compare numerical answers as strings, character by character, as suggested by the user
          const submittedChars = submittedAnswerString.split('');
          const correctChars = correctAnswerString.split('');

          // Check if lengths are different or any character mismatches
          isCorrect = submittedChars.length === correctChars.length &&
                      submittedChars.every((char, index) => char === correctChars[index]);

          console.log(`NAT Debug - Submitted String: '${submittedAnswerString}', Length: ${submittedAnswerString.length}, Correct String: '${correctAnswerString}', Length: ${correctAnswerString.length}`);
          console.log(`NAT Debug - Submitted Chars: [${submittedChars.map(c => `'${c}'`).join(', ')}], Correct Chars: [${correctChars.map(c => `'${c}'`).join(', ')}]`);
          console.log(`NAT Debug - Character Comparison Result: ${isCorrect}`);
          // Add detailed character code logging
          console.log(`NAT Debug - Submitted Char Codes: [${submittedAnswerString.split('').map(c => c.charCodeAt(0)).join(', ')}]`);
          console.log(`NAT Debug - Correct Char Codes: [${correctAnswerString.split('').map(c => c.charCodeAt(0)).join(', ')}]`);
        } else if (question.type === 'msq') {
          // For MSQ, submittedAnswer.answer should be a comma-separated string of selected options (e.g., 'A,B')
          const submittedOptions = submittedAnswer.answer.split(',').map(opt => opt.trim()).filter(opt => opt !== '').sort();
          // Assuming correctAnswer for MSQ is an array of strings like ['A', 'B']
          const correctOptions = question.correctAnswer.map(correctOptLetter => {
            const optionIndex = correctOptLetter.charCodeAt(0) - 'A'.charCodeAt(0);
            const option = question.options[optionIndex];
            return option ? option.text.trim() : '';
          }).filter(opt => opt !== '').sort();
          // Compare the sorted arrays
          isCorrect = JSON.stringify(submittedOptions) === JSON.stringify(correctOptions);
        }

        // Log submitted answer and correct answer for debugging
        console.log(`Question ID: ${submittedAnswer.questionId}, Type: ${question.type}`);
        console.log('Submitted Answer:', submittedAnswer.answer);
        console.log('Correct Answer:', question.correctAnswer);
        console.log('Is Correct:', isCorrect);

        if (isCorrect) {
          score += question.mark || 1;
        }
      }
      return { questionId: submittedAnswer.questionId, submittedAnswer: submittedAnswer.answer, isCorrect };
    });

    // Here you would typically save the submission to a database
    // For example, create a new Submission model instance
    // const newSubmission = new Submission({
    //   student: studentId,
    //   test: testId,
    //   score: score,
    //   answers: results,
    //   submittedAt: new Date(),
    // });
    // await newSubmission.save();

    // Here you would typically save the submission to a database
    // For example, create a new Submission model instance
    const newSubmission = new Submission({
      student: studentId,
      test: testId,
      score: score,
      answers: results,
      submittedAt: new Date(),
    });
    await newSubmission.save();

    res.status(200).json({ message: 'Test submitted successfully!', score, results });
  } catch (error: any) {
    console.error('Error submitting test:', error);
    res.status(500).json({ message: 'Server error during test submission', error: error.message });
  }
};

export const scheduleTest = async (req: AuthRequest, res: Response) => {
  try {
    console.log("Received scheduleTest request body:", req.body);
    const {
      department,
      testTitle,
      subjectName,
      duration,
      startTime,
      endTime,
      totalMarks,
      numberOfQuestions
    } = req.body;

    const user = req.user as IUser;
    console.log("Authenticated user:", user);

    let questionsData: any[] = [];

    // Parse `questions` field: comes as JSON string if sent via multipart/form-data
    if (typeof req.body.questions === 'string') {
      questionsData = JSON.parse(req.body.questions);
    } else {
      questionsData = req.body.questions;
    }
    console.log("Parsed questionsData:", questionsData);

    // Attach image path (if any) and transform options
    const processedQuestions = questionsData.map((q: any, index: number) => {
      let imagePath: string | undefined;
      let uploadedFile;

      if (req.files && Array.isArray(req.files)) {
        const fileKey = `questionImage-${index}`;
        uploadedFile = req.files.find((f: any) => f.fieldname === fileKey);
      }

      if (uploadedFile) {
        // If file is uploaded via multer (diskStorage), use its path
        imagePath = `/uploads/questions/${uploadedFile.filename}`;
        console.log("Uploaded file data (multer):", { filename: uploadedFile.filename, path: uploadedFile.path });
      } else if (q.imagePreview && typeof q.imagePreview === 'string' && q.imagePreview.startsWith('data:')) {
        // If image is sent as base64 string in imagePreview
        try {
          const base64Data = q.imagePreview.split(';base64,').pop();
          const mimeType = q.imagePreview.substring(q.imagePreview.indexOf(':') + 1, q.imagePreview.indexOf(';'));
          const ext = mimeType.split('/')[1];
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const filename = `questionImage-${uniqueSuffix}.${ext}`;
          const uploadDir = path.join(__dirname, '..', 'uploads', 'questions');
          const filePath = path.join(uploadDir, filename);

          console.log(`Attempting to save base64 image:`);
          console.log(`  Mime Type: ${mimeType}`);
          console.log(`  Extension: ${ext}`);
          console.log(`  Filename: ${filename}`);
          console.log(`  Upload Directory: ${uploadDir}`);
          console.log(`  File Path: ${filePath}`);
          console.log(`  Base64 Data Length: ${base64Data ? base64Data.length : 'null'}`);

          // Ensure directory exists
          if (!fs.existsSync(uploadDir)) {
            console.log(`Creating upload directory: ${uploadDir}`);
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
          imagePath = `/uploads/questions/${filename}`;
          console.log("Base64 image saved successfully to:", imagePath);
        } catch (error) {
          console.error("Error saving base64 image:", error);
        }
      }
      // Transform options to array of objects as per schema
      let options = [];
      if (q.type === 'mcq' || q.type === 'msq') {
        if (Array.isArray(q.options)) {
          options = q.options.map((opt: any, i: number) => ({
            text: typeof opt === 'string' ? opt : (opt?.text || ''),
            isCorrect: (q.type === 'mcq' && q.correctAnswerMCQ === String.fromCharCode(65 + i)) ||
                       (q.type === 'msq' && Array.isArray(q.correctAnswerMSQ) && q.correctAnswerMSQ.includes(String.fromCharCode(65 + i)))
          }));
        }
      } else if (q.type === 'numerical' || q.type === 'nat') {
        options = []; // Numerical and NAT questions do not have options
      }
      // Remove id field if present
      const { id, ...rest } = q;
      return {
        ...rest,
        options,
        questionImage: imagePath,
        correctAnswer: q.type === 'mcq' ? [q.correctAnswerMCQ] : (q.type === 'msq' ? q.correctAnswerMSQ : [q.correctAnswerNAT]),
      };
    });
    console.log("Processed questions for DB:", processedQuestions);
    processedQuestions.forEach((q, index) => {
      if (q.questionImage) {
        console.log(`Pre-save Question ${index} image path:`, q.questionImage);
      } else {
        console.log(`Pre-save Question ${index} has no image.`);
      }
    });

    const newTest = new Test({
      department,
      testTitle,
      subjectName,
      duration,
      startTime,
      endTime,
      totalMarks,
      numberOfQuestions,
      questions: processedQuestions,
      createdBy: user._id,
    });

    await newTest.save();
    console.log("Test saved to DB:", newTest);
    newTest.questions.forEach((q, index) => {
      if (q.questionImage) {
        console.log(`Question ${index} image saved with path:`, q.questionImage);
      } else {
        console.log(`Question ${index} has no image.`);
      }
    });

    res.status(201).json({ message: 'Test scheduled successfully', test: newTest });
  } catch (error: any) {
    console.error('Error scheduling test:', error);
    res.status(500).json({ message: 'Server error during test scheduling', error: error.message });
  }
};
