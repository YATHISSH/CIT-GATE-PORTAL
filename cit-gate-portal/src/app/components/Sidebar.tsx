'use client';

import React from 'react';

interface SidebarProps {
    questions: { _id: string; questionText: string }[];
    currentQuestion: number;
    selectedOptions: { [key: string]: string };
    onNavigate: (index: number) => void;
}

export default function Sidebar({ questions, currentQuestion, selectedOptions, onNavigate }: SidebarProps) {
    return (
        <div className="w-1/4 h-full overflow-y-auto bg-gray-100 p-4">
            <h2 className="w-full text-xl font-bold text-gray-800 text-center mb-10">Questions</h2>
            <div className="grid grid-cols-4 gap-4 items-center pb-14">
                {questions.map((q, index) => (
                    <div className="flex justify-center" key={q._id}>
                        <button
                            className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-semibold transition-all duration-200
                                ${index === currentQuestion
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : selectedOptions[q._id]
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            onClick={() => onNavigate(index)}
                        >
                            {index + 1}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
