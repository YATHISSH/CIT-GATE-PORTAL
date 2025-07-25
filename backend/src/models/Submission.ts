import mongoose, { Schema } from 'mongoose';
import { ISubmissionDocument } from '../types/submission';

const SubmissionSchema = new Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 0,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      submittedAnswer: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
        default: false,
      },
      status: {
        type: String,
        enum: ['answered', 'not answered'],
        default: 'not answered',
      },
    },
  ],
  status: {
    type: String,
    enum: ['inprogress', 'completed', 'aborted'],
    default: 'completed',
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  timeTaken: {
    type: Number, // in seconds
    required: true,
    default: 0,
  },
  duration: {
    type: Number, // in minutes (allowed duration)
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  isPassed: {
    type: Boolean,
    default: false,
  },
  attemptNumber: {
    type: Number,
    default: 1,
  },
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  isAutoSubmitted: {
    type: Boolean,
    default: false,
  },
  warningCount: {
    type: Number,
    default: 0,
  },
  metadata: {
    browserInfo: {
      type: String,
      default: '',
    },
    screenResolution: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: '',
    },
  },
}, {
  timestamps: true,
});

// Add indexes for better performance
SubmissionSchema.index({ student: 1, test: 1 });
SubmissionSchema.index({ test: 1, score: -1 });
SubmissionSchema.index({ student: 1, submittedAt: -1 });
SubmissionSchema.index({ status: 1 });

// Pre-save middleware to calculate derived fields
SubmissionSchema.pre('save', function(next) {
  console.log('Pre-save middleware triggered');
  
  // Calculate percentage
  if (this.totalMarks > 0) {
    this.percentage = (this.score / this.totalMarks) * 100;
    this.isPassed = this.percentage >= 50;
  }
  
  // Calculate time taken if not provided or is 0
  if ((!this.timeTaken || this.timeTaken === 0) && this.startTime && this.endTime) {
    const timeDiff = this.endTime.getTime() - this.startTime.getTime();
    this.timeTaken = Math.floor(timeDiff / 1000);
    console.log('Calculated timeTaken in pre-save:', this.timeTaken);
  }
  
  // If still no endTime, use submittedAt
  if ((!this.timeTaken || this.timeTaken === 0) && this.startTime && this.submittedAt) {
    const timeDiff = this.submittedAt.getTime() - this.startTime.getTime();
    this.timeTaken = Math.floor(timeDiff / 1000);
    console.log('Calculated timeTaken using submittedAt:', this.timeTaken);
  }
  
  next();
});

// Instance method to get submission summary
SubmissionSchema.methods.getSummary = function() {
  return {
    score: this.score,
    totalMarks: this.totalMarks,
    percentage: this.percentage,
    isPassed: this.isPassed,
    timeTaken: this.timeTaken,
    status: this.status,
    submittedAt: this.submittedAt,
    answeredQuestions: this.answers.filter((a: any) => a.status === 'answered').length,
    correctAnswers: this.answers.filter((a: any) => a.isCorrect).length,
    totalQuestions: this.answers.length
  };
};

export default mongoose.model<ISubmissionDocument>('Submission', SubmissionSchema);
