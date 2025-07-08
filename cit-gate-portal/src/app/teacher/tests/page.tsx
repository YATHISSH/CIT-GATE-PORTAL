'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Test {
  _id: string;
  title: string;
  department: string;
  subject: string;
  scheduledDate: string;
  startTime: string;
  duration: number;
  totalMarks: number;
  testKey: string;
}

const TestListPage = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTests = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/tests', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch tests');
        }

        const data = await response.json();
        setTests(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading tests...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h2 className="text-4xl font-extrabold text-purple-700 text-center mb-10 tracking-tight">
          📚 Select a Test to Add Questions
        </h2>

        {tests.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No tests available. Please schedule a new test first.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tests.map((test) => (
              <div
                key={test._id}
                className="bg-gray-50 p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{test.title}</h3>
                  <p className="text-sm text-gray-600 mb-1"><strong>Department:</strong> {test.department}</p>
                  <p className="text-sm text-gray-600 mb-1"><strong>Subject:</strong> {test.subject}</p>
                  <p className="text-sm text-gray-600 mb-1"><strong>Date:</strong> {new Date(test.scheduledDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mb-4"><strong>Duration:</strong> {test.duration} minutes</p>
                </div>
                <button
                  onClick={() => router.push(`/teacher/tests/${test._id}/add-questions`)}
                  className="mt-4 w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                >
                  Add Questions
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestListPage;

