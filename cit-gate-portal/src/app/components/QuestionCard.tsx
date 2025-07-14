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
    onOptionChange: (value: string, text: string) => void;
    selectedOption: string;
    onNext: () => void;
    onPrev?: () => void;
    onClear: () => void;
    onSubmit: () => void;
    totalQuestions?: number;
}

export default function QuestionCard({ 
    question, 
    currentIndex, 
    totalQuestions, 
    onOptionChange, 
    selectedOption, 
    onNext, 
    onPrev, 
    onClear, 
    onSubmit 
}: QuestionCardProps) {
    return (
        <>
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                .question-card {
                    width: 100%;
                    height: 100%;
                    background: rgba(30, 41, 59, 0.95);
                    backdrop-filter: blur(20px);
                    padding: 2rem;
                    border-radius: 24px;
                    box-shadow: 
                        0 25px 50px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(34, 197, 94, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    border: 2px solid rgba(34, 197, 94, 0.3);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                .question-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                }

                .question-content {
                    flex-grow: 1;
                }

                .question-header {
                    background: rgba(34, 197, 94, 0.1);
                    padding: 2rem;
                    border-radius: 20px;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    position: relative;
                    overflow: hidden;
                }

                .question-header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(34, 197, 94, 0.1), transparent);
                    animation: shimmer 3s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                }

                .question-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    position: relative;
                    z-index: 2;
                }

                .question-number {
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
                }

                .marks-badge {
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                }

                .question-text {
                    font-size: 1.125rem;
                    color: #e2e8f0;
                    line-height: 1.7;
                    font-weight: 500;
                    position: relative;
                    z-index: 2;
                }

                .question-image-container {
                    display: flex;
                    justify-content: center;
                    margin: 1.5rem 0;
                    padding: 1rem;
                    background: rgba(51, 65, 85, 0.3);
                    border-radius: 16px;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }

                .question-image {
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
                    border: 2px solid rgba(34, 197, 94, 0.3);
                }

                .options-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                }

                .option-label {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem 1.5rem;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 2px solid rgba(51, 65, 85, 0.6);
                    background: rgba(51, 65, 85, 0.3);
                    backdrop-filter: blur(10px);
                    position: relative;
                    overflow: hidden;
                }

                .option-label::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .option-label:hover::before {
                    opacity: 1;
                }

                .option-label:hover {
                    border-color: rgba(34, 197, 94, 0.5);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
                }

                .option-label.selected {
                    background: rgba(34, 197, 94, 0.2);
                    border-color: #22c55e;
                    color: #4ade80;
                    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
                }

                .option-label.selected::before {
                    opacity: 1;
                }

                .option-input {
                    width: 20px;
                    height: 20px;
                    accent-color: #22c55e;
                    position: relative;
                    z-index: 2;
                }

                .option-text {
                    font-size: 1.125rem;
                    font-weight: 500;
                    color: #e2e8f0;
                    position: relative;
                    z-index: 2;
                    transition: color 0.3s ease;
                }

                .option-label.selected .option-text {
                    color: #4ade80;
                    font-weight: 600;
                }

                .nat-input {
                    width: 100%;
                    padding: 1.25rem 1.5rem;
                    background: rgba(51, 65, 85, 0.5);
                    border: 2px solid rgba(51, 65, 85, 0.6);
                    border-radius: 16px;
                    color: white;
                    font-size: 1.125rem;
                    font-weight: 500;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                }

                .nat-input:focus {
                    outline: none;
                    border-color: #22c55e;
                    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3);
                    background: rgba(51, 65, 85, 0.8);
                }

                .nat-input::placeholder {
                    color: #64748b;
                    font-weight: 400;
                }

                .error-message {
                    text-align: center;
                    color: #fca5a5;
                    font-size: 1.125rem;
                    font-weight: 600;
                    padding: 1.5rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 16px;
                    margin: 1rem 0;
                }

                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(51, 65, 85, 0.6);
                    gap: 1rem;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                    position: relative;
                    overflow: hidden;
                }

                .btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s ease;
                }

                .btn:hover::before {
                    left: 100%;
                }

                .btn:hover {
                    transform: translateY(-2px);
                }

                .btn:active {
                    transform: translateY(0);
                }

                .btn-clear {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                }

                .btn-clear:hover {
                    box-shadow: 0 12px 30px rgba(239, 68, 68, 0.4);
                }

                .btn-navigation {
                    background: rgba(51, 65, 85, 0.5);
                    color: #e2e8f0;
                    border: 1px solid rgba(51, 65, 85, 0.6);
                }

                .btn-navigation:hover {
                    background: rgba(34, 197, 94, 0.2);
                    border-color: #22c55e;
                    color: #4ade80;
                    box-shadow: 0 12px 30px rgba(34, 197, 94, 0.3);
                }

                .btn-navigation:disabled {
                    background: rgba(51, 65, 85, 0.3);
                    color: #64748b;
                    cursor: not-allowed;
                    opacity: 0.5;
                    transform: none;
                }

                .btn-navigation:disabled:hover {
                    box-shadow: none;
                    transform: none;
                }

                .btn-submit {
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                }

                .btn-submit:hover {
                    box-shadow: 0 12px 30px rgba(34, 197, 94, 0.4);
                }

                .navigation-group {
                    display: flex;
                    gap: 1rem;
                }

                @media (max-width: 768px) {
                    .question-card {
                        padding: 1.5rem;
                    }
                    
                    .question-header {
                        padding: 1.5rem;
                    }
                    
                    .question-title {
                        font-size: 1.5rem;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    
                    .navigation-group {
                        width: 100%;
                        justify-content: space-between;
                    }
                    
                    .btn {
                        width: 100%;
                        justify-content: center;
                    }
                    
                    .navigation-group .btn {
                        width: auto;
                        flex: 1;
                    }
                }

                @media (max-width: 640px) {
                    .question-title {
                        font-size: 1.25rem;
                    }
                    
                    .option-label {
                        padding: 1rem;
                    }
                    
                    .option-text {
                        font-size: 1rem;
                    }
                    
                    .nat-input {
                        padding: 1rem;
                        font-size: 1rem;
                    }
                }
            `}</style>

            <div className="question-card">
                <div className="question-content">
                    <div className="question-header">
                        <div className="question-title">
                            <span className="question-number">
                                Question {currentIndex + 1}{totalQuestions && `/${totalQuestions}`}
                            </span>
                            <span className="marks-badge">
                                {question.mark} {question.mark === 1 ? 'Mark' : 'Marks'}
                            </span>
                        </div>
                        <p className="question-text">{question.questionText}</p>
                        {question.imageUrl && (
                            <div className="question-image-container">
                                <img
                                    src={question.imageUrl.startsWith('/uploads/') 
                                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${question.imageUrl}` 
                                        : question.imageUrl}
                                    alt="Question Image"
                                    className="question-image"
                                />
                            </div>
                        )}
                    </div>

                    <div className="options-container">
                        {question.type && question.type.toUpperCase() === 'MCQ' && (
                            question.options.length > 0 ? (
                                question.options.map((option, idx) => (
                                    <label
                                        key={idx}
                                        className={`option-label ${selectedOption === option.text ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question._id}`}
                                            value={option._id}
                                            checked={selectedOption === option.text}
                                            onChange={(e) => onOptionChange(option._id, option.text)}
                                            className="option-input"
                                        />
                                        <span className="option-text">{option.text}</span>
                                    </label>
                                ))
                            ) : (
                                <div className="error-message">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ display: 'inline', marginRight: '8px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    No options available for this MCQ question.
                                </div>
                            )
                        )}

                        {question.type && question.type.toUpperCase() === 'MSQ' && (
                            question.options.length > 0 ? (
                                question.options.map((option, idx) => (
                                    <label
                                        key={idx}
                                        className={`option-label ${selectedOption.split(',').includes(option.text) ? 'selected' : ''}`}
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
                                                    newSelectionArray = currentSelections.filter(text => text !== option.text);
                                                }
                                                onOptionChange(newSelectionArray.join(','), newSelectionArray.join(','));
                                            }}
                                            className="option-input"
                                        />
                                        <span className="option-text">{option.text}</span>
                                    </label>
                                ))
                            ) : (
                                <div className="error-message">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ display: 'inline', marginRight: '8px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    No options available for this MSQ question.
                                </div>
                            )
                        )}

                        {question.type && question.type.toUpperCase() === 'NAT' && (
                            <input
                                type="text"
                                value={selectedOption}
                                onChange={(e) => onOptionChange(e.target.value, e.target.value)}
                                className="nat-input"
                                placeholder="Enter your numerical answer here..."
                            />
                        )}

                        {!(question.type && (question.type.toUpperCase() === 'MCQ' || question.type.toUpperCase() === 'MSQ' || question.type.toUpperCase() === 'NAT')) && (
                            <div className="error-message">
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ display: 'inline', marginRight: '8px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Unsupported question type: {question.type}
                            </div>
                        )}
                    </div>
                </div>

                <div className="action-buttons">
                    <button
                        onClick={onClear}
                        className="btn btn-clear"
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Response
                    </button>

                    <div className="navigation-group">
                        {onPrev && (
                            <button
                                onClick={onPrev}
                                disabled={currentIndex === 0}
                                className="btn btn-navigation"
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                        )}

                        {currentIndex === (totalQuestions ? totalQuestions - 1 : 0) ? (
                            <button
                                onClick={onSubmit}
                                className="btn btn-submit"
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Submit Test
                            </button>
                        ) : (
                            <button
                                onClick={onNext}
                                className="btn btn-navigation"
                            >
                                Next
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
