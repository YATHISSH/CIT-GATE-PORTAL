'use client';
import { useState, useEffect } from 'react';

interface Test {
  startTime: string;
  endTime: string;
}

export const useTimer = (test: Test | null, onTimeEnd: () => void) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [testStatus, setTestStatus] = useState<'upcoming' | 'active' | 'ended'>('upcoming');

  useEffect(() => {
    if (!test) return;

    console.log('Test Start Time:', test.startTime);
    console.log('Test End Time:', test.endTime);

    const interval = setInterval(() => {
      const now = new Date();
      const testStartTime = new Date(test.startTime);
      const testEndTime = new Date(test.endTime);

      if (now < testStartTime) {
        setTestStatus('upcoming');
        setTimeRemaining(testStartTime.getTime() - now.getTime());
      } else if (now >= testStartTime && now <= testEndTime) {
        setTestStatus('active');
        setTimeRemaining(testEndTime.getTime() - now.getTime());
      } else {
        setTestStatus('ended');
        setTimeRemaining(0);
        clearInterval(interval);
        onTimeEnd();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [test]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { timeRemaining, testStatus, formatTime };
};