'use client';

import { useState, useEffect, useCallback } from 'react';

export const useFullscreenWarning = (testId: string) => {
  const [isLocked, setIsLocked] = useState(false);

  const getFullscreenLocalStorageKey = useCallback(() => `fullscreen_warning_${testId}`, [testId]);
  const getVisibilityLocalStorageKey = useCallback(() => `visibility_warning_${testId}`, [testId]);

  useEffect(() => {
    const savedFullscreenLock = localStorage.getItem(getFullscreenLocalStorageKey());
    const savedVisibilityLock = localStorage.getItem(getVisibilityLocalStorageKey());

    if (savedFullscreenLock || savedVisibilityLock) {
      setIsLocked(true);
    }
  }, [getFullscreenLocalStorageKey, getVisibilityLocalStorageKey]);

  const enterFullscreen = useCallback(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err.message, `(${err.name})`);
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isLocked) {
        localStorage.setItem(getFullscreenLocalStorageKey(), 'locked');
        setIsLocked(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [getFullscreenLocalStorageKey, isLocked]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isLocked) {
        localStorage.setItem(getVisibilityLocalStorageKey(), 'locked');
        setIsLocked(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getVisibilityLocalStorageKey, isLocked]);

  return { isLocked, enterFullscreen };
};
