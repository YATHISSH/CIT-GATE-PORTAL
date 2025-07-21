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

// Icon Component for the Locked Screen
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-24 w-24 text-red-500"
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
  const { test, loading, error, selectedOptions, handleOptionChange, submitTest, isSubmitted, isSubmitting, submissionResult } = useTest(testId);
  const { timeRemaining, testStatus, formatTime, isCriticalTime } = useTimer(test, submitTest);
  const { isLocked, enterFullscreen } = useFullscreenWarning(testId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useBlockShortcuts();

  // Debug logging
  console.log('Current selectedOptions in QuestionPage:', selectedOptions);
  console.log('Current question index:', currentQuestionIndex);
  console.log('Test data:', test);
  console.log('Is critical time:', isCriticalTime);

  // Enhanced "Test Locked" Screen
  if (isLocked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.3),rgba(255,255,255,0))]">
        <div className="flex flex-col items-center text-center">
          <div className="animate-pulse">
            <LockIcon />
          </div>
          <h1 className="mt-6 text-5xl font-extrabold text-white [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
            Test Locked
          </h1>
          <p className="mt-4 max-w-lg text-lg text-red-500 italic">
            Access to this test has been revoked due to a security violation, such as exiting fullscreen or switching tabs.
          </p>
          <div className="mt-8 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <p className="font-bold italic text-green-700">
              Please inform your department coordinator — you can no longer proceed with the test.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (!test || !test.questions || test.questions.length === 0) return;
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const onClear = () => {
    if (!test || !test.questions || test.questions.length === 0) return;
    const currentQuestion = test.questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    console.log('Clearing answer for question:', currentQuestion._id);
    handleOptionChange(currentQuestion._id, '', '');
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNavigate = (index: number) => {
    if (!test || !test.questions || index < 0 || index >= test.questions.length) return;
    setCurrentQuestionIndex(index);
  };

  // Enhanced Loading States
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-white font-semibold">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="text-center max-w-md p-8 bg-slate-800 rounded-2xl border border-red-500/20">
          <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Test</h3>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-white">Test not found.</p>
        </div>
      </div>
    );
  }

  if (!test.questions || test.questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-red-400">No questions found in this test.</p>
        </div>
      </div>
    );
  }

  if (currentQuestionIndex >= test.questions.length) {
    setCurrentQuestionIndex(0);
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-white">Loading question...</p>
        </div>
      </div>
    );
  }

  // Submission States
  if (isSubmitting) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-white font-semibold">Submitting test...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-900">
        <SuccessAnimation />
        {submissionResult && (
          <div className="mt-8 p-6 bg-green-900/20 border border-green-500/30 text-green-400 rounded-2xl max-w-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-lg text-white">Test Submitted Successfully!</p>
                <p className="text-sm text-green-400 mt-1">
                  Score: {submissionResult.score} | 
                  Total Questions: {submissionResult.results?.length || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Get current question safely
  const currentQuestion = test.questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-red-400">Question not found.</p>
        </div>
      </div>
    );
  }

  // Main Test Interface with Fixed Layout
  return (
    <>
      <style jsx>{`
        .test-layout {
          display: flex;
          height: 100vh;
          background: rgba(15, 23, 42, 0.98);
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .timer-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: rgba(30, 41, 59, 0.98);
          border-bottom: 1px solid rgba(34, 197, 94, 0.2);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        /* Critical timer bar styling */
        .timer-bar.critical {
          background: rgba(153, 27, 27, 0.98);
          border-bottom: 1px solid rgba(239, 68, 68, 0.5);
          animation: criticalFlash 1s ease-in-out infinite alternate;
        }
        
        @keyframes criticalFlash {
          0% {
            background: rgba(153, 27, 27, 0.98);
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
          }
          100% {
            background: rgba(185, 28, 28, 0.98);
            box-shadow: 0 4px 30px rgba(239, 68, 68, 0.6);
          }
        }
        
        .timer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1400px;
          padding: 0 2rem;
        }
        
        .test-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(34, 197, 94, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        
        /* Critical live indicator */
        .live-indicator.critical {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          animation: criticalPulse 0.8s ease-in-out infinite;
        }
        
        @keyframes criticalPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        
        .live-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        /* Critical live dot */
        .live-dot.critical {
          background: #ef4444;
          animation: criticalDotPulse 0.5s ease-in-out infinite;
        }
        
        @keyframes criticalDotPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.2);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .timer-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(51, 65, 85, 0.3);
          padding: 1rem 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        
        /* Critical timer display */
        .timer-display.critical {
          background: rgba(153, 27, 27, 0.4);
          border: 2px solid rgba(239, 68, 68, 0.8);
          animation: criticalTimerPulse 1s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }
        
        @keyframes criticalTimerPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
          }
        }
        
        .timer-text {
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .timer-upcoming {
          color: #fbbf24;
        }
        
        .timer-active {
          color: #22c55e;
        }
        
        /* Critical timer text */
        .timer-active.critical {
          color: #ef4444;
          font-weight: 700;
          text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
          animation: criticalTextBlink 0.7s ease-in-out infinite;
        }
        
        @keyframes criticalTextBlink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .timer-ended {
          color: #ef4444;
        }
        
        .test-content {
          display: flex;
          width: 100%;
          margin-top: 80px;
          height: calc(100vh - 80px);
        }
        
        .sidebar-wrapper {
          width: 25%;
          min-width: 320px;
          background: rgba(30, 41, 59, 0.98);
        }
        
        .question-wrapper {
          flex: 1;
          background: rgba(15, 23, 42, 0.98);
          padding: 1rem;
          overflow: hidden;
        }
        
        .waiting-state {
          display: flex;
          flex: 1;
          justify-content: center;
          align-items: center;
          text-align: center;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 16px;
          border: 1px solid rgba(34, 197, 94, 0.2);
          margin: 1rem;
        }
        
        .waiting-content {
          padding: 3rem;
          max-width: 500px;
        }
        
        .waiting-icon {
          width: 80px;
          height: 80px;
          background: rgba(51, 65, 85, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
        }
        
        .waiting-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
        }
        
        .waiting-description {
          font-size: 1.1rem;
          color: #94a3b8;
          line-height: 1.6;
        }
        
        @media (max-width: 1024px) {
          .sidebar-wrapper {
            width: 30%;
            min-width: 280px;
          }
          
          .timer-content {
            padding: 0 1rem;
          }
        }
        
        @media (max-width: 768px) {
          .timer-bar {
            height: 60px;
          }
          
          .test-content {
            margin-top: 60px;
            height: calc(100vh - 60px);
            flex-direction: column;
          }
          
          .sidebar-wrapper {
            width: 100%;
            height: 40vh;
            min-width: auto;
          }
          
          .question-wrapper {
            height: 60vh;
            padding: 0.5rem;
          }
          
          .timer-content {
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
          }
          
          .test-info {
            order: 2;
          }
          
          .timer-display {
            order: 1;
            padding: 0.5rem 1rem;
          }
        }
        
        @media (max-width: 640px) {
          .timer-content {
            padding: 0.5rem;
          }
          
          .timer-display {
            padding: 0.5rem 0.75rem;
            font-size: 0.9rem;
          }
          
          .live-indicator {
            padding: 0.25rem 0.75rem;
            font-size: 0.8rem;
          }
        }
      `}</style>

      <div className="test-layout">
        {/* Fixed Timer Bar with Critical State */}
        <div className={`timer-bar ${isCriticalTime ? 'critical' : ''}`}>
          <div className="timer-content">
            <div className="test-info">
              <div className={`live-indicator ${isCriticalTime ? 'critical' : ''}`}>
                <div className={`live-dot ${isCriticalTime ? 'critical' : ''}`}></div>
                <span style={{ 
  color: isCriticalTime ? '#000000' : '#22c55e', // Black text when critical, green when normal
  backgroundColor: isCriticalTime ? '#ef4444' : '', // Red background when critical
  fontSize: '0.9rem', 
  fontWeight: '600',
  padding: isCriticalTime ? '0.25rem 0.5rem' : '0', // Add padding when critical for better readability
  borderRadius: isCriticalTime ? '4px' : '0' // Rounded corners when critical
}}>
  {isCriticalTime ? 'TEST - TIME RUNNING OUT!' : 'LIVE TEST'}
</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                {test.testTitle} • {test.subjectName}
              </div>
            </div>
            <div className={`timer-display ${isCriticalTime ? 'critical' : ''}`}>
              {testStatus === 'upcoming' && (
                <div className="timer-text timer-upcoming">
                  <svg style={{ display: 'inline', marginRight: '8px', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Starts in: {formatTime(timeRemaining)}
                </div>
              )}
              {testStatus === 'active' && (
                <div className={`timer-text timer-active ${isCriticalTime ? 'critical' : ''}`} style={{
  color: isCriticalTime ? '#000000' : '#22c55e',
  backgroundColor: isCriticalTime ? '#ef4444' : '#1e293b', // Solid background instead of transparent
  padding: isCriticalTime ? '0.375rem 0.75rem' : '0.5rem 0.75rem',
  borderRadius: '6px',
  fontWeight: isCriticalTime ? '700' : '600'
}}>
  <svg 
    style={{ 
      display: 'inline', 
      marginRight: '8px', 
      width: '20px', 
      height: '20px',
      filter: isCriticalTime ? 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.8))' : 'none'
    }} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  {isCriticalTime ? '⚠️ HURRY UP! ' : 'Time: '}{formatTime(timeRemaining)}
</div>

              )}
              {testStatus === 'ended' && (
                <div className="timer-text timer-ended">
                  <svg style={{ display: 'inline', marginRight: '8px', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Test Ended
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="test-content">
          <div className="sidebar-wrapper">
            <Sidebar
              questions={test.questions}
              selectedOptions={selectedOptions}
              currentQuestion={currentQuestionIndex}
              onNavigate={handleNavigate}
            />
          </div>

          <div className="question-wrapper">
            {testStatus === 'active' ? (
              <QuestionCard
                question={currentQuestion}
                onOptionChange={(value, text) => {
                  console.log('QuestionCard onOptionChange called:', { questionId: currentQuestion._id, value, text });
                  handleOptionChange(currentQuestion._id, value, text);
                }}
                currentIndex={currentQuestionIndex}
                onNext={handleNext}
                selectedOption={selectedOptions[currentQuestion._id] || ''}
                onClear={onClear}
                onSubmit={submitTest}
                onPrev={handlePrev}
                totalQuestions={test.questions.length}
              />
            ) : (
              <div className="waiting-state">
                <div className="waiting-content">
                  <div className="waiting-icon">
                    <svg style={{ width: '40px', height: '40px', color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="waiting-title">
                    {testStatus === 'upcoming' ? 'Test Not Started' : 'Test Ended'}
                  </h3>
                  <p className="waiting-description">
                    {testStatus === 'upcoming' 
                      ? 'Please wait for the test to begin. You will be able to start answering questions when the timer reaches zero.'
                      : 'The test has concluded. Thank you for your participation. Your responses have been recorded.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
