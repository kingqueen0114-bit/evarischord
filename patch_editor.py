import re

with open('/Users/yuiyane/evaris-editor/components/ui/EditorPanel.tsx', 'r') as f:
    c = f.read()

c = c.replace(
"""    const handleAddSfx = () => {
        if (!panel) return;

        const id = `sfx-${Date.now()}`;
        useEditorStore.getState().addSfx(panel.id, {
            id,
            text: 'ドン！',""",
"""    const handleAddSfx = (imageUrl?: string) => {
        if (!panel) return;

        const id = `sfx-${Date.now()}`;
        useEditorStore.getState().addSfx(panel.id, {
            id,
            type: imageUrl ? 'image' : 'text',
            imageUrl: imageUrl,
            text: imageUrl ? '' : 'ドン！',"""
)

old_btn = """                                <button
                                    onClick={handleAddSfx}
                                    className="mt-4 w-full py-2 bg-[var(--accent)] text-white rounded-md font-bold"
                                >
                                    ＋ SFXを追加
                                </button>"""

new_btn = """                                <div className="flex flex-col gap-2 mt-4">
                                    <button
                                        onClick={() => handleAddSfx()}
                                        className="w-full py-2 bg-[var(--accent)] text-white rounded-md font-bold"
                                    >
                                        ＋ テキストSFXを追加
                                    </button>
                                    <label className="w-full py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--color-text-main)] rounded-md font-bold cursor-pointer hover:bg-[#2a2a33] text-center">
                                        ＋ 画像SFXを追加
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (re) => {
                                                        handleAddSfx(re.target?.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }} 
                                        />
                                    </label>
                                </div>"""
c = c.replace(old_btn, new_btn)

old_toggle = """                                            <button
                                                onClick={() => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { isVertical: false }, actualSfxSubPanelId || undefined)}
                                                className={`flex-1 py-1 text-sm rounded border ${!selectedSfx.isVertical ? 'bg-[var(--accent)]/20 border-[var(--accent)] font-bold' : 'bg-[var(--background)] border-[var(--border)]'}`}
                                            >
                                                横書き
                                            </button>
                                            <button
                                                onClick={() => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { isVertical: true }, actualSfxSubPanelId || undefined)}
                                                className={`flex-1 py-1 text-sm rounded border ${selectedSfx.isVertical ? 'bg-[var(--accent)]/20 border-[var(--accent)] font-bold' : 'bg-[var(--background)] border-[var(--border)]'}`}
                                            >
                                                縦書き
                                            </button>"""

new_toggle = """                                            <button
                                                onClick={() => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { isVertical: false, scale: {x: 1, y: 1} }, actualSfxSubPanelId || undefined)}
                                                className={`flex-1 py-1 text-sm rounded border ${!selectedSfx.isVertical ? 'bg-[var(--accent)]/20 border-[var(--accent)] font-bold' : 'bg-[var(--background)] border-[var(--border)]'}`}
                                            >
                                                横書き
                                            </button>
                                            <button
                                                onClick={() => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { isVertical: true, scale: {x: 1, y: 1} }, actualSfxSubPanelId || undefined)}
                                                className={`flex-1 py-1 text-sm rounded border ${selectedSfx.isVertical ? 'bg-[var(--accent)]/20 border-[var(--accent)] font-bold' : 'bg-[var(--background)] border-[var(--border)]'}`}
                                            >
                                                縦書き
                                            </button>"""
c = c.replace(old_toggle, new_toggle)

old_bottom = """                                    <div className="pt-4 border-t border-[var(--border)] flex justify-between mt-8">
                                        <button
                                            onClick={() => useEditorStore.getState().deleteSfx(panel.id, selectedSfxId, actualSfxSubPanelId || undefined)}
                                            className="text-xs text-[var(--danger)] hover:underline"
                                        >
                                            このSFXを削除
                                        </button>
                                        <button
                                            onClick={() => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { scale: { x: 1, y: 1 }, skewX: 0, rotation: 0 }, actualSfxSubPanelId || undefined)}
                                            className="text-xs text-[var(--color-text-dim)] hover:underline"
                                        >
                                            変形をリセット
                                        </button>
                                    </div>"""

new_bottom = """                                    <div className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-2 justify-between mt-8">
                                        <button
                                            onClick={() => useEditorStore.getState().deleteSfx(panel.id, selectedSfxId, actualSfxSubPanelId || undefined)}
                                            className="text-xs text-[var(--danger)] hover:underline"
                                        >
                                            このSFXを削除
                                        </button>
                                        <div className="flex gap-4 items-center">
                                            <button
                                                onClick={() => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { scale: { x: 1, y: 1 }, skewX: 0, rotation: 0 }, actualSfxSubPanelId || undefined)}
                                                className="text-xs text-[var(--color-text-dim)] hover:underline"
                                            >
                                                変形をリセット
                                            </button>
                                            <button
                                                onClick={() => handleAddSfx()}
                                                className="text-xs text-[var(--accent)] hover:underline font-bold"
                                            >
                                                ＋ 新規テキスト
                                            </button>
                                            <label className="text-xs text-[var(--accent)] hover:underline font-bold cursor-pointer">
                                                ＋ 新規画像
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    className="hidden" 
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (re) => {
                                                                handleAddSfx(re.target?.result as string);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }} 
                                                />
                                            </label>
                                        </div>
                                    </div>"""
c = c.replace(old_bottom, new_bottom)

with open('/Users/yuiyane/evaris-editor/components/ui/EditorPanel.tsx', 'w') as f:
    f.write(c)

print("EditorPanel replaced successfully!")
