
"use client";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Test {
    _id: string;
    testTitle: string;
    subjectName: string;
    startTime: string;
    endTime: string;
    department: string;
    duration?: string;
    questions: any[];
    totalMarks: number;
}

export default function Page() {
    const router = useRouter();
    const [scheduledTests, setScheduledTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
    const [takenTests, setTakenTests] = useState<string[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchScheduledTests = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/tests/scheduled', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setScheduledTests(data);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchScheduledTests();
    }, []);

    useEffect(() => {
        const storedTakenTests = localStorage.getItem('takenTests');
        if (storedTakenTests) {
            setTakenTests(JSON.parse(storedTakenTests));
        }
    }, []);

    const handleTakeTest = (testId: string) => {
        const updatedTakenTests = [...takenTests, testId];
        setTakenTests(updatedTakenTests);
        localStorage.setItem('takenTests', JSON.stringify(updatedTakenTests));
        // Instead of navigating directly to the test page
        // router.push(`/student/take-test/${testId}`);
        
        // Navigate to the instruction page first
        router.push(`/student/take-test/${testId}/instructions`);
    };

    const activeTests = scheduledTests.filter(test => {
        const testStartTime = new Date(test.startTime);
        const testEndTime = new Date(test.endTime);
        const now = currentTime;
        return now >= testStartTime && now <= testEndTime;
    });

    useEffect(() => {
        const upcoming = scheduledTests.filter(test => {
            const testStartTime = new Date(test.startTime);
            return testStartTime > currentTime;
        });
        setUpcomingTests(upcoming);
    }, [scheduledTests, currentTime]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-xl">Loading scheduled tests...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-xl text-red-500">Error: {error}</div>;
    }

    return (
        <div className="h-screen bg-gray-100 overflow-y-auto flex flex-col justify-start items-center py-8 rounded-lg">
            <div className="w-full max-w-6xl mx-auto p-4">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Active Tests</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTests.length === 0 ? (
                        <p className="col-span-full text-center text-gray-600 text-lg">No active tests available.</p>
                    ) : (
                        activeTests.map((test) => (
                            <div
                                key={test._id}
                                className="w-full bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300"
                            >
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{test.testTitle}</h2>
                                <p className="text-gray-600 text-sm mb-1">Subject: {test.subjectName}</p>
                                <p className="text-gray-600 text-sm mb-1">Total Marks: {test.totalMarks}</p>
                                <p className="text-gray-600 text-sm mb-1">Duration: {test.duration} minutes</p>
                                <p className="text-gray-600 text-sm mb-1">Start Time: {new Date(test.startTime).toLocaleString()}</p>
                                <p className="text-gray-600 text-sm mb-4">End Time: {new Date(test.endTime).toLocaleString()}</p>
                                <button
                                    onClick={() => handleTakeTest(test._id)}
                                    disabled={takenTests.includes(test._id)}
                                    className={`mt-4 w-full font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
                                        takenTests.includes(test._id)
                                            ? 'bg-red-600 cursor-not-allowed'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                >
                                    {takenTests.includes(test._id) ? 'Test Taken' : 'Take Test'}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <h1 className="text-3xl font-bold text-center text-gray-800 mt-12 mb-8">Upcoming Tests</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingTests.length === 0 ? (
                        <p className="col-span-full text-center text-gray-600 text-lg">No upcoming tests scheduled.</p>
                    ) : (
                        upcomingTests.map((test) => (
                            <div
                                key={test._id}
                                className="w-full bg-white shadow-lg rounded-xl p-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{test.testTitle}</h2>
                                <p className="text-gray-600 text-sm mb-1">Subject: {test.subjectName}</p>
                                <p className="text-gray-600 text-sm mb-1">Total Marks: {test.totalMarks}</p>
                                <p className="text-gray-600 text-sm mb-1">Duration: {test.duration} minutes</p>
                                <p className="text-gray-600 text-sm mb-1">Start Time: {new Date(test.startTime).toLocaleString()}</p>
                                <p className="text-gray-600 text-sm mb-4">End Time: {new Date(test.endTime).toLocaleString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
