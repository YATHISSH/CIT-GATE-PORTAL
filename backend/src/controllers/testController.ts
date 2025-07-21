import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Test from '../models/Test';
import Submission from '../models/Submission';
import { IUser } from '../models/User';

// Cloudinary utilities are now used for image uploads
import { uploadImageToCloudinary, uploadBase64ToCloudinary, CloudinaryUploadResult } from '../utils/uploadToCloudinary';

// Your existing functions - unchanged
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
      endTime: { $gte: now }
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
    const { testId, answers, startTime, isAutoSubmitted = false } = req.body;
    const studentId = req.user?._id;

    console.log('Submit test request body:', { testId, startTime, isAutoSubmitted, answersCount: answers?.length });

    if (!testId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Test ID and answers are required.' });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    const submittedMap = new Map(answers.map(ans => [ans.questionId, ans.answer]));

    let score = 0;
    const results = test.questions.map((question) => {
      const submittedAnswer = submittedMap.get(question._id.toString());
      
      const hasAnswer = submittedAnswer !== undefined && 
                       submittedAnswer !== null && 
                       submittedAnswer !== '' && 
                       submittedAnswer.toString().trim() !== '';
      
      const status = hasAnswer ? 'answered' : 'not answered';
      let isCorrect = false;

      if (hasAnswer && question) {
        const answerValue = submittedAnswer.toString().trim();
        
        if (question.type === 'mcq') {
          const correctOptionIndex = question.correctAnswer[0].charCodeAt(0) - 'A'.charCodeAt(0);
          const correctOptionText = question.options[correctOptionIndex]?.text;
          isCorrect = answerValue === correctOptionText?.trim();
        } 
        else if (question.type === 'numerical' || question.type === 'nat') {
          const correctAnswerString = String(question.correctAnswer[0]).trim();
          isCorrect = answerValue === correctAnswerString;
        } 
        else if (question.type === 'msq') {
          const submittedOptions = answerValue.split(',')
            .map((opt: string) => opt.trim())
            .filter((opt: string) => opt !== '')
            .sort();
          
          const correctOptions = question.correctAnswer.map(correctOptLetter => {
            const optionIndex = correctOptLetter.charCodeAt(0) - 'A'.charCodeAt(0);
            const option = question.options[optionIndex];
            return option ? option.text.trim() : '';
          }).filter(opt => opt !== '').sort();
          
          isCorrect = JSON.stringify(submittedOptions) === JSON.stringify(correctOptions);
        }

        if (isCorrect) {
          score += question.mark || 1;
        }
      }

      return { 
        questionId: question._id.toString(), 
        submittedAnswer: hasAnswer ? submittedAnswer : 'Not Answered', 
        isCorrect, 
        status 
      };
    });

    const submissionTime = new Date();
    let testStartTime: Date;
    
    if (startTime) {
      testStartTime = new Date(startTime);
    } else {
      testStartTime = new Date(submissionTime.getTime() - (test.duration * 60 * 1000));
    }
    
    const timeTakenSeconds = Math.floor((submissionTime.getTime() - testStartTime.getTime()) / 1000);
    
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const newSubmission = new Submission({
      student: studentId,
      test: testId,
      score: score,
      totalMarks: test.totalMarks,
      answers: results,
      status: 'completed',
      startTime: testStartTime,
      endTime: submissionTime,
      submittedAt: submissionTime,
      timeTaken: timeTakenSeconds,
      duration: test.duration,
      percentage: test.totalMarks > 0 ? (score / test.totalMarks) * 100 : 0,
      isPassed: test.totalMarks > 0 ? (score / test.totalMarks) >= 0.5 : false,
      ipAddress: ipAddress,
      userAgent: userAgent,
      isAutoSubmitted: isAutoSubmitted,
      attemptNumber: 1,
      warningCount: 0,
      metadata: {
        browserInfo: userAgent,
        screenResolution: req.body.screenResolution || '',
        timezone: req.body.timezone || ''
      }
    });
    
    await newSubmission.save();

    res.status(200).json({ 
      message: 'Test submitted successfully!', 
      score, 
      results,
      success: true,
      timeTaken: newSubmission.timeTaken,
      summary: newSubmission.getSummary()
    });
  } catch (error: any) {
    console.error('Error submitting test:', error);
    res.status(500).json({ 
      message: 'Server error during test submission', 
      error: error.message,
      success: false
    });
  }
};

