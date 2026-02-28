'use client';

import React, { useEffect, useRef } from 'react';

export interface ContextMenuItem {
    label: string;
    icon?: string;
    action: () => void;
    disabled?: boolean;
    danger?: boolean;
    divider?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        const handleScroll = () => onClose();

        // Use capture to close before other handlers fire
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('keydown', handleEscape);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('keydown', handleEscape);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [onClose]);

    // Adjust position to keep menu visible within viewport
    useEffect(() => {
        if (!menuRef.current) return;
        const rect = menuRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let adjustedX = x;
        let adjustedY = y;

        if (x + rect.width > vw) adjustedX = vw - rect.width - 8;
        if (y + rect.height > vh) adjustedY = vh - rect.height - 8;
        if (adjustedX < 0) adjustedX = 8;
        if (adjustedY < 0) adjustedY = 8;

        if (adjustedX !== x || adjustedY !== y) {
            menuRef.current.style.left = `${adjustedX}px`;
            menuRef.current.style.top = `${adjustedY}px`;
        }
    }, [x, y]);

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[180px] bg-[#1a1a22] border border-[var(--border)] rounded-lg shadow-2xl shadow-black/60 py-1 select-none"
            style={{ left: x, top: y }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {items.map((item, idx) => {
                if (item.divider) {
                    return <div key={idx} className="h-px bg-[var(--border)] my-1" />;
                }
                return (
                    <button
                        key={idx}
                        className={`
                            w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors
                            ${item.disabled
                                ? 'text-[var(--color-text-dim)] cursor-not-allowed opacity-40'
                                : item.danger
                                    ? 'text-[var(--color-danger)] hover:bg-red-500/10'
                                    : 'text-[var(--color-text-main)] hover:bg-[var(--accent)]/15'
                            }
                        `}
                        disabled={item.disabled}
                        onClick={() => {
                            if (!item.disabled) {
                                item.action();
                                onClose();
                            }
                        }}
                    >
                        {item.icon && <span className="text-base w-5 text-center">{item.icon}</span>}
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
