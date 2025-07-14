'use client';

import React from 'react';

interface NotificationProps {
  message: string;
  show: boolean;
  onClick?: () => void;
  /**  
   * If `true`, the banner shows a hand-cursor and gains hover / focus styles.  
   * Use it for “Tap to dismiss”, “Undo”, etc.
   */
  isActionable?: boolean;
  /**  
   * One of `"info" | "success" | "warning" | "error"`;  
   * defaults to **info**.
   */
  variant?: 'info' | 'success' | 'warning' | 'error';
}

const COLORS = {
  info:    { bg: '#3b82f6', bgHover: '#2563eb' },   // blue
  success: { bg: '#22c55e', bgHover: '#16a34a' },   // green
  warning: { bg: '#f59e0b', bgHover: '#d97706' },   // amber
  error:   { bg: '#ef4444', bgHover: '#dc2626' }    // red
};

const Notification: React.FC<NotificationProps> = ({
  message,
  show,
  onClick,
  isActionable = false,
  variant = 'info'
}) => {
  if (!show) return null;

  const { bg, bgHover } = COLORS[variant];

  return (
    <>
      <div
        className={`banner ${isActionable ? 'actionable' : ''}`}
        style={{ backgroundColor: bg }}
        onClick={onClick}
        role={isActionable ? 'button' : undefined}
        tabIndex={isActionable ? 0 : undefined}
      >
        {message}
      </div>

      {/* ---------- Styles ---------- */}
      <style jsx>{`
        .banner {
          position: fixed;
          top: 1.25rem;       /* 20 px */
          right: 1.25rem;
          max-width: 22rem;   /* 352 px */
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
          color: #ffffff;
          font-size: 0.875rem; /* 14 px */
          line-height: 1.4;
          z-index: 50;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }

        .actionable {
          cursor: pointer;
        }

        .actionable:hover,
        .actionable:focus-visible {
          background-color: ${bgHover};
          transform: translateY(-2px);
          outline: none;
        }

        /* Subtle entrance animation */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(0);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        .banner {
          animation: slideIn 0.35s ease-out;
        }

        /* Mobile spacing tweak */
        @media (max-width: 640px) {
          .banner {
            left: 0.75rem;
            right: 0.75rem;
            top: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default Notification;
