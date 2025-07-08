'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface TestDetails {
  _id: string;
  title: string;
  duration: number; // in minutes
  marks: number;
  questionImages?: string[]; // Array of URLs to question images
  // Add other relevant test details if needed
}

interface Answer {
  questionIndex: number;
  selectedOption: string; // For MCQs, or the typed answer for NAT
}

interface TestAttempt {
  _id: string;
  test: TestDetails; // Populated test details
  answers: Answer[];
  startTime: string;
  status: 'inprogress' | 'completed';
  // Add other attempt details if needed
}

const TakeTestPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({}); 
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAttemptDetails = useCallback(async () => {
    if (!testId) return;
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/attempts/start/${testId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start or load test attempt.');
      }

      const data = await response.json();
      setAttempt(data.attempt);
      
      // Initialize selectedAnswers from existing attempt answers
      const initialAnswers: Record<number, string> = {};
      data.attempt.answers.forEach((ans: Answer) => {
        initialAnswers[ans.questionIndex] = ans.selectedOption;
      });
      setSelectedAnswers(initialAnswers);

      // Initialize timer
      const testStartTime = new Date(data.attempt.startTime).getTime();
      const testDurationSeconds = data.attempt.test.duration * 60;
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - testStartTime) / 1000);
      const remaining = testDurationSeconds - elapsedSeconds;
      setTimeLeft(remaining > 0 ? remaining : 0);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error('Error loading test attempt:', err);
    } finally {
      setIsLoading(false);
    }
  }, [testId, router]);

  useEffect(() => {
    loadAttemptDetails();
  }, [loadAttemptDetails]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && attempt && attempt.status === 'inprogress') {
        // Auto-submit when time is up
        handleSubmitTest(true); // Pass true for auto-submission
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime !== null && prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, attempt]); // Added attempt to dependency array for handleSubmitTest

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const navigateQuestion = (direction: 'next' | 'prev') => {
    if (!attempt || !attempt.test.questionImages) return;
    const numQuestions = attempt.test.questionImages.length;
    setCurrentQuestionIndex(prev => {
      if (direction === 'next') {
        return prev < numQuestions - 1 ? prev + 1 : prev;
      }
      return prev > 0 ? prev - 1 : prev;
    });
  };

  const goToQuestion = (index: number) => {
    if (!attempt || !attempt.test.questionImages || index < 0 || index >= attempt.test.questionImages.length) return;
    setCurrentQuestionIndex(index);
  }

  const handleSubmitTest = async (autoSubmit: boolean = false) => {
    if (!attempt || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    const token = localStorage.getItem('token');

    const answersToSubmit: Answer[] = Object.entries(selectedAnswers).map(([qIndex, option]) => ({
      questionIndex: parseInt(qIndex, 10),
      selectedOption: option,
    }));

    try {
      const response = await fetch(`/api/attempts/submit/${attempt._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: answersToSubmit }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit test.');
      }
      // const result = await response.json();
      alert(autoSubmit ? 'Time is up! Your test has been submitted automatically.' : 'Test submitted successfully!');
      router.push(`/student/dashboard`); // Redirect to dashboard or a result summary page

    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
      console.error('Error submitting test:', err);
      if (autoSubmit) {
        // If auto-submit fails, still try to navigate away or inform user
        router.push(`/student/dashboard`); 
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-6"></div>
        <p className="text-xl font-semibold text-gray-700">Loading test environment...</p>
        <p className="text-gray-500">Please wait while we prepare your test.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Test</h2>
        <p className="text-red-600 mb-6 max-w-md">{error}</p>
        <button 
          onClick={() => router.push('/student/dashboard')}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!attempt || !attempt.test.questionImages || attempt.test.questionImages.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-4 text-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-yellow-700 mb-2">Test Questions Not Available</h2>
        <p className="text-yellow-600 mb-6 max-w-md">
          The questions for this test could not be loaded. This might be due to a processing error with the question paper. 
          Please contact your teacher or administrator.
        </p>
        <button 
          onClick={() => router.push('/student/dashboard')}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '00:00:00';
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const currentQuestionImageUrl = attempt.test.questionImages[currentQuestionIndex];
  const totalQuestions = attempt.test.questionImages.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold truncate max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl" title={attempt.test.title}>{attempt.test.title}</h1>
          <div className={`text-lg sm:text-xl font-semibold px-3 py-1 rounded-md ${timeLeft !== null && timeLeft <= 300 ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`}>
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto p-2 sm:p-4 md:p-6 flex flex-col lg:flex-row gap-4">
        {/* Question Display Area */}
        <div className="lg:flex-grow bg-white p-4 sm:p-6 rounded-xl shadow-xl flex flex-col items-center justify-center overflow-auto">
          {currentQuestionImageUrl ? (
            <Image 
                src={currentQuestionImageUrl} 
                alt={`Question ${currentQuestionIndex + 1}`} 
                width={800} 
                height={1000} // Adjust height as needed, or use layout='responsive'
                objectFit="contain" // 'contain' is good for images you want to see fully
                priority={true} // Prioritize loading current question image
            />
          ) : (
            <p className="text-gray-500">Question image not available.</p>
          )}
        </div>

        {/* Sidebar/Panel for Navigation and Answering */}
        <aside className="lg:w-80 xl:w-96 bg-white p-4 sm:p-6 rounded-xl shadow-xl flex flex-col space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Question {currentQuestionIndex + 1} of {totalQuestions}</h3>
            {/* Answer Input - This needs to be adapted for MCQ/NAT */}
            {/* For simplicity, using a text input. For MCQs, you'd use radio buttons */}
            <label htmlFor="answerInput" className="block text-sm font-medium text-gray-700 mb-1">Your Answer:</label>
            <input 
              id="answerInput"
              type="text" 
              value={selectedAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
              placeholder="Type your answer or option (A, B, C, D)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {/* TODO: Add MCQ options if applicable based on question type */}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-2">
            <button 
              onClick={() => navigateQuestion('prev')}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
              Previous
            </button>
            <button 
              onClick={() => navigateQuestion('next')}
              disabled={currentQuestionIndex === totalQuestions - 1 || isSubmitting}
              className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
              Next
            </button>
          </div>
          
          {/* Question Palette */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Question Palette:</h4>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-5 gap-2">
              {attempt.test.questionImages.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => goToQuestion(index)}
                  disabled={isSubmitting}
                  className={`w-full aspect-square rounded-md text-sm font-medium flex items-center justify-center transition-all duration-150 
                    ${currentQuestionIndex === index ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-1' : 
                     selectedAnswers[index] ? 'bg-green-500 text-white hover:bg-green-600' : 
                     'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                     disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <button 
              onClick={() => handleSubmitTest(false)}
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-wait transition duration-150 ease-in-out"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : 'Submit Test'}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default TakeTestPage;