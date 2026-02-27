'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editorStore';
import EditorPanel from './EditorPanel';

const TOOL_MODES = [
    { id: 'select', label: '選択', icon: '🖱️', key: '1' },
    { id: 'bubble', label: '吹き出し', icon: '💬', key: '2' },
    { id: 'sfx', label: 'SFX', icon: '🔊', key: '3' },
    { id: 'narration', label: 'ナレーション', icon: '📝', key: '4' },
] as const;

const SHORTCUTS = [
    { keys: '1-4', desc: 'ツール切替' },
    { keys: 'Del', desc: '要素を削除' },
    { keys: '⌘Z', desc: '元に戻す' },
    { keys: '⇧⌘Z', desc: 'やり直す' },
    { keys: '⌘S', desc: '保存' },
    { keys: '⌘D', desc: '複製' },
    { keys: '⌘E', desc: '書き出し' },
    { keys: 'Esc', desc: '選択解除' },
    { keys: '↑↓', desc: 'パネル移動' },
];

export default function SidePanel() {
    const toolMode = useEditorStore(state => state.toolMode);
    const setToolMode = useEditorStore(state => state.setToolMode);
    const storyboard = useEditorStore(state => state.storyboard);
    const selectedPanelId = useEditorStore(state => state.selectedPanelId);
    const [showShortcuts, setShowShortcuts] = React.useState(false);

    // Count elements
    const panelCount = storyboard?.panels.length || 0;
    let bubbleCount = 0;
    let sfxCount = 0;
    if (storyboard) {
        for (const p of storyboard.panels) {
            bubbleCount += p.bubbles.length;
            sfxCount += p.sfx.length;
            if (p.sub_panels) {
                for (const sp of p.sub_panels) {
                    bubbleCount += sp.bubbles.length;
                    sfxCount += sp.sfx.length;
                }
            }
        }
    }

    return (
        <div className="w-96 h-full border-l border-[var(--border)] bg-[var(--surface)] flex flex-col overflow-hidden">
            {/* Tool Selection */}
            <div className="px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
                <div className="grid grid-cols-4 gap-1">
                    {TOOL_MODES.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setToolMode(tool.id as any)}
                            className={`
                                py-2 text-xs rounded transition-colors flex flex-col items-center gap-0.5
                                ${toolMode === tool.id
                                    ? 'bg-[var(--accent)]/20 text-[var(--accent)] font-bold border border-[var(--accent)]/40'
                                    : 'bg-[var(--background)] text-[var(--color-text-dim)] hover:bg-[#2a2a33] border border-transparent'
                                }
                            `}
                            title={`${tool.label} (${tool.key})`}
                        >
                            <span className="text-base">{tool.icon}</span>
                            <span className="text-[10px]">{tool.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Panel Content */}
            <div className="flex-1 overflow-hidden">
                {selectedPanelId ? (
                    <EditorPanel />
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-dim)]">
                        パネルを選択してください
                    </div>
                )}
            </div>

            {/* Footer: Shortcuts + Status */}
            <div className="flex-shrink-0 border-t border-[var(--border)]">
                {/* Shortcuts toggle */}
                <button
                    onClick={() => setShowShortcuts(!showShortcuts)}
                    className="w-full px-3 py-1.5 text-[10px] text-[var(--color-text-dim)] hover:bg-[var(--background)] flex items-center justify-between transition-colors"
                >
                    <span>⌨️ ショートカット</span>
                    <span>{showShortcuts ? '▼' : '▲'}</span>
                </button>

                {showShortcuts && (
                    <div className="px-3 pb-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] border-t border-[var(--border)] pt-1.5 max-h-32 overflow-y-auto">
                        {SHORTCUTS.map(s => (
                            <div key={s.keys} className="flex justify-between">
                                <span className="text-[var(--color-text-dim)]">{s.desc}</span>
                                <kbd className="font-mono text-[var(--accent)] bg-[var(--background)] px-1 rounded">{s.keys}</kbd>
                            </div>
                        ))}
                    </div>
                )}

                {/* Status bar */}
                <div className="px-3 py-1.5 text-[10px] text-[var(--color-text-dim)] flex items-center justify-between bg-[var(--background)] border-t border-[var(--border)]">
                    <span>📄 {panelCount}パネル</span>
                    <span>💬 {bubbleCount}吹き出し</span>
                    <span>🔊 {sfxCount} SFX</span>
                </div>
            </div>
        </div>
    );
}
