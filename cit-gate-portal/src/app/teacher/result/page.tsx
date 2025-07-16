'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface ITest {
  _id: string;
  testTitle: string;
  department: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  numberOfQuestions: number;
  duration: number;
  createdBy: string;
}

interface IStudentAttempt {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    department: string;
    regno: string;
    createdAt: string;
  };
  score: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
  submittedAt: string;
  timeTaken: number;
  status: 'inprogress' | 'completed' | 'aborted';
  percentage: number;
  isPassed: boolean;
  answers: Array<{
    questionId: string;
    submittedAnswer: string;
    isCorrect: boolean;
    status: 'answered' | 'not answered';
  }>;
  attemptNumber: number;
  ipAddress: string;
  userAgent: string;
  isAutoSubmitted: boolean;
  warningCount: number;
  metadata: {
    browserInfo: string;
    screenResolution: string;
    timezone: string;
  };
}

const TeacherResultsPage: React.FC = () => {
  const router = useRouter();
  const [tests, setTests] = useState<ITest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ITest | null>(null);
  const [attempts, setAttempts] = useState<IStudentAttempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<IStudentAttempt[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'department' | 'name' | 'time' | 'regno'>('score');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'doughnut'>('bar');

  // Fetch tests directly
  const fetchTests = useCallback(async () => {
    setIsLoadingTests(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tests/teacher', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch tests');
      }
      
      const teacherTests: ITest[] = await response.json();
      setTests(teacherTests);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingTests(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const fetchAttemptsForTest = async (testId: string) => {
    setSelectedTest(tests.find(t => t._id === testId) || null);
    setIsLoadingAttempts(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tests/${testId}/submissions`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch attempts');
      }
      
      const data: IStudentAttempt[] = await response.json();
      setAttempts(data);
      setFilteredAttempts(data);
    } catch (err: any) {
      setError(err.message);
      setAttempts([]);
      setFilteredAttempts([]);
    } finally {
      setIsLoadingAttempts(false);
    }
  };

  // Filter and sort attempts
  useEffect(() => {
    let filtered = [...attempts];
    
    // Apply department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(attempt => 
        attempt.student.department === filterDepartment
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'department':
          return a.student.department.localeCompare(b.student.department);
        case 'name':
          return a.student.name.localeCompare(b.student.name);
        case 'time':
          return (a.timeTaken || 0) - (b.timeTaken || 0);
        case 'regno':
          return a.student.regno.localeCompare(b.student.regno);
        default:
          return b.score - a.score;
      }
    });
    
    setFilteredAttempts(filtered);
  }, [attempts, sortBy, filterDepartment]);

  // Get unique departments
  const departments = [...new Set(attempts.map(attempt => attempt.student.department))];

  const calculateStats = () => {
    if (!filteredAttempts.length) return null;
    
    const completedAttempts = filteredAttempts.filter(a => a.status === 'completed');
    const scores = completedAttempts.map(a => a.score);
    const totalMarks = selectedTest?.totalMarks || 0;
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    // Fix pass rate calculation - use percentage or score comparison
    const passRate = completedAttempts.filter(a => {
      const percentage = (a.score / a.totalMarks) * 100;
      return percentage >= 50; // 50% is passing
    }).length / completedAttempts.length * 100;
    
    // Time statistics - handle zero/undefined values
    const validTimes = completedAttempts.map(a => a.timeTaken).filter(t => t && t > 0);
    const avgTime = validTimes.length > 0 ? validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length : 0;
    const maxTime = validTimes.length > 0 ? Math.max(...validTimes) : 0;
    const minTime = validTimes.length > 0 ? Math.min(...validTimes) : 0;
    
    return {
      totalAttempts: filteredAttempts.length,
      completedAttempts: completedAttempts.length,
      average: average,
      highest,
      lowest,
      passRate,
      totalMarks,
      avgTime: avgTime,
      maxTime: maxTime,
      minTime: minTime,
      avgTimePerQuestion: selectedTest && avgTime > 0 ? (avgTime / selectedTest.numberOfQuestions) : 0
    };
  };

  const getScoreDistribution = () => {
    if (!filteredAttempts.length) return [];
    
    const totalMarks = selectedTest?.totalMarks || 100;
    const ranges = [
      { label: '0-20%', min: 0, max: totalMarks * 0.2, count: 0, color: '#ef4444' },
      { label: '21-40%', min: totalMarks * 0.2, max: totalMarks * 0.4, count: 0, color: '#f97316' },
      { label: '41-60%', min: totalMarks * 0.4, max: totalMarks * 0.6, count: 0, color: '#eab308' },
      { label: '61-80%', min: totalMarks * 0.6, max: totalMarks * 0.8, count: 0, color: '#22c55e' },
      { label: '81-100%', min: totalMarks * 0.8, max: totalMarks, count: 0, color: '#10b981' }
    ];
    
    filteredAttempts.forEach(attempt => {
      ranges.forEach(range => {
        if (attempt.score >= range.min && attempt.score <= range.max) {
          range.count++;
        }
      });
    });
    
    return ranges;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === 0) return 'No time data';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const calculateTimePerQuestion = (timeTaken: number, numberOfQuestions: number) => {
    if (!timeTaken || timeTaken === 0 || !numberOfQuestions) return 'No time data';
    return formatDuration(Math.floor(timeTaken / numberOfQuestions));
  };

  const calculateSpeed = (timeTaken: number, numberOfQuestions: number) => {
    if (!timeTaken || timeTaken === 0 || !numberOfQuestions) return 'No time data';
    const questionsPerMinute = numberOfQuestions / (timeTaken / 60);
    return questionsPerMinute.toFixed(1) + ' q/min';
  };

  // Check if student passed based on percentage
  const checkPassStatus = (score: number, totalMarks: number) => {
    const percentage = (score / totalMarks) * 100;
    return percentage >= 50;
  };

  // Calculate standard deviation
  const calculateStandardDeviation = (scores: number[]): number => {
    if (scores.length === 0) return 0;
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    return Math.sqrt(variance);
  };

  // Enhanced Excel download with comprehensive data
  const downloadExcel = () => {
    if (!selectedTest || !filteredAttempts.length) return;
    
    const analysisData = filteredAttempts.map((attempt, index) => {
      const answeredQuestions = attempt.answers.filter(a => a.status === 'answered').length;
      const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
      const wrongAnswers = answeredQuestions - correctAnswers;
      const unansweredQuestions = selectedTest.numberOfQuestions - answeredQuestions;
      const timePerQuestion = calculateTimePerQuestion(attempt.timeTaken, selectedTest.numberOfQuestions);
      const speed = calculateSpeed(attempt.timeTaken, selectedTest.numberOfQuestions);
      const percentage = (attempt.score / attempt.totalMarks) * 100;
      const isPassed = checkPassStatus(attempt.score, attempt.totalMarks);
      
      return {
        // Ranking and Basic Info
        'Rank': index + 1,
        'Student Name': attempt.student.name,
        'Registration Number': attempt.student.regno,
        'Email': attempt.student.email,
        'Department': attempt.student.department,
        'Student ID': attempt.student._id,
        'Account Created': formatDate(attempt.student.createdAt),
        
        // Test Performance
        'Score': attempt.score,
        'Total Marks': attempt.totalMarks,
        'Percentage': percentage.toFixed(2) + '%',
        'Pass/Fail': isPassed ? 'PASS' : 'FAIL',
        
        // Question-wise Analysis
        'Total Questions': selectedTest.numberOfQuestions,
        'Answered Questions': answeredQuestions,
        'Correct Answers': correctAnswers,
        'Wrong Answers': wrongAnswers,
        'Unanswered Questions': unansweredQuestions,
        'Accuracy Rate': answeredQuestions > 0 ? ((correctAnswers / answeredQuestions) * 100).toFixed(2) + '%' : '0%',
        'Completion Rate': `${((answeredQuestions / selectedTest.numberOfQuestions) * 100).toFixed(2)}%`,
        
        // Time Analysis
        'Total Time Taken': formatDuration(attempt.timeTaken),
        'Time in Seconds': attempt.timeTaken || 0,
        'Time in Minutes': attempt.timeTaken ? (attempt.timeTaken / 60).toFixed(2) : '0',
        'Average Time Per Question': timePerQuestion,
        'Speed': speed,
        
        // Submission Details
        'Test Status': attempt.status.toUpperCase(),
        'Test Started': formatDate(attempt.startTime),
        'Test Ended': formatDate(attempt.endTime),
        'Submitted At': formatDate(attempt.submittedAt),
        'Attempt Number': attempt.attemptNumber,
        'Auto Submitted': attempt.isAutoSubmitted ? 'Yes' : 'No',
        'Warning Count': attempt.warningCount,
        
        // Technical & Security Info
        'IP Address': attempt.ipAddress,
        'User Agent': attempt.userAgent,
        'Browser Info': attempt.metadata.browserInfo,
        'Screen Resolution': attempt.metadata.screenResolution,
        'Timezone': attempt.metadata.timezone
      };
    });
    
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(analysisData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Student Results');
    
    const fileName = `${selectedTest.testTitle}_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Pie Chart Component
  const PieChart = ({ data }: { data: any[] }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) return <div className="text-center text-gray-400">No data to display</div>;
    
    let cumulativePercentage = 0;
    
    return (
      <div className="flex items-center justify-center">
        <svg width="300" height="300" className="mr-8">
          {data.map((item, index) => {
            const percentage = (item.count / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const x1 = 150 + 100 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 150 + 100 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 150 + 100 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 150 + 100 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            const pathData = item.count > 0 ? `M 150 150 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z` : '';
            
            cumulativePercentage += percentage;
            
            return item.count > 0 ? (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="#1e293b"
                strokeWidth="2"
                className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
              />
            ) : null;
          })}
        </svg>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2 shadow-sm"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-300">
                {item.label}: {item.count} ({((item.count / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Doughnut Chart Component
  const DoughnutChart = ({ data }: { data: any[] }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) return <div className="text-center text-gray-400">No data to display</div>;
    
    let cumulativePercentage = 0;
    
    return (
      <div className="flex items-center justify-center">
        <svg width="300" height="300" className="mr-8">
          {data.map((item, index) => {
            const percentage = (item.count / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const x1 = 150 + 100 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 150 + 100 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 150 + 100 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 150 + 100 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const x3 = 150 + 60 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y3 = 150 + 60 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x4 = 150 + 60 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y4 = 150 + 60 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            const pathData = item.count > 0 ? `M ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x4} ${y4} A 60 60 0 ${largeArcFlag} 0 ${x3} ${y3} Z` : '';
            
            cumulativePercentage += percentage;
            
            return item.count > 0 ? (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="#1e293b"
                strokeWidth="2"
                className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
              />
            ) : null;
          })}
          <text x="150" y="150" textAnchor="middle" className="text-lg font-bold fill-white">
            {total}
          </text>
          <text x="150" y="165" textAnchor="middle" className="text-sm fill-gray-300">
            Total
          </text>
        </svg>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2 shadow-sm"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-300">
                {item.label}: {item.count} ({((item.count / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const stats = calculateStats();
  const distribution = getScoreDistribution();

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .results-container {
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

        .results-content {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
        }

        .glass-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 2rem;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(59, 130, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 24px 24px 0 0;
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

        .filter-control {
          background: rgba(30, 41, 59, 0.9);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .filter-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .download-btn {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }

        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
        }

        .chart-type-selector {
          display: flex;
          gap: 0.5rem;
          background: rgba(30, 41, 59, 0.9);
          padding: 0.25rem;
          border-radius: 8px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .chart-type-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .chart-type-btn.active {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: white;
        }

        .chart-type-btn:hover {
          color: white;
        }

        .performance-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 20px 20px 0 0;
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .test-card {
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

        .test-card.selected {
          background: rgba(59, 130, 246, 0.15);
          border-color: #3b82f6;
          box-shadow: 
            0 25px 50px rgba(59, 130, 246, 0.3),
            0 0 0 1px rgba(59, 130, 246, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .test-card.selected::before {
          transform: scaleX(1);
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

        .chart-container {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 2rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .chart-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 24px 24px 0 0;
        }

        .chart-bar {
          border-radius: 8px 8px 0 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .chart-bar::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: rotate(45deg);
          animation: chart-shine 3s infinite;
        }

        @keyframes chart-shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .chart-bar:hover {
          transform: scaleY(1.05);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .chart-area {
          height: 220px;
          max-height: 220px;
          overflow: hidden;
        }

        .table-container {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .table-header {
          background: rgba(51, 65, 85, 0.6);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.3);
          padding: 1.5rem;
          position: relative;
        }

        .table-row {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(51, 65, 85, 0.3);
          transition: all 0.3s ease;
        }

        .table-row:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .rank-badge {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .rank-badge.rank-1 {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
        }

        .rank-badge.rank-2 {
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
          box-shadow: 0 6px 16px rgba(107, 114, 128, 0.4);
        }

        .rank-badge.rank-3 {
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          box-shadow: 0 6px 16px rgba(251, 146, 60, 0.4);
        }

        .avatar-container {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .progress-bar {
          background: rgba(51, 65, 85, 0.5);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border-radius: 8px;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        .progress-fill::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: rotate(45deg);
          animation: progress-shine 2s infinite;
        }

        @keyframes progress-shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .progress-fill.fail {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          position: relative;
          overflow: hidden;
        }

        .status-badge.success {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .status-badge.warning {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .status-badge.error {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(59, 130, 246, 0.3);
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .floating-orbs {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%);
          animation: float 8s ease-in-out infinite;
          filter: blur(1px);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }

        .orb:nth-child(1) { width: 80px; height: 80px; left: 10%; top: 20%; animation-delay: 0s; }
        .orb:nth-child(2) { width: 60px; height: 60px; left: 80%; top: 60%; animation-delay: 2s; }
        .orb:nth-child(3) { width: 100px; height: 100px; left: 60%; top: 10%; animation-delay: 4s; }
        .orb:nth-child(4) { width: 40px; height: 40px; left: 20%; top: 70%; animation-delay: 1s; }
        .orb:nth-child(5) { width: 70px; height: 70px; left: 90%; top: 30%; animation-delay: 3s; }

        .error-container {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-left: 4px solid #ef4444;
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          color: #fca5a5;
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.2);
        }

        .time-analysis-card {
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
        }

        .time-analysis-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border-radius: 20px 20px 0 0;
        }

        .time-metric {
          color: #f59e0b;
        }

        @media (max-width: 1024px) {
          .results-container { padding: 1.5rem 1rem; }
          .glass-card { padding: 1.5rem; }
          .main-title { font-size: 2.5rem; }
          .performance-metrics { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
        }

        @media (max-width: 768px) {
          .main-title { font-size: 2rem; }
          .subtitle { font-size: 1.125rem; }
          .performance-metrics { grid-template-columns: 1fr; }
          .chart-container { padding: 1.5rem; }
        }
      `}</style>

      <div className="results-container">
        <div className="animated-background"></div>
        
        <div className="floating-orbs">
          <div className="orb"></div>
          <div className="orb"></div>
          <div className="orb"></div>
          <div className="orb"></div>
          <div className="orb"></div>
        </div>
        
        <div className="results-content">
          <header className="text-center mb-10">
            <div className="welcome-badge">
              <div className="badge-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="badge-text">Analytics Dashboard</span>
            </div>
            
            <h1 className="main-title">Test Results Dashboard</h1>
            <p className="subtitle">Comprehensive analytics and insights for your scheduled tests</p>
          </header>

          {error && (
            <div className="error-container max-w-4xl mx-auto mb-8">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Error occurred</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <section className="mb-12">
            <div className="glass-card max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="card-icon-container w-12 h-12 mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white">Select Test</h2>
                </div>
                <div className="flex items-center gap-4">
                  {selectedTest && (
                    <button onClick={downloadExcel} className="download-btn">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m6 8H2" />
                      </svg>
                      Download Excel
                    </button>
                  )}
                  <Link href="/teacher/dashboard" className="status-badge success">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                  </Link>
                </div>
              </div>
              
              {isLoadingTests ? (
                <div className="text-center py-12">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading your tests...</p>
                </div>
              ) : tests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="card-icon-container w-16 h-16 mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg">No tests found</p>
                  <p className="text-gray-500 text-sm mt-2">You haven't scheduled any tests yet</p>
                  <Link href="/teacher/schedule" className="status-badge success mt-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Schedule New Test
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tests.map(test => (
                    <div
                      key={test._id}
                      onClick={() => fetchAttemptsForTest(test._id)}
                      className={`test-card text-left ${selectedTest?._id === test._id ? 'selected' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="card-icon-container w-10 h-10">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        {selectedTest?._id === test._id && (
                          <span className="status-badge success">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Selected
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 truncate">{test.testTitle}</h3>
                      <div className="space-y-1 text-sm text-gray-300">
                        <p><span className="font-medium">Subject:</span> {test.subjectName}</p>
                        <p><span className="font-medium">Department:</span> {test.department}</p>
                        <p><span className="font-medium">Marks:</span> {test.totalMarks}</p>
                        <p><span className="font-medium">Questions:</span> {test.numberOfQuestions}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatDate(test.startTime)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {selectedTest && (
            <section>
              <div className="glass-card mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pb-6 border-b border-gray-600">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="card-icon-container w-12 h-12 mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Test Results</h2>
                      <p className="text-blue-400 font-semibold">{selectedTest.testTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Filter:</span>
                      <select 
                        value={filterDepartment} 
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="filter-control"
                      >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Sort:</span>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="filter-control"
                      >
                        <option value="score">Score</option>
                        <option value="department">Department</option>
                        <option value="name">Name</option>
                        <option value="time">Time</option>
                        <option value="regno">Registration</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => { setSelectedTest(null); setAttempts([]); }}
                      className="status-badge success"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Tests
                    </button>
                  </div>
                </div>

                {isLoadingAttempts ? (
                  <div className="text-center py-16">
                    <div className="loading-spinner mx-auto mb-6"></div>
                    <p className="text-gray-400 text-lg">Loading student results...</p>
                  </div>
                ) : filteredAttempts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="card-icon-container w-20 h-20 mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-xl">No submissions found</p>
                    <p className="text-gray-500 mt-2">
                      {filterDepartment !== 'all' ? `No submissions found for ${filterDepartment} department` : 'Students haven\'t completed this test or data is unavailable'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Enhanced Statistics Cards */}
                    {stats && (
                      <div className="performance-metrics">
                        <div className="metric-card">
                          <div className="flex items-center justify-between">
                            <div>
                
                                                            <div className="metric-value">{stats.totalAttempts}</div>
                              <div className="metric-label">Total Attempts</div>
                            </div>
                            <div className="card-icon-container w-12 h-12">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="metric-card">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="metric-value">{stats.average.toFixed(1)}</div>
                              <div className="metric-label">Average Score</div>
                              <div className="text-xs text-gray-500">out of {stats.totalMarks}</div>
                            </div>
                            <div className="card-icon-container w-12 h-12">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="metric-card">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="metric-value">{stats.highest}</div>
                              <div className="metric-label">Highest Score</div>
                              <div className="text-xs text-gray-500">out of {stats.totalMarks}</div>
                            </div>
                            <div className="card-icon-container w-12 h-12">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="metric-card">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="metric-value">{stats.passRate.toFixed(1)}%</div>
                              <div className="metric-label">Pass Rate</div>
                              <div className="text-xs text-gray-500">≥50% marks</div>
                            </div>
                            <div className="card-icon-container w-12 h-12">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Fixed Time Analysis Cards */}
                        <div className="time-analysis-card">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="metric-value time-metric">
                                {stats.avgTime > 0 ? formatDuration(stats.avgTime) : 'No time data'}
                              </div>
                              <div className="metric-label">Average Time</div>
                              <div className="text-xs text-gray-500">per test</div>
                            </div>
                            <div className="card-icon-container w-12 h-12">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="time-analysis-card">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="metric-value time-metric">
                                {stats.avgTimePerQuestion > 0 ? formatDuration(stats.avgTimePerQuestion) : 'No time data'}
                              </div>
                              <div className="metric-label">Avg Time/Question</div>
                              <div className="text-xs text-gray-500">per question</div>
                            </div>
                            <div className="card-icon-container w-12 h-12">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fixed Score Distribution Chart */}
                    <div className="chart-container">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center">
                          <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Score Distribution Analysis
                        </h3>
                        <div className="chart-type-selector">
                          <button 
                            onClick={() => setChartType('bar')}
                            className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                          >
                            Bar Chart
                          </button>
                          <button 
                            onClick={() => setChartType('pie')}
                            className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
                          >
                            Pie Chart
                          </button>
                          <button 
                            onClick={() => setChartType('doughnut')}
                            className={`chart-type-btn ${chartType === 'doughnut' ? 'active' : ''}`}
                          >
                            Doughnut
                          </button>
                        </div>
                      </div>
                      
                      {chartType === 'bar' ? (
                        <div className="chart-area">
                          <div className="flex items-end space-x-4 h-full">
                            {distribution.map((range, index) => {
                              const height = filteredAttempts.length > 0 ? (range.count / filteredAttempts.length) * 100 : 0;
                              return (
                                <div key={range.label} className="flex-1 flex flex-col items-center h-full">
                                  <div className="w-full bg-gray-700 rounded-t-lg overflow-hidden flex-1 flex items-end">
                                    <div 
                                      className="chart-bar w-full rounded-t-lg flex items-end justify-center pb-2 text-white font-bold text-sm transition-all duration-700"
                                      style={{ 
                                        height: `${height}%`,
                                        backgroundColor: range.color,
                                        boxShadow: `0 4px 20px ${range.color}40`,
                                        minHeight: range.count > 0 ? '20px' : '0px'
                                      }}
                                    >
                                      {range.count > 0 && range.count}
                                    </div>
                                  </div>
                                  <div className="mt-2 text-center">
                                    <p className="text-xs font-semibold text-gray-300">{range.label}</p>
                                    <p className="text-xs text-gray-500">{range.count} students</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : chartType === 'pie' ? (
                        <PieChart data={distribution} />
                      ) : (
                        <DoughnutChart data={distribution} />
                      )}
                    </div>

                    {/* Fixed Detailed Results Table */}
                    <div className="table-container">
                      <div className="table-header">
                        <h3 className="text-xl font-bold text-white flex items-center">
                          <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          Detailed Student Performance Analysis
                        </h3>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="text-sm text-gray-400">
                            Showing {filteredAttempts.length} of {attempts.length} students
                          </div>
                          {filterDepartment !== 'all' && (
                            <div className="status-badge warning">
                              Filtered by: {filterDepartment}
                            </div>
                          )}
                          <div className="text-sm text-gray-400">
                            Sorted by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Student Details</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Registration</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Department</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Performance</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Questions</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time Analysis</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAttempts.map((attempt, index) => {
                              const answeredQuestions = attempt.answers.filter(a => a.status === 'answered').length;
                              const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
                              const timePerQuestion = calculateTimePerQuestion(attempt.timeTaken, selectedTest.numberOfQuestions);
                              const speed = calculateSpeed(attempt.timeTaken, selectedTest.numberOfQuestions);
                              const percentage = (attempt.score / attempt.totalMarks) * 100;
                              const isPassed = checkPassStatus(attempt.score, attempt.totalMarks);
                              
                              return (
                                <tr key={attempt._id} className="table-row">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className={`rank-badge w-10 h-10 text-sm ${
                                        index === 0 ? 'rank-1' :
                                        index === 1 ? 'rank-2' :
                                        index === 2 ? 'rank-3' : ''
                                      }`}>
                                        {index + 1}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="avatar-container w-12 h-12 mr-3">
                                        <span className="text-white font-bold text-lg">
                                          {attempt.student.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold text-white">{attempt.student.name}</div>
                                        <div className="text-xs text-gray-400">{attempt.student.email}</div>
                                        <div className="text-xs text-gray-500">
                                          Joined: {formatDate(attempt.student.createdAt)}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <div className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                                      {attempt.student.regno}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <div className="flex items-center">
                                      <span className="status-badge success text-xs px-2 py-1">
                                        {attempt.student.department}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <div className="flex items-center mb-1">
                                        <span className={`text-xl font-bold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                                          {attempt.score}
                                        </span>
                                        <span className="text-sm text-gray-400 ml-2">/ {attempt.totalMarks}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {percentage.toFixed(1)}%
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center mb-2">
                                      <div className="progress-bar w-20 h-3 mr-3">
                                        <div 
                                          className={`progress-fill ${isPassed ? '' : 'fail'}`}
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                      <span className={`text-sm font-semibold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                                        {percentage.toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {isPassed ? 'PASSED' : 'FAILED'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-300">
                                    <div className="space-y-1">
                                      <div>Total: {selectedTest.numberOfQuestions}</div>
                                      <div>Answered: {answeredQuestions}</div>
                                      <div>Correct: {correctAnswers}</div>
                                      <div>Accuracy: {answeredQuestions > 0 ? ((correctAnswers / answeredQuestions) * 100).toFixed(1) : 0}%</div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <div className="space-y-1">
                                      <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {formatDuration(attempt.timeTaken)}
                                      </div>
                                      <div className="text-xstext-gray-300">
                                        Per Q: {timePerQuestion}
                                      </div>
                                      <div className="text-xs text-gray-300">
                                        Speed: {speed}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`status-badge ${
                                      attempt.status === 'completed' ? 'success' :
                                      attempt.status === 'inprogress' ? 'warning' :
                                      'error'
                                    }`}>
                                      {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                                    </span>
                                    {attempt.isAutoSubmitted && (
                                      <div className="text-xs text-yellow-400 mt-1">Auto-submitted</div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherResultsPage;

