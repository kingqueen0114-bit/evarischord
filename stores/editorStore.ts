import { create } from 'zustand';
import { Storyboard, Panel, Bubble, Sfx, ToolMode, EditTab, SfxPreset } from '@/types/storyboard';

interface EditorState {
    // Data
    storyboard: Storyboard | null;

    // UI
    toolMode: ToolMode;
    selectedPanelId: string | null;
    selectedSubPanelId: string | null;
    selectedBubbleId: string | null;
    selectedSfxId: string | null;
    editTab: EditTab;
    editPanelOpen: boolean;
    zoom: number;
    customSfxPresets: SfxPreset[];

    // Undo/Redo
    history: string[];     // JSON snapshots
    historyIndex: number;

    // Actions
    setStoryboard: (sb: Storyboard) => void;
    setToolMode: (mode: ToolMode) => void;
    selectPanel: (id: string | null) => void;
    selectSubPanel: (id: string | null) => void;
    selectBubble: (id: string | null) => void;
    selectSfx: (id: string | null) => void;
    setEditTab: (tab: EditTab) => void;
    setEditPanelOpen: (open: boolean) => void;
    setZoom: (zoom: number) => void;

    // Edit operations (all push to history first)
    updatePanel: (panelId: string, updates: Partial<Panel>) => void;
    splitPanel: (panelId: string, frames?: number, positions?: number[], color?: string) => void;
    joinPanel: (panelId: string) => void;
    updateBubble: (panelId: string, bubbleId: string, updates: Partial<Bubble>, subPanelId?: string) => void;
    addBubble: (panelId: string, bubble: Bubble, subPanelId?: string) => void;
    deleteBubble: (panelId: string, bubbleId: string, subPanelId?: string) => void;
    updateSfx: (panelId: string, sfxId: string, updates: Partial<Sfx>, subPanelId?: string) => void;
    addSfx: (panelId: string, sfx: Sfx, subPanelId?: string) => void;
    deleteSfx: (panelId: string, sfxId: string, subPanelId?: string) => void;
    replaceImage: (panelId: string, newSrc: string, subPanelId?: string) => void;
    updateGutter: (panelId: string, gap: number, color?: string, subPanelId?: string) => void;
    updateGutterColorAll: (color: string) => void;
    updatePanelSize: (panelId: string, heightRatio: number, cropOffsetY: number, subPanelId?: string) => void;

    // Undo/Redo
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;

    // Presets
    loadCustomSfxPresets: () => void;
    addCustomSfxPreset: (preset: SfxPreset) => void;
    deleteCustomSfxPreset: (presetId: string) => void;

    // Helpers
    getPanel: (id: string) => Panel | undefined;
    getAllPanels: () => Panel[];
}

const pushHistory = (state: EditorState, newStoryboard: Storyboard) => {
    const currentSnap = JSON.stringify(newStoryboard);
    // Remove future history if we're not at the end
    const history = state.history.slice(0, state.historyIndex + 1);
    history.push(currentSnap);
    if (history.length > 50) history.shift(); // Max 50 history entries
    return { history, historyIndex: history.length - 1, storyboard: newStoryboard };
};

