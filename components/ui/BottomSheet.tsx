'use client';

import React, { useState, useRef, useCallback } from 'react';

interface BottomSheetProps {
    open: boolean;
    children: React.ReactNode;
}

export default function BottomSheet({ open, children }: BottomSheetProps) {
    const [height, setHeight] = useState(
        typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.45) : 380
    ); // Default: 45% of viewport height
    const isDragging = useRef(false);
    const startY = useRef(0);
    const startHeight = useRef(0);

    const MIN_HEIGHT = 200;
    const MAX_HEIGHT = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 700;

    const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        isDragging.current = true;
        startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
        startHeight.current = height;
        document.body.style.userSelect = 'none';
    }, [height]);

    const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
        if (!isDragging.current) return;
        const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const diff = startY.current - currentY;
        const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight.current + diff));
        setHeight(newHeight);
    }, [MAX_HEIGHT]);

    const handleDragEnd = useCallback(() => {
        isDragging.current = false;
        document.body.style.userSelect = '';
    }, []);

    React.useEffect(() => {
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [handleDragMove, handleDragEnd]);

    return (
        <div
            className={`
                fixed bottom-0 left-0 right-0 z-50
                bg-[var(--surface)] border-t border-[var(--border)]
                shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
                transition-transform duration-300 ease-out
                ${open ? 'translate-y-0' : 'translate-y-full'}
            `}
            style={{ height: `${height}px` }}
        >
            {/* Drag Handle */}
            <div
                className="flex items-center justify-center h-8 cursor-grab active:cursor-grabbing touch-none"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                <div className="w-10 h-1 bg-[var(--border)] rounded-full" />
            </div>

            {/* Content */}
            <div className="h-[calc(100%-2rem)] overflow-hidden">
                {children}
            </div>
        </div>
    );
}
