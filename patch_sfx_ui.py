import re

with open('/Users/yuiyane/evaris-editor/components/ui/EditorPanel.tsx', 'r') as f:
    c = f.read()

old_text_block = """                                <div className="space-y-4 text-sm">
                                    <div>
                                        <label className="block text-xs text-[var(--color-text-dim)] mb-1">テキスト</label>
                                        <input
                                            type="text"
                                            value={selectedSfx.text}
                                            onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { text: e.target.value }, actualSfxSubPanelId || undefined)}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded p-2 focus:outline-none focus:border-[var(--accent)]"
                                        />
                                    </div>"""

new_text_block = """                                <div className="space-y-4 text-sm">
                                    {selectedSfx.type !== 'image' && (
                                        <>
                                            <div>
                                                <label className="block text-xs text-[var(--color-text-dim)] mb-1">テキスト</label>
                                                <input
                                                    type="text"
                                                    value={selectedSfx.text}
                                                    onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { text: e.target.value }, actualSfxSubPanelId || undefined)}
                                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded p-2 focus:outline-none focus:border-[var(--accent)]"
                                                />
                                            </div>"""
c = c.replace(old_text_block, new_text_block)

old_orientation_end = """                                            </button>
                                        </div>
                                    </div>"""

new_orientation_end = """                                            </button>
                                        </div>
                                    </div>
                                    </>
                                )}"""
c = c.replace(old_orientation_end, new_orientation_end, 1)

old_color_block = """                                    <div className="pt-4 border-t border-[var(--border)]">
                                        <label className="block text-xs font-bold text-[var(--color-text-main)] mb-3">色と装飾</label>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs text-[var(--color-text-dim)] mb-1">文字色</label>"""
new_color_block = """                                    <div className="pt-4 border-t border-[var(--border)]">
                                        <label className="block text-xs font-bold text-[var(--color-text-main)] mb-3">色と装飾</label>

                                        {selectedSfx.type !== 'image' && (
                                            <>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-xs text-[var(--color-text-dim)] mb-1">文字色</label>"""
c = c.replace(old_color_block, new_color_block)

old_outline_end = """                                            <label htmlFor="outline-toggle" className="text-xs">アウトラインを有効にする</label>
                                        </div>"""
new_outline_end = """                                            <label htmlFor="outline-toggle" className="text-xs">アウトラインを有効にする</label>
                                        </div>
                                        </>
                                        )}"""
c = c.replace(old_outline_end, new_outline_end)

with open('/Users/yuiyane/evaris-editor/components/ui/EditorPanel.tsx', 'w') as f:
    f.write(c)

print("EditorPanel UI patched successfully!")
