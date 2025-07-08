'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const StudentPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the student dashboard
    router.replace('/student/dashboard');
  }, [router]);

  // Render a loading state or null while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-lg text-gray-700">Redirecting to your dashboard...</p>
    </div>
  );
};

export default StudentPage;