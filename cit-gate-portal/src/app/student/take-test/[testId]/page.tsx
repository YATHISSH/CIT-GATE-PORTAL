'use client';

import React, { useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import QuestionCard from '@/app/components/QuestionCard';
import useBlockShortcuts from '@/app/components/blockShortcuts';
import { useTest } from '@/app/components/hooks/useTest';
import { useTimer } from '@/app/components/hooks/useTimer';
import { useFullscreenWarning } from '@/app/components/hooks/useFullscreenWarning';
import Notification from '@/app/components/Notification';
import SuccessAnimation from '@/app/components/SuccessAnimation';

// --- Icon Component for the Locked Screen ---
// A self-contained SVG for easy integration.
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-24 w-24 text-red-500" // A large, intimidating icon
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
      clipRule="evenodd"
    />
  </svg>
);


export default function QuestionPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = React.use(params);
  const { test, loading, error, selectedOptions, handleOptionChange, submitTest, isSubmitted, isSubmitting } = useTest(testId);
  const { timeRemaining, testStatus, formatTime } = useTimer(test, submitTest);
  const { isLocked, enterFullscreen } = useFullscreenWarning(testId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Hook to block keyboard shortcuts like Ctrl+C, Alt+Tab, etc.
  useBlockShortcuts();

  // --- Enhanced "Test Locked" Screen ---
  // This block renders when the useFullscreenWarning hook sets isLocked to true.
  if (isLocked) {
    return (
      // A dark, atmospheric background with a "spotlight" effect to create a serious tone.
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.3),rgba(255,255,255,0))]">
        <div className="flex flex-col items-center text-center">
          {/* A pulsing animation draws attention to the lock icon. */}
          <div className="animate-pulse">
            <LockIcon />
          </div>

          {/* Typography is enhanced with text shadows for better contrast and impact. */}
          <h1 className="mt-6 text-5xl font-extrabold text-white [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
            Test Locked
          </h1>
          <p className="mt-4 max-w-lg text-lg text-red-500 italic ">
            Access to this test has been revoked due to a security violation, such as exiting fullscreen or switching tabs.
          </p>
          <div className="mt-8 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <p className="font-bold italic  text-green-700">
              Please inform your department coordinator — you can no longer proceed with the test.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Standard Loading and Error States ---
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading test...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-xl text-red-500">Error: {error}</div>;
  }

  if (!test) {
    return <div className="flex justify-center items-center h-screen text-xl">Test not found.</div>;
  }

  // --- Submission States ---
  if (isSubmitting) {
    return <div className="flex justify-center items-center h-screen text-xl">Submitting test...</div>;
  }

  if (isSubmitted) {
    return <SuccessAnimation />;
  }


  // --- Event Handlers for Navigation ---
  const handleNext = () => {
    if (!test) return;
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const onClear = () => {
    if (!test) return;
    const currentQuestionId = test.questions[currentQuestionIndex]._id;
    // You might want to dispatch an action here to clear the option
    handleOptionChange(currentQuestionId, '', ''); 
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNavigate = (index: number) => {
    setCurrentQuestionIndex(index);
  };
  // --- Main Test Interface ---
  return (
    <div className="flex flex-row h-screen bg-gray-50">
      <Sidebar
        questions={test.questions}
        selectedOptions={selectedOptions}
        currentQuestion={currentQuestionIndex}
        onNavigate={handleNavigate}
      />
      <div className="flex flex-col flex-1">
        {testStatus === 'active' ? (
          <QuestionCard
            question={test.questions[currentQuestionIndex]}
            onOptionChange={(value, text) => {
              const currentQuestion = test.questions[currentQuestionIndex];
              handleOptionChange(currentQuestion._id, value, text);
            }}
            currentIndex={currentQuestionIndex}
            onNext={handleNext}
            selectedOption={selectedOptions[test.questions[currentQuestionIndex]._id] || ''}
            onClear={onClear}
            onSubmit={submitTest}
            onPrev={handlePrev}
            totalQuestions={test.questions.length}
          />
        ) : (
          <div className="flex flex-1 justify-center items-center text-2xl text-gray-700">
            {testStatus === 'upcoming' ? 'The test has not started yet.' : 'The test has ended.'}
          </div>
        )}
      </div>
    </div>
  );
}
