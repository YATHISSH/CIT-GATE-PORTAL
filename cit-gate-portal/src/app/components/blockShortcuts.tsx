'use client';

import { useEffect } from 'react';

export default function useBlockShortcuts() {
    useEffect(() => {
        const enterFullscreen = () => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        };
        enterFullscreen();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                e.ctrlKey || e.shiftKey ||
                (e.altKey && e.key === 'F4')
            ) {
                e.preventDefault();
            }

            if (e.key === 'F1' || e.key === 'F2' || e.key === 'F3' || e.key === 'F4' || e.key === 'F5' || (e.ctrlKey && e.key === 'r') || e.key === 'F6' || e.key === 'F7' || e.key === 'F8' || e.key === 'F9' || e.key === 'F10' || e.key === 'F11') {
                e.preventDefault();
            }
            if (['Alt', 'Control', 'Shift', 'Tab', 'Meta'].includes(e.key)) {
                e.preventDefault();
            }
            if (e.altKey || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
            }

            if (e.key === 'Escape' || (e.altKey && e.key === 'F4') ||
                (e.ctrlKey && e.altKey)) {
                e.preventDefault();
            }

            if (e.ctrlKey && e.key.toLowerCase() === 'w') {
                e.preventDefault();
            }
        };

        const handleCopy = (e: ClipboardEvent) => e.preventDefault();
        const handlePaste = (e: ClipboardEvent) => e.preventDefault();

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);


        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch((err) => console.error('Error exiting fullscreen:', err));
            }
        };
    }, []);

}
