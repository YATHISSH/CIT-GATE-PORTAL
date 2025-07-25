'use client';

import React from 'react';

interface QuestionCardProps {
    question: {
        _id: string;
        questionText: string;
        imageUrl?: string;
        questionImage?: string;
        options: { text: string; isCorrect: boolean; _id: string }[];
        type: 'MCQ' | 'MSQ' | 'NAT' | 'mcq' | 'msq' | 'nat';
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
    const getImageUrl = () => {
        const imageUrl = question.imageUrl || question.questionImage;
        
        if (!imageUrl) return null;
        
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        if (imageUrl.startsWith('/uploads/')) {
            return `${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`;
        }
        
        return imageUrl;
    };

    const imageUrl = getImageUrl();
    const questionType = question.type.toUpperCase();
    const hasImage = !!imageUrl;

    return (
        <>
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                .question-card {
    width: 100%;
    height: 100%;  /* Changed from calc(100vh - 80px) */
    background: rgba(30, 41, 59, 0.98);
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(34, 197, 94, 0.2);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;  /* Added this */
}


                .question-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                }

                .question-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: ${hasImage ? '1.5rem' : '2rem'};
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding-right: 4px;
                }

                .question-header {
                    background: rgba(34, 197, 94, 0.05);
                    padding: ${hasImage ? '1.25rem' : '2rem'};
                    border-radius: 12px;
                    border: 1px solid rgba(34, 197, 94, 0.15);
                    flex-shrink: 0;
                }

                .question-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .question-number {
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                }

                .marks-badge {
                    background: rgba(34, 197, 94, 0.15);
                    color: #4ade80;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }

                .question-text {
                    font-size: ${hasImage ? '1rem' : '1.2rem'};
                    color: #e2e8f0;
                    line-height: ${hasImage ? '1.5' : '1.7'};
                    font-weight: 500;
                    margin-bottom: ${hasImage ? '0.75rem' : '0'};
                }

                .question-image-container {
                    display: ${hasImage ? 'flex' : 'none'};
                    justify-content: center;
                    margin: 1rem 0;
                    padding: 0.75rem;
                    background: rgba(51, 65, 85, 0.2);
                    border-radius: 12px;
                    border: 1px solid rgba(34, 197, 94, 0.1);
                    max-height: 40vh;
                    overflow: hidden;
                }

                .question-image {
                    max-width: 100%;
                    max-height: 100%;
                    height: auto;
                    border-radius: 8px;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    transition: transform 0.3s ease;
                    object-fit: contain;
                }

                .question-image:hover {
                    transform: scale(1.02);
                }

                .image-error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100px;
                    color: #fca5a5;
                    font-size: 0.875rem;
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 8px;
                }

                .options-container {
                    display: flex;
                    flex-direction: column;
                    gap: ${hasImage ? '0.75rem' : '1rem'};
                    width: 100%;
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 4px;
                }

