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
        width: 25%;
        height: 100%;
        background: rgba(30, 41, 59, 0.85);
        backdrop-filter: blur(25px);
        border-right: 1px solid rgba(34, 197, 94, 0.4);
        padding: 2rem 1.5rem;
        overflow-y: auto;
        overflow-x: hidden;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: relative;
        box-shadow: 
            inset -1px 0 0 rgba(34, 197, 94, 0.2),
            4px 0 20px rgba(0, 0, 0, 0.15);
    }

    .sidebar-container::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 6px;
        height: 100%;
        background: linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #059669 100%);
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
        animation: glow-pulse 3s ease-in-out infinite;
    }

    @keyframes glow-pulse {
        0%, 100% { 
            opacity: 0.8;
            transform: scaleX(1);
        }
        50% { 
            opacity: 1;
            transform: scaleX(1.2);
        }
    }

    .sidebar-container::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 100% 0%, rgba(34, 197, 94, 0.1) 0%, transparent 50%);
        pointer-events: none;
        animation: ambient-glow 6s ease-in-out infinite;
    }

    @keyframes ambient-glow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
    }

    .sidebar-header {
        text-align: center;
        margin-bottom: 2.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid rgba(34, 197, 94, 0.3);
        position: relative;
    }

    .sidebar-header::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 4px;
        background: linear-gradient(90deg, #22c55e, #16a34a, #22c55e);
        border-radius: 2px;
        animation: header-shine 2s ease-in-out infinite;
    }

    @keyframes header-shine {
        0%, 100% { width: 60px; opacity: 0.8; }
        50% { width: 80px; opacity: 1; }
    }

    .sidebar-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: white;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #ffffff 0%, #22c55e 50%, #e2e8f0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        position: relative;
    }

    .sidebar-title::before {
        content: '📚';
        position: absolute;
        left: -2rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.5rem;
        animation: icon-bounce 2s ease-in-out infinite;
    }

    @keyframes icon-bounce {
        0%, 100% { transform: translateY(-50%) scale(1); }
        50% { transform: translateY(-60%) scale(1.1); }
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
        background: rgba(51, 65, 85, 0.6);
        border-radius: 16px;
        border: 2px solid rgba(51, 65, 85, 0.8);
        position: relative;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(15px);
    }

    .stat-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.6s ease;
    }

    .stat-item:hover::before {
        left: 100%;
    }

    .stat-item:hover {
        transform: translateY(-3px) scale(1.02);
        border-color: rgba(34, 197, 94, 0.5);
        box-shadow: 0 10px 30px rgba(34, 197, 94, 0.2);
    }

    .stat-number {
        display: block;
        font-size: 1.5rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        transition: all 0.3s ease;
    }

    .stat-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
    }

    .total-stat {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
        border-color: rgba(59, 130, 246, 0.4);
    }

    .total-stat .stat-number {
        color: #60a5fa;
        text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    }

    .total-stat .stat-label {
        color: #93c5fd;
    }

    .answered-stat {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%);
        border-color: rgba(34, 197, 94, 0.4);
    }

    .answered-stat .stat-number {
        color: #4ade80;
        text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
    }

    .answered-stat .stat-label {
        color: #86efac;
    }

    .unanswered-stat {
        background: linear-gradient(135deg, rgba(248, 113, 113, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%);
        border-color: rgba(248, 113, 113, 0.4);
    }

    .unanswered-stat .stat-number {
        color: #f87171;
        text-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
    }

    .unanswered-stat .stat-label {
        color: #fca5a5;
    }

    .progress-bar-container {
        margin-bottom: 2.5rem;
        position: relative;
    }

    .progress-bar {
        width: 100%;
        height: 12px;
        background: rgba(51, 65, 85, 0.6);
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 1rem;
        box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            0 1px 2px rgba(255, 255, 255, 0.1);
        position: relative;
    }

    .progress-bar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
        animation: progress-shimmer 2s ease-in-out infinite;
    }

    @keyframes progress-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #059669 100%);
        border-radius: 20px;
        transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        width: ${(answeredCount / totalQuestions) * 100}%;
        box-shadow: 
            0 0 20px rgba(34, 197, 94, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.2);
        position: relative;
        overflow: hidden;
    }

    .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: progress-wave 3s ease-in-out infinite;
    }

    @keyframes progress-wave {
        0%, 100% { transform: translateX(-100%); }
        50% { transform: translateX(100%); }
    }

    .progress-text {
        text-align: center;
        font-size: 0.875rem;
        color: #4ade80;
        font-weight: 600;
        text-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
    }

    .questions-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        padding-bottom: 2rem;
        position: relative;
    }

    .question-button {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 16px;
        font-size: 0.875rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid transparent;
        backdrop-filter: blur(15px);
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .question-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
    }

    .question-button:hover::before {
        left: 100%;
    }

    .question-button::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
        transition: all 0.4s ease;
        transform: translate(-50%, -50%);
        border-radius: 50%;
    }

    .question-button:hover::after {
        width: 100px;
        height: 100px;
    }

    .question-button.current {
        background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
        color: white;
        border-color: #60a5fa;
        box-shadow: 
            0 12px 30px rgba(59, 130, 246, 0.4),
            0 0 20px rgba(59, 130, 246, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.2);
        transform: scale(1.08);
        animation: current-pulse 2s ease-in-out infinite;
    }

    @keyframes current-pulse {
        0%, 100% { 
            box-shadow: 
                0 12px 30px rgba(59, 130, 246, 0.4),
                0 0 20px rgba(59, 130, 246, 0.3),
                inset 0 1px 2px rgba(255, 255, 255, 0.2);
        }
        50% { 
            box-shadow: 
                0 15px 35px rgba(59, 130, 246, 0.5),
                0 0 30px rgba(59, 130, 246, 0.4),
                inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }
    }

    .question-button.answered {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #059669 100%);
        color: white;
        border-color: #4ade80;
        box-shadow: 
            0 8px 25px rgba(34, 197, 94, 0.3),
            0 0 15px rgba(34, 197, 94, 0.2),
            inset 0 1px 2px rgba(255, 255, 255, 0.2);
        position: relative;
    }

    .question-button.answered::before {
        content: '✓';
        position: absolute;
        top: -2px;
        right: -2px;
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
        box-shadow: 0 2px 8px rgba(5, 150, 105, 0.5);
        animation: check-bounce 0.5s ease-out;
    }

    @keyframes check-bounce {
        0% { transform: scale(0); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }

    .question-button.answered:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 
            0 15px 35px rgba(34, 197, 94, 0.4),
            0 0 25px rgba(34, 197, 94, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
    }

    .question-button.unanswered {
        background: rgba(51, 65, 85, 0.6);
        color: #94a3b8;
        border-color: #475569;
        box-shadow: 
            0 4px 15px rgba(0, 0, 0, 0.2),
            inset 0 1px 2px rgba(255, 255, 255, 0.05);
    }

    .question-button.unanswered:hover {
        background: rgba(51, 65, 85, 0.8);
        color: #e2e8f0;
        border-color: #64748b;
        transform: translateY(-2px) scale(1.02);
        box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.3),
            0 0 15px rgba(100, 116, 139, 0.2);
    }

    .legend {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 2px solid rgba(34, 197, 94, 0.3);
        position: relative;
    }

    .legend::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 0;
        width: 60px;
        height: 4px;
        background: linear-gradient(90deg, #22c55e, #16a34a);
        border-radius: 2px;
    }

    .legend-title {
        font-size: 0.875rem;
        font-weight: 700;
        color: #e2e8f0;
        margin-bottom: 1.5rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative;
        padding-left: 1rem;
    }

    .legend-title::before {
        content: '📋';
        position: absolute;
        left: -0.5rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1rem;
    }

    .legend-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        border-radius: 12px;
        background: rgba(51, 65, 85, 0.3);
        transition: all 0.3s ease;
        border: 1px solid rgba(51, 65, 85, 0.5);
    }

    .legend-item:hover {
        background: rgba(51, 65, 85, 0.5);
        border-color: rgba(34, 197, 94, 0.3);
        transform: translateX(4px);
    }

    .legend-color {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        position: relative;
        overflow: hidden;
    }

    .legend-color::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: legend-shimmer 3s ease-in-out infinite;
    }

    @keyframes legend-shimmer {
        0%, 100% { left: -100%; }
        50% { left: 100%; }
    }

    .legend-color.current {
        background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
    }

    .legend-color.answered {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
    }

    .legend-color.unanswered {
        background: rgba(51, 65, 85, 0.6);
        border: 2px solid #475569;
        box-shadow: 0 0 10px rgba(71, 85, 105, 0.3);
    }

    .legend-text {
        font-size: 0.8rem;
        color: #cbd5e1;
        font-weight: 600;
        text-transform: capitalize;
    }

    /* Custom Scrollbar */
    .sidebar-container::-webkit-scrollbar {
        width: 8px;
    }

    .sidebar-container::-webkit-scrollbar-track {
        background: rgba(51, 65, 85, 0.3);
        border-radius: 10px;
    }

    .sidebar-container::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #22c55e, #16a34a);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
    }

    .sidebar-container::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #16a34a, #059669);
        box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
    }

    @media (max-width: 1024px) {
        .sidebar-container {
            width: 30%;
            padding: 1.5rem 1rem;
        }
        
        .questions-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
        }
        
        .progress-stats {
            grid-template-columns: 1fr;
            gap: 0.75rem;
        }

        .question-button {
            width: 48px;
            height: 48px;
            font-size: 0.8rem;
        }
    }

    @media (max-width: 768px) {
        .sidebar-container {
            width: 100%;
            height: auto;
            border-right: none;
            border-bottom: 2px solid rgba(34, 197, 94, 0.4);
            padding: 1.5rem;
        }
        
        .sidebar-container::before {
            top: auto;
            bottom: 0;
            right: 0;
            width: 100%;
            height: 6px;
            background: linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #059669 100%);
        }
        
        .questions-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 0.5rem;
        }
        
        .question-button {
            width: 44px;
            height: 44px;
            font-size: 0.75rem;
        }

        .sidebar-title {
            font-size: 1.5rem;
        }

        .legend-items {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
        }
    }

    @media (max-width: 640px) {
        .sidebar-container {
            padding: 1rem;
        }
        
        .questions-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 0.5rem;
        }
        
        .question-button {
            width: 40px;
            height: 40px;
            font-size: 0.7rem;
        }

        .progress-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }

        .stat-item {
            padding: 0.75rem 0.5rem;
        }

        .stat-number {
            font-size: 1.25rem;
        }
    }
`}</style>


            <div className="sidebar-container">
                {/* Header */}
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Overview</h2>
                    
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
