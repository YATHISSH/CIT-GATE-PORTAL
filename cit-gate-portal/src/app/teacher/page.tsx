'use client';

import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const router = useRouter();
  const cards = [
    {
      icon: '📅',
      title: 'Schedule New Test',
      desc: 'Upload PDFs, set timing, assign to department.',
      action: () => router.push('/teacher/schedule'),
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      icon: '📊',
      title: 'View Test Results',
      desc: 'Analyze performance by test & department.',
      action: () => router.push('/teacher/result'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: '📋',
      title: 'Scheduled Tests',
      desc: 'View and manage all your scheduled tests.',
      action: () => router.push('/teacher/schedule/scheduledtests'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-12 text-center">
          Welcome, Teacher 👩‍🏫
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={card.action}
              className={`flex flex-col items-start justify-start p-6 rounded-2xl shadow-lg text-white transition-transform duration-300 hover:scale-105 ${card.color}`}
            >
              <div className="text-5xl mb-4">{card.icon}</div>
              <h2 className="text-xl font-bold mb-2">{card.title}</h2>
              <p className="text-sm opacity-90 text-left">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