                .option-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: ${hasImage ? '0.875rem 1.125rem' : '1.25rem 1.5rem'};
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1.5px solid rgba(51, 65, 85, 0.5);
                    background: rgba(51, 65, 85, 0.15);
                    position: relative;
                }

                .option-label:hover {
                    border-color: rgba(34, 197, 94, 0.4);
                    background: rgba(51, 65, 85, 0.25);
                    transform: translateY(-1px);
                }

                .option-label.selected {
                    background: rgba(34, 197, 94, 0.15);
                    border-color: #22c55e;
                    color: #4ade80;
                    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);
                }

                .option-input {
                    width: 18px;
                    height: 18px;
                    accent-color: #22c55e;
                    flex-shrink: 0;
                }

                .option-text {
                    font-size: ${hasImage ? '0.95rem' : '1.1rem'};
                    font-weight: 500;
                    color: #e2e8f0;
                    transition: color 0.2s ease;
                    line-height: 1.4;
                }

                .option-label.selected .option-text {
                    color: #4ade80;
                    font-weight: 600;
                }

                .nat-input {
                    width: 100%;
                    padding: ${hasImage ? '0.875rem 1.125rem' : '1.25rem 1.5rem'};
                    background: rgba(51, 65, 85, 0.3);
                    border: 1.5px solid rgba(51, 65, 85, 0.5);
                    border-radius: 12px;
                    color: white;
                    font-size: ${hasImage ? '0.95rem' : '1.1rem'};
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .nat-input:focus {
                    outline: none;
                    border-color: #22c55e;
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
                    background: rgba(51, 65, 85, 0.4);
                }

                .nat-input::placeholder {
                    color: #64748b;
                    font-weight: 400;
                }

                .error-message {
                    text-align: center;
                    color: #fca5a5;
                    font-size: 1rem;
                    font-weight: 600;
                    padding: 1.25rem;
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 12px;
                    margin: 0.5rem 0;
                }

                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(51, 65, 85, 0.4);
                    gap: 1rem;
                    flex-shrink: 0;
                    margin-top: auto;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .btn:hover {
                    transform: translateY(-1px);
                }

                .btn:active {
                    transform: translateY(0);
                }

                .btn-clear {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                }

                .btn-clear:hover {
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
                }

                .btn-navigation {
                    background: rgba(51, 65, 85, 0.4);
                    color: #e2e8f0;
                    border: 1px solid rgba(51, 65, 85, 0.5);
                }

                .btn-navigation:hover {
                    background: rgba(34, 197, 94, 0.15);
                    border-color: #22c55e;
                    color: #4ade80;
                    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.2);
                }

                .btn-navigation:disabled {
                    background: rgba(51, 65, 85, 0.2);
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
                    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
                }

                .navigation-group {
                    display: flex;
                    gap: 0.75rem;
                }

                /* Custom scrollbar */
                .question-content::-webkit-scrollbar,
                .options-container::-webkit-scrollbar {
                    width: 6px;
                }

                .question-content::-webkit-scrollbar-track,
                .options-container::-webkit-scrollbar-track {
                    background: rgba(51, 65, 85, 0.2);
                    border-radius: 3px;
                }

                .question-content::-webkit-scrollbar-thumb,
                .options-container::-webkit-scrollbar-thumb {
                    background: rgba(34, 197, 94, 0.4);
                    border-radius: 3px;
                }

                .question-content::-webkit-scrollbar-thumb:hover,
                .options-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(34, 197, 94, 0.6);
                }

                @media (max-width: 768px) {
                     .question-card {
        height: 100%;  
        padding: 1rem;
    }
                    .question-header {
                        padding: ${hasImage ? '1rem' : '1.5rem'};
                    }
                    
                    .question-title {
                        font-size: 1.25rem;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .action-buttons {
                        flex-direction: column;
                        gap: 0.75rem;
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

                    .question-image-container {
                        max-height: 30vh;
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
                        {imageUrl && (
                            <div className="question-image-container">
                                <img
                                    src={imageUrl}
                                    alt="Question Image"
                                    className="question-image"
                                    onError={(e) => {
                                        console.error('Failed to load image:', imageUrl);
                                        e.currentTarget.style.display = 'none';
                                        const errorDiv = document.createElement('div');
                                        errorDiv.className = 'image-error';
                                        errorDiv.innerHTML = '⚠️ Image failed to load';
                                        e.currentTarget.parentNode?.appendChild(errorDiv);
                                    }}
                                    onLoad={() => {
                                        console.log('✅ Image loaded successfully:', imageUrl);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="options-container">
                        {questionType === 'MCQ' && (
                            question.options.length > 0 ? (
                                question.options.map((option, idx) => (
                                    <label
                                        key={option._id || idx}
                                        className={`option-label ${selectedOption === option.text ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question._id}`}
                                            value={option._id}
                                            checked={selectedOption === option.text}
                                            onChange={() => onOptionChange(option._id, option.text)}
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

                        {questionType === 'MSQ' && (
                            question.options.length > 0 ? (
                                question.options.map((option, idx) => (
                                    <label
                                        key={option._id || idx}
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

                        {(questionType === 'NAT' || questionType === 'NUMERICAL') && (
                            <input
                                type="text"
                                value={selectedOption}
                                onChange={(e) => onOptionChange(e.target.value, e.target.value)}
                                className="nat-input"
                                placeholder="Enter your numerical answer here..."
                            />
                        )}

                        {!['MCQ', 'MSQ', 'NAT', 'NUMERICAL'].includes(questionType) && (
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