// ===================================================================
// THIS IS THE CORRECTED FUNCTION
// ===================================================================
export const scheduleTest = async (req: AuthRequest, res: Response) => {
  try {
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

    let questionsData: any[] = [];

    if (typeof req.body.questions === 'string') {
      try {
        questionsData = JSON.parse(req.body.questions);
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid questions format' });
      }
    } else {
      questionsData = req.body.questions;
    }

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return res.status(400).json({ message: 'Questions data is required and must be an array' });
    }

    // Use Promise.all to handle asynchronous image uploads for all questions
    const processedQuestions = await Promise.all(
        questionsData.map(async (q: any, index: number) => {
            let cloudinaryUrl: string | undefined;

            // This block replaces the old fs/path logic with Cloudinary uploads
            try {
                // Handle file upload from multipart/form-data (if req.files exists)
                if (req.files && Array.isArray(req.files)) {
                    const fileKey = `questionImage-${index}`;
                    const uploadedFile = req.files.find((f: any) => f.fieldname === fileKey);
                    
                    if (uploadedFile?.buffer) {
                        console.log(`Uploading file buffer for question ${index + 1}...`);
                        const uploadResult = await uploadImageToCloudinary(uploadedFile.buffer);
                        if (uploadResult.success && uploadResult.url) {
                            cloudinaryUrl = uploadResult.url;
                        } else {
                            console.error(` File upload failed for question ${index + 1}:`, uploadResult.error);
                        }
                    }
                }

                // Handle base64 image data as a fallback
                if (!cloudinaryUrl && q.imagePreview?.startsWith('data:')) {
                    console.log(`Uploading base64 image for question ${index + 1}...`);
                    const uploadResult = await uploadBase64ToCloudinary(q.imagePreview);
                    if (uploadResult.success && uploadResult.url) {
                        cloudinaryUrl = uploadResult.url;
                    } else {
                        console.error(` Base64 upload failed for question ${index + 1}:`, uploadResult.error);
                    }
                }
            } catch (uploadError) {
                console.error(`Unexpected error during image upload for question ${index + 1}:`, uploadError);
            }
            
            // The rest of your question processing logic remains the same
            let options = [];
            if (q.type === 'mcq' || q.type === 'msq') {
                if (Array.isArray(q.options)) {
                    options = q.options.map((opt: any, i: number) => ({
                        text: typeof opt === 'string' ? opt : (opt?.text || ''),
                        isCorrect: (q.type === 'mcq' && q.correctAnswerMCQ === String.fromCharCode(65 + i)) ||
                                   (q.type === 'msq' && Array.isArray(q.correctAnswerMSQ) && 
                                    q.correctAnswerMSQ.includes(String.fromCharCode(65 + i)))
                    }));
                }
            } else if (q.type === 'numerical' || q.type === 'nat') {
                options = [];
            }
            
            const { id, ...rest } = q;
            let correctAnswer;
            
            if (q.type === 'mcq') {
                correctAnswer = [q.correctAnswerMCQ];
            } else if (q.type === 'msq') {
                correctAnswer = Array.isArray(q.correctAnswerMSQ) ? q.correctAnswerMSQ : [];
            } else if (q.type === 'numerical' || q.type === 'nat') {
                correctAnswer = [q.correctAnswerNAT];
            } else {
                correctAnswer = [];
            }
            
            return {
                ...rest,
                options,
                // Store the Cloudinary URL here
                questionImage: cloudinaryUrl,
                imageUrl: cloudinaryUrl, // Also store as imageUrl for frontend consistency
                correctAnswer,
            };
        })
    );

    if (!department || !testTitle || !subjectName || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Missing required fields: department, testTitle, subjectName, startTime, endTime' 
      });
    }

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

    res.status(201).json({ 
      message: 'Test scheduled successfully', 
      test: newTest,
      success: true 
    });
  } catch (error: any) {
    console.error('Error scheduling test:', error);
    res.status(500).json({ 
      message: 'Server error during test scheduling', 
      error: error.message,
      success: false
    });
  }
};
// ===================================================================

// All other functions remain exactly as you provided them
export const getTeacherTests = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?._id;
    
    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tests = await Test.find({ createdBy: teacherId })
      .sort({ startTime: -1 })
      .select('_id testTitle subjectName department startTime endTime totalMarks createdBy numberOfQuestions');

    const transformedTests = tests.map(test => ({
      _id: test._id,
      title: test.testTitle,
      testTitle: test.testTitle,
      department: test.department,
      subject: test.subjectName,
      subjectName: test.subjectName,
      startTime: test.startTime,
      endTime: test.endTime,
      marks: test.totalMarks,
      totalMarks: test.totalMarks,
      scheduledBy: test.createdBy,
      createdBy: test.createdBy,
      numberOfQuestions: test.numberOfQuestions
    }));

    res.status(200).json(transformedTests);
  } catch (error: any) {
    console.error('Error fetching teacher tests:', error);
    res.status(500).json({ message: 'Server error while fetching teacher tests', error: error.message });
  }
};