export const useEditorStore = create<EditorState>((set, get) => ({
    storyboard: null,

    toolMode: 'select',
    selectedPanelId: null,
    selectedSubPanelId: null,
    selectedBubbleId: null,
    selectedSfxId: null,
    editTab: 'text',
    editPanelOpen: false,
    zoom: 1.0,
    customSfxPresets: [],

    history: [],
    historyIndex: -1,

    setStoryboard: (sb) => set((state) => {
        const snap = JSON.stringify(sb);
        return { storyboard: sb, history: [snap], historyIndex: 0 };
    }),

    setToolMode: (mode) => set({ toolMode: mode }),
    selectPanel: (id) => set({ selectedPanelId: id, selectedSubPanelId: null, selectedBubbleId: null, selectedSfxId: null }),
    selectSubPanel: (id) => set({ selectedSubPanelId: id }),
    selectBubble: (id) => set((state) => {
        if (!state.storyboard || !id) return { selectedBubbleId: id };
        let didMoveItem = false;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                let changed = false;
                let newBubbles = p.bubbles;
                const bIdx = p.bubbles.findIndex(b => b.id === id);
                if (bIdx !== -1) {
                    newBubbles = [...p.bubbles];
                    const [b] = newBubbles.splice(bIdx, 1);
                    newBubbles.push(b);
                    changed = true;
                    didMoveItem = true;
                }

                let newSubPanels = p.sub_panels;
                if (p.sub_panels) {
                    newSubPanels = p.sub_panels.map(sp => {
                        const sbIdx = sp.bubbles.findIndex(b => b.id === id);
                        if (sbIdx !== -1) {
                            changed = true;
                            didMoveItem = true;
                            const spb = [...sp.bubbles];
                            const [b] = spb.splice(sbIdx, 1);
                            spb.push(b);
                            return { ...sp, bubbles: spb };
                        }
                        return sp;
                    });
                }

                if (changed) {
                    return { ...p, bubbles: newBubbles, sub_panels: newSubPanels };
                }
                return p;
            })
        };
        return { storyboard: didMoveItem ? newSb : state.storyboard, selectedBubbleId: id };
    }),

    selectSfx: (id) => set((state) => {
        if (!state.storyboard || !id) return { selectedSfxId: id };
        let didMoveItem = false;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                let changed = false;
                let newSfx = p.sfx;
                const sIdx = p.sfx.findIndex(s => s.id === id);
                if (sIdx !== -1) {
                    newSfx = [...p.sfx];
                    const [s] = newSfx.splice(sIdx, 1);
                    newSfx.push(s);
                    changed = true;
                    didMoveItem = true;
                }

                let newSubPanels = p.sub_panels;
                if (p.sub_panels) {
                    newSubPanels = p.sub_panels.map(sp => {
                        const ssIdx = sp.sfx.findIndex(s => s.id === id);
                        if (ssIdx !== -1) {
                            changed = true;
                            didMoveItem = true;
                            const sps = [...sp.sfx];
                            const [s] = sps.splice(ssIdx, 1);
                            sps.push(s);
                            return { ...sp, sfx: sps };
                        }
                        return sp;
                    });
                }

                if (changed) {
                    return { ...p, sfx: newSfx, sub_panels: newSubPanels };
                }
                return p;
            })
        };
        return { storyboard: didMoveItem ? newSb : state.storyboard, selectedSfxId: id };
    }),
    setEditTab: (tab) => set({ editTab: tab }),
    setEditPanelOpen: (open) => set({ editPanelOpen: open }),
    setZoom: (zoom) => set({ zoom }),

    updatePanel: (panelId, updates) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = { ...state.storyboard, panels: state.storyboard.panels.map(p => p.id === panelId ? { ...p, ...updates } : p) };
        return pushHistory(state, newSb);
    }),

    splitPanel: (panelId, frames = 4, positions, color) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;

                // Use provided positions, or calculate equal divisions
                const actualPositions = positions || Array.from({ length: frames + 1 }, (_, i) => i / frames);

                const sub_panels = [];
                for (let i = 0; i < frames; i++) {
                    const y_start = actualPositions[i];
                    const y_end = actualPositions[i + 1];
                    sub_panels.push({
                        id: `${p.id}-f${i + 1}`,
                        y_start,
                        y_end,
                        gap_before: 0, // Defaults to 0 for internal split. Top gap remains on panel.
                        gap_color: color || p.gap_color || '#ffffff',
                        bubbles: [],
                        sfx: []
                    });
                }

                return {
                    ...p,
                    frame_count: frames,
                    split_mode: positions ? 'manual' : 'equal',
                    split_positions: actualPositions,
                    sub_panels
                } as Panel;
            })
        };
        return pushHistory(state, newSb);
    }),

    joinPanel: (panelId) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;
                return {
                    ...p,
                    split_mode: 'none',
                    sub_panels: []
                } as Panel;
            })
        };
        return pushHistory(state, newSb);
    }),

    updateBubble: (panelId, bubbleId, updates, subPanelId) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;
                if (subPanelId && p.sub_panels) {
                    return {
                        ...p,
                        sub_panels: p.sub_panels.map(sp => sp.id === subPanelId ? { ...sp, bubbles: sp.bubbles.map(b => b.id === bubbleId ? { ...b, ...updates } : b) } : sp)
                    };
                }
                return { ...p, bubbles: p.bubbles.map(b => b.id === bubbleId ? { ...b, ...updates } : b) };
            })
        };
        return pushHistory(state, newSb);
    }),

    addBubble: (panelId, bubble, subPanelId) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;
                if (subPanelId && p.sub_panels) {
                    return {
                        ...p,
                        sub_panels: p.sub_panels.map(sp => sp.id === subPanelId ? { ...sp, bubbles: [...sp.bubbles, bubble] } : sp)
                    };
                }
                return { ...p, bubbles: [...p.bubbles, bubble] };
            })
        };
        return pushHistory(state, newSb);
    }),

    deleteBubble: (panelId, bubbleId, subPanelId) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;
                if (subPanelId && p.sub_panels) {
                    return {
                        ...p,
                        sub_panels: p.sub_panels.map(sp => sp.id === subPanelId ? { ...sp, bubbles: sp.bubbles.filter(b => b.id !== bubbleId) } : sp)
                    };
                }
                return { ...p, bubbles: p.bubbles.filter(b => b.id !== bubbleId) };
            })
        };
        return pushHistory(state, newSb);
    }),

    updateSfx: (panelId, sfxId, updates, subPanelId) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;
                if (subPanelId && p.sub_panels) {
                    return {
                        ...p,
                        sub_panels: p.sub_panels.map(sp => sp.id === subPanelId ? { ...sp, sfx: sp.sfx.map(s => s.id === sfxId ? { ...s, ...updates } : s) } : sp)
                    };
                }
                return { ...p, sfx: p.sfx.map(s => s.id === sfxId ? { ...s, ...updates } : s) };
            })
        };
        return pushHistory(state, newSb);
    }),

    addSfx: (panelId, sfx, subPanelId) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;
                if (subPanelId && p.sub_panels) {
                    return {
                        ...p,
                        sub_panels: p.sub_panels.map(sp => sp.id === subPanelId ? { ...sp, sfx: [...sp.sfx, sfx] } : sp)
                    };
                }
                return { ...p, sfx: [...p.sfx, sfx] };
            })
        };
        return pushHistory(state, newSb);
    }),

    deleteSfx: (panelId, sfxId, subPanelId) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;
                if (subPanelId && p.sub_panels) {
                    return {
                        ...p,
                        sub_panels: p.sub_panels.map(sp => sp.id === subPanelId ? { ...sp, sfx: sp.sfx.filter(s => s.id !== sfxId) } : sp)
                    };
                }
                return { ...p, sfx: p.sfx.filter(s => s.id !== sfxId) };
            })
        };
        return pushHistory(state, newSb);
    }),

    replaceImage: (panelId, newSrc, subPanelId) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;

                if (subPanelId && p.sub_panels) {
                    return {
                        ...p,
                        sub_panels: p.sub_panels.map(sp => {
                            if (sp.id !== subPanelId) return sp;
                            const currentSrc = sp.override_image?.src || p.image.src;
                            const history = sp.override_image?.history || [];
                            return {
                                ...sp,
                                override_image: {
                                    src: newSrc,
                                    history: [...history, currentSrc]
                                }
                            };
                        })
                    };
                }

                const currentSrc = p.image.src;
                return {
                    ...p,
                    image: {
                        ...p.image,
                        src: newSrc,
                        history: [...p.image.history, currentSrc]
                    }
                };
            })
        };
        return pushHistory(state, newSb);
    }),

    updateGutter: (panelId, gap, color, subPanelId) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;

                if (subPanelId && p.sub_panels) {
                    return {
                        ...p,
                        sub_panels: p.sub_panels.map(sp => {
                            if (sp.id !== subPanelId) return sp;
                            const updates: any = { gap_before: gap };
                            if (color) updates.gap_color = color;
                            return { ...sp, ...updates };
                        })
                    };
                }

                const updates: Partial<Panel> = { gap_before: gap };
                if (color) updates.gap_color = color;
                return { ...p, ...updates };
            })
        };
        return pushHistory(state, newSb);
    }),

    updateGutterColorAll: (color) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                const sub_panels = p.sub_panels?.map(sp => ({ ...sp, gap_color: color }));
                return { ...p, gap_color: color, sub_panels };
            })
        };
        return pushHistory(state, newSb);
    }),

    updatePanelSize: (panelId, heightRatio, cropOffsetY, subPanelId) => set((state) => {
        if (!state.storyboard) return state;
        const newSb = {
            ...state.storyboard,
            panels: state.storyboard.panels.map(p => {
                if (p.id !== panelId) return p;

                if (subPanelId && p.sub_panels) {
                    return {
                        ...p,
                        sub_panels: p.sub_panels.map(sp => {
                            if (sp.id !== subPanelId) return sp;
                            return { ...sp, display_height_ratio: heightRatio, crop_offset_y: cropOffsetY };
                        })
                    };
                }

                return { ...p, display_height_ratio: heightRatio, crop_offset_y: cropOffsetY };
            })
        };
        return pushHistory(state, newSb);
    }),

    undo: () => set((state) => {
        if (!state.canUndo()) return state;
        const newIndex = state.historyIndex - 1;
        const sb = JSON.parse(state.history[newIndex]);
        return { historyIndex: newIndex, storyboard: sb, selectedPanelId: null, selectedBubbleId: null, selectedSfxId: null };
    }),

    redo: () => set((state) => {
        if (!state.canRedo()) return state;
        const newIndex = state.historyIndex + 1;
        const sb = JSON.parse(state.history[newIndex]);
        return { historyIndex: newIndex, storyboard: sb, selectedPanelId: null, selectedBubbleId: null, selectedSfxId: null };
    }),

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    loadCustomSfxPresets: () => set(() => {
        if (typeof window === 'undefined') return {};
        const saved = localStorage.getItem('evaris_custom_sfx_presets');
        if (saved) {
            try {
                return { customSfxPresets: JSON.parse(saved) };
            } catch (e) {
                console.error("Failed to parse custom SFX presets", e);
            }
        }
        return { customSfxPresets: [] };
    }),

    addCustomSfxPreset: (preset) => set((state) => {
        const newPresets = [...state.customSfxPresets, preset];
        if (typeof window !== 'undefined') {
            localStorage.setItem('evaris_custom_sfx_presets', JSON.stringify(newPresets));
        }
        return { customSfxPresets: newPresets };
    }),

    deleteCustomSfxPreset: (presetId) => set((state) => {
        const newPresets = state.customSfxPresets.filter(p => p.id !== presetId);
        if (typeof window !== 'undefined') {
            localStorage.setItem('evaris_custom_sfx_presets', JSON.stringify(newPresets));
        }
        return { customSfxPresets: newPresets };
    }),

    getPanel: (id) => get().storyboard?.panels.find(p => p.id === id) || undefined,
    getAllPanels: () => get().storyboard?.panels || [],
}));
