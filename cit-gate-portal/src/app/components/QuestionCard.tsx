'use client';

import React from 'react';

interface QuestionCardProps {
    question: {
        _id: string;
        questionText: string;
        imageUrl?: string;
        options: { text: string; isCorrect: boolean; _id: string }[];
        type: 'MCQ' | 'MSQ' | 'NAT';
        mark: number;
    };
    currentIndex: number;
    onOptionChange: (value: string, text: string) => void; // Updated to include text
    selectedOption: string; // This still stores the ID in parent, but we'll use text here
    onNext: () => void;
    onPrev?: () => void;
    onClear: () => void;
    onSubmit: () => void;
    totalQuestions?: number;
}

export default function QuestionCard({ question, currentIndex, totalQuestions, onOptionChange, selectedOption, onNext, onPrev, onClear, onSubmit }: QuestionCardProps) {
    return (
        <div className="w-full h-full bg-white p-8 rounded-lg shadow-md flex flex-col border border-gray-200">
            <div className="flex-grow">
                <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-4">Question {currentIndex + 1}{totalQuestions && `/${totalQuestions}`}: <span className="text-base text-gray-500 ml-2 font-normal">(Marks: {question.mark})</span></h1>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4 font-sans">{question.questionText}</p>
                    {question.imageUrl && (
                        <div className="flex justify-center my-4 p-2 bg-gray-100 rounded-lg">
                            <img
                                src={question.imageUrl.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${question.imageUrl}` : question.imageUrl}
                                alt="Question Image"
                                className="max-w-full h-auto rounded-lg shadow-md border border-gray-300"
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 w-full">
                    {question.type && question.type.toUpperCase() === 'MCQ' && (
                        question.options.length > 0 ? (
                            question.options.map((option, idx) => (
                                <label
                                    key={idx}
                                    className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-200 border border-gray-300
                                    ${selectedOption === option._id ? 'bg-blue-100 text-blue-800 shadow-sm border-blue-400' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${question._id}`}
                                        value={option._id}
                                        checked={selectedOption === option.text} // Compare with text
                                        onChange={(e) => onOptionChange(option._id, option.text)} // Pass ID and text
                                        className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500 bg-white border-gray-400"
                                    />
                                    <span className="text-lg font-normal">{option.text}</span>
                                </label>
                            ))
                        ) : (
                            <p className="text-red-400 text-center">No options available for this MCQ question.</p>
                        )
                    )}

                    {question.type && question.type.toUpperCase() === 'MSQ' && (
                        question.options.length > 0 ? (
                            question.options.map((option, idx) => (
                                <label
                                    key={idx}
                                    className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-200 border border-gray-300
                                    ${selectedOption.split(',').includes(option.text) ? 'bg-blue-100 text-blue-800 shadow-sm border-blue-400' : 'bg-white text-gray-800 hover:bg-gray-50'}`} // Check if text is included
                                >
                                    <input
                                        type="checkbox"
                                        name={`question-${question._id}`}
                                        value={option._id}
                                        checked={selectedOption.split(',').includes(option.text)}
                                        onChange={(e) => {
                                            const currentSelections = selectedOption.split(',').filter(Boolean);
                                            let newSelectionArray: string[];

                                            if (e.target.checked) {
                                                newSelectionArray = [...currentSelections, option.text];
                                            } else {
                                                newSelectionArray = currentSelections.filter(text => text !== option.text); // Filter by text
                                            }
                                            // Map IDs back to texts for the MSQ selectedOption string
                                            // For MSQ, we'll store the texts directly in the selectedOption string
                                            onOptionChange(newSelectionArray.join(','), newSelectionArray.join(',')); // Pass texts as both value and text
                                        }}
                                        className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 bg-white border-gray-400"
                                    />
                                    <span className="text-lg font-normal">{option.text}</span>
                                </label>
                            ))
                        ) : (
                            <p className="text-red-400 text-center">No options available for this MSQ question.</p>
                        )
                    )}

                    {question.type && question.type.toUpperCase() === 'NAT' && (
                        <input
                            type="text"
                            value={selectedOption}
                            onChange={(e) => onOptionChange(e.target.value, e.target.value)} // Pass value as both ID and text for NAT
                            className="border border-gray-300 bg-white text-gray-800 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                            placeholder="Enter your answer here..."
                        />
                    )}

                    {!(question.type && (question.type.toUpperCase() === 'MCQ' || question.type.toUpperCase() === 'MSQ' || question.type.toUpperCase() === 'NAT')) && (
                        console.log('Unsupported type detected:', question.type),
                        <p className="text-red-400 text-center">Unsupported question type: {question.type}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
                <button
                    onClick={onClear}
                    className={`px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75`}
                >
                    Clear Response
                </button>

                <div className="flex space-x-4">
                    <button
                        onClick={onPrev}
                        className={`px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
                        ${currentIndex === 0 ? 'opacity-60 cursor-not-allowed bg-gray-400 hover:bg-gray-400' : ''}`}
                        disabled={currentIndex === 0}
                    >
                        Previous
                    </button>

                    <button
                        onClick={(currentIndex === totalQuestions! - 1) ? onSubmit : onNext}
                        className={`px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75`}
                    >
                        {currentIndex === totalQuestions! - 1 ? `Submit Test` : `Next Question`}
                    </button>
                </div>
            </div>
        </div>
    );
}