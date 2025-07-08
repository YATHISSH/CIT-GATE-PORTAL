import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
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
      },
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Submission', SubmissionSchema);