'use client';

import React from 'react';

interface SidebarProps {
    questions: { _id: string; questionText: string }[];
    currentQuestion: number;
    selectedOptions: { [key: string]: string };
    onNavigate: (index: number) => void;
}

export default function Sidebar({ questions, currentQuestion, selectedOptions, onNavigate }: SidebarProps) {
    // Calculate answered questions count properly
    const answeredCount = Object.keys(selectedOptions).filter(
        questionId => selectedOptions[questionId] && selectedOptions[questionId].trim() !== ''
    ).length;
    
    const totalQuestions = questions.length;
    const unansweredCount = totalQuestions - answeredCount;

    return (
        <>
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                .sidebar-container {
                     width: 100%;
    height: 100%;
                    background: rgba(30, 41, 59, 0.98);
                    border-right: 1px solid rgba(34, 197, 94, 0.2);
                    padding: 1.5rem;
                    overflow-y: auto;
                    overflow-x: hidden;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    position: relative;
                    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
                }

                .sidebar-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 3px;
                    height: 100%;
                    background: linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #059669 100%);
                }

                .sidebar-header {
                    text-align: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid rgba(34, 197, 94, 0.2);
                }

                .sidebar-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .progress-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                }

                .stat-item {
                    text-align: center;
                    padding: 1rem 0.75rem;
                    background: rgba(51, 65, 85, 0.3);
                    border-radius: 12px;
                    border: 1px solid rgba(51, 65, 85, 0.4);
                    transition: all 0.2s ease;
                }

                .stat-item:hover {
                    background: rgba(51, 65, 85, 0.4);
                    border-color: rgba(34, 197, 94, 0.3);
                    transform: translateY(-1px);
                }

                .stat-number {
                    display: block;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .total-stat {
                    background: rgba(59, 130, 246, 0.15);
                    border-color: rgba(59, 130, 246, 0.3);
                }

                .total-stat .stat-number {
                    color: #60a5fa;
                }

                .total-stat .stat-label {
                    color: #93c5fd;
                }

                .answered-stat {
                    background: rgba(34, 197, 94, 0.15);
                    border-color: rgba(34, 197, 94, 0.3);
                }

                .answered-stat .stat-number {
                    color: #4ade80;
                }

                .answered-stat .stat-label {
                    color: #86efac;
                }

                .unanswered-stat {
                    background: rgba(248, 113, 113, 0.15);
                    border-color: rgba(248, 113, 113, 0.3);
                }

                .unanswered-stat .stat-number {
                    color: #f87171;
                }

                .unanswered-stat .stat-label {
                    color: #fca5a5;
                }

                .progress-bar-container {
                    margin-bottom: 2rem;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(51, 65, 85, 0.4);
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
                    border-radius: 10px;
                    transition: width 0.5s ease;
                    width: ${(answeredCount / totalQuestions) * 100}%;
                }

                .progress-text {
                    text-align: center;
                    font-size: 0.8rem;
                    color: #4ade80;
                    font-weight: 600;
                }

                .questions-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                }

                .question-button {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .question-button:hover {
                    transform: translateY(-1px);
                }

                .question-button.current {
                    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                    color: white;
                    border-color: #60a5fa;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                    transform: scale(1.05);
                }

                .question-button.answered {
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    border-color: #4ade80;
                    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);
                    position: relative;
                }

                .question-button.answered::after {
                    content: '✓';
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 16px;
                    height: 16px;
                    background: #059669;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 900;
                    color: white;
                    box-shadow: 0 2px 6px rgba(5, 150, 105, 0.4);
                }

                .question-button.answered:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
                }

                .question-button.unanswered {
                    background: rgba(51, 65, 85, 0.4);
                    color: #94a3b8;
                    border-color: #475569;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .question-button.unanswered:hover {
                    background: rgba(51, 65, 85, 0.6);
                    color: #e2e8f0;
                    border-color: #64748b;
                    transform: translateY(-1px);
                }

                .legend {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(34, 197, 94, 0.2);
                }

                .legend-items {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    background: rgba(51, 65, 85, 0.2);
                    transition: all 0.2s ease;
                    border: 1px solid rgba(51, 65, 85, 0.3);
                }

                .legend-item:hover {
                    background: rgba(51, 65, 85, 0.3);
                    border-color: rgba(34, 197, 94, 0.2);
                }

                .legend-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    flex-shrink: 0;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .legend-color.current {
                    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                }

                .legend-color.answered {
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                }

                .legend-color.unanswered {
                    background: rgba(51, 65, 85, 0.6);
                    border: 1px solid #475569;
                }

                .legend-text {
                    font-size: 0.8rem;
                    color: #cbd5e1;
                    font-weight: 500;
                }

                /* Custom Scrollbar */
                .sidebar-container::-webkit-scrollbar {
                    width: 6px;
                }

                .sidebar-container::-webkit-scrollbar-track {
                    background: rgba(51, 65, 85, 0.2);
                    border-radius: 3px;
                }

                .sidebar-container::-webkit-scrollbar-thumb {
                    background: rgba(34, 197, 94, 0.4);
                    border-radius: 3px;
                }

                .sidebar-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(34, 197, 94, 0.6);
                }

                @media (max-width: 1024px) {
                    .sidebar-container {
                        width: 30%;
                        padding: 1.25rem;
                    }
                    
                    .questions-grid {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 0.5rem;
                    }
                    
                    .progress-stats {
                        grid-template-columns: 1fr;
                        gap: 0.5rem;
                    }

                    .question-button {
                        width: 40px;
                        height: 40px;
                        font-size: 0.8rem;
                    }
                }

                @media (max-width: 768px) {
                    .sidebar-container {
                        width: 100%;
                        min-height: auto;
                        max-height: 50vh;
                        border-right: none;
                        border-bottom: 1px solid rgba(34, 197, 94, 0.2);
                        padding: 1rem;
                    }
                    
                    .sidebar-container::before {
                        top: auto;
                        bottom: 0;
                        right: 0;
                        width: 100%;
                        height: 3px;
                        background: linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #059669 100%);
                    }
                    
                    .questions-grid {
                        grid-template-columns: repeat(6, 1fr);
                        gap: 0.4rem;
                    }
                    
                    .question-button {
                        width: 36px;
                        height: 36px;
                        font-size: 0.75rem;
                    }

                    .sidebar-title {
                        font-size: 1.25rem;
                    }

                    .legend-items {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 0.5rem;
                    }
                }

                @media (max-width: 640px) {
                    .sidebar-container {
                        padding: 0.75rem;
                    }
                    
                    .questions-grid {
                        grid-template-columns: repeat(5, 1fr);
                        gap: 0.4rem;
                    }
                    
                    .question-button {
                        width: 32px;
                        height: 32px;
                        font-size: 0.7rem;
                    }

                    .progress-stats {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 0.4rem;
                    }

                    .stat-item {
                        padding: 0.75rem 0.5rem;
                    }

                    .stat-number {
                        font-size: 1rem;
                    }
                }
            `}</style>

            <div className="sidebar-container">
                {/* Header */}
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Assessment Progress</h2>
                    
                    {/* Progress Stats */}
                    <div className="progress-stats">
                        <div className="stat-item total-stat">
                            <span className="stat-number">{totalQuestions}</span>
                            <span className="stat-label">Total</span>
                        </div>
                        <div className="stat-item answered-stat">
                            <span className="stat-number">{answeredCount}</span>
                            <span className="stat-label">Answered</span>
                        </div>
                        <div className="stat-item unanswered-stat">
                            <span className="stat-number">{unansweredCount}</span>
                            <span className="stat-label">Remaining</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                        <div className="progress-text">
                            {Math.round((answeredCount / totalQuestions) * 100)}% Complete
                        </div>
                    </div>
                </div>

                {/* Questions Grid */}
                <div className="questions-grid">
                    {questions.map((q, index) => {
                        const isAnswered = selectedOptions[q._id] && selectedOptions[q._id].trim() !== '';
                        const isCurrent = index === currentQuestion;
                        
                        let buttonClass = 'question-button ';
                        if (isCurrent) {
                            buttonClass += 'current';
                        } else if (isAnswered) {
                            buttonClass += 'answered';
                        } else {
                            buttonClass += 'unanswered';
                        }

                        return (
                            <button
                                key={q._id}
                                className={buttonClass}
                                onClick={() => onNavigate(index)}
                                title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ' (Not Answered)'}`}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="legend">
                    <div className="legend-items">
                        <div className="legend-item">
                            <div className="legend-color current"></div>
                            <span className="legend-text">Current Question</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color answered"></div>
                            <span className="legend-text">Answered</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color unanswered"></div>
                            <span className="legend-text">Not Answered</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
