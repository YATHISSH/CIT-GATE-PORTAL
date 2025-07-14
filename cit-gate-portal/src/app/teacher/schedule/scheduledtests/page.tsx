'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Test {
  _id: string;
  testTitle: string;
  subjectName: string;
  department: string;
  startTime: string;
  endTime: string;
  duration: number;
  questions: any[];
}


  const departments = [
  "CSE - Computer Science and Engineering",
  "IT - Information Technology",
  "ECE - Electronics and Communication Engineering",
  "EEE - Electrical and Electronics Engineering",
  "MECH - Mechanical Engineering",
  "CIVIL - Civil Engineering",
  "BME - Biomedical Engineering",
  "MCT - Mechatronics Engineering",
  "AIML - Computer Science and Engineering (AI & ML)",
  "CS - Computer Science and Engineering (Cyber Security)",
  "AIDS - Artificial Intelligence and Data Science",
  "CSBS - Computer Science and Business Systems",
  "ECE-ACT - Electronics and Communication Engineering (Advanced Communication Technology)",
  "VLSI - Electronics Engineering (VLSI Design & Technology)"
];

export default function ScheduledTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please login again.');
          setLoading(false);
          return;
        }

        const response = await axios.get<Test[]>('http://localhost:5000/api/tests/scheduled', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params: {
            department: selectedDepartment,
          },
        });
        setTests(response.data);
      } catch (err) {
        setError('Failed to fetch tests. Please try again later.');
        console.error('Error fetching tests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [selectedDepartment]);

  if (loading) {
    return (
      <>
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          
          .loading-container {
            min-height: 100vh;
            background: #0f172a;
            background-image: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59, 130, 246, 0.3), rgba(15, 23, 42, 0));
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .loading-content {
            text-center;
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 3rem;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          
          .loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(59, 130, 246, 0.3);
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem auto;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .loading-text {
            color: white;
            font-size: 1.5rem;
            font-weight: 600;
          }
        `}</style>
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading scheduled tests...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          
          .error-container {
            min-height: 100vh;
            background: #0f172a;
            background-image: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(239, 68, 68, 0.3), rgba(15, 23, 42, 0));
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .error-content {
            text-center;
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 3rem;
            border: 1px solid rgba(239, 68, 68, 0.3);
            max-width: 500px;
          }
          
          .error-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 1.5rem auto;
            background: rgba(239, 68, 68, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .error-text {
            color: #fca5a5;
            font-size: 1.25rem;
            font-weight: 600;
          }
        `}</style>
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">
              <svg width="30" height="30" fill="none" stroke="#fca5a5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="error-text">Error: {error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .tests-container {
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

        .tests-content {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-title {
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

        .page-subtitle {
          font-size: 1.25rem;
          color: #cbd5e1;
          font-weight: 500;
          max-width: 600px;
          margin: 0 auto;
        }

        .filter-section {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .filter-label {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-select {
          width: 100%;
          max-width: 400px;
          padding: 16px 20px;
          background: rgba(51, 65, 85, 0.5);
          border: 2px solid #475569;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 16px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
          background: rgba(51, 65, 85, 0.8);
        }

        .filter-select option {
          background: #334155;
          color: white;
          padding: 12px;
        }

        .tests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .test-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(51, 65, 85, 0.6);
          padding: 2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .test-card::before {
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

        .test-card:hover::before {
          transform: scaleX(1);
        }

        .test-card:hover {
          transform: translateY(-8px);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(59, 130, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .test-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }

        .test-details {
          margin-bottom: 2rem;
        }

        .test-detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .detail-icon {
          width: 18px;
          height: 18px;
          margin-right: 12px;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .detail-label {
          color: #94a3b8;
          font-weight: 500;
          margin-right: 8px;
          min-width: 80px;
        }

        .detail-value {
          color: #e2e8f0;
          font-weight: 600;
          flex: 1;
        }

        .test-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(51, 65, 85, 0.6);
        }

        .edit-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: white;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .edit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #2563eb 0%, #5b21b6 100%);
        }

        .edit-icon {
          width: 16px;
          height: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(51, 65, 85, 0.6);
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem auto;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .empty-description {
          font-size: 1rem;
          color: #94a3b8;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .tests-container {
            padding: 1.5rem 1rem;
          }
          
          .page-title {
            font-size: 2.5rem;
          }
          
          .tests-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .test-card {
            padding: 1.5rem;
          }
          
          .filter-section {
            padding: 1.5rem;
          }
        }

        @media (max-width: 640px) {
          .page-title {
            font-size: 2rem;
          }
          
          .test-card {
            padding: 1.25rem;
          }
          
          .test-actions {
            flex-direction: column;
            align-items: stretch;
          }
          
          .edit-button {
            justify-content: center;
          }
        }
      `}</style>

      <div className="tests-container">
        <div className="animated-background"></div>
        
        <div className="tests-content">
          {/* Header Section */}
          <div className="header-section">
            <h1 className="page-title">Scheduled Tests</h1>
            <p className="page-subtitle">
              Manage and monitor all scheduled Tests across departments
            </p>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <label htmlFor="department-select" className="filter-label">
              Filter by Department
            </label>
            <select
              id="department-select"
              className="filter-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Tests Grid */}
          {tests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="40" height="40" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="empty-title">No Tests Scheduled</h3>
              <p className="empty-description">
                {selectedDepartment 
                  ? `No tests found for ${selectedDepartment} department`
                  : 'No tests have been scheduled yet. Create your first test to get started.'
                }
              </p>
            </div>
          ) : (
            <div className="tests-grid">
              {tests.map((test) => (
                <div key={test._id} className="test-card">
                  <h2 className="test-title">{test.testTitle}</h2>
                  
                  <div className="test-details">
                    <div className="test-detail-item">
                      <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="detail-label">Subject:</span>
                      <span className="detail-value">{test.subjectName}</span>
                    </div>
                    
                    <div className="test-detail-item">
                      <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="detail-label">Department:</span>
                      <span className="detail-value">{test.department}</span>
                    </div>
                    
                    <div className="test-detail-item">
                      <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2z" />
                      </svg>
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{new Date(test.startTime).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="test-detail-item">
                      <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">
                        {new Date(test.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(test.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="test-detail-item">
                      <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{test.duration} minutes</span>
                    </div>
                    
                    <div className="test-detail-item">
                      <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="detail-label">Questions:</span>
                      <span className="detail-value">{test.questions.length}</span>
                    </div>
                  </div>

                  <div className="test-actions">
                    <a href={`/teacher/tests/${test._id}/edit`} className="edit-button">
                      <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Test
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
