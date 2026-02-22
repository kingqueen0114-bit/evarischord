'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';

export default function GutterHandle({
    panelId,
    subPanelId,
    currentGap,
    bgColor
}: {
    panelId: string,
    subPanelId?: string,
    currentGap: number,
    bgColor: string
}) {
    const updateGutter = useEditorStore(state => state.updateGutter);
    const updateGutterColorAll = useEditorStore(state => state.updateGutterColorAll);
    const selectPanel = useEditorStore(state => state.selectPanel);

    const [isDragging, setIsDragging] = useState(false);
    const [gapY, setGapY] = useState(currentGap);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const handleColorChange = (newColor: string) => {
        updateGutter(panelId, gapY, newColor, subPanelId);
    };

    const handleApplyAll = (color: string) => {
        updateGutterColorAll(color);
        setShowColorPicker(false);
    };

    // Exceedingly basic dragging logic for Phase 1 MVP
    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        selectPanel(panelId);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        // We update local state first to feel responsive
        // In a real scenario we'd track starting Y vs current Y, 
        // but for MVP let's just make it simple slider-like using movementY, corrected for canvas zoom
        const currentZoom = useEditorStore.getState().zoom;
        setGapY(prev => Math.max(0, prev + (e.movementY / currentZoom)));
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        updateGutter(panelId, gapY, bgColor, subPanelId);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    // Keep synced if prop changes externally
    useEffect(() => {
        setGapY(currentGap);
    }, [currentGap]);

    return (
        <div
            className="w-full relative group"
            style={{ height: gapY }}
        >
            {/* Height adjustment event layer */}
            <div
                className="absolute inset-0 z-0 cursor-ns-resize pointer-events-auto"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            />

            {/* Drag handle overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10 
                      opacity-0 group-hover:opacity-100 transition-opacity">

                {/* Drag Indicator */}
                <div className="bg-black/60 text-white text-xs px-2 py-1 rounded cursor-ns-resize backdrop-blur pointer-events-none">
                    ↕ {gapY}px
                </div>

                {/* Color Button */}
                <div className="relative pointer-events-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                        className="w-6 h-6 rounded border border-white/50 shadow-md cursor-pointer hover:scale-110 transition-transform flex items-center justify-center bg-black/60"
                        title="背景色を変更"
                    >
                        <div className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: bgColor }} />
                    </button>

                    {/* Color Menu */}
                    {showColorPicker && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[var(--surface)] border border-[var(--border)] p-2 rounded shadow-xl flex flex-col gap-2 z-50">
                            <div className="flex gap-2">
                                <button className="w-6 h-6 rounded-full bg-white border border-gray-300" onClick={() => handleColorChange('#ffffff')} title="白" />
                                <button className="w-6 h-6 rounded-full bg-black border border-gray-600" onClick={() => handleColorChange('#000000')} title="黒" />
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => handleColorChange(e.target.value)}
                                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                                    title="カスタム色"
                                />
                            </div>
                            <button
                                onClick={() => handleApplyAll(bgColor)}
                                className="text-[10px] text-white bg-[var(--accent)] hover:bg-opacity-80 rounded px-2 py-1 whitespace-nowrap w-full"
                            >
                                全ガターに適用
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Minimum interactive area if gap is 0 or very small */}
            {gapY < 20 && (
                <div
                    className="absolute top-1/2 left-0 w-full h-8 -translate-y-1/2 cursor-ns-resize z-0 pointer-events-auto"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                />
            )}
        </div>
    );
}
