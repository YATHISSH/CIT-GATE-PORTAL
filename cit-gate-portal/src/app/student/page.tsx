'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const StudentPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the student dashboard
    router.replace('/student/dashboard');
  }, [router]);

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .redirect-container {
          min-height: 100vh;
          background: #0f172a;
          background-image: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(34, 197, 94, 0.3), rgba(15, 23, 42, 0));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .animated-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(34, 197, 94, 0.3), rgba(15, 23, 42, 0));
          animation: pulse-bg 4s ease-in-out infinite;
        }

        @keyframes pulse-bg {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .redirect-content {
          position: relative;
          z-index: 10;
          text-align: center;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem 2rem;
          border: 1px solid rgba(34, 197, 94, 0.3);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(148, 163, 184, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          max-width: 500px;
          margin: 0 auto;
        }

        .logo-container {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem auto;
          box-shadow: 0 20px 40px rgba(34, 197, 94, 0.3);
          position: relative;
          overflow: hidden;
        }

        .logo-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transform: rotate(45deg);
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          color: white;
          position: relative;
          z-index: 2;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(34, 197, 94, 0.3);
          border-top: 4px solid #22c55e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .redirect-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .redirect-message {
          font-size: 1.125rem;
          color: #cbd5e1;
          font-weight: 500;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(51, 65, 85, 0.5);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border-radius: 10px;
          animation: loadProgress 2s ease-in-out infinite;
        }

        @keyframes loadProgress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }

        .student-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .status-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 1.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: dotPulse 1.5s ease-in-out infinite;
        }

        .status-dot:nth-child(2) {
          animation-delay: 0.3s;
        }

        .status-dot:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes dotPulse {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @media (max-width: 640px) {
          .redirect-content {
            margin: 1rem;
            padding: 2rem 1.5rem;
          }
          
          .redirect-title {
            font-size: 1.5rem;
          }
          
          .redirect-message {
            font-size: 1rem;
          }
          
          .logo-container {
            width: 64px;
            height: 64px;
          }
          
          .logo-icon {
            width: 32px;
            height: 32px;
          }
          
          .loading-spinner {
            width: 48px;
            height: 48px;
          }
        }
      `}</style>

      <div className="redirect-container">
        <div className="animated-background"></div>
        
        <div className="redirect-content">
          {/* Student Badge */}
          <div className="student-badge">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Student Portal
          </div>

          {/* Logo */}
          <div className="logo-container">
            <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          {/* Loading Spinner */}
          <div className="loading-spinner"></div>

          {/* Title */}
          <h1 className="redirect-title">Welcome Back!</h1>

          {/* Message */}
          <p className="redirect-message">
            Setting up your personalized dashboard and loading your test schedule...
          </p>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>

          {/* Status Dots */}
          <div className="status-dots">
            <div className="status-dot"></div>
            <div className="status-dot"></div>
            <div className="status-dot"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentPage;
