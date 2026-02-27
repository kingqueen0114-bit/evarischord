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

    // Global keyboard shortcuts (CLAUDE.md Step 8)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMeta = e.metaKey || e.ctrlKey;
            const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;

            // --- Shortcuts that work even in input fields ---

            // Ctrl+S / Cmd+S: Save
            if (isMeta && e.key === 's') {
                e.preventDefault();
                const sb = useEditorStore.getState().storyboard;
                if (sb) {
                    fetch('/api/storyboard', { method: 'PUT', body: JSON.stringify(sb) })
                        .then(res => { if (!res.ok) console.error('Save failed'); })
                        .catch(err => console.error('Save error:', err));
                }
                return;
            }

            // Ctrl+Z / Cmd+Z: Undo
            if (isMeta && !e.shiftKey && e.key === 'z') {
                e.preventDefault();
                const state = useEditorStore.getState();
                if (state.canUndo()) state.undo();
                return;
            }

            // Ctrl+Shift+Z / Cmd+Shift+Z: Redo
            if (isMeta && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                const state = useEditorStore.getState();
                if (state.canRedo()) state.redo();
                return;
            }

            // --- Shortcuts that only work when NOT in input fields ---
            if (isInput) return;

            // Delete / Backspace: Delete selected element
            if (e.key === 'Backspace' || e.key === 'Delete') {
                if (selectedBubbleId && selectedPanelId) {
                    deleteBubble(selectedPanelId, selectedBubbleId, selectedSubPanelId || undefined);
                    e.preventDefault();
                } else if (selectedSfxId && selectedPanelId) {
                    deleteSfx(selectedPanelId, selectedSfxId, selectedSubPanelId || undefined);
                    e.preventDefault();
                }
                return;
            }

            // Escape: Deselect
            if (e.key === 'Escape') {
                e.preventDefault();
                const store = useEditorStore.getState();
                if (store.selectedBubbleId) { store.selectBubble(null); }
                else if (store.selectedSfxId) { store.selectSfx(null); }
                else if (store.selectedPanelId) { store.selectPanel(null); }
                return;
            }

            // 1-4: Tool mode switching
            if (e.key === '1') { useEditorStore.getState().setToolMode('select'); return; }
            if (e.key === '2') { useEditorStore.getState().setToolMode('bubble'); return; }
            if (e.key === '3') { useEditorStore.getState().setToolMode('sfx'); return; }
            if (e.key === '4') { useEditorStore.getState().setToolMode('narration'); return; }

            // ↑↓: Navigate panels
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const state = useEditorStore.getState();
                const panels = state.storyboard?.panels;
                if (!panels || panels.length === 0) return;
                const currentIdx = panels.findIndex(p => p.id === state.selectedPanelId);
                let newIdx: number;
                if (e.key === 'ArrowUp') {
                    newIdx = currentIdx <= 0 ? panels.length - 1 : currentIdx - 1;
                } else {
                    newIdx = currentIdx >= panels.length - 1 ? 0 : currentIdx + 1;
                }
                state.selectPanel(panels[newIdx].id);
                // Scroll to the panel
                const el = document.getElementById(`panel-${panels[newIdx].id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Ctrl+D / Cmd+D: Duplicate selected element
            if (isMeta && e.key === 'd') {
                e.preventDefault();
                const state = useEditorStore.getState();
                if (!state.selectedPanelId || !state.storyboard) return;
                const panel = state.storyboard.panels.find(p => p.id === state.selectedPanelId);
                if (!panel) return;

                if (state.selectedBubbleId) {
                    // Find the bubble (in panel or sub-panel)
                    let bubble = panel.bubbles.find(b => b.id === state.selectedBubbleId);
                    let subPanelId: string | undefined;
                    if (!bubble && panel.sub_panels) {
                        for (const sp of panel.sub_panels) {
                            const found = sp.bubbles.find(b => b.id === state.selectedBubbleId);
                            if (found) { bubble = found; subPanelId = sp.id; break; }
                        }
                    }
                    if (bubble) {
                        const newId = `bubble-${Date.now()}`;
                        state.addBubble(state.selectedPanelId, {
                            ...bubble,
                            id: newId,
                            position: { x: bubble.position.x + 5, y: bubble.position.y + 5 }
                        }, subPanelId || state.selectedSubPanelId || undefined);
                        state.selectBubble(newId);
                    }
                } else if (state.selectedSfxId) {
                    let sfx = panel.sfx.find(s => s.id === state.selectedSfxId);
                    let subPanelId: string | undefined;
                    if (!sfx && panel.sub_panels) {
                        for (const sp of panel.sub_panels) {
                            const found = sp.sfx.find(s => s.id === state.selectedSfxId);
                            if (found) { sfx = found; subPanelId = sp.id; break; }
                        }
                    }
                    if (sfx) {
                        const newId = `sfx-${Date.now()}`;
                        state.addSfx(state.selectedPanelId, {
                            ...sfx,
                            id: newId,
                            position: { x: sfx.position.x + 5, y: sfx.position.y + 5 }
                        }, subPanelId || state.selectedSubPanelId || undefined);
                        state.selectSfx(newId);
                    }
                }
                return;
            }

            // Ctrl+E / Cmd+E: Export selected panel
            if (isMeta && e.key === 'e') {
                e.preventDefault();
                const state = useEditorStore.getState();
                if (!state.selectedPanelId) return;
                const panelNode = document.getElementById(`panel-${state.selectedPanelId}`);
                if (!panelNode) return;
                const stageContainers = panelNode.querySelectorAll('.konvajs-content');
                if (!stageContainers || stageContainers.length === 0) return;
                stageContainers.forEach((container, index) => {
                    const canvas = container.querySelector('canvas');
                    if (!canvas) return;
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    const link = document.createElement('a');
                    const suffix = stageContainers.length > 1 ? `-f${index + 1}` : '';
                    link.download = `panel-${state.selectedPanelId}${suffix}.jpg`;
                    link.href = dataUrl;
                    link.click();
                });
                return;
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