export const getTestSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;
    const teacherId = req.user?._id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const test = await Test.findOne({ _id: testId, createdBy: teacherId });
    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized' });
    }

    const submissions = await Submission.find({ test: testId })
      .populate({
        path: 'student',
        select: 'name email department regno createdAt',
        options: { strictPopulate: false }
      })
      .sort({ score: -1 })
      .select('student score totalMarks percentage timeTaken submittedAt startTime endTime status answers attemptNumber ipAddress userAgent isAutoSubmitted warningCount metadata isPassed');

    const transformedSubmissions = submissions
      .map(submission => {
        try {
          if (!submission.student || typeof submission.student === 'string') {
            return null;
          }
          
          const student = submission.student as any;
          
          let timeTaken = submission.timeTaken || 0;
          
          if (timeTaken === 0 && submission.startTime && submission.endTime) {
            const startTime = new Date(submission.startTime);
            const endTime = new Date(submission.endTime);
            timeTaken = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
          }
          
          if (timeTaken === 0 && submission.startTime && submission.submittedAt) {
            const startTime = new Date(submission.startTime);
            const endTime = new Date(submission.submittedAt);
            timeTaken = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
          }
          
          return {
            _id: submission._id,
            student: {
              _id: student._id,
              name: student.name,
              email: student.email,
              department: student.department,
              regno: student.regno,
              createdAt: student.createdAt
            },
            score: submission.score,
            totalMarks: submission.totalMarks,
            percentage: submission.percentage,
            isPassed: submission.isPassed,
            status: submission.status,
            submittedAt: submission.submittedAt,
            startTime: submission.startTime,
            endTime: submission.endTime,
            timeTaken: timeTaken,
            answers: submission.answers,
            attemptNumber: submission.attemptNumber,
            ipAddress: submission.ipAddress,
            userAgent: submission.userAgent,
            isAutoSubmitted: submission.isAutoSubmitted,
            warningCount: submission.warningCount,
            metadata: submission.metadata
          };
        } catch (itemError) {
          console.error('Error processing submission:', submission._id, itemError);
          return null;
        }
      })
      .filter(submission => submission !== null);

    res.status(200).json(transformedSubmissions);
  } catch (error: any) {
    console.error('Error fetching test submissions:', error);
    res.status(500).json({ message: 'Server error while fetching submissions', error: error.message });
  }
};

export const getTestAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;
    const teacherId = req.user?._id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const test = await Test.findOne({ _id: testId, createdBy: teacherId });
    if (!test) {
      return res.status(404).json({ message: 'Test not found or unauthorized' });
    }

    const submissions = await Submission.find({ test: testId, status: 'completed' });
    
    if (submissions.length === 0) {
      return res.status(200).json({
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        scoreDistribution: []
      });
    }

    const scores = submissions.map(s => s.score);
    const totalMarks = test.totalMarks;
    
    const totalSubmissions = submissions.length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passedCount = submissions.filter(s => s.percentage >= 50).length;
    const passRate = (passedCount / totalSubmissions) * 100;

    const ranges = [
      { label: '0-20%', min: 0, max: totalMarks * 0.2 },
      { label: '21-40%', min: totalMarks * 0.2, max: totalMarks * 0.4 },
      { label: '41-60%', min: totalMarks * 0.4, max: totalMarks * 0.6 },
      { label: '61-80%', min: totalMarks * 0.6, max: totalMarks * 0.8 },
      { label: '81-100%', min: totalMarks * 0.8, max: totalMarks }
    ];

    const scoreDistribution = ranges.map(range => ({
      ...range,
      count: submissions.filter(s => s.score >= range.min && s.score <= range.max).length
    }));

    res.status(200).json({
      totalSubmissions,
      averageScore,
      highestScore,
      lowestScore,
      passRate,
      scoreDistribution
    });
  } catch (error: any) {
    console.error('Error fetching test analytics:', error);
    res.status(500).json({ message: 'Server error while fetching analytics', error: error.message });
  }
};

export const getAllTests = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?._id;
    
    if (!userRole || !userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let query = {};
    
    if (userRole === 'teacher') {
      query = { createdBy: userId };
    } else if (userRole === 'student') {
      const department = req.query.department as string;
      if (department) {
        query = { department };
      }
    }

    const tests = await Test.find(query)
      .sort({ startTime: -1 })
      .select('_id testTitle subjectName department startTime endTime totalMarks createdBy numberOfQuestions');

    const transformedTests = tests.map(test => ({
      _id: test._id,
      title: test.testTitle,
      testTitle: test.testTitle,
      department: test.department,
      subject: test.subjectName,
      subjectName: test.subjectName,
      startTime: test.startTime,
      endTime: test.endTime,
      marks: test.totalMarks,
      totalMarks: test.totalMarks,
      scheduledBy: test.createdBy,
      createdBy: test.createdBy,
      numberOfQuestions: test.numberOfQuestions
    }));

    res.status(200).json(transformedTests);
  } catch (error: any) {
    console.error('Error fetching all tests:', error);
    res.status(500).json({ message: 'Server error while fetching tests', error: error.message });
  }
};
