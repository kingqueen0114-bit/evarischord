'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editorStore';

export default function PanelNavigator() {
    const { storyboard, selectedPanelId, selectPanel } = useEditorStore();

    if (!storyboard) return null;

    return (
        <div className="w-full overflow-x-auto bg-[var(--surface)] border-b border-[var(--border)] sticky top-14 z-40 hidden-scrollbar">
            <div className="flex px-4 py-2 gap-2 min-w-max">
                {storyboard.panels.map((panel) => {
                    const isSelected = selectedPanelId === panel.id;
                    return (
                        <button
                            key={panel.id}
                            onClick={() => {
                                selectPanel(panel.id);
                                // Simple scroll into view
                                document.getElementById(`panel-${panel.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                ${isSelected
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'bg-[var(--background)] text-[var(--color-text-dim)] hover:text-white hover:bg-[#2a2a33] border border-[var(--border)]'}
              `}
                        >
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="font-bold">{panel.label}</span>
                                <span className="text-[10px] opacity-80">{panel.section}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
