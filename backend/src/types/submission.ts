import { Document, Types } from 'mongoose';

export interface ISubmissionAnswer {
  questionId: Types.ObjectId;
  submittedAnswer: string;
  isCorrect: boolean;
  status: 'answered' | 'not answered';
}

export interface ISubmissionMetadata {
  browserInfo: string;
  screenResolution: string;
  timezone: string;
}

export interface ISubmission {
  student: Types.ObjectId;
  test: Types.ObjectId;
  score: number;
  totalMarks: number;
  answers: ISubmissionAnswer[];
  status: 'inprogress' | 'completed' | 'aborted';
  startTime: Date;
  endTime: Date;
  submittedAt: Date;
  timeTaken: number;
  duration: number;
  percentage: number;
  isPassed: boolean;
  attemptNumber: number;
  ipAddress: string;
  userAgent: string;
  isAutoSubmitted: boolean;
  warningCount: number;
  metadata: ISubmissionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmissionMethods {
  getSummary(): {
    score: number;
    totalMarks: number;
    percentage: number;
    isPassed: boolean;
    timeTaken: number;
    status: string;
    submittedAt: Date;
    answeredQuestions: number;
    correctAnswers: number;
    totalQuestions: number;
  };
}

export interface ISubmissionDocument extends ISubmission, ISubmissionMethods, Document {}
