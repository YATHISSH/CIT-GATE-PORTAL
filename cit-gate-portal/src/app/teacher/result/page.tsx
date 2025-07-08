'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ITest {
  _id: string;
  title: string;
  department: string;
  subject: string;
  startTime: string;
  endTime: string;
  marks: number;
  scheduledBy: string; // Teacher ID
}

interface IStudentAttempt {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    department: string;
    registrationNumber?: string;
  };
  score: number;
  totalMarks: number;
  startTime: string;
  endTime?: string;
  timeTaken?: number; // in seconds
  status: 'inprogress' | 'completed' | 'aborted';
}

const TeacherResultsPage: React.FC = () => {
  const router = useRouter();
  const [tests, setTests] = useState<ITest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ITest | null>(null);
  const [attempts, setAttempts] = useState<IStudentAttempt[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.role !== 'teacher') {
        router.push('/login');
        return;
      }
      setTeacherId(parsedUser._id);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      router.push('/login');
    }
  }, [router]);

  const fetchTests = useCallback(async () => {
    if (!teacherId) return;
    setIsLoadingTests(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/tests', { // Fetches all tests; teacher's tests are filtered client-side
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch tests');
      }
      const allTests: ITest[] = await response.json();
      const teacherTests = allTests.filter(test => test.scheduledBy === teacherId);
      setTests(teacherTests);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching tests:', err);
    } finally {
      setIsLoadingTests(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const fetchAttemptsForTest = async (testId: string) => {
    setSelectedTest(tests.find(t => t._id === testId) || null);
    setIsLoadingAttempts(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/attempts/test/${testId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch attempts');
      }
      const data: IStudentAttempt[] = await response.json();
      setAttempts(data);
    } catch (err: any) {
      setError(err.message);
      console.error(`Error fetching attempts for test ${testId}:`, err);
      setAttempts([]);
    } finally {
      setIsLoadingAttempts(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (!teacherId) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Loading user data...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-5xl">View Test Results</h1>
        <p className="mt-3 text-xl text-gray-600 max-w-2xl mx-auto text-center">
          Select a test to view student attempts and scores.
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-3xl mx-auto mb-6">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Test Selection Section */}
      <section className="mb-12 bg-white p-6 rounded-xl shadow-xl max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Select a Test</h2>
        {isLoadingTests ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">You have not scheduled any tests yet. <Link href="/teacher/schedule" className="text-indigo-600 hover:underline">Schedule a new test</Link>.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map(test => (
              <button
                key={test._id}
                onClick={() => fetchAttemptsForTest(test._id)}
                className={`p-4 rounded-lg text-left transition-all duration-200 ease-in-out 
                            ${selectedTest?._id === test._id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-gray-50 hover:bg-indigo-100 text-gray-700 border border-gray-200 hover:shadow-md'}`}
              >
                <h3 className={`font-semibold text-lg truncate ${selectedTest?._id === test._id ? 'text-white' : 'text-indigo-700'}`}>{test.title}</h3>
                <p className="text-sm"><span className="font-medium">Subject:</span> {test.subject}</p>
                <p className="text-sm"><span className="font-medium">Department:</span> {test.department}</p>
                <p className="text-xs mt-1">Scheduled: {formatDate(test.startTime)}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Attempts Display Section */}
      {selectedTest && (
        <section className="bg-white p-6 rounded-xl shadow-xl max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700">Results for: <span className="text-indigo-600">{selectedTest.title}</span></h2>
            <button 
                onClick={() => { setSelectedTest(null); setAttempts([]); }}
                className="mt-3 sm:mt-0 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
                Clear Selection / View Other Tests
            </button>
          </div>

          {isLoadingAttempts ? (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-3 text-gray-600">Loading student attempts...</p>
            </div>
          ) : attempts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No students have completed this test yet, or data is unavailable.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. No.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attempts.map(attempt => (
                    <tr key={attempt._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attempt.student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attempt.student.registrationNumber || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attempt.student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`font-semibold ${attempt.score >= selectedTest.marks / 2 ? 'text-green-600' : 'text-red-600'}`}>
                            {attempt.score}
                        </span> / {attempt.totalMarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDuration(attempt.timeTaken)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(attempt.endTime)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${attempt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                         attempt.status === 'inprogress' ? 'bg-yellow-100 text-yellow-800' : 
                                         'bg-red-100 text-red-800'}`}>
                          {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default TeacherResultsPage;