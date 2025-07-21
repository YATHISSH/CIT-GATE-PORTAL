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
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
                 style={{ 
                    backgroundColor: '#0f172a',
                    backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(75, 181, 67, 0.3), rgba(15, 23, 42, 0))',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                 }}>
                <div className="relative z-10 text-center">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                    </div>
                    <h2 className="text-white text-2xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)' }}>Loading Test Platform...</h2>
                    <p className="text-slate-400 text-lg">Please wait while we fetch your tests</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
                 style={{ 
                    backgroundColor: '#0f172a',
                    backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(75, 181, 67, 0.3), rgba(15, 23, 42, 0))',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                 }}>
                <div className="relative z-10 text-center">
                    <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl border-l-4 border-red-500 max-w-md border border-slate-700">
                        <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)' }}>Connection Error</h3>
                        <p className="text-slate-400 mb-4">Unable to load tests at this time</p>
                        <p className="text-slate-500 text-sm">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const TestCard = ({ test, isActive = false }: { test: Test; isActive?: boolean }) => (
        <div className={`relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden group transition-all duration-300 hover:shadow-green-500/10 hover:border-green-500/30 ${
            isActive ? 'ring-2 ring-green-500 ring-opacity-50' : ''
        }`}>
            {/* Status indicator */}
            {isActive && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-green-400 bg-green-900/50 px-2 py-1 rounded-full backdrop-blur-sm">ACTIVE</span>
                    </div>
                </div>
            )}
            
            {/* Card Header */}
            <div className="bg-slate-700/50 p-6 border-b border-slate-600">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-green-400 transition-colors duration-300">
                    {test.testTitle}
                </h3>
                <div className="flex items-center text-sm text-slate-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium">{test.subjectName}</span>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-green-400 font-medium">TOTAL MARKS</span>
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-lg font-bold text-white">{test.totalMarks}</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-green-400 font-medium">DURATION</span>
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-lg font-bold text-white">{test.duration}m</p>
                    </div>
                </div>

                {/* Time Information */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm text-slate-400">Start:</span>
                        <span className="text-sm font-medium text-white ml-2">
                            {new Date(test.startTime).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-sm text-slate-400">End:</span>
                        <span className="text-sm font-medium text-white ml-2">
                            {new Date(test.endTime).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* FIXED: Action Button with no continuous animation */}
                {isActive && (
                    <button
                        onClick={() => handleTakeTest(test._id)}
                        disabled={takenTests.includes(test._id)}
                        className={`
                            w-full py-3 px-6 rounded-xl font-semibold text-white 
                            transition-all duration-200 ease-in-out
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                            ${takenTests.includes(test._id)
                                ? 'bg-slate-600 cursor-not-allowed opacity-75 focus:ring-slate-400'
                                : `bg-gradient-to-r from-green-500 to-green-600 
                                   hover:from-green-600 hover:to-green-700 
                                   hover:shadow-lg hover:shadow-green-500/25
                                   active:scale-95 active:shadow-inner
                                   focus:ring-green-400`
                            }
                        `}
                        style={{
                            // CRITICAL: Prevent any inherited animations
                            animation: 'none',
                            transform: 'none'
                        }}
                        onMouseEnter={(e) => {
                            // Ensure no conflicting styles
                            e.currentTarget.style.animation = 'none';
                        }}
                    >
                        {takenTests.includes(test._id) ? (
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Test Completed
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 000-5H9v5zm0 0H7.5A2.5 2.5 0 005 7.5v-1A2.5 2.5 0 007.5 4H9v6zM14 4h1.5a2.5 2.5 0 012.5 2.5v1a2.5 2.5 0 01-2.5 2.5H14V4z" />
                                </svg>
                                Start Test
                            </div>
                        )}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen relative overflow-hidden" 
             style={{ 
                backgroundColor: '#0f172a',
                backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(75, 181, 67, 0.3), rgba(15, 23, 42, 0))',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
             }}>
            
            {/* Professional Dark Header */}
            <header className="relative bg-slate-900/20 border-b border-green-500/20 shadow-2xl backdrop-blur-sm">
                <div className="relative z-10 container mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-green-500/30"
                                 style={{ filter: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2))' }}>
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-white" 
                                style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)' }}>
                                GATE STUDENT DASHBOARD 
                            </h1>
                        </div>
                        <p className="text-xl max-w-2xl mx-auto"
                           style={{ 
                            color: '#07c63d',
                            fontSize: '20px',
                            fontWeight: '700',
                            fontStyle: 'italic',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                            letterSpacing: '0.5px'
                           }}>
                            Your gateway to success — practice, perform, and progress.
                        </p>
                    </div>
                </div>
            </header>

            <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
                {/* Active Tests Section */}
                <section className="mb-16">
                    <div className="flex items-center mb-8">
                        <div className="w-1 h-8 rounded-full mr-4 shadow-lg"
                             style={{ backgroundColor: '#4bb543', boxShadow: '0 0 15px rgba(75, 181, 67, 0.5)' }}></div>
                        <h2 className="text-3xl font-bold text-white" 
                            style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)' }}>Active Examinations</h2>
                        <div className="ml-auto flex items-center text-sm" style={{ color: '#a0aec0' }}>
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <span>Live Tests Available</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {activeTests.length === 0 ? (
                            <div className="col-span-full">
                                <div className="text-center py-20 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700">
                                    <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10" style={{ color: '#a0aec0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2" 
                                        style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)' }}>No Active Tests</h3>
                                    <p style={{ color: '#a0aec0' }}>Currently no examinations are available for participation</p>
                                </div>
                            </div>
                        ) : (
                            activeTests.map((test) => (
                                <TestCard key={test._id} test={test} isActive={true} />
                            ))
                        )}
                    </div>
                </section>

                {/* Upcoming Tests Section */}
                <section>
                    <div className="flex items-center mb-8">
                        <div className="w-1 h-8 rounded-full mr-4 shadow-lg"
                             style={{ backgroundColor: '#4bb543', boxShadow: '0 0 15px rgba(75, 181, 67, 0.5)' }}></div>
                        <h2 className="text-3xl font-bold text-white" 
                            style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)' }}>Scheduled Examinations</h2>
                        <div className="ml-auto flex items-center text-sm" style={{ color: '#a0aec0' }}>
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span>Upcoming Tests</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {upcomingTests.length === 0 ? (
                            <div className="col-span-full">
                                <div className="text-center py-20 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700">
                                    <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10" style={{ color: '#a0aec0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012 2h12a2 2 0 012 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2" 
                                        style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)' }}>No Scheduled Tests</h3>
                                    <p style={{ color: '#a0aec0' }}>All examinations are up to date</p>
                                </div>
                            </div>
                        ) : (
                            upcomingTests.map((test) => (
                                <TestCard key={test._id} test={test} />
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
