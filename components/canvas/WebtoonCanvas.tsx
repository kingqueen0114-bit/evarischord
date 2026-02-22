'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editorStore';
import PanelItem from './PanelItem';

export default function WebtoonCanvas() {
    const storyboard = useEditorStore(state => state.storyboard);
    const zoom = useEditorStore(state => state.zoom);
    const selectedPanelId = useEditorStore(state => state.selectedPanelId);
    const selectedSubPanelId = useEditorStore(state => state.selectedSubPanelId);
    const selectedBubbleId = useEditorStore(state => state.selectedBubbleId);
    const selectedSfxId = useEditorStore(state => state.selectedSfxId);
    const deleteBubble = useEditorStore(state => state.deleteBubble);
    const deleteSfx = useEditorStore(state => state.deleteSfx);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input or textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Backspace' || e.key === 'Delete') {
                if (selectedBubbleId && selectedPanelId) {
                    deleteBubble(selectedPanelId, selectedBubbleId, selectedSubPanelId || undefined);
                    e.preventDefault(); // Prevent navigating back
                } else if (selectedSfxId && selectedPanelId) {
                    deleteSfx(selectedPanelId, selectedSfxId, selectedSubPanelId || undefined);
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPanelId, selectedSubPanelId, selectedBubbleId, selectedSfxId, deleteBubble, deleteSfx]);

    if (!storyboard) return null;

    return (
        <div className="w-full h-full bg-[var(--background)] overflow-auto pb-96 flex justify-center">
            <div
                className="flex flex-col items-center origin-top transition-transform duration-200"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
                {storyboard.panels.map(panel => (
                    <PanelItem key={panel.id} panel={panel} />
                ))}
            </div>
        </div>
    );
}
