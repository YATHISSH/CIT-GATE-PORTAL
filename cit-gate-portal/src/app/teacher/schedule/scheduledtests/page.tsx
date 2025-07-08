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
  'CSE',
  'IT',
  'AIDS',
  'AIML',
  'CS',
  'CSBS',
  'ECE',
  'EEE',
  'MCT',
  'MECH'
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
    return <div className="text-center py-10">Loading scheduled tests...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Scheduled Tests</h1>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-sm">
        <label htmlFor="department-select" className="block text-lg font-semibold text-gray-800 mb-2">Filter by Department:</label>
        <select
          id="department-select"
         className="mt-1 block w-full pl-4 pr-12 py-3 text-base text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-md transition duration-150 ease-in-out appearance-none bg-gray-100"
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

        {tests.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            No tests have been scheduled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tests.map((test) => (
              <div key={test._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{test.testTitle}</h2>
                <p className="text-gray-600 mb-1"><strong>Subject:</strong> {test.subjectName}</p>
                <p className="text-gray-600 mb-1"><strong>Department:</strong> {test.department}</p>
                <p className="text-gray-600 mb-1"><strong>Date:</strong> {new Date(test.startTime).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-1"><strong>Start Time:</strong> {new Date(test.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-gray-600 mb-1"><strong>End Time:</strong> {new Date(test.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-gray-600 mb-4"><strong>Duration:</strong> {test.duration} minutes</p>
                <p className="text-gray-600"><strong>Questions:</strong> {test.questions.length}</p>
                <div className="mt-4 text-right">
                  <a href={`/teacher/tests/${test._id}/edit`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Edit
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

  );
}