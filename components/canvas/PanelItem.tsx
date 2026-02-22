'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Panel } from '@/types/storyboard';
import { useEditorStore } from '@/stores/editorStore';
import ImageReplacer from '@/components/ui/ImageReplacer';
import GutterHandle from '@/components/ui/GutterHandle';

// Dynamically import PanelStage to avoid SSR issues with Konva window access
const PanelStageNoSSR = dynamic(() => import('./PanelStage'), {
    ssr: false,
    loading: () => <div className="w-[800px] h-[300px] bg-[var(--surface)] text-[var(--color-text-dim)] flex items-center justify-center">Loading Canvas...</div>
});

export default function PanelItem({ panel }: { panel: Panel }) {
    const selectedPanelId = useEditorStore(state => state.selectedPanelId);
    const selectedSubPanelId = useEditorStore(state => state.selectedSubPanelId);
    const selectPanel = useEditorStore(state => state.selectPanel);
    const selectSubPanel = useEditorStore(state => state.selectSubPanel);
    const [stageHeight, setStageHeight] = useState(300);
    const [layouts, setLayouts] = useState<any>(null);

    const isSelected = selectedPanelId === panel.id;
    const isSplit = panel.split_mode === 'equal' || panel.split_mode === 'manual';

    // Split preview state
    const [isSplitting, setIsSplitting] = useState(false);
    const [previewFrames, setPreviewFrames] = useState(panel.frame_count || 4);
    const [previewPositions, setPreviewPositions] = useState<number[]>([]);
    const [splitColor, setSplitColor] = useState(panel.gap_color || '#ffffff');

    // Initialize preview positions when entering split mode
    const startSplitting = () => {
        setIsSplitting(true);
        const frames = panel.frame_count || 4;
        setPreviewFrames(frames);
        setPreviewPositions(Array.from({ length: frames + 1 }, (_, i) => i / frames));
    };

    const confirmSplit = () => {
        useEditorStore.getState().splitPanel(panel.id, previewFrames, previewPositions, splitColor);
        setIsSplitting(false);
    };

    const cancelSplit = () => {
        setIsSplitting(false);
    };

    // Handle dragging of a split line
    const handleLineDrag = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        const container = e.currentTarget.parentElement;
        if (!container) return;

        const startY = e.clientY;
        const startPos = previewPositions[index];
        const height = container.clientHeight;

        const onMove = (moveEvent: PointerEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const deltaPos = deltaY / height;
            let newPos = startPos + deltaPos;

            // Constrain between previous and next lines
            const minPos = previewPositions[index - 1] + 0.05; // 5% minimum gap
            const maxPos = previewPositions[index + 1] - 0.05;
            newPos = Math.max(minPos, Math.min(newPos, maxPos));

            setPreviewPositions(prev => {
                const updated = [...prev];
                updated[index] = newPos;
                return updated;
            });
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    return (
        <div
            id={`panel-${panel.id}`}
            className="w-full flex flex-col items-center relative"
        >
            {/* Split Toolbar superimposed on the container */}
            <div className="absolute top-2 left-2 flex gap-2 opacity-50 hover:opacity-100 transition-opacity z-50">
                {!isSplit && !isSplitting && (
                    <button
                        title="コマを分割"
                        onClick={startSplitting}
                        className="bg-black/80 text-white rounded p-2 text-xs font-bold hover:bg-[var(--accent)] shadow-lg flex items-center gap-1"
                    >
                        <span>🔪</span> <span className="hidden sm:inline">分割する</span>
                    </button>
                )}

                {isSplit && !isSplitting && (
                    <button
                        title="結合に戻す"
                        onClick={() => useEditorStore.getState().joinPanel(panel.id)}
                        className="bg-black/80 text-white rounded p-2 text-xs font-bold hover:bg-gray-600 shadow-lg flex items-center gap-1"
                    >
                        <span>🔗</span> <span className="hidden sm:inline">結合に戻す</span>
                    </button>
                )}
            </div>

            {/* Unified Render Logic */}
            <div className="w-full flex flex-col items-center" onClick={(e) => {
                if ((e.target as HTMLElement).closest('.konvajs-content') || (e.target as HTMLElement).closest('.gutter-handle')) return;
                e.stopPropagation();
                selectPanel(panel.id);
            }}>
                <div
                    className={`
                      w-[800px] max-w-full relative group transition-all
                      ${isSelected && !isSplitting ? 'ring-4 ring-[var(--accent)] ring-offset-4 ring-offset-[var(--background)]' : ''}
                      ${isSplitting ? 'ring-4 ring-blue-500' : ''}
                    `}
                >
                    {/* Parent Panel Image Replacer (only if not split or if we want one global fallback) */}
                    {!isSplit && <ImageReplacer panelId={panel.id} />}

                    <div className="relative z-10">
                        <PanelStageNoSSR
                            panel={panel}
                            width={800}
                            onLayoutCalculated={(newLayouts: any) => {
                                setLayouts(newLayouts);
                                setStageHeight(newLayouts.totalHeight);
                            }}
                        />
                    </div>

                    {/* --- UNIFIED GUTTER HANDLES OVERLAY --- */}
                    {!isSplitting && layouts && layouts.subPanels.map((layoutItem: any, idx: number) => {
                        if (layoutItem.isMock) return null; // Standard full panel doesn't draw a floating gutter in the middle
                        return (
                            <div key={`sp-ui-${idx}`}>
                                <div
                                    className="absolute left-0 w-full z-20 gutter-handle pointer-events-none"
                                    style={{ top: layoutItem.gapY }}
                                >
                                    <GutterHandle
                                        panelId={panel.id}
                                        subPanelId={layoutItem.sp.id}
                                        currentGap={layoutItem.gapH}
                                        bgColor={layoutItem.sp.gap_color || panel.gap_color}
                                    />
                                </div>
                                {/* Per-SubPanel Image Replacer */}
                                <div
                                    className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto"
                                    style={{ top: layoutItem.imageY + 8 }}
                                >
                                    <ImageReplacer panelId={panel.id} subPanelId={layoutItem.sp.id} />
                                </div>
                            </div>
                        );
                    })}

                    {/* --- SPLIT PREVIEW OVERLAY --- */}
                    {isSplitting && (
                        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden touch-none">
                            {/* Backdrop dim */}
                            <div className="absolute inset-0 bg-black/20" />

                            {/* Draggable Split Lines */}
                            {previewPositions.map((pos, idx) => {
                                if (idx === 0 || idx === previewPositions.length - 1) return null; // Don't show top/bottom edges

                                return (
                                    <div
                                        key={idx}
                                        className="absolute left-0 w-full h-8 -mt-4 cursor-ns-resize pointer-events-auto flex items-center justify-center group"
                                        style={{ top: `${pos * 100}%` }}
                                        onPointerDown={(e) => handleLineDrag(idx, e)}
                                    >
                                        <div className="w-full h-1 border-t-2 border-dashed border-white shadow-[0_0_4px_rgba(0,0,0,0.8)] group-hover:border-blue-400 group-hover:border-solid transition-colors" />
                                        {/* Handle indicator */}
                                        <div className="absolute right-4 bg-blue-500 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                            ドラッグして調整
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Bottom Control Bar */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center justify-between gap-4 bg-black/90 text-white px-4 py-3 rounded-lg shadow-xl backdrop-blur-md border border-white/20 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">分割数:</span>
                                    <select
                                        value={previewFrames}
                                        onChange={(e) => {
                                            const f = Number(e.target.value);
                                            setPreviewFrames(f);
                                            setPreviewPositions(Array.from({ length: f + 1 }, (_, i) => i / f));
                                        }}
                                        className="bg-[var(--surface)] text-[var(--color-text)] text-sm rounded border border-[var(--border)] px-2 py-1 outline-none"
                                    >
                                        {[2, 3, 4, 5].map(n => (
                                            <option key={n} value={n}>{n}コマ</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-[1px] h-6 bg-white/20" />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">ガター色:</span>
                                    <input
                                        type="color"
                                        value={splitColor}
                                        onChange={(e) => setSplitColor(e.target.value)}
                                        className="w-6 h-6 rounded cursor-pointer border border-white/20"
                                    />
                                </div>
                                <div className="w-[1px] h-6 bg-white/20" />
                                <div className="flex items-center gap-2">
                                    <button onClick={cancelSplit} className="px-3 py-1.5 rounded bg-gray-600 hover:bg-gray-500 text-sm font-bold transition-colors">
                                        キャンセル
                                    </button>
                                    <button onClick={confirmSplit} className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm font-bold transition-colors shadow-lg shadow-blue-900/50">
                                        確定 ✅
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isSplitting && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur opacity-50 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            800px × {Math.round(stageHeight)}px • {panel.label}
                            {panel.sub_panels && panel.sub_panels.length > 0 && ` (${panel.sub_panels.length}コマ)`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
