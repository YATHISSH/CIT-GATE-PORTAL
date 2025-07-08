import mongoose, { Document, Schema } from 'mongoose';

// Interface for a single question option
export interface IOption {
  text: string;
  isCorrect: boolean;
}

// Schema for a single question option
const OptionSchema: Schema = new Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

// Interface for a single question
export interface IQuestion extends Document {
  questionText: string;
  questionImage?: string;
  options: IOption[];
  correctAnswer: string[];
  mark: number;
  type: 'mcq' | 'numerical' | 'msq' | 'nat';
}

// Schema for a single question
const QuestionSchema: Schema = new Schema({
  questionText: { type: String, required: true },
  questionImage: { type: String },
  options: [OptionSchema],
  correctAnswer: [{ type: String, required: true }],
  mark: { type: Number, required: true },
  type: { type: String, enum: ['mcq', 'numerical', 'msq', 'nat'], required: true },
});

// Main test interface
export interface ITest extends Document {
  department: string;
  testTitle: string;
  subjectName: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  totalMarks: number;
  numberOfQuestions: number;
  questions: IQuestion[];
  createdBy: Schema.Types.ObjectId;
}

// Main test schema
const TestSchema: Schema = new Schema({
  department: { type: String, required: true },
  testTitle: { type: String, required: true },
  subjectName: { type: String, required: true },
  duration: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  numberOfQuestions: { type: Number, required: true },
  questions: [QuestionSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<ITest>('ScheduledTest', TestSchema, 'scheduledtests');
