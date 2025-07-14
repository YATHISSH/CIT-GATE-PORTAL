'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ScrollText } from 'lucide-react'; // Optional: for icons

interface InstructionsPageProps {
  params: { testId: string };
}

const InstructionsPage: React.FC<InstructionsPageProps> = ({ params }) => {
  const router = useRouter();
  const { testId } = params;

  const handleStartTest = () => {
    router.push(`/student/take-test/${testId}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 px-4 py-8">
      <div className="w-full max-w-3xl p-10 rounded-2xl shadow-2xl bg-white/90 backdrop-blur-md border border-gray-200 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-red-600 text-center mb-8 flex items-center justify-center gap-3">
          <ShieldAlert className="w-8 h-8" />
          Test Instructions & Warnings
        </h1>

        <div className="text-left space-y-6 text-gray-800 text-lg leading-relaxed">
          <p className="flex items-center gap-2 text-gray-700">
            <ScrollText className="w-6 h-6 text-blue-600" />
            Please read the following instructions carefully before starting the test:
          </p>

          <ul className="list-disc list-inside pl-2 text-gray-700 space-y-2">
            <li>The test will begin immediately after you click <strong>‘Start Test’</strong>.</li>
            <li>Ensure a quiet environment with a stable internet connection.</li>
            <li><strong>Do not</strong> refresh the page or close the browser.</li>
            <li>All questions are <strong>mandatory</strong> and must be answered before submission.</li>
          </ul>

          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <p className="text-xl font-bold text-red-700">⚠️ CRITICAL WARNING</p>
            <p className="mt-2 text-red-600">
              Exiting fullscreen mode or switching tabs will <strong>immediately lock your test</strong> and trigger automatic submission.
              No warnings will be shown.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={handleStartTest}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-bold py-3 px-10 text-xl rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            ✅ I Understand, Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage;
