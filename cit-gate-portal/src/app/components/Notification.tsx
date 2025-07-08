'use client';

import React from 'react';

interface NotificationProps {
  message: string;
  show: boolean;
  onClick?: () => void;
  isActionable?: boolean;
}

const Notification: React.FC<NotificationProps> = ({ message, show, onClick, isActionable }) => {
  if (!show) {
    return null;
  }

  const baseClasses = 'fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white bg-red-600';
  const actionableClasses = isActionable ? 'cursor-pointer hover:bg-red-700' : '';

  return (
    <div className={`${baseClasses} ${actionableClasses}`} onClick={onClick}>
      {message}
    </div>
  );
};

export default Notification;