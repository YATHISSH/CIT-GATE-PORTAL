'use client';

import { useState, useEffect, useCallback } from 'react';

export const useFullscreenWarning = (testId: string) => {
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [requiresManualAction, setRequiresManualAction] = useState(false);
  const [visibilityWarningCount, setVisibilityWarningCount] = useState(0);

  const getFullscreenLocalStorageKey = useCallback(() => `fullscreen_warning_${testId}`, [testId]);
  const getVisibilityLocalStorageKey = useCallback(() => `visibility_warning_${testId}`, [testId]);

  useEffect(() => {
    const savedFullscreenCount = localStorage.getItem(getFullscreenLocalStorageKey());
    const initialFullscreenCount = savedFullscreenCount ? parseInt(savedFullscreenCount, 10) : 0;
    setWarningCount(initialFullscreenCount);

    const savedVisibilityCount = localStorage.getItem(getVisibilityLocalStorageKey());
    const initialVisibilityCount = savedVisibilityCount ? parseInt(savedVisibilityCount, 10) : 0;
    setVisibilityWarningCount(initialVisibilityCount);

    if (initialFullscreenCount >= 1 || initialVisibilityCount >= 1) {
      setIsLocked(true);
    }
  }, [getFullscreenLocalStorageKey, getVisibilityLocalStorageKey]);

  const enterFullscreen = useCallback(() => {
    setRequiresManualAction(false);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        if (err.name === 'NotAllowedError') {
          setRequiresManualAction(true);
          setWarningMessage('You must be in fullscreen to continue the test. Click here to re-enter.');
          setShowWarning(true);
        } else {
          console.error('Error attempting to enable full-screen mode:', err.message, `(${err.name})`);
        }
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isLocked) {
        const newCount = warningCount + 1;
        setWarningCount(newCount);
        localStorage.setItem(getFullscreenLocalStorageKey(), newCount.toString());

        if (newCount >= 1) {
          setWarningMessage('TEST LOCKED: You have exited fullscreen mode multiple times.');
          setIsLocked(true);
        } else {
          setWarningMessage('You must be in fullscreen to continue. Click to re-enter.');
          setRequiresManualAction(true); // Force user action
        }

        setShowWarning(true);
      } else if (document.fullscreenElement) {
        setShowWarning(false);
        setRequiresManualAction(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [warningCount, getFullscreenLocalStorageKey, enterFullscreen, isLocked]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isLocked) {
        const newCount = visibilityWarningCount + 1;
        setVisibilityWarningCount(newCount);
        localStorage.setItem(getVisibilityLocalStorageKey(), newCount.toString());

        if (newCount === 1) {
          setWarningMessage('Warning: You have switched tabs. This is your 1st and final warning.');
        } else if (newCount >= 1) {
          setWarningMessage('TEST LOCKED: You have switched tabs multiple times.');
          setIsLocked(true);
        }

        setShowWarning(true);
        if (newCount < 1) {
          setTimeout(() => setShowWarning(false), 5000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [visibilityWarningCount, getVisibilityLocalStorageKey, isLocked]);

  return { isLocked, showWarning, warningMessage, requiresManualAction, enterFullscreen };
};