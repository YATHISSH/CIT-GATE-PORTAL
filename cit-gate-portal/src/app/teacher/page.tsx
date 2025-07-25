'use client';

import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const router = useRouter();
  
  const cards = [
    {
      title: 'Schedule New Test',
      desc: 'Upload PDFs, set timing, assign to department',
      action: () => router.push('/teacher/schedule'),
      icon: (
        <svg className="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6m0 0l-2-2m2 2l2-2" />
        </svg>
      ),
    },
    {
      title: 'View Test Results',
      desc: 'Analyze performance by test & department',
      action: () => router.push('/teacher/result'),
      icon: (
        <svg className="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Scheduled Tests',
      desc: 'View and manage all your scheduled tests',
      action: () => router.push('/teacher/schedule/scheduledtests'),
      icon: (
        <svg className="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .dashboard-container {
          min-height: 100vh;
          background: #0f172a;
          background-image: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59, 130, 246, 0.3), rgba(15, 23, 42, 0));
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem;
        }

        .animated-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59, 130, 246, 0.3), rgba(15, 23, 42, 0));
          animation: pulse-bg 4s ease-in-out infinite;
        }

        @keyframes pulse-bg {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .dashboard-content {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 12px 24px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);
        }

        .badge-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .badge-text {
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .main-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
          font-size: 1.25rem;
          color: #cbd5e1;
          font-weight: 500;
          max-width: 600px;
          margin: 0 auto;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .dashboard-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(51, 65, 85, 0.6);
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .dashboard-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .dashboard-card:hover::before {
          transform: scaleX(1);
        }

        .dashboard-card:hover {
          transform: translateY(-8px);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(59, 130, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .card-icon-container {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .card-icon-container::before {
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

        .card-icon {
          width: 32px;
          height: 32px;
          color: white;
          position: relative;
          z-index: 2;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
          transition: color 0.3s ease;
        }

        .dashboard-card:hover .card-title {
          color: #60a5fa;
        }

        .card-description {
          font-size: 1rem;
          color: #94a3b8;
          line-height: 1.6;
          font-weight: 500;
        }

        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 3rem;
          padding: 2rem;
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(51, 65, 85, 0.6);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: #3b82f6;
          display: block;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1.5rem 1rem;
          }
          
          .main-title {
            font-size: 2.5rem;
          }
          
          .subtitle {
            font-size: 1.125rem;
          }
          
          .cards-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .dashboard-card {
            padding: 1.5rem;
          }
          
          .stats-bar {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 640px) {
          .main-title {
            font-size: 2rem;
          }
          
          .cards-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .card-icon-container {
            width: 56px;
            height: 56px;
          }
          
          .card-icon {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <div className="animated-background"></div>
        
        <div className="dashboard-content">
          {/* Header Section */}
          <div className="header-section">
            <div className="welcome-badge">
              <div className="badge-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="badge-text">Faculty Portal</span>
            </div>
            
            <h1 className="main-title">
              Welcome, Faculty Members
            </h1>
            <p className="subtitle">
              Manage Assessments, analyze student performance, and streamline your academic workflow
            </p>
          </div>

          {/* Cards Grid */}
          <div className="cards-grid">
            {cards.map((card, index) => (
              <button
                key={card.title}
                onClick={card.action}
                className="dashboard-card"
              >
                <div className="card-icon-container">
                  {card.icon}
                </div>
                <h2 className="card-title">{card.title}</h2>
                <p className="card-description">{card.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
